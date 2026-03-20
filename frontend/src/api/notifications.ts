import api from './client'
import type { NotificationHook } from '../types'

export function listNotificationHooks(orgId: string) {
  return api.get<NotificationHook[]>(`/orgs/${orgId}/notifications`)
}

export function createNotificationHook(
  orgId: string,
  data: { event_type: string; url: string },
) {
  return api.post<NotificationHook>(`/orgs/${orgId}/notifications`, data)
}

export function updateNotificationHook(
  orgId: string,
  hookId: string,
  data: Partial<{ event_type: string; url: string }>,
) {
  return api.patch<NotificationHook>(`/orgs/${orgId}/notifications/${hookId}`, data)
}

export function deleteNotificationHook(orgId: string, hookId: string) {
  return api.delete(`/orgs/${orgId}/notifications/${hookId}`)
}
