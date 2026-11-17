import {
  SUBJECT_CATEGORIES,
  type LectureNote,
  type ProjectDayPlan,
  type ProjectPlan,
  type RealAnalyticsSummary,
  type TimeBlockTask,
} from '../types/study';

/**
 * Parses an "HH:MM" string into total minutes from midnight (0..1439).
 */
export function parseTimeToMinutes(hhmm: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec((hhmm || '').trim());
  if (!match) return 0;
  const hours = Math.min(23, Math.max(0, Number(match[1])));
  const mins = Math.min(59, Math.max(0, Number(match[2])));
  return hours * 60 + mins;
}

/**
 * Formats total minutes from midnight back into zero-padded "HH:MM".
 */
export function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hh = Math.floor(normalized / 60);
  const mm = normalized % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/**
 * Computes window duration in minutes between start and end HH:MM strings.
 */
export function computeWindowMinutes(startTime: string, endTime: string): number {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (end === start) return 0;
  if (end > start) return end - start;
  return 1440 - start + end;
}

export interface RawTaskSeed {
  id?: string;
  title: string;
  focusArea: string;
  estimatedMinutes: number;
  keyConcepts: string[];
  type: 'setup' | 'core' | 'learning' | 'review';
  completed?: boolean;
}

/**
 * Strictly packs and fits a day's tasks inside [startTimeWindow, endTimeWindow].
 */
export function fitTasksIntoWindow(
  tasks: RawTaskSeed[],
  startTimeWindow: string,
  endTimeWindow: string,
  maxDailyMinutes?: number
): TimeBlockTask[] {
  if (!tasks || tasks.length === 0) return [];

  const windowSpan = computeWindowMinutes(startTimeWindow, endTimeWindow);
  const effectiveSpan =
    windowSpan > 0
      ? maxDailyMinutes && maxDailyMinutes > 0
        ? Math.min(windowSpan, maxDailyMinutes)
        : windowSpan
      : 120;

  const startMins = parseTimeToMinutes(startTimeWindow);
  const rawTotal = tasks.reduce((acc, t) => acc + Math.max(10, t.estimatedMinutes || 30), 0);

  const scaledDurations = tasks.map((t) => {
    const raw = Math.max(10, t.estimatedMinutes || 30);
    return Math.max(10, Math.round((raw / rawTotal) * effectiveSpan));
  });

  const currentSum = scaledDurations.reduce((a, b) => a + b, 0);
  const diff = effectiveSpan - currentSum;
  if (scaledDurations.length > 0 && diff !== 0) {
    const lastIdx = scaledDurations.length - 1;
    scaledDurations[lastIdx] = Math.max(5, scaledDurations[lastIdx] + diff);
  }

  let cursor = startMins;
  return tasks.map((task, idx) => {
    const duration = scaledDurations[idx];
    const blockStart = formatMinutesToTime(cursor);
    const blockEnd = formatMinutesToTime(cursor + duration);
    cursor += duration;

    return {
      id: task.id || `task-${idx + 1}`,
      startTime: blockStart,
      endTime: blockEnd,
      estimatedMinutes: duration,
      title: task.title,
      focusArea: task.focusArea,
      keyConcepts: Array.isArray(task.keyConcepts) ? task.keyConcepts : [],
      completed: Boolean(task.completed),
      type: task.type || 'core',
    };
  });
}

/**
 * Computes completion stats for a single ProjectPlan.
 */
export function calculateProjectProgress(project: ProjectPlan): {
  completedTasks: number;
  totalTasks: number;
  percentage: number;
  masteredDays: number;
} {
  let completedTasks = 0;
  let totalTasks = 0;
  let masteredDays = 0;

  for (const day of project.days) {
    for (const task of day.tasks) {
      totalTasks += 1;
      if (task.completed) completedTasks += 1;
    }
    if (day.checkpointCompleted) {
      masteredDays += 1;
    }
  }

  const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  return { completedTasks, totalTasks, percentage, masteredDays };
}

/**
 * Computes real session & storage-backed analytics with zero mock defaults.
 */
export function calculateRealAnalytics(
  notes: LectureNote[],
  projects: ProjectPlan[],
  activeProjectId: string | null,
  pomoSecondsAccumulated: number,
  pomoCompletedSessions: number
): RealAnalyticsSummary {
  const totalNotes = notes.length;
  const totalFlashcards = notes.reduce((sum, n) => sum + n.flashcards.length, 0);
  const totalQuestions = notes.reduce((sum, n) => sum + n.practiceQuestions.length, 0);
  const pomodoroMinutes = Math.floor(Math.max(0, pomoSecondsAccumulated) / 60);

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  let completedTasksCount = 0;
  let totalTasksCount = 0;
  for (const p of projects) {
    const prog = calculateProjectProgress(p);
    completedTasksCount += prog.completedTasks;
    totalTasksCount += prog.totalTasks;
  }

  const activeProjectCompletionPct = activeProject
    ? calculateProjectProgress(activeProject).percentage
    : 0;

  const checkpointScores: number[] = [];
  for (const p of projects) {
    for (const d of p.days) {
      if (d.checkpointCompleted && typeof d.checkpointScore === 'number') {
        checkpointScores.push(d.checkpointScore);
      }
    }
  }
  const checkpointAvgScore =
    checkpointScores.length === 0
      ? null
      : Math.round(
          checkpointScores.reduce((a, b) => a + b, 0) / checkpointScores.length
        );

  const subjectBreakdown = SUBJECT_CATEGORIES.map((subject) => ({
    subject,
    notesCount: notes.filter((n) => n.subject === subject).length,
    projectsCount: projects.filter((p) => p.subject === subject).length,
  }));

  const hasAnyActivity =
    totalNotes > 0 ||
    projects.length > 0 ||
    pomoSecondsAccumulated > 0 ||
    pomoCompletedSessions > 0;

  return {
    totalNotes,
    totalFlashcards,
    totalQuestions,
    pomodoroMinutes,
    pomodoroSessions: pomoCompletedSessions,
    activeProjectsCount: projects.length,
    completedTasksCount,
    totalTasksCount,
    activeProjectCompletionPct,
    checkpointAvgScore,
    subjectBreakdown,
    hasAnyActivity,
  };
}

/**
 * Toggles a specific task inside a ProjectPlan immutably.
 */
export function toggleProjectTask(
  project: ProjectPlan,
  dayNumber: number,
  taskId: string
): ProjectPlan {
  return {
    ...project,
    days: project.days.map((day: ProjectDayPlan) => {
      if (day.dayNumber !== dayNumber) return day;
      return {
        ...day,
        tasks: day.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ),
      };
    }),
  };
}

/**
 * Formats seconds into MM:SS for audio players and Pomodoro timers.
 */
export function formatSecondsToMMSS(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(clamped / 60);
  const ss = clamped % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/**
 * Exports a structured LectureNote to clean, readable Markdown.
 */
export function formatLectureToMarkdown(note: LectureNote): string {
  const lines: string[] = [];
  lines.push(`# ${note.title}`);
  lines.push(`**Subject:** ${note.subject} | **Duration:** ${note.durationMinutes} min | **Depth:** ${note.depth}`);
  lines.push('');
  lines.push('## Summary');
  lines.push(note.executiveSummary);
  lines.push('');

  if (note.keyTakeaways.length > 0) {
    lines.push('## Key Takeaways');
    for (const item of note.keyTakeaways) {
      lines.push(`- ${item}`);
    }
    lines.push('');
  }

  for (const section of note.sections) {
    lines.push(`## ${section.heading}`);
    lines.push(section.summary);
    lines.push('');
    for (const pt of section.keyPoints) {
      lines.push(`- ${pt}`);
    }
    if (section.callout) {
      lines.push('');
      lines.push(`> **${section.callout.title}:** ${section.callout.content}`);
    }
    lines.push('');
  }

  if (note.practiceQuestions.length > 0) {
    lines.push('## Practice Problems & Self-Test');
    note.practiceQuestions.forEach((q, idx) => {
      lines.push(`### ${idx + 1}. ${q.question} (${q.difficulty})`);
      lines.push(`**Answer:** ${q.answer}`);
      lines.push(`*Explanation:* ${q.explanation}`);
      lines.push('');
    });
  }

  if (note.flashcards.length > 0) {
    lines.push('## Flashcards');
    for (const card of note.flashcards) {
      lines.push(`- **${card.term}**: ${card.definition}`);
    }
  }

  return lines.join('\n');
}
