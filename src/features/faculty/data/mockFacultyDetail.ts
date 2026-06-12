import { Calendar, ClipboardCheck, FileUp, MessageSquare } from 'lucide-react'
import type { ActivityListItemData } from '@/components/ui/ActivityList'

import activityOverlayImage from '@/asset/image/Overlay.png'
import facultyProfileAvatar from '@/asset/image/John Smith Profile.png'
import { ACTIVITY_EDIT_ICON_COLOR } from '@/features/faculty/data/activityIconColors'

export type FacultyStatus = 'active' | 'pending' | 'rejected' | 'suspended'

export type FacultyCertificate = {
  id: string
  label: string
  fileName: string
  fileUrl: string
}

export type FacultyDetail = {
  id: string
  name: string
  title: string
  email: string
  phone: string
  status: FacultyStatus
  avatarUrl?: string
  initials: string
  bio: string
  qualifications: string[]
  certificates: FacultyCertificate[]
  stats: {
    coursesCreated: number
    coursesNew: number
    totalStudents: number
    studentsGrowthPercent: number
    totalRevenue: string
    avgRating: number
    reviewCount: number
  }
  recentActivity: ActivityListItemData[]
  documentType?: string
  documentUrl?: string
}

const johnSmithActivity: ActivityListItemData[] = [
  {
    id: '1',
    title: 'Uploaded new lecture',
    description: 'Direct Taxation - Module 4: Corporate Tax Planning',
    time: '2 hours ago',
    icon: FileUp,
    iconClassName: 'bg-violet-100 text-violet-600',
  },
  {
    id: '2',
    title: 'Updated course content',
    description: 'Advanced Costing Techniques - Resource Library',
    time: 'Yesterday, 4:15 PM',
    imageSrc: activityOverlayImage,
    imageAlt: 'Updated course content',
    imageSizeClassName: 'size-10',
    imageMaskColor: ACTIVITY_EDIT_ICON_COLOR,
  },
  {
    id: '3',
    title: 'Published quiz assessment',
    description: 'Financial Reporting - Module 2',
    time: '2 days ago',
    icon: ClipboardCheck,
    iconClassName: 'bg-blue-50 text-blue-600',
  },
  {
    id: '4',
    title: 'Responded to student inquiry',
    description: 'Introduction to CMA • 2024 Batch',
    time: '3 days ago',
    icon: MessageSquare,
    iconClassName: 'bg-amber-50 text-amber-600',
  },
  {
    id: '5',
    title: 'Scheduled live session',
    description: 'Advanced Macroeconomics - Module 5',
    time: 'Last week',
    icon: Calendar,
    iconClassName: 'bg-emerald-50 text-emerald-600',
  },
]

export const mockFacultyJohnSmith: FacultyDetail = {
  id: 'john-smith',
  name: 'John Smith',
  title: 'CMA Faculty',
  email: 'john.smith@university.edu',
  phone: '+1 (555) 123-4567',
  status: 'active',
  avatarUrl: facultyProfileAvatar,
  initials: 'JS',
  bio: 'John Smith is a Certified Management Accountant with over 12 years of experience in financial reporting, strategic planning, and corporate finance education. He has trained more than 2,000 students across undergraduate and professional certification programs. His teaching approach combines real-world case studies with exam-focused preparation, helping learners build both conceptual clarity and practical skills.',
  qualifications: ['CMA', 'CA', 'MBA'],
  certificates: [
    { id: 'cma', label: 'CMA CERTIFICATE', fileName: 'cma_certificate.pdf', fileUrl: 'https://www.cma.com/certificate.pdf' },
    { id: 'id', label: 'IDENTITY PROOF', fileName: 'identity_proof.pdf', fileUrl: 'https://www.cma.com/identity_proof.pdf' },
  ],
  stats: {
    coursesCreated: 8,
    coursesNew: 2,
    totalStudents: 2450,
    studentsGrowthPercent: 12,
    totalRevenue: '₹8.5 L',
    avgRating: 4.6,
    reviewCount: 98,
  },
  recentActivity: johnSmithActivity,
}

/** Mock lookup — replace with API when backend is wired */
export function getFacultyById(facultyId: string): FacultyDetail | undefined {
  if (facultyId === mockFacultyJohnSmith.id || facultyId === '1') {
    return mockFacultyJohnSmith
  }
  return { ...mockFacultyJohnSmith, id: facultyId }
}
