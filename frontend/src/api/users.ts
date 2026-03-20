import api from './client'
import type { User } from '../types'

export function listUsers(orgId: string) {
  return api.get<User[]>(`/orgs/${orgId}/users`)
}
