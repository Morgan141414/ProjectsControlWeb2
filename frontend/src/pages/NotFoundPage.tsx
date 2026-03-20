import { Link } from 'react-router'
import { Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4"
      style={{ background: '#060B26' }}
    >
      {/* Floating decorative orbs */}
      <div
        className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,117,255,0.15) 0%, transparent 70%)',
          animation: 'orbFloat1 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(117,81,255,0.1) 0%, transparent 70%)',
          animation: 'orbFloat2 10s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-1/3 right-1/3 h-56 w-56 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(1,181,116,0.1) 0%, transparent 70%)',
          animation: 'orbFloat3 12s ease-in-out infinite',
        }}
      />

      {/* Small floating particles */}
      <div
        className="absolute top-[15%] left-[10%] h-3 w-3 rounded-full bg-[#0075FF]/30"
        style={{ animation: 'float 3s ease-in-out infinite' }}
      />
      <div
        className="absolute top-[25%] right-[15%] h-2 w-2 rounded-full bg-[#7551FF]/25"
        style={{ animation: 'float 4s ease-in-out infinite 0.5s' }}
      />
      <div
        className="absolute bottom-[20%] left-[20%] h-4 w-4 rounded-full bg-[#01B574]/20"
        style={{ animation: 'float 5s ease-in-out infinite 1s' }}
      />

      {/* Decorative rings */}
      <div
        className="absolute h-[500px] w-[500px] rounded-full"
        style={{
          border: '1px solid rgba(255,255,255,0.04)',
          animation: 'spinSlow 60s linear infinite',
        }}
      />
      <div
        className="absolute h-[350px] w-[350px] rounded-full"
        style={{
          border: '1px solid rgba(0, 117, 255, 0.06)',
          animation: 'spinSlow 40s linear infinite reverse',
        }}
      />

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col items-center text-center"
        style={{ animation: 'scaleIn 0.6s ease-out' }}
      >
        {/* 404 — use a simple visible gradient */}
        <h1 className="not-found-title text-[150px] font-black leading-none sm:text-[220px]">
          404
        </h1>

        <p
          className="mt-2 text-2xl font-bold text-white sm:text-3xl"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}
        >
          {t('errors.notFound')}
        </p>
        <p
          className="mt-4 max-w-md text-sm leading-relaxed text-white/40"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}
        >
          {t('errors.notFoundMessage')}
        </p>

        <Link
          to="/dashboard"
          className="btn-primary mt-10 flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-sm font-bold text-white uppercase tracking-wider no-underline"
          style={{
            animation: 'fadeInUp 0.5s ease-out 0.4s both',
            boxShadow: '0 0 40px rgba(0, 117, 255, 0.3)',
          }}
        >
          <Home className="h-4 w-4" />
          {t('errors.goHome')}
        </Link>
      </div>
    </div>
  )
}
