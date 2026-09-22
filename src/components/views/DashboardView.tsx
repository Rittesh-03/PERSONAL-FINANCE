import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ArrowRightLeft,
  PieChart as PieIcon,
  Target,
  Calendar,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    savingsRate,
    financialHealth,
    transactions,
    budgets,
    goals,
    bills,
    accounts,
    settings,
    formatMoney,
    formatDate,
    openTransactionModal,
    openBudgetModal,
    openGoalModal,
    openTransferModal,
    openDepositModal,
    toggleBillPaid,
    setActiveView,
    getMonthlyTrendData,
    getCategorySpendingData,
  } = useFinance();

  const monthlyTrendData = getMonthlyTrendData();
  const categorySpending = getCategorySpendingData();

  const recentTransactions = transactions.slice(0, 5);
  const upcomingBills = bills.slice(0, 4);

  // Health score color
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  return (
    <div id="dashboard-view" className="space-y-5 sm:space-y-6 pb-6">
      {/* 1. Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Net Worth */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Balance
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
            {formatMoney(totalBalance)}
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            Across {accounts.length} linked accounts
          </div>
        </div>

        {/* Monthly Income */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Income
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight truncate">
            +{formatMoney(monthlyIncome)}
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            Salary, dividends & freelance
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Expenses
            </span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 rounded-xl text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight truncate">
            -{formatMoney(monthlyExpenses)}
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            Active billing period
          </div>
        </div>

        {/* Net Savings */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Savings Rate
            </span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/50 rounded-xl text-teal-600 dark:text-teal-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {savingsRate}%
          </div>
          <div className="mt-2 text-xs font-medium text-teal-600 dark:text-teal-400 flex items-center gap-1 truncate">
            {formatMoney(monthlySavings)} retained
          </div>
        </div>

        {/* Health Score */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Health Index
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-xl sm:text-2xl font-extrabold tracking-tight ${getHealthColor(financialHealth.score)}`}>
              {financialHealth.score}
            </span>
            <span className="text-xs font-bold uppercase text-slate-400">
              / 100 • {financialHealth.status}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">
            {financialHealth.recommendations[0] || 'Finances looking solid'}
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Bar - Horizontally scrollable on mobile */}
      <div className="flex items-center gap-2 p-2 sm:p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto scrollbar-none">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0 hidden sm:inline">
          Quick Actions:
        </span>
        <button
          type="button"
          onClick={() => openTransactionModal()}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors touch-manipulation min-h-[38px]"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Transaction
        </button>
        <button
          type="button"
          onClick={openTransferModal}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors touch-manipulation min-h-[38px]"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Transfer Funds
        </button>
        <button
          type="button"
          onClick={() => openBudgetModal()}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 dark:bg-slate-800 dark:hover:bg-amber-950/40 dark:hover:text-amber-300 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors touch-manipulation min-h-[38px]"
        >
          <PieIcon className="w-3.5 h-3.5" />
          Create Budget
        </button>
        <button
          type="button"
          onClick={() => openGoalModal()}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 dark:bg-slate-800 dark:hover:bg-teal-950/40 dark:hover:text-teal-300 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors touch-manipulation min-h-[38px]"
        >
          <Target className="w-3.5 h-3.5" />
          Add Savings Goal
        </button>
        <button
          type="button"
          onClick={() => setActiveView('assistant')}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:opacity-95 transition-opacity sm:ml-auto touch-manipulation min-h-[38px]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ask AI Advisor
        </button>
      </div>

      {/* 3. Primary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Monthly Bar Chart */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Income vs. Expenses Trend
              </h3>
              <p className="text-xs text-slate-400">Past 6 months cash flow</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('analytics')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              Detailed Analytics
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#64748b"
                  tickFormatter={(val) => `${settings.currencySymbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(val: any) => [formatMoney(Number(val)), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Spending Donut Chart */}
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Spending by Category
              </h3>
              <p className="text-xs text-slate-400">Current month distribution</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('budgets')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer p-1"
            >
              Budgets
            </button>
          </div>

          <div className="h-52 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySpending}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categorySpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatMoney(Number(val)), 'Spent']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Mini Legend */}
          <div className="mt-2 space-y-1.5 overflow-y-auto max-h-32 text-xs">
            {categorySpending.slice(0, 4).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[120px]">
                    {cat.name}
                  </span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatMoney(cat.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Two-Column Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions + Budgets */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Transactions Card */}
          <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recent Transactions
                </h3>
                <p className="text-xs text-slate-400">Latest activity across all accounts</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('transactions')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer p-1"
              >
                View all ({transactions.length})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => openTransactionModal(tx)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl px-2 -mx-2 transition-colors cursor-pointer touch-manipulation"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {tx.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatDate(tx.date)} • {tx.category}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-bold ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatMoney(tx.amount)}
                    </div>
                    <div className="text-[11px] text-slate-400">{tx.paymentMethod}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Budgets Progress Bar preview */}
          <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Monthly Budget Utilization
                </h3>
                <p className="text-xs text-slate-400">Spending limits by category</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('budgets')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer p-1"
              >
                Manage Budgets
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {budgets.slice(0, 3).map((b) => {
                const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));
                const isOver = b.spent > b.limit;
                const isNear = b.spent >= b.limit * (b.alertThreshold || 0.85);

                let barColor = 'bg-emerald-500';
                if (isOver) barColor = 'bg-rose-500';
                else if (isNear) barColor = 'bg-amber-500';

                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {b.category}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {formatMoney(b.spent)} / {formatMoney(b.limit)}{' '}
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${barColor} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Savings Goals + Upcoming Bills */}
        <div className="space-y-6">
          {/* Savings Goals Widget */}
          <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Savings Goals
                </h3>
                <p className="text-xs text-slate-400">Active milestones</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('goals')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer p-1"
              >
                All Goals
              </button>
            </div>

            <div className="space-y-4">
              {goals.map((goal) => {
                const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div
                    key={goal.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: goal.color }}
                        />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {goal.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openDepositModal(goal)}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline touch-manipulation py-1 px-1.5 cursor-pointer"
                      >
                        + Deposit
                      </button>
                    </div>

                    <div className="flex justify-between text-xs mt-2 text-slate-500 dark:text-slate-400">
                      <span>{formatMoney(goal.currentAmount)}</span>
                      <span>Target: {formatMoney(goal.targetAmount)}</span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: goal.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Bills Checklist */}
          <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Upcoming Bills
                </h3>
                <p className="text-xs text-slate-400">Subscriptions & due dates</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('bills')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer p-1"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggleBillPaid(bill.id)}
                      aria-label={`Mark bill ${bill.name} as ${bill.isPaidThisMonth ? 'unpaid' : 'paid'}`}
                      className={`p-1.5 rounded-md transition-colors touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer ${
                        bill.isPaidThisMonth
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${bill.isPaidThisMonth ? 'fill-emerald-100 dark:fill-emerald-950/80' : ''}`}
                      />
                    </button>
                    <div>
                      <div
                        className={`font-semibold ${
                          bill.isPaidThisMonth
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {bill.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due {formatDate(bill.dueDate)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-bold text-slate-900 dark:text-white">
                    {formatMoney(bill.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
