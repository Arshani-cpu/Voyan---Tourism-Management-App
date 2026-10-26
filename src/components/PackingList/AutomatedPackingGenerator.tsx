import React, { useState, useMemo } from 'react';
import {
  Luggage,
  Sparkles,
  Sun,
  Snowflake,
  CloudRain,
  Mountain,
  Palmtree,
  Compass,
  Waves,
  Landmark,
  Briefcase,
  Heart,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Copy,
  Check,
  Printer,
  RotateCcw,
  ShieldCheck,
  Scale,
  Calendar,
  Users,
  ChevronRight,
  Info,
  CheckCheck
} from 'lucide-react';
import {
  DestinationClimate,
  TripType,
  PackingCategory,
  PackingItem,
  PackingListPreset
} from '../../types/packing';
import { TravellerGroupType, TripPlan } from '../../types/travel';
import {
  CLIMATE_DETAILS,
  TRIP_TYPES,
  PACKING_PRESETS,
  CATEGORY_LABELS,
  generateAutomatedPackingList,
  calculateEstimatedWeightKg,
  formatPackingListAsText
} from '../../data/packingGeneratorData';

interface AutomatedPackingGeneratorProps {
  initialDestination?: string;
  initialClimate?: DestinationClimate;
  initialTripType?: TripType;
  initialDays?: number;
  initialGroupType?: TravellerGroupType;
  activePlan?: TripPlan;
  onSaveToTrip?: (items: PackingItem[]) => void;
  isCompact?: boolean;
}

export const AutomatedPackingGenerator: React.FC<AutomatedPackingGeneratorProps> = ({
  initialDestination = 'Ooty & Nilgiri Hills',
  initialClimate = 'mild_hills',
  initialTripType = 'luxury',
  initialDays = 3,
  initialGroupType = 'seniors',
  activePlan,
  onSaveToTrip,
  isCompact = false,
}) => {
  // Config state
  const [destination, setDestination] = useState(activePlan?.destination || initialDestination);
  const [climate, setClimate] = useState<DestinationClimate>(() => {
    if (activePlan?.destination.toLowerCase().includes('goa')) return 'tropical';
    if (activePlan?.destination.toLowerCase().includes('manali') || activePlan?.destination.toLowerCase().includes('kashmir')) return 'cold_snow';
    if (activePlan?.destination.toLowerCase().includes('rajasthan') || activePlan?.destination.toLowerCase().includes('jaipur')) return 'desert_arid';
    return initialClimate;
  });
  const [tripType, setTripType] = useState<TripType>(initialTripType);
  const [days, setDays] = useState<number>(activePlan?.durationDays || initialDays);
  const [groupType, setGroupType] = useState<TravellerGroupType>(activePlan?.groupType || initialGroupType);

  // Generated checklist state
  const [items, setItems] = useState<PackingItem[]>(() =>
    generateAutomatedPackingList(climate, tripType, days, groupType)
  );

  // Filter category state
  const [activeCategory, setActiveCategory] = useState<PackingCategory | 'all'>('all');
  const [filterEssentialOnly, setFilterEssentialOnly] = useState(false);

  // New item modal/inline form state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<PackingCategory>('clothing');
  const [newItemQty, setNewItemQty] = useState('x 1');
  const [newItemEssential, setNewItemEssential] = useState(false);

  // UI feedback states
  const [copyToast, setCopyToast] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // Re-generate list handler
  const handleRegenerate = (
    c = climate,
    t = tripType,
    d = days,
    g = groupType
  ) => {
    const fresh = generateAutomatedPackingList(c, t, d, g);
    setItems(fresh);
  };

  // Toggle item packed
  const handleToggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    );
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Bulk check/uncheck
  const handleSetAllPacked = (packedState: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, packed: packedState })));
  };

  // Add custom item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: PackingItem = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: newItemQty || 'x 1',
      packed: false,
      isEssential: newItemEssential,
      weightGrams: 150,
      tip: 'Custom personal item added to packing list.'
    };

    setItems((prev) => [newItem, ...prev]);
    setNewItemName('');
    setNewItemQty('x 1');
    setNewItemEssential(false);
    setIsAddingItem(false);
  };

  // Apply quick preset
  const handleApplyPreset = (preset: PackingListPreset) => {
    setDestination(preset.destination);
    setClimate(preset.climate);
    setTripType(preset.tripType);
    setDays(preset.days);
    setGroupType(preset.groupType);
    handleRegenerate(preset.climate, preset.tripType, preset.days, preset.groupType);
  };

  // Copy to clipboard
  const handleCopyList = () => {
    const formatted = formatPackingListAsText(items, climate, tripType, days, destination);
    navigator.clipboard.writeText(formatted);
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  // Print packing list
  const handlePrint = () => {
    window.print();
  };

  // Save to active trip
  const handleSaveToTrip = () => {
    if (onSaveToTrip) {
      onSaveToTrip(items);
    }
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  // Stats
  const totalItems = items.length;
  const packedItemsCount = items.filter((i) => i.packed).length;
  const packPercent = totalItems > 0 ? Math.round((packedItemsCount / totalItems) * 100) : 0;
  const essentialItems = items.filter((i) => i.isEssential);
  const essentialPackedCount = essentialItems.filter((i) => i.packed).length;
  const estimatedWeightKg = useMemo(() => calculateEstimatedWeightKg(items), [items]);

  // Filtered items
  const displayedItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory;
      const matchEss = !filterEssentialOnly || item.isEssential;
      return matchCat && matchEss;
    });
  }, [items, activeCategory, filterEssentialOnly]);

  const activeClimateInfo = CLIMATE_DETAILS[climate];
  const activeTripTypeInfo = TRIP_TYPES[tripType];

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden text-stone-800">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white p-6 sm:p-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-teal-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Luggage className="w-3.5 h-3.5 text-teal-300" />
            <span>AI Automated Packing Engine</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Automated Packing List Generator
          </h2>
          <p className="text-teal-100/90 text-sm sm:text-base leading-relaxed max-w-2xl">
            Never forget thermal innerwear or travel passes again. Generates dynamic clothing counts, TSA-compliant toiletries, and emergency gear calibrated to your destination's climate, travel style, and duration.
          </p>

          {/* Quick Presets Strip */}
          <div className="mt-5 pt-4 border-t border-teal-700/60">
            <span className="text-[11px] font-semibold text-teal-300 uppercase tracking-wider block mb-2">
              Popular Indian Getaway Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {PACKING_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 rounded-lg bg-teal-800/80 hover:bg-teal-700/90 border border-teal-600/50 text-white text-xs font-medium transition-all hover:scale-102 cursor-pointer flex items-center gap-1.5"
                >
                  <span>{preset.title}</span>
                  <ChevronRight className="w-3 h-3 text-teal-300 opacity-60" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel: Climate, Trip Type, Duration, Group */}
      <div className="p-6 border-b border-stone-200 bg-stone-50/60">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Parameter 1: Destination Climate */}
          <div className="md:col-span-12 lg:col-span-6 space-y-2">
            <label className="flex items-center justify-between text-xs font-bold text-stone-700 uppercase tracking-wider">
              <span>1. Destination Climate</span>
              <span className="text-teal-800 font-semibold lowercase text-[11px]">{activeClimateInfo.tempRange}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  { id: 'mild_hills', name: 'Mild Hills', icon: Mountain, temp: '11°C - 21°C' },
                  { id: 'tropical', name: 'Tropical Beach', icon: Palmtree, temp: '28°C - 35°C' },
                  { id: 'cold_snow', name: 'Cold & Snow', icon: Snowflake, temp: '-4°C - 10°C' },
                  { id: 'monsoon', name: 'Monsoon Wet', icon: CloudRain, temp: '21°C - 27°C' },
                  { id: 'desert_arid', name: 'Desert Arid', icon: Sun, temp: '12°C - 38°C' },
                ] as const
              ).map((c) => {
                const IconComponent = c.icon;
                const isSelected = climate === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setClimate(c.id);
                      handleRegenerate(c.id, tripType, days, groupType);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-900 text-white border-teal-900 shadow-xs'
                        : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <IconComponent className={`w-4 h-4 ${isSelected ? 'text-teal-200' : 'text-teal-700'}`} />
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-200" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">{c.name}</div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-teal-200' : 'text-stone-500'}`}>
                        {c.temp}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parameter 2: Trip Type Style */}
          <div className="md:col-span-12 lg:col-span-6 space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              2. Trip Type & Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(
                [
                  { id: 'adventure', name: 'Adventure & Trek', icon: Compass },
                  { id: 'luxury', name: 'Luxury & Resort', icon: Sparkles },
                  { id: 'beach', name: 'Beach & Coastal', icon: Waves },
                  { id: 'cultural', name: 'Cultural & Heritage', icon: Landmark },
                  { id: 'business', name: 'Business & Bleisure', icon: Briefcase },
                  { id: 'spiritual', name: 'Spiritual & Yoga', icon: Heart },
                ] as const
              ).map((t) => {
                const IconComponent = t.icon;
                const isSelected = tripType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTripType(t.id);
                      handleRegenerate(climate, t.id, days, groupType);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-teal-900 text-white border-teal-900 shadow-xs'
                        : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-200'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isSelected ? 'text-teal-200' : 'text-teal-700'}`} />
                    <span className="text-xs font-bold truncate">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parameter 3: Number of Days Planned */}
          <div className="md:col-span-6 lg:col-span-6 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-800" />
                <span>3. Number of Days: {days} Days</span>
              </label>
              <span className="text-[11px] font-semibold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                {days <= 3 ? 'Weekend Trip' : days <= 7 ? 'Standard Week' : 'Extended Journey'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[2, 3, 5, 7, 10, 14].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDays(d);
                    handleRegenerate(climate, tripType, d, groupType);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    days === d
                      ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {d}d
                </button>
              ))}
              <div className="flex items-center border border-stone-200 rounded-lg bg-white px-2 py-1">
                <button
                  onClick={() => {
                    const next = Math.max(1, days - 1);
                    setDays(next);
                    handleRegenerate(climate, tripType, next, groupType);
                  }}
                  className="text-stone-500 hover:text-stone-900 px-1 font-bold text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="text-xs font-bold px-1.5 min-w-[20px] text-center">{days}</span>
                <button
                  onClick={() => {
                    const next = Math.min(21, days + 1);
                    setDays(next);
                    handleRegenerate(climate, tripType, next, groupType);
                  }}
                  className="text-stone-500 hover:text-stone-900 px-1 font-bold text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Parameter 4: Traveller Group Awareness */}
          <div className="md:col-span-6 lg:col-span-6 space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-800" />
              <span>4. Traveller Group Context</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(
                [
                  { id: 'solo', label: 'Solo' },
                  { id: 'couple', label: 'Couple' },
                  { id: 'friends', label: 'Friends' },
                  { id: 'family', label: 'Family' },
                  { id: 'seniors', label: 'Seniors' },
                ] as const
              ).map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setGroupType(g.id);
                    handleRegenerate(climate, tripType, days, g.id);
                  }}
                  className={`py-1.5 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                    groupType === g.id
                      ? 'bg-teal-900 text-white border-teal-900 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Climate & Luggage Advisory Alert Box */}
        <div className="mt-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950 flex items-center gap-2">
                <span>{activeClimateInfo.name} Climate Advisory</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/70 text-[10px] font-bold text-amber-900">
                  {activeClimateInfo.tempRange}
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">
                {activeClimateInfo.advisory}
              </p>
            </div>
          </div>

          <div className="sm:text-right shrink-0 bg-white/80 px-3 py-1.5 rounded-xl border border-amber-200">
            <span className="text-[10px] font-semibold text-stone-500 uppercase block">Recommended Luggage</span>
            <span className="text-xs font-bold text-teal-900">{activeClimateInfo.luggageRecommendation.split(' ')[0]} {activeClimateInfo.luggageRecommendation.split(' ')[1]}</span>
          </div>
        </div>
      </div>

      {/* Progress Meter & Luggage Weight Bar */}
      <div className="p-6 bg-white border-b border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-extrabold text-stone-900">
                {packedItemsCount} of {totalItems} Packed
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-900">
                {packPercent}% Complete
              </span>
            </div>
            <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {essentialPackedCount} of {essentialItems.length} essential items secured
              </span>
            </div>
          </div>

          {/* Weight Indicator & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-medium text-stone-700">
              <Scale className="w-4 h-4 text-teal-700" />
              <span>Est. Weight: <strong className="text-stone-900 font-bold">{estimatedWeightKg} kg</strong></span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 ${
                estimatedWeightKg <= 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {estimatedWeightKg <= 10 ? 'Cabin Friendly' : 'Check-In Req.'}
              </span>
            </div>

            <button
              onClick={() => handleSetAllPacked(true)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer transition-colors flex items-center gap-1"
              title="Check all items"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Check All</span>
            </button>

            <button
              onClick={() => handleSetAllPacked(false)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer transition-colors"
              title="Uncheck all items"
            >
              Reset
            </button>

            <button
              onClick={handleCopyList}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-teal-800 hover:bg-teal-900 text-white cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {copyToast ? <Check className="w-3.5 h-3.5 text-teal-200" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copyToast ? 'Copied List!' : 'Share / Copy'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 border border-stone-200 cursor-pointer"
              title="Print checklist"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-700 to-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${packPercent}%` }}
          />
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="px-6 py-3 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-teal-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
            }`}
          >
            All Items ({items.length})
          </button>

          {(Object.keys(CATEGORY_LABELS) as PackingCategory[]).map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            if (count === 0) return null;
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
                }`}
              >
                <span>{CATEGORY_LABELS[cat].label.split(' ')[0]}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setFilterEssentialOnly(!filterEssentialOnly)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              filterEssentialOnly
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            Must-Have Only
          </button>

          <button
            onClick={() => setIsAddingItem(!isAddingItem)}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Inline Add Item Form */}
      {isAddingItem && (
        <form
          onSubmit={handleAddCustomItem}
          className="p-4 bg-teal-50/50 border-b border-teal-200/70 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
        >
          <div className="sm:col-span-5">
            <input
              type="text"
              placeholder="e.g. Polaroid camera, baby stroller, medication pouch"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-700"
              autoFocus
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as PackingCategory)}
              className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-700 font-medium"
            >
              {(Object.keys(CATEGORY_LABELS) as PackingCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat].label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="Qty (e.g. x 2)"
              value={newItemQty}
              onChange={(e) => setNewItemQty(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2 px-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="py-2 px-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Item Checklist Grid */}
      <div className="divide-y divide-stone-100 max-h-[580px] overflow-y-auto">
        {displayedItems.length === 0 ? (
          <div className="p-12 text-center text-stone-500">
            <Luggage className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-semibold">No items match the active filters.</p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setFilterEssentialOnly(false);
              }}
              className="mt-3 text-xs font-bold text-teal-800 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          displayedItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex items-start justify-between gap-3 transition-colors ${
                item.packed ? 'bg-stone-50/70 text-stone-400' : 'hover:bg-teal-50/30'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleItem(item.id)}
                  className="mt-0.5 text-stone-400 hover:text-teal-800 transition-colors cursor-pointer shrink-0"
                >
                  {item.packed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300 hover:text-teal-600" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      onClick={() => handleToggleItem(item.id)}
                      className={`text-sm font-semibold cursor-pointer ${
                        item.packed ? 'line-through text-stone-400 font-normal' : 'text-stone-800'
                      }`}
                    >
                      {item.name}
                    </span>

                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200/80">
                      {item.quantity}
                    </span>

                    {item.isEssential && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                        Must-Have
                      </span>
                    )}

                    <span className="text-[10px] font-medium text-stone-400">
                      {CATEGORY_LABELS[item.category]?.label.split(' ')[0]}
                    </span>
                  </div>

                  {item.tip && (
                    <p className={`text-xs mt-1 leading-relaxed ${item.packed ? 'text-stone-400' : 'text-stone-500'}`}>
                      💡 {item.tip}
                    </p>
                  )}
                </div>
              </div>

              {/* Delete action */}
              <button
                type="button"
                onClick={() => handleDeleteItem(item.id)}
                className="opacity-40 hover:opacity-100 text-stone-400 hover:text-rose-600 p-1 rounded transition-all cursor-pointer shrink-0"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-stone-500">
          <RotateCcw className="w-3.5 h-3.5 text-teal-800" />
          <span>Need fresh suggestions? Change the climate or trip duration above to recalculate.</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onSaveToTrip && (
            <button
              onClick={handleSaveToTrip}
              className="flex-1 sm:flex-none px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
            >
              {savedToast ? 'Saved to Trip Plan!' : 'Save to Active Trip'}
            </button>
          )}

          <button
            onClick={() => handleRegenerate(climate, tripType, days, groupType)}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl font-semibold cursor-pointer transition-colors"
          >
            Reset to Generated
          </button>
        </div>
      </div>
    </div>
  );
};
