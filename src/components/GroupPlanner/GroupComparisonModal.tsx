import React, { useState } from 'react';
import { X, Scale, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Users, Heart, User } from 'lucide-react';
import { TravellerGroupType, TripPlan } from '../../types/travel';
import { GROUP_CARDS, generateGroupTailoredPlan } from '../../data/groupItineraries';

interface GroupComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationName: string;
  onSelectGroupPlan: (plan: TripPlan) => void;
}

export const GroupComparisonModal: React.FC<GroupComparisonModalProps> = ({
  isOpen,
  onClose,
  destinationName,
  onSelectGroupPlan,
}) => {
  const [groupA, setGroupA] = useState<TravellerGroupType>('seniors');
  const [groupB, setGroupB] = useState<TravellerGroupType>('family');

  if (!isOpen) return null;

  const planA = generateGroupTailoredPlan({
    groupType: groupA,
    travellersCount: groupA === 'solo' ? 1 : groupA === 'couple' ? 2 : 4,
    durationDays: 3,
    totalBudget: groupA === 'solo' ? 5000 : 15000,
    transportPreference: groupA === 'seniors' ? 'private_cab' : 'self_drive',
    destination: destinationName
  });

  const planB = generateGroupTailoredPlan({
    groupType: groupB,
    travellersCount: groupB === 'solo' ? 1 : groupB === 'couple' ? 2 : 4,
    durationDays: 3,
    totalBudget: groupB === 'solo' ? 5000 : 18000,
    transportPreference: groupB === 'friends' ? 'self_drive' : 'private_cab',
    destination: destinationName
  });

  const getGroupTitle = (g: TravellerGroupType) => GROUP_CARDS.find((c) => c.id === g)?.title || g;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-left animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-teal-950 text-white flex items-center justify-between border-b border-teal-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 flex items-center justify-center text-teal-200">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                Side-by-Side Group Comparison for {destinationName}
              </h3>
              <p className="text-xs text-teal-200/80 mt-0.5">
                Observe how Voyan dynamically alters daily pacing, physical exertion, and accommodations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-300 hover:text-white hover:bg-teal-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Selector Bar */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Group Option A
            </label>
            <select
              value={groupA}
              onChange={(e) => setGroupA(e.target.value as TravellerGroupType)}
              className="w-full p-2 text-xs font-bold text-stone-900 bg-white rounded-lg border border-stone-200"
            >
              {GROUP_CARDS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Group Option B
            </label>
            <select
              value={groupB}
              onChange={(e) => setGroupB(e.target.value as TravellerGroupType)}
              className="w-full p-2 text-xs font-bold text-stone-900 bg-white rounded-lg border border-stone-200"
            >
              {GROUP_CARDS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-stone-200 flex-1">
          {/* Column A */}
          <div className="space-y-5 pr-0 md:pr-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-teal-100 text-teal-900 text-xs font-bold">
                {getGroupTitle(groupA)}
              </span>
              <span className="text-xs font-bold text-teal-900 font-mono tabular-nums">
                ₹{planA.budgetPerPerson.toLocaleString()} / person
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#0F172A]">{planA.title}</h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {planA.overviewSummary}
              </p>
            </div>

            {/* Key Comparison Points */}
            <div className="space-y-3 pt-3 border-t border-stone-100 text-xs">
              <div>
                <div className="text-[11px] text-stone-400 uppercase font-semibold">
                  Transit & Departure Time
                </div>
                <div className="font-semibold text-stone-800">
                  {planA.transportPreference} · Starts around {planA.days[0]?.activities[0]?.time || '10:00 AM'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-stone-400 uppercase font-semibold">
                  Day 1 Signature Experience
                </div>
                <div className="font-medium text-stone-800">
                  {planA.days[0]?.activities[1]?.title || planA.days[0]?.activities[0]?.title}
                </div>
                <div className="text-[11px] text-teal-800 font-semibold mt-0.5">
                  Why: {planA.days[0]?.activities[1]?.groupSuitability?.reason || planA.days[0]?.activities[0]?.groupSuitability?.reason}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-stone-400 uppercase font-semibold">
                  Dining Style
                </div>
                <div className="font-medium text-stone-800">
                  {planA.days[0]?.diningOptions[0]?.name} ({planA.days[0]?.diningOptions[0]?.cuisine})
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onSelectGroupPlan(planA);
                onClose();
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Load {getGroupTitle(groupA)} Itinerary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Column B */}
          <div className="space-y-5 pt-6 md:pt-0 pl-0 md:pl-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-xs font-bold">
                {getGroupTitle(groupB)}
              </span>
              <span className="text-xs font-bold text-amber-900 font-mono tabular-nums">
                ₹{planB.budgetPerPerson.toLocaleString()} / person
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#0F172A]">{planB.title}</h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {planB.overviewSummary}
              </p>
            </div>

            {/* Key Comparison Points */}
            <div className="space-y-3 pt-3 border-t border-stone-100 text-xs">
              <div>
                <div className="text-[11px] text-stone-400 uppercase font-semibold">
                  Transit & Departure Time
                </div>
                <div className="font-semibold text-stone-800">
                  {planB.transportPreference} · Starts around {planB.days[0]?.activities[0]?.time || '09:00 AM'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-stone-400 uppercase font-semibold">
                  Day 1 Signature Experience
                </div>
                <div className="font-medium text-stone-800">
                  {planB.days[0]?.activities[1]?.title || planB.days[0]?.activities[0]?.title}
                </div>
                <div className="text-[11px] text-teal-800 font-semibold mt-0.5">
                  Why: {planB.days[0]?.activities[1]?.groupSuitability?.reason || planB.days[0]?.activities[0]?.groupSuitability?.reason}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-stone-400 uppercase font-semibold">
                  Dining Style
                </div>
                <div className="font-medium text-stone-800">
                  {planB.days[0]?.diningOptions[0]?.name} ({planB.days[0]?.diningOptions[0]?.cuisine})
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onSelectGroupPlan(planB);
                onClose();
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Load {getGroupTitle(groupB)} Itinerary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
