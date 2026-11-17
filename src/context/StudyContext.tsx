import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type {
  AppRoute,
  AudioStudioDraft,
  AuthUser,
  Language,
  LectureNote,
  NotesDepth,
  ProjectPlan,
  ToastMessage,
} from '../types/study';
import { TRANSLATIONS, type Translations } from '../i18n/translations';
import { toggleProjectTask } from '../utils/studyLogic';

const LOCAL_GOOGLE_UID = 'local-google-user';

const GLOBAL_KEYS = {
  userSession: 'synapsestudy_user_session_v1',
  language: 'synapsestudy_lang_v2',
  defaultDepth: 'synapsestudy_depth_v2',
};

function userKeys(uid: string) {
  return {
    notes: `synapsestudy_u_${uid}_notes_v3`,
    projects: `synapsestudy_u_${uid}_projects_v3`,
    studioDraft: `synapsestudy_u_${uid}_studio_draft_v3`,
    pomoSecondsAcc: `synapsestudy_u_${uid}_pomo_acc_v3`,
    pomoSessions: `synapsestudy_u_${uid}_pomo_sessions_v3`,
  };
}

const DEFAULT_STUDIO_DRAFT: AudioStudioDraft = {
  lectureTitle: '',
  subject: 'Programming',
  rawTranscript: '',
  depth: 'deep',
  activeNoteId: null,
};

const VALID_ROUTES: AppRoute[] = ['/dashboard', '/audio-studio', '/project-planner'];

function parseRouteFromPath(): AppRoute {
  const path = window.location.pathname;
  if (VALID_ROUTES.includes(path as AppRoute)) {
    return path as AppRoute;
  }
  return '/dashboard';
}

function readJsonFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export type PomodoroMode = 'focus25' | 'deep50' | 'break5';

interface StudyContextValue {
  authReady: boolean;
  user: AuthUser | null;
  authLoading: boolean;
  authError: string | null;
  signInWithGoogle: (customName?: string) => void;
  logout: () => void;
  route: AppRoute;
  navigate: (to: AppRoute) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  hasServerKey: boolean;
  serverReachable: boolean;
  defaultDepth: NotesDepth;
  setDefaultDepth: (depth: NotesDepth) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  notes: LectureNote[];
  addOrUpdateNote: (note: LectureNote) => void;
  deleteNote: (id: string) => void;
  activeStudioNoteId: string | null;
  setActiveStudioNoteId: (id: string | null) => void;
  studioDraft: AudioStudioDraft;
  updateStudioDraft: (patch: Partial<AudioStudioDraft>) => void;
  projects: ProjectPlan[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string) => void;
  addProject: (plan: ProjectPlan) => void;
  deleteProject: (id: string) => void;
  toggleTaskInProject: (projectId: string, dayNumber: number, taskId: string) => void;
  markDayCheckpointPassed: (projectId: string, dayNumber: number, score: number) => void;
  clearAllData: () => void;
  toasts: ToastMessage[];
  pushToast: (title: string, description?: string, variant?: ToastMessage['variant']) => void;
  dismissToast: (id: string) => void;
  pomoMode: PomodoroMode;
  pomoSecondsLeft: number;
  pomoRunning: boolean;
  pomoSecondsAccumulated: number;
  pomoCompletedSessions: number;
  setPomodoroMode: (mode: PomodoroMode) => void;
  togglePomodoro: () => void;
  resetPomodoro: () => void;
}

const StudyContext = createContext<StudyContextValue | null>(null);

const POMO_DURATIONS: Record<PomodoroMode, number> = {
  focus25: 25 * 60,
  deep50: 50 * 60,
  break5: 5 * 60,
};

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [route, setRoute] = useState<AppRoute>(() => parseRouteFromPath());
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(GLOBAL_KEYS.language);
    return saved === 'kk' || saved === 'ru' || saved === 'en' ? saved : 'kk';
  });
  const [defaultDepth, setDefaultDepthState] = useState<NotesDepth>(() => {
    const saved = localStorage.getItem(GLOBAL_KEYS.defaultDepth);
    return saved === 'concise' || saved === 'deep' || saved === 'exam' ? saved : 'deep';
  });
  const [hasServerKey, setHasServerKey] = useState(false);
  const [serverReachable, setServerReachable] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [notes, setNotes] = useState<LectureNote[]>([]);
  const [projects, setProjects] = useState<ProjectPlan[]>([]);
  const [studioDraft, setStudioDraft] = useState<AudioStudioDraft>(DEFAULT_STUDIO_DRAFT);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeStudioNoteId, setActiveStudioNoteId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [pomoMode, setPomoMode] = useState<PomodoroMode>('focus25');
  const [pomoSecondsLeft, setPomoSecondsLeft] = useState<number>(POMO_DURATIONS.focus25);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoSecondsAccumulated, setPomoSecondsAccumulated] = useState<number>(0);
  const [pomoCompletedSessions, setPomoCompletedSessions] = useState<number>(0);

  const hydratedUidRef = useRef<string | null>(null);

  const pushToast = useCallback(
    (title: string, description?: string, variant: ToastMessage['variant'] = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, description, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 3600);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const loadUserWorkspaceFromStorage = useCallback(
    (uid: string) => {
      const keys = userKeys(uid);
      const savedNotes = readJsonFromStorage<LectureNote[]>(keys.notes, []);
      const savedProjects = readJsonFromStorage<ProjectPlan[]>(keys.projects, []);
      const savedDraft = readJsonFromStorage<AudioStudioDraft>(keys.studioDraft, {
        ...DEFAULT_STUDIO_DRAFT,
        depth: defaultDepth,
      });
      const savedPomoAcc = Number(localStorage.getItem(keys.pomoSecondsAcc)) || 0;
      const savedPomoSessions = Number(localStorage.getItem(keys.pomoSessions)) || 0;

      setNotes(Array.isArray(savedNotes) ? savedNotes : []);
      setProjects(Array.isArray(savedProjects) ? savedProjects : []);
      setActiveProjectId(
        Array.isArray(savedProjects) && savedProjects[0] ? savedProjects[0].id : null
      );
      setStudioDraft({
        ...DEFAULT_STUDIO_DRAFT,
        ...savedDraft,
      });
      setPomoSecondsAccumulated(Number.isFinite(savedPomoAcc) && savedPomoAcc > 0 ? savedPomoAcc : 0);
      setPomoCompletedSessions(
        Number.isFinite(savedPomoSessions) && savedPomoSessions > 0 ? savedPomoSessions : 0
      );
      hydratedUidRef.current = uid;
    },
    [defaultDepth]
  );

  // Restore localStorage user session on mount
  useEffect(() => {
    try {
      const rawSession = localStorage.getItem(GLOBAL_KEYS.userSession);
      if (rawSession) {
        const parsed = JSON.parse(rawSession) as Partial<AuthUser>;
        if (parsed && typeof parsed.uid === 'string' && typeof parsed.displayName === 'string') {
          const restoredUser: AuthUser = {
            uid: parsed.uid || LOCAL_GOOGLE_UID,
            displayName: parsed.displayName.trim() || TRANSLATIONS[language].auth.defaultDisplayName,
            email: typeof parsed.email === 'string' ? parsed.email : '',
            photoURL: typeof parsed.photoURL === 'string' ? parsed.photoURL : '',
          };
          setUser(restoredUser);
          loadUserWorkspaceFromStorage(restoredUser.uid);
        }
      }
    } catch {
      // ignore corrupted session payload
    } finally {
      setAuthReady(true);
    }
    // Only restore initial session once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!VALID_ROUTES.includes(window.location.pathname as AppRoute)) {
      window.history.replaceState({}, '', '/dashboard');
      setRoute('/dashboard');
    }
    const handlePop = () => {
      setRoute(parseRouteFromPath());
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  useEffect(() => {
    fetch('/api/ai/status')
      .then(async (res) => {
        if (!res.ok) return null;
        const text = await res.text();
        if (text.trim().startsWith('<')) return null;
        return JSON.parse(text) as { hasServerKey?: boolean };
      })
      .then((data) => {
        if (data && typeof data.hasServerKey === 'boolean') {
          setServerReachable(true);
          setHasServerKey(data.hasServerKey);
        } else {
          setServerReachable(false);
          setHasServerKey(false);
        }
      })
      .catch(() => {
        setServerReachable(false);
        setHasServerKey(false);
      });
  }, []);

  // Persist user-scoped workspace data synchronously to localStorage
  useEffect(() => {
    if (!user || hydratedUidRef.current !== user.uid) return;
    try {
      const keys = userKeys(user.uid);
      localStorage.setItem(keys.notes, JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes, user]);

  useEffect(() => {
    if (!user || hydratedUidRef.current !== user.uid) return;
    try {
      const keys = userKeys(user.uid);
      localStorage.setItem(keys.projects, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects, user]);

  useEffect(() => {
    if (!user || hydratedUidRef.current !== user.uid) return;
    try {
      const keys = userKeys(user.uid);
      localStorage.setItem(keys.studioDraft, JSON.stringify(studioDraft));
    } catch {
      // ignore
    }
  }, [studioDraft, user]);

  useEffect(() => {
    if (!user || hydratedUidRef.current !== user.uid) return;
    try {
      const keys = userKeys(user.uid);
      localStorage.setItem(keys.pomoSecondsAcc, String(pomoSecondsAccumulated));
      localStorage.setItem(keys.pomoSessions, String(pomoCompletedSessions));
    } catch {
      // ignore
    }
  }, [pomoSecondsAccumulated, pomoCompletedSessions, user]);

  const signInWithGoogle = useCallback(
    (customName?: string) => {
      const tCur = TRANSLATIONS[language];
      const displayName = (customName || '').trim() || tCur.auth.defaultDisplayName;
      const authUser: AuthUser = {
        uid: LOCAL_GOOGLE_UID,
        displayName: displayName.slice(0, 120),
        email: '',
        photoURL: '',
      };

      setAuthError(null);
      try {
        localStorage.setItem(GLOBAL_KEYS.userSession, JSON.stringify(authUser));
      } catch {
        // ignore storage quota errors
      }
      setUser(authUser);
      loadUserWorkspaceFromStorage(authUser.uid);
      pushToast(tCur.auth.welcomeToastTitle, authUser.displayName, 'success');
    },
    [language, loadUserWorkspaceFromStorage, pushToast]
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(GLOBAL_KEYS.userSession);
    } catch {
      // ignore
    }
    hydratedUidRef.current = null;
    setUser(null);
    setNotes([]);
    setProjects([]);
    setStudioDraft({ ...DEFAULT_STUDIO_DRAFT, depth: defaultDepth });
    setActiveProjectId(null);
    setActiveStudioNoteId(null);
    setPomoRunning(false);
    setPomoSecondsAccumulated(0);
    setPomoCompletedSessions(0);
    setPomoSecondsLeft(POMO_DURATIONS[pomoMode]);
    const tCur = TRANSLATIONS[language];
    pushToast(tCur.auth.signedOutToastTitle, tCur.auth.signedOutToastSub, 'info');
  }, [defaultDepth, language, pomoMode, pushToast]);

  // Pomodoro real countdown & accumulation
  useEffect(() => {
    if (!pomoRunning || !user) return;
    const timer = window.setInterval(() => {
      if (pomoMode !== 'break5') {
        setPomoSecondsAccumulated((acc) => acc + 1);
      }
      setPomoSecondsLeft((prev) => {
        if (prev <= 1) {
          setPomoRunning(false);
          if (pomoMode !== 'break5') {
            setPomoCompletedSessions((c) => c + 1);
          }
          const tCur = TRANSLATIONS[language];
          pushToast(tCur.dashboard.focusCompleteTitle, tCur.dashboard.focusCompleteSub, 'success');
          return POMO_DURATIONS[pomoMode];
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [pomoRunning, pomoMode, user, language, pushToast]);

  const navigate = useCallback((to: AppRoute) => {
    setRoute(to);
    if (window.location.pathname !== to) {
      window.history.pushState({}, '', to);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(GLOBAL_KEYS.language, lang);
    } catch {
      // ignore
    }
  }, []);

  const setDefaultDepth = useCallback((depth: NotesDepth) => {
    setDefaultDepthState(depth);
    try {
      localStorage.setItem(GLOBAL_KEYS.defaultDepth, depth);
    } catch {
      // ignore
    }
  }, []);

  const updateStudioDraft = useCallback((patch: Partial<AudioStudioDraft>) => {
    setStudioDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const addOrUpdateNote = useCallback((note: LectureNote) => {
    setNotes((prev) => {
      const exists = prev.some((n) => n.id === note.id);
      return exists ? prev.map((n) => (n.id === note.id ? note : n)) : [note, ...prev];
    });
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setStudioDraft((prev) => (prev.activeNoteId === id ? { ...prev, activeNoteId: null } : prev));
  }, []);

  const addProject = useCallback((plan: ProjectPlan) => {
    setProjects((prev) => [plan, ...prev]);
    setActiveProjectId(plan.id);
  }, []);

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => {
        const next = prev.filter((p) => p.id !== id);
        if (activeProjectId === id) {
          setActiveProjectId(next[0]?.id || null);
        }
        return next;
      });
    },
    [activeProjectId]
  );

  const toggleTaskInProject = useCallback(
    (projectId: string, dayNumber: number, taskId: string) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? toggleProjectTask(p, dayNumber, taskId) : p))
      );
    },
    []
  );

  const markDayCheckpointPassed = useCallback(
    (projectId: string, dayNumber: number, score: number) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            days: p.days.map((d) =>
              d.dayNumber === dayNumber
                ? { ...d, checkpointCompleted: true, checkpointScore: score }
                : d
            ),
          };
        })
      );
    },
    []
  );

  const clearAllData = useCallback(() => {
    setNotes([]);
    setProjects([]);
    setStudioDraft({ ...DEFAULT_STUDIO_DRAFT, depth: defaultDepth });
    setActiveProjectId(null);
    setActiveStudioNoteId(null);
    setPomoRunning(false);
    setPomoSecondsAccumulated(0);
    setPomoCompletedSessions(0);
    setPomoSecondsLeft(POMO_DURATIONS[pomoMode]);
    if (user) {
      const keys = userKeys(user.uid);
      try {
        localStorage.removeItem(keys.notes);
        localStorage.removeItem(keys.projects);
        localStorage.removeItem(keys.studioDraft);
        localStorage.removeItem(keys.pomoSecondsAcc);
        localStorage.removeItem(keys.pomoSessions);
      } catch {
        // ignore
      }
    }
    const tCur = TRANSLATIONS[language];
    pushToast(tCur.dashboard.sessionResetTitle, tCur.dashboard.sessionResetSub, 'info');
  }, [pomoMode, pushToast, user, defaultDepth, language]);

  const setPomodoroMode = useCallback((mode: PomodoroMode) => {
    setPomoRunning(false);
    setPomoMode(mode);
    setPomoSecondsLeft(POMO_DURATIONS[mode]);
  }, []);

  const togglePomodoro = useCallback(() => {
    setPomoRunning((r) => !r);
  }, []);

  const resetPomodoro = useCallback(() => {
    setPomoRunning(false);
    setPomoSecondsLeft(POMO_DURATIONS[pomoMode]);
  }, [pomoMode]);

  return (
    <StudyContext.Provider
      value={{
        authReady,
        user,
        authLoading,
        authError,
        signInWithGoogle,
        logout,
        route,
        navigate,
        language,
        setLanguage,
        t: TRANSLATIONS[language],
        hasServerKey,
        serverReachable,
        defaultDepth,
        setDefaultDepth,
        settingsOpen,
        setSettingsOpen,
        notes,
        addOrUpdateNote,
        deleteNote,
        activeStudioNoteId,
        setActiveStudioNoteId,
        studioDraft,
        updateStudioDraft,
        projects,
        activeProjectId,
        setActiveProjectId,
        addProject,
        deleteProject,
        toggleTaskInProject,
        markDayCheckpointPassed,
        clearAllData,
        toasts,
        pushToast,
        dismissToast,
        pomoMode,
        pomoSecondsLeft,
        pomoRunning,
        pomoSecondsAccumulated,
        pomoCompletedSessions,
        setPomodoroMode,
        togglePomodoro,
        resetPomodoro,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy must be used within StudyProvider');
  return ctx;
}
