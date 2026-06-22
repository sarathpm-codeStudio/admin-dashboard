import { Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, cardPaddingClass } from '@/components/ui/Card'
import { FileUploadZone } from '@/components/ui/FileUploadZone'
import { Header2, Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

type CreateAnnouncementSidebarProps = {
  bannerPreview: string | null
  onBannerChange: (file: File | null, previewUrl: string | null) => void
  onPublish: () => void
  isPublishing?: boolean
}

export function CreateAnnouncementSidebar({
  bannerPreview,
  onBannerChange,
  onPublish,
  isPublishing = false,
}: CreateAnnouncementSidebarProps) {
  return (
    <div className="space-y-6">
      <Card className={cn(cardPaddingClass, 'border-0 bg-primary-gradient-r text-white shadow-md')}>
        <Header2 size="card" className="text-white">
          Ready to Send?
        </Header2>
        <Button
          type="button"
          variant="secondary"
          className="mt-4 w-full bg-white text-primary hover:bg-white/90"
          onClick={onPublish}
          disabled={isPublishing}
        >
          <Send className="size-4" aria-hidden />
          {isPublishing ? 'Publishing...' : 'Publish Now'}
        </Button>
      </Card>

      <Card className={cardPaddingClass}>
        <Paragraph variant="emphasis" className="text-xs uppercase tracking-wide text-nav">
          Banner Image
        </Paragraph>
        <FileUploadZone
          previewUrl={bannerPreview}
          onFileSelect={onBannerChange}
          title="Upload Banner"
          className="mt-3"
        />
      </Card>
    </div>
  )
}
