import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { Search, Bell, Settings, User, Inbox } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

const pageKeys: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/profile': 'profile',
  '/activity': 'activity',
  '/reports': 'reports',
  '/admin': 'admin',
  '/settings': 'settings',
}

export function Header() {
  const { t } = useTranslation()
  const fullName = useAuthStore((s) => s.fullName)
  const location = useLocation()
  const navigate = useNavigate()
  const navKey = pageKeys[location.pathname]
  const page = navKey
    ? { breadcrumb: `${t('common.pages')} / ${t(`nav.${navKey}`)}`, title: t(`nav.${navKey}`) }
    : { breadcrumb: t('common.pages'), title: '' }

  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const bellRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U'

  return (
    <header
      className="relative z-10 flex items-center justify-between px-6 py-4"
      style={{
        background: 'linear-gradient(180deg, rgba(6,11,38,0.8) 0%, rgba(6,11,38,0.4) 60%, transparent 100%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: breadcrumb + title */}
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-xs text-white/35 transition-colors">
          {page.breadcrumb.split(' / ').map((part, i, arr) => (
            <span key={part} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-white/20">/</span>
              )}
              <span className={i === arr.length - 1 ? 'text-white/50' : ''}>
                {part}
              </span>
            </span>
          ))}
        </p>
        <h1 className="mt-0.5 text-sm font-bold tracking-wide text-white">{page.title}</h1>
      </div>

      {/* Right: search + icons + user */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30 transition-colors duration-300" />
          <input
            type="text"
            placeholder={t('header.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`h-9 rounded-xl border bg-white/[0.04] pl-9 pr-4 text-xs text-white placeholder:text-white/25 transition-all duration-400 ease-out focus:outline-none ${
              searchFocused
                ? 'w-64 border-[#0075FF]/50 bg-white/[0.07] shadow-[0_0_20px_rgba(0,117,255,0.12)]'
                : 'w-44 border-white/[0.06] hover:border-white/10'
            }`}
          />
        </div>

        {/* Language switcher */}
        <LanguageSwitcher />

        {/* User avatar */}
        <button className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all duration-300 hover:bg-white/[0.04]">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-lg transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(0,117,255,0.3)]"
            style={{
              background: 'linear-gradient(135deg, #0075FF 0%, #7551FF 100%)',
            }}
          >
            {initials}
          </div>
          <span className="hidden text-xs font-medium text-white/60 transition-colors duration-300 group-hover:text-white/90 sm:inline">
            {fullName ?? t('common.user')}
          </span>
        </button>

        {/* Settings */}
        <button
          onClick={() => navigate('/settings')}
          className="group relative rounded-xl p-2 text-white/40 transition-all duration-300 hover:text-white"
          title={t('header.settingsTooltip')}
        >
          <div className="absolute inset-0 rounded-xl bg-white/0 transition-all duration-300 group-hover:bg-white/[0.06] group-hover:shadow-[0_0_12px_rgba(255,255,255,0.04)]" />
          <Settings className="relative h-4 w-4 transition-transform duration-500 group-hover:rotate-90" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            ref={bellRef}
            onClick={() => setShowNotifications((v) => !v)}
            className="group relative rounded-xl p-2 text-white/40 transition-all duration-300 hover:text-white"
            title={t('header.notificationsTooltip')}
          >
            <div className="absolute inset-0 rounded-xl bg-white/0 transition-all duration-300 group-hover:bg-white/[0.06] group-hover:shadow-[0_0_12px_rgba(255,255,255,0.04)]" />
            <Bell className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div
              ref={dropdownRef}
              className="notification-dropdown absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-2xl border border-white/[0.08] p-1 z-50 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(11,20,55,0.97) 0%, rgba(6,11,38,0.95) 100%)',
                backdropFilter: 'blur(40px)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <span className="text-xs font-bold tracking-wide text-white/70">{t('header.notifications')}</span>
                <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/30">
                  0
                </span>
              </div>

              <div className="mx-3 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

              {/* Empty state */}
              <div className="flex flex-col items-center gap-2 px-4 py-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04]">
                  <Inbox className="h-5 w-5 text-white/20" />
                </div>
                <p className="text-xs text-white/30">{t('header.noNotifications')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
