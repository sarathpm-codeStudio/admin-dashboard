import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { announcementApi } from '@/api/announcement/announcement.api'
import { queryClient } from '@/config/queryClient'
import type { AnnouncementSort, AnnouncementTab } from '@/features/announcements/types'

export const useGetAnnouncements = (
  page: number,
  limit: number,
  tab: AnnouncementTab,
  sort: AnnouncementSort,
) => {
  return useQuery({
    queryKey: ['announcements', page, limit, tab, sort],
    queryFn: () => announcementApi.getAnnouncements({ page, limit, tab, sort }),
  })
}

export const useDeleteAnnouncement = () => {
  return useMutation({
    mutationKey: ['delete-announcement'],
    mutationFn: (id: string) => announcementApi.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
  })
}

export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: announcementApi.createAnnouncement,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['announcements'],
      })
    },
  })
}