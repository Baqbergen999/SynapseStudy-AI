import React, { useState } from 'react';
import {
  Award,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  RotateCw,
  X,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import {
  SUBJECT_CATEGORIES,
  type ProjectDayPlan,
  type SubjectCategory,
} from '../types/study';
import { calculateProjectProgress, computeWindowMinutes } from '../utils/studyLogic';
import { parseApiJson } from '../utils/api';

export function ProjectPlannerPage() {
  const {
    t,
    language,
    projects,
    activeProjectId,
    setActiveProjectId,
    addProject,
    toggleTaskInProject,
    markDayCheckpointPassed,
    pushToast,
  } = useStudy();

  // Clean slate inputs (no fake project pre-filled)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState<SubjectCategory>('Programming');
  const [deadlineDays, setDeadlineDays] = useState(5);
  const [dailyHours, setDailyHours] = useState(2);
  const [startTimeWindow, setStartTimeWindow] = useState('18:00');
  const [endTimeWindow, setEndTimeWindow] = useState('20:00');
  const [goalMode, setGoalMode] = useState<'finish' | 'deep_learning'>('deep_learning');

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);

  const [quizDay, setQuizDay] = useState<ProjectDayPlan | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || null;
  const progress = activeProject ? calculateProjectProgress(activeProject) : null;
  const windowMinutes = computeWindowMinutes(startTimeWindow, endTimeWindow);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !description.trim()) {
      setFormError(t.projectPlanner.formValidationError);
      return;
    }

    if (windowMinutes < 30) {
      setFormError(t.projectPlanner.windowValidationError);
      return;
    }

    setIsGenerating(true);
    setLoadingStepIdx(0);
    const t1 = window.setTimeout(() => setLoadingStepIdx(1), 650);
    const t2 = window.setTimeout(() => setLoadingStepIdx(2), 1300);

    try {
      const response = await fetch('/api/ai/project-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          subject,
          deadlineDays,
          dailyHours,
          startTimeWindow,
          endTimeWindow,
          goalMode,
          language,
        }),
      });

      const data = await parseApiJson<{ plan: import('../types/study').ProjectPlan }>(response);

      addProject(data.plan);
      pushToast(
        t.projectPlanner.planReadyTitle,
        `${data.plan.days.length} ${t.projectPlanner.daysUnit} · ${startTimeWindow}–${endTimeWindow}`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation error';
      setFormError(msg);
      pushToast('Planner error', msg, 'error');
    } finally {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      setIsGenerating(false);
    }
  };

  const openCheckpointQuiz = (day: ProjectDayPlan) => {
    setQuizDay(day);
    setSelectedAnswers({});
    setQuizSubmitted(false);
  };

  const handleSubmitCheckpointQuiz = () => {
    if (!quizDay || !activeProject) return;
    setQuizSubmitted(true);
    const total = quizDay.checkpointQuiz.length || 1;
    const correctCount = quizDay.checkpointQuiz.reduce(
      (acc, q) => acc + (selectedAnswers[q.id] === q.correctIndex ? 1 : 0),
      0
    );
    const score = Math.round((correctCount / total) * 100);
    markDayCheckpointPassed(activeProject.id, quizDay.dayNumber, score);
    pushToast(
      t.projectPlanner.checkpointPassed,
      `${t.projectPlanner.dayPrefix} ${quizDay.dayNumber}: ${score}%`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-50">
          {t.projectPlanner.title}
        </h1>
        <p className="text-sm text-zinc-400 mt-1">{t.projectPlanner.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleCreatePlan}
          className="xl:col-span-5 rounded-2xl border border-white/10 bg-[#111114]/80 backdrop-blur-xl p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <CalendarClock className="h-4 w-4 text-indigo-400" />
            <h2 className="font-display text-base font-semibold text-zinc-100">
              {t.projectPlanner.formTitle}
            </h2>
          </div>

          <div>
            <label
              htmlFor="proj-title"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              {t.projectPlanner.projectTitleLabel}
            </label>
            <input
              id="proj-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.projectPlanner.projectTitlePlaceholder}
              className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="proj-desc"
              className="block text-xs font-medium text-zinc-300 mb-1.5"
            >
              {t.projectPlanner.descriptionLabel}
            </label>
            <textarea
              id="proj-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.projectPlanner.descriptionPlaceholder}
              className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label
                htmlFor="proj-subject"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                {t.projectPlanner.subjectLabel}
              </label>
              <select
                id="proj-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value as SubjectCategory)}
                className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
              >
                {SUBJECT_CATEGORIES.map((sub) => (
                  <option key={sub} value={sub}>
                    {t.subjects[sub]}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="proj-hours"
                className="block text-xs font-medium text-zinc-300 mb-1.5"
              >
                {t.projectPlanner.dailyHoursLabel} ({dailyHours} {t.projectPlanner.hoursUnit})
              </label>
              <input
                id="proj-hours"
                type="number"
                min={0.5}
                max={12}
                step={0.5}
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3 py-2.5 text-sm font-mono tabular-nums text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="proj-deadline" className="font-medium text-zinc-300">
                {t.projectPlanner.deadlineLabel}
              </label>
              <span className="font-mono tabular-nums text-indigo-300">
                {deadlineDays} {t.projectPlanner.daysUnit}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="proj-deadline"
                type="range"
                min={1}
                max={30}
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value))}
                className="flex-1 accent-indigo-500 cursor-pointer"
              />
              <input
                type="number"
                min={1}
                max={30}
                aria-label="Deadline days numeric"
                value={deadlineDays}
                onChange={(e) =>
                  setDeadlineDays(Math.max(1, Math.min(30, Number(e.target.value) || 1)))
                }
                className="w-16 rounded-lg border border-white/10 bg-[#09090B] px-2 py-1.5 text-xs font-mono tabular-nums text-zinc-100 text-center"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-zinc-300">{t.projectPlanner.timeWindowLabel}</span>
              <span className="font-mono tabular-nums text-emerald-400">
                {windowMinutes} {t.projectPlanner.minutesPerDaySuffix}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="win-start" className="block text-[11px] text-zinc-500 mb-1">
                  {t.projectPlanner.startTime}
                </label>
                <input
                  id="win-start"
                  type="time"
                  value={startTimeWindow}
                  onChange={(e) => setStartTimeWindow(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3 py-2 text-sm font-mono tabular-nums text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="win-end" className="block text-[11px] text-zinc-500 mb-1">
                  {t.projectPlanner.endTime}
                </label>
                <input
                  id="win-end"
                  type="time"
                  value={endTimeWindow}
                  onChange={(e) => setEndTimeWindow(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#09090B] px-3 py-2 text-sm font-mono tabular-nums text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-zinc-300 mb-2">
              {t.projectPlanner.goalModeLabel}
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setGoalMode('finish')}
                className={`rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition-colors ${
                  goalMode === 'finish'
                    ? 'border-indigo-500/60 bg-indigo-500/15 text-zinc-100'
                    : 'border-white/10 bg-[#16161B] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t.projectPlanner.goalFinish}
              </button>
              <button
                type="button"
                onClick={() => setGoalMode('deep_learning')}
                className={`rounded-xl border px-3.5 py-2.5 text-left text-xs font-medium transition-colors ${
                  goalMode === 'deep_learning'
                    ? 'border-indigo-500/60 bg-indigo-500/15 text-zinc-100'
                    : 'border-white/10 bg-[#16161B] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t.projectPlanner.goalDeep}
              </button>
            </div>
          </div>

          {formError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200"
            >
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 active:scale-95 transition-all"
          >
            <span>{t.projectPlanner.submitBtn}</span>
          </button>
        </form>

        {/* Right Panel: Empty State OR Real Generated Roadmap */}
        <div className="xl:col-span-7 space-y-5">
          {isGenerating ? (
            <div
              aria-busy="true"
              className="rounded-2xl border border-white/10 bg-[#111114]/80 backdrop-blur-xl p-8 space-y-5"
            >
              <div className="flex items-center gap-3">
                <RotateCw className="h-5 w-5 text-indigo-400 animate-spin" />
                <p className="text-sm font-medium text-indigo-200">
                  {t.projectPlanner.loadingSteps[loadingStepIdx]}
                </p>
              </div>
              <div className="space-y-3">
                <div className="h-24 rounded-xl bg-white/[0.05] animate-pulse" />
                <div className="h-24 rounded-xl bg-white/[0.05] animate-pulse" />
              </div>
            </div>
          ) : activeProject && progress ? (
            <>
              <div className="rounded-2xl border border-white/10 bg-[#111114]/80 backdrop-blur-xl p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400">
                      <span className="text-indigo-300 font-medium whitespace-nowrap">
                        {t.subjects[activeProject.subject] || activeProject.subject}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums whitespace-nowrap">
                        {activeProject.startTimeWindow}–{activeProject.endTimeWindow}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="whitespace-nowrap">
                        {activeProject.goalMode === 'deep_learning'
                          ? t.projectPlanner.deepLearningBadge
                          : t.projectPlanner.executionBadge}
                      </span>
                    </div>
                    <h2 className="font-display text-lg font-bold text-zinc-50 mt-1">
                      {activeProject.title}
                    </h2>
                  </div>

                  {projects.length > 1 && (
                    <select
                      value={activeProject.id}
                      onChange={(e) => setActiveProjectId(e.target.value)}
                      aria-label="Select active project"
                      className="rounded-xl border border-white/10 bg-[#16161B] px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">{t.projectPlanner.completionLabel}</span>
                    <span
                      data-testid="project-completion-pct"
                      className="font-mono tabular-nums font-semibold text-emerald-400"
                    >
                      {progress.percentage}% ({progress.completedTasks}/{progress.totalTasks})
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {activeProject.days.map((day) => (
                  <section
                    key={day.dayNumber}
                    className="rounded-2xl border border-white/10 bg-[#111114]/80 backdrop-blur-xl p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-indigo-300">
                          <span>
                            {t.projectPlanner.dayPrefix} {day.dayNumber}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="text-zinc-400">{day.dateLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-zinc-400">
                            {day.totalMinutes} {t.projectPlanner.minutesUnit}
                          </span>
                        </div>
                        <h3 className="font-display text-base font-semibold text-zinc-100 mt-1">
                          {day.theme}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => openCheckpointQuiz(day)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                          day.checkpointCompleted
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                            : 'border border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-200'
                        }`}
                      >
                        {day.checkpointCompleted ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>
                              {t.projectPlanner.checkpointPassed} ({day.checkpointScore ?? 100}%)
                            </span>
                          </>
                        ) : (
                          <>
                            <Award className="h-3.5 w-3.5" />
                            <span>{t.projectPlanner.checkpointBtn}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {day.tasks.map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() =>
                            toggleTaskInProject(activeProject.id, day.dayNumber, task.id)
                          }
                          className={`w-full flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
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

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono tabular-nums text-zinc-400">
                              <span className="inline-flex items-center gap-1.5 text-indigo-300">
                                <Clock className="h-3 w-3" />
                                {task.startTime}–{task.endTime}
                              </span>
                              <span>
                                {task.focusArea} · {task.estimatedMinutes}{' '}
                                {t.projectPlanner.minutesUnit}
                              </span>
                            </div>

                            <p
                              className={`text-sm font-medium ${
                                task.completed ? 'line-through text-zinc-500' : 'text-zinc-100'
                              }`}
                            >
                              {task.title}
                            </p>

                            {task.keyConcepts.length > 0 && (
                              <p className="text-xs text-zinc-400">
                                {t.projectPlanner.keyConcepts}:{' '}
                                {task.keyConcepts.join(' · ')}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#111114]/80 backdrop-blur-xl p-12 text-center space-y-3">
              <CalendarClock className="h-8 w-8 text-zinc-600 mx-auto" />
              <h2 className="font-display text-base font-semibold text-zinc-200">
                {t.projectPlanner.emptyRoadmapTitle}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                {t.projectPlanner.emptyRoadmapSub}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Checkpoint Quiz Modal */}
      {quizDay && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkpoint-quiz-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#111114] shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-4">
              <div>
                <div className="text-xs font-mono text-indigo-400">
                  {t.projectPlanner.dayPrefix} {quizDay.dayNumber}
                </div>
                <h2
                  id="checkpoint-quiz-title"
                  className="font-display text-lg font-semibold text-zinc-100 mt-0.5"
                >
                  {t.projectPlanner.quizModalTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setQuizDay(null)}
                aria-label="Close checkpoint quiz"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {quizDay.checkpointQuiz.map((q, qIdx) => (
                <div key={q.id} className="space-y-2.5">
                  <p className="text-sm font-medium text-zinc-100">
                    {qIdx + 1}. {q.prompt}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const chosen = selectedAnswers[q.id] === oIdx;
                      const isCorrect = q.correctIndex === oIdx;
                      let style =
                        'border-white/10 bg-[#16161B] text-zinc-300 hover:border-white/20';
                      if (quizSubmitted) {
                        if (isCorrect) {
                          style = 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200';
                        } else if (chosen) {
                          style = 'border-rose-500/50 bg-rose-500/15 text-rose-200';
                        }
                      } else if (chosen) {
                        style = 'border-indigo-500/60 bg-indigo-500/15 text-zinc-100';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() =>
                            setSelectedAnswers((prev) => ({ ...prev, [q.id]: oIdx }))
                          }
                          className={`w-full rounded-xl border px-3.5 py-2.5 text-left text-xs transition-colors ${style}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizSubmitted && (
                    <p className="text-xs text-zinc-400 bg-[#18181D] rounded-lg p-2.5 border border-white/10">
                      {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4 bg-[#0D0D10]">
              <button
                type="button"
                onClick={() => setQuizDay(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-zinc-300 hover:bg-white/5 active:scale-95 transition-all"
              >
                {t.projectPlanner.closeBtn}
              </button>
              {!quizSubmitted && (
                <button
                  type="button"
                  onClick={handleSubmitCheckpointQuiz}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white active:scale-95 transition-all"
                >
                  {t.projectPlanner.submitQuizBtn}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
