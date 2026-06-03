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

const sectionEase = [0.22, 1, 0.36, 1] as const

type AnimatedSectionProps = {
  index: number
  children: ReactNode
  className?: string
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
  const student = studentId ? getStudentById(studentId) : undefined

  if (!student) {
    return <Navigate to="/users" replace />
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
