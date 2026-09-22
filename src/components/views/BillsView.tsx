import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Repeat,
  Zap,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export const BillsView: React.FC = () => {
  const {
    bills,
    openBillModal,
    deleteBill,
    toggleBillPaid,
    accounts,
    formatMoney,
    formatDate,
  } = useFinance();

  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const totalMonthlyCommitment = bills.reduce((sum, b) => {
    if (b.frequency === 'yearly') return sum + b.amount / 12;
    if (b.frequency === 'weekly') return sum + b.amount * 4;
    return sum + b.amount;
  }, 0);

  const paidTotal = bills
    .filter((b) => b.isPaidThisMonth)
    .reduce((sum, b) => sum + b.amount, 0);

  const pendingTotal = bills
    .filter((b) => !b.isPaidThisMonth)
    .reduce((sum, b) => sum + b.amount, 0);

  const filteredBills = bills.filter((b) => {
    if (filter === 'unpaid') return !b.isPaidThisMonth;
    if (filter === 'paid') return b.isPaidThisMonth;
    return true;
  });

  return (
    <div id="bills-view" className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Recurring Bills & Subscriptions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track scheduled debits, auto-pay commitments, and monthly due dates
          </p>
        </div>
        <button
          type="button"
          onClick={() => openBillModal()}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors w-full sm:w-auto min-h-[40px] touch-manipulation cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Schedule Bill
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Monthly Commitment
          </span>
          <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
            {formatMoney(totalMonthlyCommitment)}
          </div>
          <div className="mt-1 text-xs text-slate-400">{bills.length} active recurring services</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Settled This Month
          </span>
          <div className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatMoney(paidTotal)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {bills.filter((b) => b.isPaidThisMonth).length} bills paid
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pending Due
          </span>
          <div className="mt-1 text-xl font-extrabold text-amber-600 dark:text-amber-400">
            {formatMoney(pendingTotal)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {bills.filter((b) => !b.isPaidThisMonth).length} remaining to settle
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 touch-manipulation min-h-[36px] ${
            filter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All ({bills.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unpaid')}
          className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 touch-manipulation min-h-[36px] ${
            filter === 'unpaid'
              ? 'bg-amber-600 text-white'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Pending Due ({bills.filter((b) => !b.isPaidThisMonth).length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('paid')}
          className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 touch-manipulation min-h-[36px] ${
            filter === 'paid'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Settled ({bills.filter((b) => b.isPaidThisMonth).length})
        </button>
      </div>

      {/* Bills Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBills.map((bill) => {
          const account = accounts.find((a) => a.id === bill.accountId);
          return (
            <div
              key={bill.id}
              className={`p-5 bg-white dark:bg-slate-900 rounded-2xl border transition-all flex flex-col justify-between shadow-2xs ${
                bill.isPaidThisMonth
                  ? 'border-slate-200/80 dark:border-slate-800/80 opacity-80'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      className={`text-sm font-bold leading-tight ${
                        bill.isPaidThisMonth
                          ? 'line-through text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {bill.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {bill.category} • <span className="capitalize">{bill.frequency}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openBillModal(bill)}
                      title="Edit Bill"
                      aria-label="Edit Bill"
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete bill "${bill.name}"?`)) {
                          deleteBill(bill.id);
                        }
                      }}
                      title="Delete Bill"
                      aria-label="Delete Bill"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {formatMoney(bill.amount)}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due {formatDate(bill.dueDate)}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="truncate max-w-[180px]">Account: {account?.name || 'Default Checking'}</span>
                  {bill.autoPay && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md shrink-0">
                      <Zap className="w-3 h-3" />
                      Auto-Pay
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => toggleBillPaid(bill.id)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors min-h-[40px] touch-manipulation cursor-pointer ${
                    bill.isPaidThisMonth
                      ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {bill.isPaidThisMonth ? 'Mark as Unpaid' : 'Mark as Paid'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
