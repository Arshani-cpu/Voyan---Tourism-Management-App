import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LiveLocationViewer } from './components/Emergency/LiveLocationViewer';
import './index.css';

// Google Maps Platform Quota Defense listener for Demo Key
const origError = console.error;
console.error = (...args: unknown[]) => {
  origError.apply(console, args);
  try {
    const msg = args.map((a) => (typeof a === 'object' && a !== null ? JSON.stringify(a) : String(a))).join(' ');
    if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  } catch {}
};

// Service Worker management: only enable cache worker in production builds.
// In development, active service workers can intercept Vite dev modules and cause blank screens.
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister().then(() => {
          console.debug('Voyan: Unregistered dev service worker');
        });
      }
    });
    if ('caches' in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          if (key.startsWith('voyan-cache')) {
            caches.delete(key);
          }
        }
      });
    }
  } else if (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.debug('Voyan Service Worker active with scope:', reg.scope);
        })
        .catch((err) => {
          console.info('SW registration info:', err);
        });
    });
  }
}

// Global React Error Boundary to prevent blank white screens
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class RootErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Voyan Unhandled Render Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center p-6 text-center font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto mb-4 border border-teal-100 shadow-sm text-2xl">
            ✈️
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Voyan Encountered an Issue</h1>
          <p className="text-stone-600 max-w-md text-sm mb-6 leading-relaxed">
            {this.state.error?.message || 'A transient loading error occurred. Please refresh the page to reload Voyan.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Reset & Reload
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm rounded-xl transition-all cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const liveLocationMatch = window.location.pathname.match(/^\/sos\/live\/([A-Za-z0-9_-]{43})$/);
createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    {liveLocationMatch ? <LiveLocationViewer shareToken={liveLocationMatch[1]} /> : <App />}
  </RootErrorBoundary>
);
