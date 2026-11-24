import React from 'react';
import { Smartphone, Download, Share, PlusSquare, X, Check, ArrowRight } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent.toLowerCase() : '';
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-studio-900 border border-gold-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden text-studio-100">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-studio-400 hover:text-white rounded-full bg-studio-800/60 hover:bg-studio-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-2xl bg-gold-500/15 border border-gold-500/30 text-gold-400 mb-3 shadow-glow-gold">
            <Smartphone className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-xl text-gold-light-gradient">
            Install Nilesh Studio App
          </h3>
          <p className="text-xs text-studio-400 mt-1">
            Install the app on your phone for instant booking & real-time updates.
          </p>
        </div>

        {/* Dynamic Instructions Based on OS */}
        <div className="space-y-4">
          {/* iOS / iPhone Section */}
          <div className={`p-4 rounded-2xl border ${isIOS ? 'bg-gold-500/10 border-gold-400/50 ring-1 ring-gold-400/30' : 'bg-studio-950/70 border-studio-800'}`}>
            <div className="flex items-center space-x-2.5 mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/30">
                iPhone / iPad (iOS)
              </span>
              {isIOS && <span className="text-[10px] text-emerald-400 font-semibold">● Your Device</span>}
            </div>
            <p className="text-xs text-studio-300 mb-3">
              Apple allows installing Nilesh Studio directly to your home screen:
            </p>
            <ol className="text-xs text-studio-300 space-y-2.5 pl-1">
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <span>In Safari, tap the <strong className="text-white">Share</strong> button <Share className="w-3.5 h-3.5 inline mx-0.5 text-gold-400" /> at the bottom.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <span>Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-gold-400" />.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <span>Tap <strong className="text-white">Add</strong>. Nilesh Studio will launch as a full-screen app!</span>
              </li>
            </ol>
          </div>

          {/* Android Section */}
          <div className={`p-4 rounded-2xl border ${isAndroid ? 'bg-gold-500/10 border-gold-400/50 ring-1 ring-gold-400/30' : 'bg-studio-950/70 border-studio-800'}`}>
            <div className="flex items-center space-x-2.5 mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/30">
                Android Phone
              </span>
              {isAndroid && <span className="text-[10px] text-emerald-400 font-semibold">● Your Device</span>}
            </div>
            <p className="text-xs text-studio-300 mb-3">
              Download the official Android APK or add to home screen from Chrome:
            </p>
            <div className="space-y-2">
              <a
                href="/download/apk"
                download="NileshStudio.apk"
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download Standalone APK (6 MB)</span>
              </a>
              <p className="text-[11px] text-studio-400 text-center">
                Or in Chrome menu (⋮) tap <strong className="text-studio-200">"Install App"</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="text-xs text-studio-400 hover:text-gold-400 underline transition-colors"
          >
            Continue using in browser
          </button>
        </div>
      </div>
    </div>
  );
};
