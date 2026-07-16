import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { HelpFab } from '@/components/layout/HelpFab'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { CardSkeleton, DetailHeaderSkeleton } from '@/components/ui/DetailViewSkeleton'
import { SummaryStatsGrid } from '@/components/ui/SummaryStatsGrid'
import { FacultyAdminNoteCard } from '@/features/faculty/components/FacultyAdminNoteCard'
import { FacultyBioCard } from '@/features/faculty/components/FacultyBioCard'
import { FacultyCertificatesCard } from '@/features/faculty/components/FacultyCertificatesCard'
import { FacultyIdVerificationCard } from '@/features/faculty/components/FacultyIdVerificationCard'
import { FacultyProfileHeader } from '@/features/faculty/components/FacultyProfileHeader'
import { FacultyRejectionWidget } from '@/features/faculty/components/FacultyRejectionWidget'
import { FacultyQualificationsCard } from '@/features/faculty/components/FacultyQualificationsCard'
import { getFacultyStatItems } from '@/features/faculty/data/facultyStatItems'
import {
  FacultyDetail,
  type FacultyCertificate,
} from '@/features/faculty/data/mockFacultyDetail'
import { useGetFacultyAcademicProfile, useGetFacultyById } from './hooks/useFacultyManagement'
import { useUpdateUserStatus } from '../users/hooks/useUserManagement'

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

function FacultyDetailSkeleton() {
  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto">
      <DetailHeaderSkeleton />

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="flex flex-col gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}

export function FacultyDetailView() {
  const { facultyId } = useParams<{ facultyId: string }>()

  const { data, isLoading, isError } = useGetFacultyById(facultyId ?? '')
  const { data: academicData, isLoading: isLoadingAcademic } = useGetFacultyAcademicProfile(facultyId ?? '')
  const { mutateAsync: updateStatus } = useUpdateUserStatus(facultyId ?? '')

  if (!facultyId) {
    return <Navigate to="/users" replace />
  }
  if (isLoading) {
    return <FacultyDetailSkeleton />
  }
  if (isError || !data) {
    return <div className="flex min-h-0 flex-1 items-center justify-center">
      <p className="text-sm text-nav">Error loading faculty...</p>
    </div>
  }
  const { faculty: profile, analytics, lastActive } = data

  // const base = getFacultyById(facultyId)
  const faculty: FacultyDetail = {
    // ...(base || {}),
    id: profile.id,
    name: profile.name || '',
    title: profile.job_title ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? '',
    avatarUrl: profile.avatar_url || undefined,
    bio: profile.bio ?? '',
    stats: {
      coursesCreated: analytics.coursesCreated.total,
      coursesNew: analytics.coursesCreated.newCount,
      totalStudents: analytics.totalStudents.total,
      studentsGrowthPercent: analytics.totalStudents.growth,
      totalRevenue: analytics.totalRevenue.display,
      pendingPayout: analytics.pendingPayout.display,
      avgRating: analytics.avgRating.rating,
      reviewCount: analytics.avgRating.totalReviews,
    },
    recentActivity: [],
    recentActive: lastActive?.display ?? 'Never',
    certificates: [],
    qualifications: [],
    status: profile.is_suspended
      ? 'suspended'
      : profile.account_verified === 'APPROVED'
        ? 'active'
        : profile.account_verified === 'REJECTED'
          ? 'rejected'
          : profile.account_verified === 'RESUBMITTED'
            ? 'resubmitted'

            : 'pending',
    initials: '',
    documentType: profile?.document?.document_type,
    documentUrl: profile?.document?.document_url,


  }

  const qualificationsFromApi = academicData?.academicProfiles?.map((item) => {
    const parts = [item.field_of_study].filter(Boolean)
    return parts.length > 0 ? parts.join(' - ') : null
  })
    .filter((q): q is string => Boolean(q)) ?? []
  const qualifications = qualificationsFromApi.length > 0 ? qualificationsFromApi : profile.qualification ? profile.qualification.split(',').map((s: string) => s.trim()).filter(Boolean) : []

  const certificatesFromApi: FacultyCertificate[] =
    academicData?.academicProfiles
      ?.filter((item) => item.document_url)
      .map((item) => ({
        id: item.id,
        label: (`${item.field_of_study} Certificate`).toUpperCase(),
        fileName: item.document_url!.split('/').pop() ?? 'document',
        fileUrl: item.document_url,
      })) ?? []
  const certificates: FacultyCertificate[] =
    certificatesFromApi.length > 0 ? certificatesFromApi : []

  console.log('academicData', academicData)
  console.log('qualifications', qualifications)
  console.log('certificates', certificates)

  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto">
      <AnimatedSection index={0}>
        <Breadcrumbs
          separator="slash"
          items={[
            { label: 'Back', to: '/users' },
            { label: faculty.name },
          ]}
        />
      </AnimatedSection>

      <AnimatedSection index={1}>
        <FacultyProfileHeader
          faculty={faculty}
          isSuspended={profile.is_suspended}
          accountVerified={profile.account_verified}
          onApprove={async () => { await updateStatus('APPROVED') }}
          onReject={async ({ reasons, note }) => {
            await updateStatus({
              status: 'REJECTED',
              rejectReason: reasons.join(', '),
              adminNote: note,
            })
          }}
          onSuspend={async () => { await updateStatus('SUSPENDED') }}
          onActivate={async () => { await updateStatus('ACTIVATE') }}
        />
      </AnimatedSection>

      <AnimatedSection index={2}>
        <SummaryStatsGrid items={getFacultyStatItems(analytics, facultyId ?? '', profile?.name)} size="compact" />
      </AnimatedSection>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <AnimatedSection index={3} className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            {isLoadingAcademic ? (
              <CardSkeleton />
            ) : (
              <FacultyQualificationsCard qualifications={qualifications} />
            )}
            <FacultyBioCard bio={faculty.bio} />
          </div>
          <FacultyIdVerificationCard document={profile?.document ?? null} />

          {/* <FacultyRecentActivityCard items={faculty.recentActivity} /> */}

        </AnimatedSection>

        <AnimatedSection index={4} className="flex flex-col gap-6">
          {isLoadingAcademic ? (
            <CardSkeleton />
          ) : (
            <FacultyCertificatesCard certificates={certificates} />
          )}
          <FacultyAdminNoteCard facultyId={facultyId ?? ''} adminNote={profile?.admin_note} />
        </AnimatedSection>
      </div>

      <AnimatedSection index={5} className="grid gap-6 lg:grid-cols-3">
        <div className="hidden lg:block lg:col-span-2" aria-hidden />
        <div className="flex justify-end pt-4">
          <HelpFab />
        </div>
      </AnimatedSection>

      {profile.account_verified === 'REJECTED' ? (
        <FacultyRejectionWidget reason={profile.acc_reject_reason} />
      ) : null}
    </div>
  )
}
