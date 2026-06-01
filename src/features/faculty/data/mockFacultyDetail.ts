import { FileUp, Pencil } from 'lucide-react'
import type { ActivityListItemData } from '@/components/ui/ActivityList'

export type FacultyStatus = 'active' | 'pending' | 'suspended'

export type FacultyCertificate = {
  id: string
  label: string
  fileName: string
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
}

const johnSmithActivity: ActivityListItemData[] = [
  {
    id: '1',
    title: 'Uploaded new lecture',
    description: 'Advanced Macroeconomics • Module 4',
    time: '2 hours ago',
    icon: FileUp,
    iconClassName: 'bg-primary-50 text-primary',
  },
  {
    id: '2',
    title: 'Updated course syllabus',
    description: 'Introduction to CMA • 2024 Batch',
    time: 'Yesterday',
    icon: Pencil,
    iconClassName: 'bg-primary-50 text-primary',
  },
  {
    id: '3',
    title: 'Uploaded new lecture',
    description: 'Financial Reporting • Module 2',
    time: '3 days ago',
    icon: FileUp,
    iconClassName: 'bg-primary-50 text-primary',
  },
]

export const mockFacultyJohnSmith: FacultyDetail = {
  id: 'john-smith',
  name: 'John Smith',
  title: 'CMA Faculty',
  email: 'john.smith@university.edu',
  phone: '+1 (555) 123-4567',
  status: 'active',
  initials: 'JS',
  bio: 'John Smith is a Certified Management Accountant with over 12 years of experience in financial reporting, strategic planning, and corporate finance education. He has trained more than 2,000 students across undergraduate and professional certification programs. His teaching approach combines real-world case studies with exam-focused preparation, helping learners build both conceptual clarity and practical skills.',
  qualifications: ['CMA', 'CA', 'MBA'],
  certificates: [
    { id: 'cma', label: 'CMA CERTIFICATE', fileName: 'cma_certificate.pdf' },
    { id: 'id', label: 'IDENTITY PROOF', fileName: 'identity_proof.pdf' },
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
