import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user, token) => {
    localStorage.setItem('auth_token', token)
    set({ user, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('auth_token')
    set({ user: null, isAuthenticated: false })
  },
}))
