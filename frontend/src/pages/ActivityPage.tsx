import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useOrgStore } from '@/stores/orgStore'
import {
  startSession,
  stopSession,
  listMySessions,
  listOrgSessions,
} from '@/api/sessions'
import type { Session } from '@/types'
import { Play, Square, Monitor, Cpu, Clock, Users, Wifi, WifiOff } from 'lucide-react'

function formatDate(iso?: string) {
  if (!iso) return '\u2014'
  return new Date(iso).toLocaleString()
}

function SessionTable({ sessions }: { sessions: Session[] }) {
  const { t } = useTranslation()
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
          <Clock className="h-6 w-6 text-white/20" />
        </div>
        <p className="text-sm text-white/30 font-medium">{t('activity.noSessions')}</p>
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-left">
            <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('activity.tableId')}</th>
            <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('activity.tableStart')}</th>
            <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('activity.tableEnd')}</th>
            <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-wider">{t('activity.tableStatus')}</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s, idx) => (
            <tr
              key={s.id}
              className={`border-b border-white/5 transition-colors duration-200 hover:bg-white/[0.03] ${
                idx % 2 === 1 ? 'bg-white/[0.02]' : ''
              }`}
            >
              <td className="px-4 py-3.5 font-mono text-xs text-white/50">{s.id}</td>
              <td className="px-4 py-3.5 text-white/70 text-sm">{formatDate(s.started_at)}</td>
              <td className="px-4 py-3.5 text-white/70 text-sm">{formatDate(s.ended_at)}</td>
              <td className="px-4 py-3.5">
                {s.ended_at ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/40">
                    <WifiOff className="h-3 w-3" />
                    {t('activity.statusCompleted')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#01B574]/15 px-3 py-1 text-xs font-semibold text-[#01B574]">
                    <Wifi className="h-3 w-3" />
                    {t('activity.statusActive')}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ActivityPage() {
  const { orgId } = useOrgStore()
  const { t } = useTranslation()

  const [deviceName, setDeviceName] = useState(
    () => navigator.userAgent.substring(0, 50),
  )
  const [osName, setOsName] = useState(() => navigator.platform)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [stopping, setStopping] = useState(false)

  const [mySessions, setMySessions] = useState<Session[]>([])
  const [orgSessions, setOrgSessions] = useState<Session[]>([])
  const [loadingMy, setLoadingMy] = useState(false)
  const [loadingOrg, setLoadingOrg] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  const loadMySessions = useCallback(async () => {
    if (!orgId) return
    setLoadingMy(true)
    try {
      const r = await listMySessions(orgId)
      setMySessions(r.data)
    } catch {
      toast.error(t('activity.loadMyError'))
    } finally {
      setLoadingMy(false)
    }
  }, [orgId, t])

  const loadOrgSessions = useCallback(async () => {
    if (!orgId) return
    setLoadingOrg(true)
    try {
      const r = await listOrgSessions(orgId)
      setOrgSessions(r.data)
    } catch {
      toast.error(t('activity.loadOrgError'))
    } finally {
      setLoadingOrg(false)
    }
  }, [orgId, t])

  useEffect(() => {
    if (activeTab === 0) loadMySessions()
  }, [activeTab, loadMySessions])

  useEffect(() => {
    if (activeTab === 1) loadOrgSessions()
  }, [activeTab, loadOrgSessions])

  async function handleStart() {
    if (!orgId) return
    setStarting(true)
    try {
      const r = await startSession(orgId, deviceName, osName)
      setActiveSessionId(r.data.id)
      toast.success(t('activity.sessionStarted'))
      loadMySessions()
    } catch {
      toast.error(t('activity.startError'))
    } finally {
      setStarting(false)
    }
  }

  async function handleStop() {
    if (!orgId || !activeSessionId) return
    setStopping(true)
    try {
      await stopSession(orgId, activeSessionId)
      setActiveSessionId(null)
      toast.success(t('activity.sessionStopped'))
      loadMySessions()
    } catch {
      toast.error(t('activity.stopError'))
    } finally {
      setStopping(false)
    }
  }

  if (!orgId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <Clock className="h-7 w-7 text-white/20" />
          </div>
          <p className="text-white/40 text-sm">
            {t('activity.joinOrgForActivity')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
          {t('activity.title')}
        </h1>
        {activeSessionId && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#01B574]/10 border border-[#01B574]/20 px-3 py-1 text-xs font-medium text-[#01B574]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#01B574] animate-pulse" />
            {t('activity.activeSession')}
          </span>
        )}
      </div>

      {/* Session Management Card */}
      <div className="vision-card p-6 relative overflow-hidden">
        {/* Decorative orb */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[#0075FF]/10 blur-3xl" style={{ animation: 'orbFloat1 8s ease-in-out infinite' }} />

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0075FF] to-[#2563EB] shadow-[0_0_20px_rgba(0,117,255,0.3)]">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{t('activity.sessionManagement')}</h3>
              <p className="text-xs text-white/30">{t('activity.deviceAndSessionSettings')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">
                <Monitor className="h-3 w-3" />
                {t('activity.device')}
              </label>
              <input
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder={t('activity.devicePlaceholder')}
                className="vision-input w-full h-10 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">
                <Cpu className="h-3 w-3" />
                {t('activity.os')}
              </label>
              <input
                value={osName}
                onChange={(e) => setOsName(e.target.value)}
                placeholder={t('activity.osPlaceholder')}
                className="vision-input w-full h-10 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleStart}
              disabled={starting || !!activeSessionId}
              className="btn-primary flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              {starting ? t('activity.starting') : t('activity.startSession')}
            </button>
            <button
              onClick={handleStop}
              disabled={stopping || !activeSessionId}
              className="flex items-center gap-2 rounded-xl bg-[#E31A1A]/10 border border-[#E31A1A]/20 px-6 py-2.5 text-sm font-bold text-[#E31A1A] hover:bg-[#E31A1A]/20 hover:border-[#E31A1A]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
            >
              <Square className="h-4 w-4" />
              {stopping ? t('activity.stopping') : t('activity.stopSession')}
            </button>
          </div>

          {activeSessionId && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#01B574]/5 border border-[#01B574]/15 px-5 py-3" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
              <div className="h-2.5 w-2.5 rounded-full bg-[#01B574] animate-pulse shadow-[0_0_8px_rgba(1,181,116,0.5)]" />
              <span className="text-sm text-white/60">{t('activity.currentSession')}</span>
              <span className="font-mono text-xs text-[#01B574] bg-[#01B574]/10 rounded-lg px-2.5 py-1">{activeSessionId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sessions List Card */}
      <div className="vision-card p-6">
        {/* Tab Pills */}
        <div className="flex gap-2 mb-6 p-1 rounded-2xl bg-white/[0.03] w-fit">
          <button
            onClick={() => setActiveTab(0)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
              activeTab === 0
                ? 'btn-primary text-white shadow-[0_0_20px_rgba(0,117,255,0.3)]'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            <Clock className="h-4 w-4" />
            {t('activity.mySessions')}
          </button>
          <button
            onClick={() => setActiveTab(1)}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
              activeTab === 1
                ? 'btn-primary text-white shadow-[0_0_20px_rgba(0,117,255,0.3)]'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            <Users className="h-4 w-4" />
            {t('activity.allSessions')}
          </button>
        </div>

        {activeTab === 0 && (
          <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-bold text-white">{t('activity.mySessions')}</h3>
              <span className="text-xs text-white/20 bg-white/5 rounded-full px-2.5 py-0.5 font-medium">
                {mySessions.length}
              </span>
            </div>
            {loadingMy ? (
              <div className="flex items-center gap-2 py-8 justify-center">
                <div className="h-4 w-4 rounded-full border-2 border-[#0075FF]/30 border-t-[#0075FF] animate-spin" />
                <p className="text-sm text-white/30">{t('common.loading')}</p>
              </div>
            ) : (
              <SessionTable sessions={mySessions} />
            )}
          </div>
        )}

        {activeTab === 1 && (
          <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-bold text-white">{t('activity.allOrgSessions')}</h3>
              <span className="text-xs text-white/20 bg-white/5 rounded-full px-2.5 py-0.5 font-medium">
                {orgSessions.length}
              </span>
            </div>
            {loadingOrg ? (
              <div className="flex items-center gap-2 py-8 justify-center">
                <div className="h-4 w-4 rounded-full border-2 border-[#0075FF]/30 border-t-[#0075FF] animate-spin" />
                <p className="text-sm text-white/30">{t('common.loading')}</p>
              </div>
            ) : (
              <SessionTable sessions={orgSessions} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
