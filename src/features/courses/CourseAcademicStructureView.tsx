import {
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  Folder,
  Home,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  MoveLeft,
  StickyNote,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { CourseContentItem } from '@/api/courseManagement/courseManagement.api'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Skeleton } from '@/components/ui/Skeleton'
import { Header1, Paragraph } from '@/components/ui/Typography'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import {
  useGetCourseContent,
  useGetCourseDetail,
} from '@/features/courses/hooks/useCourseManagement'
import { buildTpStreamsEmbedUrl } from '@/utils/video'
import { cn } from '@/utils/cn'

type MaterialType = NonNullable<CourseContentItem['type']>

type MaterialMeta = {
  label: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
}

const MATERIAL_META: Record<MaterialType, MaterialMeta> = {
  VIDEO: { label: 'Video', icon: Video, iconBg: 'bg-[#E8EBFF]', iconColor: 'text-primary' },
  PDF: { label: 'Document', icon: FileText, iconBg: 'bg-[#FEE7E7]', iconColor: 'text-[#D63B3B]' },
  IMAGE: { label: 'Image', icon: ImageIcon, iconBg: 'bg-[#E5F6EA]', iconColor: 'text-[#1F9D55]' },
  NOTES: { label: 'Notes', icon: StickyNote, iconBg: 'bg-[#FFF6DC]', iconColor: 'text-[#B7791F]' },
  LINK: { label: 'Link', icon: LinkIcon, iconBg: 'bg-[#E0F1FB]', iconColor: 'text-[#1A7EBE]' },
  TEST: { label: 'Test', icon: ClipboardList, iconBg: 'bg-[#FFF6DC]', iconColor: 'text-[#B7791F]' },
}

function formatDuration(sec?: number | null): string | null {
  if (!sec || sec <= 0) return null
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m`
  return `${sec}s`
}

function videoStatusLabel(status?: string | null): string | null {
  if (!status) return null
  const s = String(status).toUpperCase()
  if (s === 'COMPLETED') return 'Ready to play'
  if (s === 'UPLOADED') return 'Waiting for transcoding'
  if (s === 'TRANSCODING') return 'Transcoding…'
  if (s === 'FAILED') return 'Failed'
  return 'Uploading…'
}

export function CourseAcademicStructureView() {
  const { courseId = null } = useParams<{ courseId: string }>()
  const navigate = useNavigate()

  const [navPath, setNavPath] = useState<{ id: string; title: string }[]>([])
  const [previewItem, setPreviewItem] = useState<CourseContentItem | null>(null)

  const currentParentId = navPath.length > 0 ? (navPath[navPath.length - 1]?.id ?? null) : null
  const currentFolderTitle = navPath[navPath.length - 1]?.title ?? ''

  const { data: detail } = useGetCourseDetail(courseId)
  const { data: items = [], isLoading } = useGetCourseContent(courseId, currentParentId)

  const drillInto = (folder: CourseContentItem) =>
    setNavPath((prev) => [...prev, { id: folder.id, title: folder.title }])
  const goBack = () => setNavPath((prev) => prev.slice(0, -1))
  const jumpTo = (idx: number) => setNavPath((prev) => prev.slice(0, idx + 1))

  const openMaterial = (item: CourseContentItem) => {
    if (item.type === 'TEST') return
    setPreviewItem(item)
  }

  const folderSubtitle = (item: CourseContentItem) => {
    const parts: string[] = []
    if (item.total_video) parts.push(`${item.total_video} video${item.total_video > 1 ? 's' : ''}`)
    if (item.total_test) parts.push(`${item.total_test} test${item.total_test > 1 ? 's' : ''}`)
    if (item.total_notes) parts.push(`${item.total_notes} note${item.total_notes > 1 ? 's' : ''}`)
    return parts.join(' • ') || 'Folder'
  }

  return (
    <div className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto">
      <div className="space-y-3">
        <Breadcrumbs
          items={[
            { label: 'Courses', to: '/courses' },
            { label: detail?.title ?? 'Course' },
            { label: 'Academic Structure' },
          ]}
        />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Header1>Academic Structure</Header1>
            {detail?.title ? (
              <Paragraph variant="muted" className="mt-1 truncate">
                {detail.title}
              </Paragraph>
            ) : null}
          </div>
          <Button type="button" variant="outline" onClick={() => navigate('/courses')}>
            <MoveLeft size={16} /> Back to Courses
          </Button>
        </div>
      </div>

      <Card className="space-y-3 p-5">
        {/* Folder breadcrumb / back */}
        {navPath.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 rounded-nav bg-surface-input px-3 py-2">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-bold text-primary shadow-sm transition-colors hover:bg-primary hover:text-white"
            >
              <MoveLeft size={14} /> Back
            </button>
            <span className="h-5 w-px bg-[#e2e8f0]" />
            <button
              type="button"
              onClick={() => setNavPath([])}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-nav transition-colors hover:bg-white hover:text-primary"
            >
              <Home size={12} /> Root
            </button>
            {navPath.map((crumb, idx) => {
              const isLast = idx === navPath.length - 1
              return (
                <span key={crumb.id} className="flex min-w-0 items-center gap-1">
                  <ChevronRight size={12} className="shrink-0 text-[#cbd5e1]" />
                  <button
                    type="button"
                    onClick={() => jumpTo(idx)}
                    className={cn(
                      'max-w-[180px] truncate rounded-md px-2 py-1 text-xs font-semibold transition-colors',
                      isLast
                        ? 'cursor-default bg-white text-primary shadow-sm'
                        : 'text-nav hover:bg-white hover:text-primary',
                    )}
                  >
                    {crumb.title}
                  </button>
                </span>
              )
            })}
          </div>
        ) : null}

        {/* Current folder header */}
        {navPath.length > 0 ? (
          <div className="flex items-center gap-2 rounded-nav bg-primary px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Folder size={17} className="text-white" />
            </div>
            <div className="min-w-0">
              <Paragraph variant="emphasis" className="truncate text-white">
                {currentFolderTitle}
              </Paragraph>
              <p className="mt-0.5 text-xs text-white/70">
                {items.length} item{items.length !== 1 ? 's' : ''}
                {items.length === 0 ? ' • Empty' : ''}
              </p>
            </div>
          </div>
        ) : null}

        {/* Items */}
        <div className="space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#e2e8f0] py-12 text-center">
              <Paragraph variant="muted">No content in this section.</Paragraph>
            </div>
          ) : (
            items.map((item) =>
              item.item_type === 'folder' ? (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => drillInto(item)}
                  className="flex w-full items-center justify-between rounded-xl bg-surface-input px-4 py-3 text-left transition-colors hover:bg-[#e8eaed]"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
                      <Folder size={17} />
                    </div>
                    <div className="min-w-0">
                      <Paragraph variant="emphasis" className="truncate text-ink-heading">
                        {item.title}
                      </Paragraph>
                      <p className="mt-0.5 text-xs text-nav">{folderSubtitle(item)}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-nav" />
                </button>
              ) : (
                <MaterialRow key={item.id} item={item} onOpen={() => openMaterial(item)} />
              ),
            )
          )}
        </div>
      </Card>

      <MaterialPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  )
}

function MaterialRow({ item, onOpen }: { item: CourseContentItem; onOpen: () => void }) {
  const meta = MATERIAL_META[item.type ?? 'PDF'] ?? MATERIAL_META.PDF
  const Icon = meta.icon
  const isTest = item.type === 'TEST'

  const subtitleExtra =
    item.type === 'VIDEO'
      ? (formatDuration(item.duration_sec) ?? videoStatusLabel(item.video_uploading_status))
      : isTest && item.material_status !== 'READY'
        ? 'Draft'
        : null

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={isTest}
      className={cn(
        'flex w-full items-center justify-between rounded-xl border border-[#e2e8f0]/80 bg-white px-4 py-3 text-left transition-colors',
        isTest ? 'cursor-default' : 'hover:border-primary/30',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-xl',
            meta.iconBg,
            meta.iconColor,
          )}
        >
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <Paragraph variant="emphasis" className="truncate text-ink-heading">
            {item.title}
          </Paragraph>
          <p className="mt-0.5 text-xs text-nav">
            {meta.label}
            {subtitleExtra ? (
              <span className={cn('ml-1', subtitleExtra === 'Draft' && 'text-red-500')}>
                · {subtitleExtra}
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </button>
  )
}

function MaterialPreviewModal({
  item,
  onClose,
}: {
  item: CourseContentItem | null
  onClose: () => void
}) {
  const meta = item ? (MATERIAL_META[item.type ?? 'PDF'] ?? MATERIAL_META.PDF) : null
  const Icon = meta?.icon
  const fileUrl = item?.file_url ?? item?.external_url ?? undefined
  const videoEmbed = buildTpStreamsEmbedUrl(item?.video_asset_id)
  const videoBlocked =
    item?.type === 'VIDEO' &&
    item.video_uploading_status &&
    String(item.video_uploading_status).toUpperCase() !== 'COMPLETED'

  return (
    <ConfirmModal
      open={item !== null}
      onClose={onClose}
      onConfirm={() => {}}
      title={item?.title || meta?.label || 'Preview'}
      message=""
      className="max-w-3xl"
      footer={
        <div className="flex items-center justify-between gap-3">
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <Download size={14} /> Open in new tab
            </a>
          ) : (
            <span />
          )}
          <Button type="button" variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      {item ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-xl',
                meta?.iconBg,
                meta?.iconColor,
              )}
            >
              {Icon ? <Icon size={16} /> : null}
            </div>
            <div className="min-w-0">
              <Paragraph variant="emphasis" className="truncate">
                {item.title}
              </Paragraph>
              <p className="text-xs text-nav">{meta?.label}</p>
            </div>
          </div>

          <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-xl bg-surface-input">
            {item.type === 'IMAGE' && fileUrl ? (
              <img src={fileUrl} alt={item.title} className="max-h-[65vh] w-auto object-contain" />
            ) : item.type === 'PDF' && fileUrl ? (
              <iframe
                src={fileUrl}
                title={item.title}
                className="h-[65vh] w-full border-0 bg-white"
              />
            ) : item.type === 'VIDEO' && videoEmbed && !videoBlocked ? (
              <div className="w-full">
                <VideoPlayer src={videoEmbed} poster={item.video_cover_img} />
              </div>
            ) : item.type === 'VIDEO' && videoBlocked ? (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                <Loader2 size={22} className="animate-spin text-primary" />
                <Paragraph variant="muted">
                  {videoStatusLabel(item.video_uploading_status)}
                </Paragraph>
              </div>
            ) : item.type === 'LINK' && fileUrl ? (
              <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                <LinkIcon size={32} className="text-[#1A7EBE]" />
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm font-semibold text-primary hover:underline"
                >
                  {fileUrl}
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                <StickyNote size={28} className="text-[#cbd5e1]" />
                <Paragraph variant="muted">No preview available for this material.</Paragraph>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </ConfirmModal>
  )
}
