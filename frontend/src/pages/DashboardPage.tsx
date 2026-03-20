import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Task, Project } from '@/types'
import { getGreeting } from '@/lib/greeting'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { createOrg, joinOrg, getOrg } from '@/api/orgs'
import { listTodayTasks } from '@/api/tasks'
import { listProjects } from '@/api/projects'
import { createDailyReport } from '@/api/dailyReports'
import {
  Wallet,
  Globe,
  FileText,
  ShoppingCart,
  CheckSquare,
  MoreHorizontal,
  Building2,
  ClipboardList,
  Send,
  Sparkles,
  Inbox,
  Loader2,
  Users,
  MousePointerClick,
  DollarSign,
  Box,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Premium keyframe styles                                            */
/* ------------------------------------------------------------------ */
const dashboardStyles = `
@keyframes dash-fade-up {
  from { opacity: 0; transform: translateY(28px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes dash-gradient-flow {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes dash-gauge-fill {
  from { stroke-dasharray: 0 314; }
}
@keyframes dash-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
@keyframes dash-pulse-soft {
  0%, 100% { opacity: 0.18; }
  50%      { opacity: 0.35; }
}
@keyframes dash-sparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
  50%      { opacity: 1; transform: scale(1.2) rotate(180deg); }
}
@keyframes dash-spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes dash-shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes dash-neon-pulse {
  0%, 100% { filter: drop-shadow(0 0 4px var(--neon-color, rgba(0,117,255,0.4))); }
  50%      { filter: drop-shadow(0 0 12px var(--neon-color, rgba(0,117,255,0.7))); }
}
@keyframes dash-icon-pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.08); }
}
@keyframes dash-orb-1 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
  25% { transform: translate(30px, -40px) scale(1.1); opacity: 0.25; }
  50% { transform: translate(-20px, -60px) scale(0.95); opacity: 0.12; }
  75% { transform: translate(40px, -20px) scale(1.05); opacity: 0.2; }
}
@keyframes dash-orb-2 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
  25% { transform: translate(-40px, 30px) scale(0.9); opacity: 0.2; }
  50% { transform: translate(30px, 50px) scale(1.1); opacity: 0.08; }
  75% { transform: translate(-20px, 20px) scale(1); opacity: 0.18; }
}
@keyframes dash-orb-3 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.12; }
  33% { transform: translate(50px, -30px) scale(1.15); opacity: 0.22; }
  66% { transform: translate(-30px, 40px) scale(0.85); opacity: 0.1; }
}
@keyframes dash-border-glow {
  0%, 100% { border-color: rgba(255,255,255,0.08); }
  50%      { border-color: rgba(0,117,255,0.2); }
}

.stat-card {
  animation: dash-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.stat-card:nth-child(1) { animation-delay: 0s; }
.stat-card:nth-child(2) { animation-delay: 0.12s; }
.stat-card:nth-child(3) { animation-delay: 0.24s; }
.stat-card:nth-child(4) { animation-delay: 0.36s; }
.stat-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 117, 255, 0.2), 0 0 0 1px rgba(0, 117, 255, 0.15);
}

.dash-gauge-circle {
  animation: dash-gauge-fill 1.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.dash-table-row {
  transition: background 0.25s, transform 0.2s;
}
.dash-table-row:hover {
  background: rgba(255,255,255,0.05);
}

.vision-input {
  width: 100%;
  height: 46px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  padding: 0 16px;
  font-size: 14px;
  color: white;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
}
.vision-input:focus {
  border-color: #0075FF;
  box-shadow: 0 0 0 3px rgba(0,117,255,0.18), 0 0 20px rgba(0,117,255,0.1);
  background: rgba(255,255,255,0.06);
}
.vision-input::placeholder {
  color: rgba(255,255,255,0.25);
}

.vision-btn-primary {
  height: 46px;
  border-radius: 14px;
  background: linear-gradient(135deg, #0075FF 0%, #7551FF 100%);
  color: white;
  font-weight: 700;
  font-size: 14px;
  border: none;
  cursor: pointer;
  padding: 0 24px;
  transition: transform 0.25s, box-shadow 0.25s, opacity 0.25s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}
.vision-btn-primary::after {
  content: '';
  position: absolute;
  top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  transition: left 0.5s ease;
}
.vision-btn-primary:hover:not(:disabled)::after {
  left: 100%;
}
.vision-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,117,255,0.4), 0 0 60px rgba(117,81,255,0.15);
}
.vision-btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.vision-btn-secondary {
  height: 46px;
  border-radius: 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  padding: 0 24px;
  transition: transform 0.25s, background 0.25s, box-shadow 0.25s, border-color 0.25s;
}
.vision-btn-secondary:hover:not(:disabled) {
  background: rgba(255,255,255,0.1);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.2);
}
.vision-btn-secondary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.dash-checkbox {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.04);
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
}
.dash-checkbox:checked {
  background: linear-gradient(135deg, #0075FF, #7551FF);
  border-color: transparent;
  box-shadow: 0 0 12px rgba(0,117,255,0.3);
}
.dash-checkbox:checked::after {
  content: '';
  position: absolute;
  left: 6px; top: 3px;
  width: 5px; height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Premium glassmorphism card override */
.premium-glass {
  background: linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  backdrop-filter: blur(120px) saturate(180%);
  position: relative;
  overflow: hidden;
}
.premium-glass::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%);
  pointer-events: none;
}

/* Shimmer line for stat cards */
.stat-shimmer::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  background-size: 200% 100%;
  animation: dash-shimmer 3s ease-in-out infinite;
}

/* Animated section entrance */
.dash-section {
  animation: dash-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.dash-section:nth-child(1) { animation-delay: 0.05s; }
.dash-section:nth-child(2) { animation-delay: 0.15s; }
.dash-section:nth-child(3) { animation-delay: 0.25s; }
.dash-section:nth-child(4) { animation-delay: 0.35s; }
`

/* ------------------------------------------------------------------ */
/*  Stat Cards (top row)                                               */
/* ------------------------------------------------------------------ */
function StatCards() {
  const { t } = useTranslation()
  const stats = [
    {
      label: t('dashboard.totalEarnings'),
      value: '$53,000',
      change: '+55%',
      positive: true,
      icon: Wallet,
      iconBg: 'linear-gradient(135deg, #0075FF 0%, #00D1FF 100%)',
      neonColor: 'rgba(0,117,255,0.5)',
    },
    {
      label: t('dashboard.totalClients'),
      value: '2,300',
      change: '+5%',
      positive: true,
      icon: Globe,
      iconBg: 'linear-gradient(135deg, #01B574 0%, #00F0FF 100%)',
      neonColor: 'rgba(1,181,116,0.5)',
    },
    {
      label: t('dashboard.newProjects'),
      value: '+3,052',
      change: '-14%',
      positive: false,
      icon: FileText,
      iconBg: 'linear-gradient(135deg, #FFB547 0%, #FF6B35 100%)',
      neonColor: 'rgba(255,181,71,0.5)',
    },
    {
      label: t('dashboard.totalSales'),
      value: '$173,000',
      change: '+8%',
      positive: true,
      icon: ShoppingCart,
      iconBg: 'linear-gradient(135deg, #7551FF 0%, #C851FF 100%)',
      neonColor: 'rgba(117,81,255,0.5)',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="stat-card stat-shimmer vision-card relative flex items-center justify-between p-6"
          style={{
            transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s',
            overflow: 'hidden',
          }}
        >
          {/* Subtle background glow */}
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at 80% 50%, ${s.neonColor}, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              background: `radial-gradient(circle at 80% 50%, ${s.neonColor}, transparent 60%)`,
              pointerEvents: 'none',
            }}
          />
          <div className="relative z-10">
            <p className="text-[11px] font-semibold text-white/35 uppercase tracking-[0.15em]">{s.label}</p>
            <div className="mt-1.5 flex items-baseline gap-3">
              <span className="text-[26px] font-extrabold text-white tracking-tight leading-tight">{s.value}</span>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                style={{
                  background: s.positive ? 'rgba(1,181,116,0.12)' : 'rgba(227,26,26,0.12)',
                  color: s.positive ? '#01B574' : '#E31A1A',
                  boxShadow: s.positive
                    ? '0 0 12px rgba(1,181,116,0.15)'
                    : '0 0 12px rgba(227,26,26,0.15)',
                }}
              >
                {s.change}
              </span>
            </div>
          </div>
          <div
            className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: s.iconBg,
              boxShadow: `0 8px 24px ${s.neonColor}`,
            }}
          >
            <s.icon className="h-6 w-6 text-white" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Welcome Card                                                       */
/* ------------------------------------------------------------------ */
function WelcomeCard() {
  const { t } = useTranslation()
  const fullName = useAuthStore((s) => s.fullName)

  const getGreetingKey = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'dashboard.greeting.morning'
    if (hour >= 12 && hour < 18) return 'dashboard.greeting.afternoon'
    if (hour >= 18 && hour < 23) return 'dashboard.greeting.evening'
    return 'dashboard.greeting.night'
  }

  return (
    <div
      className="relative overflow-hidden rounded-[20px] p-8"
      style={{
        background: 'linear-gradient(135deg, #0075FF 0%, #7551FF 30%, #C851FF 60%, #0075FF 100%)',
        backgroundSize: '400% 400%',
        animation: 'dash-gradient-flow 10s ease infinite',
        minHeight: '240px',
      }}
    >
      {/* Floating animated orbs */}
      <div
        className="absolute h-28 w-28 rounded-full"
        style={{
          top: '10%',
          right: '15%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          animation: 'dash-orb-1 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute h-20 w-20 rounded-full"
        style={{
          bottom: '10%',
          right: '5%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          animation: 'dash-orb-2 10s ease-in-out infinite',
        }}
      />
      <div
        className="absolute h-16 w-16 rounded-full"
        style={{
          top: '50%',
          left: '60%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          animation: 'dash-orb-3 12s ease-in-out infinite',
        }}
      />
      <div
        className="absolute h-10 w-10 rounded-full"
        style={{
          bottom: '20%',
          left: '40%',
          background: 'rgba(255,255,255,0.06)',
          animation: 'dash-float 5s ease-in-out infinite 1s',
        }}
      />

      {/* Particle dots overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
        }}
      />

      {/* Sparkle decorations */}
      <div className="absolute top-5 right-6" style={{ animation: 'dash-sparkle 3s ease-in-out infinite' }}>
        <Sparkles className="h-5 w-5 text-white/50" />
      </div>
      <div className="absolute top-12 right-20" style={{ animation: 'dash-sparkle 4.5s ease-in-out infinite 0.5s' }}>
        <Sparkles className="h-3 w-3 text-white/30" />
      </div>
      <div className="absolute bottom-12 right-28" style={{ animation: 'dash-sparkle 4s ease-in-out infinite 1.5s' }}>
        <Sparkles className="h-4 w-4 text-white/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full">
        <p className="text-[11px] font-bold text-white/50 uppercase tracking-[0.25em]">{t('dashboard.welcomeBack')}</p>
        <h2 className="mt-3 text-4xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
          {fullName ?? t('dashboard.welcome')}
        </h2>
        <p className="mt-4 text-base font-medium text-white/85 leading-relaxed max-w-[320px]">
          {t(getGreetingKey())}!
        </p>
        <p className="mt-1.5 text-sm text-white/45 font-medium">{t('dashboard.haveAGoodDay')}</p>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.15), transparent)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Satisfaction Rate (gauge)                                          */
/* ------------------------------------------------------------------ */
function SatisfactionRate() {
  const { t } = useTranslation()
  const pct = 95
  const circumference = 2 * Math.PI * 50

  return (
    <div className="vision-card flex flex-col items-center justify-center p-6">
      <p className="text-[11px] font-bold text-white/35 uppercase tracking-[0.15em] mb-1">
        {t('dashboard.satisfaction')}
      </p>
      <p className="text-[11px] text-white/25 mb-5">{t('dashboard.allProjects')}</p>

      <div className="relative flex h-36 w-36 items-center justify-center">
        <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
          <defs>
            <linearGradient id="gauge-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#01B574" />
              <stop offset="100%" stopColor="#00F0FF" />
            </linearGradient>
            <filter id="gauge-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Background track */}
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="10"
          />
          {/* Glow layer */}
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth="12"
            strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
            strokeLinecap="round"
            className="dash-gauge-circle"
            style={{ filter: 'blur(6px)', opacity: 0.4 }}
          />
          {/* Main stroke */}
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth="10"
            strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
            strokeLinecap="round"
            className="dash-gauge-circle"
            style={{ filter: 'drop-shadow(0 0 8px rgba(1,181,116,0.5))' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <div style={{ animation: 'dash-icon-pulse 2.5s ease-in-out infinite' }}>
            <CheckSquare className="h-5 w-5 text-[#01B574] mb-1" style={{ filter: 'drop-shadow(0 0 6px rgba(1,181,116,0.4))' }} />
          </div>
          <span className="text-3xl font-black text-white" style={{ textShadow: '0 0 20px rgba(1,181,116,0.2)' }}>
            {pct}%
          </span>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-white/25 font-medium">{t('dashboard.basedOnReviews')}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Referral Tracking                                                  */
/* ------------------------------------------------------------------ */
function ReferralTracking() {
  const { t } = useTranslation()
  const score = 9.3
  const circumference = 2 * Math.PI * 50

  return (
    <div className="vision-card p-6">
      <p className="text-[11px] font-bold text-white/35 uppercase tracking-[0.15em] mb-1">
        {t('dashboard.referralStats')}
      </p>
      <div className="flex items-baseline gap-2 mb-5">
        <p className="text-4xl font-black text-white tracking-tight">145</p>
        <p className="text-xs text-white/25 font-medium">{t('dashboard.people')}</p>
      </div>

      <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
        <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
          <defs>
            <linearGradient id="ref-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0075FF" />
              <stop offset="100%" stopColor="#C851FF" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
          {/* Glow layer */}
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke="url(#ref-gradient)"
            strokeWidth="12"
            strokeDasharray={`${(score / 10) * circumference} ${circumference}`}
            strokeLinecap="round"
            className="dash-gauge-circle"
            style={{ filter: 'blur(6px)', opacity: 0.35 }}
          />
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke="url(#ref-gradient)"
            strokeWidth="10"
            strokeDasharray={`${(score / 10) * circumference} ${circumference}`}
            strokeLinecap="round"
            className="dash-gauge-circle"
            style={{ filter: 'drop-shadow(0 0 8px rgba(0,117,255,0.4))' }}
          />
        </svg>
        <span className="absolute text-3xl font-black text-white" style={{ textShadow: '0 0 20px rgba(0,117,255,0.2)' }}>
          {score}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3.5 text-center transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.12] hover:shadow-lg hover:shadow-blue-500/5">
          <p className="text-[10px] text-white/25 mb-1 font-medium uppercase tracking-wider">{t('dashboard.totalScore')}</p>
          <p className="text-base font-bold text-white">1,465</p>
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3.5 text-center transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.12] hover:shadow-lg hover:shadow-purple-500/5">
          <p className="text-[10px] text-white/25 mb-1 font-medium uppercase tracking-wider">{t('dashboard.invited')}</p>
          <p className="text-base font-bold text-white">1,465</p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Check Table                                                        */
/* ------------------------------------------------------------------ */
function CheckTable() {
  const { t } = useTranslation()
  const rows = [
    { name: 'Venus PRO', progress: 10.5, quantity: 1465, date: '12.Jun.2021', checked: true },
    { name: 'Uranus Kit', progress: 25.5, quantity: 1024, date: '5.Jun.2021', checked: true },
    { name: 'Venus DS', progress: 31.5, quantity: 858, date: '19.Mar.2021', checked: true },
    { name: 'Venus 3D Asset', progress: 12.2, quantity: 166, date: '17.Dec.2021', checked: false },
    { name: 'Venus 3D Asset', progress: 12.2, quantity: 166, date: '17.Dec.2021', checked: false },
    { name: 'Venus 3D Asset', progress: 12.5, quantity: 166, date: '17.Dec.2021', checked: false },
  ]

  const maxProgress = Math.max(...rows.map((r) => r.progress))

  return (
    <div
      className="vision-card p-6"
      style={{ animation: 'dash-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both' }}
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-black text-white tracking-tight">{t('dashboard.checkTable')}</h3>
        <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-white/30 hover:text-white hover:bg-white/[0.08] hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-3 py-3 text-left text-[10px] font-bold text-white/25 uppercase tracking-[0.15em]">
                {t('dashboard.tableName')}
              </th>
              <th className="px-3 py-3 text-left text-[10px] font-bold text-white/25 uppercase tracking-[0.15em]">
                {t('dashboard.tableProgress')}
              </th>
              <th className="px-3 py-3 text-left text-[10px] font-bold text-white/25 uppercase tracking-[0.15em]">
                {t('dashboard.tableQuantity')}
              </th>
              <th className="px-3 py-3 text-left text-[10px] font-bold text-white/25 uppercase tracking-[0.15em]">
                {t('dashboard.tableDate')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="dash-table-row border-b border-white/[0.03] cursor-default"
                style={{
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  borderRadius: '12px',
                }}
              >
                <td className="px-3 py-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={row.checked}
                      readOnly
                      className="dash-checkbox"
                    />
                    <span className="text-sm font-semibold text-white">{row.name}</span>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${(row.progress / maxProgress) * 100}%`,
                          background: row.progress > 25
                            ? 'linear-gradient(90deg, #01B574, #00F0FF)'
                            : row.progress > 15
                            ? 'linear-gradient(90deg, #0075FF, #00D1FF)'
                            : 'linear-gradient(90deg, #7551FF, #C851FF)',
                          boxShadow: row.progress > 25
                            ? '0 0 10px rgba(1,181,116,0.3)'
                            : row.progress > 15
                            ? '0 0 10px rgba(0,117,255,0.3)'
                            : '0 0 10px rgba(117,81,255,0.3)',
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white/40">{row.progress}%</span>
                  </div>
                </td>
                <td className="px-3 py-4 text-sm text-white/40 font-semibold">
                  {row.quantity.toLocaleString()}
                </td>
                <td className="px-3 py-4 text-sm text-white/40 font-medium">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Active Users chart                                                 */
/* ------------------------------------------------------------------ */
function ActiveUsersChart() {
  const { t } = useTranslation()
  const data = [
    { name: t('dashboard.months.jan'), value: 200 },
    { name: t('dashboard.months.feb'), value: 300 },
    { name: t('dashboard.months.mar'), value: 180 },
    { name: t('dashboard.months.apr'), value: 450 },
    { name: t('dashboard.months.may'), value: 350 },
    { name: t('dashboard.months.jun'), value: 500 },
    { name: t('dashboard.months.jul'), value: 280 },
    { name: t('dashboard.months.aug'), value: 420 },
    { name: t('dashboard.months.sep'), value: 380 },
  ]

  const activeStats = [
    { label: t('dashboard.users'), value: '32,984', icon: Users, gradient: 'linear-gradient(135deg, #0075FF, #00D1FF)', shadow: 'rgba(0,117,255,0.3)' },
    { label: t('dashboard.clicks'), value: '2,42m', icon: MousePointerClick, gradient: 'linear-gradient(135deg, #01B574, #00F0FF)', shadow: 'rgba(1,181,116,0.3)' },
    { label: t('dashboard.sales'), value: '2,400$', icon: DollarSign, gradient: 'linear-gradient(135deg, #7551FF, #C851FF)', shadow: 'rgba(117,81,255,0.3)' },
    { label: t('dashboard.items'), value: '320', icon: Box, gradient: 'linear-gradient(135deg, #FFB547, #FF6B35)', shadow: 'rgba(255,181,71,0.3)' },
  ]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(6,11,40,0.97), rgba(10,14,35,0.95))',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 16,
            padding: '12px 18px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 30px rgba(0,117,255,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 4, fontWeight: 600 }}>{label}</p>
          <p style={{ color: 'white', fontSize: 18, fontWeight: 800 }}>{payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div
      className="vision-card p-6"
      style={{ animation: 'dash-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both' }}
    >
      <h3 className="text-[11px] font-bold text-white/35 uppercase tracking-[0.15em] mb-1">
        {t('dashboard.activeUsers')}
      </h3>
      <p className="text-xs text-white/25 mb-5">
        (<span className="font-bold text-[#01B574]" style={{ textShadow: '0 0 8px rgba(1,181,116,0.3)' }}>+23%</span>) {t('dashboard.comparedToLastWeek')}
      </p>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0075FF" stopOpacity={1} />
                <stop offset="50%" stopColor="#7551FF" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#0075FF" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0,117,255,0.04)', radius: 8 }}
            />
            <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3">
        {activeStats.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 group">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
              style={{
                background: s.gradient,
                boxShadow: `0 4px 16px ${s.shadow}`,
              }}
            >
              <s.icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{s.value}</p>
              <p className="text-[10px] text-white/25 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Org Section (existing functionality)                                */
/* ------------------------------------------------------------------ */
function OrgSection() {
  const { t } = useTranslation()
  const { orgId, orgName, setOrg } = useOrgStore()
  const [newOrgName, setNewOrgName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [orgCode, setOrgCode] = useState<string | null>(null)

  useEffect(() => {
    if (orgId) {
      getOrg(orgId)
        .then(({ data }) => setOrgCode(data.code))
        .catch(() => {})
    }
  }, [orgId])

  async function handleCreate() {
    if (!newOrgName.trim()) return
    setLoading(true)
    try {
      const { data: org } = await createOrg(newOrgName.trim())
      setOrg(org.id, org.name)
      toast.success('Organization created')
    } catch {
      toast.error('Failed to create organization')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return
    setLoading(true)
    try {
      await joinOrg(joinCode.trim())
      toast.success('Join request sent')
      setJoinCode('')
    } catch {
      toast.error('Failed to send request')
    } finally {
      setLoading(false)
    }
  }

  if (orgId) {
    return (
      <div
        className="vision-card p-6"
        style={{ animation: 'dash-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both' }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #0075FF, #7551FF)',
              boxShadow: '0 6px 20px rgba(0,117,255,0.3)',
            }}
          >
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-black text-white tracking-tight">{t('dashboard.organization')}</h3>
        </div>
        <p className="text-sm font-semibold text-white/60">{orgName}</p>
        {orgCode && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[11px] text-white/25 font-medium uppercase tracking-wider">{t('dashboard.code')}:</span>
            <span
              className="rounded-xl px-4 py-2 text-xs font-bold text-white"
              style={{
                background: 'rgba(0,117,255,0.08)',
                border: '1px solid rgba(0,117,255,0.15)',
                boxShadow: '0 0 15px rgba(0,117,255,0.08)',
              }}
            >
              {orgCode}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className="vision-card p-6"
      style={{ animation: 'dash-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #0075FF, #7551FF)',
            boxShadow: '0 6px 20px rgba(0,117,255,0.3)',
          }}
        >
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-black text-white tracking-tight">{t('dashboard.organization')}</h3>
      </div>
      <div className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2.5">
            {t('dashboard.createOrg')}
          </label>
          <div className="flex gap-2">
            <input
              placeholder={t('dashboard.namePlaceholder')}
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              className="vision-input flex-1"
            />
            <button
              onClick={handleCreate}
              disabled={loading}
              className="vision-btn-primary whitespace-nowrap"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.create')}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2.5">
            {t('dashboard.joinOrgLabel')}
          </label>
          <div className="flex gap-2">
            <input
              placeholder={t('dashboard.orgCodePlaceholder')}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="vision-input flex-1"
            />
            <button
              onClick={handleJoin}
              disabled={loading}
              className="vision-btn-secondary whitespace-nowrap"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('dashboard.join')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Today's Tasks                                                      */
/* ------------------------------------------------------------------ */
function TodayTasks() {
  const { t } = useTranslation()
  const orgId = useOrgStore((s) => s.orgId)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!orgId) return
    setLoading(true)
    listTodayTasks(orgId)
      .then(({ data }) => setTasks(data))
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false))
  }, [orgId])

  return (
    <div
      className="vision-card p-6"
      style={{ animation: 'dash-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both' }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #01B574, #00F0FF)',
            boxShadow: '0 6px 20px rgba(1,181,116,0.3)',
          }}
        >
          <ClipboardList className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-black text-white tracking-tight">{t('dashboard.todayTasks')}</h3>
      </div>

      {!orgId ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Building2 className="h-7 w-7 text-white/15" />
          </div>
          <p className="text-sm text-white/25 font-medium">{t('dashboard.joinOrgFirst')}</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2
            className="h-8 w-8 animate-spin mb-3"
            style={{ color: '#0075FF', filter: 'drop-shadow(0 0 8px rgba(0,117,255,0.4))' }}
          />
          <p className="text-sm text-white/25 font-medium">{t('common.loading')}</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Inbox className="h-7 w-7 text-white/15" />
          </div>
          <p className="text-sm text-white/25 font-medium">{t('dashboard.noTasks')}</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-4 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.12] hover:shadow-lg hover:shadow-blue-500/5"
            >
              <span className="text-sm font-semibold text-white">{t.title}</span>
              <span
                className="rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em]"
                style={{
                  background: 'rgba(0,117,255,0.1)',
                  color: '#6CB4FF',
                  boxShadow: '0 0 12px rgba(0,117,255,0.08)',
                }}
              >
                {t.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Daily Report                                                       */
/* ------------------------------------------------------------------ */
function DailyReport() {
  const { t } = useTranslation()
  const orgId = useOrgStore((s) => s.orgId)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!orgId) return
    listProjects(orgId)
      .then(({ data }) => setProjects(data))
      .catch(() => {})
  }, [orgId])

  async function handleSubmit() {
    if (!orgId || !selectedProject || !content.trim()) return
    setSending(true)
    try {
      await createDailyReport(orgId, {
        project_id: selectedProject,
        content: content.trim(),
      })
      toast.success('Report sent')
      setContent('')
    } catch {
      toast.error('Failed to send report')
    } finally {
      setSending(false)
    }
  }

  if (!orgId) return null

  return (
    <div
      className="vision-card p-6"
      style={{ animation: 'dash-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{
            background: 'linear-gradient(135deg, #FFB547, #FF6B35)',
            boxShadow: '0 6px 20px rgba(255,181,71,0.3)',
          }}
        >
          <Send className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-black text-white tracking-tight">{t('dashboard.dailyReport')}</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2.5">
            {t('dashboard.project')}
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="vision-input"
            style={{ cursor: 'pointer' }}
          >
            <option value="" style={{ background: '#060B26' }}>{t('dashboard.selectProject')}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id} style={{ background: '#060B26' }}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2.5">
            {t('dashboard.content')}
          </label>
          <textarea
            rows={3}
            placeholder={t('dashboard.whatWasDoneToday')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="vision-input"
            style={{
              height: 'auto',
              paddingTop: 14,
              paddingBottom: 14,
              resize: 'none',
              lineHeight: 1.6,
            }}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={sending || !selectedProject}
          className="vision-btn-primary w-full flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('dashboard.sending')}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {t('dashboard.sendReport')}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard Layout                                              */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  return (
    <>
      {/* Inject dashboard-specific keyframe styles */}
      <style>{dashboardStyles}</style>

      <div className="space-y-7">
        {/* Stat cards */}
        <div className="dash-section">
          <StatCards />
        </div>

        {/* Row 2: Welcome + Satisfaction + Referral */}
        <div className="dash-section grid grid-cols-1 gap-5 xl:grid-cols-3">
          <WelcomeCard />
          <SatisfactionRate />
          <ReferralTracking />
        </div>

        {/* Row 3: Check Table + Active Users */}
        <div className="dash-section grid grid-cols-1 gap-5 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <CheckTable />
          </div>
          <div className="xl:col-span-2">
            <ActiveUsersChart />
          </div>
        </div>

        {/* Row 4: Org + Tasks + Report */}
        <div className="dash-section grid grid-cols-1 gap-5 xl:grid-cols-3">
          <OrgSection />
          <TodayTasks />
          <DailyReport />
        </div>
      </div>
    </>
  )
}
