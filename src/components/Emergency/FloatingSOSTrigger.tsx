import React from 'react';
import { ShieldAlert, MessageSquare } from 'lucide-react';

interface FloatingSOSTriggerProps {
  onOpenSOS: () => void;
  isSimulatedMobile?: boolean;
}

export const FloatingSOSTrigger: React.FC<FloatingSOSTriggerProps> = ({
  onOpenSOS,
  isSimulatedMobile = false,
}) => {
  // If simulated inside mobile chassis, position accordingly, or standard fixed viewport
  const positionClasses = isSimulatedMobile
    ? 'absolute bottom-16 right-4 z-40'
    : 'fixed bottom-[84px] lg:bottom-6 right-4 lg:right-6 z-40';

  return (
    <div className={positionClasses}>
      <button
        onClick={onOpenSOS}
        className="group relative flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-xs shadow-xl shadow-red-600/30 hover:shadow-2xl hover:shadow-red-600/50 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/30 cursor-pointer select-none"
        title="Emergency SOS - Prepare a message and share your live location (Shift + S)"
        aria-label="Open Emergency SOS and prepare a location-sharing message"
      >
        {/* Pulsing beacon glow */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
        </span>

        <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 text-white" />
        </div>

        <div className="flex flex-col items-start leading-none text-left">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-extrabold text-red-100 uppercase tracking-wider">
              LIVE SOS
            </span>
            <MessageSquare className="w-2.5 h-2.5 text-red-200" />
          </div>
          <span className="text-xs font-black tracking-wide">
            SOS
          </span>
        </div>

        {/* Desktop Keyboard hint badge */}
        <span className="hidden lg:inline-block ml-1 text-[9px] bg-red-950/40 text-red-200 px-1.5 py-0.5 rounded font-mono font-medium">
          ⇧S
        </span>
      </button>
    </div>
  );
};
