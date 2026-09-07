import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'primary' | 'danger' | 'success';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm Validation',
  cancelText = 'Cancel',
  type = 'primary',
  loading = false
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    primary: {
      icon: <CheckCircle2 className="w-7 h-7 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-100',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
    },
    danger: {
      icon: <AlertTriangle className="w-7 h-7 text-rose-600" />,
      bg: 'bg-rose-50 border-rose-100',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
    },
    success: {
      icon: <CheckCircle2 className="w-7 h-7 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
    }
  }[type];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 overflow-hidden transform transition-all">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl border ${typeConfig.bg} shrink-0`}>
            {typeConfig.icon}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-slate-900">{title}</h4>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{message}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 ${typeConfig.btn}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
