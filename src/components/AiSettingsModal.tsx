import { X, Cpu, Globe, Sliders } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import type { Language, NotesDepth } from '../types/study';

export function AiSettingsModal() {
  const {
    settingsOpen,
    setSettingsOpen,
    hasServerKey,
    language,
    setLanguage,
    defaultDepth,
    setDefaultDepth,
    t,
  } = useStudy();

  if (!settingsOpen) return null;

  const langs: { value: Language; label: string }[] = [
    { value: 'kk', label: 'Қазақша (KK)' },
    { value: 'ru', label: 'Русский (RU)' },
    { value: 'en', label: 'English (EN)' },
  ];

  const depths: { value: NotesDepth; label: string }[] = [
    { value: 'concise', label: t.audioStudio.depthConcise },
    { value: 'deep', label: t.audioStudio.depthDeep },
    { value: 'exam', label: t.audioStudio.depthExam },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111114] shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <h2 id="ai-settings-title" className="text-lg font-semibold text-zinc-100">
              {t.settings.title}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">{t.settings.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(false)}
            aria-label="Close AI settings"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-zinc-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Server Environment Status */}
          <div className="rounded-xl border border-white/10 bg-[#18181D] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Cpu className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-medium text-zinc-300">
                  {t.settings.engineStatusLabel}
                </span>
              </div>
              <span
                className={`text-xs font-medium ${
                  hasServerKey ? 'text-emerald-400' : 'text-amber-300'
                }`}
              >
                {hasServerKey ? t.settings.serverKeyAvailable : t.settings.serverKeyMissing}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Transcription: <span className="font-mono text-zinc-200">gemini-3.5-transcribe</span> ·
              Notes & Planner: <span className="font-mono text-zinc-200">gemini-2.5-flash</span>
            </p>
          </div>

          {/* Default Language */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-2">
              <Globe className="h-3.5 w-3.5 text-zinc-400" />
              {t.settings.outputLanguageLabel}
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[#16161B] border border-white/10">
              {langs.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setLanguage(item.value)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    language === item.value
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Default Depth */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-2">
              <Sliders className="h-3.5 w-3.5 text-zinc-400" />
              {t.settings.defaultDepthLabel}
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#16161B] border border-white/10">
              {depths.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDefaultDepth(d.value)}
                  className={`py-2 px-1.5 sm:px-2 rounded-lg text-[11px] sm:text-xs font-medium text-center leading-tight whitespace-normal transition-colors ${
                    defaultDepth === d.value
                      ? 'bg-zinc-800 text-zinc-100 border border-white/15'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-white/10 px-6 py-4 bg-[#0D0D10]">
          <button
            type="button"
            onClick={() => setSettingsOpen(false)}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors whitespace-nowrap"
          >
            {t.settings.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
