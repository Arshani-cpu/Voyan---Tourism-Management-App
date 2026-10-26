import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Compass,
  Wallet,
  Calendar,
  Mountain,
  Palmtree,
  Landmark,
  Heart,
  Users,
  Send
} from 'lucide-react';
import { TravellerGroupType } from '../types/travel';

export interface ExamplePromptItem {
  id: string;
  category: 'budget' | 'mountains' | 'heritage' | 'beach' | 'seniors' | 'adventure';
  categoryLabel: string;
  prompt: string;
  destination: string;
  duration: string;
  durationDays: number;
  budgetEstimate: number; // in INR
  budgetLabel: string;
  groupType: TravellerGroupType;
  highlights: string[];
  vibe: string;
}

export const EXAMPLE_PROMPTS: ExamplePromptItem[] = [
  {
    id: 'ooty-budget-5000',
    category: 'budget',
    categoryLabel: 'Budget & Weekend',
    prompt: 'Plan a 3-day trip to Ooty under ₹5,000',
    destination: 'Ooty & Nilgiris',
    duration: '3 Days / 2 Nights',
    durationDays: 3,
    budgetEstimate: 4850,
    budgetLabel: 'Under ₹5,000 / person',
    groupType: 'solo',
    highlights: ['UNESCO Toy Train', 'Doddabetta Peak bus', 'Tea Factory tasting', 'Lake walk'],
    vibe: 'Budget Hill Getaway'
  },
  {
    id: 'peaceful-mountains',
    category: 'mountains',
    categoryLabel: 'Mountain Escapes',
    prompt: 'A peaceful weekend in the mountains',
    destination: 'Himachal Pradesh (Manali & Jibhi)',
    duration: '3 Days / 2 Nights',
    durationDays: 3,
    budgetEstimate: 7500,
    budgetLabel: '₹7,500 / person',
    groupType: 'couple',
    highlights: ['Pine forest walking trails', 'Riverside wooden cafes', 'Hot springs', 'Stargazing'],
    vibe: 'Tranquil Serenity'
  },
  {
    id: 'south-india-cultural',
    category: 'heritage',
    categoryLabel: 'Culture & Heritage',
    prompt: 'A 7-day cultural tour of South India for two',
    destination: 'Kerala & Tamil Nadu',
    duration: '7 Days / 6 Nights',
    durationDays: 7,
    budgetEstimate: 18500,
    budgetLabel: '₹18,500 / person',
    groupType: 'couple',
    highlights: ['Madurai Meenakshi Amman Temple', 'Munnar Spice Gardens', 'Kochi Kathakali Theatre', 'Backwater Cruise'],
    vibe: 'Living Heritage'
  },
  {
    id: 'andaman-beach-family',
    category: 'beach',
    categoryLabel: 'Beach & Coastal',
    prompt: 'Family-friendly beach vacation in Andaman for a week',
    destination: 'Andaman & Nicobar (Havelock & Neil)',
    duration: '7 Days / 6 Nights',
    durationDays: 7,
    budgetEstimate: 24000,
    budgetLabel: '₹24,000 / person',
    groupType: 'family',
    highlights: ['Radhanagar gentle surf beach', 'Glass-bottom boat coral ride', 'Elephant beach walk', 'Cellular Jail light show'],
    vibe: 'Coastal Tropical'
  },
  {
    id: 'rishikesh-adventure-budget',
    category: 'adventure',
    categoryLabel: 'Adventure & Youth',
    prompt: 'Adventure trip to Rishikesh with budget constraints',
    destination: 'Rishikesh, Uttarakhand',
    duration: '4 Days / 3 Nights',
    durationDays: 4,
    budgetEstimate: 5800,
    budgetLabel: 'Under ₹6,000 / person',
    groupType: 'friends',
    highlights: ['Grade III Ganga river rafting', 'Riverside cliff jumping', 'Beatles Ashram murals', 'Triveni Ghat Ganga Aarti'],
    vibe: 'High Adrenaline'
  },
  {
    id: 'varanasi-seniors-gentle',
    category: 'seniors',
    categoryLabel: 'Senior & Gentle Pace',
    prompt: 'Spiritual Varanasi & Prayagraj pilgrimage with minimal walking and wheelchair support',
    destination: 'Varanasi, Uttar Pradesh',
    duration: '4 Days / 3 Nights',
    durationDays: 4,
    budgetEstimate: 12500,
    budgetLabel: '₹12,500 / person',
    groupType: 'seniors',
    highlights: ['Private wooden boat with low steps', 'Kashi Vishwanath corridor wheelchair access', 'Sarnath deer park', 'Subah-e-Banaras aarti'],
    vibe: 'Sacred & Accessible'
  },
  {
    id: 'rajasthan-royal-heritage',
    category: 'heritage',
    categoryLabel: 'Culture & Heritage',
    prompt: 'Royal palaces, desert sand dunes and stargazing in Rajasthan for friends',
    destination: 'Jaipur & Jaisalmer, Rajasthan',
    duration: '5 Days / 4 Nights',
    durationDays: 5,
    budgetEstimate: 16000,
    budgetLabel: '₹16,000 / person',
    groupType: 'friends',
    highlights: ['Amer Fort sunrise view', 'Jaisalmer golden sandstone havelis', 'Sam sand dunes folk music', 'Desert campfire dinner'],
    vibe: 'Regal Majesty'
  },
  {
    id: 'coorg-monsoon-coffee',
    category: 'mountains',
    categoryLabel: 'Mountain Escapes',
    prompt: 'Scenic monsoon drive and coffee estate homestay in Coorg with Kodava cuisine',
    destination: 'Coorg (Madikeri), Karnataka',
    duration: '3 Days / 2 Nights',
    durationDays: 3,
    budgetEstimate: 6900,
    budgetLabel: '₹6,900 / person',
    groupType: 'couple',
    highlights: ['Abbey & Raja seat misty views', 'Private organic coffee walk', 'Dubare elephant camp', 'Authentic Pandi curry & Akki rotti'],
    vibe: 'Misty Coffee Hills'
  }
];

interface ExamplePromptsSectionProps {
  onSelectPrompt: (params: {
    query: string;
    destination?: string;
    budget?: number;
    travellers?: number;
  }) => void;
}

export const ExamplePromptsSection: React.FC<ExamplePromptsSectionProps> = ({ onSelectPrompt }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All AI Prompts' },
    { id: 'budget', label: 'Budget & Weekend' },
    { id: 'mountains', label: 'Mountain Escapes' },
    { id: 'heritage', label: 'Culture & Heritage' },
    { id: 'beach', label: 'Beach & Coastal' },
    { id: 'seniors', label: 'Senior & Gentle' },
    { id: 'adventure', label: 'Adventure' }
  ];

  const filteredPrompts =
    selectedCategory === 'all'
      ? EXAMPLE_PROMPTS
      : EXAMPLE_PROMPTS.filter((p) => p.category === selectedCategory);

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onSelectPrompt({
      query: customInput.trim(),
      budget: customInput.includes('5,000') || customInput.includes('5000') ? 5000 : 8000,
      travellers: 2
    });
  };

  return (
    <section id="example-prompts" className="py-16 sm:py-20 bg-stone-50/70 border-y border-stone-200/70 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-xs font-semibold mb-3 tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>Prompt Inspiration Gallery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#0F172A]">
              Explore with AI Search Prompts
            </h2>
            <p className="mt-2 text-stone-600 text-sm sm:text-base leading-relaxed">
              Voyan’s tourism engine interprets natural language to plan exact budgets, transit options,
              and accessibility requirements. Click any prompt below to watch the AI build a complete itinerary in real time.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-stone-500 bg-white border border-stone-200/90 rounded-xl px-4 py-3 shadow-2xs">
            <div>
              <span className="block font-bold text-stone-900 text-sm">8+</span>
              <span>Curated Prompts</span>
            </div>
            <div className="w-px h-8 bg-stone-200" />
            <div>
              <span className="block font-bold text-teal-800 text-sm">₹4,850 - ₹24k</span>
              <span>Budget Range</span>
            </div>
            <div className="w-px h-8 bg-stone-200" />
            <div>
              <span className="block font-bold text-stone-900 text-sm">5 Groups</span>
              <span>Solo to Seniors</span>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-white border border-stone-200/90 text-stone-700 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Prompts Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredPrompts.map((item) => (
            <div
              key={item.id}
              onClick={() =>
                onSelectPrompt({
                  query: item.prompt,
                  destination: item.destination,
                  budget: item.budgetEstimate,
                  travellers: item.groupType === 'solo' ? 1 : item.groupType === 'couple' ? 2 : 4
                })
              }
              className="group bg-white rounded-2xl border border-stone-200/90 hover:border-teal-600/50 p-5 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Card Top Meta */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-semibold">
                    {item.vibe}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleCopy(item.id, item.prompt, e)}
                    className="p-1 rounded text-stone-400 hover:text-teal-800 hover:bg-teal-50 transition-colors"
                    title="Copy prompt text"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-teal-700" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Prompt Text in quotation style */}
                <div className="relative mb-4">
                  <span className="text-teal-700 font-serif text-2xl font-bold leading-none select-none absolute -left-1 -top-2">
                    “
                  </span>
                  <p className="text-sm font-semibold text-[#0F172A] pl-3 leading-snug group-hover:text-teal-900 transition-colors">
                    {item.prompt}
                  </p>
                </div>

                {/* Destination & Duration & Budget tags */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5 font-medium text-stone-800">
                    <Compass className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span className="truncate">{item.destination}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      {item.duration}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-teal-800">
                      <Wallet className="w-3 h-3 text-teal-700" />
                      {item.budgetLabel}
                    </span>
                  </div>
                </div>

                {/* What AI Generates Highlights */}
                <div className="mt-3.5 pt-3 border-t border-stone-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Generates for you:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.highlights.map((h, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-stone-50 text-stone-600 px-2 py-0.5 rounded border border-stone-200/60"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-teal-800 group-hover:text-teal-950 flex items-center gap-1 transition-colors">
                  Generate Plan
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                  Instant
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Custom Prompt Bar */}
        <div className="mt-10 bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs">
          <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Sparkles className="w-4 h-4 text-teal-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Or test your own prompt, e.g. 'A 4-day monsoon road trip to Wayanad with treehouse stay'..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Generate with Voyan AI</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
