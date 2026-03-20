import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { User } from '@/types'
import { getMe, updateMe } from '@/api/profile'
import { useAuthStore } from '@/stores/authStore'
import {
  Mail, Edit3, Save, User as UserIcon, Briefcase, FileText,
  Link2, Users, FolderOpen, Settings, Bell, Rocket, Newspaper,
  CalendarDays, AtSign, MessageSquare,
} from 'lucide-react'

type ProfileTab = 'overview' | 'teams' | 'projects'

export default function ProfilePage() {
  const { t } = useTranslation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const token = useAuthStore((s) => s.token)
  const email = useAuthStore((s) => s.email)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview')

  const [fullName, setFullName] = useState('')
  const [patronymic, setPatronymic] = useState('')
  const [bio, setBio] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [socials, setSocials] = useState('')

  // Platform Settings toggles
  const [emailOnFollow, setEmailOnFollow] = useState(true)
  const [emailOnAnswer, setEmailOnAnswer] = useState(false)
  const [emailOnMention, setEmailOnMention] = useState(true)
  const [newLaunches, setNewLaunches] = useState(false)
  const [monthlyUpdates, setMonthlyUpdates] = useState(false)
  const [newsletter, setNewsletter] = useState(true)
  const [weeklyMails, setWeeklyMails] = useState(true)

  useEffect(() => {
    getMe()
      .then(({ data }) => {
        setFullName(data.full_name)
        setPatronymic(data.patronymic ?? '')
        setBio(data.bio ?? '')
        setSpecialty(data.specialty ?? '')
        setSocials(data.socials_json ?? '')
      })
      .catch(() => toast.error(t('profile.loadError')))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const payload: Partial<Omit<User, 'id' | 'email'>> = {
        full_name: fullName,
        patronymic: patronymic || undefined,
        bio: bio || undefined,
        specialty: specialty || undefined,
        socials_json: socials || undefined,
      }

      const { data: updated } = await updateMe(payload)

      if (token) {
        setAuth(token, {
          id: updated.id,
          email: updated.email,
          full_name: updated.full_name,
          patronymic: updated.patronymic,
        })
      }

      toast.success(t('profile.saveSuccess'))
    } catch {
      toast.error(t('profile.saveError'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-10 w-10 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: '#0075FF',
              animation: 'spinSlow 1s linear infinite',
            }}
          />
          <p className="text-sm text-white/40">{t('profile.loadingProfile')}</p>
        </div>
      </div>
    )
  }

  const tabs: { key: ProfileTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: t('profile.overview'), icon: <UserIcon className="h-4 w-4" /> },
    { key: 'teams', label: t('profile.teams'), icon: <Users className="h-4 w-4" /> },
    { key: 'projects', label: t('profile.projects'), icon: <FolderOpen className="h-4 w-4" /> },
  ]

  const accountToggles = [
    { label: t('profile.emailOnFollow'), desc: t('profile.emailOnFollowDesc'), value: emailOnFollow, setter: setEmailOnFollow, icon: <Bell className="h-4 w-4" /> },
    { label: t('profile.emailOnAnswer'), desc: t('profile.emailOnAnswerDesc'), value: emailOnAnswer, setter: setEmailOnAnswer, icon: <MessageSquare className="h-4 w-4" /> },
    { label: t('profile.emailOnMention'), desc: t('profile.emailOnMentionDesc'), value: emailOnMention, setter: setEmailOnMention, icon: <AtSign className="h-4 w-4" /> },
  ]

  const appToggles = [
    { label: t('profile.newLaunches'), desc: t('profile.newLaunchesDesc'), value: newLaunches, setter: setNewLaunches, icon: <Rocket className="h-4 w-4" /> },
    { label: t('profile.monthlyUpdates'), desc: t('profile.monthlyUpdatesDesc'), value: monthlyUpdates, setter: setMonthlyUpdates, icon: <CalendarDays className="h-4 w-4" /> },
    { label: t('profile.newsletter'), desc: t('profile.newsletterDesc'), value: newsletter, setter: setNewsletter, icon: <Newspaper className="h-4 w-4" /> },
    { label: t('profile.weeklyMails'), desc: t('profile.weeklyMailsDesc'), value: weeklyMails, setter: setWeeklyMails, icon: <Mail className="h-4 w-4" /> },
  ]

  const initials = fullName
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  return (
    <div className="page-enter space-y-6">
      {/* =========== PROFILE HEADER =========== */}
      <div className="vision-card relative overflow-hidden p-8">
        {/* Subtle top gradient bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, #0075FF, #7551FF, #C851FF, #0075FF)', backgroundSize: '200% 100%', animation: 'gradientShift 4s ease infinite' }}
        />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Avatar + Info */}
          <div className="flex items-center gap-5">
            {/* Animated conic-gradient spinning border */}
            <div className="relative">
              <div
                className="absolute -inset-[3px] rounded-2xl"
                style={{
                  background: 'conic-gradient(from 0deg, #0075FF, #7551FF, #C851FF, #01B574, #0075FF)',
                  animation: 'spinSlow 4s linear infinite',
                  filter: 'blur(4px)',
                  opacity: 0.7,
                }}
              />
              <div
                className="absolute -inset-[3px] rounded-2xl"
                style={{
                  background: 'conic-gradient(from 0deg, #0075FF, #7551FF, #C851FF, #01B574, #0075FF)',
                  animation: 'spinSlow 4s linear infinite',
                }}
              />
              <div
                className="relative flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #0075FF 0%, #7551FF 100%)' }}
              >
                {initials}
              </div>
              <button
                className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#060B26] text-white transition-all hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #0075FF, #7551FF)' }}
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">{fullName}</h2>
              <div className="mt-1 flex items-center gap-2 text-white/50">
                <Mail className="h-3.5 w-3.5" />
                <span className="text-sm">{email}</span>
              </div>
              {specialty && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-1" style={{ background: 'rgba(117, 81, 255, 0.12)', border: '1px solid rgba(117, 81, 255, 0.2)' }}>
                  <Briefcase className="h-3 w-3 text-[#7551FF]" />
                  <span className="text-xs font-semibold text-[#7551FF]">{specialty}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tab pills with sliding indicator */}
          <div
            className="relative flex gap-1 rounded-2xl p-1.5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative z-10 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300"
                style={
                  activeTab === tab.key
                    ? {
                        background: 'linear-gradient(135deg, #0075FF 0%, #2563EB 100%)',
                        boxShadow: '0 4px 20px rgba(0, 117, 255, 0.35)',
                        color: '#fff',
                      }
                    : {
                        color: 'rgba(255,255,255,0.4)',
                      }
                }
              >
                <span className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =========== OVERVIEW TAB =========== */}
      {activeTab === 'overview' && (
        <div
          key="overview"
          className="grid grid-cols-1 gap-6 xl:grid-cols-3"
          style={{ animation: 'fadeInUp 0.4s ease-out' }}
        >
          {/* Welcome card */}
          <div
            className="relative overflow-hidden rounded-[20px] p-8"
            style={{
              background: 'linear-gradient(135deg, #0075FF 0%, #7551FF 50%, #C851FF 100%)',
              backgroundSize: '200% 200%',
              animation: 'gradientShift 6s ease infinite',
              minHeight: '280px',
            }}
          >
            {/* Floating orbs */}
            <div
              className="absolute -right-8 -top-8 h-44 w-44 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)', animation: 'orbFloat1 8s ease-in-out infinite' }}
            />
            <div
              className="absolute -left-6 -bottom-6 h-36 w-36 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)', animation: 'orbFloat2 10s ease-in-out infinite' }}
            />
            <div
              className="absolute right-10 bottom-10 h-20 w-20 rounded-full"
              style={{
                border: '2px solid rgba(255,255,255,0.2)',
                animation: 'float 4s ease-in-out infinite',
              }}
            />
            <div
              className="absolute left-1/2 top-1/3 h-3 w-3 rounded-full bg-white/30"
              style={{ animation: 'float 3s ease-in-out infinite 0.5s' }}
            />

            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{t('profile.welcome')}</p>
              <h3 className="mt-3 text-3xl font-bold text-white">{t('profile.welcomeBackName')}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                {t('profile.welcomeMessage', { name: fullName })}
              </p>
              <div
                className="mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white/90"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
              >
                <Settings className="h-3.5 w-3.5" />
                {t('profile.configureBelow')}
              </div>
            </div>
          </div>

          {/* Profile info card */}
          <div className="vision-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #0075FF, #7551FF)' }}
              >
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">{t('profile.profileInfo')}</h3>
            </div>

            <p className="text-sm leading-relaxed text-white/50 mb-6">
              {bio || t('profile.noBio')}
            </p>

            <div className="space-y-1">
              {[
                { icon: <UserIcon className="h-4 w-4" />, label: t('profile.fullName'), value: fullName },
                ...(patronymic
                  ? [{ icon: <UserIcon className="h-4 w-4" />, label: t('profile.patronymic'), value: patronymic }]
                  : []),
                { icon: <Mail className="h-4 w-4" />, label: t('profile.email'), value: email },
                ...(specialty
                  ? [{ icon: <Briefcase className="h-4 w-4" />, label: t('profile.specialty'), value: specialty }]
                  : []),
                ...(socials
                  ? [{ icon: <Link2 className="h-4 w-4" />, label: t('profile.socials'), value: socials }]
                  : []),
              ].map((row, i) => (
                <div
                  key={row.label}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-white/[0.04]"
                  style={{
                    borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: 'rgba(0, 117, 255, 0.1)' }}
                  >
                    <span className="text-[#0075FF]">{row.icon}</span>
                  </div>
                  <span className="text-xs font-medium text-white/40 w-24 shrink-0">{row.label}</span>
                  <span className="text-sm font-medium text-white truncate">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Edit profile form */}
          <div className="vision-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #01B574, #0075FF)' }}
              >
                <Edit3 className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">{t('profile.editProfile')}</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">{t('profile.fullName')}</label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="vision-input w-full h-11 px-4 text-sm text-white placeholder:text-white/25 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">{t('profile.patronymic')}</label>
                <input
                  value={patronymic}
                  onChange={(e) => setPatronymic(e.target.value)}
                  className="vision-input w-full h-11 px-4 text-sm text-white placeholder:text-white/25 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">{t('profile.bio')}</label>
                <textarea
                  rows={3}
                  placeholder={t('profile.bioPlaceholder')}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="vision-input w-full px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">{t('profile.specialty')}</label>
                <input
                  placeholder={t('profile.specialtyPlaceholder')}
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="vision-input w-full h-11 px-4 text-sm text-white placeholder:text-white/25 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">{t('profile.socials')}</label>
                <textarea
                  rows={2}
                  placeholder='{"telegram": "@handle"}'
                  value={socials}
                  onChange={(e) => setSocials(e.target.value)}
                  className="vision-input w-full px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex w-full items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold text-white uppercase tracking-wide disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? t('common.saving') : t('common.saveChanges')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========== TEAMS TAB =========== */}
      {activeTab === 'teams' && (
        <div
          key="teams"
          className="vision-card p-10"
          style={{ animation: 'fadeInUp 0.4s ease-out' }}
        >
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* Decorative background orb */}
            <div className="relative mb-8">
              <div
                className="absolute -inset-6 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, #7551FF 0%, transparent 70%)',
                  animation: 'pulse-glow 3s ease-in-out infinite',
                }}
              />
              <div
                className="relative flex h-28 w-28 items-center justify-center rounded-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(117, 81, 255, 0.15), rgba(0, 117, 255, 0.15))',
                  border: '1px solid rgba(117, 81, 255, 0.2)',
                  backdropFilter: 'blur(20px)',
                  animation: 'float 4s ease-in-out infinite',
                }}
              >
                <Users className="h-14 w-14 text-[#7551FF]" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{t('profile.noTeams')}</h3>
            <p className="text-sm text-white/40 max-w-md leading-relaxed">
              {t('profile.noTeamsMessage')}
            </p>
            <button
              className="btn-primary mt-8 flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white"
            >
              <Users className="h-4 w-4" />
              {t('profile.findTeam')}
            </button>
          </div>
        </div>
      )}

      {/* =========== PROJECTS TAB =========== */}
      {activeTab === 'projects' && (
        <div key="projects" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
          <div className="vision-card p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">{t('profile.projects')}</h3>
                <p className="text-sm text-white/40 mt-0.5">{t('profile.architecturalProjects')}</p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, #0075FF, #7551FF)' }}
              >
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: t('profile.projectModern'), desc: t('profile.projectModernDesc') },
                { name: t('profile.projectScandinavian'), desc: t('profile.projectScandinavianDesc') },
                { name: t('profile.projectMinimalist'), desc: t('profile.projectMinimalistDesc') },
              ].map((project, i) => (
                <div
                  key={project.name}
                  className="group overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    animation: `fadeInUp 0.4s ease-out ${i * 0.1}s both`,
                  }}
                >
                  <div
                    className="relative h-40 w-full overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${['#0075FF', '#7551FF', '#01B574'][i]} 0%, ${['#00D1FF', '#C851FF', '#0075FF'][i]} 100%)`,
                    }}
                  >
                    {/* Decorative floating orbs */}
                    <div
                      className="absolute -right-4 -top-4 h-24 w-24 rounded-full transition-all duration-700 group-hover:scale-[2] group-hover:opacity-30"
                      style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)', opacity: 0.15 }}
                    />
                    <div
                      className="absolute left-1/2 top-1/2 h-16 w-16 rounded-full opacity-10 transition-all duration-700 group-hover:scale-150"
                      style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)' }}
                    />
                    <div
                      className="absolute left-4 bottom-4 text-xs font-bold uppercase tracking-widest text-white/60"
                    >
                      {t('profile.projectNumber', { num: i + 1 })}
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-base font-bold text-white">{project.name}</p>
                    <p className="mt-2 text-xs text-white/40 leading-relaxed line-clamp-2">
                      {project.desc}
                    </p>
                    <button
                      className="mt-4 rounded-lg px-4 py-2 text-xs font-bold text-[#0075FF] transition-all duration-300 hover:bg-[#0075FF]/10 hover:shadow-[0_0_15px_rgba(0,117,255,0.15)]"
                      style={{ border: '1px solid rgba(0, 117, 255, 0.3)' }}
                    >
                      {t('common.details')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========== PLATFORM SETTINGS (always visible) =========== */}
      <div
        className="vision-card p-6"
        style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #0075FF, #01B574)' }}
          >
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{t('profile.platformSettings')}</h3>
            <p className="text-xs text-white/40">{t('profile.manageNotifications')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {/* Account section */}
          <div>
            <div className="mb-5">
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest">{t('profile.accountSection')}</p>
              <p className="text-[11px] text-white/20 mt-1">{t('profile.accountNotifSettings')}</p>
            </div>
            <div className="space-y-1">
              {accountToggles.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: item.value ? 'rgba(0, 117, 255, 0.1)' : 'rgba(255,255,255,0.04)' }}
                    >
                      <span className={item.value ? 'text-[#0075FF]' : 'text-white/20'}>{item.icon}</span>
                    </div>
                    <div>
                      <span className="text-sm text-white/70 block">{item.label}</span>
                      <span className="text-[11px] text-white/25 block mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => item.setter(!item.value)}
                    className="relative h-7 w-12 shrink-0 rounded-full transition-all duration-300"
                    style={{
                      background: item.value
                        ? 'linear-gradient(135deg, #0075FF, #7551FF)'
                        : 'rgba(255,255,255,0.08)',
                      boxShadow: item.value ? '0 0 15px rgba(0, 117, 255, 0.3)' : 'none',
                    }}
                  >
                    <span
                      className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300"
                      style={{
                        transform: item.value ? 'translateX(20px)' : 'translateX(0)',
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* App section */}
          <div>
            <div className="mb-5">
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest">{t('profile.appSection')}</p>
              <p className="text-[11px] text-white/20 mt-1">{t('profile.appNotifSettings')}</p>
            </div>
            <div className="space-y-1">
              {appToggles.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: item.value ? 'rgba(0, 117, 255, 0.1)' : 'rgba(255,255,255,0.04)' }}
                    >
                      <span className={item.value ? 'text-[#0075FF]' : 'text-white/20'}>{item.icon}</span>
                    </div>
                    <div>
                      <span className="text-sm text-white/70 block">{item.label}</span>
                      <span className="text-[11px] text-white/25 block mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => item.setter(!item.value)}
                    className="relative h-7 w-12 shrink-0 rounded-full transition-all duration-300"
                    style={{
                      background: item.value
                        ? 'linear-gradient(135deg, #0075FF, #7551FF)'
                        : 'rgba(255,255,255,0.08)',
                      boxShadow: item.value ? '0 0 15px rgba(0, 117, 255, 0.3)' : 'none',
                    }}
                  >
                    <span
                      className="absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300"
                      style={{
                        transform: item.value ? 'translateX(20px)' : 'translateX(0)',
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
