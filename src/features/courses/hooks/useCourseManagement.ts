import { useMutation, useQuery } from '@tanstack/react-query'
import {
  courseManagementFunctions,
  CourseContentItem,
  CourseDetail,
  CourseSelectOption,
  CoursesListResponse,
} from '@/api/courseManagement/courseManagement.api'
import { queryClient } from '@/config/queryClient'
import type { CourseApprovalStatus, CourseFilterOptions, CoursesAnalytics } from '@/features/courses/types'

export const useGetCourseManagementAnalytics = () => {
  return useQuery<CoursesAnalytics>({
    queryKey: ['course-management-analytics'],
    queryFn: () => courseManagementFunctions.getCourseManagementAnalytics(),
  })
}

export const useGetCourseFilterOptions = () => {
  return useQuery<CourseFilterOptions>({
    queryKey: ['course-management-filter-options'],
    queryFn: () => courseManagementFunctions.getCourseFilterOptions(),
  })
}

export const useGetCourseSelectOptions = (enabled = true) => {
  return useQuery<CourseSelectOption[]>({
    queryKey: ['course-select-options'],
    queryFn: () => courseManagementFunctions.getCourseSelectOptions(),
    enabled,
  })
}

export const useGetAllCourses = (
  page: number,
  limit: number,
  search: string,
  category: string,
  facultyId: string,
  price: 'any' | 'free' | 'paid',
  status: CourseApprovalStatus | 'all',
  enabled = true,
) => {
  return useQuery<CoursesListResponse>({
    queryKey: ['courses', page, limit, search, category, facultyId, price, status],
    queryFn: () =>
      courseManagementFunctions.getAllCourses({
        page,
        limit,
        search,
        category,
        facultyId,
        price,
        status,
      }),
    enabled,
  })
}

export const useGetCourseDetail = (courseId: string | null) => {
  return useQuery<CourseDetail>({
    queryKey: ['course-detail', courseId],
    queryFn: () => courseManagementFunctions.getCourseDetail(courseId as string),
    enabled: !!courseId,
  })
}

export const useGetCourseContent = (courseId: string | null, parentId: string | null) => {
  return useQuery<CourseContentItem[]>({
    queryKey: ['course-content', courseId, parentId],
    queryFn: () => courseManagementFunctions.getCourseContent(courseId as string, parentId),
    enabled: !!courseId,
  })
}

type UpdateCoursesStatusInput =
  | CourseApprovalStatus
  | { status: CourseApprovalStatus; rejectReason?: string }

export const useUpdateCoursesStatus = () => {
  return useMutation({
    mutationKey: ['update-courses-status'],
    mutationFn: ({
      courseIds,
      input,
    }: {
      courseIds: string[]
      input: UpdateCoursesStatusInput
    }) => {
      const payload = typeof input === 'string' ? { status: input } : input
      return courseManagementFunctions.updateCoursesStatus(courseIds, payload.status, {
        rejectReason: typeof input === 'string' ? undefined : input.rejectReason,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['course-management-analytics'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-pending-actions'] })
    },
  })
}

export const useDeleteCourses = () => {
  return useMutation({
    mutationKey: ['delete-courses'],
    mutationFn: (courseIds: string[]) => courseManagementFunctions.deleteCourses(courseIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['course-management-analytics'] })
    },
  })
}