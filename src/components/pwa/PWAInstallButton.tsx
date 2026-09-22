import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, Share2, PlusSquare, X } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'settings';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as an installed PWA in standalone mode, suppress button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    await install();
    setIsInstalling(false);
  };

  // If not installable and not iOS, render a manual instructions modal or null if header
  // Note: in many browsers, beforeinstallprompt fires only after user engagement or can be tested
  if (!isInstallable && !isIOS && variant === 'header') {
    // Return a visible install button in header so the user can test / trigger installation instructions anytime
    return (
      <button
        type="button"
        onClick={() => setShowIOSGuide(true)}
        title="Install Web App on your device"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-2xs touch-manipulation min-h-[36px] cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  return (
    <>
      {isInstallable ? (
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={isInstalling}
          title="Install App for offline access and home screen launch"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-2xs touch-manipulation min-h-[36px] cursor-pointer active:scale-95"
        >
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
        </button>
      ) : isIOS ? (
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          title="Install on iOS"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-2xs touch-manipulation min-h-[36px] cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install on iOS</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          title="How to install"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs touch-manipulation min-h-[36px] cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install App</span>
        </button>
      )}

      {/* Installation Guide Dialog */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Install Apex Finance
                  </h3>
                  <p className="text-[11px] text-slate-400">Add to your device home screen</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 touch-manipulation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <strong>Chrome / Edge (Desktop & Android):</strong> Click the install icon in the URL bar (⊕ or laptop with down arrow) or choose <strong>Install App</strong> from the browser menu (⋮).
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong>Safari (iPhone / iPad):</strong> Tap the{' '}
                  <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <Share2 className="w-3 h-3 inline" /> Share
                  </span>{' '}
                  button in Safari, then scroll down and tap{' '}
                  <span className="inline-flex items-center gap-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <PlusSquare className="w-3 h-3 inline" /> Add to Home Screen
                  </span>
                  .
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer touch-manipulation min-h-[40px]"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
