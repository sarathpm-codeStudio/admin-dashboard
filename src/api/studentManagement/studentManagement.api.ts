import { supabase } from "@/config/supabase"

export type Student = {
    id: string
    avatar_url: string
    last_active: string
    email: string
    created_at: string
    phone: string
}
export const studentManagementFunctions = {
   
    getStudentById: async (studentId: string) => {
        try {

            // Add this to your function temporarily
const { data: { user }, error: authError } = await supabase.auth.getUser();
console.log('current user:', user);
console.log('user metadata:', user?.user_metadata);
console.log('role:', user?.user_metadata?.role);
            // 1. Student profile
            const { data: student, error: studentError } = await supabase
                .from('profiles')
                .select('id, account_id, first_name, last_name, email, phone, role, avatar_url, created_at, coin_balance, is_suspended')
                .eq('role', 'STUDENT')
                .eq('id', studentId)
                .single();
    
            if (studentError) throw new Error(studentError.message);
            if (!student)     throw new Error('Student not found');
    
            // 2. Last active — latest session
            const { data: lastSession } = await supabase
                .from('usage_sessions')
                .select('started_at, platform, screen_name')
                .eq('user_id', studentId)
                .order('started_at', { ascending: false })
                .limit(1)
                .maybeSingle();
    
            const formatLastActive = (dateStr: string | null): string => {
                if (!dateStr) return 'Never';
                const date      = new Date(dateStr);
                const now       = new Date();
                const isToday   = date.toDateString() === now.toDateString();
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                const isYesterday = date.toDateString() === yesterday.toDateString();
                const timeStr = date.toLocaleTimeString('en-US', {
                    hour:   '2-digit',
                    minute: '2-digit',
                    hour12: true,
                });
                if (isToday)     return `Today ${timeStr}`;
                if (isYesterday) return `Yesterday ${timeStr}`;
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day:   'numeric',
                }) + `, ${timeStr}`;
            };
    
            // 3. Course enrolled count
            const { count: courseEnrolled, error: enrollError } = await supabase
                .from('enrollments')
                .select('*', { count: 'exact', head: true })
                .eq('student_id', studentId);

                console.log('studentId:>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', studentId);
                console.log('courseEnrolled count:', courseEnrolled);
                console.log('enrollError:', enrollError);
    
            if (enrollError) throw new Error(enrollError.message);
    
            // 4. Test score — avg correct rate across all completed attempts
            const { data: attempts, error: attemptError } = await supabase
                .from('test_attempts')
                .select('correct_count, total_questions')
                .eq('student_id', studentId)
                .not('submitted_at', 'is', null);
    
            if (attemptError) throw new Error(attemptError.message);
    
            const totalCorrect   = attempts?.reduce((sum, a) => sum + (a.correct_count   ?? 0), 0) ?? 0;
            const totalQuestions = attempts?.reduce((sum, a) => sum + (a.total_questions  ?? 0), 0) ?? 0;
            const testScore      = totalQuestions > 0
                ? parseFloat(((totalCorrect / totalQuestions) * 100).toFixed(1))
                : 0;
    
            // 5. Total coins — sum of CREDIT minus DEBIT
            const { data: coinData, error: coinError } = await supabase
                .from('coin_transactions')
                .select('coin_count, type')
                .eq('user_id', studentId);
    
            if (coinError) throw new Error(coinError.message);
    
            const totalCoins = coinData?.reduce((sum, c) => {
                return c.type === 'CREDIT'
                    ? sum + (c.coin_count ?? 0)
                    : sum - (c.coin_count ?? 0);
            }, 0) ?? 0;
    
            // 6. Total spend — sum of amount_paid from enrollments
            const { data: spendData, error: spendError } = await supabase
                .from('enrollments')
                .select('amount_paid')
                .eq('student_id', studentId);
    
            if (spendError) throw new Error(spendError.message);
    
            const totalSpend = spendData?.reduce(
                (sum, e) => sum + (e.amount_paid ?? 0), 0
            ) ?? 0;
    
            

            return {
                // Student profile
                student,
    
                // Last active
                lastActive: {
                    display:    formatLastActive(lastSession?.started_at ?? null),
                    raw:        lastSession?.started_at  ?? null,
                    platform:   lastSession?.platform    ?? null,
                    screenName: lastSession?.screen_name ?? null,
                },
    
                // Analytics cards
                analytics: {
                    courseEnrolled: courseEnrolled ?? 0,              // "03"
                    testScore:      `${testScore}%`,                  // "94.8%"
                    totalCoins:     totalCoins,                       // "1,200"
                    totalSpend: {
                        amount:  totalSpend,
                        display: `₹${totalSpend.toLocaleString('en-IN')}`, // "₹12500"
                    },
                },
            };
    
        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    getStudentCourses: async ({
        studentId,
        page,
        limit,
        search,
    }: {
        studentId: string;
        page: number;
        limit: number;
        search: string;
    }) => {
        try {
            const from = (page - 1) * limit;
            const to = from + limit - 1;

            const { data: student, error: studentError } = await supabase
                .from("profiles")
                .select("id, first_name, last_name, avatar_url")
                .eq("id", studentId)
                .single();

            if (studentError) throw new Error(studentError.message);

            let enrollmentQuery = supabase
                .from("enrollments")
                .select(
                    `
        course:courses!enrollments_course_id_fkey (
          id,
          title,
          faculty_id
        )
      `,
                    { count: "exact" }
                )
                .eq("student_id", studentId)

            if (search) {
                const { data: matchingCourses, error: courseSearchError } =
                    await supabase
                        .from("courses")
                        .select("id")
                        .ilike("title", `%${search}%`);

                if (courseSearchError) throw new Error(courseSearchError.message);

                const matchingCourseIds = matchingCourses?.map((c) => c.id) ?? [];
                if (matchingCourseIds.length === 0) {
                    return { student, data: [], total: 0 };
                }

                enrollmentQuery = enrollmentQuery.in(
                    "course_id",
                    matchingCourseIds
                );
            }

            const { data: enrollments, error, count } = await enrollmentQuery
                .range(from, to)
                .order("created_at", { ascending: false });

            if (error) throw new Error(error.message);
            if (!enrollments || enrollments.length === 0) {
                return { student, data: [], total: count ?? 0 };
            }

            const courseIds = enrollments.map((e: any) => e.course.id);

            const { data: courseProgressList, error: progressError } =
                await supabase
                    .from("course_progress")
                    .select(
                        "course_id, total_materials, completed_materials, completion_pct, is_completed, started_at, completed_at"
                    )
                    .eq("student_id", studentId)
                    .in("course_id", courseIds);

            if (progressError) throw new Error(progressError.message);

            const progressByCourseId: Record<string, any> = {};
            courseProgressList?.forEach((row) => {
                progressByCourseId[row.course_id] = row;
            });

            const { data: tests, error: testsError } = await supabase
                .from("tests")
                .select("id, course_id")
                .in("course_id", courseIds)
                .eq("is_deleted", false);

            if (testsError) throw new Error(testsError.message);

            const testIds = tests?.map((t) => t.id) ?? [];
            const attemptsByTestId: Record<string, any[]> = {};

            if (testIds.length > 0) {
                const { data: attempts, error: attemptsError } = await supabase
                    .from("test_attempts")
                    .select(
                        "test_id, correct_count, total_questions, submitted_at, started_at"
                    )
                    .eq("student_id", studentId)
                    .in("test_id", testIds);

                if (attemptsError) throw new Error(attemptsError.message);

                attempts?.forEach((attempt) => {
                    const existing = attemptsByTestId[attempt.test_id] ?? [];
                    existing.push(attempt);
                    attemptsByTestId[attempt.test_id] = existing;
                });
            }

            const pickBestCompletedAttempt = (attempts: any[]) => {
                const completed = attempts.filter((a) => a.submitted_at !== null);
                if (completed.length === 0) return null;

                return completed.reduce((best, current) => {
                    const bestScore = best.correct_count ?? 0;
                    const currentScore = current.correct_count ?? 0;

                    if (currentScore > bestScore) return current;

                    if (currentScore === bestScore) {
                        const bestTime =
                            new Date(best.submitted_at).getTime() -
                            new Date(best.started_at).getTime();
                        const currentTime =
                            new Date(current.submitted_at).getTime() -
                            new Date(current.started_at).getTime();
                        return currentTime < bestTime ? current : best;
                    }

                    return best;
                });
            };

            const testScoreByCourseId: Record<
                string,
                { correct: number; total: number }
            > = {};

            tests?.forEach((test) => {
                const bestAttempt = pickBestCompletedAttempt(
                    attemptsByTestId[test.id] ?? []
                );
                if (!bestAttempt) return;

                const courseTestStats = testScoreByCourseId[test.course_id] ?? {
                    correct: 0,
                    total: 0,
                };
                courseTestStats.correct += bestAttempt.correct_count ?? 0;
                courseTestStats.total += bestAttempt.total_questions ?? 0;
                testScoreByCourseId[test.course_id] = courseTestStats;
            });

            const courses = enrollments.map((item: any) => {
                const course = item.course;
                const courseProgress = progressByCourseId[course.id];

                const total_materials = courseProgress?.total_materials ?? 0;
                const completed_materials =
                    courseProgress?.completed_materials ?? 0;
                const progress = courseProgress
                    ? Math.round(Number(courseProgress.completion_pct))
                    : 0;

                const testStats = testScoreByCourseId[course.id];
                const test_score =
                    testStats && testStats.total > 0
                        ? Math.round((testStats.correct / testStats.total) * 100)
                        : 0;

                let status: "Completed" | "Active" | "Not start";
                if (courseProgress?.is_completed) {
                    status = "Completed";
                } else if (courseProgress?.started_at) {
                    status = "Active";
                } else {
                    status = "Not start";
                }

                return {
                    id: course.id,
                    title: course.title,
                    total_materials,
                    completed_materials,
                    progress,
                    status,
                    test_score,
                };
            });

            return {
                // student,
                data: courses,
                total: count ?? 0,
            };

        } catch (error: any) {
            throw new Error(error.message);
        }
    },



}