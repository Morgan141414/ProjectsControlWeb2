import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import { useOrgStore } from '@/stores/orgStore'
import { getOrgKpi, getProjectKpi, exportOrgKpi, exportProjectKpi, listReportExports } from '@/api/reports'
import { getActivityPerTask } from '@/api/performance'
import { getSessionMetrics, getUserMetrics } from '@/api/metrics'
import { getAiScorecards } from '@/api/ai'

import {
  BarChart3,
  FolderKanban,
  Zap,
  Activity,
  FileDown,
  Brain,
  Download,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Sparkles,
  Target,
  ArrowUpRight,
} from 'lucide-react'

/* ─── Shared ─── */

function VisionInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
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
      className="vision-input h-10 px-4 text-sm text-white focus:outline-none appearance-none cursor-pointer"
    >
      {children}
    </select>
  )
}

function JsonBlock({ data }: { data: unknown }) {
  return (
    <div className="mt-4 max-h-[500px] overflow-auto rounded-2xl bg-[#060B26]/80 border border-white/[0.06] p-5">
      <pre className="whitespace-pre-wrap text-xs text-white/60 font-mono leading-relaxed">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
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

/* Custom glassmorphism tooltip for charts */
function GlassTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B1437]/95 backdrop-blur-xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm font-bold text-white">
          {entry.dataKey}: <span className="text-[#0075FF]">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

/* ─── Tab 1: KPI организации ─── */

function OrgKpiTab({ orgId }: { orgId: string }) {
  const { t } = useTranslation()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [teamId, setTeamId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [exportFormat, setExportFormat] = useState('csv')
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)

  async function handleLoad() {
    setLoading(true)
    try {
      const res = await getOrgKpi(orgId, {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        team_id: teamId || undefined,
        project_id: projectId || undefined,
      })
      setData(res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('reports.loadError')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    try {
      await exportOrgKpi(orgId, {
        export_format: exportFormat,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        team_id: teamId || undefined,
        project_id: projectId || undefined,
      })
      toast.success(t('reports.exportSuccess'))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('reports.exportError')
      toast.error(message)
    }
  }

  return (
    <div className="vision-card p-6" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0075FF] to-[#2563EB] shadow-[0_0_20px_rgba(0,117,255,0.3)]">
          <BarChart3 className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">{t('reports.orgKpi')}</h3>
          <p className="text-xs text-white/30">{t('reports.orgKpiDescription')}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-5">
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.from')}</label>
          <VisionInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.to')}</label>
          <VisionInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.teamId')}</label>
          <VisionInput placeholder="team_id" value={teamId} onChange={(e) => setTeamId(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.projectId')}</label>
          <VisionInput placeholder="project_id" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={handleLoad} disabled={loading} className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">
          {loading ? t('common.loading') : t('reports.load')}
        </button>
        <div className="h-8 w-px bg-white/[0.06]" />
        <VisionSelect value={exportFormat} onChange={setExportFormat}>
          <option value="csv" className="bg-[#111C44]">CSV</option>
          <option value="json" className="bg-[#111C44]">JSON</option>
        </VisionSelect>
        <button onClick={handleExport} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-bold text-white/50 hover:bg-white/[0.08] hover:text-white transition-all">
          <Download className="h-4 w-4" />
          {t('reports.export')}
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {!loading && data != null && <JsonBlock data={data} />}
    </div>
  )
}

/* ─── Tab 2: KPI проектов ─── */

function ProjectKpiTab({ orgId }: { orgId: string }) {
  const { t } = useTranslation()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [exportFormat, setExportFormat] = useState('csv')
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)

  async function handleLoad() {
    setLoading(true)
    try {
      const res = await getProjectKpi(orgId, {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      setData(res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('reports.loadError')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    try {
      await exportProjectKpi(orgId, {
        export_format: exportFormat,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      toast.success(t('reports.exportSuccess'))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('reports.exportError')
      toast.error(message)
    }
  }

  return (
    <div className="vision-card p-6" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7551FF] to-[#9B7BFF] shadow-[0_0_20px_rgba(117,81,255,0.3)]">
          <FolderKanban className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">{t('reports.projectKpi')}</h3>
          <p className="text-xs text-white/30">{t('reports.projectKpiDescription')}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-5">
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.from')}</label>
          <VisionInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.to')}</label>
          <VisionInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={handleLoad} disabled={loading} className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">
          {loading ? t('common.loading') : t('reports.load')}
        </button>
        <div className="h-8 w-px bg-white/[0.06]" />
        <VisionSelect value={exportFormat} onChange={setExportFormat}>
          <option value="csv" className="bg-[#111C44]">CSV</option>
          <option value="json" className="bg-[#111C44]">JSON</option>
        </VisionSelect>
        <button onClick={handleExport} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-bold text-white/50 hover:bg-white/[0.08] hover:text-white transition-all">
          <Download className="h-4 w-4" />
          {t('reports.export')}
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {!loading && data != null && <JsonBlock data={data} />}
    </div>
  )
}

/* ─── Tab 3: Продуктивность ─── */

function ProductivityTab({ orgId }: { orgId: string }) {
  const { t } = useTranslation()
  const [userId, setUserId] = useState('')
  const [teamId, setTeamId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(false)

  async function handleLoad() {
    setLoading(true)
    try {
      const res = await getActivityPerTask(orgId, {
        user_id: userId || undefined,
        team_id: teamId || undefined,
        project_id: projectId || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      })
      setData(res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('reports.loadError')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="vision-card p-6" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFB547] to-[#FF9900] shadow-[0_0_20px_rgba(255,181,71,0.3)]">
          <Zap className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">{t('reports.activityPerTask')}</h3>
          <p className="text-xs text-white/30">{t('reports.activityPerTaskDescription')}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-5">
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.userId')}</label>
          <VisionInput placeholder="user_id" value={userId} onChange={(e) => setUserId(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.teamId')}</label>
          <VisionInput placeholder="team_id" value={teamId} onChange={(e) => setTeamId(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.projectId')}</label>
          <VisionInput placeholder="project_id" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.from')}</label>
          <VisionInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.to')}</label>
          <VisionInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <button onClick={handleLoad} disabled={loading} className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">
        {loading ? t('common.loading') : t('reports.load')}
      </button>
      {loading && <LoadingSpinner />}
      {!loading && data != null && <JsonBlock data={data} />}
    </div>
  )
}

/* ─── Tab 4: Метрики ─── */

function MetricsTab({ orgId }: { orgId: string }) {
  const { t } = useTranslation()
  const [sessionId, setSessionId] = useState('')
  const [sessionData, setSessionData] = useState<unknown>(null)
  const [sessionLoading, setSessionLoading] = useState(false)

  const [umUserId, setUmUserId] = useState('')
  const [umProjectId, setUmProjectId] = useState('')
  const [umStartDate, setUmStartDate] = useState('')
  const [umEndDate, setUmEndDate] = useState('')
  const [userData, setUserData] = useState<unknown>(null)
  const [userLoading, setUserLoading] = useState(false)

  async function handleSessionLoad() {
    if (!sessionId.trim()) {
      toast.error(t('reports.enterSessionId'))
      return
    }
    setSessionLoading(true)
    try {
      const res = await getSessionMetrics(orgId, sessionId)
      setSessionData(res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('reports.loadError')
      toast.error(message)
    } finally {
      setSessionLoading(false)
    }
  }

  async function handleUserLoad() {
    if (!umUserId.trim()) {
      toast.error(t('reports.enterUserId'))
      return
    }
    setUserLoading(true)
    try {
      const res = await getUserMetrics(orgId, umUserId, {
        start_date: umStartDate || undefined,
        end_date: umEndDate || undefined,
        project_id: umProjectId || undefined,
      })
      setUserData(res.data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('reports.loadError')
      toast.error(message)
    } finally {
      setUserLoading(false)
    }
  }

  return (
    <div className="space-y-5" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="vision-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#01B574] to-[#00D68F] shadow-[0_0_20px_rgba(1,181,116,0.3)]">
            <Activity className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t('reports.sessionMetrics')}</h3>
            <p className="text-xs text-white/30">{t('reports.sessionMetricsSubtitle')}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3 mb-2">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.sessionId')}</label>
            <VisionInput placeholder="session_id" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
          </div>
          <button onClick={handleSessionLoad} disabled={sessionLoading} className="btn-primary h-10 rounded-xl px-5 text-sm font-bold text-white disabled:opacity-40">
            {sessionLoading ? t('reports.loading') : t('reports.load')}
          </button>
        </div>
        {sessionLoading && <LoadingSpinner />}
        {!sessionLoading && sessionData != null && <JsonBlock data={sessionData} />}
      </div>

      <div className="vision-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E31A1A] to-[#FF6B6B] shadow-[0_0_20px_rgba(227,26,26,0.3)]">
            <Activity className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t('reports.userMetrics')}</h3>
            <p className="text-xs text-white/30">{t('reports.userMetricsSubtitle')}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.userId')}</label>
            <VisionInput placeholder="user_id" value={umUserId} onChange={(e) => setUmUserId(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.projectId')}</label>
            <VisionInput placeholder="project_id" value={umProjectId} onChange={(e) => setUmProjectId(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.startDate')}</label>
            <VisionInput type="date" value={umStartDate} onChange={(e) => setUmStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.endDate')}</label>
            <VisionInput type="date" value={umEndDate} onChange={(e) => setUmEndDate(e.target.value)} />
          </div>
        </div>
        <button onClick={handleUserLoad} disabled={userLoading} className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">
          {userLoading ? t('reports.loading') : t('reports.load')}
        </button>
        {userLoading && <LoadingSpinner />}
        {!userLoading && userData != null && <JsonBlock data={userData} />}
      </div>
    </div>
  )
}

/* ─── Tab 5: Экспорты ─── */

function ExportsTab({ orgId }: { orgId: string }) {
  const { t } = useTranslation()
  const [data, setData] = useState<unknown[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function handleRefresh() {
    setLoading(true)
    try {
      const res = await listReportExports(orgId)
      setData(res.data)
      setLoaded(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('reports.loadError')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="vision-card p-6" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#868CFF] to-[#4318FF] shadow-[0_0_20px_rgba(134,140,255,0.3)]">
            <FileDown className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t('reports.exports')}</h3>
            <p className="text-xs text-white/30">{t('reports.exportsHistory')}</p>
          </div>
        </div>
        <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-white/50 hover:bg-white/[0.08] hover:text-white disabled:opacity-40 transition-all">
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          {t('reports.refresh')}
        </button>
      </div>

      {loading && <LoadingSpinner />}
      {!loading && loaded && (
        Array.isArray(data) && data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('reports.format')}</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('reports.status')}</th>
                  <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('reports.created')}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => {
                  const row = item as Record<string, unknown>
                  return (
                    <tr key={String(row.id ?? idx)} className={`border-b border-white/5 transition-colors duration-200 hover:bg-white/[0.03] ${idx % 2 === 1 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="px-4 py-3.5 font-mono text-xs text-white/50">{String(row.id ?? '\u2014')}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-full bg-[#7551FF]/15 px-3 py-1 text-xs font-semibold text-[#7551FF]">
                          {String(row.export_format ?? row.format ?? '\u2014')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center rounded-full bg-[#01B574]/15 px-3 py-1 text-xs font-semibold text-[#01B574]">
                          {String(row.status ?? '\u2014')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-white/40">{String(row.created_at ?? '\u2014')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04]">
              <FileDown className="h-5 w-5 text-white/15" />
            </div>
            <p className="text-sm text-white/25 font-medium">{t('reports.noExports')}</p>
          </div>
        )
      )}
    </div>
  )
}

/* ─── Tab 6: AI Аналитика ─── */

function AiAnalyticsTab({ orgId }: { orgId: string }) {
  const { t } = useTranslation()
  const [period, setPeriod] = useState('day')
  const [mode, setMode] = useState('employee')
  const [roleProfile, setRoleProfile] = useState('developer')
  const [asOf, setAsOf] = useState('')
  const [userId, setUserId] = useState('')
  const [data, setData] = useState<Record<string, unknown>[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLoad() {
    setLoading(true)
    try {
      const res = await getAiScorecards(orgId, {
        period,
        as_of: asOf || undefined,
        user_id: userId || undefined,
        mode: mode || undefined,
        role_profile: roleProfile || undefined,
      })
      setData(res.data as Record<string, unknown>[])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('reports.loadError')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const scorecard = data && data.length > 0 ? data[0] : null
  const score = scorecard ? Number(scorecard.score ?? 0) : 0
  const baseline = scorecard ? Number(scorecard.baseline ?? 0) : 0
  const delta = baseline !== 0 ? ((score - baseline) / baseline) * 100 : 0
  const trend = (scorecard?.trend as Array<Record<string, unknown>> | undefined) ?? []
  const primaryDrivers = (scorecard?.primary_drivers as Array<Record<string, unknown>> | undefined) ?? []
  const interpretation = scorecard?.interpretation as Record<string, unknown> | undefined
  const userName = scorecard?.user_name ?? scorecard?.user_id ?? ''
  const periodStart = scorecard?.period_start ?? ''
  const periodEnd = scorecard?.period_end ?? ''

  return (
    <div className="space-y-5" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
      <div className="vision-card p-6 relative overflow-hidden">
        {/* Decorative orb */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-[#7551FF]/10 blur-3xl" style={{ animation: 'orbFloat2 10s ease-in-out infinite' }} />

        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7551FF] to-[#4318FF] shadow-[0_0_20px_rgba(117,81,255,0.4)]">
              <Brain className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t('reports.aiAnalytics')}</h3>
              <p className="text-xs text-white/30">{t('reports.aiAnalyticsSubtitle')}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4 mb-5">
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.period')}</label>
              <div className="flex gap-1 p-0.5 rounded-xl bg-white/[0.03]">
                <button
                  onClick={() => setPeriod('day')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-300 ${period === 'day' ? 'btn-primary text-white shadow-[0_0_12px_rgba(0,117,255,0.3)]' : 'text-white/40 hover:text-white/60'}`}
                >
                  {t('reports.day')}
                </button>
                <button
                  onClick={() => setPeriod('week')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-300 ${period === 'week' ? 'btn-primary text-white shadow-[0_0_12px_rgba(0,117,255,0.3)]' : 'text-white/40 hover:text-white/60'}`}
                >
                  {t('reports.week')}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.mode')}</label>
              <div className="flex gap-1 p-0.5 rounded-xl bg-white/[0.03]">
                <button
                  onClick={() => setMode('employee')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-300 ${mode === 'employee' ? 'btn-primary text-white shadow-[0_0_12px_rgba(0,117,255,0.3)]' : 'text-white/40 hover:text-white/60'}`}
                >
                  {t('reports.employee')}
                </button>
                <button
                  onClick={() => setMode('executive')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all duration-300 ${mode === 'executive' ? 'btn-primary text-white shadow-[0_0_12px_rgba(0,117,255,0.3)]' : 'text-white/40 hover:text-white/60'}`}
                >
                  {t('reports.manager')}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.role')}</label>
              <VisionSelect value={roleProfile} onChange={setRoleProfile}>
                <option value="developer" className="bg-[#111C44]">{t('reports.developer')}</option>
                <option value="manager" className="bg-[#111C44]">{t('reports.managerRole')}</option>
                <option value="office" className="bg-[#111C44]">{t('reports.office')}</option>
              </VisionSelect>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.date')} (as_of)</label>
              <VisionInput type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{t('reports.userId')}</label>
              <VisionInput placeholder={`user_id (${t('reports.userIdOptional')})`} value={userId} onChange={(e) => setUserId(e.target.value)} />
            </div>
          </div>
          <button onClick={handleLoad} disabled={loading} className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">
            <Sparkles className="h-4 w-4" />
            {loading ? t('reports.loading') : t('reports.load')}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {!loading && scorecard != null && (
        <>
          {/* Score Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="stat-card vision-card p-6 text-center relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0075FF]/10 to-transparent" />
              <div className="relative">
                <div className="flex items-center justify-center mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0075FF]/15">
                    <Target className="h-5 w-5 text-[#0075FF]" />
                  </div>
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{t('reports.currentScore')}</p>
                <p className="text-4xl font-extrabold text-white mb-1">{score.toFixed(1)}</p>
                <p className="text-xs text-white/30">{String(userName)}</p>
              </div>
            </div>

            <div className="stat-card vision-card p-6 text-center relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#7551FF]/10 to-transparent" />
              <div className="relative">
                <div className="flex items-center justify-center mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7551FF]/15">
                    <BarChart3 className="h-5 w-5 text-[#7551FF]" />
                  </div>
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{t('reports.baseline')}</p>
                <p className="text-4xl font-extrabold text-white/60 mb-1">{baseline.toFixed(1)}</p>
                <p className="text-xs text-white/30">{String(periodStart)} \u2014 {String(periodEnd)}</p>
              </div>
            </div>

            <div className="stat-card vision-card p-6 text-center relative overflow-hidden">
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${delta >= 0 ? 'from-[#01B574]/10' : 'from-[#E31A1A]/10'} to-transparent`} />
              <div className="relative">
                <div className="flex items-center justify-center mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${delta >= 0 ? 'bg-[#01B574]/15' : 'bg-[#E31A1A]/15'}`}>
                    {delta >= 0 ? (
                      <ArrowUpRight className="h-5 w-5 text-[#01B574]" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-[#E31A1A]" />
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{t('reports.delta')}</p>
                <p className={`text-4xl font-extrabold ${delta >= 0 ? 'text-[#01B574]' : 'text-[#E31A1A]'}`}>
                  {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          {trend.length > 0 && (
            <div className="vision-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="h-4 w-4 text-[#0075FF]" />
                <h4 className="text-base font-bold text-white">{t('reports.trend')}</h4>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="period_start" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<GlassTooltip />} />
                    <Line type="monotone" dataKey="score" stroke="url(#lineGradient)" strokeWidth={2.5} dot={false} />
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#7551FF" />
                        <stop offset="100%" stopColor="#0075FF" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Drivers */}
          {primaryDrivers.length > 0 && (
            <div className="vision-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Zap className="h-4 w-4 text-[#FFB547]" />
                <h4 className="text-base font-bold text-white">{t('reports.keyFactors')}</h4>
              </div>
              <div className="space-y-2">
                {primaryDrivers.map((driver, idx) => {
                  const impact = Number(driver.impact ?? 0)
                  return (
                    <div key={idx} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] px-5 py-3.5 transition-all duration-200 hover:bg-white/[0.05] hover:border-white/[0.08]">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${impact >= 0 ? 'bg-[#01B574]/15 text-[#01B574]' : 'bg-[#E31A1A]/15 text-[#E31A1A]'}`}>
                        {impact >= 0 ? '+' : ''}{impact.toFixed(1)}%
                      </span>
                      <span className="text-sm text-white/80 font-medium">{String(driver.name ?? driver.label ?? driver.factor ?? '\u2014')}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Interpretation */}
          {interpretation != null && (
            <div className="vision-card p-6 relative overflow-hidden">
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-[#01B574]/8 blur-2xl" style={{ animation: 'orbFloat3 12s ease-in-out infinite' }} />
              <div className="relative">
                <div className="flex items-center gap-2 mb-5">
                  <Brain className="h-4 w-4 text-[#7551FF]" />
                  <h4 className="text-base font-bold text-white">{t('reports.interpretation')}</h4>
                </div>
                <div className="space-y-3">
                  {Object.entries(interpretation).map(([key, value]) => (
                    <div key={key} className="rounded-2xl bg-white/[0.03] border border-white/[0.05] px-5 py-4">
                      <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">{key}</p>
                      <p className="text-sm text-white/70 leading-relaxed">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && data != null && data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
            <Brain className="h-6 w-6 text-white/15" />
          </div>
          <p className="text-sm text-white/25 font-medium">{t('reports.noData')}</p>
        </div>
      )}
    </div>
  )
}

/* ─── Main ReportsPage ─── */

export default function ReportsPage() {
  const { t } = useTranslation()
  const orgId = useOrgStore((s) => s.orgId)
  const [activeTab, setActiveTab] = useState(0)

  const reportTabs = [
    { id: 0, label: t('reports.orgKpiTab'), icon: BarChart3 },
    { id: 1, label: t('reports.projectKpiTab'), icon: FolderKanban },
    { id: 2, label: t('reports.productivity'), icon: Zap },
    { id: 3, label: t('reports.metricsTab'), icon: Activity },
    { id: 4, label: t('reports.exportsTab'), icon: FileDown },
    { id: 5, label: t('reports.aiAnalyticsTab'), icon: Brain },
  ]

  if (!orgId) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <BarChart3 className="h-7 w-7 text-white/20" />
          </div>
          <p className="text-white/40 text-sm">{t('reports.joinOrg')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
      {/* Page Title */}
      <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
        {t('reports.reportsAndAnalytics')}
      </h1>

      {/* Tab Navigation */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex gap-1.5 p-1 rounded-2xl bg-white/[0.03] w-fit">
          {reportTabs.map((tab) => {
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
      {activeTab === 0 && <OrgKpiTab orgId={orgId} />}
      {activeTab === 1 && <ProjectKpiTab orgId={orgId} />}
      {activeTab === 2 && <ProductivityTab orgId={orgId} />}
      {activeTab === 3 && <MetricsTab orgId={orgId} />}
      {activeTab === 4 && <ExportsTab orgId={orgId} />}
      {activeTab === 5 && <AiAnalyticsTab orgId={orgId} />}
    </div>
  )
}
