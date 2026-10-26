import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Calendar,
  Users,
  Wallet,
  Sparkles,
  MapPin,
  Clock,
  Compass,
  CheckCircle,
  SlidersHorizontal,
  ChevronDown,
  Music,
  Scale,
  ShieldCheck,
  Heart,
  Baby,
  User,
  Ticket,
  Car,
  Layers,
  Building,
  FolderArchive,
  Luggage,
  ShieldAlert
} from 'lucide-react';
import { TripPlan, Activity, RestaurantRecommendation, TravellerGroupType } from '../../types/travel';
import { DayItinerary } from './DayItinerary';
import { InteractiveMap } from './InteractiveMap';
import { EditActivityModal } from './EditActivityModal';
import { NearbyEssentialsDrawer } from './NearbyEssentialsDrawer';
import { BudgetTransitPassesView } from '../BudgetTransit/BudgetTransitPassesView';
import { TripVaultHub } from '../TripVault/TripVaultHub';
import { AutomatedPackingGenerator } from '../PackingList/AutomatedPackingGenerator';
import { RealtimeGoogleIntel } from './RealtimeGoogleIntel';
import { GROUP_CARDS } from '../../data/groupItineraries';

interface TripPlannerViewProps {
  plan: TripPlan;
  onUpdatePlan: (updatedPlan: TripPlan) => void;
  onSaveTrip: (plan: TripPlan) => void;
  onShareTrip: (plan: TripPlan) => void;
  onBackToHome: () => void;
  onOpenSoundscapes: (dest?: string) => void;
  onChangeGroupType: (group: TravellerGroupType) => void;
  onOpenComparison: () => void;
  onSectionChange: (section: 'itinerary' | 'vault' | 'packing' | 'budget_transit' | 'nearby') => void;
  isSaved: boolean;
  initialSection?: 'itinerary' | 'vault' | 'packing' | 'budget_transit' | 'nearby';
  onOpenSOS?: () => void;
}

export const TripPlannerView: React.FC<TripPlannerViewProps> = ({
  plan,
  onUpdatePlan,
  onSaveTrip,
  onShareTrip,
  onBackToHome,
  onOpenSoundscapes,
  onChangeGroupType,
  onOpenComparison,
  onSectionChange,
  isSaved,
  initialSection = 'itinerary',
  onOpenSOS,
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activePlannerSection, setActivePlannerSection] = useState<'itinerary' | 'vault' | 'packing' | 'budget_transit' | 'nearby'>(initialSection);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    plan.days[0]?.activities[0]?.id || null
  );
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [saveToast, setSaveToast] = useState(false);
  const [mobileTab, setMobileTab] = useState<'content' | 'map'>('content');

  useEffect(() => {
    setActivePlannerSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    setActiveDayIndex(0);
    setSelectedActivityId(plan.days[0]?.activities[0]?.id || null);
    setMobileTab('content');
  }, [plan.id]);

  const handleSectionChange = (section: 'itinerary' | 'vault' | 'packing' | 'budget_transit' | 'nearby') => {
    setActivePlannerSection(section);
    onSectionChange(section);
  };

  const currentDay = plan.days[activeDayIndex] || plan.days[0];

  const handleSelectActivity = (id: string) => {
    setSelectedActivityId(id);
  };

  const handleOpenEdit = (act: Activity) => {
    setEditingActivity(act);
    setIsEditingModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingActivity(null);
    setIsEditingModalOpen(true);
  };

  const handleSaveActivity = (activity: Activity) => {
    const updated: TripPlan = JSON.parse(JSON.stringify(plan));
    const targetDay = updated.days[activeDayIndex];
    if (!targetDay) return;

    const existingIdx = targetDay.activities.findIndex((a) => a.id === activity.id);
    if (existingIdx >= 0) {
      targetDay.activities[existingIdx] = activity;
    } else {
      targetDay.activities.push(activity);
    }

    const allActivitiesCost = updated.days.reduce(
      (sum, d) => sum + d.activities.reduce((s, a) => s + (Number(a.costEstimate) || 0), 0),
      0
    );
    updated.budgetTotal = Math.max(updated.budgetTotal, allActivitiesCost);

    onUpdatePlan(updated);
  };

  const handleDeleteActivity = (activityId: string) => {
    const updated: TripPlan = JSON.parse(JSON.stringify(plan));
    const targetDay = updated.days[activeDayIndex];
    if (!targetDay) return;

    targetDay.activities = targetDay.activities.filter((a) => a.id !== activityId);
    onUpdatePlan(updated);
  };

  const handleAddRestaurantToDay = (restaurant: RestaurantRecommendation) => {
    const updated: TripPlan = JSON.parse(JSON.stringify(plan));
    const targetDay = updated.days[activeDayIndex];
    if (!targetDay) return;

    const diningActivity: Activity = {
      id: `act-dine-${Date.now()}`,
      time: '01:15 PM',
      title: `Lunch at ${restaurant.name}`,
      description: `Authentic regional dining. Recommended highlight: ${restaurant.highlightDish}.`,
      category: 'food',
      duration: '1.25 hrs',
      costEstimate: Math.round(restaurant.avgCostForTwo / 2),
      locationName: restaurant.location,
      coordinates: { x: 42, y: 52 },
      tips: `Try the ${restaurant.highlightDish} with regional hot beverages.`
    };

    targetDay.activities.push(diningActivity);
    onUpdatePlan(updated);
  };

  const handleSaveClick = () => {
    onSaveTrip(plan);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleUpdateTotalBudget = (newTotal: number) => {
    const updated: TripPlan = {
      ...plan,
      budgetTotal: newTotal,
      budgetPerPerson: Math.round(newTotal / Math.max(1, plan.travellersCount))
    };
    onUpdatePlan(updated);
  };

  const currentGroupCard = GROUP_CARDS.find((c) => c.id === (plan.groupType || 'seniors'));

  return (
    <div className="min-h-screen bg-[#FBFBFA] pb-24 text-left">
      {/* Top Breadcrumb & Action Strip */}
      <div className="bg-white border-b border-stone-200/80 sticky top-18 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-teal-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Explore</span>
            </button>

            {/* Group Switcher Dropdown */}
            <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-stone-200">
              <span className="text-[11px] font-semibold text-stone-400 uppercase">Group:</span>
              <select
                value={plan.groupType || 'seniors'}
                onChange={(e) => onChangeGroupType(e.target.value as TravellerGroupType)}
                className="text-xs font-bold text-teal-900 bg-stone-50 border border-stone-200/90 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
              >
                {GROUP_CARDS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons: Soundtrack, Compare, Save, Share */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenSoundscapes(plan.destination)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200/70 transition-colors cursor-pointer"
              title="Generate travel music with Lyria"
            >
              <Music className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trip Music</span>
            </button>

            <button
              onClick={onOpenComparison}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Compare Groups</span>
            </button>

            <button
              onClick={handleSaveClick}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-teal-50 border-teal-200 text-teal-800'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-teal-800' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={() => onShareTrip(plan)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            {onOpenSOS && (
              <button
                onClick={onOpenSOS}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-red-700 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-lg transition-colors cursor-pointer shadow-2xs group"
                title="Emergency SOS - Auto-sends SMS & GPS to Contacts (Shift + S)"
                aria-label="Emergency SOS"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-600 group-hover:text-white animate-pulse" />
                <span>SOS</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Save Success Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-teal-400" />
          <span>Itinerary saved to My Trips!</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Visual Destination Header Card with Group-Aware Badge */}
        <div className="relative rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm mb-6 bg-stone-900 text-white">
          <div className="relative aspect-[21/9] sm:aspect-[24/7] w-full min-h-[190px]">
            <img
              src={plan.coverImage}
              alt={plan.destination}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
            
            <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-end">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-teal-200 mb-1.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {plan.destination}, {plan.state}
                </span>
                <span aria-hidden="true">·</span>
                <span>{plan.durationDays} Days</span>
                <span aria-hidden="true">·</span>
                <span className="px-2 py-0.5 rounded-md bg-teal-800 text-white font-bold text-[11px]">
                  Tailored for {currentGroupCard?.title || 'Travelers'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">
                {plan.title}
              </h1>

              <p className="text-xs sm:text-sm text-stone-200 max-w-2xl leading-relaxed line-clamp-2">
                {plan.overviewSummary}
              </p>

              {/* Parameter Metrics Bar */}
              <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-1.5 text-stone-200">
                    <Calendar className="w-4 h-4 text-teal-300" />
                    <span>{plan.travelDates.start} – {plan.travelDates.end}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-200">
                    <Users className="w-4 h-4 text-teal-300" />
                    <span>{plan.travellersCount} Travelers</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-200">
                    <Wallet className="w-4 h-4 text-teal-300" />
                    <span className="font-semibold text-white tabular-nums">
                      ₹{plan.budgetPerPerson.toLocaleString()} / person
                    </span>
                    <span className="text-stone-400 font-mono text-[11px]">
                      (₹{plan.budgetTotal.toLocaleString()} total)
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-[11px] font-medium text-white">
                    Transit: {plan.transportPreference}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Tabs Switcher: 4 Integrated Modules */}
        <div className="flex items-center gap-2 mb-6 p-1.5 bg-stone-100/90 rounded-2xl border border-stone-200/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => handleSectionChange('itinerary')}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activePlannerSection === 'itinerary'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-4 h-4 text-teal-800" />
            <span>Itinerary & Schedule</span>
          </button>

          <button
            onClick={() => handleSectionChange('vault')}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activePlannerSection === 'vault'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Ticket className="w-4 h-4 text-sky-700" />
            <span>Trip Vault & Tickets</span>
            <span className="w-4 h-4 rounded-full bg-teal-800 text-white text-[9px] font-bold flex items-center justify-center">
              5
            </span>
          </button>

          <button
            onClick={() => handleSectionChange('packing')}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activePlannerSection === 'packing'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Luggage className="w-4 h-4 text-emerald-700" />
            <span>Packing List</span>
            <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-1.5 py-0.2 rounded border border-teal-200">
              Auto
            </span>
          </button>

          <button
            onClick={() => handleSectionChange('budget_transit')}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activePlannerSection === 'budget_transit'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Wallet className="w-4 h-4 text-teal-700" />
            <span>Budget & Transit</span>
          </button>

          <button
            onClick={() => handleSectionChange('nearby')}
            className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activePlannerSection === 'nearby'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Building className="w-4 h-4 text-teal-700" />
            <span>Nearby Essentials</span>
          </button>
        </div>

        {/* Mobile View Switcher (Content vs Map) */}
        <div className="lg:hidden flex items-center p-1 bg-stone-100 rounded-xl mb-6 text-xs font-semibold">
          <button
            onClick={() => setMobileTab('content')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              mobileTab === 'content' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600'
            }`}
          >
            Plan Details
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              mobileTab === 'map' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600'
            }`}
          >
            Map View
          </button>
        </div>

        {/* Desktop Side-by-Side Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Switchable Sections */}
          <div
            className={`lg:col-span-7 xl:col-span-7 space-y-8 ${
              mobileTab === 'map' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Section 1: Itinerary */}
            {activePlannerSection === 'itinerary' && (
              <>
                {/* Real-Time Google Intelligence Bar */}
                <RealtimeGoogleIntel destination={plan.destination} />

                <DayItinerary
                  days={plan.days}
                  activeDayIndex={activeDayIndex}
                  onSelectDay={setActiveDayIndex}
                  selectedActivityId={selectedActivityId}
                  onSelectActivity={handleSelectActivity}
                  onEditActivity={handleOpenEdit}
                  onDeleteActivity={handleDeleteActivity}
                  onAddActivity={handleOpenAdd}
                  onAddRestaurantToDay={handleAddRestaurantToDay}
                  groupType={plan.groupType}
                  onChangeGroupType={onChangeGroupType}
                />

              </>
            )}

            {/* Section 2: Trip Vault & Digital Passbook */}
            {activePlannerSection === 'vault' && (
              <TripVaultHub
                plan={plan}
                onUpdatePlan={onUpdatePlan}
              />
            )}

            {/* Section 3: Automated Packing List Generator */}
            {activePlannerSection === 'packing' && (
              <AutomatedPackingGenerator
                activePlan={plan}
                initialDestination={plan.destination}
                initialDays={plan.durationDays}
                initialGroupType={plan.groupType}
              />
            )}

            {/* Section 4: Budget Planning, Transit & Passes */}
            {activePlannerSection === 'budget_transit' && (
              <BudgetTransitPassesView
                destinationName={plan.destination}
                totalBudget={plan.budgetTotal}
                travellersCount={plan.travellersCount}
                durationDays={plan.durationDays}
                groupType={plan.groupType}
                onUpdateTotalBudget={handleUpdateTotalBudget}
              />
            )}

            {/* Section 4: Nearby Essentials (Hotels, Restaurants, Police, Petrol) */}
            {activePlannerSection === 'nearby' && (
              <div id="nearby-essentials-section">
                <NearbyEssentialsDrawer
                  destinationName={plan.destination}
                  onSelectAmenityOnMap={(amenity) => {
                    setSelectedActivityId(amenity.id);
                    if (mobileTab === 'content') setMobileTab('map');
                  }}
                  onOpenSOS={onOpenSOS}
                />
              </div>
            )}
          </div>

          {/* Right Column: Interactive Map Canvas (Persistent side-by-side on desktop) */}
          <div
            className={`lg:col-span-5 xl:col-span-5 ${
              mobileTab === 'content' ? 'hidden lg:block' : 'block'
            }`}
          >
            <InteractiveMap
              activities={currentDay?.activities || []}
              restaurants={currentDay?.diningOptions || []}
              selectedActivityId={selectedActivityId}
              onSelectActivity={handleSelectActivity}
              destinationName={plan.destination}
            />
          </div>
        </div>
      </div>

      {/* Edit Activity Modal */}
      <EditActivityModal
        activity={editingActivity}
        isOpen={isEditingModalOpen}
        onClose={() => setIsEditingModalOpen(false)}
        onSave={handleSaveActivity}
      />
    </div>
  );
};
