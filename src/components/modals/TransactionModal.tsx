import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { TransactionType } from '../../types';

export const TransactionModal: React.FC = () => {
  const {
    isTransactionModalOpen,
    editingTransaction,
    closeTransactionModal,
    addTransaction,
    updateTransaction,
    categories,
    accounts,
    settings,
  } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount.toString());
      setDate(editingTransaction.date);
      setCategory(editingTransaction.category);
      setAccountId(editingTransaction.accountId);
      setPaymentMethod(editingTransaction.paymentMethod || 'Credit Card');
      setNotes(editingTransaction.notes || '');
      setIsRecurring(Boolean(editingTransaction.isRecurring));
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory(categories.find((c) => c.type === 'expense')?.name || 'Food & Dining');
      setAccountId(accounts[0]?.id || '');
      setPaymentMethod('Credit Card');
      setNotes('');
      setIsRecurring(false);
    }
  }, [editingTransaction, isTransactionModalOpen, categories, accounts]);

  if (!isTransactionModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type,
        title: title.trim(),
        amount: numAmount,
        date,
        category,
        accountId,
        paymentMethod,
        notes: notes.trim() || undefined,
        isRecurring,
      });
    } else {
      addTransaction({
        type,
        title: title.trim(),
        amount: numAmount,
        date,
        category,
        accountId,
        paymentMethod,
        notes: notes.trim() || undefined,
        isRecurring,
        status: 'completed',
      });
    }

    closeTransactionModal();
  };

  const filteredCategories = categories.filter((c) => c.type === type || c.type === 'both');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="transaction-modal"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
          </h2>
          <button
            type="button"
            onClick={closeTransactionModal}
            aria-label="Close modal"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto">
          {/* Type Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory(categories.find((c) => c.type === 'expense')?.name || 'Food & Dining');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-2 text-sm font-semibold rounded-lg transition-all touch-manipulation min-h-[40px] ${
                type === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory(categories.find((c) => c.type === 'income')?.name || 'Salary');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-2 text-sm font-semibold rounded-lg transition-all touch-manipulation min-h-[40px] ${
                type === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Income
            </button>
          </div>

          {/* Amount and Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Amount ({settings.currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-base min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-base sm:text-sm min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Description / Payee
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Whole Foods Groceries, Client Retainer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-base sm:text-sm min-h-[44px]"
            />
          </div>

          {/* Category and Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-base sm:text-sm min-h-[44px]"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Account
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-base sm:text-sm min-h-[44px]"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({settings.currencySymbol}{acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment method & Recurring */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-base sm:text-sm min-h-[44px]"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Direct Deposit">Direct Deposit</option>
                <option value="ACH Transfer">ACH Transfer</option>
                <option value="Apple Pay">Apple Pay / Digital Wallet</option>
                <option value="Cash">Cash</option>
                <option value="Wire Transfer">Wire Transfer</option>
              </select>
            </div>

            <div className="pt-1 sm:pt-5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none min-h-[44px]">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                  Recurring Monthly Transaction
                </span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Invoice #204, tax deductible business expense"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-base sm:text-sm min-h-[44px]"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={closeTransactionModal}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[44px] touch-manipulation cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm min-h-[44px] touch-manipulation cursor-pointer active:scale-98"
            >
              {editingTransaction ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
