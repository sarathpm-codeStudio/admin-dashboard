export type UserRole = 'Student' | 'Faculty' | 'Admin'

export type UserStatus = 'active' | 'pending' | 'suspended'

import { formatJoinedDate } from '@/features/users/utils/joinedDate'

export type UserRecord = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  coursesCount: number
  joinedDate: string
  initials: string
  avatarClassName: string
}

export const userSummaryStats = {
  totalUsers: 12540,
  totalGrowthPercent: 2.4,
  students: 11200,
  studentsActive: 10800,
  faculty: 1100,
  facultyActive: 1092,
  pendingApprovals: 24,
}

const seedUsers: Omit<UserRecord, 'id'>[] = [
  {
    name: 'Sarah Miller',
    email: 'sarah.miller@university.edu',
    role: 'Student',
    status: 'active',
    coursesCount: 4,
    joinedDate: 'Oct 12, 2023',
    initials: 'SM',
    avatarClassName: 'bg-violet-100 text-violet-700',
  },
  {
    name: 'Dr. James Wilson',
    email: 'j.wilson@university.edu',
    role: 'Faculty',
    status: 'active',
    coursesCount: 6,
    joinedDate: 'Sep 28, 2023',
    initials: 'JW',
    avatarClassName: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'Emily Chen',
    email: 'emily.chen@university.edu',
    role: 'Student',
    status: 'pending',
    coursesCount: 2,
    joinedDate: 'Nov 02, 2023',
    initials: 'EC',
    avatarClassName: 'bg-emerald-100 text-emerald-700',
  },
  {
    name: 'Michael Brown',
    email: 'm.brown@university.edu',
    role: 'Student',
    status: 'suspended',
    coursesCount: 3,
    joinedDate: 'Aug 15, 2023',
    initials: 'MB',
    avatarClassName: 'bg-amber-100 text-amber-700',
  },
  {
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@university.edu',
    role: 'Faculty',
    status: 'active',
    coursesCount: 5,
    joinedDate: 'Jul 20, 2023',
    initials: 'PS',
    avatarClassName: 'bg-pink-100 text-pink-700',
  },
  {
    name: 'Alex Thompson',
    email: 'alex.t@university.edu',
    role: 'Student',
    status: 'active',
    coursesCount: 5,
    joinedDate: 'Oct 05, 2023',
    initials: 'AT',
    avatarClassName: 'bg-cyan-100 text-cyan-700',
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.a@university.edu',
    role: 'Admin',
    status: 'active',
    coursesCount: 0,
    joinedDate: 'Jan 10, 2023',
    initials: 'LA',
    avatarClassName: 'bg-indigo-100 text-indigo-700',
  },
  {
    name: 'David Kim',
    email: 'david.kim@university.edu',
    role: 'Student',
    status: 'active',
    coursesCount: 3,
    joinedDate: 'Nov 18, 2023',
    initials: 'DK',
    avatarClassName: 'bg-orange-100 text-orange-700',
  },
  {
    name: 'Dr. Arpan Roy',
    email: 'arpan.roy@university.edu',
    role: 'Faculty',
    status: 'pending',
    coursesCount: 2,
    joinedDate: 'Dec 01, 2023',
    initials: 'AR',
    avatarClassName: 'bg-teal-100 text-teal-700',
  },
  {
    name: 'Jessica Lee',
    email: 'jessica.lee@university.edu',
    role: 'Student',
    status: 'active',
    coursesCount: 6,
    joinedDate: 'Sep 14, 2023',
    initials: 'JL',
    avatarClassName: 'bg-rose-100 text-rose-700',
  },
]

const avatarPalette = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
  'bg-teal-100 text-teal-700',
  'bg-rose-100 text-rose-700',
]

function joinedDateForIndex(index: number): string {
  const date = new Date(2023, 0, 15)
  date.setDate(date.getDate() + index * 4)
  return formatJoinedDate(date)
}

function buildMockUsers(count: number): UserRecord[] {
  return Array.from({ length: count }, (_, index) => {
    const seed = seedUsers[index % seedUsers.length]!
    const suffix = index >= seedUsers.length ? ` ${Math.floor(index / seedUsers.length) + 1}` : ''
    const name = `${seed.name}${suffix}`
    const emailLocal = (seed.email.split('@')[0] ?? 'user').replace(/\./g, '')
    return {
      id: String(index + 1),
      name,
      email: `${emailLocal}${index}@university.edu`,
      role: seed.role,
      status: seed.status,
      coursesCount: seed.coursesCount,
      joinedDate: joinedDateForIndex(index),
      initials: seed.initials,
      avatarClassName: avatarPalette[index % avatarPalette.length]!,
    }
  })
}

/** Mock dataset for table pagination (institutional total shown separately in stats/footer) */
export const mockUsers = buildMockUsers(856)

export const TOTAL_USERS_COUNT = 856
/** 10 rows per page; scroll inside table to see rows 6–10 */
export const USERS_PAGE_SIZE = 10

/** At least 5 rows visible; header ~2.75rem + 5 × ~4.5rem row */
export const USERS_TABLE_VISIBLE_ROWS = 5
export const USERS_TABLE_SCROLL_MAX_HEIGHT = 'max-h-[26rem]'
