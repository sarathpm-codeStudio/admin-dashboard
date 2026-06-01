import { Activity } from 'lucide-react'
import { ActivityList } from '@/components/ui/ActivityList'
import type { ActivityListItemData } from '@/components/ui/ActivityList'

type FacultyRecentActivityCardProps = {
  items: ActivityListItemData[]
}

export function FacultyRecentActivityCard({ items }: FacultyRecentActivityCardProps) {
  return <ActivityList title="Recent Activity" titleIcon={Activity} items={items} />
}
