import { Calculator, Star, TrendingUp, User } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { Carousel } from '@/components/ui/Carousel'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import { useGetTopPerformers } from '@/features/dashboard/hooks/useDashboardmanagement'

type TopPerformersProps = {
  className?: string
  fillHeight?: boolean
}

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

export function TopPerformers({ className, fillHeight = false }: TopPerformersProps) {
  const { data, isLoading } = useGetTopPerformers()
  const faculty = data?.faculty
  const course = data?.course

  const slides: ReactNode[] = []
  if (faculty) {
    slides.push(
      <PerformerRow
        key="faculty"
        leading={
          faculty.avatarUrl ? (
            <img
              src={faculty.avatarUrl}
              alt=""
              className="size-12 rounded-lg object-cover object-center"
            />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#64748B]" aria-hidden>
              <User className="size-6 stroke-[1.75]" />
            </div>
          )
        }
        name={faculty.name}
        subtitle={`${faculty.category} • ${faculty.metric}`}
        trailing={<Star className="size-5 fill-[#F59E0B] text-[#F59E0B]" aria-hidden />}
      />,
    )
  }
  if (course) {
    slides.push(
      <PerformerRow
        key="course"
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
      />,
    )
  }

  return (
    <Card
      className={cn(
        'w-full rounded-[12px] border border-[#e2e8f0]/60 p-6 shadow-sm',
        fillHeight && 'flex min-h-0 flex-col',
        className,
      )}
    >
      <h2 className="mb-4 text-base font-bold text-[#111827]">Top Performers</h2>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-[4.5rem] w-full rounded-lg" />
        </div>
      ) : slides.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg bg-[#F3F4F6] p-6 text-sm text-[#6B7280]">
          No performance data yet.
        </div>
      ) : (
        <Carousel
          className={cn(fillHeight && 'min-h-0 flex-1')}
          viewportClassName={cn(fillHeight && 'h-full')}
          autoPlayInterval={4000}
          slides={slides}
        />
      )}
    </Card>
  )
}
