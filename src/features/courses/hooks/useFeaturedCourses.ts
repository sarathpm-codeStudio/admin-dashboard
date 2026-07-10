import { useMutation, useQuery } from '@tanstack/react-query'
import {
  featuredCoursesFunctions,
  type FeaturedCourseRow,
  type PublishableCourseOption,
} from '@/api/courseManagement/featuredCourses.api'
import { queryClient } from '@/config/queryClient'

export const useGetFeaturedCourses = () => {
  return useQuery<FeaturedCourseRow[]>({
    queryKey: ['featured-courses'],
    queryFn: () => featuredCoursesFunctions.getFeaturedCourses(),
  })
}

export const useGetPublishableCourses = (search: string, enabled = true) => {
  return useQuery<PublishableCourseOption[]>({
    queryKey: ['featured-courses-publishable', search],
    queryFn: () => featuredCoursesFunctions.getPublishableCourses(search),
    enabled,
  })
}

const invalidateFeatured = () => {
  queryClient.invalidateQueries({ queryKey: ['featured-courses'] })
  queryClient.invalidateQueries({ queryKey: ['featured-courses-publishable'] })
}

export const useAddFeaturedCourse = () => {
  return useMutation({
    mutationKey: ['add-featured-course'],
    mutationFn: (courseId: string) => featuredCoursesFunctions.addFeaturedCourse(courseId),
    onSuccess: invalidateFeatured,
  })
}

export const useRemoveFeaturedCourse = () => {
  return useMutation({
    mutationKey: ['remove-featured-course'],
    mutationFn: (id: string) => featuredCoursesFunctions.removeFeaturedCourse(id),
    onSuccess: invalidateFeatured,
  })
}

export const useReorderFeaturedCourses = () => {
  return useMutation({
    mutationKey: ['reorder-featured-courses'],
    mutationFn: (orderedIds: string[]) =>
      featuredCoursesFunctions.reorderFeaturedCourses(orderedIds),
    onSuccess: invalidateFeatured,
  })
}
