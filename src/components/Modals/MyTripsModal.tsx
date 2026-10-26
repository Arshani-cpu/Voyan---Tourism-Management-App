import React from 'react';
import { X, Bookmark, ArrowRight, Trash2, Calendar, MapPin } from 'lucide-react';
import { TripPlan } from '../../types/travel';

interface MyTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTrips: TripPlan[];
  onSelectTrip: (trip: TripPlan) => void;
  onDeleteTrip: (tripId: string) => void;
  onStartNewPlan: () => void;
}

export const MyTripsModal: React.FC<MyTripsModalProps> = ({
  isOpen,
  onClose,
  savedTrips,
  onSelectTrip,
  onDeleteTrip,
  onStartNewPlan,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150 text-left">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">My Saved Trips</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {savedTrips.length === 0 ? (
          <div className="py-10 text-center">
            <Bookmark className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700">No saved trips yet</p>
            <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
              Plan any destination or click the "Save Trip" button on any itinerary to access it here anytime.
            </p>
            <button
              onClick={() => {
                onClose();
                onStartNewPlan();
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl"
            >
              Plan a Trip Now
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {savedTrips.map((trip) => (
              <div
                key={trip.id}
                className="p-3.5 rounded-xl border border-stone-200 hover:border-teal-700/50 bg-stone-50/50 hover:bg-white transition-all flex items-center justify-between gap-3 group"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    onSelectTrip(trip);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1">
                    <span className="font-semibold text-teal-900">{trip.destination}</span>
                    <span aria-hidden="true">·</span>
                    <span>{trip.durationDays} Days</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums font-mono">₹{trip.budgetPerPerson.toLocaleString()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-stone-900 group-hover:text-teal-900 transition-colors line-clamp-1">
                    {trip.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectTrip(trip);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center gap-1"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeleteTrip(trip.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs mt-4">
          <span className="text-stone-400 font-medium">
            {savedTrips.length} {savedTrips.length === 1 ? 'trip' : 'trips'} saved
          </span>
          <button
            onClick={() => {
              onClose();
              onStartNewPlan();
            }}
            className="text-xs font-semibold text-teal-800 hover:underline"
          >
            + Create New Plan
          </button>
        </div>
      </div>
    </div>
  );
};
