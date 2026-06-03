import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  /** Text labels for prev/next and bordered pills — faculty revenue table */
  variant?: 'icon' | 'labeled'
}

function getPageItems(page: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const items: (number | 'ellipsis')[] = [1]

  if (page > 3) items.push('ellipsis')

  const start = Math.max(2, page - 1)
  const end = Math.min(totalPages - 1, page + 1)

  for (let i = start; i <= end; i += 1) {
    items.push(i)
  }

  if (page < totalPages - 2) items.push('ellipsis')

  items.push(totalPages)
  return items
}

const labeledNavButtonClass =
  'inline-flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#F8FAFC] disabled:opacity-40'

const labeledPageButtonClass =
  'flex min-w-9 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white px-2.5 py-1.5 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#F8FAFC]'

const labeledPageActiveClass =
  'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700'

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  variant = 'icon',
}: PaginationProps) {
  const items = getPageItems(page, totalPages)
  const labeled = variant === 'labeled'

  return (
    <nav className={cn('flex items-center gap-1.5', className)} aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={
          labeled
            ? labeledNavButtonClass
            : 'flex size-8 items-center justify-center rounded-nav text-nav transition-colors hover:bg-surface-input disabled:opacity-40'
        }
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {labeled && <span>Previous</span>}
      </button>

      {items.map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-1 text-sm text-nav">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={page === item ? 'page' : undefined}
            className={cn(
              labeled ? labeledPageButtonClass : 'flex min-w-8 items-center justify-center rounded-nav px-2 py-1 text-sm font-medium transition-colors',
              page === item
                ? labeled
                  ? labeledPageActiveClass
                  : 'bg-primary text-white'
                : labeled
                  ? undefined
                  : 'text-nav hover:bg-surface-input hover:text-ink-heading',
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={
          labeled
            ? labeledNavButtonClass
            : 'flex size-8 items-center justify-center rounded-nav text-nav transition-colors hover:bg-surface-input disabled:opacity-40'
        }
        aria-label="Next page"
      >
        {labeled && <span>Next</span>}
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  )
}
