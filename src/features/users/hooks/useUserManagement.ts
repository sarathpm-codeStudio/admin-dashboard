import { useMutation, useQuery } from '@tanstack/react-query'
import { userManagementFunctions } from '@/api/userManagement/userManagement.api'
import { queryClient } from '@/config/queryClient'
import { Toast } from '@/components/ui/Toast'





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
  status: 'all' | 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED',
) => {
  return useQuery({
    queryKey: ['users', page, limit, search, role, status,],
    queryFn: () =>
      userManagementFunctions.getAllUsers({ page, limit, search, role, status }),
  })
}


export const useUpdateUserStatus = (userId: string) => {
  return useMutation({
    mutationKey: ['update-user-status', userId],
    mutationFn: (status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED' | 'ACTIVATE') => userManagementFunctions.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty', userId] })
      queryClient.invalidateQueries({ queryKey: ['student', userId] })

    },
  })
}





