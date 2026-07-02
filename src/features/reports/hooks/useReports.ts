import { useQuery } from '@tanstack/react-query'
import {
  reportsAnalyticsFunctions,
  type CategoryRevenue,
  type CourseStatusSlice,
  type ReportsSummary,
  type TopCourseRow,
} from '@/api/reports/reports.api'

export const useGetReportsSummary = () =>
  useQuery<ReportsSummary>({
    queryKey: ['reports-summary'],
    queryFn: () => reportsAnalyticsFunctions.getReportsSummary(),
  })

export const useGetCourseStatusBreakdown = () =>
  useQuery<CourseStatusSlice[]>({
    queryKey: ['reports-course-status'],
    queryFn: () => reportsAnalyticsFunctions.getCourseStatusBreakdown(),
  })

export const useGetRevenueByCategory = () =>
  useQuery<CategoryRevenue[]>({
    queryKey: ['reports-revenue-by-category'],
    queryFn: () => reportsAnalyticsFunctions.getRevenueByCategory(),
  })

export const useGetTopCourses = () =>
  useQuery<TopCourseRow[]>({
    queryKey: ['reports-top-courses'],
    queryFn: () => reportsAnalyticsFunctions.getTopCourses(),
  })
