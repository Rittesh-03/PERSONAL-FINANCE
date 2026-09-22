import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X, PiggyBank, Sparkles } from 'lucide-react';

export const DepositModal: React.FC = () => {
  const {
    isDepositModalOpen,
    depositGoal,
    closeDepositModal,
    contributeToGoal,
    accounts,
    settings,
    formatMoney,
  } = useFinance();

  const [amount, setAmount] = useState('250');
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');

  if (!isDepositModalOpen || !depositGoal) return null;

  const eligibleAccounts = accounts.filter(
    (a) => a.type === 'checking' || a.type === 'savings' || a.type === 'wallet'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0 || !fromAccountId) return;

    const ok = contributeToGoal(depositGoal.id, num, fromAccountId);
    if (ok) {
      closeDepositModal();
    }
  };

  const remaining = Math.max(0, depositGoal.targetAmount - depositGoal.currentAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="deposit-modal"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Deposit Funds
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-none">{depositGoal.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDepositModal}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-500">Remaining to target:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {formatMoney(remaining)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Deposit Amount ({settings.currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-lg font-bold min-h-[44px]"
              />
            </div>

            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-2 mt-2">
              {(settings.currency === 'INR' ? [500, 1000, 2500, 5000] : [50, 100, 250, 500]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors touch-manipulation min-h-[36px] flex items-center cursor-pointer"
                >
                  +{settings.currencySymbol}{preset.toLocaleString(settings.currency === 'INR' ? 'en-IN' : undefined)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Source Account
            </label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            >
              {eligibleAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatMoney(acc.balance)})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={closeDepositModal}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[42px] touch-manipulation cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs min-h-[42px] touch-manipulation cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Confirm Deposit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
