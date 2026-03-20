import api from './client'
import type { AuditLog } from '../types'

export function listAudit(orgId: string) {
  return api.get<AuditLog[]>(`/orgs/${orgId}/audit`)
}
