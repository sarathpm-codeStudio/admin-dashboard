import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Header1, Paragraph } from '@/components/ui/Typography'
import { useToast } from '@/hooks/useToast'
import type { FeaturedCourseRow } from '@/api/courseManagement/featuredCourses.api'
import { AddFeaturedCourseModal } from '@/features/courses/components/AddFeaturedCourseModal'
import { FeaturedCoursesTable } from '@/features/courses/components/FeaturedCoursesTable'
import {
  useGetFeaturedCourses,
  useRemoveFeaturedCourse,
  useReorderFeaturedCourses,
} from '@/features/courses/hooks/useFeaturedCourses'

export function FeaturedCoursesView() {
  const navigate = useNavigate()
  const toast = useToast()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [pendingRemove, setPendingRemove] = useState<FeaturedCourseRow | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const { data: featured = [], isLoading } = useGetFeaturedCourses()
  const { mutateAsync: reorderFeatured, isPending: isReordering } = useReorderFeaturedCourses()
  const { mutateAsync: removeFeatured } = useRemoveFeaturedCourse()

  const handleReorder = async (orderedIds: string[]) => {
    try {
      await reorderFeatured(orderedIds)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reorder courses.'
      toast.error(message, { title: 'Reorder failed' })
    }
  }

  const handleConfirmRemove = async () => {
    if (!pendingRemove) return
    setIsRemoving(true)
    try {
      await removeFeatured(pendingRemove.id)
      toast.success(`"${pendingRemove.title}" removed from featured courses.`, {
        title: 'Course removed',
      })
      setPendingRemove(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove course.'
      toast.error(message, { title: 'Remove failed' })
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-nav transition-colors hover:text-ink-heading"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to Course Management
          </button>
          <Header1>Featured Courses</Header1>
          <Paragraph variant="muted" className="mt-1 max-w-2xl">
            Curate and order the published courses promoted across the platform.
          </Paragraph>
        </div>

        <Button className="shrink-0" onClick={() => setIsAddOpen(true)}>
          <Plus className="size-4" aria-hidden />
          Add Featured Course
        </Button>
      </div>

      <FeaturedCoursesTable
        courses={featured}
        isLoading={isLoading}
        isBusy={isReordering}
        onReorder={handleReorder}
        onRemove={setPendingRemove}
      />

      <AddFeaturedCourseModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />

      <ConfirmModal
        open={pendingRemove !== null}
        onClose={() => !isRemoving && setPendingRemove(null)}
        onConfirm={handleConfirmRemove}
        isLoading={isRemoving}
        title="Remove featured course?"
        message={
          pendingRemove
            ? `"${pendingRemove.title}" will no longer be promoted on the platform.`
            : ''
        }
        confirmLabel={isRemoving ? 'Removing…' : 'Remove'}
        confirmVariant="outline-danger"
      />
    </div>
  )
}
