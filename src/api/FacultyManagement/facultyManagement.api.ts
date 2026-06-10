

import { supabase } from "@/config/supabase"


export const facultyManagementFunctions={

    getFacultyById: async (facultyId: string) => {
        try {
    
            // 1. Faculty profile
            const { data: faculty, error: facultyError } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, email, phone, avatar_url, bio, account_verified, is_suspended, qualification, job_title, created_at')
                .eq('role', 'FACULTY')
                .eq('id', facultyId)
                .single();
    
            if (facultyError) throw new Error(facultyError.message);
            if (!faculty)     throw new Error('Faculty not found');
    
            // 2. Courses created
            const { data: courses, error: coursesError } = await supabase
                .from('courses')
                .select('id, created_at')
                .eq('faculty_id', facultyId)
                .eq('is_deleted', false);
    
            if (coursesError) throw new Error(coursesError.message);
    
            const courseIds      = courses?.map(c => c.id) ?? [];
            const coursesCreated = courseIds.length;
    
            const now            = new Date();
            const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    
            const newCoursesThisMonth = courses?.filter(
                c => new Date(c.created_at!) >= new Date(thisMonthStart)
            ).length ?? 0;
    
            // 3. Total students — unique students enrolled in faculty courses
            let totalStudents       = 0;
            let totalStudentsGrowth = 0;
    
            if (courseIds.length > 0) {
                const { data: enrollments, error: enrollError } = await supabase
                    .from('enrollments')
                    .select('student_id, created_at')
                    .in('course_id', courseIds);
    
                if (enrollError) throw new Error(enrollError.message);
    
                const uniqueStudents = new Set(enrollments?.map(e => e.student_id) ?? []);
                totalStudents        = uniqueStudents.size;
    
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
                    id:               faculty.id,
                    name:             `${faculty.first_name ?? ''} ${faculty.last_name ?? ''}`.trim(),
                    email:            faculty.email,
                    phone:            faculty.phone,
                    avatar_url:       faculty.avatar_url,
                    bio:              faculty.bio,
                    qualification:    faculty.qualification,
                    job_title:        faculty.job_title,
                    status:           faculty.is_suspended ? 'SUSPENDED' : faculty.account_verified,
                    is_suspended:     faculty.is_suspended,
                    account_verified: faculty.account_verified,
                },
    
                // Analytics cards
                analytics: {
                    coursesCreated: {
                        total:    coursesCreated,
                        newCount: newCoursesThisMonth,
                        display:  newCoursesThisMonth > 0
                            ? `+${newCoursesThisMonth} New`
                            : null,
                    },
    
                    totalStudents: {
                        total:   totalStudents,
                        growth:  totalStudentsGrowth,
                        display: totalStudentsGrowth >= 0
                            ? `↑ ${totalStudentsGrowth}%`
                            : `↓ ${Math.abs(totalStudentsGrowth)}%`,
                    },
    
                    totalRevenue: {
                        amount:  totalRevenue,
                        display: formatRevenue(totalRevenue),
                    },
    
                    avgRating: {
                        rating:        avgRating,
                        totalReviews,
                        display:       `${avgRating}`,
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
            const { data: academicProfiles, error: academicError  } = await supabase
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
                document:         document ?? null,        // single
            };
    
        } catch (error: any) {
            throw new Error(error.message);
        }
    },
       

}