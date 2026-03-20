import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { login } from '@/api/auth'
import { getMe } from '@/api/profile'
import { getOrg } from '@/api/orgs'
import { useAuthStore } from '@/stores/authStore'
import { useOrgStore } from '@/stores/orgStore'
import { OAuthButtons } from '@/components/OAuthButtons'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const setOrg = useOrgStore((s) => s.setOrg)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: tokenData } = await login(email, password)
      const token = tokenData.access_token
      const refreshTkn = tokenData.refresh_token ?? null

      const storage = remember ? localStorage : sessionStorage
      storage.setItem(
        'auth-storage',
        JSON.stringify({ state: { token, refreshToken: refreshTkn }, version: 0 }),
      )

      const { data: user } = await getMe()
      setAuth(token, refreshTkn, user, remember ? 'local' : 'session')

      if (user.org_id) {
        try {
          const { data: org } = await getOrg(user.org_id)
          setOrg(org.id, org.name)
        } catch {
          // org fetch failed
        }
      }

      navigate('/dashboard')
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })
        ?.response?.data?.detail
      let message: string
      if (Array.isArray(detail)) {
        message = detail.map((e: { msg?: string }) => e.msg ?? '').join('; ')
      } else if (typeof detail === 'string') {
        message = detail
      } else {
        message = t('auth.loginError')
      }
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#060B26' }}>
      {/* ===== LEFT PANEL — Animated decorative panel ===== */}
      <div
        className="hidden lg:flex lg:w-[45%] items-center justify-center relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #060B26 0%, #0B1437 30%, #111C44 60%, #060B26 100%)',
        }}
      >
        <div
          className="absolute w-80 h-80 rounded-full opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(0, 117, 255, 0.45) 0%, rgba(0, 117, 255, 0) 70%)',
            top: '10%',
            left: '5%',
            animation: 'orbFloat1 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-full opacity-25"
          style={{
            background:
              'radial-gradient(circle, rgba(117, 81, 255, 0.5) 0%, rgba(117, 81, 255, 0) 70%)',
            bottom: '15%',
            right: '0%',
            animation: 'orbFloat2 15s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-44 h-44 rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(134, 140, 255, 0.5) 0%, rgba(134, 140, 255, 0) 70%)',
            top: '55%',
            left: '45%',
            animation: 'orbFloat3 10s ease-in-out infinite',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div
          className="text-center z-10 px-12"
          style={{ animation: 'fadeInUp 0.8s ease-out' }}
        >
          <h2
            className="text-5xl font-black tracking-tight mb-3"
            style={{
              background:
                'linear-gradient(135deg, #FFFFFF 0%, #868CFF 50%, #0075FF 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 6s ease-in-out infinite',
            }}
          >
            VISION UI
          </h2>
          <p className="text-white/30 text-lg font-medium tracking-widest uppercase">
            Dashboard PRO
          </p>
          <div className="flex items-center justify-center gap-2 mt-10">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0075FF]/60" />
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-[#0075FF]/60 to-[#7551FF]/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#7551FF]/60" />
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL — Login form ===== */}
      <div className="flex flex-1 items-center justify-center px-6 sm:px-12">
        <div
          className="w-full max-w-[420px]"
          style={{ animation: 'fadeInUp 0.6s ease-out' }}
        >
          <div className="mb-8">
            <h1 className="gradient-text text-[28px] font-bold mb-2 tracking-tight">
              {t('auth.welcomeBack')}
            </h1>
            <p className="text-white/50 text-[15px]">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-white/70 mb-2 tracking-wide uppercase">
                {t('auth.email')}
              </label>
              <input
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="vision-input w-full h-12 rounded-xl px-4 text-sm text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-white/70 mb-2 tracking-wide uppercase">
                {t('auth.password')}
              </label>
              <input
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="vision-input w-full h-12 rounded-xl px-4 text-sm text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRemember(!remember)}
                className="relative h-6 w-11 rounded-full transition-all duration-300 focus:outline-none"
                style={{
                  background: remember
                    ? 'linear-gradient(135deg, #0075FF 0%, #2563EB 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: remember
                    ? '0 0 12px rgba(0, 117, 255, 0.3)'
                    : 'none',
                }}
              >
                <span
                  className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-all duration-300 ${remember ? 'translate-x-5 shadow-lg' : ''}`}
                />
              </button>
              <span className="text-sm text-white/50">{t('auth.rememberMe')}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 rounded-xl text-sm font-bold text-white uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? t('auth.loggingIn') : t('auth.loginButton')}
            </button>
          </form>

          <OAuthButtons remember={remember} />

          <p className="mt-8 text-center text-sm text-white/40">
            {t('auth.noAccount')}{' '}
            <Link
              to="/register"
              className="font-semibold text-white/70 hover:text-[#0075FF] transition-colors duration-300"
            >
              {t('auth.register')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
