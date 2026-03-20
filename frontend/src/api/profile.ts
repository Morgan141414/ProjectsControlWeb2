import api from './client'
import type { User } from '../types'

export function getMe() {
  return api.get<User>('/users/me')
}

export function updateMe(data: Partial<Omit<User, 'id' | 'email'>>) {
  return api.patch<User>('/users/me', data)
}
