import { ClipboardList, FileText, Video } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/StatusBadge'
import { Paragraph } from '@/components/ui/Typography'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { useGetCourseDetail } from '@/features/courses/hooks/useCourseManagement'
import type { CourseApprovalStatus } from '@/features/courses/types'
import { buildTpStreamsEmbedUrl } from '@/utils/video'

type CourseReviewModalProps = {
  courseId: string | null
  onClose: () => void
  /** Selects the course in the table so bulk actions can be applied. */
  onTakeAction: (courseId: string) => void
}

const statusLabel: Record<CourseApprovalStatus, string> = {
  APPROVED: 'Approved',
  PENDING: 'Pending',
  REJECTED: 'Rejected',
  RESUBMIT: 'Resubmitted',
}

const statusVariant: Record<CourseApprovalStatus, StatusBadgeVariant> = {
  APPROVED: 'active',
  PENDING: 'pending',
  REJECTED: 'rejected',
  RESUBMIT: 'info',
}

function MaterialRow({
  icon,
  label,
  meta,
}: {
  icon: ReactNode
  label: string
  meta?: string
}) {
  return (
    <div className="flex items-center justify-between rounded-nav bg-surface-input px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm font-semibold text-ink-heading">
        <span className="text-primary">{icon}</span>
        {label}
      </span>
      {meta ? (
        <Paragraph variant="small" className="text-nav">
          {meta}
        </Paragraph>
      ) : null}
    </div>
  )
}

export function CourseReviewModal({
  courseId,
  onClose,
  onTakeAction,
}: CourseReviewModalProps) {
  const navigate = useNavigate()
  const [descExpanded, setDescExpanded] = useState(false)
  const { data: detail, isLoading } = useGetCourseDetail(courseId)

  // A description is "long" if it spills past roughly three lines.
  const isLongDescription = (detail?.description?.length ?? 0) > 180

  const introVideoUrl = buildTpStreamsEmbedUrl(detail?.introVideoAssetId)

  const handleTakeAction = () => {
    if (!detail) return
    onTakeAction(detail.id)
    setDescExpanded(false)
    onClose()
  }

  const footer =
    detail && !isLoading ? (
      <Button
        type="button"
        variant="primary"
        className="w-full"
        onClick={handleTakeAction}
      >
        Take Action
      </Button>
    ) : null

  return (
    <ConfirmModal
      open={courseId !== null}
      onClose={() => {
        setDescExpanded(false)
        onClose()
      }}
      onConfirm={() => {}}
      title="Review Course"
      message=""
      className="max-w-4xl"
      footer={footer}
    >
      {isLoading || !detail ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Left column — video + price */}
          <div className="space-y-4">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <div className="rounded-card border border-amber-200 bg-amber-50 px-4 py-3">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="mt-2 h-5 w-20 rounded" />
            </div>
          </div>

          {/* Right column — details */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-12 rounded" />
                <Skeleton className="h-5 w-40 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-32 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-36 rounded" />
              <Skeleton className="h-10 w-full rounded-nav" />
              <Skeleton className="h-10 w-full rounded-nav" />
              <Skeleton className="h-10 w-full rounded-nav" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Left column — intro video + price */}
          <div className="space-y-4">
            {introVideoUrl ? (
              <VideoPlayer src={introVideoUrl} poster={detail.coverImage} />
            ) : detail.coverImage ? (
              <img
                src={detail.coverImage}
                alt={detail.title}
                className="aspect-video w-full rounded-xl bg-surface-input object-contain"
              />
            ) : null}

            {/* Price — final price on the left, original (struck) price on the right */}
            <div className="rounded-card border border-amber-200 bg-amber-50 px-4 py-3">
              <Paragraph
                variant="small"
                className="font-semibold uppercase tracking-wide text-amber-700"
              >
                Course Price
              </Paragraph>
              <div className="mt-0.5 flex items-baseline gap-2">
                <Paragraph variant="emphasis" className="text-lg">
                  {detail.finalPriceDisplay}
                </Paragraph>
                {detail.hasDiscount ? (
                  <Paragraph variant="muted" className="text-sm line-through">
                    {detail.priceDisplay}
                  </Paragraph>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right column — details */}
          <div className="space-y-4">
          {/* Title, instructor, status, posted date */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {detail.category ? (
                <Paragraph
                  variant="small"
                  className="font-bold uppercase tracking-wide text-primary"
                >
                  {detail.category}
                </Paragraph>
              ) : null}
              <Paragraph variant="emphasis" className="line-clamp-2 text-base">
                {detail.title}
              </Paragraph>
              <Paragraph variant="muted">Instructor: {detail.facultyName}</Paragraph>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <Paragraph variant="small" className="text-nav">
                Post on: {detail.postedOnDisplay}
              </Paragraph>
              <StatusBadge
                label={statusLabel[detail.status]}
                variant={statusVariant[detail.status]}
                appearance="filled"
                className="font-bold"
              />
            </div>
          </div>

          {/* Description */}
          {detail.description ? (
            <div>
              <Paragraph
                variant="small"
                className="mb-1.5 font-semibold uppercase tracking-wide text-nav"
              >
                Description Preview
              </Paragraph>
              <Paragraph
                variant="muted"
                className={descExpanded ? undefined : 'line-clamp-3'}
              >
                {detail.description}
              </Paragraph>
              {isLongDescription ? (
                <button
                  type="button"
                  onClick={() => setDescExpanded((prev) => !prev)}
                  className="mt-1 text-xs font-semibold text-primary hover:underline"
                >
                  {descExpanded ? 'Read less' : 'Read more'}
                </button>
              ) : null}
            </div>
          ) : null}

          {/* Content breakdown — video / pdf / test counts only */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Paragraph
                variant="small"
                className="font-semibold uppercase tracking-wide text-nav"
              >
                Content Breakdown
              </Paragraph>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  navigate(`/courses/${detail.id}/structure`)
                }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View Academic Structure
              </button>
            </div>
            <div className="space-y-2">
              <MaterialRow
                icon={<Video className="size-4" aria-hidden />}
                label={`${detail.videoCount} Video Lectures`}
              />
              <MaterialRow
                icon={<FileText className="size-4" aria-hidden />}
                label={`${detail.pdfCount} PDF`}
              />
              <MaterialRow
                icon={<ClipboardList className="size-4" aria-hidden />}
                label={`${detail.testCount} Practice Sets`}
              />
            </div>
          </div>
          </div>
        </div>
      )}
    </ConfirmModal>
  )
}
