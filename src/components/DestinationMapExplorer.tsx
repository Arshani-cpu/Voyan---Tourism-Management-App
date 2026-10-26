/// <reference types="google.maps" />
import React, { useState, useEffect, useMemo } from 'react';
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin,
  useMap
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Compass,
  Car,
  Layers,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Maximize2
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

// Map camera controller to smoothly pan/zoom
function CameraPanHelper({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    map.setZoom(zoom);
  }, [map, center, zoom]);
  return null;
}

// Google Maps Traffic Layer Controller
function TrafficLayerToggle({ enabled }: { enabled: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const traffic = new google.maps.TrafficLayer();
    if (enabled) {
      traffic.setMap(map);
    }
    return () => {
      traffic.setMap(null);
    };
  }, [map, enabled]);
  return null;
}

export const DestinationMapExplorer: React.FC<DestinationMapExplorerProps> = ({
  onPlanDestination
}) => {
  const [selectedRegion, setSelectedRegion] = useState<'All' | 'North' | 'South' | 'West'>('All');
  const [selectedPin, setSelectedPin] = useState<DestinationPin | null>(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

  const filteredDestinations = useMemo(() => {
    if (selectedRegion === 'All') return INDIA_DESTINATIONS;
    return INDIA_DESTINATIONS.filter((d) => d.region === selectedRegion);
  }, [selectedRegion]);

  const defaultCenter = useMemo(() => ({ lat: 21.7679, lng: 78.8718 }), []);

  return (
    <section id="google-maps-explorer" className="py-16 sm:py-24 bg-[#F5F7F6] border-t border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 text-left">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-800 tracking-wider uppercase mb-1.5">
              <Compass className="w-4 h-4 text-teal-700" />
              <span>Interactive Google Maps Platform</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
              Explore Destinations across India
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-2xl">
              Tap any pin on the live Google Map to preview travel estimates, highlights, and jump straight into an AI-tailored itinerary.
            </p>
          </div>

          {/* Region Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200/90 shadow-xs self-start md:self-auto overflow-x-auto max-w-full">
            {(['All', 'North', 'South', 'West'] as const).map((region) => (
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

        {/* Map Container */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-md overflow-hidden relative">
          {/* Map Toolbar Overlay */}
          <div className="p-3 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 flex flex-wrap items-center justify-between gap-2.5 z-10 relative">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-stone-900">
                Live Google Maps · {filteredDestinations.length} Curated Destinations
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Traffic toggle */}
              <button
                onClick={() => setShowTraffic(!showTraffic)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                  showTraffic
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
                title="Toggle real-time Google traffic layer"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Live Traffic</span>
              </button>

              {/* Map Type Switcher */}
              <button
                onClick={() =>
                  setMapTypeId((prev) =>
                    prev === 'roadmap' ? 'satellite' : prev === 'satellite' ? 'terrain' : 'roadmap'
                  )
                }
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Switch map view"
              >
                <Layers className="w-3.5 h-3.5 text-teal-700" />
                <span className="capitalize">{mapTypeId}</span>
              </button>
            </div>
          </div>

          {/* Interactive Map Canvas */}
          <div className="h-[520px] sm:h-[600px] w-full relative">
              <Map
                mapId="DEMO_MAP_ID"
                defaultCenter={defaultCenter}
                defaultZoom={5}
                mapTypeId={mapTypeId}
                gestureHandling="cooperative"
                disableDefaultUI={false}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
              >
                <TrafficLayerToggle enabled={showTraffic} />

                {/* Render pins for all destinations */}
                {filteredDestinations.map((dest) => {
                  const isSelected = selectedPin?.id === dest.id;
                  return (
                    <AdvancedMarker
                      key={dest.id}
                      position={{ lat: dest.lat, lng: dest.lng }}
                      title={dest.name}
                      onClick={() => setSelectedPin(dest)}
                    >
                      <Pin
                        background={isSelected ? '#0F766E' : '#115E59'}
                        borderColor="#FFFFFF"
                        glyphColor="#FFFFFF"
                        scale={isSelected ? 1.3 : 1.05}
                      >
                        <span className="text-[10px] font-black text-white">📍</span>
                      </Pin>
                    </AdvancedMarker>
                  );
                })}

                {/* InfoWindow for Selected Destination */}
                {selectedPin && (
                  <InfoWindow
                    position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
                    onCloseClick={() => setSelectedPin(null)}
                    maxWidth={320}
                  >
                    <div className="p-1 text-stone-900 text-left font-['Plus_Jakarta_Sans',sans-serif]">
                      <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden mb-2 bg-stone-100">
                        <img
                          src={selectedPin.image}
                          alt={selectedPin.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-stone-900/80 text-white text-[9px] font-bold">
                          {selectedPin.state}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-sm font-bold text-stone-900 leading-snug">
                          {selectedPin.name}
                        </h4>
                        <span className="text-xs font-black text-teal-800">
                          ₹{selectedPin.startingPrice.toLocaleString()}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed mb-2">
                        {selectedPin.tagline}
                      </p>

                      <div className="text-[10px] text-stone-500 mb-2 flex items-center justify-between">
                        <span>Best: {selectedPin.bestMonths}</span>
                        <span>{selectedPin.recommendedDays} Days Suggested</span>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPin.name + ' ' + selectedPin.state)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-stone-600 hover:text-stone-900"
                        >
                          <span>Google Maps</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>

                        <button
                          onClick={() => onPlanDestination(selectedPin)}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-teal-300" />
                          <span>Plan Trip</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </Map>

            {/* Quick Destination Pill selector at bottom of map */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-2 overflow-x-auto pb-1 pointer-events-none">
              <div className="flex gap-2 pointer-events-auto mx-auto max-w-full">
                {filteredDestinations.slice(0, 5).map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => setSelectedPin(dest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedPin?.id === dest.id
                        ? 'bg-teal-900 text-white ring-2 ring-teal-400'
                        : 'bg-white/95 text-stone-800 hover:bg-white'
                    }`}
                  >
                    <MapPin className="w-3 h-3 text-teal-600" />
                    <span>{dest.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
