import { Play, Pause, RotateCcw } from 'lucide-react';
import { useStudy, type PomodoroMode } from '../context/StudyContext';
import { formatSecondsToMMSS } from '../utils/studyLogic';

const TOTAL_SECONDS: Record<PomodoroMode, number> = {
  focus25: 25 * 60,
  deep50: 50 * 60,
  break5: 5 * 60,
};

export function PomodoroWidget() {
  const {
    t,
    pomoMode,
    pomoSecondsLeft,
    pomoRunning,
    pomoCompletedSessions,
    setPomodoroMode,
    togglePomodoro,
    resetPomodoro,
  } = useStudy();

  const total = TOTAL_SECONDS[pomoMode];
  const progress = Math.max(0, Math.min(1, 1 - pomoSecondsLeft / total));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const modes: { id: PomodoroMode; label: string }[] = [
    { id: 'focus25', label: t.dashboard.focusMode25 },
    { id: 'deep50', label: t.dashboard.deepWork50 },
    { id: 'break5', label: t.dashboard.breakMode5 },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111114]/80 backdrop-blur-xl p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="font-display text-sm font-semibold text-zinc-100">
          {t.dashboard.pomodoroTitle}
        </h3>
        <span className="text-xs font-mono tabular-nums text-zinc-400">
          {pomoCompletedSessions} {t.dashboard.sessionsUnit}
        </span>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#09090B]/90 border border-white/10 mb-5">
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setPomodoroMode(m.id)}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
              pomoMode === m.id
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer Ring + Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex items-center justify-center h-24 w-24 shrink-0">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 88 88" aria-hidden="true">
            <circle
              cx="44"
              cy="44"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="6"
            />
            <circle
              cx="44"
              cy="44"
              r={radius}
              fill="none"
              stroke={pomoMode === 'break5' ? '#10B981' : '#6366F1'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500"
            />
          </svg>
          <span
            data-testid="pomodoro-time"
            className="absolute font-mono text-lg font-bold tabular-nums text-zinc-100"
          >
            {formatSecondsToMMSS(pomoSecondsLeft)}
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <button
            type="button"
            onClick={togglePomodoro}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all active:scale-95 whitespace-nowrap ${
              pomoRunning
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/25'
            }`}
          >
            {pomoRunning ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>{t.dashboard.pauseTimer}</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>{t.dashboard.startTimer}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetPomodoro}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-white/10 bg-[#18181D] hover:bg-white/[0.06] text-xs font-medium text-zinc-300 transition-all active:scale-95 whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t.dashboard.resetTimer}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
