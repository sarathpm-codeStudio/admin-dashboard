import { useEffect, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { GripVertical, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Paragraph } from '@/components/ui/Typography'
import type { FeaturedCourseRow } from '@/api/courseManagement/featuredCourses.api'
import { cn } from '@/utils/cn'

const tableTextClass = 'font-bold text-[#44474E]'
const gridClass =
  'grid grid-cols-[1.5rem_2.5rem_minmax(0,2.2fr)_1.1fr_1.1fr_0.9fr_2rem] items-center gap-3'

type FeaturedCoursesTableProps = {
  courses: FeaturedCourseRow[]
  isLoading?: boolean
  isBusy?: boolean
  /** Called with the new id order once a drag settles into a changed order. */
  onReorder: (orderedIds: string[]) => void
  onRemove: (course: FeaturedCourseRow) => void
}

function CategoryBadges({ category }: { category: string }) {
  const tags = category
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  if (tags.length === 0) {
    return (
      <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#44474E]">
        —
      </span>
    )
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#44474E]"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

type FeaturedRowProps = {
  course: FeaturedCourseRow
  position: number
  isBusy: boolean
  onCommit: () => void
  onRemove: (course: FeaturedCourseRow) => void
}

function FeaturedRow({ course, position, isBusy, onCommit, onRemove }: FeaturedRowProps) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={course}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onCommit}
      className={cn(
        gridClass,
        'border-b border-[#e2e8f0]/40 bg-surface-card px-4 py-3 last:border-b-0',
      )}
      whileDrag={{
        scale: 1.01,
        boxShadow: '0 12px 24px -12px rgba(15,23,42,0.25)',
        borderRadius: 12,
      }}
    >
      <button
        type="button"
        aria-label={`Drag ${course.title} to reorder`}
        onPointerDown={(event) => !isBusy && dragControls.start(event)}
        className={cn(
          'flex touch-none items-center justify-center text-nav transition-colors hover:text-ink-heading',
          isBusy ? 'cursor-not-allowed opacity-40' : 'cursor-grab active:cursor-grabbing',
        )}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>

      <div className="flex justify-center">
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary-50 text-xs font-extrabold text-primary">
          {position}
        </span>
      </div>

      <div className="flex min-w-0 items-center gap-3">
        {course.coverImage ? (
          <img
            src={course.coverImage}
            alt={course.title}
            className="h-14 w-20 shrink-0 rounded-lg bg-[#F1F5F9] object-contain"
          />
        ) : (
          <div className="h-14 w-20 shrink-0 rounded-lg bg-[#F1F5F9]" aria-hidden />
        )}
        <Paragraph
          variant="emphasis"
          className="truncate text-sm font-extrabold text-[#44474E]"
        >
          {course.title}
        </Paragraph>
      </div>

      <Paragraph variant="muted" className={cn('truncate capitalize', tableTextClass)}>
        {course.facultyName}
      </Paragraph>

      <CategoryBadges category={course.category} />

      <Paragraph variant="emphasis" className={cn('text-center', tableTextClass)}>
        {course.isFree ? 'Free' : course.priceDisplay}
      </Paragraph>

      <button
        type="button"
        aria-label={`Remove ${course.title} from featured`}
        disabled={isBusy}
        onClick={() => onRemove(course)}
        className="flex items-center justify-center rounded-nav p-1.5 text-red-500 transition-colors hover:bg-red-50 disabled:pointer-events-none disabled:opacity-30"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </Reorder.Item>
  )
}

export function FeaturedCoursesTable({
  courses,
  isLoading = false,
  isBusy = false,
  onReorder,
  onRemove,
}: FeaturedCoursesTableProps) {
  const [items, setItems] = useState<FeaturedCourseRow[]>(courses)

  // Keep local drag order in sync with server data (adds / removes / refetch).
  useEffect(() => {
    setItems(courses)
  }, [courses])

  const commitOrder = () => {
    const nextIds = items.map((row) => row.id)
    const currentIds = courses.map((row) => row.id)
    if (nextIds.join('|') !== currentIds.join('|')) {
      onReorder(nextIds)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div
        className={cn(
          gridClass,
          'border-b border-[#e2e8f0]/60 bg-[#F2F4F6] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-nav',
        )}
      >
        <span aria-hidden />
        <span className="text-center">#</span>
        <span>Course</span>
        <span>Faculty</span>
        <span>Category</span>
        <span className="text-center">Price</span>
        <span aria-hidden />
      </div>

      {isLoading ? (
        <div className="px-5 py-12 text-center">
          <Paragraph variant="muted">Loading…</Paragraph>
        </div>
      ) : items.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <Paragraph variant="muted">
            No featured courses yet. Add published courses to promote them.
          </Paragraph>
        </div>
      ) : (
        <Reorder.Group axis="y" values={items} onReorder={setItems} as="div">
          {items.map((course, index) => (
            <FeaturedRow
              key={course.id}
              course={course}
              position={index + 1}
              isBusy={isBusy}
              onCommit={commitOrder}
              onRemove={onRemove}
            />
          ))}
        </Reorder.Group>
      )}

      <div className="border-t border-[#e2e8f0]/60 px-5 py-3">
        <Paragraph variant="muted" className="text-sm font-bold text-[#44474E]">
          {items.length} featured
        </Paragraph>
      </div>
    </Card>
  )
}
