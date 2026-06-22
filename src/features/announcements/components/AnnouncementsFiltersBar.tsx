import { ArrowUpDown } from 'lucide-react'
import type { AnnouncementSort, AnnouncementTab } from '@/features/announcements/types'
import { cn } from '@/utils/cn'

type AnnouncementsFiltersBarProps = {
  tab: AnnouncementTab
  sort: AnnouncementSort
  onTabChange: (tab: AnnouncementTab) => void
  onSortChange: (sort: AnnouncementSort) => void
  className?: string
}

const tabs: { id: AnnouncementTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'drafts', label: 'Drafts' },
]

export function AnnouncementsFiltersBar({
  tab,
  sort,
  onTabChange,
  onSortChange,
  className,
}: AnnouncementsFiltersBarProps) {
  const toggleSort = () => {
    onSortChange(sort === 'date-desc' ? 'date-asc' : 'date-desc')
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-4 rounded-card bg-surface-input px-4 py-3',
        className,
      )}
    >
      <div className="inline-flex items-center gap-1 rounded-lg bg-[#ECEEF2] p-1">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              tab === id
                ? 'bg-white text-ink-heading shadow-sm'
                : 'text-nav hover:text-ink-heading',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={toggleSort}
        className="inline-flex items-center gap-2 text-sm font-medium text-nav transition-colors hover:text-ink-heading"
        aria-label={`Sort by date, ${sort === 'date-desc' ? 'newest first' : 'oldest first'}`}
      >
        <ArrowUpDown className="size-4 shrink-0" aria-hidden />
        <span>Sort by: Date</span>
      </button>
    </div>
  )
}
