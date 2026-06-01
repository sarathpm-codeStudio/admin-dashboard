import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { cn } from '@/utils/cn'

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
          <p className="text-2xl font-bold tracking-tight text-primary">
            {activeCourses.toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
            Active Courses
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold tracking-tight text-primary">
            {activeStudents.toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
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
            <Icon className="size-5 text-primary" strokeWidth={1.75} aria-hidden />
            <span className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-primary">
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
