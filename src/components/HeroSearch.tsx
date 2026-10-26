import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Users,
  Wallet,
  ArrowRight,
  Compass,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import heroStoryImage from '../assets/images/hero_voyan_travel_1792467058450.jpg';
import heroBackdropImage from '../assets/images/dest_kerala_backwaters_1792467358939.jpg';

interface HeroSearchProps {
  onPlanTrip: (params: {
    query: string;
    destination?: string;
    dates?: string;
    travellers?: number;
    budget?: number;
    interests?: string[];
  }) => void;
  isGenerating?: boolean;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ onPlanTrip, isGenerating = false }) => {
  const [promptText, setPromptText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dates, setDates] = useState('24 Oct – 26 Oct 2026');
  const [travellers, setTravellers] = useState(2);
  const [budgetPerPerson, setBudgetPerPerson] = useState(6500);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Heritage & History',
    'Scenic Viewpoints'
  ]);

  const interestOptions = [
    'Heritage & History',
    'Scenic Viewpoints',
    'Tea & Spice Estates',
    'Local Dining',
    'Beaches & Waters',
    'Trekking & Adventure'
  ];

  const featuredExamplePrompts = [
    'A 7-day cultural tour of South India for two',
    'Family-friendly beach vacation in Andaman for a week',
    'Adventure trip to Rishikesh with budget constraints'
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = promptText.trim() || featuredExamplePrompts[0];
    onPlanTrip({
      query,
      dates,
      travellers,
      budget: budgetPerPerson,
      interests: selectedInterests
    });
  };

  const handlePromptClick = (example: string) => {
    setPromptText(example);
    onPlanTrip({
      query: example,
      dates,
      travellers,
      budget: example.includes('budget') ? 4500 : budgetPerPerson,
      interests: selectedInterests
    });
  };

  return (
    <section id="ai-travel-search" className="relative pt-12 pb-10 lg:pt-16 lg:pb-14 overflow-hidden bg-slate-950">
      <div
        aria-hidden="true"
        className="voyan-hero-image"
        style={{ backgroundImage: `url("${heroBackdropImage}")` }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Header */}
        <div className="text-left max-w-4xl mr-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold mb-6 tracking-wide shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI travel planning, grounded in place</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white [text-wrap:balance] leading-[1.02]">
            Your next adventure,{' '}
            <span className="text-amber-300">
              thoughtfully planned.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-stone-200 leading-relaxed max-w-2xl">
            Describe your dream vacation in your own natural language. Voyan synthesizes
            personalized itineraries, verified transport intervals, and authentic regional spots in seconds.
          </p>
        </div>

        {/* Prominent Search & Customization Container */}
        <div className="mt-9 max-w-5xl">
          <div className="bg-white/95 rounded-2xl sm:rounded-3xl border border-white/70 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.65)] p-3 sm:p-5">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                    <Compass className="w-5 h-5 text-teal-800" />
                  </div>
                  <input
                    id="hero-prompt-input"
                    type="text"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Where do you dream of going? Describe your ideal vacation..."
                    className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base text-stone-900 placeholder:text-stone-400 rounded-xl bg-stone-50/70 border border-transparent focus:border-teal-700 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-1.5 px-3.5 py-3.5 text-xs font-semibold text-sky-950 bg-sky-50 border border-sky-100 hover:bg-sky-100 rounded-xl transition-colors whitespace-nowrap"
                    aria-label="Trip preferences"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-sky-700" />
                    <span className="hidden sm:inline">Preferences</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-stone-500 transition-transform ${
                        showFilters ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <button
                    type="submit"
                    disabled={isGenerating}
                      className="flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 active:scale-[0.98] rounded-xl shadow-md shadow-orange-900/15 transition-all whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <span>Plan My Trip</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Expandable Preferences Drawer */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left animate-in fade-in duration-150">
                  {/* Dates */}
                  <div className="p-3 rounded-xl bg-cyan-50/80 border border-cyan-100">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-700" />
                      <span>Travel Dates</span>
                    </label>
                    <input
                      type="text"
                      value={dates}
                      onChange={(e) => setDates(e.target.value)}
                      className="w-full text-xs font-semibold text-stone-800 bg-transparent focus:outline-none"
                    />
                  </div>

                  {/* Travellers */}
                  <div className="p-3 rounded-xl bg-orange-50/80 border border-orange-100">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 mb-1.5">
                      <Users className="w-3.5 h-3.5 text-teal-700" />
                      <span>Travellers</span>
                    </label>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-800">
                        {travellers} {travellers === 1 ? 'Traveller' : 'Travellers'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setTravellers(Math.max(1, travellers - 1))}
                          className="w-6 h-6 rounded-md bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-xs font-bold text-stone-700"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => setTravellers(travellers + 1)}
                          className="w-6 h-6 rounded-md bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-xs font-bold text-stone-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-100">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-stone-500 mb-1.5">
                      <Wallet className="w-3.5 h-3.5 text-teal-700" />
                      <span>Budget / Person</span>
                    </label>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-teal-900 tabular-nums">
                        ₹{budgetPerPerson.toLocaleString()}
                      </span>
                      <input
                        type="range"
                        min="2500"
                        max="35000"
                        step="500"
                        value={budgetPerPerson}
                        onChange={(e) => setBudgetPerPerson(Number(e.target.value))}
                        className="w-24 accent-teal-700 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="sm:col-span-3 pt-1">
                    <p className="text-xs font-medium text-stone-500 mb-2">Trip Interests & Style</p>
                    <div className="flex flex-wrap gap-2">
                      {interestOptions.map((opt) => {
                        const isSelected = selectedInterests.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleInterest(opt)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                              isSelected
                                ? 'bg-teal-800 text-white'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* The 3 Exact Example Prompts Requested */}
            <div className="mt-3.5 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-stone-400">Try asking:</span>
              {featuredExamplePrompts.map((prompt, index) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handlePromptClick(prompt)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-left flex items-center gap-1.5 group/prompt cursor-pointer ${[
                    'text-orange-950 bg-orange-50 border-orange-100 hover:bg-orange-100 hover:border-orange-300',
                    'text-sky-950 bg-sky-50 border-sky-100 hover:bg-sky-100 hover:border-sky-300',
                    'text-emerald-950 bg-emerald-50 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-300'
                  ][index % 3]}`}
                >
                  <Sparkles className={`w-3 h-3 shrink-0 opacity-80 group-hover/prompt:opacity-100 ${[
                    'text-orange-600',
                    'text-sky-600',
                    'text-emerald-700'
                  ][index % 3]}`} />
                  <span>"{prompt}"</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Visual Spotlight Card (Cinematic 16:9 Banner) */}
        <div className="mt-8 max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_-20px_rgba(15,23,42,0.2)] border border-orange-200/80 aspect-[16/9] sm:aspect-[21/9]">
            <img
              src={heroStoryImage}
              alt="Misty tea gardens of Nilgiri and Munnar at sunrise"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transform hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent flex flex-col justify-end p-6 sm:p-8">
              <div className="max-w-xl text-white">
                <div className="flex items-center gap-2 text-xs font-medium text-amber-200 tracking-wide uppercase mb-2">
                  <span>Signature Journey</span>
                  <span aria-hidden="true">·</span>
                  <span>Nilgiri Highlands & Munnar</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                  Misty Emerald Tea Valleys & Heritage Rail
                </h2>
                <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 leading-relaxed">
                  Wake up to rolling fog over 100-year-old tea estates, pine needle trails, and the
                  whistle of the historic blue steam locomotive.
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-stone-300">
                  <span>3 Days / 2 Nights</span>
                  <span aria-hidden="true">·</span>
                  <span>From ₹4,850 / person</span>
                  <span aria-hidden="true">·</span>
                  <button
                    onClick={() =>
                      onPlanTrip({
                        query: 'Plan a 3-day trip to Ooty under ₹5,000',
                        destination: 'Ooty & Nilgiris',
                        budget: 4850,
                        travellers: 2
                      })
                    }
                    className="text-white font-semibold underline underline-offset-4 hover:text-teal-300 transition-colors cursor-pointer"
                  >
                    Explore Itinerary &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
