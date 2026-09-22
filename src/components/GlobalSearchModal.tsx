import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Search, X, ArrowRight, CreditCard, Receipt, Target, PieChart } from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    transactions,
    accounts,
    budgets,
    goals,
    setActiveView,
    formatMoney,
  } = useFinance();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Keyboard shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedTransactions = q
    ? transactions.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q))
      ).slice(0, 5)
    : [];

  const matchedAccounts = q
    ? accounts.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.institution.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q)
      )
    : [];

  const matchedBudgets = q
    ? budgets.filter((b) => b.category.toLowerCase().includes(q))
    : [];

  const matchedGoals = q
    ? goals.filter((g) => g.name.toLowerCase().includes(q) || g.category.toLowerCase().includes(q))
    : [];

  const hasResults =
    matchedTransactions.length > 0 ||
    matchedAccounts.length > 0 ||
    matchedBudgets.length > 0 ||
    matchedGoals.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="global-search-dialog"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search transactions, accounts, budgets, savings goals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-base font-medium focus:outline-hidden"
          />
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-1"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {!q && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Type keywords such as "Salary", "Chase", "Dining", or "Emergency" to find records quickly.
            </div>
          )}

          {q && !hasResults && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              No financial records found matching "{query}".
            </div>
          )}

          {/* Transactions */}
          {matchedTransactions.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                Transactions ({matchedTransactions.length})
              </div>
              <div className="space-y-1">
                {matchedTransactions.map((tx) => (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => {
                      setActiveView('transactions');
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {tx.title}
                        </div>
                        <div className="text-xs text-slate-400">
                          {tx.date} • {tx.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-bold ${
                          tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatMoney(tx.amount)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Accounts */}
          {matchedAccounts.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                Accounts ({matchedAccounts.length})
              </div>
              <div className="space-y-1">
                {matchedAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      setActiveView('accounts');
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: acc.color }}
                      >
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {acc.name}
                        </div>
                        <div className="text-xs text-slate-400">{acc.institution}</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatMoney(acc.balance)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Budgets */}
          {matchedBudgets.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                Budgets ({matchedBudgets.length})
              </div>
              <div className="space-y-1">
                {matchedBudgets.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setActiveView('budgets');
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                        <PieChart className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {b.category}
                        </div>
                        <div className="text-xs text-slate-400">
                          {formatMoney(b.spent)} of {formatMoney(b.limit)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {Math.round((b.spent / b.limit) * 100)}% used
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Goals */}
          {matchedGoals.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                Savings Goals ({matchedGoals.length})
              </div>
              <div className="space-y-1">
                {matchedGoals.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setActiveView('goals');
                      setIsSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {g.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          Target: {formatMoney(g.targetAmount)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {Math.round((g.currentAmount / g.targetAmount) * 100)}%
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
