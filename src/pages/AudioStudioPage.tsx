import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  FileAudio,
  FileText,
  Lightbulb,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCw,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import {
  SUBJECT_CATEGORIES,
  type LectureNote,
  type NotesDepth,
  type SubjectCategory,
} from '../types/study';
import { formatLectureToMarkdown, formatSecondsToMMSS } from '../utils/studyLogic';
import { parseApiJson } from '../utils/api';

const WAVEFORM_BARS = [
  24, 42, 68, 35, 84, 52, 92, 46, 70, 38, 88, 60, 44, 78, 95, 55, 40, 74, 62, 34, 82, 58, 90, 48,
  66, 36, 86, 54, 72, 42, 64, 80, 46, 76, 50, 88, 60, 38, 70, 52,
];

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read audio file.'));
    reader.readAsDataURL(blob);
  });
}

export function AudioStudioPage() {
  const {
    t,
    language,
    notes,
    addOrUpdateNote,
    activeStudioNoteId,
    setActiveStudioNoteId,
    studioDraft,
    updateStudioDraft,
    pushToast,
  } = useStudy();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const micTimerRef = useRef<number | null>(null);

  // Persisted draft fields in StudyContext (localStorage)
  const lectureTitle = studioDraft.lectureTitle;
  const subject = studioDraft.subject;
  const rawTranscript = studioDraft.rawTranscript;
  const depth = studioDraft.depth;

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string>('audio/mpeg');
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [audioObjectUrl, setAudioObjectUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Audio playback controls
  const [durationSec, setDurationSec] = useState<number>(0);
  const [currentSec, setCurrentSec] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);

  // Microphone recorder state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  // AI Notes & Practical Tasks state (persisted via notes + studioDraft.activeNoteId)
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);

  const generatedNote =
    (studioDraft.activeNoteId
      ? notes.find((n) => n.id === studioDraft.activeNoteId)
      : null) || null;

  // Output view tabs
  const [activeTab, setActiveTab] = useState<'notes' | 'practice' | 'flashcards'>('notes');
  const [openQuestionIds, setOpenQuestionIds] = useState<Record<string, boolean>>({});
  const [showHintIds, setShowHintIds] = useState<Record<string, boolean>>({});
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeStudioNoteId) {
      const found = notes.find((n) => n.id === activeStudioNoteId);
      if (found) {
        updateStudioDraft({
          activeNoteId: found.id,
          lectureTitle: found.title,
          subject: found.subject,
          rawTranscript: found.rawTranscript,
          depth: found.depth,
        });
        setActiveTab(found.sections.length > 0 ? 'notes' : 'practice');
        setActiveCardIndex(0);
        setIsCardFlipped(false);
      }
      setActiveStudioNoteId(null);
    }
  }, [activeStudioNoteId, notes, setActiveStudioNoteId, updateStudioDraft]);

  useEffect(() => {
    if (audioElRef.current) {
      audioElRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    return () => {
      if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl);
      if (micTimerRef.current) window.clearInterval(micTimerRef.current);
    };
  }, [audioObjectUrl]);

  const handleFileUpload = (file: File) => {
    const valid = /\.(mp3|wav|m4a|ogg|webm)$/i.test(file.name) || file.type.startsWith('audio/');
    if (!valid) {
      pushToast(t.audioStudio.toasts.unsupportedTitle, t.audioStudio.toasts.unsupportedSub, 'error');
      return;
    }
    if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl);
    const url = URL.createObjectURL(file);
    setAudioObjectUrl(url);
    setAudioBlob(file);
    setAudioMimeType(file.type || 'audio/mpeg');
    setAudioFileName(file.name);
    if (!lectureTitle.trim()) {
      updateStudioDraft({
        lectureTitle: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' '),
      });
    }
    setIsPlaying(false);
    setCurrentSec(0);
    setDurationSec(0);
    setTranscribeError(null);
    setAiError(null);
    pushToast(t.audioStudio.toasts.audioLoadedTitle, file.name, 'info');
  };

  const togglePlayPause = () => {
    if (!audioObjectUrl || !audioElRef.current) return;
    if (isPlaying) {
      audioElRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleScrub = (sec: number) => {
    setCurrentSec(sec);
    if (audioElRef.current && audioObjectUrl) {
      audioElRef.current.currentTime = sec;
    }
  };

  const toggleMicRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      if (micTimerRef.current) window.clearInterval(micTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      pushToast(
        t.audioStudio.toasts.micUnavailableTitle,
        t.audioStudio.toasts.micUnavailableSub,
        'error'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        if (chunks.length > 0) {
          const mime = recorder.mimeType || 'audio/webm';
          const blob = new Blob(chunks, { type: mime });
          if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl);
          const url = URL.createObjectURL(blob);
          setAudioObjectUrl(url);
          setAudioBlob(blob);
          setAudioMimeType(mime);
          setAudioFileName(
            `Mic_Recording_${new Date().toISOString().slice(11, 19).replace(/:/g, '-')}.webm`
          );
          setDurationSec(recordingSeconds);
          pushToast(t.audioStudio.toasts.recordingReadyTitle, t.audioStudio.transcribeBtn, 'success');
        }
      };

      mediaRecorderRef.current = recorder;
      setRecordingSeconds(0);
      setIsRecording(true);
      micTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
      recorder.start();
    } catch {
      pushToast(t.audioStudio.toasts.micDeniedTitle, t.audioStudio.toasts.micDeniedSub, 'error');
    }
  };

  // Action Button 1: Transcribe Audio (shows warning toast if no audio uploaded)
  const handleTranscribeAudio = async () => {
    if (!audioBlob) {
      pushToast(
        t.audioStudio.uploadAudioWarningTitle,
        t.audioStudio.uploadAudioWarningSub,
        'error'
      );
      return;
    }
    setTranscribeError(null);
    setIsTranscribing(true);

    try {
      const audioBase64 = await blobToBase64(audioBlob);
      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType: audioMimeType,
          language,
        }),
      });

      const data = await parseApiJson<{ transcript: string }>(response);

      updateStudioDraft({ rawTranscript: data.transcript });
      pushToast(t.audioStudio.toasts.transcribeDoneTitle, t.audioStudio.generateNotesBtn, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transcription error';
      setTranscribeError(msg);
      pushToast('Transcription failed', msg, 'error');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Action Button 2: Generate AI Notes
  const handleGenerateNotes = async () => {
    if (!rawTranscript.trim()) return;
    setAiError(null);
    setIsGeneratingNotes(true);
    setLoadingStepIdx(0);
    const stepTimer1 = window.setTimeout(() => setLoadingStepIdx(1), 650);
    const stepTimer2 = window.setTimeout(() => setLoadingStepIdx(2), 1300);

    try {
      const response = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lectureTitle.trim(),
          transcript: rawTranscript.trim(),
          subject,
          depth,
          language,
          durationMinutes: Math.max(1, Math.round(durationSec / 60)),
        }),
      });

      const data = await parseApiJson<{ note: LectureNote }>(response);

      const nextNote: LectureNote = {
        ...data.note,
        id: generatedNote?.id || data.note.id,
        practiceQuestions:
          generatedNote && generatedNote.practiceQuestions.length > 0
            ? generatedNote.practiceQuestions
            : data.note.practiceQuestions,
        flashcards:
          generatedNote && generatedNote.flashcards.length > 0
            ? generatedNote.flashcards
            : data.note.flashcards,
      };

      addOrUpdateNote(nextNote);
      updateStudioDraft({
        activeNoteId: nextNote.id,
        lectureTitle: nextNote.title,
      });
      setActiveTab('notes');
      setActiveCardIndex(0);
      setIsCardFlipped(false);
      pushToast(t.audioStudio.toasts.notesReadyTitle, nextNote.title, 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Generation error';
      setAiError(message);
      pushToast('Generation failed', message, 'error');
    } finally {
      window.clearTimeout(stepTimer1);
      window.clearTimeout(stepTimer2);
      setIsGeneratingNotes(false);
    }
  };

  // Action Button 3: Generate Practical Tasks
  const handleGenerateTasks = async () => {
    if (!rawTranscript.trim()) return;
    setAiError(null);
    setIsGeneratingTasks(true);
    setLoadingStepIdx(0);
    const stepTimer1 = window.setTimeout(() => setLoadingStepIdx(1), 650);
    const stepTimer2 = window.setTimeout(() => setLoadingStepIdx(2), 1300);

    try {
      const response = await fetch('/api/ai/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lectureTitle.trim(),
          transcript: rawTranscript.trim(),
          subject,
          language,
        }),
      });

      const data = await parseApiJson<{
        practiceQuestions: LectureNote['practiceQuestions'];
        flashcards: LectureNote['flashcards'];
      }>(response);

      const nowId = Date.now();
      const nextNote: LectureNote = generatedNote
        ? {
            ...generatedNote,
            rawTranscript: rawTranscript.trim(),
            practiceQuestions: data.practiceQuestions || [],
            flashcards:
              Array.isArray(data.flashcards) && data.flashcards.length > 0
                ? data.flashcards
                : generatedNote.flashcards,
          }
        : {
            id: `note-${nowId}`,
            title: lectureTitle.trim() || 'Practical Study Session',
            subject,
            durationMinutes: Math.max(1, Math.round(durationSec / 60)),
            createdAt: new Date().toISOString().slice(0, 10),
            language,
            depth,
            engine: 'gemini',
            rawTranscript: rawTranscript.trim(),
            executiveSummary: '',
            keyTakeaways: [],
            sections: [],
            practiceQuestions: data.practiceQuestions || [],
            flashcards: data.flashcards || [],
          };

      addOrUpdateNote(nextNote);
      updateStudioDraft({
        activeNoteId: nextNote.id,
        lectureTitle: nextNote.title,
      });
      setActiveTab('practice');
      setOpenQuestionIds({});
      setActiveCardIndex(0);
      setIsCardFlipped(false);
      pushToast(
        t.audioStudio.toasts.tasksReadyTitle,
        `${nextNote.practiceQuestions.length}`,
        'success'
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Tasks generation error';
      setAiError(message);
      pushToast('Generation failed', message, 'error');
    } finally {
      window.clearTimeout(stepTimer1);
      window.clearTimeout(stepTimer2);
      setIsGeneratingTasks(false);
    }
  };

  const handleCopyMarkdown = async () => {
    if (!generatedNote) return;
    const md = formatLectureToMarkdown(generatedNote);
    try {
      await navigator.clipboard.writeText(md);
      pushToast(
        t.audioStudio.toasts.markdownCopiedTitle,
        t.audioStudio.toasts.markdownCopiedSub,
        'success'
      );
    } catch {
      pushToast('Copy unavailable', 'Clipboard access is restricted.', 'info');
    }
  };

  const handleExportDoc = () => {
    if (!generatedNote) return;
    const md = formatLectureToMarkdown(generatedNote);
    const htmlContent = `<!doctype html><html><head><meta charset="utf-8"><title>${generatedNote.title}</title><style>body{font-family:Arial,sans-serif;max-width:780px;margin:40px auto;line-height:1.6;color:#111}pre{white-space:pre-wrap;font-family:inherit}</style></head><body><h1>${generatedNote.title}</h1><pre>${md.replace(/</g, '&lt;')}</pre></body></html>`;
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedNote.title.slice(0, 40).replace(/\s+/g, '_')}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast(t.audioStudio.toasts.docExportedTitle, t.audioStudio.toasts.docExportedSub, 'success');
  };

  const progressRatio = durationSec > 0 ? currentSec / durationSec : 0;
  const activeFlashcard = generatedNote?.flashcards[activeCardIndex] || null;
  const hasTranscriptText = rawTranscript.trim().length > 0;
  const isBusy = isGeneratingNotes || isGeneratingTasks;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-50">
          {t.audioStudio.title}
        </h1>
        <p className="text-sm text-zinc-400 mt-1">{t.audioStudio.subtitle}</p>
      </div>

      {/* Top Split: Upload / Record Area (Left 5) + Editable Transcript Textarea & Actions (Right 7) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-5 space-y-5 min-w-0">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className={`rounded-2xl border p-5 backdrop-blur-xl transition-colors ${
              dragOver
                ? 'border-indigo-400 bg-indigo-500/10'
                : 'border-white/10 bg-[#111114]/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.m4a,.ogg,.webm,audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />

            {audioObjectUrl && (
              <audio
                ref={audioElRef}
                src={audioObjectUrl}
                onLoadedMetadata={(e) => {
                  const d = e.currentTarget.duration;
                  if (Number.isFinite(d) && d > 0) setDurationSec(Math.round(d));
                }}
                onTimeUpdate={(e) => setCurrentSec(Math.floor(e.currentTarget.currentTime))}
                onEnded={() => setIsPlaying(false)}
              />
            )}

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shrink-0">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-zinc-100 truncate">
                  {audioFileName || t.audioStudio.uploadDropTitle}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">{t.audioStudio.uploadDropSub}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/15 bg-[#18181D] hover:bg-white/[0.06] text-xs font-medium text-zinc-100 transition-all active:scale-95 whitespace-nowrap"
              >
                <FileAudio className="h-3.5 w-3.5 text-indigo-400" />
                <span>{t.audioStudio.selectFileBtn}</span>
              </button>

              <button
                type="button"
                onClick={toggleMicRecording}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 whitespace-nowrap ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'border border-white/15 bg-[#18181D] hover:bg-white/[0.06] text-zinc-100'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-3.5 w-3.5" />
                    <span>
                      {t.audioStudio.stopMicBtn} ({formatSecondsToMMSS(recordingSeconds)})
                    </span>
                  </>
                ) : (
                  <>
                    <Mic className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{t.audioStudio.recordMicBtn}</span>
                  </>
                )}
              </button>
            </div>

            {/* Waveform & Playback Controls */}
            <div className="mt-5 rounded-xl border border-white/10 bg-[#09090B] p-3.5 sm:p-4 space-y-3 overflow-hidden">
              <div
                aria-label="Audio waveform visualizer"
                className="flex items-center justify-between gap-[2px] sm:gap-1 h-16 px-0.5 sm:px-1 w-full min-w-0 overflow-hidden"
              >
                {WAVEFORM_BARS.map((heightPct, idx) => {
                  const barRatio = idx / WAVEFORM_BARS.length;
                  const passed = audioObjectUrl && barRatio <= progressRatio;
                  const height = isRecording
                    ? Math.max(20, (heightPct + ((recordingSeconds * 17 + idx * 13) % 45)) % 95)
                    : audioObjectUrl
                      ? isPlaying
                        ? Math.max(20, (heightPct + ((currentSec * 11 + idx * 7) % 30)) % 95)
                        : heightPct
                      : 18;

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!audioObjectUrl}
                      aria-label={`Jump to ${Math.round(barRatio * 100)}%`}
                      onClick={() => handleScrub(Math.round(barRatio * durationSec))}
                      className="flex-1 min-w-0 h-full flex items-center justify-center group disabled:cursor-default"
                    >
                      <span
                        className={`w-full max-w-[3px] sm:max-w-[4px] rounded-full transition-all duration-150 ${
                          isRecording
                            ? 'bg-rose-400'
                            : passed
                              ? 'bg-indigo-400'
                              : audioObjectUrl
                                ? 'bg-zinc-600 group-hover:bg-zinc-400'
                                : 'bg-zinc-800'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min={0}
                  max={Math.max(1, durationSec)}
                  disabled={!audioObjectUrl}
                  value={Math.min(durationSec, Math.floor(currentSec))}
                  onChange={(e) => handleScrub(Number(e.target.value))}
                  aria-label="Audio timestamp scrubber"
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 disabled:opacity-40"
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!audioObjectUrl}
                      onClick={togglePlayPause}
                      aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors"
                    >
                      {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    </button>
                    <span className="text-xs font-mono tabular-nums text-zinc-300">
                      {formatSecondsToMMSS(currentSec)} / {formatSecondsToMMSS(durationSec)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#141418] border border-white/10">
                    {([1, 1.5, 2] as const).map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        disabled={!audioObjectUrl}
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-2 py-1 rounded text-[11px] font-mono tabular-nums transition-colors disabled:opacity-40 ${
                          playbackSpeed === spd
                            ? 'bg-indigo-600 text-white'
                            : 'text-zinc-400 hover:text-zinc-100'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button 1: Transcribe Audio (triggers warning toast if no audio) */}
            <div className="mt-4 space-y-2.5">
              <button
                type="button"
                disabled={isTranscribing || isRecording}
                onClick={handleTranscribeAudio}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-xs font-semibold text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                {isTranscribing ? (
                  <>
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    <span>{t.audioStudio.transcribingLabel}</span>
                  </>
                ) : (
                  <span>{t.audioStudio.transcribeBtn}</span>
                )}
              </button>

              {transcribeError && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200"
                >
                  {transcribeError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Always-editable Empty Transcript Textarea + Action Buttons 2 & 3 */}
        <div className="xl:col-span-7 min-w-0 rounded-2xl border border-white/10 bg-[#111114]/80 backdrop-blur-xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold text-zinc-100">
              {t.audioStudio.transcriptTitle}
            </h2>

            <select
              value={subject}
              onChange={(e) =>
                updateStudioDraft({ subject: e.target.value as SubjectCategory })
              }
              aria-label={t.projectPlanner.subjectLabel}
              className="w-full sm:w-auto max-w-full rounded-lg border border-white/10 bg-[#16161B] px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
            >
              {SUBJECT_CATEGORIES.map((sub) => (
                <option key={sub} value={sub}>
                  {t.subjects[sub]}
                </option>
              ))}
            </select>
          </div>

          <input
            type="text"
            value={lectureTitle}
            onChange={(e) => updateStudioDraft({ lectureTitle: e.target.value })}
            aria-label={t.audioStudio.lectureTitlePlaceholder}
            placeholder={t.audioStudio.lectureTitlePlaceholder}
            className="w-full rounded-xl border border-white/10 bg-[#09090B]/90 px-3.5 py-2 text-sm font-medium text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
          />

          <textarea
            data-testid="transcript-textarea"
            rows={9}
            value={rawTranscript}
            readOnly={isTranscribing}
            onChange={(e) => updateStudioDraft({ rawTranscript: e.target.value })}
            placeholder={t.audioStudio.transcriptPlaceholder}
            aria-label={t.audioStudio.transcriptTitle}
            className="w-full rounded-xl border border-white/10 bg-[#09090B]/90 p-4 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 leading-relaxed focus:outline-none focus:border-indigo-500 font-sans"
          />

          {/* Depth Selector + Action Buttons 2 & 3 */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-medium text-zinc-400">
                {t.audioStudio.depthLabel}
              </span>
              <div
                data-testid="depth-selector"
                className="grid grid-cols-3 sm:inline-flex w-full sm:w-auto p-1 rounded-xl bg-[#09090B]/90 border border-white/10 gap-1"
              >
                {(
                  [
                    { id: 'concise', label: t.audioStudio.depthConcise },
                    { id: 'deep', label: t.audioStudio.depthDeep },
                    { id: 'exam', label: t.audioStudio.depthExam },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => updateStudioDraft({ depth: d.id as NotesDepth })}
                    className={`flex items-center justify-center px-2 sm:px-3 py-2 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium text-center leading-tight whitespace-normal sm:whitespace-nowrap transition-all active:scale-95 ${
                      depth === d.id
                        ? 'bg-zinc-800 text-zinc-100 border border-white/15'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <button
                type="button"
                disabled={!hasTranscriptText || isBusy}
                onClick={handleGenerateNotes}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:shadow-none disabled:cursor-not-allowed text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 whitespace-nowrap sm:shrink-0 active:scale-95 transition-all"
              >
                <span>{t.audioStudio.generateNotesBtn}</span>
              </button>

              <button
                type="button"
                disabled={!hasTranscriptText || isBusy}
                onClick={handleGenerateTasks}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-emerald-500/40 bg-emerald-600/20 hover:bg-emerald-600/30 disabled:border-white/10 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold text-emerald-200 text-center leading-snug active:scale-95 transition-all"
              >
                <span>
                  {isGeneratingTasks
                    ? t.audioStudio.generatingTasksLabel
                    : t.audioStudio.generateTasksBtn}
                </span>
              </button>
            </div>
          </div>

          {aiError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200"
            >
              {aiError}
            </div>
          )}
        </div>
      </div>

      {/* Output Section (Empty until generation buttons are clicked) */}
      {isBusy ? (
        <section
          aria-busy="true"
          className="rounded-2xl border border-white/10 bg-[#111114]/80 backdrop-blur-xl p-8 space-y-5"
        >
          <div className="flex items-center gap-3">
            <RotateCw className="h-5 w-5 text-indigo-400 animate-spin" />
            <p className="text-sm font-medium text-indigo-200">
              {t.audioStudio.loadingSteps[loadingStepIdx]}
            </p>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-2/3 rounded bg-white/10 animate-pulse" />
            <div className="h-3 w-full rounded bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-5/6 rounded bg-white/[0.06] animate-pulse" />
          </div>
        </section>
      ) : generatedNote ? (
        <section className="rounded-2xl border border-white/10 bg-[#111114]/80 backdrop-blur-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 px-6 py-4 bg-[#0E0E12]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="text-indigo-300 font-medium">
                  {t.subjects[generatedNote.subject] || generatedNote.subject}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {generatedNote.depth === 'concise'
                    ? t.audioStudio.depthConcise
                    : generatedNote.depth === 'exam'
                      ? t.audioStudio.depthExam
                      : t.audioStudio.depthDeep}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">Gemini 2.5 Flash</span>
              </div>
              <h2 className="font-display text-lg font-bold text-zinc-50 mt-0.5 truncate">
                {generatedNote.title}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-[#18181D] hover:border-white/20 text-xs font-medium text-zinc-200 whitespace-nowrap"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{t.audioStudio.copyMarkdown}</span>
              </button>
              <button
                type="button"
                onClick={handleExportDoc}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-[#18181D] hover:border-white/20 text-xs font-medium text-zinc-200 whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.audioStudio.exportDoc}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-white/10 px-6 py-3 overflow-x-auto">
            {(
              [
                { id: 'notes', label: t.audioStudio.tabNotes },
                {
                  id: 'practice',
                  label: `${t.audioStudio.tabPractice} (${generatedNote.practiceQuestions.length})`,
                },
                {
                  id: 'flashcards',
                  label: `${t.audioStudio.tabFlashcards} (${generatedNote.flashcards.length})`,
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'notes' && (
              <div className="space-y-6">
                {generatedNote.sections.length === 0 && !generatedNote.executiveSummary ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-[#0D0D10]/80 p-8 text-center space-y-2">
                    <FileText className="h-6 w-6 text-zinc-500 mx-auto" />
                    <p className="text-xs text-zinc-400">{t.audioStudio.notesPromptHint}</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border border-white/10 bg-[#16161B] p-5 space-y-3">
                      <p className="text-sm text-zinc-200 leading-relaxed">
                        {generatedNote.executiveSummary}
                      </p>
                      {generatedNote.keyTakeaways.length > 0 && (
                        <div className="pt-2 border-t border-white/10 space-y-1.5">
                          {generatedNote.keyTakeaways.map((tk, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{tk}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {generatedNote.sections.map((section) => (
                        <div
                          key={section.id}
                          className="rounded-xl border border-white/10 bg-[#141418] p-5 space-y-3"
                        >
                          <h3 className="font-display text-base font-semibold text-zinc-100">
                            {section.heading}
                          </h3>
                          <p className="text-xs text-zinc-400 leading-relaxed">{section.summary}</p>
                          <ul className="space-y-2">
                            {section.keyPoints.map((pt, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-xs text-zinc-200 leading-relaxed"
                              >
                                <span className="text-indigo-400 font-bold mt-0.5">•</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                          {section.callout && (
                            <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/[0.07] p-3.5 mt-2">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                                <Lightbulb className="h-3.5 w-3.5" />
                                <span>{section.callout.title}</span>
                              </div>
                              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                                {section.callout.content}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'practice' && (
              <div className="space-y-4">
                {generatedNote.practiceQuestions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-[#0D0D10]/80 p-8 text-center">
                    <p className="text-xs text-zinc-400">{t.audioStudio.tasksPromptHint}</p>
                  </div>
                ) : (
                  generatedNote.practiceQuestions.map((q, idx) => {
                    const isOpen = Boolean(openQuestionIds[q.id]);
                    const showHint = Boolean(showHintIds[q.id]);
                    return (
                      <div
                        key={q.id}
                        className="rounded-xl border border-white/10 bg-[#16161B] p-5 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-sm font-semibold text-zinc-100 leading-snug">
                            {idx + 1}. {q.question}
                          </h3>
                          <span className="text-xs font-mono text-indigo-300 shrink-0">
                            {q.difficulty}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() =>
                              setOpenQuestionIds((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-medium text-indigo-200 transition-colors"
                          >
                            {isOpen ? (
                              <>
                                <ChevronUp className="h-3.5 w-3.5" />
                                <span>{t.audioStudio.hideAnswer}</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3.5 w-3.5" />
                                <span>{t.audioStudio.revealAnswer}</span>
                              </>
                            )}
                          </button>

                          {q.hint && (
                            <button
                              type="button"
                              onClick={() =>
                                setShowHintIds((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                              }
                              className="text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-4"
                            >
                              {showHint ? q.hint : t.audioStudio.hintLabel}
                            </button>
                          )}
                        </div>

                        {isOpen && (
                          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4 space-y-1.5">
                            <p className="text-sm font-semibold text-emerald-300">{q.answer}</p>
                            <p className="text-xs text-zinc-300 leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'flashcards' && activeFlashcard && (
              <div className="space-y-6">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono tabular-nums">
                    <span>
                      {t.audioStudio.cardLabel} {activeCardIndex + 1} /{' '}
                      {generatedNote.flashcards.length}
                    </span>
                    <span>
                      {Object.values(masteredIds).filter(Boolean).length}{' '}
                      {t.audioStudio.masteredLabel}
                    </span>
                  </div>

                  <div className="perspective-1000">
                    <button
                      type="button"
                      onClick={() => setIsCardFlipped((f) => !f)}
                      aria-label={`Flip flashcard ${activeFlashcard.term}`}
                      className="relative w-full h-60 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl"
                    >
                      <div
                        className={`relative w-full h-full transition-transform duration-500 preserve-3d ${
                          isCardFlipped ? 'rotate-y-180' : ''
                        }`}
                      >
                        <div className="absolute inset-0 backface-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#181822] to-[#111116] p-6 flex flex-col justify-between">
                          <span className="text-xs font-mono text-indigo-400">
                            {t.audioStudio.termLabel}
                          </span>
                          <div className="text-center font-display text-2xl font-bold text-zinc-50 px-4">
                            {activeFlashcard.term}
                          </div>
                          <span className="text-xs text-zinc-500 text-center">
                            {t.audioStudio.flipCardHint}
                          </span>
                        </div>

                        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#121D1A] to-[#111116] p-6 flex flex-col justify-between">
                          <span className="text-xs font-mono text-emerald-400">
                            {t.audioStudio.definitionLabel}
                          </span>
                          <div className="space-y-2 text-center px-3">
                            <p className="text-base font-medium text-zinc-100 leading-relaxed">
                              {activeFlashcard.definition}
                            </p>
                            {activeFlashcard.example && (
                              <p className="text-xs text-zinc-400">{activeFlashcard.example}</p>
                            )}
                          </div>
                          <span className="text-xs text-zinc-500 text-center">
                            {t.audioStudio.flipCardHint}
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCardFlipped(false);
                        setActiveCardIndex((i) =>
                          i === 0 ? generatedNote.flashcards.length - 1 : i - 1
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-[#16161B] hover:border-white/20 text-xs font-medium text-zinc-200"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>{t.audioStudio.prevCard}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setMasteredIds((prev) => ({
                          ...prev,
                          [activeFlashcard.id]: !prev[activeFlashcard.id],
                        }))
                      }
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        masteredIds[activeFlashcard.id]
                          ? 'bg-emerald-600 text-white'
                          : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{t.audioStudio.markMastered}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCardFlipped(false);
                        setActiveCardIndex((i) => (i + 1) % generatedNote.flashcards.length);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-[#16161B] hover:border-white/20 text-xs font-medium text-zinc-200"
                    >
                      <span>{t.audioStudio.nextCard}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section
          data-testid="empty-notes-output"
          className="rounded-2xl border border-dashed border-white/10 bg-[#111114]/80 backdrop-blur-xl p-10 text-center space-y-2.5"
        >
          <Sparkles className="h-7 w-7 text-zinc-600 mx-auto" />
          <h2 className="font-display text-base font-semibold text-zinc-200">
            {t.audioStudio.outputEmptyTitle}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
            {t.audioStudio.outputEmptySub}
          </p>
        </section>
      )}
    </div>
  );
}
