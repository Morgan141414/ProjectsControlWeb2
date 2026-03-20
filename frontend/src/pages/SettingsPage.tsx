import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { getConsentStatus, acceptConsent } from '@/api/consent'
import type { ConsentStatus } from '@/types'
import { LogOut, Shield, Palette, CheckCircle2, XCircle, AlertTriangle, Moon, Sparkles } from 'lucide-react'

export default function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const { orgId } = useOrgStore()
  const clearOrg = useOrgStore((s) => s.clear)

  const [consent, setConsent] = useState<ConsentStatus | null>(null)
  const [consentLoading, setConsentLoading] = useState(false)

  useEffect(() => {
    if (!orgId) return
    setConsentLoading(true)
    getConsentStatus(orgId)
      .then((r) => setConsent(r.data))
      .catch(() => toast.error(t('settings.consentLoadError')))
      .finally(() => setConsentLoading(false))
  }, [orgId])

  async function handleAcceptConsent() {
    if (!orgId) return
    setConsentLoading(true)
    try {
      await acceptConsent(orgId, 'v1')
      setConsent({ accepted: true })
      toast.success(t('settings.consentAcceptSuccess'))
    } catch {
      toast.error(t('settings.consentAcceptError'))
    } finally {
      setConsentLoading(false)
    }
  }

  function handleLogout() {
    logout()
    clearOrg()
    navigate('/login')
  }

  return (
    <div className="page-enter mx-auto max-w-2xl space-y-6">
      {/* Page title */}
      <div style={{ animation: 'fadeInUp 0.4s ease-out' }}>
        <h1
          className="text-3xl font-bold"
          style={{
            background: 'linear-gradient(135deg, #868CFF, #4318FF, #0075FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 4s ease infinite',
          }}
        >
          {t('settings.title')}
        </h1>
        <p className="mt-1 text-sm text-white/40">{t('settings.subtitle')}</p>
      </div>

      {/* Theme info card */}
      <div
        className="vision-card relative overflow-hidden p-6"
        style={{ animation: 'fadeInUp 0.4s ease-out 0.05s both' }}
      >
        {/* Gradient accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, #0075FF, #7551FF, #C851FF)', backgroundSize: '200% 100%', animation: 'gradientShift 4s ease infinite' }}
        />

        <div className="flex items-center gap-4 mb-5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #0075FF, #7551FF)' }}
          >
            <Palette className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{t('settings.appearance')}</h3>
            <p className="text-xs text-white/40">{t('settings.currentTheme')}</p>
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* Dark mode decorative illustration */}
          <div className="absolute -right-4 -top-4 opacity-[0.07]">
            <Moon className="h-32 w-32 text-[#7551FF]" />
          </div>
          <div className="absolute right-8 bottom-3 opacity-[0.05]">
            <Sparkles className="h-16 w-16 text-[#0075FF]" />
          </div>

          <div className="relative flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-3.5 w-3.5 rounded-full bg-[#0075FF] shadow-[0_0_8px_rgba(0,117,255,0.4)]" />
              <div className="h-3.5 w-3.5 rounded-full bg-[#7551FF] shadow-[0_0_8px_rgba(117,81,255,0.4)]" />
              <div className="h-3.5 w-3.5 rounded-full bg-[#01B574] shadow-[0_0_8px_rgba(1,181,116,0.4)]" />
            </div>
            <span className="text-sm font-semibold text-white">{t('settings.visionUIDark')}</span>
            <span
              className="ml-auto rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#01B574]"
              style={{ background: 'rgba(1, 181, 116, 0.12)', border: '1px solid rgba(1, 181, 116, 0.15)' }}
            >
              {t('settings.active')}
            </span>
          </div>
          <p className="relative mt-3 text-xs text-white/40 leading-relaxed">
            {t('settings.darkThemeDescription')}
          </p>
        </div>
      </div>

      {/* Consent card */}
      <div
        className="vision-card relative overflow-hidden p-6"
        style={{ animation: 'fadeInUp 0.4s ease-out 0.1s both' }}
      >
        {/* Purple accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, #7551FF, #C851FF)' }}
        />

        <div className="flex items-center gap-4 mb-5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #7551FF, #C851FF)' }}
          >
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{t('settings.consent')}</h3>
            <p className="text-xs text-white/40">{t('settings.consentSubtitle')}</p>
          </div>

          {/* Status badge */}
          {orgId && !consentLoading && (
            consent?.accepted ? (
              <div
                className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold"
                style={{ background: 'rgba(1, 181, 116, 0.12)', color: '#01B574', border: '1px solid rgba(1, 181, 116, 0.15)' }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t('settings.consentActive')}
              </div>
            ) : (
              <div
                className="flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold"
                style={{ background: 'rgba(255, 181, 71, 0.12)', color: '#FFB547', border: '1px solid rgba(255, 181, 71, 0.15)' }}
              >
                <XCircle className="h-3.5 w-3.5" />
                {t('settings.consentNotAccepted')}
              </div>
            )
          )}
        </div>

        {!orgId ? (
          <div
            className="flex items-center gap-3 rounded-xl p-4"
            style={{ background: 'rgba(255, 181, 71, 0.06)', border: '1px solid rgba(255, 181, 71, 0.15)' }}
          >
            <AlertTriangle className="h-5 w-5 text-[#FFB547] shrink-0" />
            <p className="text-sm text-white/60">
              {t('settings.joinOrgForConsent')}
            </p>
          </div>
        ) : consentLoading ? (
          <div className="flex items-center gap-3 py-4">
            <div
              className="h-5 w-5 rounded-full border-2 border-transparent"
              style={{ borderTopColor: '#7551FF', animation: 'spinSlow 1s linear infinite' }}
            />
            <p className="text-sm text-white/40">{t('settings.loadingStatus')}</p>
          </div>
        ) : consent?.accepted ? (
          <div
            className="rounded-xl p-4"
            style={{ background: 'rgba(1, 181, 116, 0.06)', border: '1px solid rgba(1, 181, 116, 0.12)' }}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#01B574]" />
              <div>
                <p className="text-sm font-medium text-white">{t('settings.consentAccepted')}</p>
                {consent.accepted_at && (
                  <p className="text-xs text-white/40 mt-0.5">
                    {t('settings.consentAcceptedDate', {
                      date: new Date(consent.accepted_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }),
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-white/50">
              {t('settings.consentRequired')}
            </p>
            <button
              onClick={handleAcceptConsent}
              disabled={consentLoading}
              className="btn-primary self-start flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              <Shield className="h-4 w-4" />
              {t('settings.acceptConsent')}
            </button>
          </div>
        )}
      </div>

      {/* Logout card */}
      <div
        className="vision-card relative overflow-hidden p-6"
        style={{ animation: 'fadeInUp 0.4s ease-out 0.15s both' }}
      >
        {/* Red accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, #E31A1A, #FF6B6B)' }}
        />

        <div className="flex items-center gap-4 mb-5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #E31A1A, #FF4444)' }}
          >
            <LogOut className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{t('settings.logoutTitle')}</h3>
            <p className="text-xs text-white/40">{t('settings.logoutSubtitle')}</p>
          </div>
        </div>

        <div
          className="rounded-xl p-4 mb-5"
          style={{ background: 'rgba(227, 26, 26, 0.04)', border: '1px solid rgba(227, 26, 26, 0.1)' }}
        >
          <p className="text-sm text-white/50 leading-relaxed">
            {t('settings.logoutWarning')}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="group flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-300"
          style={{
            background: 'rgba(227, 26, 26, 0.1)',
            border: '1px solid rgba(227, 26, 26, 0.25)',
            color: '#E31A1A',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(227, 26, 26, 0.2)'
            e.currentTarget.style.boxShadow = '0 0 25px rgba(227, 26, 26, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(227, 26, 26, 0.1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          {t('settings.logoutButton')}
        </button>
      </div>
    </div>
  )
}
