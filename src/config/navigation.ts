import {
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LayoutList,
  Megaphone,
  MessageSquare,
  Package,
  Receipt,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import brandIcon from '@/asset/icons/brand_icon.svg'
import titleLogo from '@/asset/icons/title_logo.svg'

export type NavItem = {
  label: string
  path: string
  icon: LucideIcon
  showChevron?: boolean
  children?: NavItem[]
}

export const mainNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'User Management', path: '/users', icon: Users },
  { label: 'Course Management', path: '/courses', icon: Package },
  {
    label: 'Financial Management',
    path: '/financial',
    icon: Wallet,
    children: [
      { label: 'Overview', path: '/financial', icon: LayoutList },
      { label: 'GST Report', path: '/gst-report', icon: Receipt },
    ],
  },
  { label: 'Chats', path: '/chats', icon: MessageSquare },
  { label: 'Announcements', path: '/announcements', icon: Megaphone },
  // { label: 'Reports & Analytics', path: '/reports', icon: FileSearch },
  { label: 'Settings', path: '/platform-settings', icon: Settings },
]

export const bottomNavItems: NavItem[] = [
  { label: 'Help Center', path: '/help', icon: HelpCircle },
]

export const brand = {
  name: 'Learninough',
  icon: GraduationCap,
  brandIcon,
  titleLogo,
}
