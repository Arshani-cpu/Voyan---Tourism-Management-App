import React from 'react';
import { Music, Sparkles, Disc, Play, ArrowRight, Layers, Clock } from 'lucide-react';

interface VoyanSoundscapesSectionProps {
  onOpenGenerator: (destination?: string) => void;
}

export const VoyanSoundscapesSection: React.FC<VoyanSoundscapesSectionProps> = ({
  onOpenGenerator,
}) => {
  const soundscapeCards = [
    {
      title: 'Nilgiri Morning Mist',
      modelType: 'lyria-3-clip-preview',
      duration: '30s Clip',
      destination: 'Ooty & Nilgiris',
      mood: 'Acoustic bamboo flute & morning bird ambience',
      tempo: '64 BPM · Serene',
    },
    {
      title: 'South Goa Sunset Lounge',
      modelType: 'lyria-3-clip-preview',
      duration: '30s Clip',
      destination: 'Goa Coast',
      mood: 'Nylon chillout chords & gentle shore wave percussion',
      tempo: '82 BPM · Relaxed',
    },
    {
      title: 'Royal Rajasthan Heritage',
      modelType: 'lyria-3-pro-preview',
      duration: 'Full-Length Track',
      destination: 'Jaipur & Thar',
      mood: 'Resonant sitar, ambient tanpura & camel bell echoes',
      tempo: '76 BPM · Regal',
    },
    {
      title: 'Himachal Pine Sanctuary',
      modelType: 'lyria-3-pro-preview',
      duration: 'Full-Length Track',
      destination: 'Himachal Valleys',
      mood: 'Meditative wooden flute & snow-peak acoustic harmonics',
      tempo: '60 BPM · Atmospheric',
    },
  ];

  return (
    <section id="soundscapes" className="py-16 sm:py-20 bg-stone-50/70 border-t border-stone-200/80 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>Lyria AI Audio Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] [text-wrap:balance]">
              Voyan Travel Soundscapes
            </h2>
            <p className="mt-2 text-sm text-stone-600 max-w-xl">
              Turn your destination dreams into custom ambient music. Generate 30-second clips with{' '}
              <span className="font-semibold text-stone-800">lyria-3-clip-preview</span> or full-length road trip tracks with{' '}
              <span className="font-semibold text-stone-800">lyria-3-pro-preview</span>.
            </p>
          </div>

          <button
            onClick={() => onOpenGenerator()}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-all shadow-xs cursor-pointer self-start md:self-auto shrink-0"
          >
            <Music className="w-4 h-4 text-teal-200" />
            <span>Generate Music with Lyria</span>
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {soundscapeCards.map((sc, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs hover:border-teal-700/40 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center group-hover:bg-teal-800 group-hover:text-white transition-colors">
                    <Disc className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                    {sc.duration}
                  </span>
                </div>

                <div className="text-[11px] text-stone-500 font-medium">{sc.destination}</div>
                <h3 className="text-base font-bold text-[#0F172A] tracking-tight group-hover:text-teal-900 transition-colors mt-0.5">
                  {sc.title}
                </h3>
                <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {sc.mood}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400 font-mono">{sc.tempo}</span>
                <button
                  onClick={() => onOpenGenerator(sc.destination)}
                  className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Synthesize</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
