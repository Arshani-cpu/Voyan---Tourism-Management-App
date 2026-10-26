import React, { useState } from 'react';
import {
  Car,
  Utensils,
  ShoppingBag,
  ExternalLink,
  Search,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bike,
  Package,
  Layers,
  X
} from 'lucide-react';
import { ON_DEMAND_APPS, PartnerApp, AppCategory } from '../../utils/appLinks';

interface TravelDailyAppsHubProps {
  destination?: string;
  isOpenAsModal?: boolean;
  onCloseModal?: () => void;
  className?: string;
}

export const TravelDailyAppsHub: React.FC<TravelDailyAppsHubProps> = ({
  destination = 'Current Destination',
  isOpenAsModal = false,
  onCloseModal,
  className = '',
}) => {
  const [activeCategory, setActiveCategory] = useState<AppCategory>('travel');
  const [customSearch, setCustomSearch] = useState('');

  const filteredApps = ON_DEMAND_APPS.filter((app) => app.category === activeCategory);

  const getCategoryIcon = (category: AppCategory) => {
    switch (category) {
      case 'travel':
        return <Car className="w-4 h-4" />;
      case 'food':
        return <Utensils className="w-4 h-4" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const content = (
    <div className={`bg-white rounded-3xl border border-stone-200/90 shadow-sm p-5 sm:p-7 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-teal-600 text-teal-600" />
              On-Demand Travel, Food & Shopping Hub
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Local Conveniences for {destination}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            1-click instant booking via India’s trusted transit, dining, and shopping partners
          </p>
        </div>

        {isOpenAsModal && onCloseModal && (
          <button
            onClick={onCloseModal}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors self-end sm:self-auto cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-100 pb-3 mb-5 overflow-x-auto">
        {(
          [
            { id: 'travel', label: 'Rides & Transit', sub: 'Rapido, Uber, Ola, RedBus, IRCTC' },
            { id: 'food', label: 'Food & Dining', sub: 'Zomato, Swiggy, Blinkit' },
            { id: 'shopping', label: 'Shopping & Gear', sub: 'Meesho, Amazon, Flipkart' },
          ] as const
        ).map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {getCategoryIcon(tab.id)}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Destination / Search Query Context */}
      <div className="mb-5 flex flex-col sm:flex-row items-center gap-2.5 bg-stone-50 p-2.5 rounded-2xl border border-stone-200/80">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={customSearch}
            onChange={(e) => setCustomSearch(e.target.value)}
            placeholder={
              activeCategory === 'travel'
                ? `Enter pickup or drop landmark (Default: ${destination})`
                : activeCategory === 'food'
                ? `Search favorite dish or cuisine in ${destination}`
                : `Search products, rainwear, power banks, bags`
            }
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
          />
        </div>
        {customSearch && (
          <button
            onClick={() => setCustomSearch('')}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid of Partner Apps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredApps.map((app) => {
          const targetUrl = app.getUrl({
            destination,
            query: customSearch || undefined,
          });

          return (
            <div
              key={app.id}
              className="flex flex-col justify-between p-4 rounded-2xl border border-stone-200/90 bg-white hover:border-teal-700/40 hover:shadow-md transition-all group"
            >
              <div>
                {/* App Brand Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shadow-2xs"
                      style={{ backgroundColor: app.color, color: app.id === 'rapido' ? '#000' : '#FFF' }}
                    >
                      {app.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-stone-900 group-hover:text-teal-900 transition-colors">
                        {app.name}
                      </h3>
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                        {app.category === 'travel' ? 'Cabs & Transit' : app.category === 'food' ? 'Food & Dining' : 'Shopping & Gear'}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${app.badgeBg} ${app.textColor} ${app.borderColor}`}>
                    Verified
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed mb-3">
                  {app.tagline}
                </p>

                {/* Popular For Badges */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {app.popularFor.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium bg-stone-50 border border-stone-200/60 text-stone-600 px-2 py-0.5 rounded-md"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all bg-stone-900 text-white hover:bg-teal-800 shadow-xs group-hover:shadow cursor-pointer"
              >
                <span>
                  {app.category === 'travel'
                    ? `Book ${app.name} in ${destination.split(' ')[0]}`
                    : app.category === 'food'
                    ? `Order on ${app.name}`
                    : `Shop on ${app.name}`}
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>

      {/* Safety & Convenience Guarantee Footer */}
      <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Deep-links open directly in official apps or mobile web without booking markups</span>
        </div>
        <div className="flex items-center gap-3 font-semibold text-stone-700">
          <span>Rapido</span>
          <span>·</span>
          <span>Uber</span>
          <span>·</span>
          <span>Zomato</span>
          <span>·</span>
          <span>Swiggy</span>
          <span>·</span>
          <span>Meesho</span>
          <span>·</span>
          <span>Amazon</span>
          <span>·</span>
          <span>Flipkart</span>
        </div>
      </div>
    </div>
  );

  if (isOpenAsModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="w-full max-w-4xl my-8">{content}</div>
      </div>
    );
  }

  return content;
};
