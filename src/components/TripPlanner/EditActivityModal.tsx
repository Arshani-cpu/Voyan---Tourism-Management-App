import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Tag, Wallet } from 'lucide-react';
import { Activity } from '../../types/travel';

interface EditActivityModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Activity) => void;
}

export const EditActivityModal: React.FC<EditActivityModalProps> = ({
  activity,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [duration, setDuration] = useState('1.5 hrs');
  const [category, setCategory] = useState<Activity['category']>('sightseeing');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [costEstimate, setCostEstimate] = useState<number>(0);
  const [tips, setTips] = useState('');

  useEffect(() => {
    if (activity) {
      setTitle(activity.title);
      setTime(activity.time);
      setDuration(activity.duration);
      setCategory(activity.category);
      setDescription(activity.description);
      setLocationName(activity.locationName);
      setCostEstimate(activity.costEstimate);
      setTips(activity.tips || '');
    } else {
      setTitle('');
      setTime('10:00 AM');
      setDuration('1.5 hrs');
      setCategory('sightseeing');
      setDescription('');
      setLocationName('');
      setCostEstimate(150);
      setTips('');
    }
  }, [activity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Activity = {
      id: activity?.id || `act-${Date.now()}`,
      title: title || 'Custom Activity',
      time,
      duration,
      category,
      description: description || 'Scenic exploration along your route.',
      locationName: locationName || 'Local Landmark',
      costEstimate: Number(costEstimate) || 0,
      coordinates: activity?.coordinates || { x: 50, y: 50 },
      tips: tips.trim() ? tips : undefined,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150 text-left">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
          <h3 className="text-lg font-bold text-[#0F172A]">
            {activity ? 'Edit Itinerary Activity' : 'Add New Activity'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Activity Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunset Boat Cruise at Pykara Lake"
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Scheduled Time
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="09:30 AM"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="2 hrs"
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Activity['category'])}
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none capitalize"
              >
                <option value="sightseeing">Sightseeing</option>
                <option value="nature">Nature</option>
                <option value="heritage">Heritage</option>
                <option value="food">Dining / Food</option>
                <option value="leisure">Leisure / Relax</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Estimated Cost (INR ₹)
              </label>
              <div className="relative">
                <span className="text-xs font-bold text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 font-mono">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={costEstimate}
                  onChange={(e) => setCostEstimate(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Location / Landmark Name
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Upper Bazaar Road, Ooty"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this activity special?"
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Voyan Pro-Tip (Optional)
            </label>
            <input
              type="text"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              placeholder="e.g. Arrive 15 mins before sunset for tickets."
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-teal-700 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors shadow-xs"
            >
              Save Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
