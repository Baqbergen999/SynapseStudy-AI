import { useState } from 'react';
import { BookOpenCheck, CalendarClock, HardDrive, Mic, RotateCw, User } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import type { Language } from '../types/study';
import { DecorativeBackground } from './DecorativeBackground';

export function AuthGate() {
  const { language, setLanguage, t, signInWithGoogle, authLoading, authError } = useStudy();
  const [nameInput, setNameInput] = useState('');

  const languages: { code: Language; flag: string; label: string }[] = [
    { code: 'kk', flag: '🇰🇿', label: 'ҚАЗ' },
    { code: 'ru', flag: '🇷🇺', label: 'РУС' },
    { code: 'en', flag: '🇬🇧', label: 'ENG' },
  ];

  const features = [
    {
      icon: Mic,
      title: t.auth.feature1Title,
      desc: t.auth.feature1Desc,
      color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/25',
    },
    {
      icon: CalendarClock,
      title: t.auth.feature2Title,
      desc: t.auth.feature2Desc,
      color: 'text-violet-400 bg-violet-500/15 border-violet-500/25',
    },
    {
      icon: HardDrive,
      title: t.auth.feature3Title,
      desc: t.auth.feature3Desc,
      color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
    },
  ];

  return (
    <div
      data-testid="auth-gate"
      className="relative min-h-screen bg-[#09090B] text-zinc-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 overflow-x-hidden"
    >
      <DecorativeBackground />

      {/* Top Header with Brand + Instant Language Switcher */}
      <header className="relative z-10 max-w-6xl w-full mx-auto flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 shrink-0">
            <BookOpenCheck className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-sm sm:text-base font-bold tracking-tight text-zinc-100 whitespace-nowrap">
              SynapseStudy AI
            </div>
            <div className="text-[11px] sm:text-xs text-zinc-400 truncate max-w-[140px] sm:max-w-none">
              {t.brandSubtitle}
            </div>
          </div>
        </div>

        <div
          role="group"
          aria-label="Language switcher"
          className="flex items-center p-0.5 sm:p-1 rounded-xl bg-[#141418]/85 backdrop-blur-xl border border-white/10 shrink-0"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                language === lang.code
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <span aria-hidden="true">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Center Glassmorphic Auth Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#111114]/80 backdrop-blur-2xl shadow-2xl shadow-indigo-950/30 p-6 sm:p-8 lg:p-10 space-y-7">
          <div className="space-y-3 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">
              {t.auth.badge}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50 text-balance">
              {t.auth.title}
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
              {t.auth.subtitle}
            </p>
          </div>

          <div className="space-y-3">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="flex items-start gap-3.5 rounded-2xl border border-white/10 bg-[#16161C]/75 p-4"
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border shrink-0 ${feat.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-zinc-100">{feat.title}</h2>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {authError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200"
            >
              {authError}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              signInWithGoogle(nameInput);
            }}
            className="space-y-3 pt-1"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="auth-name-input"
                className="block text-xs font-medium text-zinc-300"
              >
                {t.auth.nameLabel}
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  id="auth-name-input"
                  data-testid="auth-name-input"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder={t.auth.namePlaceholder}
                  maxLength={80}
                  className="w-full rounded-2xl border border-white/10 bg-[#16161C]/90 pl-10 pr-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              data-testid="google-signin-btn"
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 disabled:opacity-60 active:scale-95 transition-all duration-150"
            >
              {authLoading ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin text-indigo-600" />
                  <span>{t.auth.signingIn}</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                    />
                  </svg>
                  <span>{t.auth.signInBtn}</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-zinc-500">{t.auth.securityNote}</p>
          </form>
        </div>
      </main>

      <footer className="relative z-10 text-center text-xs text-zinc-600">
        SynapseStudy AI
      </footer>
    </div>
  );
}
