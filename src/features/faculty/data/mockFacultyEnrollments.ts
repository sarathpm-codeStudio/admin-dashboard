import elenaAvatar from '@/asset/image/elena.png'
import user1Avatar from '@/asset/image/user1.png'

export type EnrollmentStatus = 'active' | 'pending' | 'completed'

export type FacultyEnrollment = {
  id: string
  facultyId: string
  studentId: string
  name: string
  avatarUrl?: string
  initials: string
  avatarClassName: string
  courseName: string
  courseSlug: string
  enrollmentDate: string
  progressPercent: number
  status: EnrollmentStatus
  test_score?: number | undefined
}

/** Matches faculty profile stat — drives pagination (98 pages at 25/page) */
export const ENROLLMENT_DISPLAY_TOTAL = 2450
export const ENROLLMENT_PAGE_SIZE = 25

const seedEnrollments: FacultyEnrollment[] = [
  {
    id: 'en-1',
    facultyId: 'john-smith',
    studentId: 'ST-99821',
    name: 'Elena Rodriguez',
    avatarUrl: elenaAvatar,
    initials: 'ER',
    avatarClassName: 'bg-violet-100 text-violet-700',
    courseName: 'Advanced Quantum Mechanics',
    courseSlug: 'quantum-mechanics',
    enrollmentDate: 'Jan 12, 2024',
    progressPercent: 88,
    status: 'active',
  },
  {
    id: 'en-2',
    facultyId: 'john-smith',
    studentId: 'ST-88210',
    name: 'Marcus Chen',
    avatarUrl: user1Avatar,
    initials: 'MC',
    avatarClassName: 'bg-blue-100 text-blue-700',
    courseName: 'Theoretical Astrophysics',
    courseSlug: 'astrophysics',
    enrollmentDate: 'Feb 03, 2024',
    progressPercent: 42,
    status: 'active',
  },
  {
    id: 'en-3',
    facultyId: 'john-smith',
    studentId: 'ST-77102',
    name: 'Cassie Huang',
    initials: 'CH',
    avatarClassName: 'bg-amber-100 text-amber-700',
    courseName: 'Cost Accounting',
    courseSlug: 'cost-accounting',
    enrollmentDate: 'Mar 18, 2024',
    progressPercent: 15,
    status: 'pending',
  },
  {
    id: 'en-4',
    facultyId: 'john-smith',
    studentId: 'ST-66440',
    name: 'James Wilson',
    initials: 'JW',
    avatarClassName: 'bg-emerald-100 text-emerald-700',
    courseName: 'Financial Statement Analysis',
    courseSlug: 'financial-analysis',
    enrollmentDate: 'Apr 02, 2024',
    progressPercent: 100,
    status: 'completed',
  },
  {
    id: 'en-5',
    facultyId: 'john-smith',
    studentId: 'ST-55291',
    name: 'Sarah Miller',
    initials: 'SM',
    avatarClassName: 'bg-violet-100 text-violet-700',
    courseName: 'Taxation Mastery: International Laws',
    courseSlug: 'taxation-mastery',
    enrollmentDate: 'May 10, 2024',
    progressPercent: 67,
    status: 'active',
  },
  {
    id: 'en-6',
    facultyId: 'john-smith',
    studentId: 'ST-44102',
    name: 'David Kim',
    initials: 'DK',
    avatarClassName: 'bg-sky-100 text-sky-700',
    courseName: 'Audit Ethics and Compliance',
    courseSlug: 'audit-ethics',
    enrollmentDate: 'Jun 22, 2024',
    progressPercent: 31,
    status: 'active',
  },
  {
    id: 'en-7',
    facultyId: 'john-smith',
    studentId: 'ST-33018',
    name: 'Amelia Foster',
    initials: 'AF',
    avatarClassName: 'bg-rose-100 text-rose-700',
    courseName: 'Data Science 101',
    courseSlug: 'data-science-101',
    enrollmentDate: 'Jul 08, 2024',
    progressPercent: 54,
    status: 'pending',
  },
  {
    id: 'en-8',
    facultyId: 'john-smith',
    studentId: 'ST-22990',
    name: 'Oliver Grant',
    initials: 'OG',
    avatarClassName: 'bg-indigo-100 text-indigo-700',
    courseName: 'Strategic Managerial Accounting',
    courseSlug: 'managerial-accounting',
    enrollmentDate: 'Aug 14, 2024',
    progressPercent: 100,
    status: 'completed',
  },
  {
    id: 'en-9',
    facultyId: 'john-smith',
    studentId: 'ST-11877',
    name: 'Nina Patel',
    initials: 'NP',
    avatarClassName: 'bg-teal-100 text-teal-700',
    courseName: 'Accounting Information Systems',
    courseSlug: 'accounting-systems',
    enrollmentDate: 'Sep 01, 2024',
    progressPercent: 76,
    status: 'active',
  },
  {
    id: 'en-10',
    facultyId: 'john-smith',
    studentId: 'ST-00765',
    name: 'Lucas Meyer',
    initials: 'LM',
    avatarClassName: 'bg-orange-100 text-orange-700',
    courseName: 'Corporate Finance for Executives',
    courseSlug: 'corporate-finance',
    enrollmentDate: 'Oct 19, 2024',
    progressPercent: 9,
    status: 'pending',
  },
]

function normalizeFacultyId(facultyId: string) {
  return facultyId === '1' || facultyId === 'john-smith' ? 'john-smith' : facultyId
}

function withFacultyId(rows: FacultyEnrollment[], facultyId: string) {
  return rows.map((row) => ({ ...row, facultyId: normalizeFacultyId(facultyId) }))
}

/** Full seed list for filters */
export function getFacultyEnrollments(facultyId: string): FacultyEnrollment[] {
  return withFacultyId(seedEnrollments, facultyId)
}

/** Paged rows for table (repeats seed to fill pages like live API) */
export function getFacultyEnrollmentPage(
  facultyId: string,
  page: number,
  pageSize: number,
  sourceRows: FacultyEnrollment[],
  totalCount: number,
): FacultyEnrollment[] {
  const start = (page - 1) * pageSize
  const rows: FacultyEnrollment[] = []

  if (sourceRows.length === 0) return []

  for (let i = 0; i < pageSize && start + i < totalCount; i += 1) {
    const index = start + i
    const template = sourceRows[index % sourceRows.length]!
    rows.push({
      ...template,
      id: `${template.id}-p${page}-${i}`,
      studentId: `ST-${(99821 - (index % 90000)).toString().padStart(5, '0')}`,
    })
  }

  return withFacultyId(rows, facultyId)
}

export function getEnrollmentCourseOptions(
  enrollments: FacultyEnrollment[],
): { value: string; label: string }[] {
  const seen = new Set<string>()
  const options: { value: string; label: string }[] = []

  for (const row of enrollments) {
    if (!seen.has(row.courseSlug)) {
      seen.add(row.courseSlug)
      options.push({ value: row.courseSlug, label: row.courseName })
    }
  }

  return options.sort((a, b) => a.label.localeCompare(b.label))
}
