import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  platformSettingsFunctions,
  type PlatformSettingKey,
} from '@/api/platformSettings/platformSettings.api'

export const PLATFORM_SETTINGS_QUERY_KEY = ['platform-settings'] as const
export const commissionFacultiesQueryKey = (page: number, limit: number, search: string) =>
  ['commission-faculties', page, limit, search] as const

export const useGetPlatformSettings = () =>
  useQuery({
    queryKey: PLATFORM_SETTINGS_QUERY_KEY,
    queryFn: () => platformSettingsFunctions.getSettings(),
  })

export const useUpdatePlatformSetting = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ key, value }: { key: PlatformSettingKey; value: string }) =>
      platformSettingsFunctions.updateSetting(key, value),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLATFORM_SETTINGS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: ['commission-faculties'] })
    },
  })
}

export const useGetCommissionFaculties = (
  page: number,
  limit: number,
  search: string,
) =>
  useQuery({
    queryKey: commissionFacultiesQueryKey(page, limit, search),
    queryFn: () => platformSettingsFunctions.getCommissionFaculties({ page, limit, search }),
  })

export const useUpdateFacultyCommission = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      facultyId,
      commissionPercent,
    }: {
      facultyId: string
      commissionPercent: number
    }) => platformSettingsFunctions.updateFacultyCommission(facultyId, commissionPercent),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['commission-faculties'] })
    },
  })
}

export const useResetFacultyCommission = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (facultyId: string) =>
      platformSettingsFunctions.resetFacultyCommission(facultyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['commission-faculties'] })
    },
  })
}
