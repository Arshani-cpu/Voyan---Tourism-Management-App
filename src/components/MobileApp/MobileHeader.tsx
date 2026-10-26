import React from 'react';
import { Compass, Sparkles, User, MapPin, Download, CheckCircle2, Shield, ShieldAlert } from 'lucide-react';
import { NavbarUser } from '../Navbar';

interface MobileHeaderProps {
  destinationName: string;
  durationDays: number;
  currentUser?: NavbarUser | null;
  onOpenSignIn: () => void;
  onOpenMyTrips: () => void;
  onNavigateHome: () => void;
  onOpenSOS?: () => void;
  onOpenAppsHub?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  destinationName,
  durationDays,
  currentUser,
  onOpenSignIn,
  onOpenMyTrips,
  onNavigateHome,
  onOpenSOS,
  onOpenAppsHub,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FBFBFA]/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-2.5 flex items-center justify-between gap-2 select-none">
      {/* Brand & Active Trip */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 focus:outline-none cursor-pointer shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-teal-800 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-base font-extrabold tracking-tight text-[#0F172A]">
            Voyan
          </span>
        </button>

        <div className="h-4 w-px bg-stone-300 shrink-0 mx-0.5" />

        {/* Current Active Trip Pill */}
        <button
          onClick={onOpenMyTrips}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200/80 text-[11px] font-bold text-teal-900 truncate max-w-[130px] cursor-pointer"
        >
          <MapPin className="w-3 h-3 text-teal-700 shrink-0" />
          <span className="truncate">{destinationName.split('&')[0].trim()}</span>
          <span className="text-[9px] text-teal-700 bg-teal-100/80 px-1 rounded-sm shrink-0 font-medium">
            {durationDays}d
          </span>
        </button>
      </div>

      {/* Right Controls: Apps Hub, SOS, Profile */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* On-Demand Apps Quick Header Button */}
        {onOpenAppsHub && (
          <button
            onClick={onOpenAppsHub}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-[11px] shadow-xs active:scale-95 transition-all cursor-pointer"
            title="Open On-Demand Travel, Food & Shopping Apps"
          >
            <span>Apps</span>
          </button>
        )}

        {/* Emergency SOS Header Button */}
        {onOpenSOS && (
          <button
            onClick={onOpenSOS}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-[11px] shadow-xs active:scale-95 transition-all cursor-pointer"
            title="Emergency SOS Hub"
          >
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
            <span>SOS</span>
          </button>
        )}

        {/* Offline indicator */}
        <div
          className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
          title="App works 100% offline via PWA Service Worker"
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Offline</span>
        </div>

        {/* Profile Avatar */}
        {currentUser ? (
          <button
            onClick={onOpenMyTrips}
            className="w-7 h-7 rounded-full bg-teal-800 text-white font-bold text-xs flex items-center justify-center ring-2 ring-teal-600/30 cursor-pointer"
          >
            {currentUser.name.charAt(0).toUpperCase()}
          </button>
        ) : (
          <button
            onClick={onOpenSignIn}
            className="p-1 rounded-full text-stone-600 hover:text-teal-900 bg-stone-100 hover:bg-stone-200 cursor-pointer"
          >
            <User className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
