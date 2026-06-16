import facultyAvatar from '@/asset/image/john.png'
import {
  BarChart3,
  CirclePlay,
  IndianRupee,
  Megaphone,
  UserCheck,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'

export type PendingAction = {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  iconTileClassName: string
  iconClassName: string
}

const facultyPendingIcon = {
  icon: UserPlus,
  iconTileClassName: 'bg-[#FFF5D9]',
  iconClassName: 'text-[#B45309]',
} as const

const coursePendingIcon = {
  icon: CirclePlay,
  iconTileClassName: 'bg-[#E9EDF7]',
  iconClassName: 'text-[#4318FF]',
} as const

export const pendingActions: PendingAction[] = [
  {
    id: '1',
    title: 'Sarah Miller',
    subtitle: 'Faculty Application • Applied 2h ago',
    ...facultyPendingIcon,
  },
  {
    id: '2',
    title: 'Advanced Macroeconomics',
    subtitle: 'Course Reported • Content Violation',
    ...coursePendingIcon,
  },
  {
    id: '3',
    title: 'James Wilson',
    subtitle: 'Faculty Application • Applied 5h ago',
    ...facultyPendingIcon,
  },
  {
    id: '4',
    title: 'Intro to Data Science',
    subtitle: 'Course Reported • Copyright Issue',
    ...coursePendingIcon,
  },
  {
    id: '5',
    title: 'Elena Rodriguez',
    subtitle: 'Faculty Application • Applied 1d ago',
    ...facultyPendingIcon,
  },
]

export type SystemAlert = {
  id: string
  title: string
  detail: string
  variant: 'warning' | 'danger' | 'info'
}

export const systemAlerts: SystemAlert[] = [
  { id: '1', title: '12 Faculty pending', detail: 'Awaiting verification docs', variant: 'warning' },
  { id: '2', title: '5 payment failures', detail: 'Gateway Timeout: Stripe ID 4422', variant: 'danger' },
  { id: '3', title: 'High server load', detail: '82% CPU usage in ap-south-1', variant: 'info' },
]

export const financialPulse = {
  today: '₹50,000',
  currentMonth: '₹12.0 L',
  payouts: '₹3.5 L',
}

export const topPerformers = {
  faculty: {
    name: 'John Mathew',
    avatarUrl: facultyAvatar,
    category: 'Faculty',
    metric: '₹5L revenue',
  },
  course: {
    name: 'Cost Accounting',
    category: 'Course',
    metric: '1,200 students',
  },
}

export type LiveActivity = {
  id: string
  highlight: string
  rest: string
  time: string
  icon: LucideIcon
  iconBgClassName: string
}

export const liveActivities: LiveActivity[] = [
  {
    id: '1',
    highlight: 'New faculty',
    rest: ' joined: Dr. Arpan Roy',
    time: 'Just now',
    icon: UserPlus,
    iconBgClassName: 'bg-[#10B981]',
  },
  {
    id: '2',
    highlight: 'Microservices 101',
    rest: ' published',
    time: '12 mins ago',
    icon: CirclePlay,
    iconBgClassName: 'bg-[#6366F1]',
  },
  {
    id: '3',
    highlight: '₹2,499 payment',
    rest: ' from Alex W.',
    time: '24 mins ago',
    icon: IndianRupee,
    iconBgClassName: 'bg-[#3B82F6]',
  },
]

export const platformHealth = { activeCourses: 620, activeStudents: 12025 }

export type QuickAction = { id: string; label: string; icon: LucideIcon }

export const quickActions: QuickAction[] = [
  { id: '1', label: 'Add Admin', icon: UserPlus },
  { id: '2', label: 'Approve Faculty', icon: UserCheck },
  { id: '3', label: 'Announcement', icon: Megaphone },
  { id: '4', label: 'View Reports', icon: BarChart3 },
]
