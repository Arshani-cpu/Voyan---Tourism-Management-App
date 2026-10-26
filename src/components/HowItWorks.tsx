import React from 'react';
import {
  MessageSquareText,
  Compass,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowUp,
  MapPin,
  CheckCircle2,
  Ticket,
  ChevronRight,
  Zap
} from 'lucide-react';

interface HowItWorksProps {
  onSelectPrompt?: (params: { query: string; budget?: number; travellers?: number }) => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onSelectPrompt }) => {
  const steps = [
    {
      number: '01',
      title: 'Describe Your Dream Trip',
      blurb:
        'Tell Voyan your destination, budget, or vibe in plain English. No rigid forms—just describe what you feel like doing.',
      icon: MessageSquareText,
      pill: 'e.g. "3-day Ooty trip under ₹5k"',
      promptQuery: 'Plan a 3-day trip to Ooty under ₹5,000 with tea estate walks',
      accentColor: 'from-teal-500/10 to-teal-500/5',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      iconBg: 'bg-teal-800 text-white',
    },
    {
      number: '02',
      title: 'Get Your AI Plan',
      blurb:
        'In seconds, receive an hour-by-hour itinerary with verified travel times, geographic clustering, and an interactive route map.',
      icon: Compass,
      pill: 'Zero backtracking guarantee',
      promptQuery: 'A peaceful weekend in the mountains of Himachal',
      accentColor: 'from-sky-500/10 to-sky-500/5',
      badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
      iconBg: 'bg-sky-800 text-white',
    },
    {
      number: '03',
      title: 'Customize & Book',
      blurb:
        'Swap activities, adapt pacing for seniors or kids, check cabin packing weights, and keep boarding tickets in your digital Vault.',
      icon: Sliders,
      pill: 'Digital Vault + Packing sync',
      promptQuery: 'Luxury beach escape to South Goa with sea-view dining',
      accentColor: 'from-emerald-500/10 to-emerald-500/5',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      iconBg: 'bg-emerald-800 text-white',
    },
  ];

  const handleScrollToSearch = (sampleQuery?: string) => {
    const input = document.getElementById('hero-prompt-input') as HTMLInputElement | null;
    const searchSection = document.getElementById('ai-travel-search');

    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (input) {
      setTimeout(() => {
        input.focus();
        if (sampleQuery) {
          input.value = sampleQuery;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }, 400);
    }
  };

  const handlePromptClick = (promptQuery: string) => {
    if (onSelectPrompt) {
      onSelectPrompt({ query: promptQuery });
    } else {
      handleScrollToSearch(promptQuery);
    }
  };

  return (
    <section id="how-it-works" className="py-14 sm:py-20 bg-stone-50/60 border-y border-stone-200/70 relative overflow-hidden">
      {/* Soft background ambient blurs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-teal-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 bg-sky-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/90 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3.5 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>How Voyan Works</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0F172A] [text-wrap:balance]">
            From your raw ideas to a booked journey in 3 steps
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-600 leading-relaxed">
            Planning a multi-day trip doesn't need twenty open browser tabs. Experience a clean, intelligent travel engine built around you.
          </p>
        </div>

        {/* 3 Step Cards with Flow Connectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.number}
                className="group relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-stone-200/90 shadow-sm hover:shadow-md hover:border-teal-400/80 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top bar: Step Badge & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200">
                        Step {step.number}
                      </span>
                    </div>

                    <div className={`w-11 h-11 rounded-2xl ${step.iconBg} flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 duration-200`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Concise Blurb */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight mb-2.5">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-5">
                    {step.blurb}
                  </p>
                </div>

                {/* Micro Action / Pill at Card Bottom */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-stone-500 truncate">
                    {step.pill}
                  </span>
                  <button
                    onClick={() => handlePromptClick(step.promptQuery)}
                    className="shrink-0 text-[11px] font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                    title={`Try: ${step.promptQuery}`}
                  >
                    <span>Try it</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtle Step Index Watermark */}
                <span className="absolute -bottom-3 -right-2 text-6xl font-black font-mono text-stone-900/[0.03] select-none pointer-events-none">
                  {step.number}
                </span>
              </div>
            );
          })}
        </div>

        {/* Strategic Conversion Strip: Direct Guide Towards the AI Search Box */}
        <div className="mt-10 sm:mt-12 bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-teal-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5 bg-gradient-to-r from-teal-900 via-teal-800 to-teal-950 text-white">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-teal-200 shrink-0">
              <Zap className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Ready to plan your next journey?
              </h4>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-normal max-w-xl">
                Enter any destination or budget above. Voyan immediately crafts a custom day-by-day plan with live map routing and transit passes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-end">
            <button
              onClick={() => handleScrollToSearch()}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-teal-950 hover:bg-teal-50 font-extrabold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Jump to AI Search Box</span>
              <ArrowUp className="w-4 h-4 text-teal-800" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
