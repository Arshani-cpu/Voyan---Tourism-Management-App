import React from 'react';
import {
  FolderArchive,
  Ticket,
  Calendar,
  Wallet,
  Camera,
  CheckCircle2
} from 'lucide-react';

interface TripVaultShowcaseSectionProps {
  onOpenVault: () => void;
}

export const TripVaultShowcaseSection: React.FC<TripVaultShowcaseSectionProps> = ({ onOpenVault }) => {
  const highlights = [
    {
      icon: <Ticket className="w-5 h-5 text-sky-700" />,
      title: 'Bookings & Document Locker',
      desc: 'Keep passports, IDs, insurance policies, permits, and tickets safe on your device with 100% offline access.'
    },
    {
      icon: <Calendar className="w-5 h-5 text-teal-800" />,
      title: 'Synchronized Living Itinerary',
      desc: 'View your saved itinerary, link bookings to each day, and email complete passes to your companions with 1 tap.'
    },
    {
      icon: <Wallet className="w-5 h-5 text-amber-700" />,
      title: 'Group Split & UPI Fast Pay',
      desc: 'Track group expenses, calculate equal splits, and settle balances instantly via scan-and-pay UPI QR or GPay/PhonePe.'
    },
    {
      icon: <Camera className="w-5 h-5 text-emerald-700" />,
      title: 'Travel Journal & Photo Memories',
      desc: 'Save trip notes and photos against a location and itinerary day.'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white border-y border-stone-200/80 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-stone-900 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-10 lg:p-12 text-white relative overflow-hidden shadow-xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-4 border border-teal-500/30">
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Unified Travel Hub & Mobile App</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Bookings, tickets, itineraries, expenses & memories —{' '}
              <span className="text-teal-300">finally in one place.</span>
            </h2>

            <p className="mt-3 text-stone-300 text-sm sm:text-base leading-relaxed">
              Keep your saved trip information, confirmations, receipt files, documents, and journal entries together in your account.
            </p>
          </div>

          {/* 4 Feature Value Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 relative z-10">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 hover:border-teal-400/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center mb-3 shadow-xs">
                    {h.icon}
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{h.title}</h4>
                  <p className="text-xs text-stone-300 leading-relaxed">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Strip */}
          <div className="mt-8 pt-6 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3 text-xs text-stone-300">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Connect Gmail with read-only permission or paste a confirmation to import it.</span>
            </div>

            <button
              onClick={onOpenVault}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Open Trip Vault & Tickets →</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
