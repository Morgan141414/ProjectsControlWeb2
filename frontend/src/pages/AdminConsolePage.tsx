import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useOrgStore } from '@/stores/orgStore'
import {
  listJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from '@/api/orgs'
import { listProjects, createProject } from '@/api/projects'
import { listTeams, createTeam, addTeamMember } from '@/api/teams'
import { listUsers } from '@/api/users'
import {
  listPrivacyRules,
  createPrivacyRule,
  deletePrivacyRule,
} from '@/api/privacy'
import {
  listNotificationHooks,
  createNotificationHook,
  deleteNotificationHook,
} from '@/api/notifications'
import { listAudit } from '@/api/audit'
import { listSchedules, createSchedule, runSchedule } from '@/api/schedules'
import type {
  JoinRequest,
  Project,
  Team,
  User,
  PrivacyRule,
  NotificationHook,
  AuditLog,
  ReportSchedule,
} from '@/types'
import {
  Building2,
  FolderKanban,
  Users as UsersIcon,
  UserCircle,
  Shield,
  Bell,
  FileSearch,
  CalendarClock,
  Plus,
  Check,
  X,
  Trash2,
  Play,
  RefreshCw,
} from 'lucide-react'

/* ─── Shared components ─── */

function VisionInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      className="vision-input w-full h-10 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none"
      {...rest}
    />
  )
}

function VisionSelect({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (val: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="vision-input w-full h-10 px-4 text-sm text-white focus:outline-none appearance-none cursor-pointer"
    >
      {children}
    </select>
  )
}

function VisionButton({
  onClick,
  disabled,
  variant = 'primary',
  children,
  size = 'md',
}: {
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'danger' | 'outline' | 'success'
  children: React.ReactNode
  size?: 'sm' | 'md'
}) {
  const base = 'rounded-xl font-bold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed'
  const styles = {
    primary: 'btn-primary text-white',
    danger: 'bg-[#E31A1A]/10 border border-[#E31A1A]/20 text-[#E31A1A] hover:bg-[#E31A1A]/20',
    outline: 'border border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.08] hover:text-white hover:border-white/20',
    success: 'bg-gradient-to-r from-[#01B574] to-[#00D68F] text-white shadow-[0_0_15px_rgba(1,181,116,0.2)] hover:shadow-[0_0_25px_rgba(1,181,116,0.4)]',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${sizes[size]}`}
    >
      {children}
    </button>
  )
}

function LoadingSpinner() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-2 py-8 justify-center">
      <div className="h-4 w-4 rounded-full border-2 border-[#0075FF]/30 border-t-[#0075FF] animate-spin" />
      <p className="text-sm text-white/30">{t('common.loading')}</p>
    </div>
  )
}

function EmptyState({ text, icon: Icon }: { text: string; icon?: React.ElementType }) {
  const IconComp = Icon || FileSearch
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04]">
        <IconComp className="h-5 w-5 text-white/15" />
      </div>
      <p className="text-sm text-white/25 font-medium">{text}</p>
    </div>
  )
}

function SectionHeader({ title, icon: Icon, iconColor = '#0075FF', subtitle }: { title: string; icon: React.ElementType; iconColor?: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `linear-gradient(135deg, ${iconColor}, ${iconColor}88)`, boxShadow: `0 0 20px ${iconColor}33` }}>
        <Icon className="h-4.5 w-4.5 text-white" />
      </div>
      <div>
        <h3 className="text-base font-bold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-white/30">{subtitle}</p>}
      </div>
    </div>
  )
}

/* ─── Tab 1: Организация ─── */

function OrgTab({ orgId }: { orgId: string }) {
  const { t } = useTranslation()
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listJoinRequests(orgId)
      setRequests(r.data)
    } catch {
      toast.error(t('admin.loadRequestsError'))
    } finally {
      setLoading(false)
    }
  }, [orgId, t])

  useEffect(() => { load() }, [load])

  async function handleApprove(id: string) {
    try {
      await approveJoinRequest(orgId, id)
      toast.success(t('admin.requestApproved'))
      load()
    } catch {
      toast.error(t('admin.approveError'))
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectJoinRequest(orgId, id)
      toast.success(t('admin.requestRejected'))
      load()
    } catch {
      toast.error(t('admin.rejectError'))
    }
  }

  return (
    <div className="vision-card p-6" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <SectionHeader title={t('admin.joinRequests')} icon={Building2} />
      {loading ? <LoadingSpinner /> : requests.length === 0 ? (
        <EmptyState text={t('admin.noRequests')} icon={Building2} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">User ID</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('admin.status')}</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, idx) => (
                <tr key={req.id} className={`border-b border-white/5 transition-colors duration-200 hover:bg-white/[0.03] ${idx % 2 === 1 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="px-4 py-3.5 font-mono text-xs text-white/50">{req.id}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-white/50">{req.user_id}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      req.status === 'pending' ? 'bg-[#FFB547]/15 text-[#FFB547]' : 'bg-white/[0.06] text-white/40'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(req.id)} className="flex items-center gap-1 rounded-lg bg-[#01B574]/10 border border-[#01B574]/20 px-3 py-1.5 text-xs font-bold text-[#01B574] hover:bg-[#01B574]/20 transition-all">
                          <Check className="h-3 w-3" /> {t('admin.approve')}
                        </button>
                        <button onClick={() => handleReject(req.id)} className="flex items-center gap-1 rounded-lg bg-[#E31A1A]/10 border border-[#E31A1A]/20 px-3 py-1.5 text-xs font-bold text-[#E31A1A] hover:bg-[#E31A1A]/20 transition-all">
                          <X className="h-3 w-3" /> {t('admin.reject')}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─── Tab 2: Проекты ─── */

function ProjectsTab({ orgId }: { orgId: string }) {
  const { t } = useTranslation()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listProjects(orgId)
      setProjects(r.data)
    } catch {
      toast.error(t('admin.loadProjectsError'))
    } finally {
      setLoading(false)
    }
  }, [orgId, t])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!name.trim()) return
    setCreating(true)
    try {
      await createProject(orgId, name.trim(), description.trim() || undefined)
      setName('')
      setDescription('')
      toast.success(t('admin.projectCreated'))
      load()
    } catch {
      toast.error(t('admin.createProjectError'))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-5" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="vision-card p-6">
        <SectionHeader title={t('admin.createProject')} icon={Plus} iconColor="#0075FF" subtitle={t('admin.addNewProject')} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('admin.name')}</label>
            <VisionInput value={name} onChange={(e) => setName(e.target.value)} placeholder={t('admin.projectName')} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('admin.description')}</label>
            <VisionInput value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('admin.description')} />
          </div>
        </div>
        <VisionButton onClick={handleCreate} disabled={creating || !name.trim()}>
          {creating ? t('admin.creating') : t('common.create')}
        </VisionButton>
      </div>

      <div className="vision-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">{t('admin.projects')}</h3>
          <span className="text-xs text-white/20 bg-white/5 rounded-full px-2.5 py-0.5">{projects.length}</span>
        </div>
        {loading ? <LoadingSpinner /> : projects.length === 0 ? (
          <EmptyState text={t('admin.noProjects')} icon={FolderKanban} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('admin.name')}</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('admin.description')}</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, idx) => (
                  <tr key={p.id} className={`border-b border-white/5 transition-colors duration-200 hover:bg-white/[0.03] ${idx % 2 === 1 ? 'bg-white/[0.02]' : ''}`}>
                    <td className="px-4 py-3.5 font-mono text-xs text-white/50">{p.id}</td>
                    <td className="px-4 py-3.5 text-white font-medium">{p.name}</td>
                    <td className="px-4 py-3.5 text-white/60">{p.description ?? '\u2014'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Tab 3: Команды ─── */

function TeamsTab({ orgId }: { orgId: string }) {
  const { t } = useTranslation()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [projectId, setProjectId] = useState('')
  const [creating, setCreating] = useState(false)

  const [memberTeamId, setMemberTeamId] = useState('')
  const [memberUserId, setMemberUserId] = useState('')
  const [addingMember, setAddingMember] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listTeams(orgId)
      setTeams(r.data)
    } catch {
      toast.error(t('admin.loadTeamsError'))
    } finally {
      setLoading(false)
    }
  }, [orgId, t])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!teamName.trim()) return
    setCreating(true)
    try {
      await createTeam(orgId, teamName.trim(), projectId.trim() || undefined)
      setTeamName('')
      setProjectId('')
      toast.success(t('admin.teamCreated'))
      load()
    } catch {
      toast.error(t('admin.createTeamError'))
    } finally {
      setCreating(false)
    }
  }

  async function handleAddMember() {
    if (!memberTeamId || !memberUserId.trim()) return
    setAddingMember(true)
    try {
      await addTeamMember(orgId, memberTeamId, memberUserId.trim())
      setMemberUserId('')
      toast.success(t('admin.memberAdded'))
      load()
    } catch {
      toast.error(t('admin.addMemberError'))
    } finally {
      setAddingMember(false)
    }
  }

  return (
    <div className="space-y-5" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="vision-card p-6">
          <SectionHeader title={t('admin.createTeam')} icon={Plus} iconColor="#0075FF" />
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('admin.teamName')}</label>
              <VisionInput value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder={t('admin.name')} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">ID {t('admin.projectIdLabel')} ({t('admin.optional')})</label>
              <VisionInput value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="project_id" />
            </div>
          </div>
          <VisionButton onClick={handleCreate} disabled={creating || !teamName.trim()}>
            {creating ? t('admin.creating') : t('common.create')}
          </VisionButton>
        </div>

        <div className="vision-card p-6">
          <SectionHeader title={t('admin.addMember')} icon={UsersIcon} iconColor="#7551FF" />
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('admin.team')}</label>
              <VisionSelect value={memberTeamId} onChange={setMemberTeamId}>
                <option value="" className="bg-[#111C44]">{t('admin.selectTeam')}</option>
                {teams.map((tm) => (
                  <option key={tm.id} value={tm.id} className="bg-[#111C44]">{tm.name}</option>
                ))}
              </VisionSelect>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">User ID</label>
              <VisionInput value={memberUserId} onChange={(e) => setMemberUserId(e.target.value)} placeholder="user_id" />
            </div>
          </div>
          <VisionButton onClick={handleAddMember} disabled={addingMember || !memberTeamId || !memberUserId.trim()} variant="success">
            {addingMember ? t('admin.adding') : t('admin.addMember')}
          </VisionButton>
        </div>
      </div>

      <div className="vision-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">{t('admin.teams')}</h3>
          <span className="text-xs text-white/20 bg-white/5 rounded-full px-2.5 py-0.5">{teams.length}</span>
        </div>
        {loading ? <LoadingSpinner /> : teams.length === 0 ? (
          <EmptyState text={t('admin.noTeams')} icon={UsersIcon} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('admin.name')}</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('admin.project')}</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t, idx) => (
                  <tr key={t.id} className={`border-b border-white/5 transition-colors duration-200 hover:bg-white/[0.03] ${idx % 2 === 1 ? 'bg-white/[0.02]' : ''}`}>
                    <td className="px-4 py-3.5 font-mono text-xs text-white/50">{t.id}</td>
                    <td className="px-4 py-3.5 text-white font-medium">{t.name}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-white/50">{t.project_id ?? '\u2014'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Tab 4: Пользователи ─── */

function UsersTab({ orgId }: { orgId: string }) {
  const { t } = useTranslation()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listUsers(orgId)
      setUsers(r.data)
    } catch {
      toast.error(t('admin.loadUsersError'))
    } finally {
      setLoading(false)
    }
  }, [orgId, t])

  useEffect(() => { load() }, [load])

  return (
    <div className="vision-card p-6" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-white">{t('admin.members')}</h3>
          <span className="text-xs text-white/20 bg-white/5 rounded-full px-2.5 py-0.5">{users.length}</span>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-white/50 hover:bg-white/[0.08] hover:text-white disabled:opacity-40 transition-all">
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          {t('admin.refresh')}
        </button>
      </div>
      {loading ? <LoadingSpinner /> : users.length === 0 ? (
        <EmptyState text={t('admin.noUsers')} icon={UserCircle} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('admin.userName')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u.id} className={`border-b border-white/5 transition-colors duration-200 hover:bg-white/[0.03] ${idx % 2 === 1 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="px-4 py-3.5 font-mono text-xs text-white/50">{u.id}</td>
                  <td className="px-4 py-3.5 text-white font-medium">{u.email}</td>
                  <td className="px-4 py-3.5 text-white/60">{u.full_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─── Tab 5: Приватность ─── */

function PrivacyTab({ orgId }: { orgId: string }) {
  const { t } = useTranslation()
  const [rules, setRules] = useState<PrivacyRule[]>([])
  const [loading, setLoading] = useState(false)
  const [target, setTarget] = useState('app')
  const [matchType, setMatchType] = useState('contains')
  const [pattern, setPattern] = useState('')
  const [action, setAction] = useState('mask')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listPrivacyRules(orgId)
      setRules(r.data)
    } catch {
      toast.error(t('admin.privacyLoadError'))
    } finally {
      setLoading(false)
    }
  }, [orgId, t])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!pattern.trim()) return
    setCreating(true)
    try {
      await createPrivacyRule(orgId, { target, match_type: matchType, pattern: pattern.trim(), action })
      setPattern('')
      toast.success(t('admin.ruleCreated'))
      load()
    } catch {
      toast.error(t('admin.ruleCreateError'))
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(ruleId: string) {
    try {
      await deletePrivacyRule(orgId, ruleId)
      toast.success(t('admin.ruleDeleted'))
      load()
    } catch {
      toast.error(t('admin.ruleDeleteError'))
    }
  }

  return (
    <div className="space-y-5" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="vision-card p-6">
        <SectionHeader title={t('admin.createRule')} icon={Plus} iconColor="#7551FF" subtitle={t('admin.privacyRulesConfig')} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('admin.target')}</label>
            <VisionSelect value={target} onChange={setTarget}>
              <option value="app" className="bg-[#111C44]">app</option>
              <option value="url" className="bg-[#111C44]">url</option>
              <option value="window" className="bg-[#111C44]">window</option>
            </VisionSelect>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('admin.matchType')}</label>
            <VisionSelect value={matchType} onChange={setMatchType}>
              <option value="contains" className="bg-[#111C44]">contains</option>
              <option value="equals" className="bg-[#111C44]">equals</option>
              <option value="regex" className="bg-[#111C44]">regex</option>
            </VisionSelect>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('admin.pattern')}</label>
            <VisionInput value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder={t('admin.patternPlaceholder')} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('admin.action')}</label>
            <VisionSelect value={action} onChange={setAction}>
              <option value="mask" className="bg-[#111C44]">mask</option>
              <option value="block" className="bg-[#111C44]">block</option>
              <option value="allow" className="bg-[#111C44]">allow</option>
            </VisionSelect>
          </div>
        </div>
        <VisionButton onClick={handleCreate} disabled={creating || !pattern.trim()}>
          {creating ? t('admin.creating') : t('admin.create')}
        </VisionButton>
      </div>

      <div className="vision-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">{t('admin.privacyRules')}</h3>
          <span className="text-xs text-white/20 bg-white/5 rounded-full px-2.5 py-0.5">{rules.length}</span>
        </div>
        {loading ? <LoadingSpinner /> : rules.length === 0 ? (
          <EmptyState text={t('admin.noRulesEmpty')} icon={Shield} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('admin.target')}</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('admin.matchType')}</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('admin.pattern')}</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('admin.action')}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule, idx) => {
                  const r = rule as Record<string, unknown>
                  return (
                    <tr key={String(r.id)} className={`border-b border-white/5 transition-colors duration-200 hover:bg-white/[0.03] ${idx % 2 === 1 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="px-4 py-3.5 font-mono text-xs text-white/50">{String(r.id)}</td>
                      <td className="px-4 py-3.5 text-white/60">{String(r.target ?? '\u2014')}</td>
                      <td className="px-4 py-3.5 text-white/60">{String(r.match_type ?? '\u2014')}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-white/50">{String(r.pattern ?? '\u2014')}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-full bg-[#7551FF]/15 px-3 py-1 text-xs font-semibold text-[#7551FF]">
                          {String(r.action ?? '\u2014')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => handleDelete(String(r.id))} className="flex items-center gap-1 rounded-lg bg-[#E31A1A]/10 border border-[#E31A1A]/20 px-3 py-1.5 text-xs font-bold text-[#E31A1A] hover:bg-[#E31A1A]/20 transition-all">
                          <Trash2 className="h-3 w-3" /> {t('admin.delete')}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Tab 6: Уведомления ─── */

function NotificationsTab({ orgId }: { orgId: string }) {
  const { t } = useTranslation()
  const [hooks, setHooks] = useState<NotificationHook[]>([])
  const [loading, setLoading] = useState(false)
  const [eventType, setEventType] = useState('')
  const [url, setUrl] = useState('')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listNotificationHooks(orgId)
      setHooks(r.data)
    } catch {
      toast.error(t('admin.hooksLoadError'))
    } finally {
      setLoading(false)
    }
  }, [orgId, t])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!eventType.trim() || !url.trim()) return
    setCreating(true)
    try {
      await createNotificationHook(orgId, { event_type: eventType.trim(), url: url.trim() })
      setEventType('')
      setUrl('')
      toast.success(t('admin.hookCreated'))
      load()
    } catch {
      toast.error(t('admin.hookCreateError'))
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(hookId: string) {
    try {
      await deleteNotificationHook(orgId, hookId)
      toast.success(t('admin.hookDeleted'))
      load()
    } catch {
      toast.error(t('admin.hookDeleteError'))
    }
  }

  return (
    <div className="space-y-5" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="vision-card p-6">
        <SectionHeader title={t('admin.createHook')} icon={Plus} iconColor="#FFB547" subtitle={t('admin.webhookConfig')} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('admin.eventType')}</label>
            <VisionInput value={eventType} onChange={(e) => setEventType(e.target.value)} placeholder="session.start, session.stop..." />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">URL</label>
            <VisionInput value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <VisionButton onClick={handleCreate} disabled={creating || !eventType.trim() || !url.trim()}>
          {creating ? t('admin.creating') : t('admin.create')}
        </VisionButton>
      </div>

      <div className="vision-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">{t('admin.notificationHooks')}</h3>
          <span className="text-xs text-white/20 bg-white/5 rounded-full px-2.5 py-0.5">{hooks.length}</span>
        </div>
        {loading ? <LoadingSpinner /> : hooks.length === 0 ? (
          <EmptyState text={t('admin.noHooksEmpty')} icon={Bell} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('admin.event')}</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">URL</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {hooks.map((hook, idx) => {
                  const h = hook as Record<string, unknown>
                  return (
                    <tr key={String(h.id)} className={`border-b border-white/5 transition-colors duration-200 hover:bg-white/[0.03] ${idx % 2 === 1 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="px-4 py-3.5 font-mono text-xs text-white/50">{String(h.id)}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-full bg-[#FFB547]/15 px-3 py-1 text-xs font-semibold text-[#FFB547]">
                          {String(h.event_type ?? '\u2014')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 max-w-[200px] truncate font-mono text-xs text-white/50">{String(h.url ?? '\u2014')}</td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => handleDelete(String(h.id))} className="flex items-center gap-1 rounded-lg bg-[#E31A1A]/10 border border-[#E31A1A]/20 px-3 py-1.5 text-xs font-bold text-[#E31A1A] hover:bg-[#E31A1A]/20 transition-all">
                          <Trash2 className="h-3 w-3" /> {t('admin.delete')}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Tab 7: Аудит ─── */

function AuditTab({ orgId }: { orgId: string }) {
  const { t } = useTranslation()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listAudit(orgId)
      setLogs(r.data)
    } catch {
      toast.error(t('admin.auditLoadError'))
    } finally {
      setLoading(false)
    }
  }, [orgId, t])

  useEffect(() => { load() }, [load])

  return (
    <div className="vision-card p-6" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="flex items-center justify-between mb-5">
        <SectionHeader title={t('admin.auditLog')} icon={FileSearch} iconColor="#01B574" />
        <button onClick={load} disabled={loading} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-white/50 hover:bg-white/[0.08] hover:text-white disabled:opacity-40 transition-all">
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          {t('admin.refresh')}
        </button>
      </div>
      {loading ? <LoadingSpinner /> : logs.length === 0 ? (
        <EmptyState text={t('admin.noRecords')} icon={FileSearch} />
      ) : (
        <div className="max-h-[500px] overflow-auto rounded-2xl bg-[#060B26]/80 border border-white/[0.06] p-5">
          <pre className="whitespace-pre-wrap text-xs text-white/60 font-mono leading-relaxed">
            {JSON.stringify(logs, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

/* ─── Tab 8: Расписания ─── */

function SchedulesTab({ orgId }: { orgId: string }) {
  const { t } = useTranslation()
  const [schedules, setSchedules] = useState<ReportSchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState('org-kpi')
  const [intervalDays, setIntervalDays] = useState('7')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [teamId, setTeamId] = useState('')
  const [schedProjectId, setSchedProjectId] = useState('')
  const [creating, setCreating] = useState(false)
  const [runFormat, setRunFormat] = useState('json')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await listSchedules(orgId)
      setSchedules(r.data)
    } catch {
      toast.error(t('admin.schedulesLoadError'))
    } finally {
      setLoading(false)
    }
  }, [orgId, t])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    setCreating(true)
    try {
      const data: Record<string, unknown> = {
        report_type: reportType,
        interval_days: Number(intervalDays),
      }
      if (startDate) data.start_date = startDate
      if (endDate) data.end_date = endDate
      if (teamId.trim()) data.team_id = teamId.trim()
      if (schedProjectId.trim()) data.project_id = schedProjectId.trim()
      await createSchedule(orgId, data)
      toast.success(t('admin.scheduleCreated'))
      setStartDate('')
      setEndDate('')
      setTeamId('')
      setSchedProjectId('')
      load()
    } catch {
      toast.error(t('admin.scheduleCreateError'))
    } finally {
      setCreating(false)
    }
  }

  async function handleRun(scheduleId: string) {
    try {
      await runSchedule(orgId, scheduleId, runFormat)
      toast.success(t('admin.reportStarted'))
    } catch {
      toast.error(t('admin.reportStartError'))
    }
  }

  return (
    <div className="space-y-5" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="vision-card p-6">
        <SectionHeader title={t('admin.createSchedule')} icon={Plus} iconColor="#0075FF" subtitle={t('admin.autoReportGeneration')} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('admin.reportType')}</label>
            <VisionSelect value={reportType} onChange={setReportType}>
              <option value="org-kpi" className="bg-[#111C44]">org-kpi</option>
              <option value="project-kpi" className="bg-[#111C44]">project-kpi</option>
            </VisionSelect>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('admin.intervalDays')} ({t('admin.daysWord')})</label>
            <VisionInput type="number" value={intervalDays} onChange={(e) => setIntervalDays(e.target.value)} min={1} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('admin.startDate')}</label>
            <VisionInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('admin.endDate')}</label>
            <VisionInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Team ID ({t('admin.teamIdOptional')})</label>
            <VisionInput value={teamId} onChange={(e) => setTeamId(e.target.value)} placeholder="team_id" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">Project ID ({t('admin.projectIdOptional')})</label>
            <VisionInput value={schedProjectId} onChange={(e) => setSchedProjectId(e.target.value)} placeholder="project_id" />
          </div>
        </div>
        <VisionButton onClick={handleCreate} disabled={creating}>
          {creating ? t('admin.creating') : t('admin.create')}
        </VisionButton>
      </div>

      <div className="vision-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">{t('admin.schedules')}</h3>
            <span className="text-xs text-white/20 bg-white/5 rounded-full px-2.5 py-0.5">{schedules.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/30 uppercase tracking-wider">{t('admin.formatLabel')}:</span>
            <VisionSelect value={runFormat} onChange={setRunFormat}>
              <option value="json" className="bg-[#111C44]">json</option>
              <option value="csv" className="bg-[#111C44]">csv</option>
            </VisionSelect>
          </div>
        </div>
        {loading ? <LoadingSpinner /> : schedules.length === 0 ? (
          <EmptyState text={t('admin.noSchedulesEmpty')} icon={CalendarClock} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('admin.type')}</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('admin.interval')}</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('admin.start')}</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('admin.end')}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((sched, idx) => {
                  const s = sched as Record<string, unknown>
                  return (
                    <tr key={String(s.id)} className={`border-b border-white/5 transition-colors duration-200 hover:bg-white/[0.03] ${idx % 2 === 1 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="px-4 py-3.5 font-mono text-xs text-white/50">{String(s.id)}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-full bg-[#0075FF]/15 px-3 py-1 text-xs font-semibold text-[#0075FF]">
                          {String(s.report_type ?? '\u2014')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-white/60">{String(s.interval_days ?? '\u2014')} {t('admin.days')}</td>
                      <td className="px-4 py-3.5 text-white/60 text-xs">{String(s.start_date ?? '\u2014')}</td>
                      <td className="px-4 py-3.5 text-white/60 text-xs">{String(s.end_date ?? '\u2014')}</td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => handleRun(String(s.id))} className="flex items-center gap-1 rounded-lg bg-[#01B574]/10 border border-[#01B574]/20 px-3 py-1.5 text-xs font-bold text-[#01B574] hover:bg-[#01B574]/20 transition-all">
                          <Play className="h-3 w-3" /> {t('admin.run')}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Main AdminConsolePage ─── */

export default function AdminConsolePage() {
  const { t } = useTranslation()
  const { orgId } = useOrgStore()
  const [activeTab, setActiveTab] = useState(0)

  const tabs = [
    { id: 0, label: t('admin.orgTab'), icon: Building2 },
    { id: 1, label: t('admin.projectsTab'), icon: FolderKanban },
    { id: 2, label: t('admin.teamsTab'), icon: UsersIcon },
    { id: 3, label: t('admin.usersTab'), icon: UserCircle },
    { id: 4, label: t('admin.privacyTab'), icon: Shield },
    { id: 5, label: t('admin.notificationsTab'), icon: Bell },
    { id: 6, label: t('admin.auditTab'), icon: FileSearch },
    { id: 7, label: t('admin.schedulesTab'), icon: CalendarClock },
  ]

  if (!orgId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <Shield className="h-7 w-7 text-white/20" />
          </div>
          <p className="text-white/40 text-sm">
            {t('admin.joinOrgMessage')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
      {/* Page Title */}
      <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
        {t('admin.adminPanel')}
      </h1>

      {/* Tab Navigation */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex gap-1.5 p-1 rounded-2xl bg-white/[0.03] w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'btn-primary text-white shadow-[0_0_20px_rgba(0,117,255,0.3)]'
                    : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 0 && <OrgTab orgId={orgId} />}
      {activeTab === 1 && <ProjectsTab orgId={orgId} />}
      {activeTab === 2 && <TeamsTab orgId={orgId} />}
      {activeTab === 3 && <UsersTab orgId={orgId} />}
      {activeTab === 4 && <PrivacyTab orgId={orgId} />}
      {activeTab === 5 && <NotificationsTab orgId={orgId} />}
      {activeTab === 6 && <AuditTab orgId={orgId} />}
      {activeTab === 7 && <SchedulesTab orgId={orgId} />}
    </div>
  )
}
