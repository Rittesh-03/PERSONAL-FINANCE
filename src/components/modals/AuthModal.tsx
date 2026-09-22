import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { X, ShieldCheck, Mail, Lock, User, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authMode,
    openAuthModal,
    closeAuthModal,
    updateUserProfile,
    showToast,
  } = useFinance();

  const [email, setEmail] = useState('ritteshsenthilkumar1@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('RITTESH S');
  const [resetCode, setResetCode] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === 'login') {
      updateUserProfile({ email, name: name || 'RITTESH S' });
      showToast('Signed in successfully', `Welcome back, ${name || 'RITTESH S'}!`, 'success');
      closeAuthModal();
    } else if (authMode === 'signup') {
      updateUserProfile({ name: name || 'RITTESH S', email });
      showToast('Account created', 'Welcome to your AI Personal Finance Manager!', 'success');
      closeAuthModal();
    } else if (authMode === 'forgot') {
      showToast('Reset email sent', `Check your inbox at ${email} for password reset instructions.`, 'info');
      openAuthModal('reset');
    } else if (authMode === 'reset') {
      showToast('Password updated', 'Your password has been securely reset. You can now sign in.', 'success');
      openAuthModal('login');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        id="auth-modal"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top visual brand banner */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white relative shrink-0">
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close modal"
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors touch-manipulation min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] sm:text-xs font-semibold mb-2 sm:mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            256-Bit Bank-Grade Security
          </div>
          <h2 className="text-lg sm:text-xl font-bold">
            {authMode === 'login' && 'Sign in to Apex Finance'}
            {authMode === 'signup' && 'Create your Financial Account'}
            {authMode === 'forgot' && 'Reset your Password'}
            {authMode === 'reset' && 'Set New Password'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {authMode === 'login' && 'Manage your money, budgets, and savings goals with AI insights.'}
            {authMode === 'signup' && 'Start taking control of your financial future today.'}
            {authMode === 'forgot' && 'We will send a secure verification code to your email.'}
            {authMode === 'reset' && 'Enter the verification code and set your new password.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="RITTESH S"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-base sm:text-sm min-h-[44px]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-base sm:text-sm min-h-[44px]"
              />
            </div>
          </div>

          {(authMode === 'login' || authMode === 'signup' || authMode === 'reset') && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot')}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline touch-manipulation py-1"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-base sm:text-sm min-h-[44px]"
                />
              </div>
            </div>
          )}

          {authMode === 'reset' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Verification Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 749201"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-base sm:text-sm min-h-[44px]"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-xs mt-2 min-h-[44px] touch-manipulation cursor-pointer"
          >
            <span>
              {authMode === 'login' && 'Sign In'}
              {authMode === 'signup' && 'Create Account'}
              {authMode === 'forgot' && 'Send Reset Link'}
              {authMode === 'reset' && 'Reset & Sign In'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Switch mode links */}
          <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            {authMode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline touch-manipulation p-1"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline touch-manipulation p-1"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
