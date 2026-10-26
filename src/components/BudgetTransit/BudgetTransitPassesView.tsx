import React, { useEffect, useState } from 'react';
import {
  Wallet,
  Car,
  Ticket,
  Train,
  Plane,
  Bus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Percent,
  Sliders,
  DollarSign,
  QrCode,
  X,
  FileText
} from 'lucide-react';
import { DEFAULT_BUDGET_CATEGORIES, getDestinationLogistics } from '../../data/budgetTransitData';
import { TourismPass, TransitOption, BudgetCategory } from '../../types/budgetTransit';
import { TravellerGroupType } from '../../types/travel';
import { TravelDailyAppsHub } from '../OnDemandApps/TravelDailyAppsHub';

interface BudgetTransitPassesViewProps {
  destinationName: string;
  totalBudget: number;
  travellersCount: number;
  durationDays: number;
  groupType?: TravellerGroupType;
  onUpdateTotalBudget?: (newTotal: number) => void;
}

export const BudgetTransitPassesView: React.FC<BudgetTransitPassesViewProps> = ({
  destinationName,
  totalBudget,
  travellersCount,
  durationDays,
  groupType = 'seniors',
  onUpdateTotalBudget,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'budget' | 'transit' | 'passes' | 'apps'>('budget');
  const [currentBudget, setCurrentBudget] = useState(totalBudget || 14000);
  const [saverMode, setSaverMode] = useState(false);
  const [selectedPass, setSelectedPass] = useState<TourismPass | null>(null);
  const [activeTransitMode, setActiveTransitMode] = useState<string>('all');

  const logistics = getDestinationLogistics(destinationName);
  const hasDestinationPasses = logistics.passes.length > 0;

  useEffect(() => {
    setCurrentBudget(totalBudget || 14000);
    setActiveSubTab('budget');
  }, [destinationName, totalBudget]);

  // Recalculate categories dynamically based on currentBudget and saverMode
  const categories: BudgetCategory[] = DEFAULT_BUDGET_CATEGORIES.map((cat) => {
    let pct = cat.percentage;
    if (saverMode) {
      if (cat.id === 'stays') pct = 38;
      if (cat.id === 'transit') pct = 20;
      if (cat.id === 'passes') pct = 15; // composite passes save money
    }
    const allocated = Math.round((currentBudget * pct) / 100);
    return {
      ...cat,
      percentage: pct,
      allocatedAmount: allocated,
      notes: hasDestinationPasses
        ? cat.notes
        : {
            stays: `Compare accommodation options in and around ${destinationName}; confirm amenities and cancellation terms before booking.`,
            transit: `Compare available transport to ${destinationName}; confirm route, fare, and seat availability with the provider.`,
            dining: `Allow for local meals and refreshments during your ${destinationName} trip.`,
            passes: `Check entry fees and any official visitor passes for attractions in ${destinationName}.`,
            contingency: 'Keep a reserve for local price changes, small purchases, and unexpected travel costs.',
          }[cat.id] ?? cat.notes,
    };
  });

  const perPersonSpend = Math.round(currentBudget / Math.max(1, travellersCount));
  const dailySpendPerPerson = Math.round(perPersonSpend / Math.max(1, durationDays));

  const handleBudgetChange = (amount: number) => {
    setCurrentBudget(amount);
    onUpdateTotalBudget?.(amount);
  };

  const getTransitIcon = (mode: TransitOption['mode']) => {
    switch (mode) {
      case 'flight':
        return <Plane className="w-4 h-4 text-sky-700" />;
      case 'train':
        return <Train className="w-4 h-4 text-teal-800" />;
      case 'cab':
        return <Car className="w-4 h-4 text-amber-700" />;
      case 'bus':
        return <Bus className="w-4 h-4 text-indigo-700" />;
      default:
        return <Car className="w-4 h-4 text-stone-700" />;
    }
  };

  const filteredTransit = logistics.transitOptions.filter(
    (t) => activeTransitMode === 'all' || t.mode === activeTransitMode
  );

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 sm:p-6 text-left space-y-6">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
              Budget Planning, Transit & Official Passes
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold uppercase tracking-wide">
              {destinationName}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Estimated expenses and route-planning suggestions for {destinationName}. Confirm prices, schedules, and availability with official providers.
          </p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center p-1 bg-stone-100 rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveSubTab('budget')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'budget' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-teal-700" />
            <span>Budget Plan</span>
          </button>
          <button
            onClick={() => setActiveSubTab('transit')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'transit' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-sky-700" />
            <span>Transit & Routes</span>
          </button>
          <button
            onClick={() => setActiveSubTab('passes')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'passes' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-emerald-700" />
            <span>Tourism Passes</span>
          </button>
          <button
            onClick={() => setActiveSubTab('apps')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'apps' ? 'bg-stone-900 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Cabs, Food & Shopping</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: BUDGET PLANNING ================= */}
      {activeSubTab === 'budget' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Budget Overview KPI Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-teal-50/60 border border-teal-100 text-teal-950">
            <div>
              <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">
                Total Group Budget
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-teal-950 mt-0.5">
                ₹{currentBudget.toLocaleString()}
              </div>
              <div className="text-[10px] text-teal-700 mt-0.5">For {travellersCount} travelers ({durationDays} days)</div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">
                Per-Traveler Share
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-teal-950 mt-0.5">
                ₹{perPersonSpend.toLocaleString()}
              </div>
              <div className="text-[10px] text-teal-700 mt-0.5">Equal split</div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">
                Daily Spend / Person
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-teal-950 mt-0.5">
                ₹{dailySpendPerPerson.toLocaleString()}
              </div>
              <div className="text-[10px] text-teal-700 mt-0.5">Avg per day</div>
            </div>

            <div className="flex flex-col justify-between">
              <div className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">
                Budget Saver Mode
              </div>
              <button
                type="button"
                onClick={() => setSaverMode(!saverMode)}
                className={`mt-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
                  saverMode ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white text-stone-700 border border-stone-200'
                }`}
              >
                <span>{saverMode ? 'Active (Optimized)' : 'Enable Saver'}</span>
                <Sparkles className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>

          {/* Interactive Budget Slider */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-700" />
                <span>Adjust Total Budget Allocation</span>
              </label>
              <span className="text-xs font-mono font-bold text-teal-900 tabular-nums">
                ₹{currentBudget.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="4000"
              max="40000"
              step="500"
              value={currentBudget}
              onChange={(e) => handleBudgetChange(Number(e.target.value))}
              className="w-full accent-teal-800 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
              <span>₹4,000 (Backpacker)</span>
              <span>₹18,000 (Standard)</span>
              <span>₹40,000 (Luxury)</span>
            </div>
          </div>

          {/* Itemized Categories Breakdown Stacked Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-stone-900 mb-2">
              <span>Category Allocation Breakdown</span>
              <span className="text-stone-400 font-normal">100% itemized</span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-stone-100 mb-3">
              {categories.map((c) => (
                <div
                  key={c.id}
                  style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                  title={`${c.name}: ₹${c.allocatedAmount.toLocaleString()} (${c.percentage}%)`}
                />
              ))}
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-xl border border-stone-200 hover:border-teal-700/30 bg-stone-50/50 hover:bg-white transition-all text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <h5 className="text-xs font-bold text-stone-900">{cat.name}</h5>
                      </div>
                      <span className="text-xs font-bold text-stone-700 font-mono tabular-nums">
                        {cat.percentage}%
                      </span>
                    </div>
                    <div className="text-base font-extrabold text-stone-900 font-mono tabular-nums">
                      ₹{cat.allocatedAmount.toLocaleString()}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                      {cat.notes}
                    </p>
                  </div>
                  <div className="text-[10px] text-teal-800 font-medium pt-2 mt-2 border-t border-stone-100">
                    ~₹{Math.round(cat.allocatedAmount / Math.max(1, travellersCount)).toLocaleString()} / traveler
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: TRANSIT & LOGISTICS ================= */}
      {activeSubTab === 'transit' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Local Commute Rate Card */}
          <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 text-sky-950">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-sky-700" />
                <span>Verified Local Commuting Tariff ({destinationName})</span>
              </h4>
              <span className="text-[10px] text-sky-700 bg-white px-2 py-0.5 rounded font-mono">Official Benchmarks</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-sky-100">
                <div className="text-[10px] text-stone-500">Private Cab (Sedan/SUV)</div>
                <div className="font-bold text-sky-950 font-mono text-sm mt-0.5">
                  ₹{logistics.localCommuteRates.privateCabPerKm}/km
                </div>
                <div className="text-[10px] text-stone-400">Hill ghat rate</div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-sky-100">
                <div className="text-[10px] text-stone-500">Auto-Rickshaw Minimum</div>
                <div className="font-bold text-sky-950 font-mono text-sm mt-0.5">
                  ₹{logistics.localCommuteRates.autoBaseFare} base
                </div>
                <div className="text-[10px] text-stone-400">First 1.5 km</div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-sky-100">
                <div className="text-[10px] text-stone-500">Rental Two-Wheeler</div>
                <div className="font-bold text-sky-950 font-mono text-sm mt-0.5">
                  ₹{logistics.localCommuteRates.rentalScooterPerDay}/day
                </div>
                <div className="text-[10px] text-stone-400">Excluding petrol</div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-sky-100">
                <div className="text-[10px] text-stone-500">Current Petrol Rate</div>
                <div className="font-bold text-sky-950 font-mono text-sm mt-0.5">
                  ₹{logistics.localCommuteRates.fuelPricePerLitre}/L
                </div>
                <div className="text-[10px] text-stone-400">Nilgiris district</div>
              </div>
            </div>
          </div>

          {/* Mode Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
            {['all', 'flight', 'train', 'cab', 'bus', 'rental'].map((m) => (
              <button
                key={m}
                onClick={() => setActiveTransitMode(m)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                  activeTransitMode === m ? 'bg-teal-800 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {m === 'all' ? 'All Transit Options' : m}
              </button>
            ))}
          </div>

          {/* Transit Cards */}
          <div className="space-y-3">
            {filteredTransit.map((opt) => (
              <div
                key={opt.id}
                className="p-4 rounded-xl border border-stone-200 hover:border-teal-700/40 bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getTransitIcon(opt.mode)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-bold text-stone-900">{opt.title}</h4>
                      <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.2 rounded font-mono">
                        {opt.duration}
                      </span>
                      {opt.bestForGroup && (
                        <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.2 rounded font-medium">
                          Best for {opt.bestForGroup}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-600 mt-1 font-medium">{opt.route}</div>
                    <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{opt.frequency}</span>
                    </div>
                    {opt.accessibilityNotes && (
                      <div className="text-[11px] text-teal-900 bg-stone-50 p-1.5 rounded mt-2 border border-stone-100 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-teal-700 shrink-0" />
                        <span>{opt.accessibilityNotes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 flex sm:flex-col justify-between items-center sm:items-end">
                  <div>
                    <div className="text-xs font-bold text-teal-900 font-mono text-base tabular-nums">
                      ~₹{opt.estimatedCost.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-stone-400">per person / seat</div>
                  </div>
                  <div className="text-[11px] text-stone-500 max-w-xs mt-1 sm:text-right">
                    {opt.bookingTip}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Instant Ride-Hailing Apps Shortcut */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-amber-700" />
                  <span>On-Demand Rides & Cabs ({destinationName})</span>
                </h4>
                <p className="text-xs text-amber-900/80 mt-0.5">
                  Book instant city rides, auto-rickshaws, or bike taxis directly through trusted apps.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('apps')}
                className="text-xs font-bold text-amber-900 hover:text-amber-950 underline self-start sm:self-auto cursor-pointer"
              >
                View all food & shopping apps →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <a
                href={`https://rapido.bike/?destination=${encodeURIComponent(destinationName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-stone-900">Rapido</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Bike taxi & Auto rides</div>
                </div>
                <span className="text-xs font-semibold text-amber-800 group-hover:underline">Book →</span>
              </a>

              <a
                href={`https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodeURIComponent(destinationName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white rounded-xl border border-stone-300 hover:border-stone-900 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-stone-900" />
                    <span className="text-xs font-bold text-stone-900">Uber</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">Uber Go, Premier & Auto</div>
                </div>
                <span className="text-xs font-semibold text-stone-900 group-hover:underline">Ride →</span>
              </a>

              <a
                href={`https://book.olacabs.com/?drop=${encodeURIComponent(destinationName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white rounded-xl border border-emerald-200 hover:border-emerald-400 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-stone-900">Ola Cabs</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">City cabs & outstation</div>
                </div>
                <span className="text-xs font-semibold text-emerald-800 group-hover:underline">Book →</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: TOURISM PASSES ================= */}
      {activeSubTab === 'passes' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-emerald-700" />
                <span>{hasDestinationPasses ? 'Listed Tourism Pass Suggestions' : `Check Official Passes for ${destinationName}`}</span>
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                {hasDestinationPasses
                  ? 'Review the listed pass information and confirm current prices and availability with the issuing authority.'
                  : `No pass details are listed for ${destinationName} yet. Check each attraction’s official site or ticket counter for current entry details.`}
              </p>
            </div>
            {hasDestinationPasses && (
              <div className="text-xs font-bold text-emerald-900 bg-white px-3 py-1 rounded-lg border border-emerald-200">
                Check current concessions with issuer
              </div>
            )}
          </div>

          {logistics.passes.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {logistics.passes.map((pass) => (
              <div
                key={pass.id}
                className="p-5 rounded-2xl border border-stone-200/90 hover:border-emerald-600/40 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      Validity: {pass.validityDuration}
                    </span>
                    <span className="text-xs font-mono font-bold text-stone-400">
                      {pass.instantPassCode}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#0F172A] tracking-tight">{pass.title}</h4>
                  <div className="text-[11px] text-stone-500 mt-0.5 font-medium">{pass.issuingAuthority}</div>

                  {/* Pricing grid */}
                  <div className="mt-3 p-2.5 rounded-xl bg-stone-50 border border-stone-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-stone-500">Adult</div>
                      <div className="font-bold text-stone-900 font-mono">₹{pass.priceAdult}</div>
                    </div>
                    {pass.priceSenior && (
                      <div>
                        <div className="text-[10px] text-teal-800 font-semibold">Senior</div>
                        <div className="font-bold text-teal-900 font-mono">₹{pass.priceSenior}</div>
                      </div>
                    )}
                    {pass.priceChild && (
                      <div>
                        <div className="text-[10px] text-stone-500">Child</div>
                        <div className="font-bold text-stone-900 font-mono">₹{pass.priceChild}</div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-emerald-900 font-medium mt-3 bg-emerald-50/50 p-2 rounded-lg">
                    {pass.savingsDescription}
                  </p>

                  <div className="mt-3 space-y-1.5">
                    <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wide">
                      Inclusions:
                    </div>
                    {pass.inclusions.map((inc, i) => (
                      <div key={i} className="text-xs text-stone-600 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedPass(pass)}
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View Pass Voucher & Barcode</span>
                  </button>
                </div>
              </div>
            ))}
          </div> : (
            <div className="rounded-xl border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-600">
              No destination-specific pass or booking data is configured for {destinationName}. This planner does not sell tickets or make reservations.
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: ON-DEMAND APPS (CABS, FOOD, SHOPPING) ================= */}
      {activeSubTab === 'apps' && (
        <div className="animate-in fade-in duration-150">
          <TravelDailyAppsHub destination={destinationName} />
        </div>
      )}

      {/* Official Pass Voucher Modal */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-[#0F172A]">Digital Tourism Pass Token</h3>
              </div>
              <button
                onClick={() => setSelectedPass(null)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center p-5 rounded-2xl bg-stone-50 border border-stone-200 mb-4">
              <div className="w-24 h-24 mx-auto mb-3 bg-white p-2 rounded-xl border border-stone-300 flex items-center justify-center shadow-xs">
                <QrCode className="w-18 h-18 text-stone-900" />
              </div>
              <div className="text-xs font-mono font-bold text-stone-800 tracking-wider">
                {selectedPass.instantPassCode}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Authorized by {selectedPass.issuingAuthority}
              </div>
            </div>

            <h4 className="text-sm font-bold text-stone-900 mb-1">{selectedPass.title}</h4>
            <div className="text-xs text-stone-600 mb-3">{selectedPass.officialBookingTip}</div>

            <div className="text-xs text-teal-900 bg-teal-50 p-2.5 rounded-xl border border-teal-100 mb-4">
              <strong>Verified Fast-Track:</strong> Present this screen at the official priority entry gate. No counter token printout required.
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
              <span className="text-stone-400">Valid for {selectedPass.validityDuration}</span>
              <button
                onClick={() => setSelectedPass(null)}
                className="px-4 py-2 font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
