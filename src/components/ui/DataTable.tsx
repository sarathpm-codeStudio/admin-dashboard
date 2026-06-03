import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Pagination } from '@/components/ui/Pagination'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

export type DataTableColumnAlign = 'left' | 'center' | 'right'

export type DataTableColumn<T> = {
  id: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
  headerClassName?: string
  /** CSS width for table-fixed layout, e.g. `14%` or `6rem` */
  width?: string
  align?: DataTableColumnAlign
}

const columnAlignClass: Record<DataTableColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const cellPaddingClass = 'px-4 py-4'

/** Table header row / cells — matches design token --color-input */
const tableHeaderBgClass = 'bg-[#F2F4F6]'

function columnCellClassName<T>(column: DataTableColumn<T>) {
  return cn(
    cellPaddingClass,
    'align-middle text-sm',
    column.align ? columnAlignClass[column.align] : columnAlignClass.left,
    column.className,
  )
}

function columnHeaderClassName<T>(column: DataTableColumn<T>, sticky = false) {
  return cn(
    'px-4 py-3 text-xs font-semibold uppercase tracking-wide text-nav',
    tableHeaderBgClass,
    sticky && stickyHeaderCellClass,
    column.align ? columnAlignClass[column.align] : columnAlignClass.left,
    column.headerClassName,
  )
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowKey: (row: T) => string
  totalCount: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  emptyMessage?: string
  /** Staggered fade/slide-in for table rows (Framer Motion) */
  animateRows?: boolean
  /** Change to replay row animation (e.g. page or filter revision) */
  rowAnimationKey?: string | number
  /** Show total count / pagination footer (default true) */
  showFooter?: boolean
  /** Show "Total N" in footer (default true) */
  showTotalCount?: boolean
  /** Footer layout when pagination is shown */
  footerLayout?: 'between' | 'end'
  /** Optional class on header row */
  headerRowClassName?: string
  /** Optional class on the `<table>` element */
  tableClassName?: string
  /** Scroll table rows inside the card; sticky header; fixed pagination footer */
  scrollableBody?: boolean
  /** Max height of the scrollable table body (e.g. `max-h-[30rem]` for ~6 rows) */
  scrollBodyMaxHeight?: string
}

const stickyHeaderCellClass =
  'sticky top-0 z-30 bg-[#F2F4F6] shadow-[0_1px_0_0_rgba(226,232,240,0.6)]'

const tableEase = [0.22, 1, 0.36, 1] as const

const tbodyStaggerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.13,
      delayChildren: 0.05,
    },
  },
}

const tableRowVariants = {
  hidden: { opacity: 0, y: -24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: tableEase },
  },
}

const tableCardVariants = {
  hidden: { opacity: 0, y: -12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: tableEase },
  },
}

const rowClassName =
  'border-b border-[#e2e8f0]/40 last:border-b-0 transition-colors duration-200 hover:bg-surface-page/30'

const bodyRowClassName = (scrollableBody: boolean) =>
  cn(rowClassName, scrollableBody && 'relative z-0 bg-surface-card')

type DataTableBodyProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowKey: (row: T) => string
  emptyMessage: string
  animate: boolean
  motionEnabled: boolean
  tbodyKey: string | number
  scrollableBody: boolean
}

function DataTableBody<T>({
  columns,
  data,
  getRowKey,
  emptyMessage,
  animate,
  motionEnabled,
  tbodyKey,
  scrollableBody,
}: DataTableBodyProps<T>) {
  const trClass = bodyRowClassName(scrollableBody)

  if (!animate || !motionEnabled) {
    return (
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-5 py-12 text-center">
              <Paragraph variant="muted">{emptyMessage}</Paragraph>
            </td>
          </tr>
        ) : (
          data.map((row) => (
            <tr key={getRowKey(row)} className={trClass}>
              {columns.map((column) => (
                <td key={column.id} className={columnCellClassName(column)}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    )
  }

  return (
    <motion.tbody
      key={String(tbodyKey)}
      variants={tbodyStaggerVariants}
      initial="hidden"
      animate="show"
    >
      {data.length === 0 ? (
        <motion.tr variants={tableRowVariants}>
          <td colSpan={columns.length} className="px-5 py-12 text-center">
            <Paragraph variant="muted">{emptyMessage}</Paragraph>
          </td>
        </motion.tr>
      ) : (
        data.map((row) => (
          <motion.tr key={getRowKey(row)} variants={tableRowVariants} className={trClass}>
            {columns.map((column) => (
              <td key={column.id} className={columnCellClassName(column)}>
                {column.cell(row)}
              </td>
            ))}
          </motion.tr>
        ))
      )}
    </motion.tbody>
  )
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  totalCount,
  page,
  totalPages,
  onPageChange,
  className,
  emptyMessage = 'No results found.',
  animateRows = false,
  rowAnimationKey,
  showFooter = true,
  showTotalCount = true,
  footerLayout = 'between',
  headerRowClassName,
  tableClassName,
  scrollableBody = false,
  scrollBodyMaxHeight,
}: DataTableProps<T>) {
  const prefersReducedMotion = useReducedMotion()
  const motionEnabled = animateRows && !prefersReducedMotion
  const tbodyKey = rowAnimationKey ?? page

  const cardLayoutClass =
    scrollableBody &&
    cn('flex min-h-0 flex-col', !scrollBodyMaxHeight && 'flex-1')
  const scrollAreaClass = cn(
    'scrollbar-none overflow-x-auto',
    scrollableBody && 'overflow-y-auto',
    scrollableBody && (scrollBodyMaxHeight ?? 'min-h-0 flex-1'),
  )

  const tableContent = (
    <>
      <div className={scrollAreaClass}>
        <table
          className={cn(
            'w-full min-w-[720px] border-collapse text-left',
            tableClassName ?? 'table-fixed',
          )}
        >
          {columns.some((column) => column.width) && (
            <colgroup>
              {columns.map((column) => (
                <col key={column.id} style={column.width ? { width: column.width } : undefined} />
              ))}
            </colgroup>
          )}
          <thead>
            <tr
              className={cn(
                'border-b border-[#e2e8f0]/60',
                tableHeaderBgClass,
                headerRowClassName,
              )}
            >
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={columnHeaderClassName(column, scrollableBody)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <DataTableBody
            columns={columns}
            data={data}
            getRowKey={getRowKey}
            emptyMessage={emptyMessage}
            animate={animateRows}
            motionEnabled={motionEnabled}
            tbodyKey={tbodyKey}
            scrollableBody={scrollableBody}
          />
        </table>
      </div>

      {showFooter && (
        <div
          className={cn(
            'flex flex-wrap items-center gap-4 border-t border-[#e2e8f0]/60 px-5 py-3',
            scrollableBody && 'shrink-0',
            footerLayout === 'end' ? 'justify-end' : 'justify-between',
          )}
        >
          {showTotalCount && footerLayout === 'between' && (
            <Paragraph variant="muted">Total {totalCount.toLocaleString()}</Paragraph>
          )}
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
          )}
        </div>
      )}
    </>
  )

  if (motionEnabled) {
    return (
      <motion.div
        className={cn(
          'overflow-hidden rounded-card border border-[#e2e8f0]/60 bg-surface-card shadow-sm',
          cardLayoutClass,
          className,
        )}
        variants={tableCardVariants}
        initial="hidden"
        animate="show"
      >
        {tableContent}
      </motion.div>
    )
  }

  return (
    <Card className={cn('overflow-hidden', cardLayoutClass, className)}>{tableContent}</Card>
  )
}
