import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X } from 'lucide-react';

export const BudgetModal: React.FC = () => {
  const {
    isBudgetModalOpen,
    editingBudget,
    closeBudgetModal,
    addBudget,
    updateBudget,
    categories,
    settings,
  } = useFinance();

  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'custom'>('monthly');
  const [alertThreshold, setAlertThreshold] = useState(0.85);

  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');

  useEffect(() => {
    if (editingBudget) {
      setCategory(editingBudget.category);
      setLimit(editingBudget.limit.toString());
      setPeriod(editingBudget.period);
      setAlertThreshold(editingBudget.alertThreshold || 0.85);
    } else {
      setCategory(expenseCategories[0]?.name || 'Food & Dining');
      setLimit('');
      setPeriod('monthly');
      setAlertThreshold(0.85);
    }
  }, [editingBudget, isBudgetModalOpen]);

  if (!isBudgetModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limit);
    if (!category || isNaN(numLimit) || numLimit <= 0) return;

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        category,
        limit: numLimit,
        period,
        alertThreshold,
      });
    } else {
      addBudget({
        category,
        limit: numLimit,
        period,
        alertThreshold,
      });
    }
    closeBudgetModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="budget-modal"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {editingBudget ? 'Adjust Budget Limit' : 'Create Category Budget'}
          </h2>
          <button
            type="button"
            onClick={closeBudgetModal}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              disabled={Boolean(editingBudget)}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Monthly Spending Limit ({settings.currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="1"
                required
                placeholder="500"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Budget Period
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPeriod('monthly')}
                className={`py-2.5 px-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all touch-manipulation min-h-[42px] cursor-pointer ${
                  period === 'monthly'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Monthly Auto-Renew
              </button>
              <button
                type="button"
                onClick={() => setPeriod('custom')}
                className={`py-2.5 px-2 text-xs sm:text-sm font-semibold rounded-xl border transition-all touch-manipulation min-h-[42px] cursor-pointer ${
                  period === 'custom'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Custom Term
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Warning Threshold
              </label>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round(alertThreshold * 100)}% of limit
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <p className="text-xs text-slate-400 mt-1">
              You will receive an in-app alert when spending crosses this percentage.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={closeBudgetModal}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[42px] touch-manipulation cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs min-h-[42px] touch-manipulation cursor-pointer"
            >
              {editingBudget ? 'Update Budget' : 'Establish Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
