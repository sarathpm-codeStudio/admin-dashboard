import {
  BookOpen,
  Coins,
  Flame,
  Percent,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react'

export type GroupUi = { icon: LucideIcon; description: string }

/**
 * Per-group tab presentation. Add an entry when you introduce a new group so it
 * gets a fitting icon and description; unmapped groups fall back gracefully.
 */
export const GROUP_UI: Record<string, GroupUi> = {
  'Coin economy': {
    icon: Coins,
    description: 'Coin values and the rewards students earn across the platform.',
  },
  'Streak rewards': {
    icon: Flame,
    description: 'Streak length and the bonus students earn for keeping it.',
  },
  Courses: {
    icon: BookOpen,
    description: 'Course-related platform defaults.',
  },
  Commission: {
    icon: Percent,
    description: 'Platform commission applied to faculty enrollment revenue.',
  },
  'Other settings': {
    icon: SlidersHorizontal,
    description: 'Additional platform settings not yet grouped.',
  },
}

export function getGroupUi(group: string): GroupUi {
  return GROUP_UI[group] ?? { icon: SlidersHorizontal, description: 'Platform settings.' }
}
