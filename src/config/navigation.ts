import {
  Coins,
  FileSearch,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Package,
  Percent,
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
  { label: 'Financial Management', path: '/financial', icon: Wallet },
  { label: 'Chats', path: '/chats', icon: MessageSquare },
  { label: 'Reports & Analytics', path: '/reports', icon: FileSearch },
  {
    label: 'Settings',
    path: '/platform-settings',
    icon: Settings,
    showChevron: true,
    children: [
      { label: 'Coin', path: '/platform-settings/coin', icon: Coins },
      { label: 'Commission', path: '/platform-settings/commission', icon: Percent },
    ],
  },
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
