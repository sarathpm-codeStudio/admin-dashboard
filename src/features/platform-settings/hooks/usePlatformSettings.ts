import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  platformSettingsFunctions,
  type CreateSettingInput,
} from '@/api/platformSettings/platformSettings.api'

export const PLATFORM_SETTINGS_QUERY_KEY = ['platform-settings'] as const
export const PLATFORM_SETTINGS_LIST_QUERY_KEY = ['platform-settings-list'] as const
export const commissionFacultiesQueryKey = (page: number, limit: number, search: string) =>
  ['commission-faculties', page, limit, search] as const

export const useGetPlatformSettings = () =>
  useQuery({
    queryKey: PLATFORM_SETTINGS_QUERY_KEY,
    queryFn: () => platformSettingsFunctions.getSettings(),
  })

/** Full settings with resolved labels/groups/units — drives the settings screen. */
export const useListPlatformSettings = () =>
  useQuery({
    queryKey: PLATFORM_SETTINGS_LIST_QUERY_KEY,
    queryFn: () => platformSettingsFunctions.listSettings(),
  })

function useInvalidateSettings() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: PLATFORM_SETTINGS_QUERY_KEY })
    void queryClient.invalidateQueries({ queryKey: PLATFORM_SETTINGS_LIST_QUERY_KEY })
    void queryClient.invalidateQueries({ queryKey: ['commission-faculties'] })
  }
}

export const useUpdatePlatformSetting = () => {
  const invalidate = useInvalidateSettings()
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      platformSettingsFunctions.updateSetting(key, value),
    onSuccess: invalidate,
  })
}

export const useCreatePlatformSetting = () => {
  const invalidate = useInvalidateSettings()
  return useMutation({
    mutationFn: (input: CreateSettingInput) =>
      platformSettingsFunctions.createSetting(input),
    onSuccess: invalidate,
  })
}

export const useDeletePlatformSetting = () => {
  const invalidate = useInvalidateSettings()
  return useMutation({
    mutationFn: (key: string) => platformSettingsFunctions.deleteSetting(key),
    onSuccess: invalidate,
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
