import React, { useState } from 'react';
import { ArrowRight, ExternalLink, MapPin, Ticket, Star, Image as ImageIcon } from 'lucide-react';
import { DestinationItem, PlaceCategory } from '../types/travel';
import { EntryPassModal } from './Modals/EntryPassModal';

export interface DirectoryPlace {
  id: string;
  name: string;
  state: string;
  location: string;
  timings: string;
  description: string;
  source: string;
  direction?: string;
  photos?: string;
  reviewRating?: string;
  reviewCount?: number;
}

interface DirectoryPlaceCardProps {
  place: DirectoryPlace;
  categories: PlaceCategory[];
  destination: DestinationItem;
  onPlanTrip: (destination: DestinationItem) => void;
}

export const DirectoryPlaceCard: React.FC<DirectoryPlaceCardProps> = ({
  place,
  categories,
  destination,
  onPlanTrip,
}) => {
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const mapQuery = [place.name, place.location, place.state, 'India'].filter(Boolean).join(', ');
  const mapUrl = place.direction || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <>
      <article className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-xs transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="flex items-center gap-1 text-xs font-medium text-stone-500">
                <MapPin className="h-3.5 w-3.5 text-teal-800" aria-hidden="true" />
                {place.state}
              </p>
              {place.reviewRating && (
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80 text-[11px] font-bold text-amber-900">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <span>{place.reviewRating}</span>
                  {place.reviewCount ? (
                    <span className="text-[10px] font-normal text-amber-700">
                      ({place.reviewCount >= 1000 ? `${(place.reviewCount / 1000).toFixed(1)}k` : place.reviewCount})
                    </span>
                  ) : null}
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold tracking-tight text-[#0F172A]">{place.name}</h3>
          </div>
        </div>
        {place.location && <p className="text-xs text-stone-500">{place.location}</p>}
        {place.description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600">{place.description}</p>}
        {place.timings && (
          <p className="mt-2 text-xs text-stone-500">
            <span className="font-semibold text-stone-700">Listed hours:</span> {place.timings}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <span key={category} className="rounded-full bg-teal-50 px-2 py-1 text-[10px] font-medium text-teal-900">
              {category}
            </span>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsPassModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200/80 px-2.5 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
              title={`Check official entry passes & BookMyShow for ${place.name}`}
            >
              <Ticket className="h-3.5 w-3.5 text-rose-600" />
              Entry Pass
            </button>
            {place.photos && (
              <a
                href={place.photos}
                target="_blank"
                rel="noopener noreferrer"
                title={`View photos of ${place.name}`}
                className="inline-flex items-center gap-1 rounded-lg bg-sky-50 border border-sky-200/80 px-2.5 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 transition-colors"
              >
                <ImageIcon className="h-3.5 w-3.5 text-sky-600" />
                Photos
              </a>
            )}
          </div>
          <div className="flex items-center gap-1">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Find ${place.name} on Google Maps`}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Map
            </a>
            <button
              type="button"
              onClick={() => onPlanTrip(destination)}
              className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-900 hover:bg-teal-800 hover:text-white"
            >
              Plan
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </article>

      <EntryPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        placeName={place.name}
        locationName={place.location}
        state={place.state}
        category={categories[0]}
        timings={place.timings}
      />
    </>
  );
};
