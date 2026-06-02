import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { HelpFab } from '@/components/layout/HelpFab'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { SummaryStatsGrid } from '@/components/ui/SummaryStatsGrid'
import { FacultyAdminNoteCard } from '@/features/faculty/components/FacultyAdminNoteCard'
import { FacultyBioCard } from '@/features/faculty/components/FacultyBioCard'
import { FacultyCertificatesCard } from '@/features/faculty/components/FacultyCertificatesCard'
import { FacultyProfileHeader } from '@/features/faculty/components/FacultyProfileHeader'
import { FacultyQualificationsCard } from '@/features/faculty/components/FacultyQualificationsCard'
import { FacultyRecentActivityCard } from '@/features/faculty/components/FacultyRecentActivityCard'
import { getFacultyStatItems } from '@/features/faculty/data/facultyStatItems'
import { getFacultyById } from '@/features/faculty/data/mockFacultyDetail'

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

export function FacultyDetailView() {
  const { facultyId } = useParams<{ facultyId: string }>()
  const faculty = facultyId ? getFacultyById(facultyId) : undefined

  if (!faculty) {
    return <Navigate to="/users" replace />
  }

  return (
    <div className="space-y-6">
      <AnimatedSection index={0}>
        <Breadcrumbs
          items={[
            { label: 'Faculty', to: '/users' },
            { label: `${faculty.name} Profile` },
          ]}
        />
      </AnimatedSection>

      <AnimatedSection index={1}>
        <FacultyProfileHeader faculty={faculty} />
      </AnimatedSection>

      <AnimatedSection index={2}>
        <SummaryStatsGrid items={getFacultyStatItems(faculty)} size="compact" />
      </AnimatedSection>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <AnimatedSection index={3} className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2 sm:items-stretch">
            <FacultyQualificationsCard qualifications={faculty.qualifications} />
            <FacultyBioCard bio={faculty.bio} />
          </div>
          <FacultyRecentActivityCard items={faculty.recentActivity} />
        </AnimatedSection>

        <AnimatedSection index={4} className="flex flex-col gap-6">
          <FacultyCertificatesCard certificates={faculty.certificates} />
          <FacultyAdminNoteCard />
        </AnimatedSection>
      </div>

      <AnimatedSection index={5} className="grid gap-6 lg:grid-cols-3">
        <div className="hidden lg:block lg:col-span-2" aria-hidden />
        <div className="flex justify-end pt-4">
          <HelpFab />
        </div>
      </AnimatedSection>
    </div>
  )
}
