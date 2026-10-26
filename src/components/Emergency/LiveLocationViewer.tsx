import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock3, MapPin, Navigation, ShieldCheck } from 'lucide-react';
import { getSOSLiveStatus, type SOSLiveStatus } from '../../lib/sosLiveLocation';

interface LiveLocationViewerProps {
  shareToken: string;
}

export const LiveLocationViewer: React.FC<LiveLocationViewerProps> = ({ shareToken }) => {
  const [status, setStatus] = useState<SOSLiveStatus | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const refresh = async () => {
      try {
        const nextStatus = await getSOSLiveStatus(shareToken);
        if (cancelled) return;
        setStatus(nextStatus);
        setError('');
        if (nextStatus.active) timer = window.setTimeout(refresh, 5000);
      } catch (requestError) {
        if (cancelled) return;
        setError(requestError instanceof Error ? requestError.message : 'Could not load live location.');
        timer = window.setTimeout(refresh, 5000);
      }
    };

    void refresh();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [shareToken]);

  const location = status?.location;
  const mapUrl = location
    ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
    : '';
  const updatedAt = location ? new Date(location.updatedAt) : null;
  const isStale = updatedAt !== null && Date.now() - updatedAt.getTime() > 2 * 60 * 1000;

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10 text-stone-900">
      <section className="mx-auto max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-red-700">Voyan SOS</p>
            <h1 className="text-xl font-black">Shared live location</h1>
          </div>
        </div>

        {error ? (
          <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="mb-2 h-5 w-5" />
            <p>{error}</p>
          </div>
        ) : !status ? (
          <p className="rounded-2xl bg-stone-100 p-4 text-sm text-stone-600">Connecting to Voyan…</p>
        ) : !status.active ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-100 p-4 text-sm text-stone-700">
            <p className="font-bold">Location sharing has ended.</p>
            <p className="mt-1">This private link no longer provides location updates.</p>
          </div>
        ) : !location ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-bold">Waiting for the first GPS update.</p>
            <p className="mt-1">Keep the live-link page open. Voyan will refresh this page automatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`rounded-2xl border p-4 ${isStale ? 'border-amber-300 bg-amber-50 text-amber-950' : 'border-emerald-300 bg-emerald-50 text-emerald-950'}`}>
              <div className="flex items-center gap-2 font-bold">
                {isStale ? <AlertTriangle className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                {isStale ? 'Last location may be out of date' : 'Location is updating'}
              </div>
              <p className="mt-2 font-mono text-sm">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
              <p className="mt-1 text-xs">
                Accuracy ±{Math.round(location.accuracy)} m
                {updatedAt && ` · Updated ${updatedAt.toLocaleTimeString()}`}
              </p>
            </div>

            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-3 text-sm font-bold text-white hover:bg-teal-900"
            >
              <Navigation className="h-4 w-4" />
              Open in Maps
            </a>

            <p className="flex items-start gap-2 text-xs leading-relaxed text-stone-500">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
              This private link refreshes every 5 seconds and expires at {new Date(status.expiresAt).toLocaleTimeString()}.
            </p>
            <p className="text-xs leading-relaxed text-amber-800">
              Anyone with this link can view the location. Do not forward it beyond the intended safety contacts.
            </p>
          </div>
        )}
      </section>
    </main>
  );
};
