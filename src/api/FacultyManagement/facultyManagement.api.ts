

import { supabase } from "@/config/supabase"


export const facultyManagementFunctions = {

    getFacultyById: async (facultyId: string) => {
        try {

            // 1. Faculty profile
            const { data: faculty, error: facultyError } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, email, phone, avatar_url, bio, account_verified, is_suspended, admin_note, acc_reject_reason, qualification, job_title, created_at, document_verifications(id, document_type, document_url, created_at)')
                .eq('role', 'FACULTY')
                .eq('id', facultyId)
                .single();

            if (facultyError) throw new Error(facultyError.message);
            if (!faculty) throw new Error('Faculty not found');

            // 2. Courses created
            const { data: courses, error: coursesError } = await supabase
                .from('courses')
                .select('id, created_at')
                .eq('faculty_id', facultyId)
                .eq('is_deleted', false);

            if (coursesError) throw new Error(coursesError.message);

            const courseIds = courses?.map(c => c.id) ?? [];
            const coursesCreated = courseIds.length;

            const now = new Date();
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

            const newCoursesThisMonth = courses?.filter(
                c => new Date(c.created_at!) >= new Date(thisMonthStart)
            ).length ?? 0;

            // 3. Total students — unique students enrolled in faculty courses
            let totalStudents = 0;
            let totalStudentsGrowth = 0;

            if (courseIds.length > 0) {
                const { data: enrollments, error: enrollError } = await supabase
                    .from('enrollments')
                    .select('student_id, created_at')
                    .in('course_id', courseIds);

                if (enrollError) throw new Error(enrollError.message);

                const uniqueStudents = new Set(enrollments?.map(e => e.student_id) ?? []);
                totalStudents = uniqueStudents.size;

                const thisMonthStudents = new Set(
                    enrollments
                        ?.filter(e => new Date(e.created_at) >= new Date(thisMonthStart))
                        .map(e => e.student_id) ?? []
                ).size;

                const lastMonthStudents = new Set(
                    enrollments
                        ?.filter(e => {
                            const d = new Date(e.created_at);
                            return d >= new Date(lastMonthStart) && d < new Date(thisMonthStart);
                        })
                        .map(e => e.student_id) ?? []
                ).size;

                totalStudentsGrowth = lastMonthStudents > 0
                    ? parseFloat((((thisMonthStudents - lastMonthStudents) / lastMonthStudents) * 100).toFixed(1))
                    : thisMonthStudents > 0 ? 100 : 0;
            }

            // 4. Total revenue — direct + bundle
            let totalRevenue = 0;

            if (courseIds.length > 0) {
                const { data: revenueData, error: revenueError } = await supabase
                    .from('enrollments')
                    .select('amount_paid')
                    .in('course_id', courseIds)
                    .eq('is_bundle_enrollment', false);

                if (revenueError) throw new Error(revenueError.message);

                const directRevenue = revenueData?.reduce(
                    (sum, e) => sum + (e.amount_paid ?? 0), 0
                ) ?? 0;

                const { data: bundleRevenue, error: bundleError } = await supabase
                    .from('bundle_enrollments')
                    .select('amount_paid')
                    .eq('faculty_id', facultyId);

                if (bundleError) throw new Error(bundleError.message);

                const bundleTotal = bundleRevenue?.reduce(
                    (sum, e) => sum + (e.amount_paid ?? 0), 0
                ) ?? 0;

                totalRevenue = directRevenue + bundleTotal;
            }

            const formatRevenue = (amount: number): string => {
                if (amount >= 100000) {
                    return `₹${(amount / 100000).toFixed(1)} L`;
                }
                return `₹${amount.toLocaleString('en-IN')}`;
            };

            // 5. Avg rating — directly via faculty_id + type = 'faculty'
            const { data: facultyReviews, error: reviewError } = await supabase
                .from('reviews')
                .select('rating')
                .eq('faculty_id', facultyId)
                .eq('type', 'faculty')


            if (reviewError) throw new Error(reviewError.message);

            const totalReviews = facultyReviews?.length ?? 0;

            const avgRating = totalReviews > 0
                ? parseFloat(
                    (facultyReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews)
                        .toFixed(1)
                )
                : 0;

            return {
                // Profile
                faculty: {
                    id: faculty.id,
                    name: `${faculty.first_name ?? ''} ${faculty.last_name ?? ''}`.trim(),
                    email: faculty.email,
                    phone: faculty.phone,
                    avatar_url: faculty.avatar_url,
                    bio: faculty.bio,
                    qualification: faculty.qualification,
                    job_title: faculty.job_title,
                    status: faculty.is_suspended ? 'SUSPENDED' : faculty.account_verified,
                    is_suspended: faculty.is_suspended,
                    account_verified: faculty.account_verified,
                    document: faculty.document_verifications?.[0] ?? null,
                    admin_note: faculty.admin_note,
                    acc_reject_reason: faculty.acc_reject_reason,
                },

                // Analytics cards
                analytics: {
                    coursesCreated: {
                        total: coursesCreated,
                        newCount: newCoursesThisMonth,
                        display: newCoursesThisMonth > 0
                            ? `+${newCoursesThisMonth} New`
                            : null,
                    },

                    totalStudents: {
                        total: totalStudents,
                        growth: totalStudentsGrowth,
                        display: totalStudentsGrowth >= 0
                            ? `↑ ${totalStudentsGrowth}%`
                            : `↓ ${Math.abs(totalStudentsGrowth)}%`,
                    },

                    totalRevenue: {
                        amount: totalRevenue,
                        display: formatRevenue(totalRevenue),
                    },

                    avgRating: {
                        rating: avgRating,
                        totalReviews,
                        display: `${avgRating}`,
                        reviewDisplay: `${totalReviews} Reviews`,
                    },
                },
            };

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    getFacultyAcademicProfile: async (facultyId: string) => {
        try {

            // 1. Academic profiles — multiple
            const { data: academicProfiles, error: academicError } = await supabase
                .from('academic_profiles')
                .select('*')
                .eq('faculty_id', facultyId)
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (academicError) throw new Error(academicError.message);

            // 2. Verification document — single latest
            const { data: document, error: documentError } = await supabase
                .from('document_verifications')
                .select('*')
                .eq('user_id', facultyId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (documentError) throw new Error(documentError.message);

            return {
                academicProfiles: academicProfiles ?? [],  // multiple
                document: document ?? null,        // single
            };

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    getFacultyCourseCategories: async (facultyId: string) => {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select('category')
                .eq('faculty_id', facultyId)
                .eq('is_deleted', false)
                .not('category', 'is', null);

            if (error) throw new Error(error.message);

            return Array.from(
                new Set((data ?? []).map(c => c.category).filter(Boolean) as string[]),
            ).sort();
        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    getFacultyCourses: async (
        facultyId: string,
        {
            limit = 8,
            offset = 0,
            search = '',
            status = 'all',
            category = 'all',
        }: {
            limit?: number
            offset?: number
            search?: string
            status?: string
            category?: string
        } = {},
    ) => {
        try {
            // Shared filter builder — applied to both the count and the page query
            const applyFilters = (query: any) => {
                let q = query
                    .eq('faculty_id', facultyId)
                    .eq('is_deleted', false);

                const term = search.trim();
                if (term) q = q.ilike('title', `%${term}%`);
                if (status === 'active') q = q.eq('is_draft', false);
                else if (status === 'draft') q = q.eq('is_draft', true);
                if (category !== 'all') q = q.eq('category', category);

                return q;
            };

            // 1. Total count for the current filters (for "has more" / load-more)
            const { count, error: countError } = await applyFilters(
                supabase.from('courses').select('*', { count: 'exact', head: true }),
            );

            if (countError) throw new Error(countError.message);

            // 2. Current page of courses
            const { data: courses, error: coursesError } = await applyFilters(
                supabase
                    .from('courses')
                    .select('id, title, category, status, is_draft, price, final_price, cover_image, created_at'),
            )
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (coursesError) throw new Error(coursesError.message);

            type CourseRow = {
                id: string
                title: string | null
                category: string | null
                is_draft: boolean | null
                cover_image: string | null
            }
            const courseRows: CourseRow[] = courses ?? [];

            const courseIds = courseRows.map(c => c.id);

            // 3. Enrollments for this page — used for per-course students + revenue
            let enrollments: { course_id: string; student_id: string; amount_paid: number | null }[] = [];

            if (courseIds.length > 0) {
                const { data: enrollData, error: enrollError } = await supabase
                    .from('enrollments')
                    .select('course_id, student_id, amount_paid')
                    .in('course_id', courseIds);

                if (enrollError) throw new Error(enrollError.message);
                enrollments = enrollData ?? [];
            }

            const formatRevenue = (amount: number): string => {
                if (amount >= 100000) {
                    return `₹${(amount / 100000).toFixed(1)} L`;
                }
                return `₹${amount.toLocaleString('en-IN')}`;
            };

            const items = courseRows.map(course => {
                const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
                const studentsEnrolled = new Set(courseEnrollments.map(e => e.student_id)).size;
                const revenueAmount = courseEnrollments.reduce(
                    (sum, e) => sum + (e.amount_paid ?? 0), 0,
                );

                return {
                    id: course.id,
                    facultyId,
                    name: course.title ?? '',
                    status: (course.is_draft ? 'draft' : 'active') as 'active' | 'draft',
                    category: course.category ?? '',
                    coverImage: course.cover_image ?? null,
                    studentsEnrolled,
                    revenueAmount,
                    revenue: formatRevenue(revenueAmount),
                };
            });

            const total = count ?? 0;
            const nextOffset = offset + items.length;

            return {
                items,
                total,
                nextOffset,
                hasMore: nextOffset < total,
            };

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    getFacultyStudents: async (
        facultyId: string,
        {
            limit = 25,
            offset = 0,
            search = '',
            courseId = 'all',
        }: {
            limit?: number
            offset?: number
            search?: string
            courseId?: string
        } = {},
    ) => {
        try {
            // 1. Faculty's published courses — these also feed the course filter dropdown.
            //    Drafts are excluded (is_draft = false), so no drafted course is offered.
            const { data: courses, error: coursesError } = await supabase
                .from('courses')
                .select('id, title')
                .eq('faculty_id', facultyId)
                .eq('is_deleted', false)
                .eq('is_draft', false);

            if (coursesError) throw new Error(coursesError.message);

            const courseRows = courses ?? [];
            const allCourseIds = courseRows.map(c => c.id);
            const courseOptions = courseRows
                .map(c => ({ value: c.id, label: c.title ?? '' }))
                .sort((a, b) => a.label.localeCompare(b.label));

            // No published courses → no students to show.
            if (allCourseIds.length === 0) {
                return { items: [], total: 0, nextOffset: offset, hasMore: false, courseOptions };
            }

            // Scope: a single course when filtered, otherwise every faculty course.
            const scopedCourseIds =
                courseId !== 'all' && allCourseIds.includes(courseId)
                    ? [courseId]
                    : allCourseIds;

            // 2. Enrollments across ALL faculty courses — used for the per-student
            //    "enrolled courses" count (distinct courses with this faculty).
            const { data: allEnrollments, error: enrollError } = await supabase
                .from('enrollments')
                .select('student_id, course_id')
                .in('course_id', allCourseIds);

            if (enrollError) throw new Error(enrollError.message);

            const coursesByStudent = new Map<string, Set<string>>();
            for (const e of allEnrollments ?? []) {
                if (!e.student_id) continue;
                let set = coursesByStudent.get(e.student_id);
                if (!set) {
                    set = new Set<string>();
                    coursesByStudent.set(e.student_id, set);
                }
                set.add(e.course_id);
            }

            // 3. Unique students within the scoped course(s).
            const scopedStudentIds = Array.from(
                new Set(
                    (allEnrollments ?? [])
                        .filter(e => scopedCourseIds.includes(e.course_id) && e.student_id)
                        .map(e => e.student_id),
                ),
            );

            if (scopedStudentIds.length === 0) {
                return { items: [], total: 0, nextOffset: offset, hasMore: false, courseOptions };
            }

            // 4. Student profiles (with optional name/email search).
            let profileQuery = supabase
                .from('profiles')
                .select('id, first_name, last_name, email, phone, avatar_url,account_id')
                .in('id', scopedStudentIds);

            const term = search.trim();
            if (term) {
                profileQuery = profileQuery.or(
                    `first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`,
                );
            }

            const { data: profiles, error: profilesError } = await profileQuery
                .order('first_name', { ascending: true });

            if (profilesError) throw new Error(profilesError.message);

            const matched = profiles ?? [];
            const total = matched.length;

            // 5. Page slice + shape for the enrollment table.
            const items = matched.slice(offset, offset + limit).map(p => {
                const name = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim();
                const initials = (name || 'NA')
                    .split(/\s+/)
                    .map(part => part[0]?.toUpperCase() ?? '')
                    .slice(0, 2)
                    .join('');

                return {
                    id: p.id,
                    facultyId,
                    studentId: p.id,
                    account_id: p.account_id,
                    name,
                    initials: initials || 'NA',
                    avatarUrl: p.avatar_url ?? undefined,
                    email: p.email ?? '',
                    phoneNumber: p.phone ?? '',
                    enrolledCoursesCount: coursesByStudent.get(p.id)?.size ?? 0,
                };
            });

            const nextOffset = offset + items.length;

            return {
                items,
                total,
                nextOffset,
                hasMore: nextOffset < total,
                courseOptions,
            };

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    addNoteToProfile: async (facultyId: string, note: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    admin_note: note,
                })
                .eq('id', facultyId)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    // lib/facultyStats.js

    getFacultyRevenueStats: async (facultyId: string) => {

        // ── 1. Get commission from platform_settings ──────────────
        const { data: setting, error: settingError } = await supabase
            .from("platform_settings")
            .select("value")
            .eq("key", "default_commission_percent")
            .single();

        if (settingError) throw settingError;
        const commissionPercent = parseFloat(setting.value); // e.g. 20

        // ── 2. All single course enrollments ─────────────────────
        const { data: singleEnrollments, error: e1 } = await supabase
            .from("enrollments")
            .select("id, amount_paid, gst_amount")
            .eq("faculty_id", facultyId)
            .eq("is_bundle_enrollment", false);

        if (e1) throw e1;

        // ── 3. All bundle enrollments ─────────────────────────────
        const { data: bundleEnrollments, error: e2 } = await supabase
            .from("bundle_enrollments")
            .select("id, amount_paid")
            .eq("faculty_id", facultyId);

        if (e2) throw e2;

        // ── 4. Already processed single enrollment ids ────────────
        const { data: paidSingleTxns, error: e3 } = await supabase
            .from("faculty_transactions")
            .select("enrollment_id")
            .eq("faculty_id", facultyId)
            .eq("type", "COURSE_SALE")
            .not("enrollment_id", "is", null);

        if (e3) throw e3;

        // ── 5. Already processed bundle enrollment ids ────────────
        const { data: paidBundleTxns, error: e4 } = await supabase
            .from("faculty_transactions")
            .select("bundle_enrollment_id")
            .eq("faculty_id", facultyId)
            .eq("type", "BUNDLE_SALE")
            .not("bundle_enrollment_id", "is", null);

        if (e4) throw e4;

        // ── 6. Calculate Total Revenue (sum of PAYOUT transactions) ─
        const { data: payoutTxns, error: e5 } = await supabase
            .from("faculty_transactions")
            .select("amount")
            .eq("faculty_id", facultyId)
            .eq("type", "PAYOUT")
            .eq("status", "SUCCESS");

        if (e5) throw e5;

        const totalRevenue = payoutTxns.reduce(
            (sum, t) => sum + (t.amount ?? 0), 0
        );

        // ── 7. Calculate Pending Payout ───────────────────────────
        const paidSingleIds = new Set(paidSingleTxns.map((t) => t.enrollment_id));
        const paidBundleIds = new Set(paidBundleTxns.map((t) => t.bundle_enrollment_id));

        // Unpaid single enrollments → after GST and commission
        const unpaidSingleAmount = singleEnrollments
            .filter((e) => !paidSingleIds.has(e.id))
            .reduce((sum, e) => {
                const base = e.amount_paid - e.gst_amount;
                const commission = Math.round(base * commissionPercent / 100);
                return sum + (base - commission);
            }, 0);

        // Unpaid bundle enrollments → after commission
        const unpaidBundleAmount = bundleEnrollments
            .filter((b) => !paidBundleIds.has(b.id))
            .reduce((sum, b) => {
                const commission = Math.round(b.amount_paid * commissionPercent / 100);
                return sum + (b.amount_paid - commission);
            }, 0);

        const pendingPayout = unpaidSingleAmount + unpaidBundleAmount;

        const formatRevenue = (amount: number): string => {
            if (amount >= 100000) {
                return `₹${(amount / 100000).toFixed(1)} L`;
            }
            return `₹${amount.toLocaleString('en-IN')}`;
        };

        return {
            totalRevenue: {            // → Total Revenue card  (sum of PAYOUT transactions paid to faculty)
                amount: totalRevenue,
                display: formatRevenue(totalRevenue),
            },
            pendingPayout: {           // → Pending Payout card (after commission)
                amount: pendingPayout,
                display: formatRevenue(pendingPayout),
            },
            commissionPercent,
        };
    }




}