

import { supabase } from "@/config/supabase"
import type { EnrollmentTrendPoint, RevenueTrendPoint, TrendPeriod } from "@/features/dashboard/data/chartTrends"

/** Where a pending action's "Take Action" button should navigate. */
export type PendingActionTarget =
    | { kind: 'faculty'; facultyId: string }
    | { kind: 'course'; courseId: string }

export type TopPerformers = {
    faculty: { name: string; avatarUrl: string | null; category: string; metric: string } | null
    course: { name: string; category: string; metric: string } | null
}

export type DashboardPendingAction = {
    /** Stable key, prefixed by type so faculty/course ids never collide. */
    id: string
    type: 'FACULTY' | 'COURSE'
    title: string
    subtitle: string
    /** Raw timestamp used for sorting (most recent first). */
    createdAt: string | null
    target: PendingActionTarget
}

/** "2h ago", "5d ago", "just now" — coarse relative time for action subtitles. */
const timeAgo = (iso: string | null | undefined): string => {
    if (!iso) return ''
    const then = new Date(iso).getTime()
    if (Number.isNaN(then)) return ''
    const diffMs = Date.now() - then
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
}

const fullName = (first?: string | null, last?: string | null): string =>
    [first, last].filter(Boolean).join(' ') || 'Unknown'

export const dashboardManagementFunctions = {

    /**
     * Pending actions for the dashboard:
     *  - Faculty whose account verification is PENDING or RESUBMITTED
     *  - Courses that have been RESUBMITTED for review
     * Newest first. Each item carries a `target` describing where the
     * "Take Action" button should navigate.
     */
    getPendingActions: async (): Promise<DashboardPendingAction[]> => {
        try {
            const [
                { data: faculty, error: facultyError },
                { data: courses, error: coursesError },
            ] = await Promise.all([
                supabase
                    .from('profiles')
                    .select('id, first_name, last_name, account_verified, created_at')
                    .eq('role', 'FACULTY')
                    .in('account_verified', ['PENDING', 'RESUBMITTED'])
                    .order('created_at', { ascending: false }),
                supabase
                    .from('courses')
                    .select('id, title, status, created_at, updated_at')
                    .eq('is_deleted', false)
                    .eq('is_draft', false)
                    .in('status', ['PENDING', 'RESUBMIT'])
                    .order('updated_at', { ascending: false }),
            ])

            if (facultyError) throw new Error(facultyError.message)
            if (coursesError) throw new Error(coursesError.message)

            const facultyActions: DashboardPendingAction[] = (faculty ?? []).map((f) => {
                const resubmitted = f.account_verified === 'RESUBMITTED'
                const when = timeAgo(f.created_at)
                const label = resubmitted ? 'Faculty Resubmitted' : 'Faculty Waiting for Approval'
                return {
                    id: `faculty-${f.id}`,
                    type: 'FACULTY',
                    title: fullName(f.first_name, f.last_name),
                    subtitle: `${label}${when ? ` • ${when}` : ''}`,
                    createdAt: f.created_at,
                    target: { kind: 'faculty', facultyId: f.id },
                }
            })

            const courseActions: DashboardPendingAction[] = (courses ?? []).map((c) => {
                const resubmitted = c.status === 'RESUBMIT'
                const when = timeAgo(c.updated_at ?? c.created_at)
                const label = resubmitted ? 'Course Resubmitted' : 'Course Waiting for Approval'
                return {
                    id: `course-${c.id}`,
                    type: 'COURSE',
                    title: c.title ?? 'Untitled course',
                    subtitle: `${label}${when ? ` • ${when}` : ''}`,
                    createdAt: c.updated_at ?? c.created_at,
                    target: { kind: 'course', courseId: c.id },
                }
            })

            return [...facultyActions, ...courseActions].sort((a, b) => {
                const at = a.createdAt ? new Date(a.createdAt).getTime() : 0
                const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0
                return bt - at
            })
        } catch (error: any) {
            throw new Error(error.message)
        }
    },

    getDashboardAnalytics: async () => {
        try {

            const now = new Date();
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

            // 1. Total Students
            const { count: totalStudents, error: studentsError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'STUDENT');

            if (studentsError) throw new Error(studentsError.message);

            // New students this month (for growth %)
            const { count: studentsThisMonth, error: studentsThisMonthError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'STUDENT')
                .gte('created_at', thisMonthStart);

            if (studentsThisMonthError) throw new Error(studentsThisMonthError.message);

            const { count: studentsLastMonth, error: studentsLastMonthError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'STUDENT')
                .gte('created_at', lastMonthStart)
                .lt('created_at', thisMonthStart);

            if (studentsLastMonthError) throw new Error(studentsLastMonthError.message);

            const studentsGrowth = (studentsLastMonth ?? 0) > 0
                ? parseFloat((((((studentsThisMonth ?? 0) - (studentsLastMonth ?? 0)) / (studentsLastMonth ?? 1)) * 100)).toFixed(1))
                : (studentsThisMonth ?? 0) > 0 ? 100 : 0;

            // 2. Total Faculty
            const { count: totalFaculty, error: facultyError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'FACULTY');

            if (facultyError) throw new Error(facultyError.message);

            const { count: facultyThisMonth, error: facultyThisMonthError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'FACULTY')
                .gte('created_at', thisMonthStart);

            if (facultyThisMonthError) throw new Error(facultyThisMonthError.message);

            // 3. Total Courses
            const { count: totalCourses, error: coursesError } = await supabase
                .from('courses')
                .select('*', { count: 'exact', head: true })
                .eq('is_draft', false)
                .eq('is_deleted', false);

            if (coursesError) throw new Error(coursesError.message);

            const { count: coursesThisMonth, error: coursesThisMonthError } = await supabase
                .from('courses')
                .select('*', { count: 'exact', head: true })
                .eq('is_draft', false)
                .eq('is_deleted', false)
                .gte('created_at', thisMonthStart);

            if (coursesThisMonthError) throw new Error(coursesThisMonthError.message);

            // 4. Total Revenue (admin commission = PLATFORM_FEE rows in faculty_transactions)
            // The admin's revenue is the platform commission it keeps, NOT the gross
            // amount students paid. Each PLATFORM_FEE row's `amount` holds the admin
            // commission for a single enrollment / bundle enrollment — GROSS,
            // i.e. including the coin/offer subsidy the admin funded (workflow §9).
            // The card shows realized NET: commission − subsidy per settled sale.
            const { data: platformFeeData, error: platformFeeError } = await supabase
                .from('faculty_transactions')
                .select('amount, transacted_at, enrollment_id, bundle_enrollment_id')
                .eq('type', 'PLATFORM_FEE');

            if (platformFeeError) throw new Error(platformFeeError.message);

            const feeEnrIds = [...new Set((platformFeeData ?? []).map(t => t.enrollment_id).filter(Boolean))]
            const feeBunIds = [...new Set((platformFeeData ?? []).map(t => t.bundle_enrollment_id).filter(Boolean))]
            const [{ data: feeEnrs }, { data: feeBuns }] = await Promise.all([
                feeEnrIds.length > 0
                    ? supabase.from('enrollments').select('id, coin_redeem_amount, offer_discount_amount').in('id', feeEnrIds)
                    : Promise.resolve({ data: [] as any[] }),
                feeBunIds.length > 0
                    ? supabase.from('bundle_enrollments').select('id, coin_redeem_amount, offer_discount_amount').in('id', feeBunIds)
                    : Promise.resolve({ data: [] as any[] }),
            ])
            const settledSubsidy = new Map<string, number>()
            for (const e of feeEnrs ?? []) settledSubsidy.set(`e:${e.id}`, (e.coin_redeem_amount ?? 0) + (e.offer_discount_amount ?? 0))
            for (const b of feeBuns ?? []) settledSubsidy.set(`b:${b.id}`, (b.coin_redeem_amount ?? 0) + (b.offer_discount_amount ?? 0))
            const netFeeOf = (t: { amount?: number; enrollment_id?: string | null; bundle_enrollment_id?: string | null }) => {
                const key = t.enrollment_id ? `e:${t.enrollment_id}` : t.bundle_enrollment_id ? `b:${t.bundle_enrollment_id}` : null
                return (t.amount ?? 0) - (key ? settledSubsidy.get(key) ?? 0 : 0)
            }

            const totalRevenue = platformFeeData?.reduce(
                (sum, t) => sum + netFeeOf(t), 0
            ) ?? 0;

            // Revenue growth (this month vs last month) — same net-of-subsidy basis
            const revenueInRange = (data: { amount: number; transacted_at: string; enrollment_id?: string | null; bundle_enrollment_id?: string | null }[] | null, start: string, end?: string) =>
                (data ?? []).filter(t => {
                    const d = new Date(t.transacted_at);
                    return d >= new Date(start) && (!end || d < new Date(end));
                }).reduce((sum, t) => sum + netFeeOf(t), 0);

            const revenueThisMonth =
                revenueInRange(platformFeeData, thisMonthStart);

            const revenueLastMonth =
                revenueInRange(platformFeeData, lastMonthStart, thisMonthStart);

            const revenueGrowth = revenueLastMonth > 0
                ? parseFloat((((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1))
                : revenueThisMonth > 0 ? 100 : 0;

            // Formatters
            const formatRevenue = (amount: number): string => {
                const crore = 10000000;
                const lakh = 100000;
                if (amount >= crore) {
                    return `₹${(amount / crore).toFixed(1)} Cr`;
                } else if (amount >= lakh) {
                    return `₹${(amount / lakh).toFixed(1)} L`;
                }
                return `₹${amount.toLocaleString('en-IN')}`;
            };

            const formatGrowth = (growth: number): string =>
                growth >= 0 ? `↑ ${growth}%` : `↓ ${Math.abs(growth)}%`;

            return {
                totalStudents: {
                    total: totalStudents ?? 0,
                    growth: studentsGrowth,
                    display: formatGrowth(studentsGrowth),
                },
                totalFaculty: {
                    total: totalFaculty ?? 0,
                    newCount: facultyThisMonth ?? 0,
                    display: (facultyThisMonth ?? 0) > 0 ? `+${facultyThisMonth} New` : null,
                },
                totalCourses: {
                    total: totalCourses ?? 0,
                    newCount: coursesThisMonth ?? 0,
                    display: (coursesThisMonth ?? 0) > 0 ? `+${coursesThisMonth} New` : null,
                },
                totalRevenue: {
                    amount: totalRevenue,
                    growth: revenueGrowth,
                    display: formatRevenue(totalRevenue),
                    growthDisplay: formatGrowth(revenueGrowth),
                },
            };

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    // getEnrollmentTrends: async (period: TrendPeriod): Promise<EnrollmentTrendPoint[]> => {
    //     try {

    //         // 1. Fetch all student/faculty signups with created_at
    //         const { data: profiles, error: profilesError } = await supabase
    //             .from('profiles')
    //             .select('role, created_at')
    //             .in('role', ['STUDENT', 'FACULTY']);

    //         if (profilesError) throw new Error(profilesError.message);

    //         const allProfiles = profiles ?? [];

    //         const now = new Date();

    //         // Helper: count cumulative students/faculty created_at <= cutoff
    //         const countAsOf = (cutoff: Date) => {
    //             let students = 0;
    //             let faculty = 0;
    //             for (const p of allProfiles) {
    //                 if (!p.created_at) continue;
    //                 if (new Date(p.created_at) <= cutoff) {
    //                     if (p.role === 'STUDENT') students++;
    //                     else if (p.role === 'FACULTY') faculty++;
    //                 }
    //             }
    //             return { students, faculty };
    //         };

    //         let result: EnrollmentTrendPoint[] = [];

    //         if (period === 'week') {
    //             // Last 7 days, cumulative totals as of end of each day
    //             const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    //             for (let i = 6; i >= 0; i--) {
    //                 const date = new Date(now);
    //                 date.setDate(now.getDate() - i);
    //                 date.setHours(23, 59, 59, 999);

    //                 const { students, faculty } = countAsOf(date);

    //                 result.push({
    //                     label: dayLabels[date.getDay()] ?? '',
    //                     students,
    //                     faculty,
    //                 });
    //             }
    //         }

    //         else if (period === 'month') {
    //             // Last 4 weeks, cumulative totals as of end of each week
    //             for (let i = 3; i >= 0; i--) {
    //                 const date = new Date(now);
    //                 date.setDate(now.getDate() - i * 7);
    //                 date.setHours(23, 59, 59, 999);

    //                 const { students, faculty } = countAsOf(date);

    //                 result.push({
    //                     label: `Week ${4 - i}`,
    //                     students,
    //                     faculty,
    //                 });
    //             }
    //         }

    //         else if (period === 'year') {
    //             // Last 12 months, cumulative totals as of end of each month
    //             const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    //             for (let i = 11; i >= 0; i--) {
    //                 const date = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    //                 // last day of (current month - i)

    //                 const { students, faculty } = countAsOf(date);

    //                 result.push({
    //                     label: monthLabels[date.getMonth()] ?? '',
    //                     students,
    //                     faculty,
    //                 });
    //             }
    //         }

    //         return result;

    //     } catch (error: any) {
    //         throw new Error(error.message);
    //     }
    // },

    getEnrollmentTrends: async (period: TrendPeriod): Promise<EnrollmentTrendPoint[]> => {
        try {

            // 1. Fetch all student/faculty signups with created_at
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('role, created_at')
                .in('role', ['STUDENT', 'FACULTY']);

            if (profilesError) throw new Error(profilesError.message);

            const allProfiles = profiles ?? [];

            const now = new Date();

            // Cumulative counts of students/faculty as of a cutoff date
            const countAsOf = (cutoff: Date) => {
                let students = 0;
                let faculty = 0;
                for (const p of allProfiles) {
                    if (!p.created_at) continue;
                    if (new Date(p.created_at) <= cutoff) {
                        if (p.role === 'STUDENT') students++;
                        else if (p.role === 'FACULTY') faculty++;
                    }
                }
                return { students, faculty };
            };

            let result: EnrollmentTrendPoint[] = [];

            if (period === 'week') {
                // Last 7 days — daily granularity
                const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                for (let i = 6; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(now.getDate() - i);
                    date.setHours(23, 59, 59, 999);

                    const { students, faculty } = countAsOf(date);

                    result.push({
                        label: dayLabels[date.getDay()],
                        students,
                        faculty,
                    });
                }
            }

            else if (period === 'month') {
                // Last 4 weeks — weekly granularity
                for (let i = 3; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(now.getDate() - (i * 7));
                    date.setHours(23, 59, 59, 999);

                    const { students, faculty } = countAsOf(date);

                    result.push({
                        label: `Week ${4 - i}`, // Week 1, Week 2, Week 3, Week 4
                        students,
                        faculty,
                    });
                }
            }

            else if (period === 'year') {
                // Last 12 months — monthly granularity
                const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                for (let i = 11; i >= 0; i--) {
                    // last day of (current month - i)
                    const date = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

                    const { students, faculty } = countAsOf(date);

                    result.push({
                        label: monthLabels[date.getMonth()],
                        students,
                        faculty,
                    });
                }
            }

            return result;

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    getRevenueTrends: async (period: TrendPeriod): Promise<RevenueTrendPoint[]> => {
        try {

            // 1. Fetch admin revenue records (PLATFORM_FEE rows in faculty_transactions).
            // Admin revenue is the platform commission, recorded per enrollment/bundle
            // at payout time. Each row's `amount` is the GROSS commission — the chart
            // shows NET (commission − coin/offer subsidy the admin funded, workflow §9)
            // so it matches the Total Revenue card.
            const { data: platformFeeData, error: platformFeeError } = await supabase
                .from('faculty_transactions')
                .select('amount, transacted_at, payout_time_period, enrollment_id, bundle_enrollment_id')
                .eq('type', 'PLATFORM_FEE');

            if (platformFeeError) throw new Error(platformFeeError.message);

            const allRevenue = platformFeeData ?? [];

            const trendEnrIds = [...new Set(allRevenue.map(t => t.enrollment_id).filter(Boolean))]
            const trendBunIds = [...new Set(allRevenue.map(t => t.bundle_enrollment_id).filter(Boolean))]
            const [{ data: trendEnrs }, { data: trendBuns }] = await Promise.all([
                trendEnrIds.length > 0
                    ? supabase.from('enrollments').select('id, coin_redeem_amount, offer_discount_amount').in('id', trendEnrIds)
                    : Promise.resolve({ data: [] as any[] }),
                trendBunIds.length > 0
                    ? supabase.from('bundle_enrollments').select('id, coin_redeem_amount, offer_discount_amount').in('id', trendBunIds)
                    : Promise.resolve({ data: [] as any[] }),
            ])
            const trendSubsidy = new Map<string, number>()
            for (const e of trendEnrs ?? []) trendSubsidy.set(`e:${e.id}`, (e.coin_redeem_amount ?? 0) + (e.offer_discount_amount ?? 0))
            for (const b of trendBuns ?? []) trendSubsidy.set(`b:${b.id}`, (b.coin_redeem_amount ?? 0) + (b.offer_discount_amount ?? 0))
            const netOf = (t: { amount?: number; enrollment_id?: string | null; bundle_enrollment_id?: string | null }) => {
                const key = t.enrollment_id ? `e:${t.enrollment_id}` : t.bundle_enrollment_id ? `b:${t.bundle_enrollment_id}` : null
                return (t.amount ?? 0) - (key ? trendSubsidy.get(key) ?? 0 : 0)
            }

            const now = new Date();

            // Sum NET revenue for records with transacted_at within [start, end)
            const revenueInRange = (start: Date, end: Date) => {
                let total = 0;
                for (const r of allRevenue) {
                    if (!r.transacted_at) continue;
                    const d = new Date(r.transacted_at);
                    if (d >= start && d < end) {
                        total += netOf(r);
                    }
                }
                return total;
            };

            let result: RevenueTrendPoint[] = [];

            if (period === 'week') {
                // Last 7 days — daily granularity
                const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                for (let i = 6; i >= 0; i--) {
                    const start = new Date(now);
                    start.setDate(now.getDate() - i);
                    start.setHours(0, 0, 0, 0);

                    const end = new Date(start);
                    end.setDate(start.getDate() + 1);

                    result.push({
                        label: dayLabels[start.getDay()],
                        revenue: revenueInRange(start, end),
                    });
                }
            }

            else if (period === 'month') {
                // Last 4 weeks — weekly granularity
                for (let i = 3; i >= 0; i--) {
                    const end = new Date(now);
                    end.setDate(now.getDate() - (i * 7));
                    end.setHours(23, 59, 59, 999);

                    const start = new Date(end);
                    start.setDate(end.getDate() - 7);

                    result.push({
                        label: `Week ${4 - i}`, // Week 1, Week 2, Week 3, Week 4
                        revenue: revenueInRange(start, end),
                    });
                }
            }

            else if (period === 'year') {
                // Last 12 months — monthly granularity.
                // Revenue is attributed to the ENROLLMENT month (payout_time_period),
                // not the month the payout was processed — so a June payout run done
                // in July shows under June. The current month shows the pending admin
                // commission (its enrollments aren't paid out until next month).
                const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                const buckets = [] as { key: string; label: string; revenue: number }[]
                for (let i = 11; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
                    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabels[d.getMonth()] ?? '', revenue: 0 })
                }
                const bucketByKey = new Map(buckets.map(b => [b.key, b]))

                // Realized commission → bucket by payout_time_period (fallback transacted_at)
                for (const r of allRevenue) {
                    let month: number | null = null
                    let year: number | null = null
                    const parsed = r.payout_time_period ? new Date(`1 ${r.payout_time_period}`) : null
                    if (parsed && !Number.isNaN(parsed.getTime())) {
                        month = parsed.getMonth(); year = parsed.getFullYear()
                    } else if (r.transacted_at) {
                        const d = new Date(r.transacted_at); month = d.getMonth(); year = d.getFullYear()
                    }
                    if (month === null || year === null) continue
                    const bucket = bucketByKey.get(`${year}-${month}`)
                    if (bucket) bucket.revenue += netOf(r)
                }

                // Current month → add pending admin commission (unpaid this-month sales)
                const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
                const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()

                const [
                    { data: pendEnr },
                    { data: pendBun },
                    { data: saleTxns },
                    { data: defSetting },
                ] = await Promise.all([
                    supabase.from('enrollments')
                        .select('id, faculty_id, amount_paid, gst_amount, coin_redeem_amount, offer_discount_amount')
                        .eq('is_bundle_enrollment', false).eq('payment_status', 'SUCCESS').gt('amount_paid', 0)
                        .gte('enrolled_at', thisMonthStart).lt('enrolled_at', nextMonthStart),
                    supabase.from('bundle_enrollments')
                        .select('id, faculty_id, amount_paid, coin_redeem_amount, offer_discount_amount')
                        .eq('payment_status', 'SUCCESS').gt('amount_paid', 0)
                        .gte('enrolled_at', thisMonthStart).lt('enrolled_at', nextMonthStart),
                    supabase.from('faculty_transactions')
                        .select('type, enrollment_id, bundle_enrollment_id')
                        .in('type', ['COURSE_SALE', 'BUNDLE_SALE']),
                    supabase.from('platform_settings').select('value').eq('key', 'default_commission_percent').maybeSingle(),
                ])

                const paidEnrIds = new Set((saleTxns ?? []).filter(t => t.type === 'COURSE_SALE' && t.enrollment_id).map(t => t.enrollment_id))
                const paidBunIds = new Set((saleTxns ?? []).filter(t => t.type === 'BUNDLE_SALE' && t.bundle_enrollment_id).map(t => t.bundle_enrollment_id))
                const unpaidEnr = (pendEnr ?? []).filter(e => !paidEnrIds.has(e.id))
                const unpaidBun = (pendBun ?? []).filter(b => !paidBunIds.has(b.id))

                const facultyIds = [...new Set([...unpaidEnr, ...unpaidBun].map(e => e.faculty_id).filter(Boolean))]
                let ratesByFaculty = new Map<string, number | null>()
                if (facultyIds.length > 0) {
                    const { data: profs } = await supabase.from('profiles').select('id, commission_rate').in('id', facultyIds)
                    ratesByFaculty = new Map((profs ?? []).map(p => [p.id, p.commission_rate]))
                }
                const defaultCommission = parseFloat(defSetting?.value ?? '20') || 20
                const rateOf = (fid: string | null) => (fid ? ratesByFaculty.get(fid) : null) ?? defaultCommission

                // Base adds back admin-funded discounts (coins/offers) for the
                // commission, then the subsidy is subtracted again — the chart
                // shows admin's NET money, matching the Total Revenue card.
                let pendingCommission = 0
                for (const e of unpaidEnr) {
                    const subsidy = (e.coin_redeem_amount ?? 0) + (e.offer_discount_amount ?? 0)
                    const base = (e.amount_paid ?? 0) - (e.gst_amount ?? 0) + subsidy
                    pendingCommission += base * rateOf(e.faculty_id) / 100 - subsidy
                }
                for (const b of unpaidBun) {
                    const subsidy = (b.coin_redeem_amount ?? 0) + (b.offer_discount_amount ?? 0)
                    const base = (b.amount_paid ?? 0) + subsidy
                    pendingCommission += base * rateOf(b.faculty_id) / 100 - subsidy
                }

                const curBucket = bucketByKey.get(`${now.getFullYear()}-${now.getMonth()}`)
                if (curBucket) curBucket.revenue += pendingCommission

                result = buckets.map(b => ({ label: b.label, revenue: b.revenue }))
            }

            return result;

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    /**
     * Dashboard "Top Performers":
     *  - top faculty by total revenue = realized payouts (SUCCESS PAYOUT rows)
     *    + pending payout (faculty share of not-yet-settled enrollments) —
     *    the same definition used on the faculty revenue views
     *  - top course by number of enrolled students
     */
    getTopPerformers: async (): Promise<TopPerformers> => {
        try {
            const [
                { data: enrollments, error: enrErr },
                { data: bundles, error: bunErr },
                { data: payoutRows, error: payoutErr },
                { data: saleTxns, error: saleErr },
                { data: defSetting },
            ] = await Promise.all([
                supabase.from('enrollments').select('id, faculty_id, course_id, amount_paid, gst_amount, coin_redeem_amount, offer_discount_amount, is_bundle_enrollment, payment_status, student_id'),
                supabase.from('bundle_enrollments').select('id, faculty_id, amount_paid, coin_redeem_amount, offer_discount_amount, payment_status'),
                supabase.from('faculty_transactions').select('faculty_id, amount').eq('type', 'PAYOUT').eq('status', 'SUCCESS'),
                supabase.from('faculty_transactions').select('type, enrollment_id, bundle_enrollment_id').in('type', ['COURSE_SALE', 'BUNDLE_SALE']),
                supabase.from('platform_settings').select('value').eq('key', 'default_commission_percent').maybeSingle(),
            ])

            if (enrErr) throw new Error(enrErr.message)
            if (bunErr) throw new Error(bunErr.message)
            if (payoutErr) throw new Error(payoutErr.message)
            if (saleErr) throw new Error(saleErr.message)

            // Per-faculty commission rate (profiles.commission_rate → platform default)
            const involvedFacultyIds = [...new Set(
                [...(enrollments ?? []), ...(bundles ?? []), ...(payoutRows ?? [])].map(r => r.faculty_id).filter(Boolean),
            )]
            let ratesByFaculty = new Map<string, number | null>()
            if (involvedFacultyIds.length > 0) {
                const { data: profs } = await supabase.from('profiles').select('id, commission_rate').in('id', involvedFacultyIds)
                ratesByFaculty = new Map((profs ?? []).map(p => [p.id, p.commission_rate]))
            }
            const defaultCommission = parseFloat(defSetting?.value ?? '20') || 20
            const rateOf = (fid: string | null) => (fid ? ratesByFaculty.get(fid) : null) ?? defaultCommission

            // 1. Realized: sum of SUCCESS PAYOUT amounts per faculty
            const revByFaculty = new Map<string, number>()
            for (const p of payoutRows ?? []) {
                if (!p.faculty_id) continue
                revByFaculty.set(p.faculty_id, (revByFaculty.get(p.faculty_id) ?? 0) + (p.amount ?? 0))
            }

            // 2. Pending: faculty share of unpaid SUCCESS enrollments/bundles
            const paidEnrIds = new Set((saleTxns ?? []).filter(t => t.type === 'COURSE_SALE' && t.enrollment_id).map(t => t.enrollment_id))
            const paidBunIds = new Set((saleTxns ?? []).filter(t => t.type === 'BUNDLE_SALE' && t.bundle_enrollment_id).map(t => t.bundle_enrollment_id))

            for (const e of enrollments ?? []) {
                if (!e.faculty_id || e.is_bundle_enrollment) continue
                if ((e.payment_status ?? 'SUCCESS') !== 'SUCCESS' || (e.amount_paid ?? 0) <= 0) continue
                if (paidEnrIds.has(e.id)) continue
                const base = (e.amount_paid ?? 0) - (e.gst_amount ?? 0)
                    + (e.coin_redeem_amount ?? 0) + (e.offer_discount_amount ?? 0)
                const share = base - base * rateOf(e.faculty_id) / 100
                revByFaculty.set(e.faculty_id, (revByFaculty.get(e.faculty_id) ?? 0) + share)
            }
            for (const b of bundles ?? []) {
                if (!b.faculty_id) continue
                if ((b.payment_status ?? 'SUCCESS') !== 'SUCCESS' || (b.amount_paid ?? 0) <= 0) continue
                if (paidBunIds.has(b.id)) continue
                const base = (b.amount_paid ?? 0)
                    + (b.coin_redeem_amount ?? 0) + (b.offer_discount_amount ?? 0)
                const share = base - base * rateOf(b.faculty_id) / 100
                revByFaculty.set(b.faculty_id, (revByFaculty.get(b.faculty_id) ?? 0) + share)
            }

            // Distinct students per course
            const studentsByCourse = new Map<string, Set<string>>()
            for (const e of enrollments ?? []) {
                if (!e.course_id) continue
                if (!studentsByCourse.has(e.course_id)) studentsByCourse.set(e.course_id, new Set())
                if (e.student_id) studentsByCourse.get(e.course_id)!.add(e.student_id)
            }

            let topFacultyId: string | null = null
            let topFacultyRev = 0
            for (const [fid, rev] of revByFaculty) {
                if (rev > topFacultyRev) { topFacultyRev = rev; topFacultyId = fid }
            }

            let topCourseId: string | null = null
            let topCourseCount = 0
            for (const [cid, set] of studentsByCourse) {
                if (set.size > topCourseCount) { topCourseCount = set.size; topCourseId = cid }
            }

            const [
                { data: facProfile },
                { data: course },
            ] = await Promise.all([
                topFacultyId
                    ? supabase.from('profiles').select('first_name, last_name, avatar_url').eq('id', topFacultyId).maybeSingle()
                    : Promise.resolve({ data: null } as any),
                topCourseId
                    ? supabase.from('courses').select('title, category').eq('id', topCourseId).maybeSingle()
                    : Promise.resolve({ data: null } as any),
            ])

            const formatRevenue = (amount: number): string => {
                const crore = 10000000, lakh = 100000
                if (amount >= crore) return `₹${(amount / crore).toFixed(1)} Cr`
                if (amount >= lakh) return `₹${(amount / lakh).toFixed(1)} L`
                return `₹${(Math.round(amount * 100) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
            }

            return {
                faculty: topFacultyId ? {
                    name: [facProfile?.first_name, facProfile?.last_name].filter(Boolean).join(' ') || 'Unknown',
                    avatarUrl: facProfile?.avatar_url ?? null,
                    category: 'Faculty',
                    metric: `${formatRevenue(topFacultyRev)} revenue`,
                } : null,
                course: topCourseId ? {
                    name: course?.title ?? 'Course',
                    category: course?.category ?? 'Course',
                    metric: `${topCourseCount.toLocaleString('en-IN')} student${topCourseCount === 1 ? '' : 's'}`,
                } : null,
            }

        } catch (error: any) {
            throw new Error(error.message)
        }
    },

}