import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { cn } from '@/utils/cn'

const PLATFORM_STAT_VALUE = 'text-[#000b60]'
const PLATFORM_STAT_LABEL = 'text-[#5F5E5E]'
const QUICK_ACTION_ACCENT = 'text-[#4318FF]'
const QUICK_ACTION_LABEL = 'text-[#191c1e]'

type QuickAction = { id: string; label: string; icon: LucideIcon }

type PlatformHealthPanelProps = {
  activeCourses: number
  activeStudents: number
  actions: QuickAction[]
  className?: string
}

function PlatformHealthStats({
  activeCourses,
  activeStudents,
}: Pick<PlatformHealthPanelProps, 'activeCourses' | 'activeStudents'>) {
  return (
    <Card className="p-6">
      <SectionHeader title="Platform Health" />
      <div className="mt-5 grid grid-cols-2 gap-6">
        <div className="text-center">
          <p className={cn('text-2xl font-bold tracking-tight', PLATFORM_STAT_VALUE)}>
            {activeCourses.toLocaleString()}
          </p>
          <p
            className={cn(
              'mt-1 text-[10px] font-semibold uppercase tracking-wider',
              PLATFORM_STAT_LABEL,
            )}
          >
            Active Courses
          </p>
        </div>
        <div className="text-center">
          <p className={cn('text-2xl font-bold tracking-tight', PLATFORM_STAT_VALUE)}>
            {activeStudents.toLocaleString()}
          </p>
          <p
            className={cn(
              'mt-1 text-[10px] font-semibold uppercase tracking-wider',
              PLATFORM_STAT_LABEL,
            )}
          >
            Active Students
          </p>
        </div>
      </div>
    </Card>
  )
}

function PlatformHealthQuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map(({ id, label, icon: Icon }) => (
        <Card key={id} className="p-0">
          <button
            type="button"
            className="flex w-full flex-col items-center justify-center gap-2 rounded-card px-2 py-5 text-center transition-colors hover:bg-surface-page"
          >
            <Icon className={cn('size-5', QUICK_ACTION_ACCENT)} strokeWidth={1.75} aria-hidden />
            <span
              className={cn(
                'text-[10px] font-semibold uppercase leading-tight tracking-wide',
                QUICK_ACTION_LABEL,
              )}
            >
              {label}
            </span>
          </button>
        </Card>
      ))}
    </div>
  )
}

export function PlatformHealthPanel({
  activeCourses,
  activeStudents,
  actions,
  className,
}: PlatformHealthPanelProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <PlatformHealthStats activeCourses={activeCourses} activeStudents={activeStudents} />
      <PlatformHealthQuickActions actions={actions} />
    </div>
  )
}
