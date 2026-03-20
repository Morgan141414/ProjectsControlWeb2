import api from './client'
import type { Team } from '../types'

export function listTeams(orgId: string) {
  return api.get<Team[]>(`/orgs/${orgId}/teams`)
}

export function listMyTeams(orgId: string, projectId?: string) {
  const params: Record<string, string> = {}
  if (projectId != null) params.project_id = projectId
  return api.get<Team[]>(`/orgs/${orgId}/teams/me`, { params })
}

export function createTeam(orgId: string, name: string, projectId?: string) {
  const body: Record<string, string> = { name }
  if (projectId != null) body.project_id = projectId
  return api.post<Team>(`/orgs/${orgId}/teams`, body)
}

export function updateTeam(
  orgId: string,
  teamId: string,
  name?: string,
  projectId?: string,
) {
  const body: Record<string, string> = {}
  if (name != null) body.name = name
  if (projectId != null) body.project_id = projectId
  return api.patch<Team>(`/orgs/${orgId}/teams/${teamId}`, body)
}

export function addTeamMember(orgId: string, teamId: string, userId: string) {
  return api.post(`/orgs/${orgId}/teams/${teamId}/members`, { user_id: userId })
}
