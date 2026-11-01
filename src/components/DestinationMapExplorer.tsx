import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Compass,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Star,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { DestinationItem } from '../types/travel';
import { DISCOVERY_DESTINATIONS } from '../data/destinations';

interface DestinationMapExplorerProps {
  onPlanDestination: (dest: DestinationItem) => void;
}

interface DestinationPin extends DestinationItem {
  lat: number;
  lng: number;
}

const INDIA_DESTINATIONS: DestinationPin[] = [
  {
    id: 'dest-ooty',
    name: 'Ooty & Nilgiris',
    state: 'Tamil Nadu',
    region: 'South',
    category: 'Hills & Mountains',
    tagline: 'Misty blue mountains, heritage toy train, and emerald sprawling tea estates',
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
    startingPrice: 14000,
    recommendedDays: 3,
    bestMonths: 'Oct – May',
    rating: 4.8,
    reviewsCount: 1420,
    highlights: ['Nilgiri Mountain Railway', 'Botanical Gardens', 'Doddabetta Peak', 'Pykara Lake'],
    defaultPrompt: 'Plan a relaxing 3-day trip to Ooty with senior-friendly scenic walks, tea estates, and cozy heritage stays',
    lat: 11.4102,
    lng: 76.6950,
  },
  {
    ...DISCOVERY_DESTINATIONS[0], // Goa
    lat: 15.2993,
    lng: 74.1240,
  },
  {
    ...DISCOVERY_DESTINATIONS[1], // Rajasthan / Jaipur
    lat: 26.9124,
    lng: 75.7873,
  },
  {
    ...DISCOVERY_DESTINATIONS[2], // Kerala / Munnar
    lat: 10.0889,
    lng: 77.0595,
  },
  {
    ...DISCOVERY_DESTINATIONS[3], // Himachal / Manali
    lat: 32.2396,
    lng: 77.1887,
  },
  {
    id: 'dest-kashmir',
    name: 'Kashmir Valley',
    state: 'Jammu & Kashmir',
    region: 'Himalayas',
    category: 'Hills & Mountains',
    tagline: 'Dal lake houseboats, Gulmarg meadows, and snow-draped Himalayan peaks',
    image: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=800&q=80',
    startingPrice: 22000,
    recommendedDays: 5,
    bestMonths: 'Apr – Oct',
    rating: 4.9,
    reviewsCount: 2150,
    highlights: ['Dal Lake Shikara', 'Gulmarg Gondola', 'Pahalgam Betaab Valley', 'Nishat Bagh'],
    defaultPrompt: 'Plan a serene 5-day Kashmir getaway with houseboats and scenic valleys',
    lat: 34.0837,
    lng: 74.7973,
  },
  {
    id: 'dest-varanasi',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    region: 'North',
    category: 'Heritage & Royal',
    tagline: 'Timeless ghats, ancient temples, and ethereal evening Ganga Aarti ceremony',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    startingPrice: 9500,
    recommendedDays: 3,
    bestMonths: 'Oct – Mar',
    rating: 4.7,
    reviewsCount: 1680,
    highlights: ['Dashashwamedh Ghat Aarti', 'Sunrise Boat Ride', 'Sarnath', 'Kashi Vishwanath'],
    defaultPrompt: 'Plan a 3-day cultural immersion in Varanasi with sunrise boat rides and temple walks',
    lat: 25.3176,
    lng: 82.9739,
  },
  {
    id: 'dest-rishikesh',
    name: 'Rishikesh',
    state: 'Uttarakhand',
    region: 'North',
    category: 'Serene & Nature',
    tagline: 'Yoga capital of the world, emerald river rafting, and Himalayan foothills tranquility',
    image: 'https://images.unsplash.com/photo-1600100397608-f010f4438b43?auto=format&fit=crop&w=800&q=80',
    startingPrice: 11000,
    recommendedDays: 3,
    bestMonths: 'Sep – Apr',
    rating: 4.8,
    reviewsCount: 1940,
    highlights: ['River Rafting', 'Beatles Ashram', 'Triveni Ghat Aarti', 'Ram Jhula'],
    defaultPrompt: 'Plan an adventure and wellness weekend in Rishikesh with rafting and riverside cafes',
    lat: 30.0869,
    lng: 78.2676,
  },
  {
    id: 'dest-hampi',
    name: 'Hampi',
    state: 'Karnataka',
    region: 'South',
    category: 'Heritage & Royal',
    tagline: 'Surreal boulder-strewn landscapes, Vijayanagara temples, and sunset chariot vistas',
    image: 'https://images.unsplash.com/photo-1600100397937-cabb79c30b2b?auto=format&fit=crop&w=800&q=80',
    startingPrice: 12500,
    recommendedDays: 3,
    bestMonths: 'Nov – Feb',
    rating: 4.8,
    reviewsCount: 1320,
    highlights: ['Stone Chariot', 'Virupaksha Temple', 'Matanga Hill Sunset', 'Coracle Ride'],
    defaultPrompt: 'Plan a 3-day heritage and bouldering exploration in Hampi',
    lat: 15.3350,
    lng: 76.4600,
  },
  {
    id: 'dest-pondicherry',
    name: 'Pondicherry',
    state: 'Puducherry',
    region: 'South',
    category: 'Coastal & Beach',
    tagline: 'Colonial mustard-yellow villas, beachside boulevards, and tranquil Auroville spiritual hub',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    startingPrice: 13000,
    recommendedDays: 3,
    bestMonths: 'Oct – Mar',
    rating: 4.7,
    reviewsCount: 1580,
    highlights: ['White Town French Quarter', 'Rock Beach Promenade', 'Auroville Matrimandir', 'Paradise Beach'],
    defaultPrompt: 'Plan a cozy 3-day coastal retreat in Pondicherry with French Quarter heritage walks',
    lat: 11.9416,
    lng: 79.8083,
  },
  {
    id: 'dest-kedarnath',
    name: 'Kedarnath Temple',
    state: 'Uttarakhand',
    region: 'Himalayas',
    category: 'Heritage & Royal',
    tagline: 'Ancient shrine dedicated to Lord Shiva, one of the 12 Jyotirlingas nestled among snowy peaks',
    image: 'https://images.unsplash.com/photo-1626014303757-64662d515a45?auto=format&fit=crop&w=800&q=80',
    startingPrice: 16000,
    recommendedDays: 4,
    bestMonths: 'May – Jun, Sep – Oct',
    rating: 4.8,
    reviewsCount: 154200,
    highlights: ['Kedarnath Temple Darshan', 'Bhairavnath Temple', 'Mandakini River', 'Vasuki Tal Trek'],
    defaultPrompt: 'Plan a 4-day spiritual yatra to Kedarnath Temple with helicopter booking and comfortable halts',
    lat: 30.7352,
    lng: 79.0669,
  },
  {
    id: 'dest-meenakshi',
    name: 'Meenakshi Temple (Madurai)',
    state: 'Tamil Nadu',
    region: 'South',
    category: 'Heritage & Royal',
    tagline: 'Historic temple dedicated to Goddess Meenakshi & Lord Sundareswarar with iconic towering gopurams',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
    startingPrice: 11500,
    recommendedDays: 2,
    bestMonths: 'Oct – Mar',
    rating: 4.7,
    reviewsCount: 98500,
    highlights: ['14 Towering Gopurams', 'Hall of Thousand Pillars', 'Golden Lotus Tank', 'Night Bed Chamber Ceremony'],
    defaultPrompt: 'Plan a 2-day heritage temple and cultural trip to Madurai Meenakshi Temple',
    lat: 9.9195,
    lng: 78.1193,
  },
  {
    id: 'dest-tirupati',
    name: 'Tirupati Balaji Temple',
    state: 'Andhra Pradesh',
    region: 'South',
    category: 'Heritage & Royal',
    tagline: 'The world-renowned sacred hill shrine of Lord Venkateswara atop the Seshachalam hills',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    startingPrice: 12000,
    recommendedDays: 2,
    bestMonths: 'Sep – Feb',
    rating: 4.8,
    reviewsCount: 189000,
    highlights: ['Tirumala Venkateswara Darshan', 'Silathoranam Rock', 'Kapila Theertham', 'Sri Padmavathi Ammavari Temple'],
    defaultPrompt: 'Plan a 2-day pilgrimage to Tirupati Balaji with Special Entry Darshan and local heritage spots',
    lat: 13.6833,
    lng: 79.3472,
  },
  {
    id: 'dest-konark',
    name: 'Konark Sun Temple',
    state: 'Odisha',
    region: 'East',
    category: 'Heritage & Royal',
    tagline: '13th-century UNESCO architectural marvel crafted as a monumental 24-wheeled chariot of Surya',
    image: 'https://images.unsplash.com/photo-1600100397937-cabb79c30b2b?auto=format&fit=crop&w=800&q=80',
    startingPrice: 10500,
    recommendedDays: 2,
    bestMonths: 'Nov – Feb',
    rating: 4.6,
    reviewsCount: 65400,
    highlights: ['24 Carved Sun Chariot Wheels', 'Chandrabhaga Beach', 'Konark Dance Festival Grounds', 'Puri Jagannath Corridor'],
    defaultPrompt: 'Plan a 3-day coastal heritage tour covering Konark Sun Temple, Chandrabhaga Beach, and Puri',
    lat: 19.8876,
    lng: 86.0945,
  },
  {
    id: 'dest-somnath',
    name: 'Somnath Temple',
    state: 'Gujarat',
    region: 'West',
    category: 'Heritage & Royal',
    tagline: 'First among the twelve holy Jyotirlingas, perched grandly on the windswept coast of Saurashtra',
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
    startingPrice: 12000,
    recommendedDays: 2,
    bestMonths: 'Oct – Mar',
    rating: 4.7,
    reviewsCount: 78900,
    highlights: ['Somnath Jyotirlinga Darshan', 'Sound & Light Show', 'Triveni Sangam', 'Prabhas Patan Museum'],
    defaultPrompt: 'Plan a 2-day Saurashtra coastal pilgrimage to Somnath Temple and Dwarka',
    lat: 20.8880,
    lng: 70.4012,
  }
];

/** Build a free OpenStreetMap iframe embed URL centred on given coordinates */
function buildOsmEmbedUrl(lat: number, lng: number, zoom = 11): string {
  const delta = 0.5 / Math.pow(2, zoom - 10);
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

/** Google Maps search URL — opens in browser / Google Maps app */
function buildGoogleMapsUrl(name: string, state: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ', ' + state + ', India')}`;
}

export const DestinationMapExplorer: React.FC<DestinationMapExplorerProps> = ({
  onPlanDestination
}) => {
  const [selectedRegion, setSelectedRegion] = useState<'All' | 'North' | 'South' | 'West' | 'East' | 'Himalayas'>('All');
  const [selectedPin, setSelectedPin] = useState<DestinationPin | null>(INDIA_DESTINATIONS[0]);

  const filteredDestinations = useMemo(() => {
    if (selectedRegion === 'All') return INDIA_DESTINATIONS;
    return INDIA_DESTINATIONS.filter((d) => d.region === selectedRegion);
  }, [selectedRegion]);

  const activePin = selectedPin ?? filteredDestinations[0];
  const osmEmbedUrl = buildOsmEmbedUrl(activePin.lat, activePin.lng);
  const gmapsUrl = buildGoogleMapsUrl(activePin.name, activePin.state);

  return (
    <section id="google-maps-explorer" className="py-16 sm:py-24 bg-[#F5F7F6] border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 text-left">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-800 tracking-wider uppercase mb-1.5">
              <Compass className="w-4 h-4 text-teal-700" />
              <span>Destination Explorer</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
              Explore Destinations across India
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-2xl">
              Pick any destination to preview it on the map. Click <strong>Open in Google Maps</strong> to view live satellite imagery, directions, and Street View.
            </p>
          </div>

          {/* Region Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200/90 shadow-xs self-start md:self-auto overflow-x-auto max-w-full">
            {(['All', 'North', 'South', 'West', 'East', 'Himalayas'] as const).map((region) => (
              <button
                key={region}
                onClick={() => {
                  setSelectedRegion(region);
                  setSelectedPin(null);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedRegion === region
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                {region === 'All' ? 'All Destinations' : `${region} India`}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: 2-column layout */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">

            {/* LEFT PANEL — Destination list */}
            <div className="border-r border-stone-200 flex flex-col max-h-[620px]">
              <div className="p-3 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-stone-700">
                  {filteredDestinations.length} Curated Destinations
                </span>
              </div>
              <div className="overflow-y-auto flex-1 divide-y divide-stone-100">
                {filteredDestinations.map((dest) => {
                  const isActive = activePin.id === dest.id;
                  return (
                    <button
                      key={dest.id}
                      onClick={() => setSelectedPin(dest)}
                      className={`w-full text-left p-3 flex items-start gap-3 transition-colors cursor-pointer group ${
                        isActive ? 'bg-teal-50' : 'hover:bg-stone-50'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <span className={`text-xs font-bold leading-tight ${isActive ? 'text-teal-900' : 'text-stone-900'}`}>
                            {dest.name}
                          </span>
                          {isActive && (
                            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500 mt-1" />
                          )}
                        </div>
                        <span className="text-[10px] text-stone-500 flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />{dest.state}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600">
                            <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-500" />
                            {dest.rating}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            ₹{dest.startingPrice.toLocaleString()}+
                          </span>
                          <span className="text-[10px] text-stone-400">{dest.recommendedDays}d</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT PANEL — Map + Detail */}
            <div className="flex flex-col">
              {/* OpenStreetMap iframe — free, no API key */}
              <div className="relative h-[340px] sm:h-[400px] bg-stone-100">
                <iframe
                  key={activePin.id}
                  title={`Map of ${activePin.name}`}
                  src={osmEmbedUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                {/* "Open in Google Maps" overlay button */}
                <a
                  href={gmapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md text-xs font-bold text-stone-800 border border-stone-200 shadow-md hover:bg-teal-50 hover:text-teal-900 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-700" />
                  Open in Google Maps
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
                {/* OSM attribution */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur text-[9px] text-stone-400 px-2 py-0.5 text-right">
                  © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a> contributors
                </div>
              </div>

              {/* Destination detail card */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 leading-snug">{activePin.name}</h3>
                    <p className="text-xs text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{activePin.state} · {activePin.category}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-teal-800">₹{activePin.startingPrice.toLocaleString()}</div>
                    <div className="text-[10px] text-stone-400">starting price</div>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">{activePin.tagline}</p>

                <div className="flex items-center gap-3 text-[10px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 stroke-amber-500" />
                    <strong className="text-stone-700">{activePin.rating}</strong>
                    <span>({activePin.reviewsCount.toLocaleString()} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-teal-600" />
                    {activePin.bestMonths}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-teal-600" />
                    {activePin.recommendedDays} days
                  </span>
                </div>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5">
                  {activePin.highlights.map((h) => (
                    <span key={h} className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-[10px] font-semibold text-teal-800">
                      {h}
                    </span>
                  ))}
                </div>

                {/* Action row */}
                <div className="flex items-center gap-2 mt-auto pt-1">
                  <a
                    href={buildGoogleMapsUrl(activePin.name, activePin.state)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-teal-700" />
                    Google Maps
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </a>
                  <button
                    onClick={() => onPlanDestination(activePin)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                    Plan with AI
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
