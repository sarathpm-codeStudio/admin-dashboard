import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Plus, X } from 'lucide-react'
import { SearchInput } from '@/components/ui/SearchInput'
import { Header2, Paragraph } from '@/components/ui/Typography'
import { useToast } from '@/hooks/useToast'
import {
  useAddFeaturedCourse,
  useGetPublishableCourses,
} from '@/features/courses/hooks/useFeaturedCourses'

type AddFeaturedCourseModalProps = {
  open: boolean
  onClose: () => void
}

export function AddFeaturedCourseModal({ open, onClose }: AddFeaturedCourseModalProps) {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [addingId, setAddingId] = useState<string | null>(null)

  const { data: courses = [], isLoading } = useGetPublishableCourses(debouncedSearch, open)
  const { mutateAsync: addFeaturedCourse } = useAddFeaturedCourse()

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [search])

  // Reset local state whenever the modal is opened.
  useEffect(() => {
    if (open) {
      setSearch('')
      setDebouncedSearch('')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const handleAdd = async (courseId: string, title: string) => {
    setAddingId(courseId)
    try {
      await addFeaturedCourse(courseId)
      toast.success(`"${title}" added to featured courses.`, { title: 'Course featured' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add featured course.'
      toast.error(message, { title: 'Could not add course' })
    } finally {
      setAddingId(null)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-featured-title"
        className="relative flex max-h-[80vh] w-full max-w-2xl flex-col rounded-card border border-[#e2e8f0]/60 bg-surface-card p-6 shadow-lg"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-nav p-1 text-nav transition-colors hover:bg-surface-input hover:text-ink-heading"
        >
          <X className="size-4" aria-hidden />
        </button>

        <Header2 size="section" id="add-featured-title" className="pr-8">
          Add Featured Course
        </Header2>
        <Paragraph variant="muted" className="mt-1">
          Choose a published course to promote on the storefront.
        </Paragraph>

        <div className="mt-4">
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search published courses…"
            autoFocus
          />
        </div>

        <div className="scrollbar-none mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-nav">
              <Loader2 className="size-5 animate-spin" aria-hidden />
            </div>
          ) : courses.length === 0 ? (
            <Paragraph variant="muted" className="py-12 text-center">
              {debouncedSearch
                ? 'No published courses match your search.'
                : 'All published courses are already featured.'}
            </Paragraph>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center gap-3 rounded-card border border-[#e2e8f0]/60 p-2.5"
              >
                {course.coverImage ? (
                  <img
                    src={course.coverImage}
                    alt={course.title}
                    className="h-12 w-16 shrink-0 rounded-lg bg-[#F1F5F9] object-contain"
                  />
                ) : (
                  <div className="h-12 w-16 shrink-0 rounded-lg bg-[#F1F5F9]" aria-hidden />
                )}
                <div className="min-w-0 flex-1">
                  <Paragraph
                    variant="emphasis"
                    className="truncate text-sm font-extrabold text-[#44474E]"
                  >
                    {course.title}
                  </Paragraph>
                  <Paragraph variant="muted" className="truncate text-xs font-bold text-nav">
                    {course.facultyName} · {course.isFree ? 'Free' : course.priceDisplay}
                  </Paragraph>
                </div>
                <button
                  type="button"
                  disabled={addingId !== null}
                  onClick={() => handleAdd(course.id, course.title)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-nav border border-primary-200 bg-white px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-50 disabled:pointer-events-none disabled:opacity-50"
                >
                  {addingId === course.id ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Plus className="size-4" aria-hidden />
                  )}
                  Add
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
