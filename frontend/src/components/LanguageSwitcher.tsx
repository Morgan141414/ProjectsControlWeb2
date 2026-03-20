import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

const languages = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <Globe className="h-3.5 w-3.5 text-white/30 ml-1.5" />
      {languages.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className="rounded-lg px-2 py-1 text-[11px] font-bold tracking-wide transition-all duration-300"
          style={
            i18n.language?.startsWith(code)
              ? {
                  background: 'linear-gradient(135deg, #0075FF 0%, #2563EB 100%)',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(0, 117, 255, 0.3)',
                }
              : {
                  color: 'rgba(255,255,255,0.4)',
                }
          }
        >
          {label}
        </button>
      ))}
    </div>
  )
}
