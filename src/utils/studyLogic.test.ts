import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTimeToMinutes,
  formatMinutesToTime,
  computeWindowMinutes,
  fitTasksIntoWindow,
  calculateProjectProgress,
  calculateRealAnalytics,
  toggleProjectTask,
  formatSecondsToMMSS,
  formatLectureToMarkdown,
} from './studyLogic';
import type { LectureNote, ProjectPlan } from '../types/study';

test('parseTimeToMinutes and formatMinutesToTime round-trip cleanly', () => {
  assert.equal(parseTimeToMinutes('18:30'), 1110);
  assert.equal(parseTimeToMinutes('21:00'), 1260);
  assert.equal(formatMinutesToTime(1110), '18:30');
  assert.equal(formatMinutesToTime(1445), '00:05');
});

test('computeWindowMinutes calculates exact duration including overnight windows', () => {
  assert.equal(computeWindowMinutes('18:30', '21:00'), 150);
  assert.equal(computeWindowMinutes('22:30', '00:30'), 120);
  assert.equal(computeWindowMinutes('09:00', '09:00'), 0);
});

test('fitTasksIntoWindow packs tasks strictly within 18:30-21:00 without overflow', () => {
  const blocks = fitTasksIntoWindow(
    [
      {
        title: 'Architecture Setup',
        focusArea: 'Repo & Env',
        estimatedMinutes: 60,
        keyConcepts: ['Vite', 'Express'],
        type: 'setup',
      },
      {
        title: 'Core Logic',
        focusArea: 'Bot Engine',
        estimatedMinutes: 90,
        keyConcepts: ['Webhooks'],
        type: 'core',
      },
      {
        title: 'Self-Check & Review',
        focusArea: 'Unit tests',
        estimatedMinutes: 50,
        keyConcepts: ['Assertions'],
        type: 'review',
      },
    ],
    '18:30',
    '21:00'
  );

  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].startTime, '18:30');
  assert.equal(blocks[blocks.length - 1].endTime, '21:00');
  const totalMinutes = blocks.reduce((sum, b) => sum + b.estimatedMinutes, 0);
  assert.equal(totalMinutes, 150);
  assert.equal(blocks[0].endTime, blocks[1].startTime);
  assert.equal(blocks[1].endTime, blocks[2].startTime);
});

test('calculateProjectProgress and toggleProjectTask recalculate completion accurately', () => {
  const sampleProject: ProjectPlan = {
    id: 'p1',
    title: 'Telegram Bot',
    description: 'Bot + Dashboard',
    subject: 'Programming',
    deadlineDays: 2,
    dailyHours: 2.5,
    startTimeWindow: '18:30',
    endTimeWindow: '21:00',
    goalMode: 'deep_learning',
    language: 'kk',
    engine: 'gemini',
    createdAt: '2026-11-17',
    days: [
      {
        dayNumber: 1,
        dateLabel: 'Day 1',
        theme: 'Setup',
        totalMinutes: 150,
        checkpointCompleted: true,
        checkpointScore: 100,
        tasks: [
          {
            id: 't1',
            startTime: '18:30',
            endTime: '19:30',
            estimatedMinutes: 60,
            title: 'Init',
            focusArea: 'Setup',
            keyConcepts: [],
            completed: true,
            type: 'setup',
          },
          {
            id: 't2',
            startTime: '19:30',
            endTime: '21:00',
            estimatedMinutes: 90,
            title: 'API',
            focusArea: 'Server',
            keyConcepts: [],
            completed: false,
            type: 'core',
          },
        ],
        checkpointQuiz: [],
      },
    ],
  };

  const initial = calculateProjectProgress(sampleProject);
  assert.equal(initial.completedTasks, 1);
  assert.equal(initial.totalTasks, 2);
  assert.equal(initial.percentage, 50);
  assert.equal(initial.masteredDays, 1);

  const updated = toggleProjectTask(sampleProject, 1, 't2');
  const after = calculateProjectProgress(updated);
  assert.equal(after.completedTasks, 2);
  assert.equal(after.percentage, 100);
});

test('calculateRealAnalytics returns clean zero state when empty and accurate real totals when populated', () => {
  const empty = calculateRealAnalytics([], [], null, 0, 0);
  assert.equal(empty.hasAnyActivity, false);
  assert.equal(empty.totalNotes, 0);
  assert.equal(empty.pomodoroMinutes, 0);
  assert.equal(empty.activeProjectCompletionPct, 0);
  assert.equal(empty.checkpointAvgScore, null);

  const note: LectureNote = {
    id: 'n1',
    title: 'Graphs',
    subject: 'Programming',
    durationMinutes: 30,
    createdAt: '2026-11-17',
    language: 'kk',
    depth: 'deep',
    engine: 'gemini',
    rawTranscript: 'BFS and DFS lecture text',
    executiveSummary: 'Summary',
    keyTakeaways: ['BFS'],
    sections: [],
    practiceQuestions: [
      { id: 'q1', question: 'Q', difficulty: 'Core', hint: 'H', answer: 'A', explanation: 'E' },
    ],
    flashcards: [{ id: 'f1', term: 'T', definition: 'D', example: 'Ex' }],
  };

  const populated = calculateRealAnalytics([note], [], null, 1500, 1);
  assert.equal(populated.hasAnyActivity, true);
  assert.equal(populated.totalNotes, 1);
  assert.equal(populated.totalFlashcards, 1);
  assert.equal(populated.totalQuestions, 1);
  assert.equal(populated.pomodoroMinutes, 25);
  assert.equal(populated.pomodoroSessions, 1);
  assert.equal(populated.subjectBreakdown.length, 16);
  assert.equal(
    populated.subjectBreakdown.some((item) => item.subject === 'DataScience'),
    true
  );
  assert.equal(
    populated.subjectBreakdown.some((item) => item.subject === 'Medicine'),
    true
  );
});

test('formatSecondsToMMSS and formatLectureToMarkdown produce expected strings', () => {
  assert.equal(formatSecondsToMMSS(1500), '25:00');
  assert.equal(formatSecondsToMMSS(65), '01:05');

  const md = formatLectureToMarkdown({
    id: 'n1',
    title: 'Algorithms 101',
    subject: 'Programming',
    durationMinutes: 45,
    createdAt: '2026-11-17',
    language: 'kk',
    depth: 'exam',
    engine: 'gemini',
    rawTranscript: 'Transcript',
    executiveSummary: 'Graph traversal essentials.',
    keyTakeaways: ['BFS uses Queue'],
    sections: [
      {
        id: 's1',
        heading: 'BFS',
        summary: 'Level-order traversal.',
        keyPoints: ['O(V+E) time complexity'],
      },
    ],
    practiceQuestions: [],
    flashcards: [{ id: 'f1', term: 'BFS', definition: 'Breadth-First Search', example: 'Shortest path' }],
  });

  assert.match(md, /# Algorithms 101/);
  assert.match(md, /BFS uses Queue/);
  assert.match(md, /\*\*BFS\*\*: Breadth-First Search/);
});
