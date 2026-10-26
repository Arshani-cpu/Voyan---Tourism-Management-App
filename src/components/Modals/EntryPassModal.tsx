import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Ticket,
  Globe,
  Landmark,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  BookmarkPlus,
  QrCode
} from 'lucide-react';
import QRCode from 'qrcode';
import { BookingItem } from '../../types/tripVault';

export interface EntryPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeName: string;
  locationName?: string;
  state?: string;
  costEstimate?: number;
  category?: string;
  timings?: string;
  onSaveToVault?: (booking: BookingItem) => void;
}

export const EntryPassModal: React.FC<EntryPassModalProps> = ({
  isOpen,
  onClose,
  placeName,
  locationName = '',
  state = '',
  costEstimate,
  category,
  timings,
  onSaveToVault,
}) => {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [provider, setProvider] = useState<'BookMyShow' | 'Google / Official Site' | 'ASI Indian Monuments' | 'State Tourism E-Pass'>('BookMyShow');
  const [passPrice, setPassPrice] = useState(costEstimate ? String(costEstimate) : '150');
  const [passDate, setPassDate] = useState('25 Oct 2026');
  const [qrPreview, setQrPreview] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Generate Google and BookMyShow search URLs
  const fullQuery = [placeName, locationName, state, 'India'].filter(Boolean).join(' ');
  const googleSearchPassUrl = `https://www.google.com/search?q=${encodeURIComponent(`${placeName} ${state || locationName} official entry pass tickets booking website`)}`;
  const googleThingsToDoUrl = `https://www.google.com/travel/things-to-do?q=${encodeURIComponent(`${placeName} ${state}`)}`;
  const bookMyShowSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${placeName} ${state} site:bookmyshow.com tickets entry pass`)}`;
  const asiMonumentsUrl = 'https://asi.payumoney.com/';

  // Is it a heritage monument / fort / palace / cave / archaeological site?
  const isHeritage =
    category === 'heritage' ||
    category === 'Historical & Heritage' ||
    /fort|palace|monument|tomb|caves?|temple|museum|asi|archaeol/i.test(`${placeName} ${category || ''}`);

  useEffect(() => {
    if (isOpen) {
      setSavedSuccess(false);
      setShowSaveForm(false);
      setConfirmationCode(`PASS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
    }
  }, [isOpen, placeName]);

  useEffect(() => {
    if (!confirmationCode) return;
    let isCancelled = false;
    QRCode.toDataURL(confirmationCode, {
      width: 160,
      margin: 1,
      color: { dark: '#042f2e', light: '#ffffff' },
    })
      .then((url) => {
        if (!isCancelled) setQrPreview(url);
      })
      .catch(() => {
        // Fallback gracefully
      });
    return () => {
      isCancelled = true;
    };
  }, [confirmationCode]);

  if (!isOpen) return null;

  const handleSavePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationCode.trim()) return;

    const newBooking: BookingItem = {
      id: `pass-${crypto.randomUUID()}`,
      type: 'pass',
      title: `${placeName} Entry Pass`,
      provider,
      confirmationCode: confirmationCode.trim(),
      status: 'confirmed',
      dateStr: passDate,
      timeStr: timings || '09:00 AM – 05:30 PM',
      departureLocation: [placeName, locationName, state].filter(Boolean).join(', '),
      seatOrRoom: 'General Entry Pass',
      price: passPrice ? Number(passPrice) : undefined,
      paidBy: 'You',
      notes: `Verified entry pass for ${placeName}. Booked via ${provider}.`,
    };

    if (onSaveToVault) {
      onSaveToVault(newBooking);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-pass-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-stone-200 bg-white shadow-2xl text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-teal-400/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-teal-200 border border-teal-300/30">
              <Ticket className="h-3.5 w-3.5" />
              Entry Pass & Ticket Finder
            </span>
            {isHeritage && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-200 border border-amber-300/30">
                <Landmark className="h-3.5 w-3.5" />
                Heritage Monument
              </span>
            )}
          </div>

          <h3 id="entry-pass-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {placeName}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-teal-100">
            {(locationName || state) && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-teal-300" />
                {[locationName, state].filter(Boolean).join(', ')}
              </span>
            )}
            {timings && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-teal-300" />
                {timings}
              </span>
            )}
            {costEstimate !== undefined && (
              <span className="rounded bg-white/10 px-2 py-0.5 font-semibold text-yellow-300">
                Est. Entry: {costEstimate > 0 ? `₹${costEstimate.toLocaleString()}` : 'Free / Nominal'}
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Quick Notice */}
          <div className="flex items-start gap-3 rounded-2xl bg-sky-50 border border-sky-100 p-3.5 text-xs text-sky-900">
            <ShieldCheck className="h-4 w-4 text-sky-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Book directly on verified official portals (Google, BookMyShow, or ASI). Avoid scalpers and unauthorized touts at venue gates.
            </p>
          </div>

          {/* Section 1: Book Entry Passes Online */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Official Entry Pass & Ticket Portals
            </h4>

            <div className="space-y-2.5">
              {/* Option A: Google Official Pass Search */}
              <a
                href={googleSearchPassUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 hover:border-teal-700 hover:bg-teal-50/40 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-xs">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-stone-900 group-hover:text-teal-900">
                        Official Website & Entry Tickets on Google
                      </span>
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-800 uppercase">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Search official government tourism & venue ticketing pages for {placeName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 border border-stone-200 group-hover:bg-teal-800 group-hover:text-white group-hover:border-teal-800 transition-colors">
                  <span>Open</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </a>

              {/* Option B: BookMyShow Passes & Experiences */}
              <a
                href={bookMyShowSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/40 p-3.5 hover:border-rose-400 hover:bg-rose-50/80 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DC3558] text-white font-bold shadow-xs">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-stone-900 group-hover:text-[#DC3558]">
                        BookMyShow Passes & Attractions
                      </span>
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-800 uppercase">
                        Fast Pass
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Check BookMyShow activities, guided passes, and event entry
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 border border-stone-200 group-hover:bg-[#DC3558] group-hover:text-white group-hover:border-[#DC3558] transition-colors">
                  <span>Explore</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </a>

              {/* Option C: ASI Monuments (if heritage or always helpful for Indian monuments) */}
              {isHeritage && (
                <a
                  href={asiMonumentsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 hover:border-amber-400 hover:bg-amber-50/90 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-700 text-white font-bold shadow-xs">
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-stone-900 group-hover:text-amber-900">
                          ASI Online Monument Entry Portal
                        </span>
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 uppercase">
                          Govt of India
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Official Archaeological Survey of India e-ticket portal for historical monuments
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 border border-stone-200 group-hover:bg-amber-800 group-hover:text-white group-hover:border-amber-800 transition-colors">
                    <span>Tickets</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>
                </a>
              )}

              {/* Option D: Google Things to Do */}
              <a
                href={googleThingsToDoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 hover:border-teal-700 hover:bg-teal-50/30 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-800 text-white font-bold shadow-xs">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-stone-900 group-hover:text-teal-900">
                      Google Things to Do — {placeName}
                    </span>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Compare admission prices, ticket types, reviews & peak visiting hours
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 rounded-xl bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 border border-stone-200 group-hover:bg-teal-800 group-hover:text-white transition-colors">
                  <span>View</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </a>
            </div>
          </div>

          {/* Section 2: Store/Log Digital Pass in Voyan Trip Vault */}
          <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/50 to-white p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <BookmarkPlus className="h-4 w-4 text-teal-800" />
                  <span>Store Entry Pass in Voyan Trip Vault</span>
                </h4>
                <p className="text-xs text-stone-600 mt-1">
                  Have a ticket code or booking reference? Save it to access offline with a scannable QR code anytime during your trip.
                </p>
              </div>
              {!showSaveForm && !savedSuccess && (
                <button
                  type="button"
                  onClick={() => setShowSaveForm(true)}
                  className="rounded-xl bg-teal-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-900 shrink-0 cursor-pointer shadow-xs"
                >
                  Save Pass
                </button>
              )}
            </div>

            {savedSuccess && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Pass successfully stored in your Voyan Trip Vault!</span>
              </div>
            )}

            {showSaveForm && !savedSuccess && (
              <form onSubmit={handleSavePass} className="mt-4 space-y-3 border-t border-stone-200 pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Provider / Platform
                    </label>
                    <select
                      value={provider}
                      onChange={(e) => setProvider(e.target.value as any)}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-teal-700 focus:outline-none"
                    >
                      <option value="BookMyShow">BookMyShow</option>
                      <option value="Google / Official Site">Google / Official Site</option>
                      <option value="ASI Indian Monuments">ASI Indian Monuments</option>
                      <option value="State Tourism E-Pass">State Tourism E-Pass</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Confirmation # / PNR / Ticket ID
                    </label>
                    <input
                      type="text"
                      required
                      value={confirmationCode}
                      onChange={(e) => setConfirmationCode(e.target.value)}
                      placeholder="e.g. BMS-789012"
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-mono focus:border-teal-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Date of Visit
                    </label>
                    <input
                      type="text"
                      value={passDate}
                      onChange={(e) => setPassDate(e.target.value)}
                      placeholder="e.g. 25 Oct 2026"
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-teal-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Amount Paid (₹ INR)
                    </label>
                    <input
                      type="number"
                      value={passPrice}
                      onChange={(e) => setPassPrice(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-teal-700 focus:outline-none"
                    />
                  </div>
                </div>

                {qrPreview && (
                  <div className="flex items-center gap-3 rounded-xl bg-white p-2.5 border border-stone-200">
                    <img src={qrPreview} alt="QR code preview" className="h-12 w-12 rounded border" />
                    <div className="text-[11px] text-stone-600">
                      <p className="font-semibold text-stone-900">Scannable QR Pass Generated</p>
                      <p className="text-stone-500 font-mono text-[10px]">{confirmationCode}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveForm(false)}
                    className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-900 shadow-xs"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>Save to Trip Vault</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-stone-100 p-4 bg-stone-50/80 flex items-center justify-between rounded-b-3xl">
          <span className="text-[11px] text-stone-400">
            Voyan connects you with official sources; transactions are completed on provider sites.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white border border-stone-200 px-4 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
