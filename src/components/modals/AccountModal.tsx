import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X } from 'lucide-react';
import { AccountType } from '../../types';

export const AccountModal: React.FC = () => {
  const {
    isAccountModalOpen,
    editingAccount,
    closeAccountModal,
    addAccount,
    updateAccount,
    settings,
  } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [balance, setBalance] = useState('');
  const [institution, setInstitution] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [color, setColor] = useState('#2563eb');

  const COLOR_OPTIONS = ['#2563eb', '#059669', '#7c3aed', '#475569', '#0d9488', '#d97706', '#dc2626'];

  useEffect(() => {
    if (editingAccount) {
      setName(editingAccount.name);
      setType(editingAccount.type);
      setBalance(editingAccount.balance.toString());
      setInstitution(editingAccount.institution);
      setCreditLimit(editingAccount.creditLimit ? editingAccount.creditLimit.toString() : '');
      setColor(editingAccount.color);
    } else {
      setName('');
      setType('checking');
      setBalance('1000');
      setInstitution('Chase Bank');
      setCreditLimit('');
      setColor('#2563eb');
    }
  }, [editingAccount, isAccountModalOpen]);

  if (!isAccountModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numBalance = parseFloat(balance);
    if (!name.trim() || isNaN(numBalance) || !institution.trim()) return;

    const numLimit = creditLimit ? parseFloat(creditLimit) : undefined;

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name: name.trim(),
        type,
        balance: numBalance,
        institution: institution.trim(),
        creditLimit: numLimit,
        color,
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        balance: numBalance,
        institution: institution.trim(),
        currency: settings.currency,
        creditLimit: numLimit,
        color,
        accountNumber: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
      });
    }
    closeAccountModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="account-modal"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {editingAccount ? 'Edit Financial Account' : 'Connect New Account'}
          </h2>
          <button
            type="button"
            onClick={closeAccountModal}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Account Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Everyday Checking, Sapphire Credit Card"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Account Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              >
                <option value="checking">Checking</option>
                <option value="savings">High-Yield Savings</option>
                <option value="credit">Credit Card</option>
                <option value="investment">Investment / Brokerage</option>
                <option value="wallet">Digital Wallet</option>
                <option value="cash">Cash Reserve</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Financial Institution
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Chase, Vanguard, Fidelity"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {type === 'credit' ? 'Current Balance (Negative)' : 'Starting Balance'} ({settings.currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              />
            </div>

            {type === 'credit' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Credit Limit ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  step="1"
                  placeholder="10000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Card Color Accent
            </label>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-full transition-transform touch-manipulation cursor-pointer ${
                    color === c ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : 'hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={closeAccountModal}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[42px] touch-manipulation cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs min-h-[42px] touch-manipulation cursor-pointer"
            >
              {editingAccount ? 'Save Account' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
