export type Language = 'kk' | 'ru' | 'en';

export type NotesDepth = 'concise' | 'deep' | 'exam';

export const SUBJECT_CATEGORIES = [
  'Programming',
  'Math',
  'Physics',
  'Chemistry',
  'Biology',
  'Medicine',
  'DataScience',
  'Engineering',
  'Economics',
  'Business',
  'Law',
  'History',
  'Humanities',
  'Languages',
  'Psychology',
  'Design',
] as const;

export type SubjectCategory = (typeof SUBJECT_CATEGORIES)[number];

export type AppRoute =
  | '/dashboard'
  | '/audio-studio'
  | '/project-planner';

export interface AuthUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

export interface AudioStudioDraft {
  lectureTitle: string;
  subject: SubjectCategory;
  rawTranscript: string;
  depth: NotesDepth;
  activeNoteId: string | null;
}

export interface NoteSection {
  id: string;
  heading: string;
  summary: string;
  keyPoints: string[];
  callout?: {
    title: string;
    content: string;
  };
}

export interface PracticeQuestion {
  id: string;
  question: string;
  difficulty: 'Core' | 'Applied' | 'Challenge';
  hint: string;
  answer: string;
  explanation: string;
}

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  example: string;
  mastered?: boolean;
}

export interface LectureNote {
  id: string;
  title: string;
  subject: SubjectCategory;
  durationMinutes: number;
  createdAt: string;
  language: Language;
  depth: NotesDepth;
  engine: 'gemini';
  rawTranscript: string;
  executiveSummary: string;
  keyTakeaways: string[];
  sections: NoteSection[];
  practiceQuestions: PracticeQuestion[];
  flashcards: Flashcard[];
}

export interface TimeBlockTask {
  id: string;
  startTime: string;
  endTime: string;
  estimatedMinutes: number;
  title: string;
  focusArea: string;
  keyConcepts: string[];
  completed: boolean;
  type: 'setup' | 'core' | 'learning' | 'review';
}

export interface CheckpointQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ProjectDayPlan {
  dayNumber: number;
  dateLabel: string;
  theme: string;
  totalMinutes: number;
  tasks: TimeBlockTask[];
  checkpointQuiz: CheckpointQuestion[];
  checkpointCompleted: boolean;
  checkpointScore?: number;
}

export interface ProjectPlan {
  id: string;
  title: string;
  description: string;
  subject: SubjectCategory;
  deadlineDays: number;
  dailyHours: number;
  startTimeWindow: string;
  endTimeWindow: string;
  goalMode: 'finish' | 'deep_learning';
  language: Language;
  engine: 'gemini';
  createdAt: string;
  days: ProjectDayPlan[];
}

export interface RealAnalyticsSummary {
  totalNotes: number;
  totalFlashcards: number;
  totalQuestions: number;
  pomodoroMinutes: number;
  pomodoroSessions: number;
  activeProjectsCount: number;
  completedTasksCount: number;
  totalTasksCount: number;
  activeProjectCompletionPct: number;
  checkpointAvgScore: number | null;
  subjectBreakdown: Array<{
    subject: SubjectCategory;
    notesCount: number;
    projectsCount: number;
  }>;
  hasAnyActivity: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'info' | 'error';
}
