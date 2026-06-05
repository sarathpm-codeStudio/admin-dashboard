import { useQuery } from '@tanstack/react-query'
import { userManagementFunctions } from '@/api/userManagement/userManagement.api'





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
  status: 'all' | 'APPROVED' | 'PENDING' | 'SUSPENDED',
) => {
  return useQuery({
    queryKey: ['users', page, limit, search, role, status],
    queryFn: () =>
      userManagementFunctions.getAllUsers({ page, limit, search, role, status }),
  })
}






