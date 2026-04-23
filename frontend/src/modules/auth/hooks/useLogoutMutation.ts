import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/auth'
import { useAuth } from '@/lib/auth'

export function useLogoutMutation() {
  const navigate = useNavigate()
  const authLogout = useAuth((state) => state.logout)

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      authLogout()
      navigate('/')
    },
  })
}
