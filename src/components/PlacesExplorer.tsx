import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapPin,
  Search,
  Star,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  Compass,
  Mountain,
  TreePine,
  Church,
  Waves,
  Building2,
  Palette,
  Utensils,
  Ticket,
  Sparkles,
  Loader2,
  AlertCircle,
  Navigation,
  X,
  BadgeIndianRupee,
  Bus,
  CalendarDays,
  ShoppingBag,
} from 'lucide-react';
import { fetchPlaces, searchPlaces, fetchStates, fetchCategories, Place } from '../lib/placesApi';
import { PlaceForPlan } from '../data/sampleTrips';

/* ── Category visual config ────────────────────────────────────────────────── */
const CATEGORY_META: Record<string, { icon: React.ReactNode; gradient: string }> = {
  'Historical & heritage':       { icon: <Building2 className="w-3.5 h-3.5" />, gradient: 'from-amber-500 to-orange-600' },
  'Wildlife & protected nature': { icon: <TreePine className="w-3.5 h-3.5" />,  gradient: 'from-emerald-500 to-green-700' },
  'Religious sites':             { icon: <Church className="w-3.5 h-3.5" />,    gradient: 'from-violet-500 to-purple-700' },
  'Hills & adventure':           { icon: <Mountain className="w-3.5 h-3.5" />,  gradient: 'from-sky-500 to-blue-700' },
  'Beaches & coastal':           { icon: <Waves className="w-3.5 h-3.5" />,     gradient: 'from-cyan-400 to-teal-600' },
  'Water & scenic nature':       { icon: <Waves className="w-3.5 h-3.5" />,     gradient: 'from-blue-400 to-indigo-600' },
  'Museums & culture':           { icon: <Palette className="w-3.5 h-3.5" />,   gradient: 'from-rose-400 to-pink-600' },
  'Food & nightlife':            { icon: <Utensils className="w-3.5 h-3.5" />,  gradient: 'from-orange-400 to-red-600' },
  'Amusement & adventure parks': { icon: <Ticket className="w-3.5 h-3.5" />,      gradient: 'from-fuchsia-400 to-purple-600' },
  'Shopping Malls':              { icon: <ShoppingBag className="w-3.5 h-3.5" />, gradient: 'from-pink-500 to-rose-600' },
  'Other attractions & places':  { icon: <Compass className="w-3.5 h-3.5" />,    gradient: 'from-stone-400 to-stone-600' },
};
const DEFAULT_META = { icon: <Compass className="w-3.5 h-3.5" />, gradient: 'from-stone-400 to-stone-600' };

/* ── Entry pass heuristic ──────────────────────────────────────────────────── */
/** Read real entry pass data from the API-provided entry_pass field */
function getEntryPassDisplay(place: Place): { label: string; price: string; free: boolean; notes: string | null; bookingUrl: string | null } | null {
  const ep = place.entry_pass;
  if (!ep) return null;
  const free = ep.indian_price === 0 && ep.foreign_price === 0;
  let price: string;
  if (free) {
    price = 'Free Entry';
  } else if (ep.indian_price === ep.foreign_price) {
    price = `₹${ep.indian_price}`;
  } else {
    price = `₹${ep.indian_price} (Indian) · ₹${ep.foreign_price} (Foreign)`;
  }
  if (ep.child_price > 0) {
    price += ` · Child ₹${ep.child_price}`;
  }
  return {
    label: free ? 'Free Entry' : 'Entry Pass',
    price,
    free,
    notes: ep.notes,
    bookingUrl: ep.booking_url,
  };
}

/* ── OSM embed builder ─────────────────────────────────────────────────────── */
function osmEmbed(query: string): string {
  const bbox = '';
  // Use OSM search embed with the place name
  return `https://www.openstreetmap.org/export/embed.html?bbox=68.0,6.5,97.5,37.5&layer=mapnik`;
}

function osmPlaceEmbed(name: string, state: string | null): string {
  // Construct an OSM search URL centered on India, but the marker will be the query
  const q = encodeURIComponent([name, state, 'India'].filter(Boolean).join(', '));
  return `https://www.google.com/maps/embed/v1/place?key=&q=${q}`;
}

function googleMapsUrl(name: string, state: string | null, district: string | null): string {
  const parts = [name, district, state, 'India'].filter(Boolean);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(', '))}`;
}

function googleMapsDirectionsUrl(name: string, state: string | null): string {
  const q = [name, state, 'India'].filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
}

function redBusUrl(name: string, state: string | null): string {
  const city = (name || '').split('(')[0].trim();
  return `https://www.redbus.in/search?toCityName=${encodeURIComponent(city)}&toCity=${encodeURIComponent([city, state || ''].filter(Boolean).join(', '))}`;
}

/* ── Recommended days to spend ─────────────────────────────────────────────── */
function getRecommendedDays(category: string | null): { days: string; label: string } {
  const cat = (category || '').toLowerCase();
  if (cat.includes('wildlife') || cat.includes('national park') || cat.includes('tiger reserve'))
    return { days: '2–3', label: 'days for safari' };
  if (cat.includes('hill station') || cat.includes('hill') || cat.includes('mountain'))
    return { days: '3–4', label: 'days' };
  if (cat.includes('beach') || cat.includes('coastal') || cat.includes('island'))
    return { days: '2–3', label: 'days' };
  if (cat.includes('historical') || cat.includes('heritage') || cat.includes('fort') || cat.includes('palace'))
    return { days: '1–2', label: 'days' };
  if (cat.includes('religious') || cat.includes('temple') || cat.includes('pilgrimage'))
    return { days: '1', label: 'day' };
  if (cat.includes('museum'))
    return { days: '2–3', label: 'hours' };
  if (cat.includes('waterfall') || cat.includes('lake') || cat.includes('river'))
    return { days: '1', label: 'day' };
  if (cat.includes('garden') || cat.includes('botanical') || cat.includes('park'))
    return { days: '2–3', label: 'hours' };
  if (cat.includes('amusement') || cat.includes('theme park'))
    return { days: '1', label: 'full day' };
  if (cat.includes('shopping') || cat.includes('mall'))
    return { days: '2–4', label: 'hours' };
  if (cat.includes('adventure') || cat.includes('trekking'))
    return { days: '2–4', label: 'days' };
  if (cat.includes('cultural') || cat.includes('art'))
    return { days: '1', label: 'day' };
  return { days: '1–2', label: 'days' };
}

/* ── Wikipedia Thumbnail Fetcher ───────────────────────────────────────────── */
// Uses Wikipedia's free pageimages API — no API key needed.
const wikiImageCache = new Map<string, string | null>();

function useWikiImage(placeName: string): string | null {
  const [imgUrl, setImgUrl] = React.useState<string | null>(() => wikiImageCache.get(placeName) ?? null);

  React.useEffect(() => {
    if (wikiImageCache.has(placeName)) {
      setImgUrl(wikiImageCache.get(placeName) ?? null);
      return;
    }
    const query = placeName.replace(/\s*\(.*?\)/g, '').trim();
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=600&origin=*`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const pages = data?.query?.pages ?? {};
        const page = Object.values(pages)[0] as { thumbnail?: { source: string } } | undefined;
        const src = page?.thumbnail?.source ?? null;
        wikiImageCache.set(placeName, src);
        setImgUrl(src);
      })
      .catch(() => {
        wikiImageCache.set(placeName, null);
      });
  }, [placeName]);

  return imgUrl;
}

/* ── PlaceCard sub-component ────────────────────────────────────────────────── */
interface PlaceCardProps {
  place: Place;
  isActive: boolean;
  onSelect: () => void;
  onPlanDestination?: (place: PlaceForPlan) => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, isActive, onSelect, onPlanDestination }) => {
  const wikiImg = useWikiImage(place.name);
  const cat = place.selection_category || 'Other attractions & places';
  const meta = CATEGORY_META[cat] || DEFAULT_META;
  const entry = getEntryPassDisplay(place);
  const rec   = getRecommendedDays(place.selection_category);
  const mapsUrl = place.google_maps_url || googleMapsUrl(place.name, place.state, place.district);
  const audienceLabels = (place.audience_categories || []).map(a => a.category_label).slice(0, 3);
  const bookingUrl = place.entry_pass?.booking_url;
  const indianPrice = place.entry_pass?.indian_price ?? null;
  const foreignPrice = place.entry_pass?.foreign_price ?? null;
  const childPrice = place.entry_pass?.child_price ?? null;

  // ── Duration picker state ──────────────────────────────────────────────────
  const [durOpen, setDurOpen] = React.useState(false);
  const [durValue, setDurValue] = React.useState(rec.days);
  const [durUnit, setDurUnit] = React.useState<'days' | 'weeks' | 'months'>(
    rec.label.includes('week') ? 'weeks' : rec.label.includes('month') ? 'months' : 'days'
  );
  const durRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (durRef.current && !durRef.current.contains(e.target as Node)) setDurOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const durLabel = `${durValue} ${durUnit}`;

  const DAYS_OPTIONS    = ['1','2','3','4','5','6','7','10','14'];
  const WEEKS_OPTIONS   = ['1','2','3','4'];
  const MONTHS_OPTIONS  = ['1','2','3'];

  const currentOptions = durUnit === 'days' ? DAYS_OPTIONS : durUnit === 'weeks' ? WEEKS_OPTIONS : MONTHS_OPTIONS;

  // Convert selected duration to number of days for the trip planner
  function durToDays(): number {
    const n = parseInt(durValue, 10) || 1;
    if (durUnit === 'weeks')  return n * 7;
    if (durUnit === 'months') return n * 30;
    return n;
  }

  return (
    <div
      onClick={onSelect}
      className={`group bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer ${
        isActive ? 'border-teal-400 ring-2 ring-teal-200' : 'border-stone-200/80 hover:border-stone-300'
      }`}
    >
      {/* ── Photo header ── */}
      <div
        className={`h-32 relative overflow-hidden bg-gradient-to-br ${meta.gradient}`}
        style={wikiImg ? { backgroundImage: `url(${wikiImg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        <div className={`absolute inset-0 ${wikiImg ? 'bg-gradient-to-t from-black/70 via-black/20 to-black/30' : 'bg-black/20'}`} />

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1 z-10">
          <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1 max-w-[60%] truncate">
            {meta.icon}{cat}
          </span>
          <div className="flex items-center gap-1">
            {entry && bookingUrl ? (
              <a href={bookingUrl} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()} title="Book Entry Pass on Official Website"
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-0.5 cursor-pointer hover:scale-105 transition-transform shadow-sm ${
                  entry.free ? 'bg-emerald-400/90 text-emerald-900' : 'bg-amber-400/90 text-amber-900'
                }`}>
                <Ticket className="w-3 h-3" />{entry.free ? 'Free' : `₹${indianPrice}`}
              </a>
            ) : entry ? (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-0.5 ${
                entry.free ? 'bg-emerald-400/90 text-emerald-900' : 'bg-amber-400/90 text-amber-900'
              }`}>
                <Ticket className="w-3 h-3" />{entry.free ? 'Free' : `₹${indianPrice}`}
              </span>
            ) : null}
            {place.rating_value != null && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-bold text-white">
                <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />{place.rating_value}
              </span>
            )}
          </div>
        </div>

        {/* Place name */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 z-10">
          <h3 className="text-sm font-bold text-white leading-snug line-clamp-1 drop-shadow-md">{place.name}</h3>
          {wikiImg && <p className="text-[9px] text-white/50 mt-0.5">📷 Wikipedia</p>}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-3">
        {/* Location */}
        <div className="flex items-center gap-1 text-[10px] text-stone-500 mb-2">
          <MapPin className="w-3 h-3 text-teal-700 shrink-0" />
          <span className="truncate">{[place.district, place.state].filter(Boolean).join(', ') || 'India'}</span>
        </div>

        {/* ── Duration Picker ── */}
        <div className="mb-2" ref={durRef}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-[10px] text-stone-500 font-semibold">
              <CalendarDays className="w-3 h-3 text-violet-600" />
              <span>Duration to Spend</span>
            </div>
            <span className="text-[9px] text-stone-400 italic">suggested: {rec.days} {rec.label}</span>
          </div>

          {/* Dropdown trigger */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setDurOpen(!durOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border-2 border-violet-200 bg-violet-50 hover:bg-violet-100 hover:border-violet-400 transition-all"
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 text-violet-600" />
                <span className="text-[11px] font-bold text-violet-800">{durLabel}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-violet-500 transition-transform ${durOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown panel */}
            {durOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-violet-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {/* Unit tabs */}
                <div className="flex border-b border-violet-100">
                  {(['days', 'weeks', 'months'] as const).map(unit => (
                    <button key={unit}
                      onClick={() => { setDurUnit(unit); setDurValue(unit === 'days' ? '1' : unit === 'weeks' ? '1' : '1'); }}
                      className={`flex-1 py-1.5 text-[10px] font-bold capitalize transition-colors ${
                        durUnit === unit ? 'bg-violet-600 text-white' : 'text-stone-500 hover:bg-violet-50'
                      }`}>
                      {unit}
                    </button>
                  ))}
                </div>
                {/* Value options grid */}
                <div className="grid grid-cols-4 gap-1 p-2">
                  {currentOptions.map(opt => (
                    <button key={opt}
                      onClick={() => { setDurValue(opt); setDurOpen(false); }}
                      className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        durValue === opt && 'text-white' ? '' : ''
                      } ${
                        durValue === opt
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-100'
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
                {/* Selected summary */}
                <div className="px-3 pb-2 text-center">
                  <span className="text-[9px] text-violet-500 font-semibold">
                    Selected: <span className="text-violet-700">{durValue} {durUnit}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Opening hours */}
        {place.opening_hours && (
          <div className="flex items-center gap-1 text-[10px] text-stone-400 mb-2">
            <Clock className="w-3 h-3 shrink-0" />
            <span className="truncate">{place.opening_hours}</span>
          </div>
        )}

        {/* ── Entry Pass Section ── */}
        {entry && (
          <div className={`rounded-xl border p-2 mb-2 ${
            entry.free ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  <Ticket className={`w-3.5 h-3.5 shrink-0 ${entry.free ? 'text-emerald-600' : 'text-amber-600'}`} />
                  <span className={`text-[10px] font-bold ${entry.free ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {entry.free ? 'Free Entry' : `₹${indianPrice} Indian`}
                  </span>
                </div>
                {!entry.free && foreignPrice != null && foreignPrice > 0 && (
                  <span className="text-[9px] text-stone-500 pl-5">
                    ₹{foreignPrice} Foreign{childPrice != null && childPrice > 0 ? ` • ₹${childPrice} Child` : ''}
                  </span>
                )}
              </div>
              {bookingUrl ? (
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all hover:scale-105 ${
                    entry.free ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}>
                  <ExternalLink className="w-3 h-3" />
                  {entry.free ? 'Visit Site' : 'Book Now'}
                </a>
              ) : (
                <span className="text-[9px] text-stone-400 italic">No online booking</span>
              )}
            </div>
          </div>
        )}

        {/* Audience tags */}
        {audienceLabels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {audienceLabels.map((l) => (
              <span key={l} className="px-1.5 py-0.5 rounded bg-teal-50 border border-teal-100 text-[9px] font-semibold text-teal-800 flex items-center gap-0.5">
                <Users className="w-2.5 h-2.5" />{l}
              </span>
            ))}
          </div>
        )}

        {/* ── Action buttons ── */}
        <div className="flex items-center gap-1 pt-2 border-t border-stone-100">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg border border-stone-200 text-[10px] font-bold text-stone-700 hover:bg-stone-50 transition-colors">
            <Navigation className="w-3 h-3 text-teal-700" />Map
          </a>
          <a href={redBusUrl(place.name, place.state)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-[10px] font-bold text-red-700 hover:bg-red-100 transition-colors">
            <Bus className="w-3 h-3" />Book Bus
          </a>
          {onPlanDestination && (
            <button onClick={(e) => { e.stopPropagation(); onPlanDestination(place as unknown as PlaceForPlan); }}
              className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-[10px] font-bold transition-colors cursor-pointer">
              <Sparkles className="w-3 h-3 text-teal-300" />Plan {durLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── PlacesExplorer ─────────────────────────────────────────────────────────── */
interface PlacesExplorerProps {
  onPlanDestination?: (place: PlaceForPlan) => void;
}

export const PlacesExplorer: React.FC<PlacesExplorerProps> = ({ onPlanDestination }) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 12;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedState, setSelectedState] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const [states, setStates] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Selected place for detail panel with map
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const [isStateOpen, setIsStateOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsStateOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    fetchStates().then(setStates).catch(() => {});
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeSearch.trim()) {
        const r = await searchPlaces(activeSearch.trim(), page, pageSize);
        setPlaces(r.places); setTotal(r.total);
      } else {
        const r = await fetchPlaces({ state: selectedState || undefined, category: selectedCategory || undefined, page, size: pageSize });
        setPlaces(r.places); setTotal(r.total);
      }
    } catch {
      setError('Could not load places. Make sure the Java backend is running on port 8081.');
      setPlaces([]); setTotal(0);
    } finally { setLoading(false); }
  }, [activeSearch, selectedState, selectedCategory, page, pageSize]);

  useEffect(() => { loadPlaces(); }, [loadPlaces]);
  useEffect(() => { setPage(0); }, [activeSearch, selectedState, selectedCategory]);
  useEffect(() => { gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [page]);

  const handleSelectState = (s: string) => { setSelectedState(s); setActiveSearch(''); setSearchQuery(''); setIsStateOpen(false); setSelectedPlace(null); };
  const handleSearch = () => { setActiveSearch(searchQuery); setSelectedState(''); setSelectedCategory(''); setSelectedPlace(null); };
  const totalPages = Math.ceil(total / pageSize);

  return (
    <section id="destination-explorer" className="py-16 sm:py-24 bg-gradient-to-b from-[#F8FAF9] to-[#EDF2EF] border-t border-stone-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-800 tracking-wider uppercase mb-2 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
            <Compass className="w-4 h-4" />
            <span>700+ Indian Destinations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] mb-2">
            Discover & Plan Your Trip
          </h2>
          <p className="text-sm sm:text-base text-stone-500 max-w-2xl mx-auto">
            Select a state, browse destinations, check entry passes, view on Google Maps — and plan your trip with AI in one click.
          </p>
        </div>

        {/* ── Controls ── */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-end">

            {/* State Dropdown */}
            <div className="flex-1" ref={dropdownRef}>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">State</label>
              <div className="relative">
                <button
                  onClick={() => setIsStateOpen(!isStateOpen)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 border-teal-200 bg-teal-50/50 text-sm font-semibold text-stone-900 hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-700" />
                    {selectedState || 'All States'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-teal-700 transition-transform ${isStateOpen ? 'rotate-180' : ''}`} />
                </button>
                {isStateOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-stone-200 shadow-xl max-h-64 overflow-y-auto">
                    <button onClick={() => handleSelectState('')}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 cursor-pointer flex items-center gap-2 ${!selectedState ? 'bg-teal-50 font-bold text-teal-900' : 'text-stone-700'}`}>
                      <Compass className="w-3.5 h-3.5 text-teal-600" />All States
                    </button>
                    <div className="border-t border-stone-100" />
                    {states.map((s) => (
                      <button key={s} onClick={() => handleSelectState(s)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 cursor-pointer flex items-center gap-2 ${selectedState === s ? 'bg-teal-50 font-bold text-teal-900' : 'text-stone-700'}`}>
                        <MapPin className="w-3 h-3 text-stone-400" />{s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="lg:w-52">
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Category</label>
              <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setActiveSearch(''); setSearchQuery(''); setSelectedPlace(null); }}
                className="w-full px-3 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 cursor-pointer">
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Search */}
            <div className="lg:w-72">
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Search Places</label>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by name, district…"
                    className="w-full pl-9 pr-3 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all" />
                </div>
                <button onClick={handleSearch} className="px-4 py-3 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-sm font-bold cursor-pointer">Go</button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Results header ── */}
        <div ref={gridRef} className="flex items-center justify-between mb-5">
          <div className="text-sm text-stone-600">
            {loading
              ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-teal-600" />Loading…</span>
              : <><strong className="text-stone-900">{total}</strong> place{total !== 1 ? 's' : ''}
                  {selectedState && <> in <strong className="text-teal-800">{selectedState}</strong></>}
                  {selectedCategory && <> · <strong className="text-teal-800">{selectedCategory}</strong></>}
                  {activeSearch && <> matching "<strong className="text-teal-800">{activeSearch}</strong>"</>}
                </>
            }
          </div>
          {totalPages > 1 && !loading && <span className="text-xs text-stone-400">Page {page + 1}/{totalPages}</span>}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex flex-col items-center py-16 gap-3 bg-white rounded-2xl border border-rose-200 mb-6">
            <AlertCircle className="w-8 h-8 text-rose-500" />
            <p className="text-sm text-rose-700 text-center max-w-md">{error}</p>
            <button onClick={loadPlaces} className="px-4 py-2 bg-teal-800 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-teal-900">Retry</button>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-200 overflow-hidden animate-pulse">
                <div className="h-24 bg-stone-200" />
                <div className="p-4 space-y-2"><div className="h-3 bg-stone-200 rounded w-3/4" /><div className="h-2.5 bg-stone-100 rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        )}

        {/* ── Main layout: Grid + Detail Panel ── */}
        {!loading && !error && places.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Places Grid */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${selectedPlace ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-4 flex-1`}>
              {places.map((place) => (
                <PlaceCard
                  key={place.place_id}
                  place={place}
                  isActive={selectedPlace?.place_id === place.place_id}
                  onSelect={() => setSelectedPlace(selectedPlace?.place_id === place.place_id ? null : place)}
                  onPlanDestination={onPlanDestination}
                />
              ))}
            </div>

            {/* ── Detail + Map Side Panel ── */}
            {selectedPlace && (
              <div className="w-full lg:w-[420px] shrink-0 bg-white rounded-2xl border border-stone-200 shadow-md overflow-hidden sticky top-24 self-start">
                {/* Map */}
                <div className="relative h-56 bg-stone-100">
                  <iframe
                    key={selectedPlace.place_id}
                    title={`Map of ${selectedPlace.name}`}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                      // Center on India — shows a general marker
                      '68.0,6.5,97.5,37.5'
                    }&layer=mapnik`}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                  {/* Overlay link to Google Maps */}
                  <a href={selectedPlace.google_maps_url || googleMapsUrl(selectedPlace.name, selectedPlace.state, selectedPlace.district)}
                    target="_blank" rel="noopener noreferrer"
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md text-xs font-bold text-stone-800 border border-stone-200 shadow-md hover:bg-teal-50 transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-teal-700" />Open in Google Maps<ExternalLink className="w-3 h-3 text-stone-400" />
                  </a>
                </div>

                {/* Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-base font-bold text-stone-900 leading-snug">{selectedPlace.name}</h3>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-teal-700" />
                        {[selectedPlace.district, selectedPlace.state].filter(Boolean).join(', ')}
                      </p>
                    </div>
                    <button onClick={() => setSelectedPlace(null)} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Entry pass — real pricing */}
                  {(() => {
                    const entry = getEntryPassDisplay(selectedPlace);
                    if (!entry) return null;
                    return (
                      <div className={`rounded-xl mb-3 overflow-hidden border ${
                        entry.free ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
                      }`}>
                        <div className={`flex items-center gap-2 px-3 py-2 text-xs font-bold ${
                          entry.free ? 'text-emerald-800' : 'text-amber-800'
                        }`}>
                          <BadgeIndianRupee className="w-4 h-4" />
                          <span>{entry.label}</span>
                          <span className="ml-auto font-black">{entry.price}</span>
                        </div>
                        {entry.notes && (
                          <div className={`px-3 py-1.5 text-[10px] leading-relaxed border-t ${
                            entry.free ? 'border-emerald-200 text-emerald-700 bg-emerald-50/50' : 'border-amber-200 text-amber-700 bg-amber-50/50'
                          }`}>
                            {entry.notes}
                          </div>
                        )}
                        {entry.bookingUrl && (
                          <a href={entry.bookingUrl} target="_blank" rel="noopener noreferrer"
                            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-bold border-t transition-colors ${
                              entry.free
                                ? 'border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                                : 'border-amber-200 text-amber-800 hover:bg-amber-100'
                            }`}>
                            <Ticket className="w-3 h-3" />
                            Book Tickets Online
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    );
                  })()}

                  {selectedPlace.description && (
                    <p className="text-xs text-stone-600 leading-relaxed mb-3">{selectedPlace.description}</p>
                  )}

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] mb-4">
                    {selectedPlace.selection_category && (
                      <div><span className="font-bold text-stone-400 uppercase text-[9px]">Category</span><div className="text-stone-800 font-medium">{selectedPlace.selection_category}</div></div>
                    )}
                    {selectedPlace.rating_value != null && (
                      <div><span className="font-bold text-stone-400 uppercase text-[9px]">Rating</span>
                        <div className="text-stone-800 font-medium flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />{selectedPlace.rating_text || selectedPlace.rating_value}</div>
                      </div>
                    )}
                    {selectedPlace.opening_hours && (
                      <div><span className="font-bold text-stone-400 uppercase text-[9px]">Hours</span><div className="text-stone-800 font-medium">{selectedPlace.opening_hours}</div></div>
                    )}
                    {selectedPlace.state && (
                      <div><span className="font-bold text-stone-400 uppercase text-[9px]">State</span><div className="text-stone-800 font-medium">{selectedPlace.state}</div></div>
                    )}
                  </div>

                  {/* Audience */}
                  {selectedPlace.audience_categories && selectedPlace.audience_categories.length > 0 && (
                    <div className="mb-4">
                      <span className="font-bold text-stone-400 uppercase text-[9px] block mb-1">Best For</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedPlace.audience_categories.map((a) => (
                          <span key={a.category_key} className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-[10px] font-semibold text-teal-800">
                            {a.category_label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <a href={googleMapsDirectionsUrl(selectedPlace.name, selectedPlace.state)}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors">
                        <Navigation className="w-3.5 h-3.5 text-teal-700" />Directions
                      </a>
                      {onPlanDestination && (
                        <button onClick={() => onPlanDestination(selectedPlace.name, selectedPlace.state || '')}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm">
                          <Sparkles className="w-3.5 h-3.5 text-teal-300" />Plan My Trip
                        </button>
                      )}
                    </div>
                    <a href={redBusUrl(selectedPlace.name, selectedPlace.state)}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm">
                      <Bus className="w-4 h-4" />
                      Book Bus Tickets on RedBus
                      <ExternalLink className="w-3 h-3 text-red-200" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && places.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3 bg-white rounded-2xl border border-stone-200">
            <Search className="w-8 h-8 text-stone-300" />
            <p className="text-sm text-stone-500">No places found.</p>
            <button onClick={() => { setSelectedState(''); setSelectedCategory(''); setActiveSearch(''); setSearchQuery(''); }}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer">Show all places</button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
              className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pn: number;
              if (totalPages <= 7) pn = i;
              else if (page < 3) pn = i;
              else if (page > totalPages - 4) pn = totalPages - 7 + i;
              else pn = page - 3 + i;
              return (
                <button key={pn} onClick={() => setPage(pn)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    page === pn ? 'bg-teal-800 text-white shadow-sm' : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}>{pn + 1}</button>
              );
            })}
            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
              className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
