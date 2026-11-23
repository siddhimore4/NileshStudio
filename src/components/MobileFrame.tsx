import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Don't show immediately if user recently dismissed
      const dismissed = sessionStorage.getItem('nilesh_install_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install the app:\n\n• On Android (Chrome): Tap the 3 dots menu ⋮ at top right and choose "Install App" or "Add to Home screen".\n\n• On iPhone (Safari): Tap the Share button ⎋ at bottom and tap "Add to Home Screen".');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('nilesh_install_dismissed', 'true');
  };

  return (
    <div className="min-h-screen bg-studio-950 flex justify-center text-studio-100 selection:bg-gold-500 selection:text-studio-950">
      <div className="w-full max-w-lg min-h-screen flex flex-col bg-studio-950 sm:shadow-[0_0_50px_rgba(0,0,0,0.8)] sm:border-x sm:border-gold-500/15 relative">
        {/* PWA Install Banner for mobile users */}
        {showInstallBanner && !isInstalled && (
          <div className="bg-gradient-to-r from-studio-900 via-studio-850 to-studio-900 border-b border-gold-500/30 px-3.5 py-2.5 flex items-center justify-between text-xs sticky top-0 z-50 animate-fade-in shadow-lg">
            <div className="flex items-center space-x-2.5 flex-1 min-w-0 mr-2">
              <img
                src="/logo.png"
                alt="App Icon"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-gold-400 shrink-0 bg-black"
              />
              <div className="truncate">
                <div className="font-bold text-white flex items-center space-x-1">
                  <span>Nilesh Studio App</span>
                  <Sparkles className="w-3 h-3 text-gold-400 shrink-0" />
                </div>
                <p className="text-[10px] text-studio-400 truncate">
                  Install on your phone for instant booking
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-studio-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm flex items-center space-x-1 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
              <button
                onClick={handleDismiss}
                className="text-studio-400 hover:text-white p-1 rounded-md"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Pure Customer App Body */}
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </div>
  );
};
