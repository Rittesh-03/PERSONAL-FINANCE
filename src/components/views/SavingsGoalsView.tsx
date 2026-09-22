import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Plus,
  Target,
  PiggyBank,
  Calendar,
  Sparkles,
  CheckCircle2,
  Edit2,
  Trash2,
  ArrowUpRight,
  Trophy,
} from 'lucide-react';
import { SavingsGoal } from '../../types';

export const SavingsGoalsView: React.FC = () => {
  const {
    goals,
    openGoalModal,
    openDepositModal,
    deleteGoal,
    formatMoney,
    formatDate,
  } = useFinance();

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  // Calculate required monthly savings to reach each goal
  const calculateMonthlyTarget = (goal: SavingsGoal) => {
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    if (remaining === 0) return 0;

    const today = new Date();
    const deadlineDate = new Date(goal.deadline);
    const months = Math.max(
      1,
      (deadlineDate.getFullYear() - today.getFullYear()) * 12 +
        (deadlineDate.getMonth() - today.getMonth())
    );

    return Math.ceil(remaining / months);
  };

  const totalMonthlyDemand = goals.reduce((sum, g) => sum + calculateMonthlyTarget(g), 0);

  return (
    <div id="savings-goals-view" className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Savings Goals & Milestones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track dedicated reserves, milestone progress, and planned completion dates
          </p>
        </div>
        <button
          type="button"
          onClick={() => openGoalModal()}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors w-full sm:w-auto min-h-[40px] touch-manipulation cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Goal
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Target Capital
          </span>
          <div className="mt-1 text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
            {formatMoney(totalTarget)}
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-400">{goals.length} active goals</div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Saved
          </span>
          <div className="mt-1 text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatMoney(totalSaved)}
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-400">{overallProgress}% funded</div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Monthly Demand
          </span>
          <div className="mt-1 text-lg sm:text-xl font-extrabold text-blue-600 dark:text-blue-400">
            {formatMoney(totalMonthlyDemand)}/mo
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-400">To meet deadlines</div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Completed Goals
          </span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {goals.filter((g) => g.currentAmount >= g.targetAmount).length}
            </span>
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-400">Milestones achieved</div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          const monthlyTarget = calculateMonthlyTarget(goal);
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className={`p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border transition-all flex flex-col justify-between shadow-2xs ${
                isCompleted
                  ? 'border-emerald-400 dark:border-emerald-700 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: goal.color }}
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        {goal.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {goal.category} •{' '}
                        <span
                          className={`font-semibold capitalize ${
                            goal.priority === 'high'
                              ? 'text-rose-500'
                              : goal.priority === 'medium'
                              ? 'text-amber-500'
                              : 'text-blue-500'
                          }`}
                        >
                          {goal.priority} priority
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openGoalModal(goal)}
                      title="Edit Goal"
                      aria-label="Edit Goal"
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete goal "${goal.name}"?`)) {
                          deleteGoal(goal.id);
                        }
                      }}
                      title="Delete Goal"
                      aria-label="Delete Goal"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Ring & Numbers */}
                <div className="mt-5 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Saved:</span>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {formatMoney(goal.currentAmount)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-medium">Target:</span>
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
                      {formatMoney(goal.targetAmount)}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-500 dark:text-slate-400">{pct}% funded</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {isCompleted ? 'Target Reached!' : `${formatMoney(remaining)} remaining`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: goal.color }}
                    />
                  </div>
                </div>

                {/* Deadline & Demand metrics */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Target Date:
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {formatDate(goal.deadline)}
                    </span>
                  </div>
                  {!isCompleted && (
                    <div className="flex items-center justify-between">
                      <span>Monthly Pace Required:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(monthlyTarget)}/mo
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                {isCompleted ? (
                  <div className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    Goal Milestone Achieved!
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openDepositModal(goal)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors min-h-[42px] touch-manipulation cursor-pointer"
                  >
                    <PiggyBank className="w-4 h-4" />
                    Make a Contribution
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
