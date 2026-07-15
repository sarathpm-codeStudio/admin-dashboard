import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { Paragraph } from '@/components/ui/Typography'

type FacultyRejectionWidgetProps = {
  /** Comma-separated reasons stored in `acc_reject_reason`. */
  reason?: string | null
}

export function FacultyRejectionWidget({ reason }: FacultyRejectionWidgetProps) {
  const prefersReducedMotion = useReducedMotion()
  const [open, setOpen] = useState(true)

  const reasons = (reason ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (reasons.length === 0) return null

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-6 z-[60] w-[min(22rem,calc(100vw-3rem))]"
          role="status"
        >
          <div className="overflow-hidden rounded-card border border-red-200 bg-white shadow-lg">
            <div className="flex items-start gap-3 border-b border-red-100 bg-red-50 px-4 py-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <AlertTriangle className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <Paragraph variant="small" className="font-semibold text-red-700">
                  Application Rejected
                </Paragraph>
                <Paragraph variant="small" className="text-red-600/80">
                  Reasons recorded for this faculty.
                </Paragraph>
              </div>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setOpen(false)}
                className="rounded-nav p-1 text-red-500 transition-colors hover:bg-red-100"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <div className="px-4 py-3">
              <ul className="space-y-1.5">
                {reasons.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-ink"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-red-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
