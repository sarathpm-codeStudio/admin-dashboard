import { supabase } from '@/config/supabase'

export type UserListRow = {
  id: string
  name: string
  email: string | null
  role: string
  accountVerified: string
  isSuspended: boolean
  courseCount: number
  joinedDate: string
  avatarUrl: string | null
}

export type UsersListPagination = {
    total: number
    total_pages: number
    current_page: number
    limit: number
    has_next: boolean
    has_prev: boolean
}

export type UsersListResponse = {
    data: UserListRow[]
    pagination: UsersListPagination
}

export type UsersAnalytics = {
    totalUsers: number
    growth: {
        rate: number
        display: string
        thisMonthUsers: number
        lastMonthUsers: number
    }
    students: { total: number; active: number }
    faculty: { total: number; active: number }
    pendingApprovals: { total: number; display: string }
}

export const userManagementFunctions = {



    getAllUsersAnalytics: async (): Promise<UsersAnalytics> => {
        try {

            const now = new Date();
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

            // 1. All non-admin profiles
            const { data: allUsers, error: usersError } = await supabase
                .from('profiles')
                .select('id, role, account_verified, created_at,is_suspended')
                .neq('role', 'ADMIN');

            if (usersError) throw new Error(usersError.message);

            const total = allUsers?.length ?? 0;
            const students = allUsers?.filter(u => u.role === 'STUDENT') ?? [];
            const faculty = allUsers?.filter(u => u.role === 'FACULTY') ?? [];

            // 2. Active = account_verified = 'APPROVED'
            const activeStudents = students.filter(u => u.is_suspended === false).length;
            const activeFaculty = faculty.filter(u => u.is_suspended === false && u.account_verified === 'APPROVED').length;

            // 3. Pending approvals — awaiting verification
            const pendingApprovals = allUsers?.filter(
                u => u.account_verified === 'PENDING'
            ).length ?? 0;

            // 4. Growth rate — compare this month vs last month
            const thisMonthUsers = allUsers?.filter(
                u => new Date(u.created_at!) >= new Date(thisMonth)
            ).length ?? 0;

            const lastMonthUsers = allUsers?.filter(u => {
                const created = new Date(u.created_at!);
                return created >= new Date(lastMonth) && created < new Date(thisMonth);
            }).length ?? 0;

            // ── Better growth calculation ──────────────────────────────
            let growthRate = 0;
            let growthDisplay = 'No change this month';

            if (lastMonthUsers === 0 && thisMonthUsers === 0) {
                growthRate = 0;
                growthDisplay = 'No new users yet';

            } else if (lastMonthUsers === 0 && thisMonthUsers > 0) {
                growthRate = 100;
                growthDisplay = `+${thisMonthUsers} new users this month`;

            } else if (thisMonthUsers === 0 && lastMonthUsers > 0) {
                growthRate = 0;
                growthDisplay = 'No new users this month';

            } else {
                const rate = ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;
                growthRate = parseFloat(rate.toFixed(1));
                growthDisplay = growthRate >= 0
                    ? `+${growthRate}% on this month`
                    : `${growthRate}% on this month`;
            }

            return {
                // Total users card
                totalUsers: total,
                growth: {
                    rate: growthRate,
                    display: growthDisplay,
                    thisMonthUsers,
                    lastMonthUsers,
                },

                // Students card
                students: {
                    total: students.length,
                    active: activeStudents,
                },

                // Faculty card
                faculty: {
                    total: faculty.length,
                    active: activeFaculty,
                },

                // Pending approvals card
                pendingApprovals: {
                    total: pendingApprovals,
                    display: 'Awaiting verification docs',
                },
            };

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    getAllUsers: async ({
        page = 1,
        limit = 10,
        search = '',
        role,
        status,
    }: {
        page?: number;
        limit?: number;
        search?: string;
        role?: 'STUDENT' | 'FACULTY' | 'all';
        status?: 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED' | 'all';
    }): Promise<UsersListResponse> => {
        try {
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            // 1. Base query — exclude ADMIN
            let query = supabase
                .from('profiles')
                .select('id, first_name, last_name, email, role, account_verified, is_suspended, created_at, avatar_url', { count: 'exact' })
                .neq('role', 'ADMIN')
                .order('created_at', { ascending: false })
                .range(from, to);

            // 2. Filters — skip if 'all'
            if (role && role !== 'all') query = query.eq('role', role);
            if (status && status !== 'all') {
                if (status === 'SUSPENDED') {
                    query = query.eq('is_suspended', true);
                } else {
                    query = query.eq('account_verified', status).eq('is_suspended', false);
                }
            }

            // 3. Search
            if (search.trim()) {
                query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
            }

            const { data: users, error, count } = await query;
            if (error) throw new Error(error.message);

            if (!users || users.length === 0) {
                return {
                    data: [],
                    pagination: {
                        total: 0,
                        total_pages: 0,
                        current_page: page,
                        limit,
                        has_next: false,
                        has_prev: false,
                    },
                };
            }

            // 4. Split by role
            const studentIds = users.filter(u => u.role === 'STUDENT').map(u => u.id);
            const facultyIds = users.filter(u => u.role === 'FACULTY').map(u => u.id);
            // 5. Student course count — from enrollments
            const enrollmentMap: Record<string, number> = {};
            if (studentIds.length > 0) {
                const { data: enrollments, error: enrollError } = await supabase
                    .from('enrollments')
                    .select('student_id')
                    .in('student_id', studentIds);

                if (enrollError) throw new Error(enrollError.message);

                enrollments?.forEach(e => {
                    enrollmentMap[e.student_id] = (enrollmentMap[e.student_id] ?? 0) + 1;
                });
            }

            // 6. Faculty course count — from courses
            const courseMap: Record<string, number> = {};
            if (facultyIds.length > 0) {
                const { data: courses, error: courseError } = await supabase
                    .from('courses')
                    .select('faculty_id')
                    .in('faculty_id', facultyIds)
                    .eq('is_deleted', false);

                if (courseError) throw new Error(courseError.message);

                courses?.forEach(c => {
                    courseMap[c.faculty_id] = (courseMap[c.faculty_id] ?? 0) + 1;
                });
            }

            // 7. Build final result
            const data = users.map(user => {
                const courseCount = user.role === 'STUDENT'
                    ? (enrollmentMap[user.id] ?? 0)
                    : (courseMap[user.id] ?? 0);

                return {
                    id: user.id,
                    name: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'Unknown',
                    email: user.email,
                    role: user.role,
                    accountVerified: user.account_verified ?? 'PENDING',
                    isSuspended: user.is_suspended === true,
                    avatarUrl: user.avatar_url,
                    courseCount,
                    joinedDate: new Date(user.created_at!).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    }),
                };
            });

            const totalPages = Math.ceil((count ?? 0) / limit);

            return {
                data,
                pagination: {
                    total: count ?? 0,
                    total_pages: totalPages,
                    current_page: page,
                    limit,
                    has_next: page < totalPages,
                    has_prev: page > 1,
                },
            };

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    updateUserStatus: async (userId: string, status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED' | 'ACTIVATE') => {
        try {

            if (status === "SUSPENDED") {
                const { error } = await supabase
                    .from('profiles')
                    .update({ is_suspended: true })
                    .eq('id', userId);

                if (error) throw new Error(error.message);


            } else if (status === "ACTIVATE") {

                const { error } = await supabase
                    .from('profiles')
                    .update({ is_suspended: false })
                    .eq('id', userId);

                if (error) throw new Error(error.message);

            }
            
            
            else {

                const { error } = await supabase
                    .from('profiles')
                    .update({ account_verified: status })
                    .eq('id', userId);

                if (error) throw new Error(error.message);


            }

            return { success: true };

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

}