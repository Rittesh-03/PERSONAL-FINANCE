import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Plus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  PieChart as PieIcon,
  TrendingDown,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const BudgetsView: React.FC = () => {
  const {
    budgets,
    openBudgetModal,
    deleteBudget,
    formatMoney,
  } = useFinance();

  // Summary calculations
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remainingBuffer = Math.max(0, totalBudgeted - totalSpent);
  const overallUtilization = totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0;

  const exceededCount = budgets.filter((b) => b.spent > b.limit).length;
  const warningCount = budgets.filter(
    (b) => b.spent <= b.limit && b.spent >= b.limit * (b.alertThreshold || 0.85)
  ).length;

  // Comparison data for Chart
  const comparisonData = budgets.map((b) => ({
    category: b.category.split(' ')[0], // short label
    fullCategory: b.category,
    limit: b.limit,
    actual: b.spent,
  }));

  return (
    <div id="budgets-view" className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Budget Monitoring
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set spending limits, monitor thresholds, and prevent budget overruns
          </p>
        </div>
        <button
          type="button"
          onClick={() => openBudgetModal()}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors w-full sm:w-auto min-h-[40px] touch-manipulation cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Budget
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Budgeted
          </span>
          <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
            {formatMoney(totalBudgeted)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Across {budgets.length} categories</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Actual Spend
          </span>
          <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">
            {formatMoney(totalSpent)}
          </div>
          <div className="mt-1 text-xs text-slate-400">{overallUtilization}% overall utilization</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Remaining Buffer
          </span>
          <div className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatMoney(remainingBuffer)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Available unallocated cash</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Status Alerts
          </span>
          <div className="mt-1 flex items-center gap-3">
            <span
              className={`text-xl font-extrabold ${
                exceededCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {exceededCount} Over
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {warningCount} Warning
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-400">Categories requiring review</div>
        </div>
      </div>

      {/* Budget vs Actual Comparison Chart */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Budget vs. Actual Spending
          </h3>
          <p className="text-xs text-slate-400">
            Compare planned limits against current billing period expenditures
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#64748b" />
              <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
              <Tooltip
                formatter={(val: any, name: any) => [
                  formatMoney(Number(val)),
                  name === 'limit' ? 'Budget Limit' : 'Actual Spent',
                ]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                formatter={(value) => (value === 'limit' ? 'Budget Limit' : 'Actual Spent')}
              />
              <Bar dataKey="limit" name="limit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="actual" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.map((b) => {
          const pct = Math.round((b.spent / b.limit) * 100);
          const isOver = b.spent > b.limit;
          const isNear = !isOver && b.spent >= b.limit * (b.alertThreshold || 0.85);

          let statusBadge = {
            text: 'On Track',
            icon: CheckCircle2,
            cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
            barColor: 'bg-emerald-500',
          };

          if (isOver) {
            statusBadge = {
              text: 'Exceeded',
              icon: AlertCircle,
              cls: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800',
              barColor: 'bg-rose-500',
            };
          } else if (isNear) {
            statusBadge = {
              text: 'Warning (>85%)',
              icon: AlertTriangle,
              cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
              barColor: 'bg-amber-500',
            };
          }

          const StatusIcon = statusBadge.icon;
          const diff = b.limit - b.spent;

          return (
            <div
              key={b.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {b.category}
                    </h4>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      {b.period} renewal
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openBudgetModal(b)}
                      title="Edit Budget"
                      aria-label="Edit Budget"
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete budget for ${b.category}?`)) {
                          deleteBudget(b.id);
                        }
                      }}
                      title="Delete Budget"
                      aria-label="Delete Budget"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amounts */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Spent:</span>
                    <span className="ml-1 text-lg font-extrabold text-slate-900 dark:text-white">
                      {formatMoney(b.spent)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    Limit: {formatMoney(b.limit)}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2.5">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`${statusBadge.barColor} h-2.5 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge.cls}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusBadge.text}
                </span>

                <span
                  className={`font-semibold ${
                    diff >= 0
                      ? 'text-slate-600 dark:text-slate-300'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {diff >= 0 ? `${formatMoney(diff)} left` : `${formatMoney(Math.abs(diff))} over`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
