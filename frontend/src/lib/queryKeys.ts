/** Centralised query-key factory – avoids magic strings and simplifies invalidation. */

export const queryKeys = {
  // ── Profile ──────────────────────────────────────────────────
  profile: {
    me: () => ['profile', 'me'] as const,
  },

  // ── Org ──────────────────────────────────────────────────────
  org: {
    detail: (orgId: string) => ['org', orgId] as const,
    joinRequests: (orgId: string) => ['org', orgId, 'join-requests'] as const,
  },

  // ── Projects ─────────────────────────────────────────────────
  projects: {
    list: (orgId: string) => ['projects', orgId] as const,
  },

  // ── Tasks ────────────────────────────────────────────────────
  tasks: {
    today: (orgId: string) => ['tasks', orgId, 'today'] as const,
  },

  // ── Teams ────────────────────────────────────────────────────
  teams: {
    list: (orgId: string) => ['teams', orgId] as const,
    my: (orgId: string) => ['teams', orgId, 'me'] as const,
  },

  // ── Users ────────────────────────────────────────────────────
  users: {
    list: (orgId: string) => ['users', orgId] as const,
  },

  // ── Sessions ─────────────────────────────────────────────────
  sessions: {
    my: (orgId: string) => ['sessions', orgId, 'me'] as const,
    org: (orgId: string) => ['sessions', orgId, 'all'] as const,
  },

  // ── Reports ──────────────────────────────────────────────────
  reports: {
    orgKpi: (orgId: string, params?: Record<string, unknown>) =>
      ['reports', orgId, 'org-kpi', params ?? {}] as const,
    projectKpi: (orgId: string, params?: Record<string, unknown>) =>
      ['reports', orgId, 'project-kpi', params ?? {}] as const,
    exports: (orgId: string) => ['reports', orgId, 'exports'] as const,
  },

  // ── Metrics ──────────────────────────────────────────────────
  metrics: {
    session: (orgId: string, sessionId: string) =>
      ['metrics', orgId, 'session', sessionId] as const,
    user: (orgId: string, userId: string, params?: Record<string, unknown>) =>
      ['metrics', orgId, 'user', userId, params ?? {}] as const,
  },

  // ── AI ───────────────────────────────────────────────────────
  ai: {
    kpi: (orgId: string, params?: Record<string, unknown>) =>
      ['ai', orgId, 'kpi', params ?? {}] as const,
    scorecards: (orgId: string, params?: Record<string, unknown>) =>
      ['ai', orgId, 'scorecards', params ?? {}] as const,
  },

  // ── Audit ────────────────────────────────────────────────────
  audit: {
    list: (orgId: string) => ['audit', orgId] as const,
  },

  // ── Privacy ──────────────────────────────────────────────────
  privacy: {
    rules: (orgId: string) => ['privacy', orgId, 'rules'] as const,
  },

  // ── Consent ──────────────────────────────────────────────────
  consent: {
    status: (orgId: string) => ['consent', orgId] as const,
  },

  // ── Notifications ────────────────────────────────────────────
  notifications: {
    hooks: (orgId: string) => ['notifications', orgId, 'hooks'] as const,
  },

  // ── Performance ──────────────────────────────────────────────
  performance: {
    activityPerTask: (orgId: string, params?: Record<string, unknown>) =>
      ['performance', orgId, 'activity-per-task', params ?? {}] as const,
  },

  // ── Schedules ────────────────────────────────────────────────
  schedules: {
    list: (orgId: string) => ['schedules', orgId] as const,
  },
} as const
