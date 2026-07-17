

import { supabase } from "@/config/supabase"
import { getFacultyCommissionPercent } from "@/api/platformSettings/platformSettings.api"
import type { RevenueTrendPoint, TrendPeriod } from "@/features/dashboard/data/chartTrends"

export type FacultyPayoutStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

/** A single PAYOUT row from faculty_transactions, shaped for the payouts table. */
export type FacultyPayoutTransaction = {
    id: string
    transactionId: string
    amount: number
    amountDisplay: string
    grossAmount: number
    grossDisplay: string
    status: FacultyPayoutStatus
    date: string | null
    dateDisplay: string
}

/**
 * Platform commission rate (%) used to derive a faculty's net share of an
 * enrollment. Uses per-faculty override when set, otherwise platform default.
 */
const getCommissionPercentForFaculty = async (facultyId: string): Promise<number> => {
    return getFacultyCommissionPercent(facultyId);
};


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

            // 4. Total revenue — sum of PAYOUT transactions actually paid to the faculty
            const { data: payoutTxns, error: payoutError } = await supabase
                .from('faculty_transactions')
                .select('amount')
                .eq('faculty_id', facultyId)
                .eq('type', 'PAYOUT')
                .eq('status', 'SUCCESS');

            if (payoutError) throw new Error(payoutError.message);

            const totalRevenue = payoutTxns?.reduce(
                (sum, t) => sum + (t.amount ?? 0), 0
            ) ?? 0;

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

            // 6. Pending payout — faculty share of enrollments not yet paid out.
            //    Mirrors the calc in getFacultyRevenueStats / enrollment-payout-workflow.md §3.
            const commissionPercent = await getCommissionPercentForFaculty(facultyId);

            const { data: singleEnrollments, error: singleEnrollError } = await supabase
                .from('enrollments')
                .select('id, amount_paid, gst_amount, coin_redeem_amount, offer_discount_amount')
                .eq('faculty_id', facultyId)
                .eq('is_bundle_enrollment', false);

            if (singleEnrollError) throw new Error(singleEnrollError.message);

            const { data: bundleEnrollments, error: bundleEnrollError } = await supabase
                .from('bundle_enrollments')
                .select('id, amount_paid, coin_redeem_amount, offer_discount_amount')
                .eq('faculty_id', facultyId);

            if (bundleEnrollError) throw new Error(bundleEnrollError.message);

            const { data: paidSingleTxns, error: paidSingleError } = await supabase
                .from('faculty_transactions')
                .select('enrollment_id')
                .eq('faculty_id', facultyId)
                .eq('type', 'COURSE_SALE')
                .not('enrollment_id', 'is', null);

            if (paidSingleError) throw new Error(paidSingleError.message);

            const { data: paidBundleTxns, error: paidBundleError } = await supabase
                .from('faculty_transactions')
                .select('bundle_enrollment_id')
                .eq('faculty_id', facultyId)
                .eq('type', 'BUNDLE_SALE')
                .not('bundle_enrollment_id', 'is', null);

            if (paidBundleError) throw new Error(paidBundleError.message);

            const paidSingleIds = new Set((paidSingleTxns ?? []).map(t => t.enrollment_id));
            const paidBundleIds = new Set((paidBundleTxns ?? []).map(t => t.bundle_enrollment_id));

            // Base adds back admin-funded discounts (coins/offers): faculty is
            // paid as if the student paid full price (workflow §3).
            const unpaidSingleAmount = (singleEnrollments ?? [])
                .filter(e => !paidSingleIds.has(e.id))
                .reduce((sum, e) => {
                    const base = (e.amount_paid ?? 0) - (e.gst_amount ?? 0)
                        + (e.coin_redeem_amount ?? 0) + (e.offer_discount_amount ?? 0);
                    const commission = base * commissionPercent / 100;
                    return sum + (base - commission);
                }, 0);

            const unpaidBundleAmount = (bundleEnrollments ?? [])
                .filter(b => !paidBundleIds.has(b.id))
                .reduce((sum, b) => {
                    const base = (b.amount_paid ?? 0)
                        + (b.coin_redeem_amount ?? 0) + (b.offer_discount_amount ?? 0);
                    const commission = base * commissionPercent / 100;
                    return sum + (base - commission);
                }, 0);

            const pendingPayout = unpaidSingleAmount + unpaidBundleAmount;

            // 7. Recent active — latest usage session written by the faculty
            //    app (started on app open, ended_at refreshed by heartbeats).
            const { data: lastSession } = await supabase
                .from('usage_sessions')
                .select('started_at, ended_at, platform')
                .eq('user_id', facultyId)
                .order('ended_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            const formatLastActive = (dateStr: string | null): string => {
                if (!dateStr) return 'Never';
                const date = new Date(dateStr);
                const now2 = new Date();
                const isToday = date.toDateString() === now2.toDateString();
                const yesterday = new Date(now2);
                yesterday.setDate(now2.getDate() - 1);
                const isYesterday = date.toDateString() === yesterday.toDateString();
                const timeStr = date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                });
                if (isToday) return `Today ${timeStr}`;
                if (isYesterday) return `Yesterday ${timeStr}`;
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                }) + `, ${timeStr}`;
            };

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

                // Recent activity — latest heartbeat from the faculty app
                lastActive: {
                    display: formatLastActive(lastSession?.ended_at ?? lastSession?.started_at ?? null),
                    raw: lastSession?.ended_at ?? lastSession?.started_at ?? null,
                    platform: lastSession?.platform ?? null,
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

                    // Total revenue = already paid out (PAYOUT rows) + still pending.
                    // Pending is also surfaced separately on the card below.
                    totalRevenue: {
                        amount: totalRevenue + pendingPayout,
                        display: formatRevenue(totalRevenue + pendingPayout),
                    },

                    pendingPayout: {
                        amount: pendingPayout,
                        display: formatRevenue(pendingPayout),
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
                    .select('id, title, category, status, is_draft, is_free, price, final_price, validity, cover_image, created_at'),
            )
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (coursesError) throw new Error(coursesError.message);

            type CourseRow = {
                id: string
                title: string | null
                category: string | null
                is_draft: boolean | null
                is_free: boolean | null
                price: number | null
                final_price: number | null
                validity: string | null
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

            const formatPrice = (amount: number): string =>
                `₹${amount.toLocaleString('en-IN')}`;

            // `validity` is a month count, the literal "lifetime", or days as
            // '<n>d' for free courses (platform_settings.free_course_validity)
            const formatDuration = (raw: string | null): string => {
                const value = (raw ?? '').trim();
                if (!value) return '—';
                if (value.toLowerCase() === 'lifetime') return 'Lifetime';
                const daysMatch = /^(\d+)d$/i.exec(value);
                if (daysMatch) {
                    const days = Number(daysMatch[1]);
                    return `${days} ${days === 1 ? 'Day' : 'Days'}`;
                }
                const months = Number(value);
                if (!Number.isFinite(months)) return value;
                return `${months} ${months === 1 ? 'Month' : 'Months'}`;
            };

            const items = courseRows.map(course => {
                const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
                const studentsEnrolled = new Set(courseEnrollments.map(e => e.student_id)).size;
                const revenueAmount = courseEnrollments.reduce(
                    (sum, e) => sum + (e.amount_paid ?? 0), 0,
                );

                // `price` is the list price, `final_price` what the student actually pays
                const isFree = course.is_free ?? false;
                const listPrice = course.price ?? 0;
                const sellingPrice = course.final_price ?? listPrice;
                const isDiscounted = !isFree && listPrice > sellingPrice;

                return {
                    id: course.id,
                    facultyId,
                    name: course.title ?? '',
                    status: (course.is_draft ? 'draft' : 'active') as 'active' | 'draft',
                    category: course.category ?? '',
                    coverImage: course.cover_image ?? null,
                    durationDisplay: formatDuration(course.validity),
                    isFree,
                    priceDisplay: isFree ? 'Free' : formatPrice(sellingPrice),
                    originalPriceDisplay: isDiscounted ? formatPrice(listPrice) : null,
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

        const commissionPercent = await getCommissionPercentForFaculty(facultyId);

        // ── 2. All single course enrollments ─────────────────────
        const { data: singleEnrollments, error: e1 } = await supabase
            .from("enrollments")
            .select("id, amount_paid, gst_amount, coin_redeem_amount, offer_discount_amount, coupon_discount_amount")
            .eq("faculty_id", facultyId)
            .eq("is_bundle_enrollment", false);

        if (e1) throw e1;

        // ── 3. All bundle enrollments ─────────────────────────────
        const { data: bundleEnrollments, error: e2 } = await supabase
            .from("bundle_enrollments")
            .select("id, amount_paid, coin_redeem_amount, offer_discount_amount, coupon_discount_amount")
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
            .select("amount, transacted_at")
            .eq("faculty_id", facultyId)
            .eq("type", "PAYOUT")
            .eq("status", "SUCCESS");

        if (e5) throw e5;

        const totalRevenue = payoutTxns.reduce(
            (sum, t) => sum + (t.amount ?? 0), 0
        );

        // ── 6a. Revenue growth — this month vs last month (by payout date) ─
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const sumPayoutsInRange = (start: Date, end?: Date) =>
            payoutTxns
                .filter((t) => {
                    if (!t.transacted_at) return false;
                    const d = new Date(t.transacted_at);
                    return d >= start && (!end || d < end);
                })
                .reduce((sum, t) => sum + (t.amount ?? 0), 0);

        const revenueThisMonth = sumPayoutsInRange(thisMonthStart);
        const revenueLastMonth = sumPayoutsInRange(lastMonthStart, thisMonthStart);

        const revenueGrowth = revenueLastMonth > 0
            ? parseFloat((((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1))
            : revenueThisMonth > 0 ? 100 : 0;

        // ── 7. Calculate Pending Payout ───────────────────────────
        const paidSingleIds = new Set(paidSingleTxns.map((t) => t.enrollment_id));
        const paidBundleIds = new Set(paidBundleTxns.map((t) => t.bundle_enrollment_id));

        // Unpaid single enrollments → after GST and commission; admin-funded
        // discounts (coins/offers) are added back so faculty is paid full price
        const unpaidSingleAmount = singleEnrollments
            .filter((e) => !paidSingleIds.has(e.id))
            .reduce((sum, e) => {
                const base = e.amount_paid - e.gst_amount
                    + (e.coin_redeem_amount ?? 0) + (e.offer_discount_amount ?? 0);
                const commission = base * commissionPercent / 100;
                return sum + (base - commission);
            }, 0);

        // Unpaid bundle enrollments → after commission
        const unpaidBundleAmount = bundleEnrollments
            .filter((b) => !paidBundleIds.has(b.id))
            .reduce((sum, b) => {
                const base = b.amount_paid
                    + (b.coin_redeem_amount ?? 0) + (b.offer_discount_amount ?? 0);
                const commission = base * commissionPercent / 100;
                return sum + (base - commission);
            }, 0);

        const pendingPayout = unpaidSingleAmount + unpaidBundleAmount;

        // ── 7a. Promotions on this faculty's sales (workflow §9) ──
        // Admin subsidy (coins + offers) is platform-funded and added back to
        // the payout base — the faculty is paid as if students paid full price.
        // Coupon spend is the faculty's own promotion cost.
        const allFacultySales = [...(singleEnrollments ?? []), ...(bundleEnrollments ?? [])];
        const adminSubsidyAmount = allFacultySales.reduce(
            (sum, e) => sum + (e.coin_redeem_amount ?? 0) + (e.offer_discount_amount ?? 0), 0,
        );
        const couponSpendAmount = allFacultySales.reduce(
            (sum, e) => sum + (e.coupon_discount_amount ?? 0), 0,
        );

        const formatRevenue = (amount: number): string => {
            if (amount >= 100000) {
                return `₹${(amount / 100000).toFixed(1)} L`;
            }
            return `₹${amount.toLocaleString('en-IN')}`;
        };

        const formatGrowth = (growth: number): string =>
            growth >= 0 ? `+${growth}%` : `${growth}%`;

        return {
            totalRevenue: {            // → Total Revenue card = already paid out (PAYOUT rows) + still pending
                amount: totalRevenue + pendingPayout,
                display: formatRevenue(totalRevenue + pendingPayout),
                growth: revenueGrowth,                 // numeric %, negative = decrease
                growthDisplay: formatGrowth(revenueGrowth),
                isPositive: revenueGrowth >= 0,        // for arrow / color in the card
            },
            pendingPayout: {           // → Pending Payout card (after commission)
                amount: pendingPayout,
                display: formatRevenue(pendingPayout),
            },
            adminSubsidy: {            // → coin/offer discounts platform-funded on this faculty's sales
                amount: adminSubsidyAmount,
                display: formatRevenue(adminSubsidyAmount),
            },
            couponSpend: {             // → faculty's own coupon promotion cost
                amount: couponSpendAmount,
                display: formatRevenue(couponSpendAmount),
            },
            commissionPercent,
        };
    },

    /**
     * Earnings Growth chart data for a single faculty, bucketed by period.
     *
     * A faculty's earnings are the amounts actually transferred to them, i.e. the
     * PAYOUT rows in faculty_transactions (see enrollment-payout-workflow.md §5 —
     * the PAYOUT row's `amount` is the total faculty share for that payout batch).
     * This matches the "Total Revenue" card, which also sums PAYOUT transactions,
     * so the chart and the card tell the same story.
     *
     * Bucketing mirrors the dashboard revenue trend:
     *   week  → last 7 days,   daily granularity
     *   month → last 4 weeks,  weekly granularity
     *   year  → last 12 months, monthly granularity
     */
    getFacultyRevenueTrends: async (
        facultyId: string,
        period: TrendPeriod,
    ): Promise<RevenueTrendPoint[]> => {
        try {
            const db = supabase;

            // Faculty's (non-deleted) courses — enrollments are joined via course_id.
            const { data: courses, error: coursesError } = await db
                .from('courses')
                .select('id')
                .eq('faculty_id', facultyId)
                .eq('is_deleted', false);

            if (coursesError) throw new Error(coursesError.message);
            const courseIds = (courses ?? []).map((c) => c.id);

            // Actual settled faculty share (recorded at payout time) takes priority
            // over a current-rate estimate, so a later commission-rate change never
            // rewrites past months (enrollment-payout-workflow.md §7).
            const { data: saleRows, error: saleError } = await db
                .from('faculty_transactions')
                .select('enrollment_id, amount')
                .eq('faculty_id', facultyId)
                .eq('type', 'COURSE_SALE')
                .not('enrollment_id', 'is', null);

            if (saleError) throw new Error(saleError.message);
            const settledByEnrollment = new Map(
                (saleRows ?? []).map((r) => [r.enrollment_id, Number(r.amount ?? 0)]),
            );

            // For not-yet-paid enrollments only, estimate at the current rate.
            // Admin-funded discounts (coins/offers) are added back to the base.
            const commissionPercent = await getCommissionPercentForFaculty(facultyId);
            const facultyNet = (e: { id?: string; amount_paid?: number; gst_amount?: number; coin_redeem_amount?: number; offer_discount_amount?: number }) => {
                if (e.id && settledByEnrollment.has(e.id)) return settledByEnrollment.get(e.id)!;
                const base = Number(e.amount_paid ?? 0) - Number(e.gst_amount ?? 0)
                    + Number(e.coin_redeem_amount ?? 0) + Number(e.offer_discount_amount ?? 0);
                if (base <= 0) return 0;
                return base - (base * commissionPercent) / 100;
            };

            let earnings: { id?: string; enrolled_at?: string; amount_paid?: number; gst_amount?: number; coin_redeem_amount?: number; offer_discount_amount?: number }[] = [];
            if (courseIds.length > 0) {
                const { data: enrollments, error } = await db
                    .from('enrollments')
                    .select('id, enrolled_at, amount_paid, gst_amount, coin_redeem_amount, offer_discount_amount')
                    .in('course_id', courseIds);

                if (error) throw new Error(error.message);
                earnings = enrollments ?? [];
            }

            const now = new Date();

            // Sum faculty net revenue for enrollments with enrolled_at within [start, end)
            const earningsInRange = (start: Date, end: Date) => {
                let total = 0;
                for (const e of earnings) {
                    if (!e.enrolled_at) continue;
                    const d = new Date(e.enrolled_at);
                    if (d >= start && d < end) {
                        total += facultyNet(e);
                    }
                }
                return Math.round(total * 100) / 100;
            };

            const result: RevenueTrendPoint[] = [];

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
                        revenue: earningsInRange(start, end),
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
                        revenue: earningsInRange(start, end),
                    });
                }
            }

            else if (period === 'year') {
                // Last 12 months. Previous months come from the CREDITED records in
                // faculty_transactions (COURSE_SALE/BUNDLE_SALE) — permanent, so they
                // survive enrollment edits/deletes and never change when commission
                // changes. The current month adds live pending (unpaid this month).
                const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                const { data: saleTxns, error: saleTxnErr } = await db
                    .from('faculty_transactions')
                    .select('amount, transacted_at, payout_time_period, enrollment_id')
                    .eq('faculty_id', facultyId)
                    .in('type', ['COURSE_SALE', 'BUNDLE_SALE']);
                if (saleTxnErr) throw new Error(saleTxnErr.message);

                const buckets: { key: string; label: string; revenue: number }[] = [];
                for (let i = 11; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabels[d.getMonth()] ?? '', revenue: 0 });
                }
                const byKey = new Map(buckets.map(b => [b.key, b]));

                // Credited earnings → bucket by enrollment period (payout_time_period),
                // falling back to the processed date.
                for (const r of saleTxns ?? []) {
                    let key: string | null = null;
                    const parsed = r.payout_time_period ? new Date(`1 ${r.payout_time_period}`) : null;
                    if (parsed && !Number.isNaN(parsed.getTime())) key = `${parsed.getFullYear()}-${parsed.getMonth()}`;
                    else if (r.transacted_at) { const d = new Date(r.transacted_at); key = `${d.getFullYear()}-${d.getMonth()}` }
                    if (key && byKey.has(key)) byKey.get(key)!.revenue += Number(r.amount ?? 0);
                }

                // Current-month pending (unpaid this-month enrollments) at current rate
                const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
                const { data: pendEnr } = await db
                    .from('enrollments')
                    .select('id, amount_paid, gst_amount, coin_redeem_amount, offer_discount_amount')
                    .eq('faculty_id', facultyId).eq('is_bundle_enrollment', false).eq('payment_status', 'SUCCESS').gt('amount_paid', 0)
                    .gte('enrolled_at', thisMonthStart).lt('enrolled_at', nextMonthStart);

                const paidIds = new Set((saleTxns ?? []).map(r => r.enrollment_id).filter(Boolean));
                let pending = 0;
                for (const e of pendEnr ?? []) {
                    if (paidIds.has(e.id)) continue;
                    const base = (e.amount_paid ?? 0) - (e.gst_amount ?? 0)
                        + (e.coin_redeem_amount ?? 0) + (e.offer_discount_amount ?? 0);
                    if (base > 0) pending += base - base * commissionPercent / 100;
                }
                const curKey = `${now.getFullYear()}-${now.getMonth()}`;
                if (byKey.has(curKey)) byKey.get(curKey)!.revenue += pending;

                result.push(...buckets.map(b => ({ label: b.label, revenue: Math.round(b.revenue * 100) / 100 })));
            }

            return result;

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    /**
     * Revenue Source split (Bundles vs Individual Courses) for a single faculty.
     *
     * A faculty's earned revenue is recorded per sale in faculty_transactions
     * (see enrollment-payout-workflow.md §8):
     *   COURSE_SALE.amount → faculty share from a single course purchase (individual)
     *   BUNDLE_SALE.amount → faculty share from a bundle purchase          (bundles)
     *
     * The split is the share of each toward the faculty's total earned revenue.
     * Percentages are rounded so they always sum to 100.
     */
    getFacultyRevenueSource: async (facultyId: string) => {
        try {
            const db = supabase;

            // Faculty net revenue = (amount_paid - GST + admin-funded discounts)
            // after the platform commission.
            // Mirrors getFacultyRevenueTrends / enrollment-payout-workflow.md §3.
            const commissionPercent = await getCommissionPercentForFaculty(facultyId);
            const facultyShareRatio = 1 - commissionPercent / 100;
            const facultyNet = (e: { amount_paid?: number; gst_amount?: number; coin_redeem_amount?: number; offer_discount_amount?: number }) => {
                const base = Number(e.amount_paid ?? 0) - Number(e.gst_amount ?? 0)
                    + Number(e.coin_redeem_amount ?? 0) + Number(e.offer_discount_amount ?? 0);
                if (base <= 0) return 0;
                return base * facultyShareRatio;
            };

            // Individual (single course) enrollments
            const { data: singleEnrollments, error: singleError } = await db
                .from('enrollments')
                .select('amount_paid, gst_amount, coin_redeem_amount, offer_discount_amount')
                .eq('faculty_id', facultyId)
                .eq('is_bundle_enrollment', false);

            if (singleError) throw new Error(singleError.message);

            // Bundle enrollments (no GST column — gross is the bundle amount)
            const { data: bundleEnrollments, error: bundleError } = await db
                .from('bundle_enrollments')
                .select('amount_paid, coin_redeem_amount, offer_discount_amount')
                .eq('faculty_id', facultyId);

            if (bundleError) throw new Error(bundleError.message);

            // Paise precision (2dp) — never round money to whole rupees.
            const individualAmount = Math.round(
                (singleEnrollments ?? []).reduce((sum, e) => sum + facultyNet(e), 0) * 100,
            ) / 100;
            const bundlesAmount = Math.round(
                (bundleEnrollments ?? []).reduce((sum, b) => sum + facultyNet(b), 0) * 100,
            ) / 100;

            const total = individualAmount + bundlesAmount;

            const bundlesPercent = total > 0 ? Math.round((bundlesAmount / total) * 100) : 0;
            const individualPercent = total > 0 ? 100 - bundlesPercent : 0;

            return {
                bundlesPercent,
                individualPercent,
                bundlesAmount,
                individualAmount,
                totalAmount: total,
            };

        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    /**
     * Paginated list of a faculty's PAYOUT transactions (see
     * enrollment-payout-workflow.md §8 — the PAYOUT row is the actual money
     * transferred to the faculty for a payout batch).
     *
     * Filters:
     *   search    → matches the transaction_id (the only text field on a payout)
     *   startDate → payouts with transacted_at on/after this day (YYYY-MM-DD)
     *   endDate   → payouts with transacted_at on/before this day (YYYY-MM-DD)
     */
    getFacultyTransactions: async (
        facultyId: string,
        {
            limit = 10,
            offset = 0,
            search = '',
            startDate = '',
            endDate = '',
        }: {
            limit?: number
            offset?: number
            search?: string
            startDate?: string
            endDate?: string
        } = {},
    ) => {
        try {
            // Shared filter builder — applied to both the count and the page query
            const applyFilters = (query: any) => {
                let q = query
                    .eq('faculty_id', facultyId)
                    .eq('type', 'PAYOUT');

                const term = search.trim();
                if (term) q = q.ilike('transaction_id', `%${term}%`);

                if (startDate) {
                    q = q.gte('transacted_at', new Date(`${startDate}T00:00:00`).toISOString());
                }
                if (endDate) {
                    q = q.lte('transacted_at', new Date(`${endDate}T23:59:59.999`).toISOString());
                }

                return q;
            };

            // 1. Total count for the current filters (drives pagination)
            const { count, error: countError } = await applyFilters(
                supabase.from('faculty_transactions').select('*', { count: 'exact', head: true }),
            );

            if (countError) throw new Error(countError.message);

            // 2. Current page of payouts, newest first
            const { data, error } = await applyFilters(
                supabase
                    .from('faculty_transactions')
                    .select('id, transaction_id, amount, gross_amount, status, transacted_at'),
            )
                .order('transacted_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw new Error(error.message);

            const formatRevenue = (amount: number): string => {
                if (amount >= 100000) {
                    return `₹${(amount / 100000).toFixed(1)} L`;
                }
                return `₹${amount.toLocaleString('en-IN')}`;
            };

            const formatDate = (iso: string | null): string => {
                if (!iso) return '—';
                const d = new Date(iso);
                if (Number.isNaN(d.getTime())) return '—';
                return d.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                });
            };

            const items: FacultyPayoutTransaction[] = (data ?? []).map((row: any) => ({
                id: row.id,
                transactionId: row.transaction_id ?? row.id,
                amount: row.amount ?? 0,
                amountDisplay: formatRevenue(row.amount ?? 0),
                grossAmount: row.gross_amount ?? 0,
                grossDisplay: formatRevenue(row.gross_amount ?? 0),
                status: (row.status ?? 'PENDING') as FacultyPayoutStatus,
                date: row.transacted_at ?? null,
                dateDisplay: formatDate(row.transacted_at ?? null),
            }));

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




}