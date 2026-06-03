import elenaAvatar from '@/asset/image/elena.png'
import user1Avatar from '@/asset/image/user1.png'

export type FacultyTransactionType = 'bundle' | 'individual'

export type FacultyRevenueSummary = {
  totalRevenue: string
  revenueGrowthPercent: number
  pendingPayout: string
}

export type FacultyEarningsMonth = {
  label: string
  currentYear: number
  previousYear: number
}

export type FacultyRevenueSource = {
  bundlesPercent: number
  individualPercent: number
}

export type FacultyTransaction = {
  id: string
  transactionId: string
  courseName: string
  studentName: string
  studentAvatarUrl?: string
  studentInitials: string
  studentAvatarClassName: string
  date: string
  type: FacultyTransactionType
}

export const TRANSACTION_DISPLAY_TOTAL = 1248
export const TRANSACTION_PAGE_SIZE = 3

const johnSmithRevenue: FacultyRevenueSummary = {
  totalRevenue: '₹142,850.00',
  revenueGrowthPercent: 12.4,
  pendingPayout: '₹12,400.32',
}

/** Chart bar shape uses FIGMA_BAR_HEIGHTS in FacultyEarningsGrowthChart; Mar tooltip ₹64,366 */
const johnSmithEarnings: FacultyEarningsMonth[] = [
  { label: 'Jan', currentYear: 30, previousYear: 28 },
  { label: 'Feb', currentYear: 45, previousYear: 40 },
  { label: 'Mar', currentYear: 60, previousYear: 50 },
  { label: 'Apr', currentYear: 90, previousYear: 70 },
  { label: 'May', currentYear: 75, previousYear: 65 },
  { label: 'Jun', currentYear: 45, previousYear: 42 },
]

const johnSmithSource: FacultyRevenueSource = {
  bundlesPercent: 62,
  individualPercent: 38,
}

const johnSmithTransactions: FacultyTransaction[] = [
  {
    id: 'trx-1',
    transactionId: 'TRX-94021',
    courseName: 'Advanced Python for Data Science',
    studentName: 'Eleanor May',
    studentAvatarUrl: elenaAvatar,
    studentInitials: 'EM',
    studentAvatarClassName: 'bg-violet-100 text-violet-700',
    date: 'Oct 12, 2023',
    type: 'bundle',
  },
  {
    id: 'trx-2',
    transactionId: 'TRX-94018',
    courseName: 'UX Fundamentals',
    studentName: 'Robert Jenkins',
    studentAvatarUrl: user1Avatar,
    studentInitials: 'RJ',
    studentAvatarClassName: 'bg-sky-100 text-sky-700',
    date: 'Oct 11, 2023',
    type: 'individual',
  },
  {
    id: 'trx-3',
    transactionId: 'TRX-93995',
    courseName: 'Backend Systems Architecture',
    studentName: 'Sarah Lee',
    studentAvatarUrl: user1Avatar,
    studentInitials: 'SL',
    studentAvatarClassName: 'bg-amber-100 text-amber-700',
    date: 'Oct 10, 2023',
    type: 'bundle',
  },
]

const revenueByFacultyId: Record<string, FacultyRevenueSummary> = {
  'john-smith': johnSmithRevenue,
}

const earningsByFacultyId: Record<string, FacultyEarningsMonth[]> = {
  'john-smith': johnSmithEarnings,
}

const sourceByFacultyId: Record<string, FacultyRevenueSource> = {
  'john-smith': johnSmithSource,
}

const transactionsByFacultyId: Record<string, FacultyTransaction[]> = {
  'john-smith': johnSmithTransactions,
}

export function getFacultyRevenueSummary(facultyId: string): FacultyRevenueSummary {
  return revenueByFacultyId[facultyId] ?? johnSmithRevenue
}

export function getFacultyEarningsGrowth(facultyId: string): FacultyEarningsMonth[] {
  return earningsByFacultyId[facultyId] ?? johnSmithEarnings
}

export function getFacultyRevenueSource(facultyId: string): FacultyRevenueSource {
  return sourceByFacultyId[facultyId] ?? johnSmithSource
}

export function getFacultyTransactions(facultyId: string): FacultyTransaction[] {
  return transactionsByFacultyId[facultyId] ?? johnSmithTransactions
}
