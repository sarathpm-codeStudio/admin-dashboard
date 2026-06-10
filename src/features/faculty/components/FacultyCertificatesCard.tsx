import { Download, Eye } from 'lucide-react'
import { AiOutlineSafetyCertificate } from 'react-icons/ai'
import type { FacultyCertificate } from '@/features/faculty/data/mockFacultyDetail'
import {
  FACULTY_PROFILE_CARD_HEIGHT,
  FACULTY_PROFILE_CARD_SCROLL_CLASS,
} from '@/features/faculty/utils/constants'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

type FacultyCertificatesCardProps = {
  certificates: FacultyCertificate[]
  className?: string
}

function openCertificate(fileUrl: string) {
  window.open(fileUrl, '_blank', 'noopener,noreferrer')
}

async function downloadCertificate(fileUrl: string, fileName: string) {
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
    openCertificate(fileUrl)
  }
}

export function FacultyCertificatesCard({ certificates, className }: FacultyCertificatesCardProps) {
  return (
    <div
      className={cn(
        FACULTY_PROFILE_CARD_HEIGHT,
        'flex flex-col overflow-hidden rounded-card bg-primary-gradient p-5 text-white shadow-sm',
        className,
      )}
    >
      <div className="mb-4 flex shrink-0 items-center gap-2">
        <AiOutlineSafetyCertificate className="size-5 shrink-0" aria-hidden />
        <Paragraph variant="emphasis" className="text-white">
          Certificates
        </Paragraph>
      </div>
      <ul className={cn('m-0 list-none space-y-3 p-0', FACULTY_PROFILE_CARD_SCROLL_CLASS)}>
        {certificates.map((certificate) => (
          <li
            key={certificate.id}
            className="flex items-center justify-between gap-3 rounded-nav bg-white/10 px-3 py-2.5"
          >
            <div className="min-w-0">
              <Paragraph variant="small" className="uppercase tracking-wide text-white/90">
                {certificate.label}
              </Paragraph>
              <Paragraph variant="caption" className="truncate text-white/70">
                {certificate.fileName}
              </Paragraph>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label={`View ${certificate.label}`}
                disabled={!certificate.fileUrl}
                onClick={() => openCertificate(certificate.fileUrl)}
                className={cn(
                  'flex size-8 items-center justify-center rounded-nav',
                  'text-white/90 transition-colors hover:bg-white/20',
                  'disabled:pointer-events-none disabled:opacity-40',
                )}
              >
                <Eye className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label={`Download ${certificate.label}`}
                disabled={!certificate.fileUrl}
                onClick={() => downloadCertificate(certificate.fileUrl, certificate.fileName)}
                className={cn(
                  'flex size-8 items-center justify-center rounded-nav',
                  'text-white/90 transition-colors hover:bg-white/20',
                  'disabled:pointer-events-none disabled:opacity-40',
                )}
              >
                <Download className="size-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
