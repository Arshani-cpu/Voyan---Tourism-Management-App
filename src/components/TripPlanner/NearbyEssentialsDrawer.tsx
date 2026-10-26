import React, { useState } from 'react';
import {
  Hotel,
  Utensils,
  Shield,
  Fuel,
  Phone,
  MapPin,
  Star,
  CheckCircle2,
  ExternalLink,
  Zap,
  AlertTriangle,
  Search
} from 'lucide-react';
import { NearbyAmenity } from '../../types/travel';
import { getNearbyEssentialsForDestination } from '../../data/nearbyEssentials';

interface NearbyEssentialsDrawerProps {
  destinationName: string;
  onSelectAmenityOnMap?: (amenity: NearbyAmenity) => void;
  onOpenSOS?: () => void;
}

export const NearbyEssentialsDrawer: React.FC<NearbyEssentialsDrawerProps> = ({
  destinationName,
  onSelectAmenityOnMap,
  onOpenSOS,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'hotel' | 'restaurant' | 'police' | 'fuel'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const essentials = getNearbyEssentialsForDestination(destinationName);

  const filtered = essentials.filter((item) => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const getAmenityIcon = (type: NearbyAmenity['type']) => {
    switch (type) {
      case 'hotel':
        return <Hotel className="w-4 h-4 text-teal-800" />;
      case 'restaurant':
        return <Utensils className="w-4 h-4 text-amber-700" />;
      case 'police':
        return <Shield className="w-4 h-4 text-rose-700" />;
      case 'fuel':
        return <Fuel className="w-4 h-4 text-emerald-700" />;
    }
  };

  const counts = {
    all: essentials.length,
    hotel: essentials.filter((e) => e.type === 'hotel').length,
    restaurant: essentials.filter((e) => e.type === 'restaurant').length,
    police: essentials.filter((e) => e.type === 'police').length,
    fuel: essentials.filter((e) => e.type === 'fuel').length,
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-5 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-teal-800" />
            <span>Nearby Essentials & Safety Services</span>
          </h3>
          <p className="text-xs text-stone-500">
            Suggested hotels, restaurants, 24/7 police stations, and fuel stations in {destinationName}.
          </p>
        </div>

        {/* Emergency Hotline Direct Pill / SOS Hub Trigger */}
        <button
          type="button"
          onClick={onOpenSOS}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-xs active:scale-95 group"
          title="Open Emergency SOS Hub"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-white animate-pulse" />
          <span>Emergency SOS Hub (112)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl overflow-x-auto mb-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'all' ? 'bg-white text-stone-900 font-bold shadow-2xs' : 'text-stone-600'
          }`}
        >
          All Nearby ({counts.all})
        </button>
        <button
          onClick={() => setActiveTab('hotel')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'hotel' ? 'bg-white text-stone-900 font-bold shadow-2xs' : 'text-stone-600'
          }`}
        >
          <Hotel className="w-3.5 h-3.5 text-teal-800" />
          <span>Hotels ({counts.hotel})</span>
        </button>
        <button
          onClick={() => setActiveTab('restaurant')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'restaurant' ? 'bg-white text-stone-900 font-bold shadow-2xs' : 'text-stone-600'
          }`}
        >
          <Utensils className="w-3.5 h-3.5 text-amber-700" />
          <span>Dining ({counts.restaurant})</span>
        </button>
        <button
          onClick={() => setActiveTab('police')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'police' ? 'bg-white text-stone-900 font-bold shadow-2xs' : 'text-stone-600'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-rose-700" />
          <span>Police Stations ({counts.police})</span>
        </button>
        <button
          onClick={() => setActiveTab('fuel')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'fuel' ? 'bg-white text-stone-900 font-bold shadow-2xs' : 'text-stone-600'
          }`}
        >
          <Fuel className="w-3.5 h-3.5 text-emerald-700" />
          <span>Petrol Bunks ({counts.fuel})</span>
        </button>
      </div>

      {/* On-Demand Apps Quick Bar (Rapido, Uber, Zomato, Swiggy, Meesho, Amazon, Flipkart) */}
      <div className="mb-4 p-3 bg-stone-50 rounded-xl border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>On-Demand Apps:</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {/* Rapido */}
          <a
            href={`https://rapido.bike/?destination=${encodeURIComponent(destinationName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 rounded-md bg-amber-300 hover:bg-amber-400 text-amber-950 font-bold flex items-center gap-1 transition-colors"
            title="Book Rapido bike taxi or auto"
          >
            <span>Rapido</span>
          </a>

          {/* Uber */}
          <a
            href={`https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodeURIComponent(destinationName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 rounded-md bg-stone-900 hover:bg-stone-800 text-white font-bold flex items-center gap-1 transition-colors"
            title="Book Uber cab or auto"
          >
            <span>Uber</span>
          </a>

          {/* Zomato */}
          <a
            href={`https://www.zomato.com/search?q=${encodeURIComponent(destinationName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1 transition-colors"
            title="Order food or explore restaurants on Zomato"
          >
            <span>Zomato</span>
          </a>

          {/* Swiggy */}
          <a
            href={`https://www.swiggy.com/search?query=${encodeURIComponent(destinationName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center gap-1 transition-colors"
            title="Order meals or snacks on Swiggy"
          >
            <span>Swiggy</span>
          </a>

          {/* Meesho */}
          <a
            href={`https://www.meesho.com/search?q=${encodeURIComponent(destinationName + ' travel')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 rounded-md bg-purple-700 hover:bg-purple-800 text-white font-bold flex items-center gap-1 transition-colors"
            title="Shop local outfits & accessories on Meesho"
          >
            <span>Meesho</span>
          </a>

          {/* Amazon */}
          <a
            href={`https://www.amazon.in/s?k=${encodeURIComponent(destinationName + ' travel essentials')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold flex items-center gap-1 transition-colors"
            title="Order travel gear & electronics on Amazon"
          >
            <span>Amazon</span>
          </a>

          {/* Flipkart */}
          <a
            href={`https://www.flipkart.com/search?q=${encodeURIComponent(destinationName + ' travel')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 transition-colors"
            title="Order luggage & gear on Flipkart"
          >
            <span>Flipkart</span>
          </a>
        </div>
      </div>

      {/* Amenity Cards List */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectAmenityOnMap?.(item)}
            className="p-4 rounded-xl border border-stone-200/90 hover:border-teal-700/40 bg-stone-50/40 hover:bg-white transition-all flex flex-col justify-between gap-3 group cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-teal-50 transition-colors">
                  {getAmenityIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-stone-900 group-hover:text-teal-900 transition-colors">
                      {item.name}
                    </h4>
                    {item.verified && (
                      <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>{item.address}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-stone-700">{item.distance}</span>
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Price or Rating */}
              <div className="text-right shrink-0">
                {item.type === 'hotel' && item.pricePerNight && (
                  <div>
                    <div className="text-xs font-bold text-teal-900 tabular-nums">
                      ₹{item.pricePerNight.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-stone-400">/ night</div>
                  </div>
                )}
                {item.type === 'restaurant' && item.avgCostForTwo && (
                  <div>
                    <div className="text-xs font-bold text-stone-900 tabular-nums">
                      ₹{item.avgCostForTwo.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-stone-400">for two</div>
                  </div>
                )}
                {item.type === 'police' && (
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                    Emergency Unit
                  </span>
                )}
                {item.type === 'fuel' && item.operatingHours && (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>{item.operatingHours}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Tags and Call Phone Action */}
            <div className="pt-2.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {item.contactNumber && (
                <a
                  href={`tel:${item.contactNumber.replace(/\s+/g, '')}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-teal-800 hover:text-teal-950 font-semibold"
                >
                  <Phone className="w-3 h-3" />
                  <span>{item.contactNumber}</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
