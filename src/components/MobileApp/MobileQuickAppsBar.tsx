import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ON_DEMAND_APPS } from '../../utils/appLinks';

interface MobileQuickAppsBarProps {
  destination?: string;
  onOpenFullHub?: () => void;
  className?: string;
}

export const MobileQuickAppsBar: React.FC<MobileQuickAppsBarProps> = ({
  destination = 'India',
  onOpenFullHub,
  className = '',
}) => {
  return (
    <div
      className={`w-full bg-white/98 backdrop-blur-md border-b border-stone-200/80 pt-2.5 pb-3 px-3 md:px-6 lg:px-8 shadow-sm select-none ${className}`}
    >
      {/* Header row — constrained to match page max-width */}
      <div className="flex items-center justify-between gap-2 mb-2.5 max-w-7xl mx-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-stone-800">
            Instant Apps for {destination.split('&')[0].trim()}
          </span>
        </div>
        {onOpenFullHub && (
          <button
            onClick={onOpenFullHub}
            className="text-[11px] font-bold text-teal-800 hover:text-teal-950 flex items-center gap-0.5 shrink-0 cursor-pointer active:opacity-70"
          >
            <span>Full Hub</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* App Icons
           Mobile  (<md):  6-col grid → 2 rows for 11 apps — all visible, no scroll
           Desktop (≥md): 11-col grid → single row — all icons side by side         */}
      <div className="grid grid-cols-6 md:grid-cols-11 gap-x-0.5 gap-y-2 max-w-7xl mx-auto">
        {ON_DEMAND_APPS.map((app) => {
          const appUrl = app.getUrl({ destination });
          const shortName = app.name.split(' ')[0];
          return (
            <a
              key={app.id}
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`${app.name}: ${app.tagline}`}
              className="flex flex-col items-center gap-0.5 py-0.5 rounded-xl hover:bg-stone-50 active:scale-95 transition-all group cursor-pointer"
            >
              {/* Coloured icon square — slightly larger on desktop */}
              <div
                className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-xs border border-black/5 transition-transform group-hover:scale-110 group-active:scale-95"
                style={{
                  backgroundColor: app.color,
                  color: app.id === 'rapido' || app.id === 'blinkit' ? '#000000' : '#FFFFFF',
                }}
              >
                {app.name.charAt(0)}
              </div>
              {/* Short name label — always visible */}
              <span className="text-[9px] font-bold text-stone-600 tracking-tight text-center leading-tight w-full truncate px-0.5">
                {shortName}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
};
