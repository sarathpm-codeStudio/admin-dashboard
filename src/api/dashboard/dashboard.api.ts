

import { supabase } from "@/config/supabase"
import type { EnrollmentTrendPoint, TrendPeriod } from "@/features/dashboard/data/chartTrends"

export const dashboardManagementFunctions = {

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

            // 4. Total Revenue (direct + bundle)
            const { data: directRevenueData, error: directRevenueError } = await supabase
                .from('enrollments')
                .select('amount_paid, created_at')
                .eq('is_bundle_enrollment', false);

            if (directRevenueError) throw new Error(directRevenueError.message);

            const { data: bundleRevenueData, error: bundleRevenueError } = await supabase
                .from('bundle_enrollments')
                .select('amount_paid, created_at');

            if (bundleRevenueError) throw new Error(bundleRevenueError.message);

            const directTotal = directRevenueData?.reduce(
                (sum, e) => sum + (e.amount_paid ?? 0), 0
            ) ?? 0;

            const bundleTotal = bundleRevenueData?.reduce(
                (sum, e) => sum + (e.amount_paid ?? 0), 0
            ) ?? 0;

            const totalRevenue = directTotal + bundleTotal;

            // Revenue growth (this month vs last month)
            const revenueInRange = (data: { amount_paid: number; created_at: string }[] | null, start: string, end?: string) =>
                (data ?? []).filter(e => {
                    const d = new Date(e.created_at);
                    return d >= new Date(start) && (!end || d < new Date(end));
                }).reduce((sum, e) => sum + (e.amount_paid ?? 0), 0);

            const revenueThisMonth =
                revenueInRange(directRevenueData, thisMonthStart) +
                revenueInRange(bundleRevenueData, thisMonthStart);

            const revenueLastMonth =
                revenueInRange(directRevenueData, lastMonthStart, thisMonthStart) +
                revenueInRange(bundleRevenueData, lastMonthStart, thisMonthStart);

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
    }


}