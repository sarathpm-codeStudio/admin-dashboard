import { Download, Eye, ShieldCheck } from 'lucide-react'
import { Card, CardBody, cardPaddingClass } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

export type FacultyIdVerification = {
  id: string
  document_type: string | null
  document_url: string | null
  created_at?: string | null
}

type FacultyIdVerificationCardProps = {
  document: FacultyIdVerification | null
  className?: string
}

function openDocument(fileUrl: string) {
  window.open(fileUrl, '_blank', 'noopener,noreferrer')
}

async function downloadDocument(fileUrl: string, fileName: string) {
  try {
    const response = await fetch(fileUrl)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = fileName
    link.click()
    URL.revokeObjectURL(objectUrl)
  } catch {
    openDocument(fileUrl)
  }
}

function formatType(type: string | null) {
  if (!type) return 'ID Document'
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function FacultyIdVerificationCard({ document: doc, className }: FacultyIdVerificationCardProps) {
  const fileName = doc?.document_url?.split('/').pop() ?? 'document'

  return (
    <Card className={cn(cardPaddingClass, className)}>
      <CardBody className="gap-5">
        <SectionHeader
          title="ID Verification"
          icon={ShieldCheck}
          titleSize="card"
          className="items-center"
        />
        {doc?.document_url ? (
          <div className="flex items-center justify-between gap-3 rounded-nav bg-primary-50 px-3 py-2.5">
            <div className="min-w-0">
              <Paragraph variant="small" className="uppercase tracking-wide text-ink-heading">
                {formatType(doc.document_type)}
              </Paragraph>
              <Paragraph variant="caption" className="truncate text-nav">
                {fileName}
              </Paragraph>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label="View ID document"
                onClick={() => openDocument(doc.document_url!)}
                className={cn(
                  'flex size-8 items-center justify-center rounded-nav',
                  'text-primary transition-colors hover:bg-primary-100',
                )}
              >
                <Eye className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Download ID document"
                onClick={() => downloadDocument(doc.document_url!, fileName)}
                className={cn(
                  'flex size-8 items-center justify-center rounded-nav',
                  'text-primary transition-colors hover:bg-primary-100',
                )}
              >
                <Download className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        ) : (
          <Paragraph variant="body" className="text-nav">
            No ID document submitted.
          </Paragraph>
        )}
      </CardBody>
    </Card>
  )
}
