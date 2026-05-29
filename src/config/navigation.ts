import {
  FileSearch,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Package,
  User,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  label: string
  path: string
  icon: LucideIcon
  showChevron?: boolean
}

export const mainNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'User Management', path: '/users', icon: Users },
  { label: 'Course Management', path: '/courses', icon: Package },
  { label: 'Financial Management', path: '/financial', icon: Wallet },
  { label: 'Chats', path: '/chats', icon: MessageSquare },
  { label: 'Reports & Analytics', path: '/reports', icon: FileSearch },
  { label: 'Account', path: '/account', icon: User, showChevron: true },
]

export const bottomNavItems: NavItem[] = [
  { label: 'Help Center', path: '/help', icon: HelpCircle },
]

export const brand = {
  name: 'Learninough',
  icon: GraduationCap,
}
