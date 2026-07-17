import { ClipboardList, FileText, Video } from 'lucide-react'
import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Skeleton } from '@/components/ui/Skeleton'
import { StarRating } from '@/components/ui/StarRating'
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
  const { data: detail, isLoading } = useGetCourseDetail(courseId)

  const introVideoUrl = buildTpStreamsEmbedUrl(detail?.introVideoAssetId)

  const handleTakeAction = () => {
    if (!detail) return
    onTakeAction(detail.id)
    onClose()
  }

  const handleView = () => {
    if (!detail) return
    onClose()
    navigate(`/courses/${detail.id}/course-details`, {
      state: { reopenReview: true },
    })
  }

  const footer =
    detail && !isLoading ? (
      <div className="flex w-full flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleView}
        >
          View
        </Button>
        <Button
          type="button"
          variant="primary"
          className="w-full"
          onClick={handleTakeAction}
        >
          Take Action
        </Button>
      </div>
    ) : (
      <></>
    )

  return (
    <ConfirmModal
      open={courseId !== null}
      onClose={onClose}
      onConfirm={() => { }}
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
                  {detail.isFree ? 'Free' : detail.finalPriceDisplay}
                </Paragraph>
                {detail.hasDiscount ? (
                  <Paragraph variant="muted" className="text-sm line-through">
                    {detail?.isFree ? "" : detail.priceDisplay}
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
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {detail.category ? (
                    <Paragraph
                      variant="small"
                      className="font-bold uppercase tracking-wide text-primary"
                    >
                      {detail.category}
                    </Paragraph>
                  ) : null}
                  {/* Average rating — stars fill proportionally to avg_rating */}
                  <span className="flex items-center gap-1.5">
                    <StarRating
                      value={detail.avgRating}
                      starSizeClass="size-4"
                      activeClassName="text-[#F59E0B]"
                      inactiveClassName="text-[#E2E8F0]"
                    />
                    <span className="text-sm font-bold text-ink-heading">
                      {detail.avgRating.toFixed(1)}
                    </span>
                    <Paragraph variant="caption" className="text-nav">
                      ({detail.totalReviews.toLocaleString('en-IN')})
                    </Paragraph>
                  </span>
                </div>
                <Paragraph variant="emphasis" className="mt-1 line-clamp-2 text-base">
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

            {/* Content breakdown — video / pdf / test counts only */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Paragraph
                  variant="small"
                  className="font-semibold uppercase tracking-wide text-nav"
                >
                  Content Breakdown
                </Paragraph>
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
