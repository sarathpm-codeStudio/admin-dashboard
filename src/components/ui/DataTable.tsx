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
const minimalCellPaddingClass = 'px-5 py-5'

/** Table header row / cells — matches design token --color-input */
const tableHeaderBgClass = 'bg-[#F2F4F6]'

export type DataTableAppearance = 'default' | 'minimal'

function columnCellClassName<T>(column: DataTableColumn<T>, appearance: DataTableAppearance) {
  return cn(
    appearance === 'minimal' ? minimalCellPaddingClass : cellPaddingClass,
    'align-middle text-sm',
    column.align ? columnAlignClass[column.align] : columnAlignClass.left,
    column.className,
  )
}

function columnHeaderClassName<T>(
  column: DataTableColumn<T>,
  appearance: DataTableAppearance,
  sticky = false,
) {
  if (appearance === 'minimal') {
    return cn(
      'bg-transparent px-5 py-3.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#94a3b8]',
      sticky && 'sticky top-0 z-30 bg-surface-card',
      column.align ? columnAlignClass[column.align] : columnAlignClass.left,
      column.headerClassName,
    )
  }

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
  /** Custom left footer text instead of "Total N" */
  footerSummary?: string
  /** Pagination style */
  paginationVariant?: 'icon' | 'labeled'
  /** Skip outer card wrapper — parent provides the card */
  bare?: boolean
  /** Airy transactions-style table: no gray header bar, no row dividers */
  appearance?: DataTableAppearance
  /** Show pagination even when there is only one page */
  alwaysShowPagination?: boolean
  /** Optional class on the footer row */
  footerClassName?: string
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

const defaultRowClassName =
  'border-b border-[#e2e8f0]/40 last:border-b-0 transition-colors duration-200 hover:bg-surface-page/30'

const minimalRowClassName =
  'border-0 transition-colors duration-200 hover:bg-[#F8FAFC]/80'

const bodyRowClassName = (scrollableBody: boolean, appearance: DataTableAppearance) =>
  cn(
    appearance === 'minimal' ? minimalRowClassName : defaultRowClassName,
    scrollableBody && 'relative z-0 bg-surface-card',
  )

type DataTableBodyProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowKey: (row: T) => string
  emptyMessage: string
  animate: boolean
  motionEnabled: boolean
  tbodyKey: string | number
  scrollableBody: boolean
  appearance: DataTableAppearance
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
  appearance,
}: DataTableBodyProps<T>) {
  const trClass = bodyRowClassName(scrollableBody, appearance)

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
                <td key={column.id} className={columnCellClassName(column, appearance)}>
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
              <td key={column.id} className={columnCellClassName(column, appearance)}>
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
  footerSummary,
  paginationVariant = 'icon',
  bare = false,
  appearance = 'default',
  alwaysShowPagination = false,
  footerClassName,
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

  const tableElement = (
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
            appearance === 'minimal'
              ? undefined
              : cn('border-b border-[#e2e8f0]/60', tableHeaderBgClass),
            headerRowClassName,
          )}
        >
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={columnHeaderClassName(column, appearance, scrollableBody)}
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
            appearance={appearance}
          />
    </table>
  )

  const tableContent = (
    <>
      {appearance === 'minimal' && (
        <div className="-mx-6 border-t border-[#e2e8f0]/40" aria-hidden />
      )}
      <div className={scrollAreaClass}>{tableElement}</div>

      {showFooter && (
        <div
          className={cn(
            'flex flex-wrap items-center gap-4',
            appearance === 'minimal' ? 'px-0 pt-5' : 'border-t border-[#e2e8f0]/60 px-5 py-3',
            scrollableBody && 'shrink-0',
            footerLayout === 'end' ? 'justify-end' : 'justify-between',
            footerClassName,
          )}
        >
          {showTotalCount && footerLayout === 'between' && (
            <Paragraph variant="muted" className="text-sm text-[#94a3b8]">
              {footerSummary ?? `Total ${totalCount.toLocaleString()}`}
            </Paragraph>
          )}
          {(alwaysShowPagination || totalPages > 1) && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
              variant={paginationVariant}
            />
          )}
        </div>
      )}
    </>
  )

  if (bare) {
    return <div className={cn('overflow-hidden', cardLayoutClass, className)}>{tableContent}</div>
  }

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
