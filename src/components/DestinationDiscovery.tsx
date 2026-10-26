import React, { useState } from 'react';
import { DISCOVERY_DESTINATIONS } from '../data/destinations';
import { DestinationItem } from '../types/travel';
import { ArrowRight, Compass, X, Calendar, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

interface DestinationDiscoveryProps {
  onPlanDestination: (dest: DestinationItem) => void;
}

export const DestinationDiscovery: React.FC<DestinationDiscoveryProps> = ({
  onPlanDestination,
}) => {
  const [selectedDestination, setSelectedDestination] = useState<DestinationItem | null>(null);

  return (
    <section id="destination-discovery" className="py-16 sm:py-24 bg-white border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="text-xs font-semibold text-teal-800 tracking-wider uppercase mb-1">
            Destination Discovery
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] [text-wrap:balance]">
            Explore iconic landscapes across India
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600">
            From the tranquil emerald backwaters of Kerala to the rugged peaks of Himachal and the golden desert sands of Rajasthan.
          </p>
          <a
            href="#popular-destinations"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-900 transition-colors hover:bg-teal-100"
          >
            Browse destinations by state
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        {/* 4 Popular Destination Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DISCOVERY_DESTINATIONS.map((dest) => (
            <article
              key={dest.id}
              className="group bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col text-left hover:-translate-y-1"
            >
              {/* Photography Container */}
              <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                <img
                  src={dest.image}
                  alt={dest.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-stone-900/70 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
                  {dest.state}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A] tracking-tight group-hover:text-teal-900 transition-colors">
                    {dest.name}
                  </h3>

                  <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {dest.tagline}
                  </p>
                </div>

                {/* Footer with 'Learn More' Button */}
                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-xs font-semibold text-teal-900 tabular-nums">
                    From ₹{dest.startingPrice.toLocaleString()}
                  </div>

                  <button
                    onClick={() => setSelectedDestination(dest)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-teal-800 hover:text-white bg-teal-50 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1 group/btn cursor-pointer"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* 'Learn More' Destination Modal */}
      {selectedDestination && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Image Header */}
            <div className="relative aspect-[16/9] w-full">
              <img
                src={selectedDestination.image}
                alt={selectedDestination.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedDestination(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-4 bg-stone-950/80 backdrop-blur-xs text-teal-300 text-xs px-2.5 py-1 rounded-md font-medium">
                {selectedDestination.category} · {selectedDestination.recommendedDays} Days Suggested
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                    {selectedDestination.name}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-700" />
                    <span>{selectedDestination.state}, India</span>
                    <span aria-hidden="true">·</span>
                    <span>Best Season: {selectedDestination.bestMonths}</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-stone-400 uppercase">Estimated Budget</div>
                  <div className="text-lg font-bold text-teal-900 tabular-nums">
                    ₹{selectedDestination.startingPrice.toLocaleString()}
                    <span className="text-xs text-stone-500 font-normal"> / person</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-stone-600 leading-relaxed mb-5">
                {selectedDestination.tagline}
              </p>

              <div className="mb-6">
                <div className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5">
                  Top Experiences & Highlights
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedDestination.highlights.map((h) => (
                    <div
                      key={h}
                      className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100 text-xs text-stone-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedDestination(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const dest = selectedDestination;
                    setSelectedDestination(null);
                    onPlanDestination(dest);
                  }}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-200" />
                  <span>Plan This Trip with Voyan AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
