import React, { useState } from 'react';
import {
  User,
  Heart,
  Users,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Calendar,
  Wallet,
  Car,
  Clock,
  ArrowRight,
  Info,
  Scale
} from 'lucide-react';
import { GROUP_CARDS } from '../../data/groupItineraries';
import {
  TravellerGroupType,
  GroupPlanningConfig,
  SeniorPreferences,
  FamilyPreferences,
  FriendsPreferences,
  CouplePreferences,
  SoloPreferences
} from '../../types/travel';

interface WhoIsTravellingSectionProps {
  onGeneratePlan: (config: GroupPlanningConfig & { destination: string; dates: string }) => void;
  onOpenComparison: () => void;
}

export const WhoIsTravellingSection: React.FC<WhoIsTravellingSectionProps> = ({
  onGeneratePlan,
  onOpenComparison,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<TravellerGroupType>('seniors');

  // General fields
  const [destination, setDestination] = useState('Ooty & Nilgiris');
  const [dates, setDates] = useState('24 Oct – 26 Oct 2026');
  const [travellersCount, setTravellersCount] = useState(2);
  const [durationDays, setDurationDays] = useState(3);
  const [totalBudget, setTotalBudget] = useState(14000);
  const [transportPreference, setTransportPreference] = useState<
    GroupPlanningConfig['transportPreference']
  >('private_cab');

  // Group-specific states
  // Seniors
  const [walkingDifficulty, setWalkingDifficulty] = useState<SeniorPreferences['walkingDifficulty']>('flat');
  const [seniorAccessibility, setSeniorAccessibility] = useState<string[]>([
    'Step-free entry & ramps',
    'Elevator access required'
  ]);
  const [restBreakFrequency, setRestBreakFrequency] = useState<SeniorPreferences['restBreakFrequency']>('frequent_45m');
  const [seniorPace, setSeniorPace] = useState<SeniorPreferences['travelPace']>('gentle');

  // Families
  const [childrenAges, setChildrenAges] = useState<FamilyPreferences['childrenAgeRanges']>(['kids']);
  const [familyFacilities, setFamilyFacilities] = useState<string[]>([
    'Kid-friendly dining',
    'Spacious lawns & play zone'
  ]);

  // Friends
  const [friendsAdventure, setFriendsAdventure] = useState<FriendsPreferences['adventureLevel']>('moderate');
  const [friendsActivities, setFriendsActivities] = useState<string[]>([
    'Speedboating / Water Sports',
    'Campfire & acoustic music'
  ]);

  // Couples
  const [romanticExperiences, setRomanticExperiences] = useState<string[]>([
    'Candlelight dinner under glasshouse',
    'Private scenic boat cruise'
  ]);

  // Solo
  const [soloSafetyPriority, setSoloSafetyPriority] = useState<SoloPreferences['safetyPriority']>('very_high');

  const handleGroupSelect = (groupId: TravellerGroupType) => {
    setSelectedGroup(groupId);
    const card = GROUP_CARDS.find((c) => c.id === groupId);
    if (card) {
      setTravellersCount(card.defaultTravellers);
      if (groupId === 'solo') setTotalBudget(5000);
      else if (groupId === 'couple') setTotalBudget(15000);
      else if (groupId === 'friends') setTotalBudget(20000);
      else if (groupId === 'family') setTotalBudget(18000);
      else if (groupId === 'seniors') setTotalBudget(14000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config: GroupPlanningConfig & { destination: string; dates: string } = {
      groupType: selectedGroup,
      travellersCount,
      durationDays,
      totalBudget,
      transportPreference,
      destination,
      dates,
      seniorPrefs:
        selectedGroup === 'seniors'
          ? {
              walkingDifficulty,
              accessibilityNeeds: seniorAccessibility,
              restBreakFrequency,
              travelPace: seniorPace,
              requireGroundFloorOrLift: true,
            }
          : undefined,
      familyPrefs:
        selectedGroup === 'family'
          ? {
              childrenAgeRanges: childrenAges,
              familyFacilities,
              preferredPace: 'relaxed',
              kidFriendlyDining: true,
            }
          : undefined,
      friendsPrefs:
        selectedGroup === 'friends'
          ? {
              groupActivityType: friendsActivities,
              budgetStyle: 'balanced',
              nightlifeInterest: true,
              adventureLevel: friendsAdventure,
            }
          : undefined,
      couplePrefs:
        selectedGroup === 'couple'
          ? {
              romanticExperiences,
              intimacyPace: 'slow_intimate',
              scenicDining: true,
            }
          : undefined,
      soloPrefs:
        selectedGroup === 'solo'
          ? {
              safetyPriority: soloSafetyPriority,
              soloStayType: 'boutique_homestay',
              groupMeetupInterest: true,
            }
          : undefined,
    };

    onGeneratePlan(config);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'User':
        return <User className="w-5 h-5" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />;
      case 'Users':
        return <Users className="w-5 h-5 text-teal-700" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-teal-800" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  return (
    <section id="who-is-travelling" className="py-16 sm:py-24 bg-white border-t border-stone-200/80 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5 text-teal-700" />
              <span>Group-Aware Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] [text-wrap:balance]">
              Who is travelling?
            </h2>
            <p className="mt-2 text-sm text-stone-600 max-w-xl">
              Voyan tailors travel pace, hotel accessibility, physical exertion, and dining choices to your specific group dynamics.
            </p>
          </div>

          <button
            onClick={onOpenComparison}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all cursor-pointer self-start md:self-auto shrink-0 shadow-2xs"
          >
            <Scale className="w-4 h-4 text-teal-700" />
            <span>Compare Two Groups Side-by-Side</span>
          </button>
        </div>

        {/* 5 Selectable Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5 mb-10">
          {GROUP_CARDS.map((card) => {
            const isSelected = selectedGroup === card.id;
            return (
              <div
                key={card.id}
                onClick={() => handleGroupSelect(card.id)}
                className={`group relative rounded-2xl border cursor-pointer overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-700 ring-2 ring-teal-700 bg-teal-50/20 shadow-md -translate-y-1'
                    : 'border-stone-200/90 hover:border-teal-400/80 hover:shadow-sm bg-white'
                }`}
              >
                {/* Visual Image Carrier */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                  <img
                    src={card.image}
                    alt={card.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-teal-800 text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-stone-100 group-hover:bg-teal-50 flex items-center justify-center text-stone-700 group-hover:text-teal-900 transition-colors">
                        {getIcon(card.iconName)}
                      </div>
                      <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
                        {card.title}
                      </h3>
                    </div>

                    <p className="text-[11px] text-stone-600 leading-relaxed mb-3 line-clamp-3">
                      {card.tagline}
                    </p>
                  </div>

                  {/* Highlights Bullets */}
                  <div className="pt-2.5 border-t border-stone-100 space-y-1">
                    {card.highlightPointers.slice(0, 2).map((pt, i) => (
                      <div key={i} className="text-[10px] text-stone-500 flex items-center gap-1.5 truncate">
                        <span className="w-1 h-1 rounded-full bg-teal-600 shrink-0" />
                        <span className="truncate">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Group-Specific Customization Form Container */}
        <div className="bg-stone-50/80 rounded-2xl border border-stone-200/90 p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between pb-4 border-b border-stone-200/70 mb-6">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-800" />
                <h4 className="text-sm font-bold text-[#0F172A]">
                  Customizing Itinerary for:{' '}
                  <span className="text-teal-900 underline decoration-teal-300">
                    {GROUP_CARDS.find((c) => c.id === selectedGroup)?.title}
                  </span>
                </h4>
              </div>
              <span className="text-xs text-stone-500 font-mono">
                {selectedGroup.toUpperCase()} PROFILE
              </span>
            </div>

            {/* Standard Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* Destination */}
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full text-xs font-bold text-stone-900 bg-transparent focus:outline-none"
                />
              </div>

              {/* Dates */}
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                  Travel Dates
                </label>
                <input
                  type="text"
                  value={dates}
                  onChange={(e) => setDates(e.target.value)}
                  className="w-full text-xs font-bold text-stone-900 bg-transparent focus:outline-none"
                />
              </div>

              {/* Travellers Count */}
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                  Travellers
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">{travellersCount} People</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setTravellersCount(Math.max(1, travellersCount - 1))}
                      className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-xs font-bold"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setTravellersCount(travellersCount + 1)}
                      className="w-5 h-5 rounded bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Total Budget */}
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                  Total Budget (INR)
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900 font-mono tabular-nums">
                    ₹{totalBudget.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    (~₹{Math.round(totalBudget / Math.max(1, travellersCount)).toLocaleString()}/p)
                  </span>
                </div>
              </div>

              {/* Transport Preference */}
              <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                  Transit Style
                </label>
                <select
                  value={transportPreference}
                  onChange={(e) =>
                    setTransportPreference(e.target.value as GroupPlanningConfig['transportPreference'])
                  }
                  className="w-full text-xs font-bold text-stone-900 bg-transparent focus:outline-none"
                >
                  <option value="private_cab">Private Chauffeur Cab</option>
                  <option value="self_drive">Self-Drive Car / SUV</option>
                  <option value="train">Heritage Rail / Train</option>
                  <option value="flight">Flight + Local Taxi</option>
                </select>
              </div>
            </div>

            {/* Dynamic Group-Specific Inputs */}
            {selectedGroup === 'seniors' && (
              <div className="bg-white rounded-xl p-5 border border-teal-100 shadow-2xs mb-6 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-950 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>Senior Traveler Accessibility & Pacing Options</span>
                </div>

                {/* Explicit Responsible Accessibility Notice */}
                <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-200/80 text-[11px] text-teal-950 flex items-start gap-2">
                  <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Empowered Mobility:</strong> We do not assume all seniors have limited mobility. Recommendations are strictly calibrated according to your selected walking preferences and verified venue accessibility data.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1.5">
                      Walking Level Preference
                    </label>
                    <select
                      value={walkingDifficulty}
                      onChange={(e) => setWalkingDifficulty(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg bg-stone-50 border border-stone-200 font-medium"
                    >
                      <option value="flat">Flat paved terrain only (Zero stairs)</option>
                      <option value="moderate">Moderate walks with gentle ramps</option>
                      <option value="active">Active walkers (Comfortable on trails)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1.5">
                      Rest Break Cadence
                    </label>
                    <select
                      value={restBreakFrequency}
                      onChange={(e) => setRestBreakFrequency(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg bg-stone-50 border border-stone-200 font-medium"
                    >
                      <option value="frequent_45m">Frequent seated rest (Every 45-60 mins)</option>
                      <option value="standard_2h">Standard pauses (Every 2 hours)</option>
                      <option value="flexible">Flexible as needed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1.5">
                      Itinerary Pacing
                    </label>
                    <select
                      value={seniorPace}
                      onChange={(e) => setSeniorPace(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg bg-stone-50 border border-stone-200 font-medium"
                    >
                      <option value="gentle">Gentle & Unhurried (Max 2-3 stops/day)</option>
                      <option value="balanced">Balanced Exploration (3-4 stops/day)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {selectedGroup === 'family' && (
              <div className="bg-white rounded-xl p-5 border border-teal-100 shadow-2xs mb-6 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-950 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                  <span>Family & Child-Friendly Preferences</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1.5">
                      Children’s Age Group
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'toddlers', label: 'Toddlers (0-4 yrs)' },
                        { id: 'kids', label: 'Kids (5-11 yrs)' },
                        { id: 'teens', label: 'Teens (12+ yrs)' }
                      ].map((age) => (
                        <button
                          key={age.id}
                          type="button"
                          onClick={() => {
                            const val = age.id as any;
                            if (childrenAges.includes(val)) {
                              setChildrenAges(childrenAges.filter((a) => a !== val));
                            } else {
                              setChildrenAges([...childrenAges, val]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                            childrenAges.includes(age.id as any)
                              ? 'bg-teal-800 text-white border-teal-800'
                              : 'bg-stone-50 text-stone-600 border-stone-200'
                          }`}
                        >
                          {age.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1.5">
                      Required Facilities
                    </label>
                    <div className="text-xs text-stone-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                        <span>Stroller-accessible pathways & wide lawns</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                        <span>Mild, kid-friendly dining options & high chairs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedGroup === 'friends' && (
              <div className="bg-white rounded-xl p-5 border border-teal-100 shadow-2xs mb-6 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-950 uppercase tracking-wide">
                  <Users className="w-4 h-4 text-teal-700" />
                  <span>Friends Group Adventure & Split Budget</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1.5">
                      Adventure & Energy Level
                    </label>
                    <select
                      value={friendsAdventure}
                      onChange={(e) => setFriendsAdventure(e.target.value as any)}
                      className="w-full p-2.5 rounded-lg bg-stone-50 border border-stone-200 font-medium"
                    >
                      <option value="high">High Energy (Speedboating, trekking, late nights)</option>
                      <option value="moderate">Balanced (Scenic hikes, cafe crawls, sightseeing)</option>
                      <option value="mild">Relaxed (Chilling in cottages & scenic viewpoints)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1.5">
                      Automatic Per-Person Split
                    </label>
                    <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-teal-900 font-bold font-mono">
                      ₹{Math.round(totalBudget / Math.max(1, travellersCount)).toLocaleString()} / friend
                      <span className="text-[11px] font-normal text-stone-500 ml-2">
                        (Equal split for {travellersCount} people)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedGroup === 'couple' && (
              <div className="bg-white rounded-xl p-5 border border-teal-100 shadow-2xs mb-6 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-950 uppercase tracking-wide">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>Romantic Experiences & Intimacy Level</span>
                </div>

                <div className="text-xs text-stone-600 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>Private sunset boat cruise on secluded cove</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>Candlelight glasshouse dining with fireplace</span>
                  </div>
                </div>
              </div>
            )}

            {selectedGroup === 'solo' && (
              <div className="bg-white rounded-xl p-5 border border-teal-100 shadow-2xs mb-6 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-950 uppercase tracking-wide">
                  <User className="w-4 h-4 text-teal-700" />
                  <span>Solo Explorer Safety & Independent Preferences</span>
                </div>

                <div className="text-xs text-stone-600 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>24/7 Safety verified homestays & well-lit roads</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span>Social tea tasting tables & friendly co-working cafes</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200/70">
              <div className="text-xs text-stone-500">
                Instant AI synthesis tailored specifically for {selectedGroup.toUpperCase()} dynamics.
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 active:scale-[0.98] rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-teal-200" />
                <span>Generate {GROUP_CARDS.find((c) => c.id === selectedGroup)?.title} Itinerary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
