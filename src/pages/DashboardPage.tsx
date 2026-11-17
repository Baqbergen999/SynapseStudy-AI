import {
  BarChart3,
  CalendarClock,
  Check,
  Clock,
  FileText,
  Layers,
  Mic,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { PomodoroWidget } from '../components/PomodoroWidget';
import {
  calculateProjectProgress,
  calculateRealAnalytics,
} from '../utils/studyLogic';

export function DashboardPage() {
  const {
    t,
    notes,
    projects,
    activeProjectId,
    navigate,
    setActiveStudioNoteId,
    deleteNote,
    toggleTaskInProject,
    pomoSecondsAccumulated,
    pomoCompletedSessions,
    clearAllData,
  } = useStudy();

  const analytics = calculateRealAnalytics(
    notes,
    projects,
    activeProjectId,
    pomoSecondsAccumulated,
    pomoCompletedSessions
  );

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || null;
  const todayDay = activeProject?.days[0] || null;
  const activeProgress = activeProject ? calculateProjectProgress(activeProject) : null;

  const todayCompleted = todayDay
    ? todayDay.tasks.filter((task) => task.completed).length
    : 0;
  const todayTotal = todayDay ? todayDay.tasks.length : 0;

  const kpis = [
    {
      label: t.dashboard.kpiNotes,
      value: String(analytics.totalNotes),
      sub: `${analytics.totalFlashcards} · ${analytics.totalQuestions}`,
    },
    {
      label: t.dashboard.kpiTasks,
      value: `${analytics.completedTasksCount}/${analytics.totalTasksCount}`,
      sub: `${analytics.activeProjectCompletionPct}% ${t.dashboard.activeProjectSub}`,
    },
    {
      label: t.dashboard.kpiPomodoroMins,
      value: `${analytics.pomodoroMinutes}m`,
      sub: `${analytics.pomodoroSessions} ${t.dashboard.completedSessionsSub}`,
    },
    {
      label: t.dashboard.kpiQuizScore,
      value: analytics.checkpointAvgScore !== null ? `${analytics.checkpointAvgScore}%` : '—',
      sub:
        analytics.checkpointAvgScore !== null
          ? t.dashboard.verifiedCheckpointsSub
          : t.dashboard.noCheckpointsSub,
    },
  ];

  const handleOpenNoteInStudio = (noteId: string) => {
    setActiveStudioNoteId(noteId);
    navigate('/audio-studio');
  };

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#13131A]/90 via-[#111114]/85 to-[#0D0D12]/90 backdrop-blur-xl p-6 sm:p-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl"
        />
        <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span>
                {t.dashboard.sessionsLabel}:{' '}
                <span className="font-mono tabular-nums text-zinc-200">
                  {analytics.pomodoroSessions}
                </span>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {t.dashboard.focusTimeLabel}:{' '}
                <span className="font-mono tabular-nums text-emerald-400">
                  {analytics.pomodoroMinutes} {t.projectPlanner.minutesUnit}
                </span>
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50 text-balance">
              {t.dashboard.greeting}
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">{t.dashboard.heroSub}</p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/audio-studio')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white whitespace-nowrap shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Mic className="h-4 w-4" />
              <span>{t.dashboard.uploadAudioBtn}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/project-planner')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-[#18181D]/90 hover:bg-white/[0.06] text-sm font-medium text-zinc-100 whitespace-nowrap transition-all active:scale-95"
            >
              <CalendarClock className="h-4 w-4 text-violet-400" />
              <span>{t.dashboard.createPlanBtn}</span>
            </button>
            {analytics.hasAnyActivity && (
              <button
                type="button"
                onClick={clearAllData}
                aria-label={t.dashboard.clearSessionBtn}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-200 whitespace-nowrap transition-all active:scale-95"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t.dashboard.clearSessionBtn}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Real Quick Stats Bento Grid (4 Cards) */}
      <section aria-label="Real academic metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-white/10 bg-[#111114]/80 backdrop-blur-xl p-5 flex flex-col justify-between gap-3 transition-colors hover:border-white/20"
          >
            <div>
              <p className="text-xs font-medium text-zinc-400 leading-snug">{kpi.label}</p>
              <p className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50 font-mono tabular-nums">
                {kpi.value}
              </p>
            </div>
            <p className="text-xs text-zinc-500 truncate">{kpi.sub}</p>
          </div>
        ))}
      </section>

      {/* Main Split: Recent AI Notes & Project Roadmap (Left 7) + Today Schedule, Subject Stats & Pomodoro (Right 5) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-7 space-y-6">
          {/* Recent AI Notes */}
          <section className="rounded-2xl border border-white/10 bg-[#111114]/80 backdrop-blur-xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <h2 className="font-display text-base font-semibold text-zinc-100">
                  {t.dashboard.recentNotesTitle}
                </h2>
              </div>
            </div>

            {notes.length === 0 ? (
              <div
                data-testid="dashboard-empty-notes"
                className="rounded-xl border border-dashed border-white/10 bg-[#0D0D10] p-8 text-center space-y-3"
              >
                <FileText className="h-7 w-7 text-zinc-500 mx-auto" />
                <h3 className="text-sm font-semibold text-zinc-200">
                  {t.dashboard.emptyNotesTitle}
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  {t.dashboard.emptyNotesSub}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/audio-studio')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors"
                >
                  <Mic className="h-3.5 w-3.5" />
                  <span>{t.dashboard.uploadAudioBtn}</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.07]">
                {notes.map((note) => (
                  <div key={note.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                          <span className="text-indigo-300 font-medium">
                            {t.subjects[note.subject] || note.subject}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{note.createdAt}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {note.practiceQuestions.length} · {note.flashcards.length}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-100 leading-snug">
                          {note.title}
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                          {note.keyTakeaways[0] || note.executiveSummary || note.rawTranscript}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenNoteInStudio(note.id)}
                          className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#18181D] hover:border-indigo-500/40 hover:text-indigo-200 text-xs font-medium text-zinc-200 whitespace-nowrap transition-all active:scale-95"
                        >
                          {t.dashboard.openInStudio}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteNote(note.id)}
                          aria-label={`Delete ${note.title}`}
                          className="p-1.5 rounded-lg border border-white/10 bg-[#18181D] text-zinc-400 hover:text-rose-400 transition-all active:scale-95"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Active Project Timeline */}
          <section className="rounded-2xl border border-white/10 bg-[#111114]/80 backdrop-blur-xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                <h2 className="font-display text-base font-semibold text-zinc-100">
                  {activeProject ? activeProject.title : t.dashboard.activeProjectTitle}
                </h2>
              </div>
              {activeProject && (
                <button
                  type="button"
                  onClick={() => navigate('/project-planner')}
                  className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#18181D] hover:border-white/20 text-xs font-medium text-zinc-200 whitespace-nowrap shrink-0 transition-all active:scale-95"
                >
                  {t.dashboard.openRoadmapBtn}
                </button>
              )}
            </div>

            {activeProject && activeProgress ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeProject.days.slice(0, 3).map((day) => {
                  const done = day.tasks.filter((x) => x.completed).length;
                  const total = day.tasks.length;
                  return (
                    <div
                      key={day.dayNumber}
                      className="rounded-xl border border-white/10 bg-[#16161B] p-3.5 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-semibold text-indigo-300">
                          {t.projectPlanner.dayPrefix} {day.dayNumber}
                        </span>
                        <span className="font-mono tabular-nums text-zinc-400">
                          {done}/{total}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-zinc-200 line-clamp-2 leading-relaxed">
                        {day.theme}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-[#0D0D10] p-6 text-center space-y-2.5">
                <h3 className="text-sm font-semibold text-zinc-200">
                  {t.dashboard.emptyProjectTitle}
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  {t.dashboard.emptyProjectSub}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/project-planner')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-[#18181D] hover:bg-white/[0.06] text-xs font-medium text-zinc-100"
                >
                  <CalendarClock className="h-3.5 w-3.5 text-violet-400" />
                  <span>{t.dashboard.createPlanBtn}</span>
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Today's Schedule + Real Subject Activity + Pomodoro */}
        <div className="xl:col-span-5 space-y-6">
          <section className="rounded-2xl border border-white/10 bg-[#111114]/80 backdrop-blur-xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                <h2 className="font-display text-base font-semibold text-zinc-100">
                  {t.dashboard.todayScheduleTitle}
                </h2>
              </div>
              {todayDay && (
                <span className="text-xs font-mono tabular-nums text-zinc-400">
                  {todayCompleted}/{todayTotal}
                </span>
              )}
            </div>

            {todayDay && activeProject ? (
              <div className="space-y-2.5">
                {todayDay.tasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() =>
                      toggleTaskInProject(activeProject.id, todayDay.dayNumber, task.id)
                    }
                    className={`w-full flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all active:scale-[0.99] ${
                      task.completed
                        ? 'border-emerald-500/30 bg-emerald-500/[0.06]'
                        : 'border-white/10 bg-[#16161B] hover:border-white/20'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded border shrink-0 transition-colors ${
                        task.completed
                          ? 'border-emerald-400 bg-emerald-500 text-zinc-950'
                          : 'border-zinc-500 bg-transparent'
                      }`}
                    >
                      {task.completed && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 text-xs font-mono tabular-nums text-zinc-400">
                        <span>
                          {task.startTime}–{task.endTime}
                        </span>
                        <span>
                          {task.estimatedMinutes} {t.projectPlanner.minutesUnit}
                        </span>
                      </div>
                      <p
                        className={`mt-1 text-sm font-medium leading-snug ${
                          task.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
                        }`}
                      >
                        {task.title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 bg-[#0D0D10]/80 p-5 text-center">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t.dashboard.emptyScheduleSub}
                </p>
              </div>
            )}
          </section>

          {(notes.length > 0 || projects.length > 0) && (
            <section className="rounded-2xl border border-white/10 bg-[#111114]/80 backdrop-blur-xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-400" />
                <h2 className="font-display text-base font-semibold text-zinc-100">
                  {t.dashboard.subjectBreakdownTitle}
                </h2>
              </div>
              <div className="space-y-3">
                {analytics.subjectBreakdown
                  .filter((item) => item.notesCount + item.projectsCount > 0)
                  .map((item) => {
                    const totalArtifacts = Math.max(1, notes.length + projects.length);
                    const count = item.notesCount + item.projectsCount;
                    const pct = Math.round((count / totalArtifacts) * 100);
                    return (
                      <div key={item.subject} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-200">
                            {t.subjects[item.subject] || item.subject}
                          </span>
                          <span className="font-mono tabular-nums text-zinc-400">
                            {item.notesCount} {t.dashboard.notesCountLabel} · {item.projectsCount}{' '}
                            {t.dashboard.projectsCountLabel}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          )}

          <PomodoroWidget />
        </div>
      </div>
    </div>
  );
}
