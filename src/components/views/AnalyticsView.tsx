import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const {
    transactions,
    budgets,
    accounts,
    financialHealth,
    savingsRate,
    formatMoney,
    formatDate,
    getMonthlyTrendData,
    getCategorySpendingData,
  } = useFinance();

  const [timeRange, setTimeRange] = useState<'6m' | '3m' | '1y'>('6m');

  const monthlyTrendData = getMonthlyTrendData();
  const categorySpending = getCategorySpendingData();

  // Top 5 Highest expense transactions
  const topExpenses = [...transactions]
    .filter((t) => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Cumulative savings trend
  let runningBalance = 0;
  const cashFlowTrend = monthlyTrendData.map((d) => {
    const net = d.income - d.expenses;
    runningBalance += net;
    return {
      month: d.month,
      net,
      cumulative: runningBalance,
    };
  });

  return (
    <div id="analytics-view" className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Financial Analytics & Insights
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deep dive into spending velocity, savings accumulation, and risk metrics
          </p>
        </div>

        {/* Time range switcher */}
        <div className="flex p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setTimeRange('3m')}
            className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[38px] ${
              timeRange === '3m'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Last 3 Months
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('6m')}
            className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[38px] ${
              timeRange === '6m'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Last 6 Months
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('1y')}
            className={`flex-1 sm:flex-none px-3 py-2 sm:py-1.5 rounded-lg transition-colors touch-manipulation min-h-[38px] ${
              timeRange === '1y'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Full Year
          </button>
        </div>
      </div>

      {/* Financial Health Deep-Dive */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-lg border border-slate-700/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-700">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Comprehensive Financial Health Score
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-emerald-400">
                {financialHealth.score}
              </span>
              <span className="text-lg text-slate-300 font-semibold">
                / 100 • {financialHealth.status} Rating
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Calculated using weighted benchmarks across your active savings rate, credit
              utilization, budget limit discipline, and emergency liquid runway.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Savings Rate</div>
              <div className="text-base font-bold text-emerald-400 mt-1">{savingsRate}%</div>
              <div className="text-[10px] text-slate-400">Target &gt;20%</div>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Debt to Assets</div>
              <div className="text-base font-bold text-emerald-400 mt-1">1.8%</div>
              <div className="text-[10px] text-emerald-400">Extremely Low</div>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Budget Integrity</div>
              <div className="text-base font-bold text-amber-400 mt-1">78%</div>
              <div className="text-[10px] text-slate-400">1 Overrun</div>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Emergency Fund</div>
              <div className="text-base font-bold text-emerald-400 mt-1">3.4 Mo</div>
              <div className="text-[10px] text-slate-400">Target 6 Mo</div>
            </div>
          </div>
        </div>

        {/* AI Health Recommendations */}
        <div className="pt-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-emerald-300">Strategic Recommendations:</div>
            <div className="mt-1 space-y-1">
              {financialHealth.recommendations.map((rec, i) => (
                <p key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {rec}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Row: Cash Flow Accumulation & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumulative Savings Line Chart */}
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Cumulative Wealth Accumulation
            </h3>
            <p className="text-xs text-slate-400">Net monthly savings compounded over time</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#64748b"
                  tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(val: any) => [formatMoney(Number(val)), 'Cumulative Growth']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Spending Donut Chart */}
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Spending Distribution by Category
            </h3>
            <p className="text-xs text-slate-400">Current active billing month breakdown</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySpending}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categorySpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatMoney(Number(val)), 'Total Spent']}
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

          <div className="grid grid-cols-2 gap-2 text-xs pt-2">
            {categorySpending.slice(0, 6).map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  {c.name}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatMoney(c.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Expense Outflows Table */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Highest Outflows This Period
          </h3>
          <p className="text-xs text-slate-400">
            Transactions with significant impact on overall savings velocity
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {topExpenses.map((t, idx) => (
            <div
              key={t.id}
              className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl px-2 -mx-2"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-500">
                  {idx + 1}
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {t.title}
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatDate(t.date)} • {t.category} • {t.paymentMethod}
                  </div>
                </div>
              </div>
              <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
                -{formatMoney(t.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
