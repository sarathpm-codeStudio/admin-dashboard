import type { CourseListRow } from '@/api/courseManagement/courseManagement.api'
import type { CourseApprovalStatus, CourseRecord } from '@/features/courses/types'

export function mapCourseListRowToRecord(row: CourseListRow): CourseRecord {
  return { ...row }
}

export function mapStatusFilterToApi(
  status: string,
): CourseApprovalStatus | 'all' {
  if (status === 'RESUBMIT') return 'RESUBMIT'
  if (status === 'APPROVED' || status === 'PENDING' || status === 'REJECTED') {
    return status
  }
  return 'all'
}

export function mapPriceFilterToApi(price: string): 'any' | 'free' | 'paid' {
  if (price === 'free' || price === 'paid') return price
  return 'any'
}
