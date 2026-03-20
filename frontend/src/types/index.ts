export interface User {
  id: string
  email: string
  full_name: string
  patronymic?: string
  bio?: string
  specialty?: string
  avatar_url?: string
  socials_json?: string
  org_id?: string
}

export interface Org {
  id: string
  name: string
  code: string
  owner_id: string
}

export interface JoinRequest {
  id: string
  user_id: string
  org_id: string
  status: string
  created_at: string
}

export interface Project {
  id: string
  name: string
  description?: string
  org_id: string
}

export interface Team {
  id: string
  name: string
  project_id?: string
  org_id: string
  members?: TeamMember[]
}

export interface TeamMember {
  user_id: string
  role?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: string
  assignee_id?: string
  team_id?: string
  due_date?: string
  report?: string
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  device_name?: string
  os_name?: string
  started_at: string
  ended_at?: string
}

export interface ConsentStatus {
  accepted: boolean
  policy_version?: string
  accepted_at?: string
}

export type KpiReport = Record<string, unknown>
export type AiScorecard = Record<string, unknown>
export type AuditLog = Record<string, unknown>
export type PrivacyRule = Record<string, unknown>
export type NotificationHook = Record<string, unknown>
export type ReportExport = Record<string, unknown>
export type ReportSchedule = Record<string, unknown>
export type SessionMetrics = Record<string, unknown>
export type UserMetrics = Record<string, unknown>
