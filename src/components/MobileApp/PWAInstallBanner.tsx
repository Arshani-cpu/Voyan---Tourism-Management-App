import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, PlusSquare, Check, Sparkles, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrError, setQrError] = useState('');
  const [installError, setInstallError] = useState('');

  useEffect(() => {
    if (!showQRModal) return;

    let isCancelled = false;
    setQrDataUrl('');
    setQrError('');

    const generateQRCode = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(window.location.origin, {
          width: 320,
          margin: 2,
          color: { dark: '#0f172a', light: '#ffffff' }
        });

        if (!isCancelled) setQrDataUrl(dataUrl);
      } catch (error) {
        if (!isCancelled) setQrError(error instanceof Error ? error.message : 'Could not generate a QR code.');
      }
    };

    void generateQRCode();
    return () => {
      isCancelled = true;
    };
  }, [showQRModal]);

  useEffect(() => {
    // Check if already in standalone display mode
    const displayMode = window.matchMedia('(display-mode: standalone)');
    const updateStandaloneMode = () => {
      const standaloneMode = displayMode.matches ||
        (window.navigator as NavigatorWithStandalone).standalone === true;
      setIsStandalone(standaloneMode);
      if (standaloneMode) setShowBanner(false);
    };
    updateStandaloneMode();

    const userAgent = window.navigator.userAgent;
    const isAppleDevice = /iPhone|iPad|iPod/i.test(userAgent) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    setIsIOS(isAppleDevice);
    setIsAndroid(/Android/i.test(userAgent));

    // Capture Chrome / Android install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    const installedHandler = () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    displayMode.addEventListener('change', updateStandaloneMode);

    const timer = setTimeout(() => {
      try {
        if (sessionStorage.getItem('voyan_pwa_dismissed') !== 'true' && !displayMode.matches) {
          setShowBanner(true);
        }
      } catch {
        if (!displayMode.matches) setShowBanner(true);
      }
    }, 1500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
      displayMode.removeEventListener('change', updateStandaloneMode);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    setInstallError('');
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') setShowBanner(false);
      } catch (error) {
        console.error('Could not show the browser installation prompt:', error);
        setInstallError('The browser could not open its install prompt. Use the browser menu to install Voyan.');
        if (isIOS) setShowIOSModal(true);
        else if (isAndroid) setShowAndroidModal(true);
        else setShowQRModal(true);
      } finally {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else if (isAndroid) {
      setShowAndroidModal(true);
    } else {
      setShowQRModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try {
      sessionStorage.setItem('voyan_pwa_dismissed', 'true');
    } catch (error) {
      console.warn('Could not remember the dismissed install banner:', error);
    }
  };

  const handleDownloadQRCode = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'voyan-install-qr.png';
    link.click();
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* Floating Mobile App Install Bar */}
      <div className="voyan-install-banner fixed bottom-36 sm:bottom-6 left-3 right-3 sm:left-1/2 sm:right-auto sm:w-[min(28rem,calc(100vw-2rem))] sm:-translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-xl p-2.5 sm:p-3.5 flex items-center justify-between gap-2 sm:gap-3 text-left animate-in slide-in-from-bottom-3 duration-200">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-teal-800 items-center justify-center text-white shrink-0 shadow-xs">
            <Smartphone className="w-5 h-5 text-teal-200" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[11px] sm:text-xs font-bold text-stone-900 leading-tight flex items-center gap-1.5">
              <span>Install Voyan Mobile App</span>
              <span className="text-[10px] font-mono bg-teal-50 text-teal-800 px-1.5 py-0.2 rounded font-semibold">PWA</span>
            </h4>
            <p className="hidden sm:block text-[11px] text-stone-500 leading-tight mt-0.5">
              Access tickets offline, instant maps & trip vault on your home screen.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={() => setShowQRModal(true)}
            aria-label="Show mobile install QR code"
            title="Show QR code"
            className="hidden sm:inline-flex p-2 text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={handleInstallClick}
            className="px-3 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-left border border-stone-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-800" />
                <h3 className="text-base font-bold text-stone-900">Install on iPhone / iPad</h3>
              </div>
              <button onClick={() => setShowIOSModal(false)} className="p-1 rounded-md text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-4">
              Install Voyan as a native app on your iOS home screen in two simple taps:
            </p>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-900 flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <span className="font-semibold block text-stone-900">Tap the Share button</span>
                  <span className="text-[11px] text-stone-500">
                    Located in Safari's bottom toolbar (<Share className="w-3 h-3 inline text-teal-800" />).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-900 flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <span className="font-semibold block text-stone-900">Select "Add to Home Screen"</span>
                  <span className="text-[11px] text-stone-500">
                    Scroll down and tap <PlusSquare className="w-3 h-3 inline text-teal-800" /> <strong>Add to Home Screen</strong>.
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {showAndroidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-6 text-left shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-teal-800" />
                <h3 className="text-base font-bold text-stone-900">Install Voyan on Android</h3>
              </div>
              <button type="button" onClick={() => setShowAndroidModal(false)} className="rounded-md p-1 text-stone-400" aria-label="Close install instructions">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ol className="space-y-3 text-xs text-stone-700">
              <li className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                Open this site in Chrome and tap the <strong>three-dot menu</strong>.
              </li>
              <li className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.
              </li>
              <li className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                Confirm. Voyan will appear on your home screen and open in its own app window.
              </li>
            </ol>
            <p className="mt-3 text-[11px] text-stone-500">
              Installation requires the deployed HTTPS website. Some browsers only offer this option from their menu.
            </p>
            {installError && <p role="alert" className="mt-3 text-[11px] text-red-700">{installError}</p>}
            <button type="button" onClick={() => setShowAndroidModal(false)} className="mt-5 w-full rounded-xl bg-teal-800 py-2.5 text-xs font-semibold text-white hover:bg-teal-900">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Desktop QR Modal to open directly on phone */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center border border-stone-200 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                Install on Your Mobile Device
              </span>
              <button onClick={() => setShowQRModal(false)} className="p-1 rounded-md text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-stone-200 flex items-center justify-center mb-3">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR code to open and install Voyan" className="w-full h-full" />
              ) : qrError ? (
                <p className="text-[11px] text-red-700">{qrError}</p>
              ) : (
                <QrCode className="w-10 h-10 text-teal-800 animate-pulse" />
              )}
            </div>

            <h4 className="text-sm font-bold text-stone-900 mb-1">Scan with your phone's camera</h4>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto mb-4">
              Scan to open Voyan on your phone. A deployed HTTPS site is required for installation; a local development server may only work on the same Wi-Fi.
            </p>
            {installError && <p role="alert" className="mb-3 text-[11px] text-red-700">{installError}</p>}

            <button
              onClick={handleDownloadQRCode}
              disabled={!qrDataUrl}
              className="mb-3 w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              Download QR code
            </button>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
