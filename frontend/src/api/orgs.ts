import api from './client'
import type { Org, JoinRequest } from '../types'

export function createOrg(name: string) {
  return api.post<Org>('/orgs', { name })
}

export function getOrg(orgId: string) {
  return api.get<Org>(`/orgs/${orgId}`)
}

export function joinOrg(orgCode: string) {
  return api.post('/orgs/join-request', { org_code: orgCode })
}

export function listJoinRequests(orgId: string) {
  return api.get<JoinRequest[]>(`/orgs/${orgId}/join-requests`)
}

export function approveJoinRequest(orgId: string, requestId: string) {
  return api.post(`/orgs/${orgId}/join-requests/${requestId}/approve`)
}

export function rejectJoinRequest(orgId: string, requestId: string) {
  return api.post(`/orgs/${orgId}/join-requests/${requestId}/reject`)
}
