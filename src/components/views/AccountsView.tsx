import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Plus,
  ArrowRightLeft,
  Landmark,
  CreditCard,
  DollarSign,
  TrendingUp,
  MoreVertical,
  Edit2,
  Trash2,
  Receipt,
  ExternalLink,
} from 'lucide-react';
import { Account, AccountType } from '../../types';

export const AccountsView: React.FC = () => {
  const {
    accounts,
    transactions,
    totalBalance,
    formatMoney,
    formatDate,
    openAccountModal,
    openTransferModal,
    openTransactionModal,
    deleteAccount,
  } = useFinance();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Group accounts
  const liquidAccounts = accounts.filter(
    (a) => a.type === 'checking' || a.type === 'wallet' || a.type === 'cash'
  );
  const savingsAccounts = accounts.filter((a) => a.type === 'savings');
  const investmentAccounts = accounts.filter((a) => a.type === 'investment');
  const creditAccounts = accounts.filter((a) => a.type === 'credit');

  const liquidTotal = liquidAccounts.reduce((sum, a) => sum + a.balance, 0);
  const savingsTotal = savingsAccounts.reduce((sum, a) => sum + a.balance, 0);
  const investmentTotal = investmentAccounts.reduce((sum, a) => sum + a.balance, 0);
  const debtTotal = creditAccounts.reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const accountTransactions = selectedAccountId
    ? transactions.filter((t) => t.accountId === selectedAccountId)
    : [];

  const getAccountTypeIcon = (type: AccountType) => {
    switch (type) {
      case 'credit':
        return CreditCard;
      case 'investment':
        return TrendingUp;
      case 'savings':
        return DollarSign;
      default:
        return Landmark;
    }
  };

  return (
    <div id="accounts-view" className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Financial Accounts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time balances, credit utilization, and institution connections
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={openTransferModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold shadow-2xs transition-colors min-h-[40px] touch-manipulation cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Transfer Funds
          </button>
          <button
            type="button"
            onClick={() => openAccountModal()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors min-h-[40px] touch-manipulation cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Account
          </button>
        </div>
      </div>

      {/* Asset / Liability Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Liquid Cash
          </span>
          <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
            {formatMoney(liquidTotal)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Checking & Digital Wallets</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            High-Yield Savings
          </span>
          <div className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatMoney(savingsTotal)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Reserves earning ~4.5% APY</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Investments & ETFs
          </span>
          <div className="mt-1 text-xl font-extrabold text-blue-600 dark:text-blue-400">
            {formatMoney(investmentTotal)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Market-linked assets</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Credit Liabilities
          </span>
          <div className="mt-1 text-xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatMoney(debtTotal)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Current card balances</div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => {
          const Icon = getAccountTypeIcon(acc.type);
          const isSelected = selectedAccountId === acc.id;

          return (
            <div
              key={acc.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between bg-white dark:bg-slate-900 shadow-2xs ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Card top */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-xs"
                      style={{ backgroundColor: acc.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {acc.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {acc.institution} • {acc.accountNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openAccountModal(acc)}
                      aria-label="Edit Account"
                      title="Edit Account"
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {accounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Remove account ${acc.name}?`)) {
                            deleteAccount(acc.id);
                          }
                        }}
                        aria-label="Remove Account"
                        title="Remove Account"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Balance display */}
                <div className="mt-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {acc.type === 'credit' ? 'Current Balance' : 'Available Balance'}
                  </span>
                  <div
                    className={`text-2xl font-extrabold tracking-tight ${
                      acc.type === 'credit' && acc.balance < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {formatMoney(acc.balance)}
                  </div>
                  {acc.type === 'credit' && acc.creditLimit && (
                    <div className="mt-1 text-xs text-slate-400">
                      Credit Limit: {formatMoney(acc.creditLimit)} (
                      {Math.round((Math.abs(acc.balance) / acc.creditLimit) * 100)}% utilized)
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedAccountId(isSelected ? null : acc.id)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 py-1.5 touch-manipulation cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  {isSelected ? 'Hide Transactions' : 'View Ledger'}
                </button>
                <button
                  type="button"
                  onClick={openTransferModal}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 touch-manipulation cursor-pointer"
                >
                  Transfer
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Account Ledger Drawer */}
      {selectedAccount && (
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ledger: {selectedAccount.name} ({accountTransactions.length} items)
              </h3>
              <p className="text-xs text-slate-400">
                Filtered transaction history for this specific account
              </p>
            </div>
            <button
              type="button"
              onClick={() => openTransactionModal()}
              className="px-3.5 py-2.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold min-h-[40px] touch-manipulation cursor-pointer flex items-center justify-center"
            >
              + Add Transaction to {selectedAccount.name}
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {accountTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No transactions recorded under this account yet.
              </div>
            ) : (
              accountTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-xl"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      {tx.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {formatDate(tx.date)} • {tx.category} • {tx.paymentMethod}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatMoney(tx.amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
