import { NavLink } from 'react-router'
import {
  LayoutDashboard,
  User,
  Activity,
  BarChart3,
  Shield,
  Settings,
  FileBarChart,
  ShieldCheck,
  ChevronLeft,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/stores/uiStore'

export function Sidebar() {
  const { t } = useTranslation()

  const mainNavItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/reports', label: t('nav.reports'), icon: FileBarChart },
    { to: '/admin', label: t('nav.admin'), icon: ShieldCheck },
  ]

  const accountNavItems = [
    { to: '/profile', label: t('nav.profile'), icon: User },
    { to: '/activity', label: t('nav.activity'), icon: Activity },
    { to: '/settings', label: t('nav.settings'), icon: Settings },
  ]
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
        collapsed ? 'w-[78px]' : 'w-[260px]',
      )}
      style={{
        background: 'linear-gradient(195deg, #0f1a45 0%, #080e2e 40%, #060920 100%)',
      }}
    >
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="group absolute -right-3 top-7 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#111c44] text-white/50 shadow-lg transition-all duration-300 hover:border-[#0075FF]/50 hover:bg-[#0075FF]/20 hover:text-white hover:shadow-[0_0_12px_rgba(0,117,255,0.3)]"
      >
        {collapsed ? (
          <Menu className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-px" />
        )}
      </button>

      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-5 pt-7 pb-5 transition-all duration-500', collapsed && 'justify-center px-3')}>
        <div
          className="sidebar-logo-glow relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #868CFF 0%, #4318FF 100%)',
          }}
        >
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div
          className={cn(
            'overflow-hidden transition-all duration-500',
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
          )}
        >
          <span className="whitespace-nowrap text-sm font-bold tracking-[0.15em] text-white uppercase">
            Vision UI
          </span>
          <span className="block whitespace-nowrap text-[10px] font-medium tracking-wider text-white/30">
            DASHBOARD PRO
          </span>
        </div>
      </div>

      {/* Separator */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Main Navigation */}
      <nav className="flex-1 px-3 pt-5">
        <div className="space-y-1">
          {mainNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300',
                  isActive
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80',
                  collapsed && 'justify-center px-2',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  <div
                    className={cn(
                      'absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full transition-all duration-300',
                      isActive
                        ? 'bg-[#0075FF] opacity-100 shadow-[0_0_12px_rgba(0,117,255,0.6),0_0_4px_rgba(0,117,255,0.8)]'
                        : 'bg-transparent opacity-0 group-hover:bg-white/20 group-hover:opacity-100',
                    )}
                  />

                  {/* Active background glow */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />
                  )}

                  {/* Icon container */}
                  <div
                    className={cn(
                      'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-br from-[#0075FF] to-[#4318FF] shadow-[0_4px_12px_rgba(0,117,255,0.4)]'
                        : 'bg-white/[0.06] group-hover:bg-white/10',
                    )}
                  >
                    <Icon className={cn('h-4 w-4 transition-all duration-300', isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80')} />
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      'relative overflow-hidden whitespace-nowrap transition-all duration-500',
                      collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
                    )}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Section separator */}
        <div className={cn('my-4 flex items-center gap-3 px-2', collapsed && 'px-0')}>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          {!collapsed && (
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
              {t('sidebar.account')}
            </span>
          )}
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* Account Navigation */}
        <div className="space-y-1">
          {accountNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300',
                  isActive
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80',
                  collapsed && 'justify-center px-2',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  <div
                    className={cn(
                      'absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full transition-all duration-300',
                      isActive
                        ? 'bg-[#0075FF] opacity-100 shadow-[0_0_12px_rgba(0,117,255,0.6),0_0_4px_rgba(0,117,255,0.8)]'
                        : 'bg-transparent opacity-0 group-hover:bg-white/20 group-hover:opacity-100',
                    )}
                  />

                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />
                  )}

                  <div
                    className={cn(
                      'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300',
                      isActive
                        ? 'bg-gradient-to-br from-[#0075FF] to-[#4318FF] shadow-[0_4px_12px_rgba(0,117,255,0.4)]'
                        : 'bg-white/[0.06] group-hover:bg-white/10',
                    )}
                  >
                    <Icon className={cn('h-4 w-4 transition-all duration-300', isActive ? 'text-white' : 'text-white/60 group-hover:text-white/80')} />
                  </div>

                  <span
                    className={cn(
                      'relative overflow-hidden whitespace-nowrap transition-all duration-500',
                      collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
                    )}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Help card with animated gradient border */}
      <div
        className={cn(
          'mx-3 mb-4 overflow-hidden transition-all duration-500',
          collapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-60 opacity-100',
        )}
      >
        <div className="sidebar-help-card relative rounded-2xl p-px">
          {/* Animated gradient border */}
          <div className="sidebar-gradient-border absolute inset-0 rounded-2xl opacity-60" />

          <div
            className="relative rounded-2xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,117,255,0.15) 0%, rgba(117,81,255,0.1) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0075FF]/30 to-[#7551FF]/30 shadow-[0_0_20px_rgba(0,117,255,0.2)]">
              <Shield className="h-5 w-5 text-[#868CFF]" />
            </div>
            <p className="text-xs font-bold text-white">{t('sidebar.needHelp')}</p>
            <p className="mt-1 text-[10px] text-white/40">{t('sidebar.checkDocs')}</p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block w-full rounded-xl bg-white/[0.08] px-4 py-2 text-[11px] font-bold tracking-wider text-white/80 transition-all duration-300 hover:bg-white/[0.14] hover:text-white hover:shadow-[0_0_16px_rgba(0,117,255,0.2)]"
            >
              {t('sidebar.documentation')}
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
