import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
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

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const items = getPageItems(page, totalPages)

  return (
    <nav className={cn('flex items-center gap-1', className)} aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex size-8 items-center justify-center rounded-nav text-nav transition-colors hover:bg-surface-input disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
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
              'flex min-w-8 items-center justify-center rounded-nav px-2 py-1 text-sm font-medium transition-colors',
              page === item
                ? 'bg-primary text-white'
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
        className="flex size-8 items-center justify-center rounded-nav text-nav transition-colors hover:bg-surface-input disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  )
}
