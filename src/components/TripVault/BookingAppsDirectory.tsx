import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Bus, Hotel, Plane, QrCode, Train, X, Ticket, Globe, Landmark } from 'lucide-react';
import QRCode from 'qrcode';

const BOOKING_APPS = [
  {
    name: 'BookMyShow',
    category: 'Passes, Events & Activities',
    description: 'Book experience passes, event tickets, guided activities & movies',
    url: 'https://in.bookmyshow.com/',
    icon: Ticket,
    color: 'text-rose-700 bg-rose-50',
  },
  {
    name: 'Google Passes & Things to Do',
    category: 'Attraction entry passes',
    description: 'Search official monument tickets, venue passes & admission pricing',
    url: 'https://www.google.com/travel/things-to-do',
    icon: Globe,
    color: 'text-blue-700 bg-blue-50',
  },
  {
    name: 'ASI Monument Entry Passes',
    category: 'Heritage entry passes',
    description: 'Archaeological Survey of India official monument e-ticketing portal',
    url: 'https://asi.payumoney.com/',
    icon: Landmark,
    color: 'text-amber-800 bg-amber-50',
  },
  {
    name: 'redBus',
    category: 'Bus tickets',
    description: 'Search and book intercity buses',
    url: 'https://www.redbus.in/',
    icon: Bus,
    color: 'text-red-700 bg-red-50',
  },
  {
    name: 'IndiGo',
    category: 'Flights',
    description: 'Book flights on IndiGo',
    url: 'https://www.goindigo.in/',
    icon: Plane,
    color: 'text-blue-800 bg-blue-50',
  },
  {
    name: 'MakeMyTrip Flights',
    category: 'Flights',
    description: 'Compare and book flights',
    url: 'https://www.makemytrip.com/flights/',
    icon: Plane,
    color: 'text-sky-800 bg-sky-50',
  },
  {
    name: 'Google Flights',
    category: 'Flights',
    description: 'Compare flight options and fares',
    url: 'https://www.google.com/travel/flights',
    icon: Plane,
    color: 'text-indigo-800 bg-indigo-50',
  },
  {
    name: 'IRCTC',
    category: 'Train tickets',
    description: 'Book Indian Railways tickets',
    url: 'https://www.irctc.co.in/nget/',
    icon: Train,
    color: 'text-teal-800 bg-teal-50',
  },
  {
    name: 'Booking.com',
    category: 'Hotels',
    description: 'Find and book accommodation',
    url: 'https://www.booking.com/',
    icon: Hotel,
    color: 'text-blue-900 bg-blue-50',
  },
  {
    name: 'Agoda',
    category: 'Hotels',
    description: 'Search hotels and stays',
    url: 'https://www.agoda.com/',
    icon: Hotel,
    color: 'text-rose-800 bg-rose-50',
  },
] as const;

export const BookingAppsDirectory: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<(typeof BOOKING_APPS)[number] | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrError, setQrError] = useState('');

  useEffect(() => {
    if (!selectedApp) return;
    let cancelled = false;
    setQrDataUrl('');
    setQrError('');

    void QRCode.toDataURL(selectedApp.url, {
      width: 240,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    }).then((dataUrl) => {
      if (!cancelled) setQrDataUrl(dataUrl);
    }).catch(() => {
      if (!cancelled) setQrError('Could not create the QR code. Open the booking site using the button instead.');
    });

    return () => {
      cancelled = true;
    };
  }, [selectedApp]);

  return (
    <>
      <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-4 sm:p-5 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-stone-900">Booking apps & websites</h4>
          <p className="mt-1 text-xs text-stone-600">
            Open an official provider page, or show its QR code for another device to scan.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BOOKING_APPS.map((app) => {
            const Icon = app.icon;
            return (
              <article key={app.name} className="flex min-w-0 items-center gap-3 rounded-xl border border-stone-200 bg-white p-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${app.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-stone-900">{app.name}</p>
                  <p className="text-[11px] text-stone-500">{app.category}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-teal-800 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-teal-900"
                    >
                      Open site <ArrowUpRight className="h-3 w-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setSelectedApp(app)}
                      className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-[11px] font-semibold text-stone-700 hover:bg-stone-50"
                    >
                      <QrCode className="h-3 w-3" /> QR
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <p className="text-[11px] text-stone-500">
          Voyan opens the providers’ websites; bookings, payments, and tickets are handled by each provider.
        </p>
      </section>

      {selectedApp && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-app-qr-title"
          onClick={() => setSelectedApp(null)}
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 text-left">
              <div>
                <h3 id="booking-app-qr-title" className="text-base font-bold text-stone-900">{selectedApp.name}</h3>
                <p className="text-xs text-stone-500">{selectedApp.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"
                aria-label="Close QR code"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {qrDataUrl ? (
              <a href={selectedApp.url} target="_blank" rel="noopener noreferrer" className="mx-auto mt-4 block w-fit rounded-xl border border-stone-200 p-2">
                <img src={qrDataUrl} alt={`QR code to open ${selectedApp.name}`} className="h-52 w-52" />
              </a>
            ) : qrError ? (
              <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-800">{qrError}</p>
            ) : (
              <p className="mt-8 mb-8 text-sm text-stone-500">Generating QR code…</p>
            )}
            <a
              href={selectedApp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-900"
            >
              Open {selectedApp.name} <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <p className="mt-2 text-[11px] text-stone-500">Scan the QR code with another device to open the official site.</p>
          </div>
        </div>
      )}
    </>
  );
};
