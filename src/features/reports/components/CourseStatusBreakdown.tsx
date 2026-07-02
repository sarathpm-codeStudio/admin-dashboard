import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Card, CardBody } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { useGetCourseStatusBreakdown } from '@/features/reports/hooks/useReports'
import { cn } from '@/utils/cn'

type CourseStatusBreakdownProps = {
  className?: string
  fillHeight?: boolean
}

export function CourseStatusBreakdown({ className, fillHeight = false }: CourseStatusBreakdownProps) {
  const { data: slices = [], isLoading, isError } = useGetCourseStatusBreakdown()

  const total = slices.reduce((sum, slice) => sum + slice.count, 0)
  const visible = slices.filter((slice) => slice.count > 0)

  return (
    <Card className={cn('w-full p-6', fillHeight && 'flex min-h-0 flex-col', className)}>
      <CardBody className={cn('gap-5', fillHeight && 'min-h-0 flex-1')}>
        <SectionHeader
          title="Course Status"
          titleClassName="text-[#191c1e]"
          subtitle="Distribution across the review lifecycle"
        />

        {isLoading ? (
          <div className="flex flex-1 items-center gap-6">
            <Skeleton className="size-40 rounded-full" />
            <div className="flex-1 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[#dc2626]">
            Failed to load course status.
          </div>
        ) : total === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-nav">
            No courses to report yet.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <div className="relative size-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visible}
                    dataKey="count"
                    nameKey="label"
                    innerRadius="66%"
                    outerRadius="100%"
                    paddingAngle={visible.length > 1 ? 2 : 0}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                    isAnimationActive
                    animationDuration={800}
                  >
                    {visible.map((slice) => (
                      <Cell key={slice.id} fill={slice.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-ink-heading">
                  {total.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-medium text-nav">Courses</span>
              </div>
            </div>

            <ul className="m-0 w-full flex-1 list-none space-y-3 p-0">
              {slices.map((slice) => {
                const percent = total > 0 ? Math.round((slice.count / total) * 100) : 0
                return (
                  <li key={slice.id} className="flex items-center gap-3 text-sm">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.color }}
                      aria-hidden
                    />
                    <span className="flex-1 truncate text-nav">{slice.label}</span>
                    <span className="font-semibold text-ink-heading">
                      {slice.count.toLocaleString('en-IN')}
                    </span>
                    <span className="w-10 text-right text-xs text-slate-400">{percent}%</span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
