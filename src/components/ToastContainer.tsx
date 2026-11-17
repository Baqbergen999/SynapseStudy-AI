import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export function ToastContainer() {
  const { toasts, dismissToast } = useStudy();
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 rounded-xl border border-white/15 bg-[#141418]/95 backdrop-blur-md px-4 py-3 shadow-2xl transition-all duration-200"
        >
          {toast.variant === 'success' && (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          )}
          {toast.variant === 'error' && (
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          {toast.variant === 'info' && (
            <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-100">{toast.title}</p>
            {toast.description && (
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{toast.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="text-zinc-500 hover:text-zinc-200 transition-colors p-0.5 rounded"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
