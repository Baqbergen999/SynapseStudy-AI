import { useState } from 'react';
import {
  LayoutDashboard,
  Mic,
  CalendarClock,
  BookOpenCheck,
  X,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import type { AppRoute } from '../types/study';
import { calculateProjectProgress } from '../utils/studyLogic';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { user, route, navigate, t, projects, activeProjectId } = useStudy();
  const [imgError, setImgError] = useState(false);

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || null;
  const activeProgress = activeProject ? calculateProjectProgress(activeProject) : null;

  const navItems: { path: AppRoute; label: string; icon: typeof LayoutDashboard }[] = [
    { path: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { path: '/audio-studio', label: t.nav.audioStudio, icon: Mic },
    { path: '/project-planner', label: t.nav.projectPlanner, icon: CalendarClock },
  ];

  const handleNav = (path: AppRoute) => {
    navigate(path);
    onCloseMobile();
  };

  const initials = (user?.displayName || 'S')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'S';

  const sidebarContent = (
    <div className="flex h-full w-[276px] flex-col border-r border-white/10 bg-[#0B0B0E]/85 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <button
          type="button"
          onClick={() => handleNav('/dashboard')}
          className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg active:scale-95 transition-transform"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <BookOpenCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-sm font-bold tracking-tight text-zinc-100 whitespace-nowrap">
              SynapseStudy AI
            </div>
            <div className="text-xs text-zinc-400 truncate">{t.brandSubtitle}</div>
          </div>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Primary Navigation (3 Pages) */}
      <nav aria-label="Primary Navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = route === item.path;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNav(item.path)}
              aria-current={active ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 active:scale-95 ${
                active
                  ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${active ? 'text-indigo-400' : 'text-zinc-500'}`}
              />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Active Project Progress Summary (only if a real project exists) */}
      {activeProject && activeProgress && (
        <div className="mx-3 mb-3 rounded-xl border border-white/10 bg-[#121216]/85 backdrop-blur-md p-3.5">
          <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
            <span className="truncate">{activeProject.title}</span>
            <span className="font-mono tabular-nums text-emerald-400 shrink-0">
              {activeProgress.percentage}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${activeProgress.percentage}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 font-mono tabular-nums">
            <span>
              {activeProgress.completedTasks}/{activeProgress.totalTasks}
            </span>
            <span>
              {activeProject.startTimeWindow}–{activeProject.endTimeWindow}
            </span>
          </div>
        </div>
      )}

      {/* Authenticated Student Profile Footer */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          {user?.photoURL && !imgError ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-9 w-9 rounded-full object-cover border border-white/15 shrink-0"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-200 shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-zinc-100 truncate">
              {user?.displayName || 'Student'}
            </p>
            <p className="text-xs text-zinc-400 truncate">
              {user?.email || t.academicWorkspace}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
