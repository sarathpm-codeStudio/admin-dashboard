import { Image as ImageIcon, TicketPercent } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { CourseDetail } from '@/api/courseManagement/courseManagement.api'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { StarRating } from '@/components/ui/StarRating'
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/StatusBadge'
import { Header2, Paragraph } from '@/components/ui/Typography'
import type { CourseApprovalStatus } from '@/features/courses/types'
import { cn } from '@/utils/cn'

const statusVariant: Record<CourseApprovalStatus, StatusBadgeVariant> = {
  APPROVED: 'active',
  PENDING: 'pending',
  REJECTED: 'rejected',
  RESUBMIT: 'info',
}

const statusLabel: Record<CourseApprovalStatus, string> = {
  APPROVED: 'Approved',
  PENDING: 'Pending',
  REJECTED: 'Rejected',
  RESUBMIT: 'Resubmit',
}

type CourseOverviewSectionProps = {
  detail: CourseDetail | undefined
  isLoading?: boolean
}

/** Course basics + full pricing/discount breakdown, shown above the course tabs */
export function CourseOverviewSection({ detail, isLoading }: CourseOverviewSectionProps) {
  if (isLoading || !detail) {
    return <CourseOverviewSkeleton />
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <CourseBasicsCard detail={detail} />
      <CoursePricingCard detail={detail} />
    </div>
  )
}

function CourseBasicsCard({ detail }: { detail: CourseDetail }) {
  const [descExpanded, setDescExpanded] = useState(false)
  const isLongDescription = (detail.description?.length ?? 0) > 140

  const contentSummary =
    [
      detail.videoCount ? `${detail.videoCount} video${detail.videoCount > 1 ? 's' : ''}` : null,
      detail.pdfCount ? `${detail.pdfCount} PDF${detail.pdfCount > 1 ? 's' : ''}` : null,
      detail.testCount ? `${detail.testCount} test${detail.testCount > 1 ? 's' : ''}` : null,
    ]
      .filter(Boolean)
      .join(' · ') || 'No content yet'

  return (
    <Card className="p-5 lg:col-span-2">
      <div className="flex flex-col gap-5 sm:flex-row">
        {/* Cover — self-start so the flex row doesn't stretch the box and break its 16:9 ratio */}
        <div className="aspect-video w-full shrink-0 self-start overflow-hidden rounded-xl bg-surface-input sm:w-[240px]">
          {detail.coverImage ? (
            <img
              src={detail.coverImage}
              alt={detail.title}
              className="size-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ImageIcon className="size-8 text-[#cbd5e1]" aria-hidden />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {detail.category ? (
              <span className="rounded-md bg-[#EAF1FE] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#3B82F6]">
                {detail.category}
              </span>
            ) : null}
            {/* A draft has no meaningful approval state yet, so it shows Draft instead */}
            {detail.isDraft ? (
              <StatusBadge
                label="Draft"
                variant="draft"
                className="rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
              />
            ) : (
              <StatusBadge
                label={statusLabel[detail.status]}
                variant={statusVariant[detail.status]}
                className="rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
              />
            )}
          </div>

          <Header2 size="card" className="mt-2 text-ink-heading">
            {detail.title}
          </Header2>

          {/* Faculty + rating */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
            <Paragraph variant="muted">
              By <span className="font-semibold text-ink-heading">{detail.facultyName}</span>
            </Paragraph>
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
              <Paragraph variant="caption">
                ({detail.totalReviews.toLocaleString('en-IN')} reviews)
              </Paragraph>
            </span>
          </div>

          {detail.description ? (
            <div className="mt-3">
              <Paragraph
                variant="muted"
                className={descExpanded ? undefined : 'line-clamp-2'}
              >
                {detail.description}
              </Paragraph>
              {isLongDescription ? (
                <button
                  type="button"
                  onClick={() => setDescExpanded((prev) => !prev)}
                  className="mt-1 text-sm font-semibold text-primary hover:underline"
                >
                  {descExpanded ? 'Read less' : 'Read more'}
                </button>
              ) : null}
            </div>
          ) : null}

          {/* Meta grid — 2 cols below lg (avoids ellipsis beside cover); 4 cols on desktop */}
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[#e2e8f0]/60 pt-4 lg:grid-cols-4">
            <MetaItem label="Level" value={detail.level || '—'} />
            <MetaItem label="Validity" value={detail.validityDisplay} />
            <MetaItem
              label="Language"
              value={detail.languages.length ? detail.languages.join(', ') : '—'}
            />
            <MetaItem label="Posted on" value={detail.postedOnDisplay} />
            <MetaItem label="Content" value={contentSummary} />
          </div>
        </div>
      </div>
    </Card>
  )
}

function CoursePricingCard({ detail }: { detail: CourseDetail }) {
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        <Header2 size="card" className="text-ink-heading">
          Pricing
        </Header2>
        {detail.hasDiscount && detail.discountPercentDisplay ? (
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
            {detail.discountPercentDisplay}
          </span>
        ) : null}
      </div>

      {/* Headline price */}
      <div className="mt-3 flex flex-wrap items-baseline gap-2">
        <p className="text-[28px] font-bold leading-none text-ink-heading">
          {detail.isFree ? 'Free' : detail.finalPriceDisplay}
        </p>
        {detail.hasDiscount ? (
          <p className="text-sm leading-none text-nav line-through">{detail.priceDisplay}</p>
        ) : null}
      </div>

      {detail.isFree ? (
        <Paragraph variant="muted" className="mt-3">
          This course is free — learners enroll without payment.
        </Paragraph>
      ) : (
        <div className="mt-4 space-y-2 border-t border-[#e2e8f0]/60 pt-4">
          <PriceRow label="Original price" value={detail.priceDisplay} />

          {detail.hasDiscount ? (
            <PriceRow
              label={
                <span className="flex flex-wrap items-center gap-1.5">
                  Discount
                  {detail.discountLabel ? (
                    <span className="rounded bg-surface-input px-1.5 py-0.5 text-[11px] font-semibold capitalize text-nav">
                      {detail.discountLabel}
                    </span>
                  ) : null}
                </span>
              }
              value={`− ${detail.discountAmountDisplay}`}
              valueClassName="text-emerald-600"
            />
          ) : (
            <PriceRow label="Discount" value="No discount applied" valueClassName="text-nav" />
          )}

          <div className="flex items-center justify-between gap-3 border-t border-[#e2e8f0]/60 pt-3">
            <Paragraph variant="emphasis" className="text-ink-heading">
              Final price
            </Paragraph>
            <Paragraph variant="emphasis" className="text-base text-ink-heading">
              {detail.finalPriceDisplay}
            </Paragraph>
          </div>
        </div>
      )}

      {/* Coupons */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#e2e8f0]/60 pt-4">
        <span className="flex items-center gap-2">
          <TicketPercent className="size-4 shrink-0 stroke-[1.5] text-nav" aria-hidden />
          <Paragraph variant="muted">Coupons</Paragraph>
        </span>
        <StatusBadge
          label={detail.couponsEnabled ? 'Enabled' : 'Disabled'}
          variant={detail.couponsEnabled ? 'active' : 'draft'}
          className="rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
        />
      </div>
    </Card>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wide text-nav">{label}</p>
      <p
        className="mt-1 break-words text-sm font-semibold text-ink-heading lg:truncate"
        title={value}
      >
        {value}
      </p>
    </div>
  )
}

function PriceRow({
  label,
  value,
  valueClassName,
}: {
  label: ReactNode
  value: ReactNode
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Paragraph variant="muted">{label}</Paragraph>
      <span className={cn('text-sm font-semibold text-ink-heading', valueClassName)}>{value}</span>
    </div>
  )
}

function CourseOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="p-5 lg:col-span-2">
        <div className="flex flex-col gap-5 sm:flex-row">
          <Skeleton className="aspect-video w-full shrink-0 rounded-xl sm:w-[220px]" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="mt-2 h-6 w-3/5" />
            <Skeleton className="mt-2 h-4 w-40" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-1.5 h-4 w-4/5" />
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#e2e8f0]/60 pt-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="mt-3 h-8 w-32" />
        <div className="mt-4 space-y-3 border-t border-[#e2e8f0]/60 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Card>
    </div>
  )
}
