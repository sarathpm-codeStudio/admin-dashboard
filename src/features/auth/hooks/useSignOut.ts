import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { signOut } from '@/api/auth/auth.api'
import { queryClient } from '@/config/queryClient'
import { useAuthStore } from '@/store/authStore'

export function useSignOut() {
  const navigate = useNavigate()
  const reset = useAuthStore((state) => state.reset)

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      reset()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}
