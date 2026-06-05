import type { DataTableColumn, DataTableColumnAlign } from '@/components/ui/DataTable'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'

const columnAlignClass: Record<DataTableColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const cellPaddingClass = 'px-4 py-4'

type DataTableBodySkeletonProps<T> = {
  columns: DataTableColumn<T>[]
  rowCount?: number
  scrollableBody?: boolean
}

function SkeletonCell<T>({ column }: { column: DataTableColumn<T> }) {
  if (column.id === 'name') {
    return (
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-32 max-w-full" />
          <Skeleton className="h-3 w-40 max-w-full" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex',
        column.align === 'center' && 'justify-center',
        column.align === 'right' && 'justify-end',
      )}
    >
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

export function DataTableBodySkeleton<T>({
  columns,
  rowCount = 10,
  scrollableBody = false,
}: DataTableBodySkeletonProps<T>) {
  const trClass = cn(
    'border-b border-[#e2e8f0]/40 last:border-b-0',
    scrollableBody && 'relative z-0 bg-surface-card',
  )

  return (
    <tbody aria-busy aria-label="Loading table rows">
      {Array.from({ length: rowCount }, (_, rowIndex) => (
        <tr key={`skeleton-row-${rowIndex}`} className={trClass}>
          {columns.map((column) => (
            <td
              key={column.id}
              className={cn(
                cellPaddingClass,
                'align-middle text-sm',
                column.align ? columnAlignClass[column.align] : columnAlignClass.left,
                column.className,
              )}
            >
              <SkeletonCell column={column} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}
