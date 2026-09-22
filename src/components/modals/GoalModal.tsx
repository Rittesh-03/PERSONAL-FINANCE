import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X } from 'lucide-react';
import { GoalPriority } from '../../types';

export const GoalModal: React.FC = () => {
  const {
    isGoalModalOpen,
    editingGoal,
    closeGoalModal,
    addGoal,
    updateGoal,
    settings,
  } = useFinance();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Emergency');
  const [priority, setPriority] = useState<GoalPriority>('medium');
  const [color, setColor] = useState('#10b981');
  const [notes, setNotes] = useState('');

  const COLOR_OPTIONS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#d97706'];

  useEffect(() => {
    if (editingGoal) {
      setName(editingGoal.name);
      setTargetAmount(editingGoal.targetAmount.toString());
      setCurrentAmount(editingGoal.currentAmount.toString());
      setDeadline(editingGoal.deadline);
      setCategory(editingGoal.category);
      setPriority(editingGoal.priority);
      setColor(editingGoal.color);
      setNotes(editingGoal.notes || '');
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('2027-01-01');
      setCategory('Emergency');
      setPriority('medium');
      setColor('#10b981');
      setNotes('');
    }
  }, [editingGoal, isGoalModalOpen]);

  if (!isGoalModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;
    if (!name.trim() || isNaN(target) || target <= 0) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        name: name.trim(),
        targetAmount: target,
        currentAmount: current,
        deadline,
        category,
        priority,
        color,
        notes: notes.trim() || undefined,
      });
    } else {
      addGoal({
        name: name.trim(),
        targetAmount: target,
        currentAmount: current,
        deadline,
        category,
        priority,
        color,
        notes: notes.trim() || undefined,
      });
    }
    closeGoalModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="goal-modal"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {editingGoal ? 'Edit Savings Goal' : 'Define Savings Goal'}
          </h2>
          <button
            type="button"
            onClick={closeGoalModal}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Goal Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Home Downpayment, Tokyo Vacation, Emergency Fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Target Amount ({settings.currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="10000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Already Saved ({settings.currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  step="1"
                  placeholder="0"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Target Deadline
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              >
                <option value="Emergency">Emergency Reserve</option>
                <option value="Travel">Travel & Vacation</option>
                <option value="Real Estate">Home & Real Estate</option>
                <option value="Vehicle">Vehicle Purchase</option>
                <option value="Education">Education & Courses</option>
                <option value="Retirement">Retirement & Long-Term</option>
                <option value="General">General Savings</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as GoalPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl border transition-all touch-manipulation min-h-[42px] cursor-pointer ${
                      priority === p
                        ? p === 'high'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                          : p === 'medium'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                          : 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Accent Color
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Goal Notes & Milestones
            </label>
            <input
              type="text"
              placeholder="e.g. Stored in high-yield account at 4.5% APY"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-base sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={closeGoalModal}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[42px] touch-manipulation cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs min-h-[42px] touch-manipulation cursor-pointer"
            >
              {editingGoal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
