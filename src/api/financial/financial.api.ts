

import { supabase } from "@/config/supabase"

/** Shape returned by `getFinancialSummary` — top KPI cards for Financial Management. */
export type FinancialSummary = {
    totalRevenue: {
        amount: number
        /** Commission already received via payout runs (PLATFORM_EARNING). */
        realized: number
        /** GROSS commission still pending on unpaid enrollments. */
        pending: number
        pendingDisplay: string
        /** Pending commission NET of the coin/offer subsidy on those same
         * unpaid sales — what admin will actually hold after they settle. */
        pendingNet: number
        pendingNetDisplay: string
        /** Admin-funded coin + offer subsidy across all SUCCESS sales (workflow §9).
         * Commission figures are GROSS — admin's real cash = amount − subsidy. */
        subsidy: number
        subsidyDisplay: string
        /** Net revenue = gross commission − coin/offer subsidy. */
        net: number
        netDisplay: string
        growth: number
        display: string
        growthDisplay: string
    }
    todaysRevenue: {
        amount: number
        growth: number
        display: string
        growthDisplay: string | null
    }
    pendingPayouts: {
        amount: number
        unpaidCount: number
        display: string
        /** Faculty share of the PREVIOUS month's unpaid enrollments — what a
         * "Process Payouts" run now would actually settle (workflow §5 scoping). */
        previousMonth: number
        previousMonthDisplay: string
        /** Label of that previous month, e.g. "June 2026". */
        previousMonthLabel: string
        /** Unpaid sales count in the previous month. */
        previousMonthCount: number
    }
}

export type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED'

/** One row of the Financial Management → Transactions table (an enrollment). */
export type FinancialTransactionRow = {
    id: string
    paymentId: string
    student: string
    faculty: string
    /** Faculty user id — used to resolve the commission rate for estimates. */
    facultyId: string | null
    course: string
    /** What the student actually paid (amount_paid, after coins/offers). */
    amount: number
    amountDisplay: string
    /** Original course price (enrollments.course_price) — null for bundles. */
    coursePrice: number | null
    coursePriceDisplay: string
    /** GST portion inside the paid amount. */
    gstAmount: number
    /** Coins redeemed on this purchase (0 = no coins used). */
    coinsUsed: number
    /** Taxable (ex-GST) value of the coin redemption (workflow §9). */
    coinRedeemAmount: number
    /** Taxable (ex-GST) value of the platform-offer discount. */
    offerDiscountAmount: number
    /** Coupon code used at checkout (faculty-created), or null. */
    couponCode: string | null
    /** Amount the coupon took off. Faculty-funded — reduces the payout base. */
    couponDiscountAmount: number
    isBundle: boolean
    status: PaymentStatus
    date: string
    createdAt: string | null
}

/** faculty_transactions.status values (workflow §1). */
export type PayoutStatus = 'SUCCESS' | 'PENDING' | 'FAILED'

/** Money split of one transaction for the details modal (workflow §9/§10). */
export type TransactionSettlement = {
    /** true = figures come from the recorded payout run; false = estimate at the current rate. */
    settled: boolean
    commissionPercent: number
    /** Payout base = (amount_paid − gst) + coin/offer subsidy. */
    base: number
    facultyShare: number
    /** Gross admin commission (base − facultyShare). */
    commission: number
    /** Admin-funded coin + offer subsidy on this sale. */
    adminSubsidy: number
    /** Admin's real cash on this sale = commission − adminSubsidy. */
    adminNet: number
    /** Payout run reference when settled. */
    payoutId: string | null
    /** Enrollment period the run settled, e.g. "June 2026". */
    period: string | null
    /** Coupon applied to this enrollment (coupon_redemptions.enrollment_id):
     * code + how much the student saved. Null when no redemption is recorded. */
    coupon: { code: string; saveAmount: number } | null
}

/** One row of the Financial Management → Payouts table (a PAYOUT run, workflow §5/§8). */
export type FinancialPayoutRow = {
    id: string
    /** PAYOUT row's transaction_id — every sale/fee row of the run points to it via payout_id. */
    payoutId: string
    /** Gateway/transfer reference — only PAYOUT rows carry this. */
    paymentId: string
    faculty: string
    /** COURSE_SALE + BUNDLE_SALE rows settled by this run. */
    salesCount: number
    commissionPercent: number | null
    amount: number
    amountDisplay: string
    status: PayoutStatus
    /** Enrollment period this payout settles, e.g. "June 2026". */
    period: string
    date: string
    transactedAt: string | null
}

/** faculty_transactions.type values (workflow §8). */
export type FacultyTransactionType =
    | 'COURSE_SALE'
    | 'BUNDLE_SALE'
    | 'PLATFORM_FEE'
    | 'PAYOUT'
    | 'PLATFORM_EARNING'
    | 'REFUND'

/** One faculty_transactions row inside a payout run (payout details modal). */
export type PayoutDetailRow = {
    id: string
    transactionId: string
    type: FacultyTransactionType
    /** Course title / bundle title the row settles, or '—' for summary rows. */
    item: string
    grossAmount: number
    gstAmount: number
    commissionPercent: number | null
    amount: number
    amountDisplay: string
    /** Coins the student redeemed on this sale (sale rows only, workflow §9). */
    coinsUsed: number
    /** Admin-funded subsidy inside this sale's gross (coin + offer, taxable). */
    coinRedeemAmount: number
    offerDiscountAmount: number
    /** Faculty-funded coupon on this sale (informational). */
    couponDiscountAmount: number
}

/** Full breakdown of one payout run (workflow §5/§8). */
export type PayoutDetail = {
    payoutId: string
    paymentId: string
    faculty: string
    /** Enrollment period this payout settles, e.g. "June 2026". */
    period: string
    date: string
    /** PAYOUT row amount — total transferred to the faculty. */
    payoutTotal: number
    payoutTotalDisplay: string
    /** PLATFORM_EARNING amount — platform commission for the run (GROSS). */
    platformEarning: number
    platformEarningDisplay: string
    /** Admin-funded coin + offer subsidy inside this run's sales (workflow §9). */
    adminSubsidy: number
    adminSubsidyDisplay: string
    /** Faculty-funded coupon discounts inside this run's sales (informational). */
    couponTotal: number
    couponTotalDisplay: string
    /** Admin's real cash for the run = platformEarning − adminSubsidy. */
    netEarning: number
    netEarningDisplay: string
    /** Total base (gross after GST) across the run — from the PAYOUT row. */
    grossTotal: number
    grossTotalDisplay: string
    /** Total GST across the run — from the PAYOUT row. */
    gstTotal: number
    gstTotalDisplay: string
    rows: PayoutDetailRow[]
}

/** Result of a "Process Payouts" run across all faculty. */
export type ProcessPayoutsResult = {
    /** Faculty successfully paid out in this run. */
    processedCount: number
    /** Total ₹ transferred across all faculty. */
    totalAmount: number
    results: {
        facultyId: string
        faculty: string
        payoutId: string
        paymentId: string
        salesCount: number
        amount: number
    }[]
    failures: { facultyId: string; faculty: string; error: string }[]
}

/** Paise precision (2dp) — payouts move online, never round money to rupees. */
const round2 = (n: number): number => Math.round(n * 100) / 100;

/** ₹ formatter — Cr / L for big values, en-IN grouping (keeps paise) otherwise. */
const formatRevenue = (amount: number): string => {
    const crore = 10000000;
    const lakh = 100000;
    if (amount >= crore) {
        return `₹${(amount / crore).toFixed(1)} Cr`;
    } else if (amount >= lakh) {
        return `₹${(amount / lakh).toFixed(1)} L`;
    }
    return `₹${round2(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

const formatGrowth = (growth: number): string =>
    growth >= 0 ? `↑ ${growth}%` : `↓ ${Math.abs(growth)}%`;

const growthPercent = (current: number, previous: number): number =>
    previous > 0
        ? parseFloat((((current - previous) / previous) * 100).toFixed(1))
        : current > 0 ? 100 : 0;

export const financialManagementFunctions = {

    /**
     * Financial Management KPI cards (see enrollment-payout-workflow.md):
     *  - Total Revenue    → admin's platform revenue: SUM(amount) of
     *    PLATFORM_EARNING rows (commission realized per payout run, §8)
     *    PLUS the admin's commission on still-unpaid enrollments.
     *    The faculty's pending share is NOT part of this.
     *  - Today's Revenue  → platform commission share of today's sales:
     *    (amount_paid - GST + coin/offer subsidy) × faculty's commission rate
     *    (profiles.commission_rate, fallback platform default), growth vs yesterday.
     *  - Pending Payouts  → unpaid enrollments (no COURSE_SALE / BUNDLE_SALE row
     *    in faculty_transactions yet), after GST and commission deduction.
     *    Commission resolves per faculty: profiles.commission_rate, falling back
     *    to platform_settings 'default_commission_percent'.
     */
    getFinancialSummary: async (): Promise<FinancialSummary> => {
        try {
            const [
                { data: enrollments, error: enrollmentsError },
                { data: bundleEnrollments, error: bundlesError },
                { data: saleTxns, error: saleTxnsError },
                { data: platformEarnings, error: earningsError },
                { data: defaultSetting, error: settingError },
            ] = await Promise.all([
                supabase
                    .from('enrollments')
                    .select('id, faculty_id, amount_paid, gst_amount, coin_redeem_amount, offer_discount_amount, is_bundle_enrollment, enrolled_at, payment_status'),
                supabase
                    .from('bundle_enrollments')
                    .select('id, faculty_id, amount_paid, coin_redeem_amount, offer_discount_amount, enrolled_at, created_at, payment_status'),
                supabase
                    .from('faculty_transactions')
                    .select('type, enrollment_id, bundle_enrollment_id')
                    .in('type', ['COURSE_SALE', 'BUNDLE_SALE']),
                supabase
                    .from('faculty_transactions')
                    .select('amount, transacted_at')
                    .eq('type', 'PLATFORM_EARNING'),
                supabase
                    .from('platform_settings')
                    .select('value')
                    .eq('key', 'default_commission_percent')
                    .maybeSingle(),
            ])

            if (enrollmentsError) throw new Error(enrollmentsError.message)
            if (bundlesError) throw new Error(bundlesError.message)
            if (saleTxnsError) throw new Error(saleTxnsError.message)
            if (earningsError) throw new Error(earningsError.message)
            if (settingError) throw new Error(settingError.message)

            // Only successfully paid enrollments count toward revenue/payouts
            const allEnrollments = (enrollments ?? []).filter(
                e => (e.payment_status ?? 'SUCCESS') === 'SUCCESS',
            )
            const allBundles = (bundleEnrollments ?? []).filter(
                b => (b.payment_status ?? 'SUCCESS') === 'SUCCESS',
            )
            const allEarnings = platformEarnings ?? []

            // ── Platform earnings (realized commission) ──────────────────
            // One PLATFORM_EARNING summary row is created per payout run,
            // holding the total commission the platform kept for that run.
            // Total Revenue = this + pending payouts (added further below).
            const platformEarningsTotal = allEarnings.reduce(
                (sum, t) => sum + (t.amount ?? 0), 0,
            )

            // ── Commission rates (workflow §7) ───────────────────────────
            // Per-faculty rate from profiles.commission_rate; null falls back
            // to platform_settings 'default_commission_percent'.
            const facultyIds = [...new Set(
                [...allEnrollments, ...allBundles]
                    .filter(e => (e.amount_paid ?? 0) > 0)
                    .map(e => e.faculty_id)
                    .filter(Boolean),
            )]

            let ratesByFaculty = new Map<string, number | null>()
            if (facultyIds.length > 0) {
                const { data: facultyProfiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, commission_rate')
                    .in('id', facultyIds)

                if (profilesError) throw new Error(profilesError.message)
                ratesByFaculty = new Map(
                    (facultyProfiles ?? []).map(p => [p.id, p.commission_rate]),
                )
            }

            const defaultCommission = parseFloat(defaultSetting?.value ?? '20') || 20
            const resolveRate = (facultyId: string | null): number => {
                const rate = facultyId ? ratesByFaculty.get(facultyId) : null
                return rate ?? defaultCommission
            }

            // Admin-funded discounts (coins + platform offers) are added back to
            // the base so faculty is paid as if the student paid full price; the
            // subsidy comes out of the platform's commission.
            const adminSubsidy = (e: {
                coin_redeem_amount?: number | null
                offer_discount_amount?: number | null
            }): number => (e.coin_redeem_amount ?? 0) + (e.offer_discount_amount ?? 0)

            // ── Today's Revenue (vs yesterday) ───────────────────────────
            // Admin's REAL money on the day's sales: commission share minus
            // the coin/offer subsidy admin funded on them (workflow §9):
            //   singles → (amount_paid - gst_amount + subsidy) × rate% − subsidy
            //   bundles → (amount_paid + subsidy) × rate% − subsidy
            const todayStart = new Date()
            todayStart.setHours(0, 0, 0, 0)
            const yesterdayStart = new Date(todayStart)
            yesterdayStart.setDate(yesterdayStart.getDate() - 1)

            const commissionInRange = (start: Date, end?: Date) => {
                const inRange = (iso: string | null | undefined) => {
                    if (!iso) return false
                    const d = new Date(iso)
                    return d >= start && (!end || d < end)
                }
                const fromSingles = allEnrollments
                    .filter(e => !e.is_bundle_enrollment && inRange(e.enrolled_at))
                    .reduce((sum, e) => {
                        const base = (e.amount_paid ?? 0) - (e.gst_amount ?? 0) + adminSubsidy(e)
                        return sum + base * (resolveRate(e.faculty_id) / 100) - adminSubsidy(e)
                    }, 0)
                const fromBundles = allBundles
                    .filter(b => inRange(b.enrolled_at ?? b.created_at))
                    .reduce((sum, b) =>
                        sum + ((b.amount_paid ?? 0) + adminSubsidy(b)) * (resolveRate(b.faculty_id) / 100)
                            - adminSubsidy(b), 0)
                return fromSingles + fromBundles
            }

            const todaysRevenue = round2(commissionInRange(todayStart))
            const yesterdaysRevenue = round2(commissionInRange(yesterdayStart, todayStart))
            const todaysGrowth = growthPercent(todaysRevenue, yesterdaysRevenue)

            // Total revenue growth — platform commission this month vs last month
            const now = new Date()
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

            const earningsInRange = (start: Date, end?: Date) =>
                allEarnings.reduce((sum, t) => {
                    if (!t.transacted_at) return sum
                    const d = new Date(t.transacted_at)
                    return d >= start && (!end || d < end)
                        ? sum + (t.amount ?? 0)
                        : sum
                }, 0)

            const revenueGrowth = growthPercent(
                earningsInRange(thisMonthStart),
                earningsInRange(lastMonthStart, thisMonthStart),
            )

            // ── Pending Payouts ──────────────────────────────────────────
            // "Unpaid" = enrollment/bundle with no matching sale row yet.
            const paidEnrollmentIds = new Set(
                (saleTxns ?? [])
                    .filter(t => t.type === 'COURSE_SALE' && t.enrollment_id)
                    .map(t => t.enrollment_id),
            )
            const paidBundleIds = new Set(
                (saleTxns ?? [])
                    .filter(t => t.type === 'BUNDLE_SALE' && t.bundle_enrollment_id)
                    .map(t => t.bundle_enrollment_id),
            )

            // Bundle-child enrollments are paid via their bundle, not per row.
            const unpaidEnrollments = allEnrollments.filter(
                e => !e.is_bundle_enrollment && !paidEnrollmentIds.has(e.id) && (e.amount_paid ?? 0) > 0,
            )
            const unpaidBundles = allBundles.filter(
                b => !paidBundleIds.has(b.id) && (b.amount_paid ?? 0) > 0,
            )

            // Previous calendar month window — what a payout run NOW would settle.
            const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1)
            const prevMonthLabel = prevMonthStart.toLocaleDateString('en-US', {
                month: 'long', year: 'numeric',
            })
            const inPrevMonth = (iso: string | null | undefined) => {
                if (!iso) return false
                const d = new Date(iso)
                return d >= prevMonthStart && d < prevMonthEnd
            }

            // Each unpaid sale splits into faculty share + admin commission:
            //   base            = amount_paid - GST + admin subsidy (coins/offers)
            //   faculty share   = base × (1 - rate%)  → Pending Payouts card
            //   admin commission = base × rate%       → pending part of Total Revenue
            // The subsidy is paid to faculty out of the commission, so the
            // commission shown here is gross (before the coin/offer cost).
            let pendingFaculty = 0
            let pendingCommission = 0
            let pendingSubsidy = 0
            let prevMonthFaculty = 0
            let prevMonthCount = 0

            for (const e of unpaidEnrollments) {
                const base = (e.amount_paid ?? 0) - (e.gst_amount ?? 0) + adminSubsidy(e)
                const rate = resolveRate(e.faculty_id) / 100
                pendingFaculty += base * (1 - rate)
                pendingCommission += base * rate
                pendingSubsidy += adminSubsidy(e)
                if (inPrevMonth(e.enrolled_at)) {
                    prevMonthFaculty += base * (1 - rate)
                    prevMonthCount += 1
                }
            }
            for (const b of unpaidBundles) {
                const base = (b.amount_paid ?? 0) + adminSubsidy(b)
                const rate = resolveRate(b.faculty_id) / 100
                pendingFaculty += base * (1 - rate)
                pendingCommission += base * rate
                pendingSubsidy += adminSubsidy(b)
                if (inPrevMonth(b.enrolled_at ?? b.created_at)) {
                    prevMonthFaculty += base * (1 - rate)
                    prevMonthCount += 1
                }
            }

            const pendingPayouts = round2(pendingFaculty)
            const previousMonthPending = round2(prevMonthFaculty)
            const unpaidCount = unpaidEnrollments.length + unpaidBundles.length

            // Total Revenue = admin's money only:
            // realized commission (PLATFORM_EARNING) + commission still pending
            // on unpaid enrollments. Faculty's pending share is NOT included.
            const totalRevenue = platformEarningsTotal + round2(pendingCommission)

            // Commission figures are GROSS — the admin funds coin/offer
            // discounts out of them (workflow §9). Net = gross − subsidy.
            const totalSubsidy =
                allEnrollments.filter(e => !e.is_bundle_enrollment).reduce((sum, e) => sum + adminSubsidy(e), 0) +
                allBundles.reduce((sum, b) => sum + adminSubsidy(b), 0)
            const netRevenue = totalRevenue - round2(totalSubsidy)

            return {
                totalRevenue: {
                    amount: totalRevenue,
                    realized: platformEarningsTotal,
                    pending: round2(pendingCommission),
                    pendingDisplay: formatRevenue(round2(pendingCommission)),
                    pendingNet: round2(pendingCommission - pendingSubsidy),
                    pendingNetDisplay: formatRevenue(round2(pendingCommission - pendingSubsidy)),
                    subsidy: round2(totalSubsidy),
                    subsidyDisplay: formatRevenue(round2(totalSubsidy)),
                    net: netRevenue,
                    netDisplay: formatRevenue(netRevenue),
                    growth: revenueGrowth,
                    display: formatRevenue(totalRevenue),
                    growthDisplay: formatGrowth(revenueGrowth),
                },
                todaysRevenue: {
                    amount: todaysRevenue,
                    growth: todaysGrowth,
                    display: formatRevenue(todaysRevenue),
                    growthDisplay: yesterdaysRevenue > 0 || todaysRevenue > 0
                        ? formatGrowth(todaysGrowth)
                        : null,
                },
                pendingPayouts: {
                    amount: pendingPayouts,
                    unpaidCount,
                    display: formatRevenue(pendingPayouts),
                    previousMonth: previousMonthPending,
                    previousMonthDisplay: formatRevenue(previousMonthPending),
                    previousMonthLabel: prevMonthLabel,
                    previousMonthCount: prevMonthCount,
                },
            }

        } catch (error: any) {
            throw new Error(error.message)
        }
    },

    /**
     * All purchases as transaction rows, latest created first:
     *  - single-course enrollments → course title in the Course column
     *  - bundle purchases (bundle_enrollments) → ONE row per bundle payment,
     *    bundle title in the Course column. The auto-created child enrollment
     *    rows (is_bundle_enrollment=true, amount 0) are not listed.
     * Student / faculty names come from profiles.
     */
    getFinancialTransactions: async (): Promise<FinancialTransactionRow[]> => {
        try {
            const [
                { data: enrollments, error: enrollmentsError },
                { data: bundleEnrollments, error: bundlesError },
            ] = await Promise.all([
                supabase
                    .from('enrollments')
                    .select('id, payment_id, student_id, faculty_id, course_id, amount_paid, course_price, gst_amount, coins_used_count, coin_redeem_amount, offer_discount_amount, coupon_id, coupon_discount_amount, payment_status, created_at')
                    .eq('is_bundle_enrollment', false)
                    .order('created_at', { ascending: false }),
                supabase
                    .from('bundle_enrollments')
                    .select('id, payment_id, student_id, faculty_id, bundle_id, amount_paid, coins_used_count, coin_redeem_amount, offer_discount_amount, coupon_id, coupon_discount_amount, payment_status, created_at')
                    .order('created_at', { ascending: false }),
            ])

            if (enrollmentsError) throw new Error(enrollmentsError.message)
            if (bundlesError) throw new Error(bundlesError.message)

            const singleRows = enrollments ?? []
            const bundleRows = bundleEnrollments ?? []
            if (singleRows.length === 0 && bundleRows.length === 0) return []

            const profileIds = [...new Set(
                [...singleRows, ...bundleRows]
                    .flatMap(e => [e.student_id, e.faculty_id])
                    .filter(Boolean),
            )]
            const courseIds = [...new Set(singleRows.map(e => e.course_id).filter(Boolean))]
            const bundleIds = [...new Set(bundleRows.map(b => b.bundle_id).filter(Boolean))]
            const couponIds = [...new Set(
                [...singleRows, ...bundleRows].map(e => e.coupon_id).filter(Boolean),
            )]

            const [
                { data: profiles, error: profilesError },
                { data: courses, error: coursesError },
                { data: bundles, error: bundleTitlesError },
                { data: coupons, error: couponsError },
                // Fallback source for coupon usage: checkout logs redemptions in
                // coupon_redemptions (linked via enrollment_id) even when the
                // enrollment's own coupon fields were not written.
                { data: redemptions, error: redemptionsError },
            ] = await Promise.all([
                profileIds.length > 0
                    ? supabase.from('profiles').select('id, first_name, last_name').in('id', profileIds)
                    : Promise.resolve({ data: [], error: null }),
                courseIds.length > 0
                    ? supabase.from('courses').select('id, title').in('id', courseIds)
                    : Promise.resolve({ data: [], error: null }),
                bundleIds.length > 0
                    ? supabase.from('course_bundle').select('id, title').in('id', bundleIds)
                    : Promise.resolve({ data: [], error: null }),
                couponIds.length > 0
                    ? supabase.from('coupons').select('id, code').in('id', couponIds)
                    : Promise.resolve({ data: [], error: null }),
                supabase
                    .from('coupon_redemptions')
                    .select('enrollment_id, save_amount, coupons(code)')
                    .not('enrollment_id', 'is', null),
            ])

            if (profilesError) throw new Error(profilesError.message)
            if (coursesError) throw new Error(coursesError.message)
            if (bundleTitlesError) throw new Error(bundleTitlesError.message)
            if (couponsError) throw new Error(couponsError.message)
            if (redemptionsError) throw new Error(redemptionsError.message)

            const nameById = new Map(
                (profiles ?? []).map(p => [
                    p.id,
                    [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unknown',
                ]),
            )
            const courseById = new Map((courses ?? []).map(c => [c.id, c.title ?? 'Untitled course']))
            const bundleById = new Map((bundles ?? []).map(b => [b.id, b.title ?? 'Untitled bundle']))
            const couponCodeById = new Map((coupons ?? []).map(c => [c.id, c.code ?? 'Coupon']))
            const redemptionByEnrollment = new Map(
                (redemptions ?? []).map((r: any) => [
                    r.enrollment_id,
                    { code: r.coupons?.code ?? 'Coupon', saveAmount: round2(Number(r.save_amount ?? 0)) },
                ]),
            )

            const formatDate = (iso: string | null): string =>
                iso
                    ? new Date(iso).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                    })
                    : '—'

            const toRow = (
                e: (typeof singleRows)[number] | (typeof bundleRows)[number],
                isBundle: boolean,
            ): FinancialTransactionRow => {
                const coursePrice = isBundle
                    ? null
                    : ((e as (typeof singleRows)[number]).course_price ?? null)
                return {
                    id: e.id,
                    paymentId: e.payment_id ?? '—',
                    student: nameById.get(e.student_id) ?? 'Unknown',
                    faculty: nameById.get(e.faculty_id) ?? 'Unknown',
                    facultyId: e.faculty_id ?? null,
                    course: isBundle
                        ? bundleById.get((e as (typeof bundleRows)[number]).bundle_id) ?? 'Unknown bundle'
                        : courseById.get((e as (typeof singleRows)[number]).course_id) ?? 'Unknown course',
                    amount: e.amount_paid ?? 0,
                    amountDisplay: `₹${(e.amount_paid ?? 0).toLocaleString('en-IN')}`,
                    coursePrice,
                    coursePriceDisplay: coursePrice != null && coursePrice > 0
                        ? `₹${coursePrice.toLocaleString('en-IN')}`
                        : '—',
                    gstAmount: isBundle ? 0 : ((e as (typeof singleRows)[number]).gst_amount ?? 0),
                    coinsUsed: e.coins_used_count ?? 0,
                    coinRedeemAmount: e.coin_redeem_amount ?? 0,
                    offerDiscountAmount: e.offer_discount_amount ?? 0,
                    couponCode: e.coupon_id
                        ? couponCodeById.get(e.coupon_id) ?? 'Coupon'
                        : redemptionByEnrollment.get(e.id)?.code ?? null,
                    couponDiscountAmount: (e.coupon_discount_amount ?? 0) > 0
                        ? e.coupon_discount_amount
                        : redemptionByEnrollment.get(e.id)?.saveAmount ?? 0,
                    isBundle,
                    status: (e.payment_status ?? 'SUCCESS') as PaymentStatus,
                    date: formatDate(e.created_at),
                    createdAt: e.created_at,
                }
            }

            return [
                ...singleRows.map(e => toRow(e, false)),
                ...bundleRows.map(b => toRow(b, true)),
            ].sort((a, b) => {
                const at = a.createdAt ? new Date(a.createdAt).getTime() : 0
                const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0
                return bt - at
            })

        } catch (error: any) {
            throw new Error(error.message)
        }
    },

    /**
     * Money split of one transaction (details modal, workflow §9/§10).
     *
     * Settled sale (COURSE_SALE/BUNDLE_SALE row exists): return the ACTUAL
     * recorded figures — faculty share and rate frozen at payout time.
     * Unpaid sale: ESTIMATE with the faculty's current rate
     * (profiles.commission_rate → platform default). The caller must label
     * estimates as such — the rate can change before the payout run.
     */
    getTransactionSettlement: async (t: {
        id: string
        isBundle: boolean
        facultyId: string | null
        amount: number
        gstAmount: number
        coinRedeemAmount: number
        offerDiscountAmount: number
    }): Promise<TransactionSettlement> => {
        try {
            const adminSubsidy = (t.coinRedeemAmount ?? 0) + (t.offerDiscountAmount ?? 0)

            // Settled? The sale row carries the frozen figures. Coupon usage
            // comes from coupon_redemptions.enrollment_id (course sales only).
            const [
                { data: saleRow, error: saleError },
                { data: redemption },
            ] = await Promise.all([
                supabase
                    .from('faculty_transactions')
                    .select('amount, gross_amount, commission_percent, payout_id, payout_time_period')
                    .eq('type', t.isBundle ? 'BUNDLE_SALE' : 'COURSE_SALE')
                    .eq(t.isBundle ? 'bundle_enrollment_id' : 'enrollment_id', t.id)
                    .maybeSingle(),
                t.isBundle
                    ? Promise.resolve({ data: null })
                    : supabase
                        .from('coupon_redemptions')
                        .select('save_amount, coupons(code)')
                        .eq('enrollment_id', t.id)
                        .maybeSingle(),
            ])

            if (saleError) throw new Error(saleError.message)

            const coupon = redemption
                ? {
                    code: (redemption as any).coupons?.code ?? 'Coupon',
                    saveAmount: Number((redemption as any).save_amount ?? 0),
                }
                : null

            if (saleRow) {
                const base = saleRow.gross_amount ?? 0
                const facultyShare = saleRow.amount ?? 0
                const commission = base - facultyShare
                return {
                    settled: true,
                    commissionPercent: saleRow.commission_percent ?? 0,
                    base,
                    facultyShare,
                    commission,
                    adminSubsidy,
                    adminNet: commission - adminSubsidy,
                    payoutId: saleRow.payout_id ?? null,
                    period: saleRow.payout_time_period ?? null,
                    coupon,
                }
            }

            // Unpaid — estimate at the CURRENT rate (workflow §7 resolution).
            const [{ data: profile }, { data: defaultSetting }] = await Promise.all([
                t.facultyId
                    ? supabase.from('profiles').select('commission_rate').eq('id', t.facultyId).maybeSingle()
                    : Promise.resolve({ data: null }),
                supabase.from('platform_settings').select('value').eq('key', 'default_commission_percent').maybeSingle(),
            ])
            const rate = profile?.commission_rate
                ?? (parseFloat(defaultSetting?.value ?? '20') || 20)

            const base = (t.amount ?? 0) - (t.gstAmount ?? 0) + adminSubsidy
            const commission = round2(base * rate / 100)
            return {
                settled: false,
                commissionPercent: rate,
                base,
                facultyShare: base - commission,
                commission,
                adminSubsidy,
                adminNet: commission - adminSubsidy,
                payoutId: null,
                period: null,
                coupon,
            }
        } catch (error: any) {
            throw new Error(error.message)
        }
    },

    /**
     * Payout runs, latest first (workflow §5/§8):
     * one PAYOUT row per "Process Payout" run per faculty.
     *  - amount             → total transferred to the faculty
     *  - transaction_id     → run id; sale/fee rows link to it via payout_id
     *  - payment_id         → gateway/transfer reference (PAYOUT rows only)
     *  - salesCount         → COURSE_SALE + BUNDLE_SALE rows settled by the run
     */
    getFinancialPayouts: async (): Promise<FinancialPayoutRow[]> => {
        try {
            const { data: payouts, error: payoutsError } = await supabase
                .from('faculty_transactions')
                .select('id, transaction_id, payment_id, faculty_id, amount, commission_percent, status, payout_time_period, transacted_at')
                .eq('type', 'PAYOUT')
                .order('transacted_at', { ascending: false })

            if (payoutsError) throw new Error(payoutsError.message)

            const payoutRows = payouts ?? []
            if (payoutRows.length === 0) return []

            const payoutIds = payoutRows.map(p => p.transaction_id).filter(Boolean)
            const facultyIds = [...new Set(payoutRows.map(p => p.faculty_id).filter(Boolean))]

            const [
                { data: saleRows, error: salesError },
                { data: profiles, error: profilesError },
            ] = await Promise.all([
                payoutIds.length > 0
                    ? supabase
                        .from('faculty_transactions')
                        .select('payout_id')
                        .in('type', ['COURSE_SALE', 'BUNDLE_SALE'])
                        .in('payout_id', payoutIds)
                    : Promise.resolve({ data: [], error: null }),
                facultyIds.length > 0
                    ? supabase.from('profiles').select('id, first_name, last_name').in('id', facultyIds)
                    : Promise.resolve({ data: [], error: null }),
            ])

            if (salesError) throw new Error(salesError.message)
            if (profilesError) throw new Error(profilesError.message)

            const salesCountByPayout = new Map<string, number>()
            for (const s of saleRows ?? []) {
                if (!s.payout_id) continue
                salesCountByPayout.set(s.payout_id, (salesCountByPayout.get(s.payout_id) ?? 0) + 1)
            }

            const nameById = new Map(
                (profiles ?? []).map(p => [
                    p.id,
                    [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unknown',
                ]),
            )

            const formatDate = (iso: string | null): string =>
                iso
                    ? new Date(iso).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                    })
                    : '—'

            return payoutRows.map(p => ({
                id: p.id,
                payoutId: p.transaction_id ?? '—',
                paymentId: p.payment_id ?? '—',
                faculty: nameById.get(p.faculty_id) ?? 'Unknown',
                salesCount: salesCountByPayout.get(p.transaction_id) ?? 0,
                commissionPercent: p.commission_percent,
                amount: p.amount ?? 0,
                amountDisplay: `₹${(p.amount ?? 0).toLocaleString('en-IN')}`,
                status: (p.status ?? 'PENDING') as PayoutStatus,
                period: p.payout_time_period ?? '—',
                date: formatDate(p.transacted_at),
                transactedAt: p.transacted_at,
            }))

        } catch (error: any) {
            throw new Error(error.message)
        }
    },

    /**
     * Full transaction breakdown of one payout run (workflow §5/§8):
     * every faculty_transactions row whose payout_id = the run id, PLUS the
     * PAYOUT anchor row itself (whose transaction_id equals that run id).
     * Course/bundle titles are resolved for the sale rows.
     */
    getPayoutDetail: async (payoutId: string): Promise<PayoutDetail> => {
        try {
            const [
                { data: anchor, error: anchorError },
                { data: linked, error: linkedError },
            ] = await Promise.all([
                supabase
                    .from('faculty_transactions')
                    .select('id, transaction_id, payment_id, faculty_id, type, amount, gross_amount, gst_amount, commission_percent, status, payout_time_period, transacted_at')
                    .eq('transaction_id', payoutId)
                    .eq('type', 'PAYOUT')
                    .maybeSingle(),
                supabase
                    .from('faculty_transactions')
                    .select('id, transaction_id, type, amount, gross_amount, gst_amount, commission_percent, enrollment_id, bundle_enrollment_id')
                    .eq('payout_id', payoutId)
                    .order('type', { ascending: true }),
            ])

            if (anchorError) throw new Error(anchorError.message)
            if (linkedError) throw new Error(linkedError.message)
            if (!anchor) throw new Error('Payout not found')

            const linkedRows = linked ?? []

            // Resolve course / bundle titles for the sale rows
            const enrollmentIds = [...new Set(linkedRows.map(r => r.enrollment_id).filter(Boolean))]
            const bundleEnrollmentIds = [...new Set(linkedRows.map(r => r.bundle_enrollment_id).filter(Boolean))]

            const [
                { data: enrollments, error: enrollmentsError },
                { data: bundleEnrollments, error: bundlesError },
                { data: faculty, error: facultyError },
            ] = await Promise.all([
                enrollmentIds.length > 0
                    ? supabase.from('enrollments').select('id, course_id, coins_used_count, coin_redeem_amount, offer_discount_amount, coupon_discount_amount').in('id', enrollmentIds)
                    : Promise.resolve({ data: [], error: null }),
                bundleEnrollmentIds.length > 0
                    ? supabase.from('bundle_enrollments').select('id, bundle_id, coins_used_count, coin_redeem_amount, offer_discount_amount, coupon_discount_amount').in('id', bundleEnrollmentIds)
                    : Promise.resolve({ data: [], error: null }),
                supabase.from('profiles').select('id, first_name, last_name').eq('id', anchor.faculty_id).maybeSingle(),
            ])

            if (enrollmentsError) throw new Error(enrollmentsError.message)
            if (bundlesError) throw new Error(bundlesError.message)
            if (facultyError) throw new Error(facultyError.message)

            const courseIdByEnrollment = new Map((enrollments ?? []).map(e => [e.id, e.course_id]))
            const bundleIdByEnrollment = new Map((bundleEnrollments ?? []).map(b => [b.id, b.bundle_id]))

            // Subsidy/coupon data per settled enrollment (workflow §9) — shown
            // on the sale rows so the admin sees what the student did.
            type SubsidyInfo = {
                coinsUsed: number
                coinRedeemAmount: number
                offerDiscountAmount: number
                couponDiscountAmount: number
            }
            const subsidyOf = (e: {
                coins_used_count?: number | null
                coin_redeem_amount?: number | null
                offer_discount_amount?: number | null
                coupon_discount_amount?: number | null
            }): SubsidyInfo => ({
                coinsUsed: e.coins_used_count ?? 0,
                coinRedeemAmount: e.coin_redeem_amount ?? 0,
                offerDiscountAmount: e.offer_discount_amount ?? 0,
                couponDiscountAmount: e.coupon_discount_amount ?? 0,
            })
            const subsidyByEnrollment = new Map((enrollments ?? []).map(e => [e.id, subsidyOf(e)]))
            const subsidyByBundle = new Map((bundleEnrollments ?? []).map(b => [b.id, subsidyOf(b)]))
            const NO_SUBSIDY: SubsidyInfo = {
                coinsUsed: 0, coinRedeemAmount: 0, offerDiscountAmount: 0, couponDiscountAmount: 0,
            }
            const courseIds = [...new Set([...courseIdByEnrollment.values()].filter(Boolean))]
            const bundleIds = [...new Set([...bundleIdByEnrollment.values()].filter(Boolean))]

            const [
                { data: courses, error: coursesError },
                { data: bundles, error: bundleTitlesError },
            ] = await Promise.all([
                courseIds.length > 0
                    ? supabase.from('courses').select('id, title').in('id', courseIds)
                    : Promise.resolve({ data: [], error: null }),
                bundleIds.length > 0
                    ? supabase.from('course_bundle').select('id, title').in('id', bundleIds)
                    : Promise.resolve({ data: [], error: null }),
            ])

            if (coursesError) throw new Error(coursesError.message)
            if (bundleTitlesError) throw new Error(bundleTitlesError.message)

            const courseTitleById = new Map((courses ?? []).map(c => [c.id, c.title ?? 'Untitled course']))
            const bundleTitleById = new Map((bundles ?? []).map(b => [b.id, b.title ?? 'Untitled bundle']))

            const itemFor = (row: (typeof linkedRows)[number]): string => {
                if (row.enrollment_id) {
                    const courseId = courseIdByEnrollment.get(row.enrollment_id)
                    return courseId ? courseTitleById.get(courseId) ?? 'Course' : 'Course'
                }
                if (row.bundle_enrollment_id) {
                    const bundleId = bundleIdByEnrollment.get(row.bundle_enrollment_id)
                    return bundleId ? bundleTitleById.get(bundleId) ?? 'Bundle' : 'Bundle'
                }
                return '—'
            }

            // Order: sales/fees first (grouped), then the summary rows
            const typeOrder: Record<string, number> = {
                COURSE_SALE: 0, BUNDLE_SALE: 1, PLATFORM_FEE: 2, PLATFORM_EARNING: 3,
            }
            const detailRows: PayoutDetailRow[] = linkedRows
                .map(r => {
                    // Attach subsidy data to the SALE rows only, so run totals
                    // don't double-count via the PLATFORM_FEE twins.
                    const isSale = r.type === 'COURSE_SALE' || r.type === 'BUNDLE_SALE'
                    const subsidy = !isSale
                        ? NO_SUBSIDY
                        : r.enrollment_id
                            ? subsidyByEnrollment.get(r.enrollment_id) ?? NO_SUBSIDY
                            : r.bundle_enrollment_id
                                ? subsidyByBundle.get(r.bundle_enrollment_id) ?? NO_SUBSIDY
                                : NO_SUBSIDY
                    return {
                        id: r.id,
                        transactionId: r.transaction_id ?? '—',
                        type: r.type as FacultyTransactionType,
                        item: itemFor(r),
                        grossAmount: r.gross_amount ?? 0,
                        gstAmount: r.gst_amount ?? 0,
                        commissionPercent: r.commission_percent,
                        amount: r.amount ?? 0,
                        amountDisplay: `₹${(r.amount ?? 0).toLocaleString('en-IN')}`,
                        ...subsidy,
                    }
                })
                .sort((a, b) =>
                    (typeOrder[a.type] ?? 9) - (typeOrder[b.type] ?? 9) ||
                    a.transactionId.localeCompare(b.transactionId),
                )

            const platformEarning = detailRows
                .filter(r => r.type === 'PLATFORM_EARNING')
                .reduce((sum, r) => sum + r.amount, 0)

            // Run totals (workflow §9): subsidy is admin's cost inside the
            // gross commission; coupons are the faculty's own cost.
            const adminSubsidy = detailRows.reduce(
                (sum, r) => sum + r.coinRedeemAmount + r.offerDiscountAmount, 0,
            )
            const couponTotal = detailRows.reduce(
                (sum, r) => sum + r.couponDiscountAmount, 0,
            )
            const netEarning = platformEarning - adminSubsidy

            const facultyName =
                [faculty?.first_name, faculty?.last_name].filter(Boolean).join(' ') || 'Unknown'

            const formatDate = (iso: string | null): string =>
                iso
                    ? new Date(iso).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                    })
                    : '—'

            return {
                payoutId,
                paymentId: anchor.payment_id ?? '—',
                faculty: facultyName,
                period: anchor.payout_time_period ?? '—',
                date: formatDate(anchor.transacted_at),
                payoutTotal: anchor.amount ?? 0,
                payoutTotalDisplay: `₹${(anchor.amount ?? 0).toLocaleString('en-IN')}`,
                platformEarning,
                platformEarningDisplay: `₹${platformEarning.toLocaleString('en-IN')}`,
                adminSubsidy,
                adminSubsidyDisplay: `₹${adminSubsidy.toLocaleString('en-IN')}`,
                couponTotal,
                couponTotalDisplay: `₹${couponTotal.toLocaleString('en-IN')}`,
                netEarning,
                netEarningDisplay: `₹${netEarning.toLocaleString('en-IN')}`,
                grossTotal: anchor.gross_amount ?? 0,
                grossTotalDisplay: `₹${(anchor.gross_amount ?? 0).toLocaleString('en-IN')}`,
                gstTotal: anchor.gst_amount ?? 0,
                gstTotalDisplay: `₹${(anchor.gst_amount ?? 0).toLocaleString('en-IN')}`,
                rows: detailRows,
            }

        } catch (error: any) {
            throw new Error(error.message)
        }
    },

    /**
     * Process payouts for EVERY faculty with unpaid sales (workflow §5/§10).
     *
     * Delegates to the atomic `process_all_payouts` Postgres function so an
     * entire faculty's run (PAYOUT + sale/fee rows + PLATFORM_EARNING summary +
     * notification) commits or rolls back together — the md warns that a crash
     * between the detail rows and the summary row must never leave orphans.
     *
     * Per faculty the function: resolves commission % (profiles.commission_rate
     * → platform default, §7); creates the PAYOUT row (trigger assigns its
     * transaction_id = the run's payout_id); adds COURSE_SALE/BUNDLE_SALE +
     * PLATFORM_FEE per sale (base = amount_paid − GST + admin-funded discounts
     * [coin_redeem_amount + offer_discount_amount], bundles = full amount + the
     * same discounts, commission = round(base × rate%)); fills the PAYOUT total; writes one
     * PLATFORM_EARNING row (Σ PLATFORM_FEE); and notifies the faculty.
     *
     * No payment gateway yet — payment_id carries a DEMO reference on the PAYOUT
     * and PLATFORM_EARNING rows; swap for the real transfer id once integrated.
     */
    processAllPayouts: async (): Promise<ProcessPayoutsResult> => {
        try {
            const { data, error } = await supabase.rpc('process_all_payouts')
            if (error) throw new Error(error.message)

            const payload = (data ?? {}) as Partial<ProcessPayoutsResult>
            return {
                processedCount: payload.processedCount ?? 0,
                totalAmount: payload.totalAmount ?? 0,
                results: payload.results ?? [],
                failures: payload.failures ?? [],
            }
        } catch (error: any) {
            throw new Error(error.message)
        }
    },

}
