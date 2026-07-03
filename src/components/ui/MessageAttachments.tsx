import { FileText, Download } from 'lucide-react'

export interface AttachItem {
  url: string
  name: string
  size?: number
}

interface MessageAttachmentsProps {
  kind: 'IMAGE' | 'PDF'
  items: AttachItem[]
  onOpenImage: (images: { url: string; name: string }[], index: number) => void
  onOpenPdf: (url: string, name: string) => void
  onDownload: (url: string, name: string) => void
}

const formatSize = (bytes?: number): string => {
  if (!bytes) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let s = bytes
  let u = 0
  while (s >= 1024 && u < units.length - 1) {
    s /= 1024
    u++
  }
  return `${s.toFixed(u === 0 ? 0 : 1)} ${units[u]}`
}

// Renders a message's attachments: a WhatsApp-style album grid for images
// (1 / 2 / 3 / 4+ layouts with a "+N" tile), or a stacked list of cards for
// PDFs. All in one bubble.
export function MessageAttachments({
  kind,
  items,
  onOpenImage,
  onOpenPdf,
  onDownload,
}: MessageAttachmentsProps) {
  if (!items.length) return null

  if (kind === 'PDF') {
    return (
      <div className="flex flex-col gap-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2">
            <button
              type="button"
              onClick={() => onOpenPdf(it.url, it.name)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
              title="View document"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <FileText size={14} className="text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-gray-800">{it.name || 'Document'}</p>
                <p className="text-[10px] text-gray-400">
                  {[formatSize(it.size), 'PDF Document'].filter(Boolean).join(' • ')}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onDownload(it.url, it.name)}
              title="Download"
              className="shrink-0 text-gray-400 hover:text-gray-700"
            >
              <Download size={14} />
            </button>
          </div>
        ))}
      </div>
    )
  }

  // IMAGE album.
  const images = items.map((it) => ({ url: it.url, name: it.name }))

  if (images.length === 1) {
    const it = images[0]!
    return (
      <div className="group/img relative">
        <button type="button" onClick={() => onOpenImage(images, 0)} className="block" title="View image">
          <img
            src={it.url}
            alt={it.name}
            loading="lazy"
            className="max-h-[280px] max-w-[230px] rounded-lg object-cover"
          />
        </button>
        <button
          type="button"
          onClick={() => onDownload(it.url, it.name)}
          title="Download"
          className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover/img:opacity-100"
        >
          <Download size={14} />
        </button>
      </div>
    )
  }

  const shown = images.slice(0, 4)
  const extra = images.length - shown.length

  return (
    <div className="grid w-[230px] grid-cols-2 gap-1">
      {shown.map((it, i) => {
        const wide = images.length === 3 && i === 0
        return (
          <button
            key={i}
            type="button"
            onClick={() => onOpenImage(images, i)}
            className={`relative overflow-hidden rounded-lg ${wide ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}
            title="View image"
          >
            <img src={it.url} alt={it.name} loading="lazy" className="h-full w-full object-cover" />
            {i === 3 && extra > 0 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                +{extra}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default MessageAttachments
