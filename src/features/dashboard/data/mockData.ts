import {
  BarChart3,
  BookOpen,
  GraduationCap,
  IndianRupee,
  Megaphone,
  Settings,
  UserCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'

export const dashboardStats = [
  { label: 'Total Students', value: '25,000', icon: Users, iconClassName: 'bg-blue-50 text-blue-600' },
  { label: 'Total Faculty', value: '1,200', icon: GraduationCap, iconClassName: 'bg-emerald-50 text-emerald-600' },
  { label: 'Total Courses', value: '850', icon: BookOpen, iconClassName: 'bg-orange-50 text-orange-600' },
  { label: 'Total Revenue', value: '₹1.8 Cr', icon: IndianRupee, iconClassName: 'bg-amber-50 text-amber-600' },
] as const

export type PendingAction = {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  iconClassName: string
}

export const pendingActions: PendingAction[] = [
  {
    id: '1',
    title: 'Sarah Miller',
    subtitle: 'Faculty Application • Applied 2h ago',
    icon: UserPlus,
    iconClassName: 'bg-amber-100 text-amber-700',
  },
  {
    id: '2',
    title: 'Advanced Macroeconomics',
    subtitle: 'Course Reported • Content Violation',
    icon: Settings,
    iconClassName: 'bg-violet-100 text-violet-700',
  },
  {
    id: '3',
    title: 'James Wilson',
    subtitle: 'Faculty Application • Applied 5h ago',
    icon: UserPlus,
    iconClassName: 'bg-amber-100 text-amber-700',
  },
  {
    id: '4',
    title: 'UI/UX Design Fundamentals',
    subtitle: 'Course Approval • Applied 8h ago',
    icon: Settings,
    iconClassName: 'bg-violet-100 text-violet-700',
  },
  {
    id: '5',
    title: 'Emily Chen',
    subtitle: 'Faculty Application • Applied 1d ago',
    icon: UserPlus,
    iconClassName: 'bg-amber-100 text-amber-700',
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
  faculty: { name: 'Dr. Priya Sharma', detail: '₹4.2 L revenue this month', initials: 'PS' },
  course: { name: 'Full Stack Web Development', detail: '2,450 enrolled students', icon: BookOpen },
}

export type LiveActivity = {
  id: string
  message: string
  time: string
  iconClassName: string
  icon: LucideIcon
}

export const liveActivities: LiveActivity[] = [
  { id: '1', message: 'New faculty joined: Dr. Arpan Roy', time: 'Just now', iconClassName: 'bg-emerald-50 text-emerald-600', icon: GraduationCap },
  { id: '2', message: 'Microservices 101 published', time: '12 mins ago', iconClassName: 'bg-violet-50 text-violet-600', icon: BookOpen },
  { id: '3', message: '₹2,499 payment from Alex W.', time: '24 mins ago', iconClassName: 'bg-blue-50 text-blue-600', icon: IndianRupee },
]

export const platformHealth = { activeCourses: 620, activeStudents: 12025 }

export type QuickAction = { id: string; label: string; icon: LucideIcon }

export const quickActions: QuickAction[] = [
  { id: '1', label: 'Add Admin', icon: UserPlus },
  { id: '2', label: 'Approve Faculty', icon: UserCheck },
  { id: '3', label: 'Announcement', icon: Megaphone },
  { id: '4', label: 'View Reports', icon: BarChart3 },
]
