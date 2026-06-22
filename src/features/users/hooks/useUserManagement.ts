import { useMutation, useQuery } from '@tanstack/react-query'
import { userManagementFunctions } from '@/api/userManagement/userManagement.api'
import { queryClient } from '@/config/queryClient'





export const useGetAllUsersAnalytics = () => {
  return useQuery({
    queryKey: ['users-analytics'],
    queryFn: userManagementFunctions.getAllUsersAnalytics,
  })
}


export const useGetAllUsers = (
  page: number,
  limit: number,
  search: string,
  role: 'all' | 'STUDENT' | 'FACULTY',
  status: 'all' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED' | 'RESUBMITTED',
  joinedDateFrom = '',
  joinedDateTo = '',
) => {
  return useQuery({
    queryKey: ['users', page, limit, search, role, status, joinedDateFrom, joinedDateTo],
    queryFn: () =>
      userManagementFunctions.getAllUsers({
        page,
        limit,
        search,
        role,
        status,
        joinedDateFrom,
        joinedDateTo,
      }),
  })
}


type UserStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED' | 'ACTIVATE'

type UpdateUserStatusInput =
  | UserStatus
  | { status: UserStatus; rejectReason?: string; adminNote?: string }

export const useUpdateUserStatus = (userId: string) => {
  return useMutation({
    mutationKey: ['update-user-status', userId],
    mutationFn: (input: UpdateUserStatusInput) => {
      const payload = typeof input === 'string' ? { status: input } : input
      return userManagementFunctions.updateUserStatus(userId, payload.status, {
        rejectReason: typeof input === 'string' ? undefined : input.rejectReason,
        adminNote: typeof input === 'string' ? undefined : input.adminNote,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty', userId] })
      queryClient.invalidateQueries({ queryKey: ['student', userId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-pending-actions'] })

    },
  })
}





