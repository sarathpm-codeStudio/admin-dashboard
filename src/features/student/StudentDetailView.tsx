import { motion, useReducedMotion } from 'framer-motion'

import { useEffect, useState, type ReactNode } from 'react'

import { Navigate, useParams } from 'react-router-dom'

import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

import { DetailHeaderSkeleton, CardSkeleton } from '@/components/ui/DetailViewSkeleton'

import { SectionHeader } from '@/components/ui/SectionHeader'

import { SummaryStatsGrid } from '@/components/ui/SummaryStatsGrid'

import { EnrolledCoursesTable } from '@/features/student/components/EnrolledCoursesTable'

import { StudentProfileHeader } from '@/features/student/components/StudentProfileHeader'

import {

  getStudentById,

  mockStudentElena,

} from '@/features/student/data/mockStudentDetail'

import type { StudentDetail } from '@/features/student/data/mockStudentDetail'

import { getStudentStatItems } from '@/features/student/data/studentStatItems'

import { useGetStudentById, useGetStudentCourses } from '@/features/student/hooks/useStudentManagement'
import { useUpdateUserStatus } from '@/features/users/hooks/useUserManagement'

import { STUDENT_COURSES_PAGE_SIZE } from '@/features/student/utils/constants'



const sectionEase = [0.22, 1, 0.36, 1] as const



type AnimatedSectionProps = {

  index: number

  children: ReactNode

  className?: string

}



function formatJoinedDate(isoDate: string | undefined): string {

  if (!isoDate) return '—'

  return new Date(isoDate).toLocaleDateString('en-GB', {

    day: '2-digit',

    month: '2-digit',

    year: 'numeric',

  })

}



function AnimatedSection({ index, children, className }: AnimatedSectionProps) {

  const prefersReducedMotion = useReducedMotion()



  if (prefersReducedMotion) {

    return <div className={className}>{children}</div>

  }



  return (

    <motion.div

      initial={{ opacity: 0, y: 16 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.45, delay: index * 0.08, ease: sectionEase }}

      className={className}

    >

      {children}

    </motion.div>

  )

}



export function StudentDetailView() {

  const { studentId } = useParams<{ studentId: string }>()

  const [page, setPage] = useState(1)


  
  const { data, isLoading, isError } = useGetStudentById(studentId ?? '')

  const {

    data: courses,

    isLoading: isLoadingCourses,

    isError: isErrorCourses,

  } = useGetStudentCourses(studentId ?? '', page, STUDENT_COURSES_PAGE_SIZE, '')

  const { mutateAsync: updateStatus } = useUpdateUserStatus(studentId ?? '')

  useEffect(() => {

    setPage(1)

  }, [studentId])



  if (!studentId) {

    return <Navigate to="/users" replace />

  }



  if (isLoading) {

    return (

      <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto">

        <DetailHeaderSkeleton />

        <CardSkeleton />

      </div>

    )

  }



  if (isError || !data?.student) {

    return <Navigate to="/users" replace />

  }



  const { student: profile, lastActive, analytics } = data

  const base = getStudentById(studentId) ?? mockStudentElena



  const display =

    [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||

    profile.email?.split('@')[0]?.replace(/[._]/g, ' ') ||

    base.name



  const student: StudentDetail = {

    ...base,

    id: profile.id,

    studentId: profile.account_id ?? profile.id,

    name: display,

    avatarUrl: profile.avatar_url || undefined,

    email: profile.email ?? base.email,

    phone: profile.phone ?? base.phone,

    joined: formatJoinedDate(profile.created_at),

    recentActive: lastActive.display,

    stats: {

      coursesEnrolled: analytics.courseEnrolled,

      testScore: analytics.testScore,

      totalCoins: analytics.totalCoins,

      totalSpend: analytics.totalSpend.display,

    },

  }



  if (isErrorCourses) {

    return <Navigate to="/users" replace />

  }



  const coursesData = courses?.data ?? []

  const totalCount = courses?.total ?? 0

  const totalPages = Math.max(1, Math.ceil(totalCount / STUDENT_COURSES_PAGE_SIZE))



  return (

    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto">

      <AnimatedSection index={0}>

        <Breadcrumbs

          separator="slash"

          items={[

            { label: 'Back', to: '/users' },

            { label: student.name },

          ]}

        />

      </AnimatedSection>



      <AnimatedSection index={1}>

        <StudentProfileHeader
          student={student}
          isSuspended={profile.is_suspended === true}
          onBlock={async () => { await updateStatus('SUSPENDED') }}
          onUnblock={async () => { await updateStatus('ACTIVATE') }}
        />

      </AnimatedSection>



      <AnimatedSection index={2}>

        <SummaryStatsGrid items={getStudentStatItems(analytics)} size="compact" />

      </AnimatedSection>



      <AnimatedSection index={3} className="space-y-4">

        <SectionHeader title="Enrolled Courses" titleSize="card" />

        <EnrolledCoursesTable

          courses={coursesData}

          totalCount={totalCount}

          page={page}

          totalPages={totalPages}

          onPageChange={setPage}

          isLoading={isLoadingCourses}

        />

      </AnimatedSection>

    </div>

  )

}


