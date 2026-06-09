import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SummaryStatsGrid } from '@/components/ui/SummaryStatsGrid'
import { EnrolledCoursesTable } from '@/features/student/components/EnrolledCoursesTable'
import { StudentProfileHeader } from '@/features/student/components/StudentProfileHeader'
import { getStudentById } from '@/features/student/data/mockStudentDetail'
import { getStudentStatItems } from '@/features/student/data/studentStatItems'
import { useGetStudentById } from '@/features/student/hooks/useStudentManagement'

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

function formatRecentActive(isoDate: string | undefined): string {
  if (!isoDate) return '—'
  const date = new Date(isoDate)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return isToday ? `Today ${time.toLowerCase()}` : date.toLocaleDateString('en-US')
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
  const { data, isLoading, isError } = useGetStudentById(studentId ?? '')

  if (!studentId) {
    return <Navigate to="/users" replace />
  }

  if (isLoading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <p className="text-sm text-nav">Loading student...</p>
      </div>
    )
  }

  const apiStudent = Array.isArray(data) ? data[0] : undefined
  const base = getStudentById(studentId)

  if (isError || !apiStudent || !base) {
    return <Navigate to="/users" replace />
  }

  const student = {
    ...base,
    id: apiStudent.account_id,
    studentId: apiStudent.account_id,
    avatarUrl: apiStudent.avatar_url || undefined,
    name:
      apiStudent.email?.split('@')[0]?.replace(/[._]/g, ' ') ?? base.name,
    email: apiStudent.email ?? base.email,
    phone: apiStudent.phone ?? base.phone,
    joined: formatJoinedDate(apiStudent.created_at),
    recentActive: formatRecentActive(apiStudent.last_active),
  }

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
        <StudentProfileHeader student={student} />
      </AnimatedSection>

      <AnimatedSection index={2}>
        <SummaryStatsGrid items={getStudentStatItems(student)} size="compact" />
      </AnimatedSection>

      <AnimatedSection index={3} className="space-y-4">
        <SectionHeader title="Enrolled Courses" titleSize="card" />
        <EnrolledCoursesTable courses={student.enrolledCourses} />
      </AnimatedSection>
    </div>
  )
}
