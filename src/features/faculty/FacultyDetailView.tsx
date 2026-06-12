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
import {
  FacultyDetail,
  getFacultyById,
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

export function FacultyDetailView() {
  const { facultyId } = useParams<{ facultyId: string }>()

  const { data, isLoading, isError } = useGetFacultyById(facultyId ?? '')
  const{data:academicData, isLoading: isLoadingAcademic} = useGetFacultyAcademicProfile(facultyId ?? '')
   const{mutateAsync: updateStatus}=  useUpdateUserStatus(facultyId ?? '') 

  if (!facultyId) {
    return <Navigate to="/users" replace />
  }
  if(isLoading){
    return <div className="flex min-h-0 flex-1 items-center justify-center">
      <p className="text-sm text-nav">Loading faculty...</p>
    </div>
  }
  if(isError || !data){
    return <div className="flex min-h-0 flex-1 items-center justify-center">
      <p className="text-sm text-nav">Error loading faculty...</p>
    </div>
  }
  const { faculty: profile, analytics } = data

  const base = getFacultyById(facultyId)
  const faculty: FacultyDetail = {
    ...(base || {}),
    id: profile.id,
    name: profile.name || base?.name || '',
    title: profile.job_title ?? base?.title ,
    email: profile.email ?? base?.email ,
    phone: profile.phone ?? base?.phone ,
    avatarUrl: profile.avatar_url || undefined,
    bio: profile.bio ?? base?.bio ,
    stats: {
      coursesCreated: analytics.coursesCreated.total,
      coursesNew: analytics.coursesCreated.newCount,
      totalStudents: analytics.totalStudents.total,
      studentsGrowthPercent: analytics.totalStudents.growth,
      totalRevenue: analytics.totalRevenue.display,
      avgRating: analytics.avgRating.rating,
      reviewCount: analytics.avgRating.totalReviews,
    },
    recentActivity: base?.recentActivity || [],
    certificates: base?.certificates || [],
    qualifications: base?.qualifications || [],
    status: profile.is_suspended
      ? 'suspended'
      : profile.account_verified === 'APPROVED'
        ? 'active'
        : profile.account_verified === 'REJECTED'
          ? 'rejected'
          : 'pending',
    initials: base?.initials || '',

    } 

const qualificationsFromApi = academicData?.academicProfiles?.map((item) =>{const parts=[item.field_of_study].filter(Boolean)
  return parts.length > 0 ? parts.join(' - ') : null })
  .filter((q): q is string => Boolean(q)) ?? []
  const qualifications=qualificationsFromApi.length > 0 ? qualificationsFromApi : profile.qualification ? profile.qualification.split(',').map((s: string) => s.trim()).filter(Boolean) : base?.qualifications ?? []

  const certificatesFromApi: FacultyCertificate[] =
  academicData?.academicProfiles
    ?.filter((item) => item.document_url)
    .map((item) => ({
      id: item.id,
      label: ( `${item.field_of_study} Certificate` ).toUpperCase(),
      fileName:  item.document_url!.split('/').pop() ?? 'document',
      fileUrl: item.document_url,
    })) ?? []
const certificates: FacultyCertificate[] =
  certificatesFromApi.length > 0 ? certificatesFromApi : base?.certificates ?? []

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
          onReject={async () => { await updateStatus('REJECTED') }}
          onSuspend={async () => { await updateStatus('SUSPENDED') }}
          onActivate={async () => { await updateStatus('ACTIVATE') }}
        />  
      </AnimatedSection>

      <AnimatedSection index={2}>
        <SummaryStatsGrid items={getFacultyStatItems(analytics, facultyId ?? '')} size="compact" />
      </AnimatedSection>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <AnimatedSection index={3} className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            <FacultyQualificationsCard qualifications={qualifications} />
            <FacultyBioCard bio={faculty.bio} />
          </div>
          <FacultyRecentActivityCard items={faculty.recentActivity} />
        </AnimatedSection>

        <AnimatedSection index={4} className="flex flex-col gap-6">
          <FacultyCertificatesCard certificates={certificates} />
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
