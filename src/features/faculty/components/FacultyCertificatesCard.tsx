import { Download, Eye } from 'lucide-react'
import { AiOutlineSafetyCertificate } from 'react-icons/ai'
import type { FacultyCertificate } from '@/features/faculty/data/mockFacultyDetail'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

type FacultyCertificatesCardProps = {
  certificates: FacultyCertificate[]
}

export function FacultyCertificatesCard({ certificates }: FacultyCertificatesCardProps) {
  return (
    <div className="rounded-card bg-primary-gradient p-5 text-white shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <AiOutlineSafetyCertificate className="size-5 shrink-0" aria-hidden />
        <Paragraph variant="emphasis" className="text-white">
          Certificates
        </Paragraph>
      </div>
      <ul className="m-0 list-none space-y-3 p-0">
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
                className={cn(
                  'flex size-8 items-center justify-center rounded-nav',
                  'text-white/90 transition-colors hover:bg-white/20',
                )}
              >
                <Eye className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label={`Download ${certificate.label}`}
                className={cn(
                  'flex size-8 items-center justify-center rounded-nav',
                  'text-white/90 transition-colors hover:bg-white/20',
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
