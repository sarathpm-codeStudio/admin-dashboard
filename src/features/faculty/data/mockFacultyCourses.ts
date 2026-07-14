export type FacultyCourseStatus = 'active' | 'draft'

export type FacultyCourse = {
  id: string
  facultyId: string
  name: string
  status: FacultyCourseStatus
  studentsEnrolled: number
  revenue: string
  category: string
  coverImage: string | null
  /** Course validity, e.g. "3 Months" or "Lifetime" */
  durationDisplay: string
  isFree: boolean
  /** What the student pays, e.g. "₹4,200" — or "Free" */
  priceDisplay: string
  /** List price, shown struck through; null when there is no discount */
  originalPriceDisplay: string | null
}

/** The card-display fields are derived server-side, so the fixtures omit them */
type MockFacultyCourse = Omit<
  FacultyCourse,
  'coverImage' | 'durationDisplay' | 'isFree' | 'priceDisplay' | 'originalPriceDisplay'
>

export const FACULTY_COURSE_CATEGORIES = [
  'accounting',
  'taxation',
  'finance',
  'audit',
  'forensic',
  'systems',
] as const

export type FacultyCourseCategory = (typeof FACULTY_COURSE_CATEGORIES)[number]

const mockFacultyCourses: MockFacultyCourse[] = [
  {
    id: 'fc-1',
    facultyId: 'john-smith',
    name: 'Cost Accounting',
    status: 'active',
    studentsEnrolled: 428,
    revenue: '₹12,450.00',
    category: 'accounting',
  },
  {
    id: 'fc-2',
    facultyId: 'john-smith',
    name: 'Taxation Mastery: International Laws',
    status: 'active',
    studentsEnrolled: 192,
    revenue: '₹8,900.00',
    category: 'taxation',
  },
  {
    id: 'fc-3',
    facultyId: 'john-smith',
    name: 'Corporate Finance for Executives',
    status: 'draft',
    studentsEnrolled: 0,
    revenue: '$0.00',
    category: 'finance',
  },
  {
    id: 'fc-4',
    facultyId: 'john-smith',
    name: 'Audit Ethics and Compliance',
    status: 'active',
    studentsEnrolled: 112,
    revenue: '₹3,400.00',
    category: 'audit',
  },
  {
    id: 'fc-5',
    facultyId: 'john-smith',
    name: 'Financial Statement Analysis',
    status: 'active',
    studentsEnrolled: 305,
    revenue: '₹11,200.00',
    category: 'accounting',
  },
  {
    id: 'fc-6',
    facultyId: 'john-smith',
    name: 'Strategic Managerial Accounting',
    status: 'active',
    studentsEnrolled: 88,
    revenue: '₹4,100.00',
    category: 'accounting',
  },
  {
    id: 'fc-7',
    facultyId: 'john-smith',
    name: 'Introduction to Forensic Accounting',
    status: 'draft',
    studentsEnrolled: 0,
    revenue: '₹0.00',
    category: 'forensic',
  },
  {
    id: 'fc-8',
    facultyId: 'john-smith',
    name: 'Accounting Information Systems',
    status: 'active',
    studentsEnrolled: 115,
    revenue: '₹2,800.00',
    category: 'systems',
  },
]

/**
 * Filter options for the enrollment course dropdown — the faculty's published
 * courses only (drafts are excluded). Value matches enrollment `courseName`.
 */
export function getFacultyCourseFilterOptions(
  facultyId: string,
): { value: string; label: string }[] {
  return getFacultyCourses(facultyId)
    .filter((course) => course.status !== 'draft')
    .map((course) => ({ value: course.name, label: course.name }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/** Mock lookup — replace with API when backend is wired */
export function getFacultyCourses(facultyId: string): FacultyCourse[] {
  const normalizedId =
    facultyId === '1' || facultyId === 'john-smith' ? 'john-smith' : facultyId

  return mockFacultyCourses.map((course) => ({
    ...course,
    facultyId: normalizedId,
    coverImage: null,
    durationDisplay: '—',
    isFree: false,
    priceDisplay: '—',
    originalPriceDisplay: null,
  }))
}
