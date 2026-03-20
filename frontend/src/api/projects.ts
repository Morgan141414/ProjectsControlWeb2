import api from './client'
import type { Project } from '../types'

export function listProjects(orgId: string) {
  return api.get<Project[]>(`/orgs/${orgId}/projects`)
}

export function createProject(orgId: string, name: string, description?: string) {
  const body: Record<string, string> = { name }
  if (description != null) body.description = description
  return api.post<Project>(`/orgs/${orgId}/projects`, body)
}
