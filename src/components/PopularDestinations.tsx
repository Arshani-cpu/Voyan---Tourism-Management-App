import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { CATEGORIZED_DESTINATIONS, EXPLORE_THEMES, INDIAN_STATES, PLACE_CATEGORIES } from '../data/destinations';
import { DestinationCard } from './DestinationCard';
import { DirectoryPlaceCard, DirectoryPlace } from './DirectoryPlaceCard';
import { DestinationItem, PlaceCategory } from '../types/travel';

interface PopularDestinationsProps {
  onSelectDestination: (destination: DestinationItem) => void;
  onOpenStateDetails: (
    destination: DestinationItem,
    section: 'budget_transit' | 'vault'
  ) => void;
}

export const PopularDestinations: React.FC<PopularDestinationsProps> = ({
  onSelectDestination,
  onOpenStateDetails,
}) => {
  const [directoryPlaces, setDirectoryPlaces] = useState<DirectoryPlace[]>([]);
  const [directoryError, setDirectoryError] = useState('');
  const [isDirectoryLoading, setIsDirectoryLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState('All Destinations');
  const [activePlaceCategory, setActivePlaceCategory] = useState<PlaceCategory | 'All Place Types'>('All Place Types');
  const [activeState, setActiveState] = useState('All States');
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePlaceCount, setVisiblePlaceCount] = useState(48);

  useEffect(() => {
    const loadDirectory = async () => {
      try {
        const response = await fetch('/data/places-directory.json');
        if (!response.ok) throw new Error(`Could not load the local places directory (HTTP ${response.status}).`);
        const result: unknown = await response.json();
        if (!Array.isArray(result) || !result.every((place) =>
          place && typeof place.id === 'string' &&
          typeof place.name === 'string' &&
          typeof place.state === 'string' &&
          typeof place.location === 'string' &&
          typeof place.timings === 'string' &&
          typeof place.description === 'string' &&
          typeof place.source === 'string'
        )) {
          throw new Error('The local places directory has an invalid data format.');
        }
        setDirectoryPlaces(result as DirectoryPlace[]);
        setDirectoryError('');
      } catch (error) {
        setDirectoryError(error instanceof Error ? error.message : 'Could not load the local places directory.');
      } finally {
        setIsDirectoryLoading(false);
      }
    };
    void loadDirectory();
  }, []);

  const resetVisiblePlaces = () => setVisiblePlaceCount(48);

  const getPlaceCategories = (place: DirectoryPlace): PlaceCategory[] => {
    const text = `${place.name} ${place.location} ${place.description}`.toLocaleLowerCase();
    const categories: PlaceCategory[] = [];
    if (/temple|mosque|church|monastery|shrine|pilgrim|basilica|ashram/.test(text)) categories.push('Temples & Pilgrimage');
    if (/fort|palace|museum|heritage|historic|historical|monument|cave|archaeolog|memorial|ruin|ancient/.test(text)) categories.push('Historical & Heritage');
    if (/beach|coast|island|shore|marine|sea\b/.test(text)) categories.push('Beaches & Islands');
    if (/waterfall|falls\b|lake|dam|river|viewpoint|valley|hill|mountain|peak|trek|trail/.test(text)) categories.push(/trek|trail|climb|rafting|adventure/.test(text) ? 'Adventure & Outdoors' : 'Lakes & Waterfalls');
    if (/forest|wildlife|sanctuary|national park|tiger reserve|bird|elephant|zoo|biosphere/.test(text)) categories.push('Nature & Wildlife');
    if (/resort|spa|wellness|retreat|hot spring/.test(text)) categories.push('Resorts & Wellness');
    if (/amusement|theme park|water park|zoo|aquarium|toy train|ropeway/.test(text)) categories.push('Amusement & Family');
    if (/market|bazaar|food|cuisine|street food|craft|festival|cultural/.test(text)) categories.push(/market|bazaar|food|cuisine|street food/.test(text) ? 'Food & Markets' : 'Culture & Festivals');
    return categories.length ? [...new Set(categories)] : ['Culture & Festivals'];
  };

  const filteredDestinations = CATEGORIZED_DESTINATIONS.filter((item) => {
    const matchesTheme = activeTheme === 'All Destinations'
      || (activeTheme === 'Under ₹7,000'
        ? item.startingPrice <= 7000
        : item.category === activeTheme);
    const matchesState = activeState === 'All States' || item.state === activeState;
    const matchesPlaceCategory = activePlaceCategory === 'All Place Types'
      || item.placeCategories?.includes(activePlaceCategory);
    const query = searchQuery.trim().toLocaleLowerCase();
    const matchesQuery = !query || [
      item.name,
      item.state,
      item.tagline,
      ...item.highlights,
      ...(item.placeCategories ?? []),
    ].some((value) => value.toLocaleLowerCase().includes(query));
    return matchesTheme && matchesState && matchesPlaceCategory && matchesQuery;
  });

  const filteredDirectoryPlaces = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return directoryPlaces.filter((place) => {
      const categories = getPlaceCategories(place);
      const matchesTheme = activeTheme === 'All Destinations'
        || (activeTheme !== 'Under ₹7,000' && inferDestinationCategory(place, categories) === activeTheme);
      const matchesState = activeState === 'All States' || place.state === activeState;
      const matchesPlaceCategory = activePlaceCategory === 'All Place Types' || categories.includes(activePlaceCategory);
      const matchesQuery = !query || [
        place.name,
        place.state,
        place.location,
        place.description,
        ...categories,
      ].some((value) => value.toLocaleLowerCase().includes(query));
      return matchesTheme && matchesState && matchesPlaceCategory && matchesQuery;
    });
  }, [directoryPlaces, activeTheme, activeState, activePlaceCategory, searchQuery]);

  const makePlaceDestination = (place: DirectoryPlace): DestinationItem => {
    const placeCategories = getPlaceCategories(place);
    const category = inferDestinationCategory(place, placeCategories);
    const region: DestinationItem['region'] = /Tamil Nadu|Kerala|Karnataka|Andhra Pradesh|Telangana|Puducherry/i.test(place.state)
      ? 'South'
      : /Himachal|Uttarakhand|Jammu|Ladakh|Sikkim|Arunachal/i.test(place.state)
        ? 'Himalayas'
        : /Rajasthan|Delhi|Uttar Pradesh|Punjab|Haryana|Chandigarh/i.test(place.state)
          ? 'North'
          : /Maharashtra|Gujarat|Goa|Dadra|Lakshadweep/i.test(place.state)
            ? 'West'
            : 'East';
    return {
      id: place.id.slice(0, 64),
      name: place.name,
      state: place.state,
      region,
      category,
      tagline: place.description || `${place.name} in ${place.state}, India.`,
      startingPrice: 8000,
      recommendedDays: 1,
      bestMonths: 'Check locally',
      image: '/src/assets/images/dest_kerala_backwaters_1792467358939.jpg',
      rating: 0,
      reviewsCount: 0,
      highlights: [place.location || place.name],
      defaultPrompt: `Plan a trip to ${place.name}, ${place.state}${place.location ? ` near ${place.location}` : ''}.`,
      placeCategories,
    };
  };

  const selectedStatePlaceCount = directoryPlaces.filter((place) => place.state === activeState).length;
  const selectedStateDirectoryPlace = directoryPlaces.find((place) => place.state === activeState);
  const selectedStateDestination = activeState === 'All States'
    ? null
    : CATEGORIZED_DESTINATIONS.find((destination) => destination.state === activeState)
      ?? (selectedStateDirectoryPlace ? makePlaceDestination(selectedStateDirectoryPlace) : null);

  const placeTypeFilters: (PlaceCategory | 'All Place Types')[] = ['All Place Types', ...PLACE_CATEGORIES];

  return (
    <section id="popular-destinations" className="py-16 sm:py-20 border-t border-stone-200/70 bg-[#FBFBFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="text-xs font-semibold text-teal-800 tracking-wider uppercase mb-1">
              Curated Destinations
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] [text-wrap:balance]">
              Find real places across India
            </h2>
            <p className="mt-2 text-sm text-stone-600 max-w-xl">
              Choose a state to browse curated destinations and real attractions, or search by name and interest. Map links open Google Maps for current place details.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:min-w-[420px]">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  resetVisiblePlaces();
                }}
                placeholder="Search places or experiences"
                aria-label="Search destinations and places"
                className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-3 text-sm text-stone-800 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              />
            </label>
            <label className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-800 pointer-events-none" aria-hidden="true" />
              <select
                value={activeState}
                onChange={(event) => {
                  setActiveState(event.target.value);
                  resetVisiblePlaces();
                }}
                aria-label="Filter destinations by state or union territory"
                className="w-full appearance-none rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-8 text-sm text-stone-800 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15"
              >
                <option>All States</option>
                {INDIAN_STATES.map((state) => <option key={state}>{state}</option>)}
              </select>
            </label>
          </div>
        </div>

        {activeState !== 'All States' && selectedStateDestination && (
          <section className="mb-8 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5 sm:p-6" aria-label={`${activeState} trip planning`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-teal-800">Plan this state</p>
                <h3 className="mt-1 text-xl font-bold text-[#0F172A]">{activeState} trip planning</h3>
                <p className="mt-1 max-w-2xl text-sm text-stone-600">
                  Open a trip budget and route planner for {selectedStateDestination.name}, or review your saved booking documents and tickets in Trip Vault.
                  {selectedStatePlaceCount > 0 && ` Browse ${selectedStatePlaceCount.toLocaleString()} places from your local datasets below.`}
                </p>
                <p className="mt-2 text-xs text-stone-500">
                  Budgets and route details are planning estimates. Voyan does not make live reservations; add confirmed tickets and bookings to Trip Vault.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:min-w-52">
                <button
                  type="button"
                  onClick={() => onOpenStateDetails(selectedStateDestination, 'budget_transit')}
                  className="rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
                >
                  Open budget & routes
                </button>
                <button
                  type="button"
                  onClick={() => onOpenStateDetails(selectedStateDestination, 'vault')}
                  className="rounded-xl border border-teal-800 bg-white px-4 py-2.5 text-sm font-semibold text-teal-900 hover:bg-teal-50"
                >
                  Open bookings & tickets
                </button>
              </div>
            </div>
          </section>
        )}

        <div className="mb-5">
          {/* Interactive Category Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl overflow-x-auto max-w-full">
            {EXPLORE_THEMES.map((theme) => {
              const isActive = activeTheme === theme;
              return (
                <button
                  key={theme}
                  onClick={() => {
                    setActiveTheme(theme);
                    resetVisiblePlaces();
                  }}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {theme}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-600">
            Browse by place type
          </h3>
          <div className="flex flex-wrap gap-2">
            {placeTypeFilters.map((category) => {
              const isActive = activePlaceCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setActivePlaceCategory(category);
                    resetVisiblePlaces();
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'border-teal-800 bg-teal-800 text-white'
                      : 'border-stone-200 bg-white text-stone-700 hover:border-teal-700 hover:text-teal-900'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4 text-xs text-stone-500" aria-live="polite">
          Showing {filteredDirectoryPlaces.length} directory places and {filteredDestinations.length} curated destinations
          {activeState !== 'All States' ? ` in ${activeState}` : ' across India'}
        </div>
        <p className="mb-5 text-xs text-stone-500">
          Directory places are imported from your local travel datasets. Google Maps opens current location search results; listed hours and details may change. Curated destination budgets are estimates, not live quotes.
        </p>

        <div className="mb-10">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#0F172A]">Places from your local datasets</h3>
              <p className="text-xs text-stone-500">Browse individual attractions by state, place type, or search.</p>
            </div>
            {!isDirectoryLoading && <span className="text-xs text-stone-500">{filteredDirectoryPlaces.length.toLocaleString()} places</span>}
          </div>
          {isDirectoryLoading ? (
            <p role="status" className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-600">Loading places directory…</p>
          ) : directoryError ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">{directoryError}</p>
          ) : filteredDirectoryPlaces.length ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDirectoryPlaces.slice(0, visiblePlaceCount).map((place) => (
                  <DirectoryPlaceCard
                    key={place.id}
                    place={place}
                    categories={getPlaceCategories(place)}
                    destination={makePlaceDestination(place)}
                    onPlanTrip={onSelectDestination}
                  />
                ))}
              </div>
              {filteredDirectoryPlaces.length > visiblePlaceCount && (
                <button
                  type="button"
                  onClick={() => setVisiblePlaceCount((count) => count + 48)}
                  className="mt-5 w-full rounded-xl border border-teal-800 bg-white px-4 py-3 text-sm font-semibold text-teal-900 hover:bg-teal-50"
                >
                  Show more places ({(filteredDirectoryPlaces.length - visiblePlaceCount).toLocaleString()} remaining)
                </button>
              )}
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-center text-sm text-stone-600">
              No directory places match these filters.
            </p>
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-bold text-[#0F172A]">Curated trip destinations</h3>
          <p className="text-xs text-stone-500">Regional trip ideas with estimated budgets and suggested highlights.</p>
        </div>
        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDestinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                onSelect={onSelectDestination}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
            <p className="font-semibold text-stone-800">No destinations match those filters.</p>
            <p className="mt-1 text-sm text-stone-500">Try another state, category, or search.</p>
            <button
              type="button"
              onClick={() => {
                setActiveState('All States');
                setActiveTheme('All Destinations');
                setActivePlaceCategory('All Place Types');
                setSearchQuery('');
                resetVisiblePlaces();
              }}
              className="mt-4 rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900"
            >
              Clear filters
            </button>
          </div>
        )}
        </div>
    </section>
  );
};

function inferDestinationCategory(
  place: DirectoryPlace,
  categories: PlaceCategory[]
): DestinationItem['category'] {
  if (categories.includes('Beaches & Islands')) return 'Coastal & Beach';
  if (/hill|mountain|valley|peak|pass|trek/i.test(`${place.name} ${place.location}`)) return 'Hills & Mountains';
  if (categories.includes('Historical & Heritage') || categories.includes('Temples & Pilgrimage')) return 'Heritage & Royal';
  return 'Serene & Nature';
}
