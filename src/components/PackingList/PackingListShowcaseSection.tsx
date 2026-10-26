import React, { useState } from 'react';
import {
  Luggage,
  Sparkles,
  ArrowRight,
  Sun,
  Snowflake,
  CloudRain,
  Mountain,
  Palmtree,
  CheckCircle2,
  Scale,
  Calendar,
  Compass,
  Check
} from 'lucide-react';
import { DestinationClimate, TripType } from '../../types/packing';
import { PACKING_PRESETS, CLIMATE_DETAILS, generateAutomatedPackingList } from '../../data/packingGeneratorData';

interface PackingListShowcaseSectionProps {
  onOpenPackingPlanner: (params?: { climate?: DestinationClimate; tripType?: TripType; days?: number; destination?: string }) => void;
}

export const PackingListShowcaseSection: React.FC<PackingListShowcaseSectionProps> = ({
  onOpenPackingPlanner,
}) => {
  const [selectedClimate, setSelectedClimate] = useState<DestinationClimate>('mild_hills');
  const [selectedDays, setSelectedDays] = useState<number>(3);
  const [selectedTripType, setSelectedTripType] = useState<TripType>('luxury');

  const previewItems = React.useMemo(() => {
    return generateAutomatedPackingList(selectedClimate, selectedTripType, selectedDays, 'couple').slice(0, 5);
  }, [selectedClimate, selectedTripType, selectedDays]);

  const activeClimate = CLIMATE_DETAILS[selectedClimate];

  return (
    <section id="packing-generator-showcase" className="py-20 bg-gradient-to-b from-stone-50 to-white relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Luggage className="w-4 h-4 text-teal-700" />
            <span>Smart Travel Logistics</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Automated Packing List Generator
          </h2>
          <p className="mt-3 text-base sm:text-lg text-stone-600 leading-relaxed">
            Never under-pack for freezing high-altitude mountain winds or forget reef-safe sun lotions in coastal Goa. Voyan automatically adjusts quantities based on duration, climate realities, and travel pace.
          </p>
        </div>

        {/* Interactive Feature Demo Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Configuration Pane (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-stone-50/70 border-b lg:border-b-0 lg:border-r border-stone-200 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-stone-900 mb-1 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-teal-800" />
                  <span>Configure Trip Context</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Select climate and duration to preview auto-calculated gear.
                </p>
              </div>

              {/* Climate selector */}
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                  Destination Climate
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'mild_hills', label: 'Mild Hills (Ooty, Munnar)', icon: Mountain },
                    { id: 'tropical', label: 'Tropical Beach (Goa, Andaman)', icon: Palmtree },
                    { id: 'cold_snow', label: 'Snow & Cold (Manali, Ladakh)', icon: Snowflake },
                    { id: 'desert_arid', label: 'Desert Arid (Rajasthan)', icon: Sun },
                  ].map((c) => {
                    const IconComp = c.icon;
                    const isSelected = selectedClimate === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedClimate(c.id as DestinationClimate)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-teal-900 text-white border-teal-900 shadow-xs'
                            : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        <IconComp className={`w-4 h-4 shrink-0 ${isSelected ? 'text-teal-200' : 'text-teal-700'}`} />
                        <span className="truncate">{c.label.split(' ')[0]} {c.label.split(' ')[1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration selector */}
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2 flex items-center justify-between">
                  <span>Planned Duration</span>
                  <span className="text-teal-800 font-semibold">{selectedDays} Days</span>
                </label>
                <div className="flex gap-2">
                  {[3, 5, 7, 10, 14].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDays(d)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        selectedDays === d
                          ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {/* Trip style selector */}
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                  Trip Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'luxury', label: 'Luxury' },
                    { id: 'adventure', label: 'Adventure' },
                    { id: 'beach', label: 'Beach' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTripType(t.id as TripType)}
                      className={`py-1.5 px-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                        selectedTripType === t.id
                          ? 'bg-teal-900 text-white border-teal-900'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200">
              <button
                onClick={() =>
                  onOpenPackingPlanner({
                    climate: selectedClimate,
                    tripType: selectedTripType,
                    days: selectedDays,
                    destination: activeClimate.name,
                  })
                }
                className="w-full py-3 px-4 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold text-sm shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Full Packing Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Live Preview Pane (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Climate Alert Strip */}
              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold text-xs">
                    {activeClimate.tempRange.split('–')[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-teal-950">
                      {activeClimate.name} ({activeClimate.tempRange})
                    </h4>
                    <p className="text-[11px] text-teal-800/90 leading-tight">
                      {activeClimate.advisory}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Est. Weight</span>
                  <span className="text-xs font-extrabold text-teal-900">~6.8 kg (Cabin)</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Auto-Calculated Sample Items ({selectedDays} Days):
                </span>
                <span className="text-xs font-semibold text-teal-800">
                  +18 additional items in generator
                </span>
              </div>

              {/* Sample list preview */}
              <div className="space-y-2">
                {previewItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-stone-200/80 bg-stone-50/50 flex items-center justify-between gap-3 hover:bg-teal-50/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-teal-700">
                        {idx === 0 ? <Check className="w-3.5 h-3.5" /> : null}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-stone-900">{item.name}</span>
                        {item.tip && (
                          <p className="text-[11px] text-stone-500 line-clamp-1">
                            {item.tip}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded bg-white border border-stone-200 text-[10px] font-bold text-stone-700">
                        {item.quantity}
                      </span>
                      {item.isEssential && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[9px] font-bold">
                          Must-Have
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick value badges */}
            <div className="mt-6 pt-4 border-t border-stone-100 grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-2 rounded-xl bg-stone-50">
                <span className="font-extrabold text-stone-900 block text-sm">TSA-Safe</span>
                <span className="text-[10px] text-stone-500">Liquid &lt;100ml rule</span>
              </div>
              <div className="p-2 rounded-xl bg-stone-50">
                <span className="font-extrabold text-stone-900 block text-sm">Scale Ready</span>
                <span className="text-[10px] text-stone-500">Weight limits tracked</span>
              </div>
              <div className="p-2 rounded-xl bg-stone-50">
                <span className="font-extrabold text-stone-900 block text-sm">Shareable</span>
                <span className="text-[10px] text-stone-500">WhatsApp / PDF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
