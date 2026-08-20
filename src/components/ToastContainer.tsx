import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-notifications-container"
      className="fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderColor = 'border-emerald-500/40';
        let bgColor = 'bg-white/95 dark:bg-slate-900/95';
        let iconColor = 'text-emerald-600 dark:text-emerald-400';

        if (toast.type === 'error') {
          Icon = XCircle;
          borderColor = 'border-rose-500/50';
          iconColor = 'text-rose-600 dark:text-rose-400';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderColor = 'border-amber-500/50';
          iconColor = 'text-amber-600 dark:text-amber-400';
        } else if (toast.type === 'info') {
          Icon = Info;
          borderColor = 'border-cyan-500/50';
          iconColor = 'text-cyan-600 dark:text-cyan-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border ${borderColor} ${bgColor} shadow-2xl backdrop-blur-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-5`}
          >
            <Icon className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`} />
            <div className="flex-1 text-right">
              <h5 className="text-sm font-bold text-slate-900 dark:text-white">{toast.title}</h5>
              {toast.message && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
