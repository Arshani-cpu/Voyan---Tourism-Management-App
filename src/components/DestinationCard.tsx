import React, { useState } from 'react';
import { ArrowRight, ExternalLink, Ticket } from 'lucide-react';
import { DestinationItem } from '../types/travel';
import { EntryPassModal } from './Modals/EntryPassModal';

interface DestinationCardProps {
  destination: DestinationItem;
  onSelect: (destination: DestinationItem) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ destination, onSelect }) => {
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  return (
    <>
      <article className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col text-left">
        {/* Photography Carrier with Subtle Contrast Scrim */}
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          <img
            src={destination.image}
            alt={destination.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Fallback for resilient rendering
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="absolute bottom-2 left-2 rounded bg-stone-950/65 px-2 py-1 text-[10px] font-medium text-white">
            Illustrative photo
          </span>
          {/* Fallback pattern in case image ever fails */}
          <div className="absolute inset-0 bg-stone-100 -z-10 flex items-center justify-center text-stone-400 text-xs">
            <span>{destination.name}</span>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Zero-Pill Metadata Line */}
            <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-2">
              <span>{destination.state}</span>
              <span aria-hidden="true">·</span>
              <span>{destination.recommendedDays} Days</span>
              <span aria-hidden="true">·</span>
              <span>{destination.bestMonths}</span>
            </div>

            {/* Primary Destination Title */}
            <h3 className="text-xl font-bold text-[#0F172A] tracking-tight group-hover:text-teal-900 transition-colors">
              {destination.name}
            </h3>

            <p className="mt-1.5 text-xs text-stone-600 line-clamp-2 leading-relaxed">
              {destination.tagline}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {(destination.placeCategories ?? []).slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="rounded-full bg-teal-50 px-2 py-1 text-[10px] font-medium text-teal-900"
                >
                  {category}
                </span>
              ))}
            </div>

            {/* Highlights List as Clean Text */}
            <div className="mt-3 text-xs text-stone-500 flex flex-wrap gap-x-2 gap-y-1">
              {destination.highlights.slice(0, 3).map((h, i) => (
                <span key={h}>
                  {h}
                  {i < 2 && <span className="ml-2 text-stone-300">/</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing, Rating & Action Footer */}
          <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
            <div>
              <div className="text-[11px] text-stone-400 uppercase tracking-wider font-medium">
                Est. from
              </div>
              <div className="text-base font-bold text-teal-900 tabular-nums">
                ₹{destination.startingPrice.toLocaleString()}
                <span className="text-xs font-normal text-stone-500"> / person</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsPassModalOpen(true)}
                className="px-2 py-1.5 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                aria-label={`Find passes for ${destination.name}`}
                title={`Check BookMyShow and entry passes for ${destination.name}`}
              >
                <Ticket className="w-3.5 h-3.5 text-rose-600" />
                <span>Passes</span>
              </button>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${destination.name}, ${destination.state}, India`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1.5 text-xs font-semibold text-stone-700 hover:text-teal-900 rounded-lg transition-colors flex items-center gap-1"
                aria-label={`View ${destination.name} in Google Maps`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Map</span>
              </a>
              <button
                onClick={() => onSelect(destination)}
                className="px-2.5 py-1.5 text-xs font-semibold text-teal-800 hover:text-white bg-teal-50 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1 group/btn"
                aria-label={`Plan trip to ${destination.name}`}
              >
                <span>Plan</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </article>

      <EntryPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        placeName={`${destination.name} Attractions`}
        locationName={destination.name}
        state={destination.state}
      />
    </>
  );
};
