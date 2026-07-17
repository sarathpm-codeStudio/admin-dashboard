import { supabase } from "@/config/supabase"

/** One line of the GST tax register (a monthly PAYOUT run). */
export type GstRegisterRow = {
    id: string
    /** PAYOUT run id. */
    payoutId: string
    paymentId: string
    faculty: string
    /** Enrollment period the payout settled, e.g. "June 2026". */
    period: string
    /** Total value before GST for the run (gross_amount). */
    taxableValue: number
    taxableDisplay: string
    /** GST rate % derived from the run. */
    ratePercent: number
    gstAmount: number
    gstDisplay: string
    totalAmount: number
    totalDisplay: string
    date: string
    createdAt: string | null
}

/** GST collected grouped by rate — how a return summarises tax. */
export type GstRateBucket = {
    ratePercent: number
    taxableValue: number
    taxableDisplay: string
    gstAmount: number
    gstDisplay: string
    count: number
}

export type GstReport = {
    /** Sum of taxable values (pre-GST). */
    taxableValue: number
    taxableDisplay: string
    /** Total GST collected — the output tax liability for the period. */
    gstCollected: number
    gstDisplay: string
    /** Gross collected (taxable + GST). */
    totalCollected: number
    totalDisplay: string
    invoiceCount: number
    /** Blended effective rate across the period. */
    effectiveRate: number
    effectiveRateDisplay: string
    rateBuckets: GstRateBucket[]
    rows: GstRegisterRow[]
}

const inr = (v: number) => `₹${Math.round(v).toLocaleString('en-IN')}`

const rateOf = (base: number, gst: number): number => {
    if (base <= 0) return 0
    // Round to 1 decimal so 17.99% reads as 18%
    return Math.round((gst / base) * 1000) / 10
}

export const gstFunctions = {
    /**
     * GST report for a date window [fromISO, toISO).
     * The tax register lists the MONTHLY PAYOUT runs — each PAYOUT row carries
     * the run's payout base (gross_amount) and GST (gst_amount) captured at
     * payout time. Rows are bucketed by the payout's enrollment period
     * (payout_time_period). Permanent — survive enrollment edits/deletes.
     *
     * IMPORTANT: gross_amount includes the admin-funded coin/offer subsidy
     * (added back for payout math, workflow §9) — but GST was charged on the
     * DISCOUNTED money the students actually paid. For tax purposes the
     * subsidy is subtracted again, so taxable value and rate match invoices.
     */
    getGstReport: async (fromISO: string, toISO: string): Promise<GstReport> => {
        try {
            const { data: payoutRows, error } = await supabase
                .from('faculty_transactions')
                .select('id, transaction_id, payment_id, faculty_id, gross_amount, gst_amount, payout_time_period, transacted_at')
                .eq('type', 'PAYOUT')

            if (error) throw new Error(error.message)

            const from = new Date(fromISO)
            const to = new Date(toISO)

            // The month a payout belongs to = payout_time_period ("June 2026"),
            // falling back to when it was processed.
            const periodDateOf = (r: { payout_time_period: string | null; transacted_at: string | null }): Date | null => {
                const parsed = r.payout_time_period ? new Date(`1 ${r.payout_time_period}`) : null
                if (parsed && !Number.isNaN(parsed.getTime())) return parsed
                if (r.transacted_at) return new Date(r.transacted_at)
                return null
            }

            const rowsRaw = (payoutRows ?? []).filter(r => {
                const d = periodDateOf(r)
                return d !== null && d >= from && d < to
            })

            const facultyIds = [...new Set(rowsRaw.map(r => r.faculty_id).filter(Boolean))]
            const payoutIds = rowsRaw.map(r => r.transaction_id).filter(Boolean)

            const [
                { data: profiles, error: profErr },
                { data: saleRows, error: salesErr },
            ] = await Promise.all([
                facultyIds.length > 0
                    ? supabase.from('profiles').select('id, first_name, last_name').in('id', facultyIds)
                    : Promise.resolve({ data: [] as any[], error: null }),
                payoutIds.length > 0
                    ? supabase
                        .from('faculty_transactions')
                        .select('payout_id, enrollment_id, bundle_enrollment_id')
                        .in('type', ['COURSE_SALE', 'BUNDLE_SALE'])
                        .in('payout_id', payoutIds)
                    : Promise.resolve({ data: [] as any[], error: null }),
            ])
            if (profErr) throw new Error(profErr.message)
            if (salesErr) throw new Error(salesErr.message)

            // Admin-funded subsidy per payout run — subtracted from gross to get
            // the TRUE taxable value (GST was charged on the discounted money).
            const enrIds = [...new Set((saleRows ?? []).map(s => s.enrollment_id).filter(Boolean))]
            const bunIds = [...new Set((saleRows ?? []).map(s => s.bundle_enrollment_id).filter(Boolean))]
            const [{ data: enrs }, { data: buns }] = await Promise.all([
                enrIds.length > 0
                    ? supabase.from('enrollments').select('id, coin_redeem_amount, offer_discount_amount').in('id', enrIds)
                    : Promise.resolve({ data: [] as any[] }),
                bunIds.length > 0
                    ? supabase.from('bundle_enrollments').select('id, coin_redeem_amount, offer_discount_amount').in('id', bunIds)
                    : Promise.resolve({ data: [] as any[] }),
            ])
            const subsidyOfSale = new Map<string, number>()
            for (const e of enrs ?? []) subsidyOfSale.set(`e:${e.id}`, (e.coin_redeem_amount ?? 0) + (e.offer_discount_amount ?? 0))
            for (const b of buns ?? []) subsidyOfSale.set(`b:${b.id}`, (b.coin_redeem_amount ?? 0) + (b.offer_discount_amount ?? 0))

            const subsidyByPayout = new Map<string, number>()
            for (const s of saleRows ?? []) {
                if (!s.payout_id) continue
                const key = s.enrollment_id ? `e:${s.enrollment_id}` : s.bundle_enrollment_id ? `b:${s.bundle_enrollment_id}` : null
                if (!key) continue
                subsidyByPayout.set(s.payout_id, (subsidyByPayout.get(s.payout_id) ?? 0) + (subsidyOfSale.get(key) ?? 0))
            }

            const nameById = new Map(
                (profiles ?? []).map(p => [
                    p.id,
                    [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unknown',
                ]),
            )

            const formatPeriod = (d: Date | null): string =>
                d ? d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'

            const rows: GstRegisterRow[] = rowsRaw
                .map(r => {
                    // True taxable value = payout base minus the admin subsidy
                    // baked into it — matches what invoices actually charged.
                    const taxable = (r.gross_amount ?? 0) - (subsidyByPayout.get(r.transaction_id) ?? 0)
                    const gst = r.gst_amount ?? 0
                    const total = taxable + gst
                    const periodLabel = formatPeriod(periodDateOf(r))
                    return {
                        id: r.id,
                        payoutId: r.transaction_id ?? '—',
                        paymentId: r.payment_id ?? '—',
                        faculty: nameById.get(r.faculty_id) ?? 'Unknown',
                        period: periodLabel,
                        taxableValue: taxable,
                        taxableDisplay: inr(taxable),
                        ratePercent: rateOf(taxable, gst),
                        gstAmount: gst,
                        gstDisplay: inr(gst),
                        totalAmount: total,
                        totalDisplay: inr(total),
                        date: periodLabel,
                        createdAt: r.transacted_at,
                    }
                })
                .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))

            const taxableValue = rows.reduce((s, r) => s + r.taxableValue, 0)
            const gstCollected = rows.reduce((s, r) => s + r.gstAmount, 0)
            const totalCollected = taxableValue + gstCollected
            const effectiveRate = rateOf(taxableValue, gstCollected)

            // Group by rate
            const bucketMap = new Map<number, GstRateBucket>()
            for (const r of rows) {
                const b = bucketMap.get(r.ratePercent) ?? {
                    ratePercent: r.ratePercent,
                    taxableValue: 0, taxableDisplay: '', gstAmount: 0, gstDisplay: '', count: 0,
                }
                b.taxableValue += r.taxableValue
                b.gstAmount += r.gstAmount
                b.count += 1
                bucketMap.set(r.ratePercent, b)
            }
            const rateBuckets = [...bucketMap.values()]
                .map(b => ({ ...b, taxableDisplay: inr(b.taxableValue), gstDisplay: inr(b.gstAmount) }))
                .sort((a, b) => b.ratePercent - a.ratePercent)

            return {
                taxableValue,
                taxableDisplay: inr(taxableValue),
                gstCollected,
                gstDisplay: inr(gstCollected),
                totalCollected,
                totalDisplay: inr(totalCollected),
                invoiceCount: rows.length,
                effectiveRate,
                effectiveRateDisplay: `${effectiveRate}%`,
                rateBuckets,
                rows,
            }
        } catch (error: any) {
            throw new Error(error.message)
        }
    },
}
