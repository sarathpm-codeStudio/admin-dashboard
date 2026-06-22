import { ImagePlus } from 'lucide-react'
import { useRef } from 'react'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

export type FileUploadZoneProps = {
  previewUrl?: string | null
  onFileSelect: (file: File | null, previewUrl: string | null) => void
  accept?: string
  title?: string
  hint?: string
  actionLabel?: string
  className?: string
}

export function FileUploadZone({
  previewUrl,
  onFileSelect,
  accept = 'image/png,image/jpeg,image/gif,image/webp',
  title = 'Upload file',
  hint = 'PNG, JPG or GIF recommended',
  actionLabel = 'Click to upload or drag and drop',
  className,
}: FileUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      onFileSelect(null, null)
      return
    }
    onFileSelect(file, URL.createObjectURL(file))
  }

  return (
    <>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'flex w-full flex-col items-center justify-center rounded-card border-2 border-dashed border-[#e2e8f0] bg-[#FAFBFC] px-4 py-8 text-center transition-colors hover:border-primary-200 hover:bg-primary-50/30',
          previewUrl && 'p-2',
          className,
        )}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Upload preview" className="max-h-40 w-full rounded-lg object-cover" />
        ) : (
          <>
            <span className="flex size-12 items-center justify-center rounded-full bg-[#ECEEF2] text-nav">
              <ImagePlus className="size-6" aria-hidden />
            </span>
            <Paragraph variant="emphasis" className="mt-3">
              {title}
            </Paragraph>
            <Paragraph variant="caption" className="mt-1">
              {hint}
            </Paragraph>
            <Paragraph variant="caption" className="mt-2 text-primary">
              {actionLabel}
            </Paragraph>
          </>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  )
}
