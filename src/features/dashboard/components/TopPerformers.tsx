import { Calculator, Star, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'
import { topPerformers } from '@/features/dashboard/data/mockData'

type TopPerformersProps = { className?: string }

type PerformerRowProps = {
  leading: ReactNode
  name: string
  subtitle: string
  trailing: ReactNode
}

function PerformerRow({ leading, name, subtitle, trailing }: PerformerRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[#F3F4F6] p-3">
      <div className="shrink-0">{leading}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#111827]">{name}</p>
        <p className="truncate text-xs text-[#6B7280]">{subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center">{trailing}</div>
    </div>
  )
}

export function TopPerformers({ className }: TopPerformersProps) {
  const { faculty, course } = topPerformers

  return (
    <Card
      className={cn(
        'w-full rounded-[12px] border border-[#e2e8f0]/60 p-6 shadow-sm',
        className,
      )}
    >
      <h2 className="mb-4 text-base font-bold text-[#111827]">Top Performers</h2>

      <div className="flex flex-col gap-3">
        <PerformerRow
          leading={
            <img
              src={faculty.avatarUrl}
              alt=""
              className="size-12 rounded-lg object-cover object-center"
            />
          }
          name={faculty.name}
          subtitle={`${faculty.category} • ${faculty.metric}`}
          trailing={
            <Star className="size-5 fill-[#F59E0B] text-[#F59E0B]" aria-hidden />
          }
        />

        <PerformerRow
          leading={
            <div
              className="flex size-12 items-center justify-center rounded-lg bg-[#E0E7FF] text-[#4338CA]"
              aria-hidden
            >
              <Calculator className="size-6 stroke-[1.75]" />
            </div>
          }
          name={course.name}
          subtitle={`${course.category} • ${course.metric}`}
          trailing={
            <TrendingUp className="size-5 text-[#2563EB]" strokeWidth={2.25} aria-hidden />
          }
        />
      </div>
    </Card>
  )
}
