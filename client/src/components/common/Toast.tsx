import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        const config = {
          success: {
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
            border: 'border-emerald-200',
            bg: 'bg-emerald-50/90'
          },
          error: {
            icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
            border: 'border-rose-200',
            bg: 'bg-rose-50/90'
          },
          warning: {
            icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
            border: 'border-amber-200',
            bg: 'bg-amber-50/90'
          },
          info: {
            icon: <Info className="w-5 h-5 text-blue-500" />,
            border: 'border-blue-200',
            bg: 'bg-blue-50/90'
          }
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border ${config.border} transition-all transform animate-in slide-in-from-bottom-2`}
          >
            <div className="shrink-0 mt-0.5">{config.icon}</div>
            <div className="flex-1">
              <h5 className="text-sm font-semibold text-slate-900">{toast.title}</h5>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
