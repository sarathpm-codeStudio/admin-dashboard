

import { supabase } from "@/config/supabase"
import type { EnrollmentTrendPoint, RevenueTrendPoint, TrendPeriod } from "@/features/dashboard/data/chartTrends"

/** Where a pending action's "Take Action" button should navigate. */
export type PendingActionTarget =
    | { kind: 'faculty'; facultyId: string }
    | { kind: 'course'; courseId: string }

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
            // commission for a single enrollment / bundle enrollment.
            const { data: platformFeeData, error: platformFeeError } = await supabase
                .from('faculty_transactions')
                .select('amount, transacted_at')
                .eq('type', 'PLATFORM_FEE');

            if (platformFeeError) throw new Error(platformFeeError.message);

            const totalRevenue = platformFeeData?.reduce(
                (sum, t) => sum + (t.amount ?? 0), 0
            ) ?? 0;

            // Revenue growth (this month vs last month)
            const revenueInRange = (data: { amount: number; transacted_at: string }[] | null, start: string, end?: string) =>
                (data ?? []).filter(t => {
                    const d = new Date(t.transacted_at);
                    return d >= new Date(start) && (!end || d < new Date(end));
                }).reduce((sum, t) => sum + (t.amount ?? 0), 0);

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
            // at payout time. Each row's `amount` is the admin commission.
            const { data: platformFeeData, error: platformFeeError } = await supabase
                .from('faculty_transactions')
                .select('amount, transacted_at')
                .eq('type', 'PLATFORM_FEE');

            if (platformFeeError) throw new Error(platformFeeError.message);

            const allRevenue = platformFeeData ?? [];

            const now = new Date();

            // Sum revenue for records with transacted_at within [start, end)
            const revenueInRange = (start: Date, end: Date) => {
                let total = 0;
                for (const r of allRevenue) {
                    if (!r.transacted_at) continue;
                    const d = new Date(r.transacted_at);
                    if (d >= start && d < end) {
                        total += r.amount ?? 0;
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
                // Last 12 months — monthly granularity
                const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                for (let i = 11; i >= 0; i--) {
                    const start = new Date(now.getFullYear(), now.getMonth() - i, 1, 0, 0, 0, 0);
                    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1, 0, 0, 0, 0);

                    result.push({
                        label: monthLabels[start.getMonth()],
                        revenue: revenueInRange(start, end),
                    });
                }
            }

            return result;

        } catch (error: any) {
            throw new Error(error.message);
        }
    },




}