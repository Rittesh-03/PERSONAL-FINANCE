import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useFinance();

  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 pointer-events-none max-w-sm w-full"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = CheckCircle2;
          let iconColor = 'text-emerald-500';
          let borderColor = 'border-emerald-200 dark:border-emerald-800/50';

          if (toast.type === 'error') {
            Icon = AlertCircle;
            iconColor = 'text-rose-500';
            borderColor = 'border-rose-200 dark:border-rose-800/50';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            iconColor = 'text-amber-500';
            borderColor = 'border-amber-200 dark:border-amber-800/50';
          } else if (toast.type === 'info') {
            Icon = Info;
            iconColor = 'text-blue-500';
            borderColor = 'border-blue-200 dark:border-blue-800/50';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl shadow-lg border ${borderColor} text-slate-900 dark:text-slate-100`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
