import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Utensils,
  Lightbulb,
  Check,
  Sparkles,
  Ticket,
  Car,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { ItineraryDay, Activity, RestaurantRecommendation, TravellerGroupType } from '../../types/travel';
import { EntryPassModal } from '../Modals/EntryPassModal';

interface DayItineraryProps {
  days: ItineraryDay[];
  activeDayIndex: number;
  onSelectDay: (index: number) => void;
  selectedActivityId: string | null;
  onSelectActivity: (id: string) => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activityId: string) => void;
  onAddActivity: () => void;
  onAddRestaurantToDay: (restaurant: RestaurantRecommendation) => void;
  groupType?: TravellerGroupType;
  onChangeGroupType?: (newGroup: TravellerGroupType) => void;
}

export const DayItinerary: React.FC<DayItineraryProps> = ({
  days,
  activeDayIndex,
  onSelectDay,
  selectedActivityId,
  onSelectActivity,
  onEditActivity,
  onDeleteActivity,
  onAddActivity,
  onAddRestaurantToDay,
  groupType,
  onChangeGroupType,
}) => {
  const [selectedPassActivity, setSelectedPassActivity] = useState<Activity | null>(null);
  const currentDay = days[activeDayIndex] || days[0];

  if (!currentDay) {
    return (
      <div className="p-8 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
        No day itinerary available.
      </div>
    );
  }

  const categoryColors: Record<Activity['category'], { text: string; bg: string }> = {
    sightseeing: { text: 'text-sky-800', bg: 'bg-sky-50' },
    nature: { text: 'text-emerald-800', bg: 'bg-emerald-50' },
    heritage: { text: 'text-amber-800', bg: 'bg-amber-50' },
    food: { text: 'text-orange-800', bg: 'bg-orange-50' },
    leisure: { text: 'text-teal-800', bg: 'bg-teal-50' },
  };

  const dayTotalCost = currentDay.activities.reduce(
    (sum, a) => sum + (Number(a.costEstimate) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Day Selector Tabs (Functional Segmented Control) */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-100 rounded-xl overflow-x-auto">
        {days.map((day, idx) => {
          const isActive = idx === activeDayIndex;
          return (
            <button
              key={day.dayNumber}
              onClick={() => onSelectDay(idx)}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-white shadow-xs text-stone-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <div className="text-[11px] text-teal-800 uppercase tracking-wider font-semibold">
                Day {day.dayNumber}
              </div>
              <div className="text-xs truncate max-w-[140px] font-medium text-stone-700">
                {day.theme.split('&')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Day Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-1">
            <span>Day {currentDay.dayNumber} Itinerary</span>
            <span aria-hidden="true">·</span>
            <span>Est. Day Spend: ₹{dayTotalCost.toLocaleString()}</span>
          </div>
          <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
            {currentDay.title}
          </h3>
          <p className="text-xs text-teal-800 font-medium mt-0.5">
            Theme: {currentDay.theme}
          </p>
        </div>

        <button
          onClick={onAddActivity}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100/80 rounded-xl transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Activities Timeline */}
      <div className="space-y-4">
        {currentDay.activities.map((act, idx) => {
          const isSelected = selectedActivityId === act.id;
          const catStyle = categoryColors[act.category] || categoryColors.sightseeing;

          return (
            <article
              key={act.id}
              onClick={() => onSelectActivity(act.id)}
              className={`group bg-white rounded-2xl p-5 border transition-all cursor-pointer ${
                isSelected
                  ? 'border-teal-700 shadow-sm ring-1 ring-teal-700/20'
                  : 'border-stone-200/90 hover:border-stone-300 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Numbered Step Badge linked to map pin */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-teal-900 text-white'
                      : 'bg-stone-100 text-stone-700 group-hover:bg-teal-50 group-hover:text-teal-900'
                  }`}
                >
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-stone-900 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {act.time}
                      </span>
                      <span aria-hidden="true" className="text-stone-300">
                        ·
                      </span>
                      <span className="text-stone-500">{act.duration}</span>
                      <span aria-hidden="true" className="text-stone-300">
                        ·
                      </span>
                      <span className={`text-[11px] font-semibold capitalize ${catStyle.text}`}>
                        {act.category}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-teal-900 tabular-nums">
                      {act.costEstimate > 0 ? `₹${act.costEstimate.toLocaleString()}` : 'Free'}
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-[#0F172A] tracking-tight group-hover:text-teal-900 transition-colors">
                    {act.title}
                  </h4>

                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    {act.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs pt-3 border-t border-stone-100">
                    <div className="flex items-center gap-1 text-stone-500 font-medium truncate max-w-[200px]">
                      <MapPin className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span className="truncate">{act.locationName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <a
                        href={`https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodeURIComponent(act.locationName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-2 py-1 text-[11px] font-bold text-white hover:bg-stone-800 transition-colors shadow-2xs"
                        title={`Ride with Uber to ${act.locationName}`}
                      >
                        <Car className="w-3 h-3" />
                        <span>Uber</span>
                      </a>

                      <a
                        href={`https://rapido.bike/?destination=${encodeURIComponent(act.locationName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-300 px-2 py-1 text-[11px] font-bold text-amber-950 hover:bg-amber-400 transition-colors shadow-2xs"
                        title={`Book Rapido Auto/Bike to ${act.locationName}`}
                      >
                        <span>Rapido</span>
                      </a>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPassActivity(act);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-50 border border-rose-200/80 px-2 py-1 text-[11px] font-semibold text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
                        title={`Check official entry passes & BookMyShow for ${act.title}`}
                      >
                        <Ticket className="w-3 h-3 text-rose-600" />
                        <span>Entry Pass</span>
                      </button>

                      {/* Actions: Edit, Delete */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditActivity(act);
                          }}
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
                          title="Edit Activity"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteActivity(act.id);
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {act.tips && (
                    <div className="mt-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100 flex items-start gap-1.5 text-[11px] text-stone-600">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-stone-700">Voyan Tip:</strong> {act.tips}
                      </span>
                    </div>
                  )}

                  {act.groupSuitability && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-teal-50/70 border border-teal-100/90 text-[11px] text-teal-950">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold flex items-center gap-1 text-teal-900">
                          <Sparkles className="w-3 h-3 text-teal-700" />
                          <span>Why recommended for {act.groupSuitability.group.toUpperCase()}:</span>
                        </span>
                        {act.groupSuitability.walkingLevel && (
                          <span className="text-[10px] font-semibold bg-white text-teal-900 px-2 py-0.5 rounded border border-teal-200">
                            Walking: {act.groupSuitability.walkingLevel}
                          </span>
                        )}
                      </div>
                      <p className="text-teal-900/90 leading-relaxed">
                        {act.groupSuitability.reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Suggested Local Restaurants Section */}
      <div className="mt-8 pt-6 border-t border-stone-200/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-[#0F172A] tracking-tight flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-teal-800" />
              <span>Recommended Dining for Day {currentDay.dayNumber}</span>
            </h4>
            <p className="text-xs text-stone-500">
              Verified local kitchens matching your route and taste preferences.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentDay.diningOptions.map((rest) => (
            <div
              key={rest.id}
              className="bg-white rounded-xl p-4 border border-stone-200/90 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h5 className="text-xs font-bold text-[#0F172A]">{rest.name}</h5>
                  <span className="text-xs font-bold text-amber-700 font-mono">
                    {rest.priceLevel}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500">{rest.cuisine}</div>
                <div className="mt-2 text-xs text-stone-700 font-medium">
                  Dish to order: <span className="text-stone-900 font-bold">{rest.highlightDish}</span>
                </div>
                <div className="mt-1 text-[11px] text-stone-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  <span>{rest.location}</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-stone-600">
                  ~₹{rest.avgCostForTwo.toLocaleString()} for two
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <a
                    href={`https://www.zomato.com/search?q=${encodeURIComponent(rest.name + ' ' + rest.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 text-[11px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-lg transition-colors"
                    title={`Check reviews & menu on Zomato for ${rest.name}`}
                  >
                    Zomato
                  </a>
                  <a
                    href={`https://www.swiggy.com/search?query=${encodeURIComponent(rest.name + ' ' + rest.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 text-[11px] font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200/80 rounded-lg transition-colors"
                    title={`Order food on Swiggy from ${rest.name}`}
                  >
                    Swiggy
                  </a>
                  <button
                    onClick={() => onAddRestaurantToDay(rest)}
                    className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Meal</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPassActivity && (
        <EntryPassModal
          isOpen={!!selectedPassActivity}
          onClose={() => setSelectedPassActivity(null)}
          placeName={selectedPassActivity.title}
          locationName={selectedPassActivity.locationName}
          category={selectedPassActivity.category}
          costEstimate={selectedPassActivity.costEstimate}
        />
      )}
    </div>
  );
};
