import { useState } from 'react';
import { LogOut, Menu, SlidersHorizontal, Upload } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import type { Language } from '../types/study';

interface TopBarProps {
  onOpenMobileNav: () => void;
}

export function TopBar({ onOpenMobileNav }: TopBarProps) {
  const {
    user,
    logout,
    route,
    navigate,
    language,
    setLanguage,
    t,
    hasServerKey,
    setSettingsOpen,
  } = useStudy();
  const [avatarError, setAvatarError] = useState(false);

  const routeLabels: Record<string, string> = {
    '/dashboard': t.nav.dashboard,
    '/audio-studio': t.nav.audioStudio,
    '/project-planner': t.nav.projectPlanner,
  };

  const languages: { code: Language; flag: string; label: string }[] = [
    { code: 'kk', flag: '🇰🇿', label: 'ҚАЗ' },
    { code: 'ru', flag: '🇷🇺', label: 'РУС' },
    { code: 'en', flag: '🇬🇧', label: 'ENG' },
  ];

  const initials = (user?.displayName || 'S')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'S';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 sm:gap-3 border-b border-white/10 bg-[#09090B]/75 backdrop-blur-xl px-3 sm:px-6 lg:px-8 h-14 sm:h-16">
      {/* Left: Mobile Trigger + Contextual Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="lg:hidden rounded-lg p-1.5 sm:p-2 text-zinc-300 hover:bg-white/5 border border-white/10 active:scale-95 transition-all shrink-0"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
          <span className="text-zinc-500 hidden md:inline whitespace-nowrap">SynapseStudy</span>
          <span className="text-zinc-600 hidden md:inline">/</span>
          <span className="font-medium text-zinc-100 truncate">{routeLabels[route]}</span>
        </div>
      </div>

      {/* Right: Language Switcher, AI Settings, Primary Action, Google User + Logout */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <div
          role="group"
          aria-label="Language switcher"
          data-testid="language-switcher"
          className="flex items-center p-0.5 rounded-lg bg-[#141418]/90 border border-white/10"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 transition-all active:scale-95 ${
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

        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label={t.topBar.aiEngine}
          className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-lg border border-white/10 bg-[#141418]/90 hover:border-white/20 text-xs font-medium text-zinc-200 whitespace-nowrap shrink-0 transition-all active:scale-95"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
          <span className="hidden xl:inline">
            {hasServerKey ? t.topBar.geminiReady : t.topBar.keyMissing}
          </span>
        </button>

        {route !== '/audio-studio' && (
          <button
            type="button"
            onClick={() => navigate('/audio-studio')}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white whitespace-nowrap shrink-0 shadow-sm shadow-indigo-500/25 transition-all active:scale-95"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{t.topBar.newLecture}</span>
          </button>
        )}

        {user && (
          <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              {user.photoURL && !avatarError ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                  className="h-7 w-7 rounded-full object-cover border border-white/20 shrink-0"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/25 border border-indigo-400/35 text-[11px] font-semibold text-indigo-100 shrink-0">
                  {initials}
                </div>
              )}
              <span
                data-testid="header-user-name"
                className="hidden sm:inline text-xs font-medium text-zinc-200 max-w-[130px] truncate"
              >
                {user.displayName}
              </span>
            </div>

            <button
              type="button"
              data-testid="logout-btn"
              onClick={() => void logout()}
              aria-label={t.topBar.logout}
              className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#141418]/90 hover:border-rose-500/40 hover:bg-rose-500/10 text-xs font-medium text-zinc-300 hover:text-rose-200 whitespace-nowrap shrink-0 transition-all active:scale-95"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{t.topBar.logout}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
