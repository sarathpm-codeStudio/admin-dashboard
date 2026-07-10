/** Period selection for the GST report — Indian financial year (Apr–Mar). */

export type GstGranularity = 'month' | 'quarter' | 'year'

export type GstPeriodOption = {
    value: string
    label: string
    /** Inclusive start, exclusive end — ISO strings. */
    fromISO: string
    toISO: string
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Financial year that a given date falls in (FY starts 1 Apr). */
function fyStartYear(d: Date): number {
    return d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1
}

const iso = (y: number, m: number, day = 1) => new Date(y, m, day).toISOString()

/** Build the last `count` periods for the chosen granularity, newest first. */
export function buildGstPeriods(granularity: GstGranularity, now = new Date()): GstPeriodOption[] {
    const options: GstPeriodOption[] = []

    if (granularity === 'month') {
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            options.push({
                value: `${d.getFullYear()}-${d.getMonth()}`,
                label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
                fromISO: iso(d.getFullYear(), d.getMonth()),
                toISO: iso(d.getFullYear(), d.getMonth() + 1),
            })
        }
    } else if (granularity === 'quarter') {
        // FY quarters: Q1 Apr–Jun, Q2 Jul–Sep, Q3 Oct–Dec, Q4 Jan–Mar
        const seen = new Set<string>()
        for (let back = 0; back < 6; back++) {
            const anchor = new Date(now.getFullYear(), now.getMonth() - back * 3, 1)
            const qIndex = Math.floor(((anchor.getMonth() - 3 + 12) % 12) / 3) // 0..3 → Q1..Q4
            const startMonthCal = (3 + qIndex * 3) % 12 // Apr, Jul, Oct, Jan
            const fy = fyStartYear(anchor)
            const startYear = qIndex === 3 ? fy + 1 : fy // Q4 (Jan–Mar) is next calendar year
            const value = `${fy}-Q${qIndex + 1}`
            if (seen.has(value)) continue
            seen.add(value)
            options.push({
                value,
                label: `Q${qIndex + 1} FY${String(fy).slice(2)}-${String(fy + 1).slice(2)}`,
                fromISO: iso(startYear, startMonthCal),
                toISO: iso(startYear, startMonthCal + 3),
            })
        }
    } else {
        for (let i = 0; i < 4; i++) {
            const fy = fyStartYear(now) - i
            options.push({
                value: `FY${fy}`,
                label: `FY ${fy}-${String(fy + 1).slice(2)} (Apr–Mar)`,
                fromISO: iso(fy, 3),
                toISO: iso(fy + 1, 3),
            })
        }
    }

    return options
}
