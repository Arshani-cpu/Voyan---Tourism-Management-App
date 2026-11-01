import React, { useState, useMemo, useCallback } from 'react';
import {
  MapPin,
  Utensils,
  Navigation,
  Compass,
  X,
  Hotel,
  Shield,
  Fuel,
  Phone,
  Layers,
  Car,
  Crosshair,
  ExternalLink,
} from 'lucide-react';
import { Activity, RestaurantRecommendation, NearbyAmenity } from '../../types/travel';
import { getNearbyEssentialsForDestination } from '../../data/nearbyEssentials';
import { getDestinationCenter } from '../../utils/geoUtils';

interface InteractiveMapProps {
  activities: Activity[];
  restaurants: RestaurantRecommendation[];
  selectedActivityId: string | null;
  onSelectActivity: (id: string) => void;
  destinationName: string;
}

type LayerType = 'all' | 'activities' | 'hotels' | 'dining' | 'police' | 'fuel';

/** Build a free OpenStreetMap embed URL centred on lat/lng at a given zoom */
function osmEmbed(lat: number, lng: number, zoom = 13): string {
  const delta = 0.3 / Math.pow(2, zoom - 11);
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

/** Google Maps "Get Directions" deep-link */
function gmapsDirections(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/** Google Maps search deep-link by name */
function gmapsSearch(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  activities,
  restaurants,
  selectedActivityId,
  onSelectActivity,
  destinationName,
}) => {
  const [activeLayer, setActiveLayer] = useState<LayerType>('all');
  const [mapStyle, setMapStyle] = useState<'standard' | 'cycle' | 'transport'>('standard');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const locationWatchRef = React.useRef<number | null>(null);

  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    title: string;
    type: string;
    description: string;
    cost?: number;
    location: string;
    contact?: string;
    lat: number;
    lng: number;
  } | null>(null);

  const destinationCenter = useMemo(() => getDestinationCenter(destinationName), [destinationName]);
  const nearbyAmenities = useMemo(() => getNearbyEssentialsForDestination(destinationName), [destinationName]);

  // Determine map focus: selected item > user location > destination center
  const mapFocus = useMemo(() => {
    if (selectedItem) return { lat: selectedItem.lat, lng: selectedItem.lng };
    if (isTrackingLocation && userLocation) return userLocation;
    return destinationCenter;
  }, [selectedItem, isTrackingLocation, userLocation, destinationCenter]);

  // OSM tile layers (all free)
  const tileStyles: Record<string, string> = {
    standard: 'mapnik',
    cycle: 'cycle',
    transport: 'hot',
  };

  const currentOsmUrl = osmEmbed(mapFocus.lat, mapFocus.lng);

  // Filter amenities by active layer
  const visibleAmenities = useMemo(() => {
    if (activeLayer === 'hotels') return nearbyAmenities.filter((a) => a.type === 'hotel');
    if (activeLayer === 'dining') return nearbyAmenities.filter((a) => a.type === 'restaurant');
    if (activeLayer === 'police') return nearbyAmenities.filter((a) => a.type === 'police');
    if (activeLayer === 'fuel') return nearbyAmenities.filter((a) => a.type === 'fuel');
    return nearbyAmenities;
  }, [nearbyAmenities, activeLayer]);

  const visibleActivities = useMemo(() => {
    if (activeLayer === 'activities' || activeLayer === 'all') return activities;
    return [];
  }, [activities, activeLayer]);

  // Live location tracking
  React.useEffect(() => () => {
    if (locationWatchRef.current !== null) {
      navigator.geolocation?.clearWatch(locationWatchRef.current);
    }
  }, []);

  const handleLocateMe = useCallback(() => {
    if (locationWatchRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
      setIsTrackingLocation(false);
      setLocationError(null);
      return;
    }
    if (!window.isSecureContext) {
      setLocationError('Live location requires HTTPS.');
      return;
    }
    if (!navigator.geolocation) {
      setLocationError('Live location is not supported by this browser.');
      return;
    }
    setLocationError(null);
    locationWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsTrackingLocation(true);
        setLocationError(null);
      },
      (err) => {
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was denied. Allow location access in browser settings.'
            : 'Unable to get your location. Check device GPS and try again.'
        );
        if (locationWatchRef.current !== null) {
          navigator.geolocation?.clearWatch(locationWatchRef.current);
          locationWatchRef.current = null;
        }
        setIsTrackingLocation(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
    setIsTrackingLocation(true);
  }, []);

  // Sync external selection → select item from activities list
  React.useEffect(() => {
    if (selectedActivityId) {
      const found = activities.find((a) => a.id === selectedActivityId);
      if (found) {
        const center = getDestinationCenter(destinationName);
        setSelectedItem({
          id: found.id,
          title: found.title,
          type: 'activity',
          description: found.description,
          cost: found.costEstimate,
          location: found.locationName,
          lat: center.lat,
          lng: center.lng,
        });
      }
    }
  }, [selectedActivityId, activities, destinationName]);

  const layerBtns: { id: LayerType; label: string; icon?: React.ReactNode; color: string }[] = [
    { id: 'all', label: `All Pins`, color: 'teal' },
    { id: 'activities', label: `Day Route (${activities.length})`, color: 'teal' },
    { id: 'hotels', label: 'Hotels', icon: <Hotel className="w-2.5 h-2.5" />, color: 'teal' },
    { id: 'dining', label: 'Dining', icon: <Utensils className="w-2.5 h-2.5" />, color: 'teal' },
    { id: 'police', label: 'Police', icon: <Shield className="w-2.5 h-2.5" />, color: 'rose' },
    { id: 'fuel', label: 'Petrol Bunk', icon: <Fuel className="w-2.5 h-2.5" />, color: 'emerald' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden flex flex-col h-[600px] lg:h-[calc(100vh-140px)] sticky top-24 text-left">

      {/* Toolbar */}
      <div className="p-2.5 sm:p-3 bg-stone-50 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-teal-800 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-stone-900 truncate max-w-[140px]">
                {destinationName}
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-100 text-teal-800">
                Live Map
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Map style cycle */}
          <button
            onClick={() =>
              setMapStyle((prev) =>
                prev === 'standard' ? 'cycle' : prev === 'cycle' ? 'transport' : 'standard'
              )
            }
            title="Toggle Map Style"
            className="px-2 py-1 text-[10px] font-bold rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Layers className="w-3 h-3 text-teal-700" />
            <span className="capitalize">{mapStyle}</span>
          </button>

          {/* Locate Me */}
          <button
            onClick={handleLocateMe}
            title={isTrackingLocation ? 'Stop live location' : 'My location'}
            aria-label={isTrackingLocation ? 'Stop live location tracking' : 'Start live location tracking'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isTrackingLocation
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-teal-50 hover:text-teal-800'
            }`}
          >
            <Crosshair className="w-3 h-3" />
          </button>
        </div>

        {/* Layer filter badges */}
        <div className="w-full flex items-center gap-1 bg-white p-0.5 rounded-lg border border-stone-200 overflow-x-auto">
          {layerBtns.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveLayer(btn.id)}
              className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-0.5 cursor-pointer ${
                activeLayer === btn.id
                  ? btn.color === 'rose'
                    ? 'bg-rose-800 text-white'
                    : btn.color === 'emerald'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-teal-800 text-white'
                  : btn.color === 'rose'
                  ? 'text-rose-700 hover:text-rose-900'
                  : btn.color === 'emerald'
                  ? 'text-emerald-700 hover:text-emerald-900'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {btn.icon}
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map + sidebar */}
      <div className="flex flex-1 overflow-hidden">

        {/* OpenStreetMap iframe */}
        <div className="relative flex-1">
          <iframe
            key={`${mapFocus.lat}-${mapFocus.lng}`}
            title={`Map – ${destinationName}`}
            src={currentOsmUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          {/* Open in Google Maps overlay */}
          <a
            href={gmapsSearch(destinationName + ', India')}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/95 backdrop-blur-md text-[10px] font-bold text-stone-800 border border-stone-200 shadow-md hover:bg-teal-50 hover:text-teal-900 transition-colors z-10"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-700" />
            Open in Google Maps
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>

          {/* Live-location badge */}
          {isTrackingLocation && (
            <div className="absolute bottom-3 right-3 bg-blue-600/95 text-white rounded-lg px-2.5 py-1.5 shadow-xs flex items-center gap-2 text-[10px] font-bold z-10">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Live location on
            </div>
          )}
          {locationError && (
            <div role="status" className="absolute bottom-3 right-3 max-w-[min(24rem,85%)] bg-white text-rose-800 rounded-lg px-3 py-2 border border-rose-200 shadow-xs text-[11px] z-10">
              {locationError}
            </div>
          )}

          {/* OSM attribution */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/70 backdrop-blur text-[9px] text-stone-400 px-2 py-0.5 pointer-events-none">
            © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline pointer-events-auto">OpenStreetMap</a> contributors
          </div>
        </div>

        {/* Right sidebar — list of visible pins with Google Maps links */}
        <div className="hidden sm:flex flex-col w-56 border-l border-stone-200 overflow-y-auto bg-stone-50">
          <div className="p-2 text-[10px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200">
            {activeLayer === 'all' ? 'All Pins' : layerBtns.find((b) => b.id === activeLayer)?.label}
          </div>

          {/* Activity pins */}
          {(activeLayer === 'all' || activeLayer === 'activities') &&
            visibleActivities.map((act, idx) => (
              <button
                key={act.id}
                onClick={() => {
                  onSelectActivity(act.id);
                  const c = getDestinationCenter(destinationName);
                  setSelectedItem({
                    id: act.id,
                    title: act.title,
                    type: 'Activity',
                    description: act.description,
                    cost: act.costEstimate,
                    location: act.locationName,
                    lat: c.lat,
                    lng: c.lng,
                  });
                }}
                className={`w-full text-left px-2.5 py-2 border-b border-stone-100 flex items-start gap-2 hover:bg-teal-50 transition-colors cursor-pointer ${
                  selectedItem?.id === act.id ? 'bg-teal-50' : ''
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-teal-800 text-white text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-stone-900 leading-tight truncate">{act.title}</div>
                  <div className="text-[9px] text-stone-500 truncate">{act.locationName}</div>
                  <a
                    href={gmapsSearch(act.locationName + ', ' + destinationName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[9px] text-teal-700 hover:underline flex items-center gap-0.5 mt-0.5"
                  >
                    <Navigation className="w-2.5 h-2.5" />Maps
                  </a>
                </div>
              </button>
            ))}

          {/* Amenity pins */}
          {visibleAmenities.map((amenity) => {
            const isHidden = activeLayer === 'activities';
            if (isHidden) return null;
            const emoji =
              amenity.type === 'hotel' ? '🏨' :
              amenity.type === 'restaurant' ? '🍽️' :
              amenity.type === 'police' ? '👮' : '⛽';
            return (
              <button
                key={amenity.id}
                onClick={() => {
                  const c = getDestinationCenter(destinationName);
                  setSelectedItem({
                    id: amenity.id,
                    title: amenity.name,
                    type: amenity.type,
                    description: amenity.description || '',
                    location: amenity.address,
                    contact: amenity.contactNumber,
                    lat: c.lat,
                    lng: c.lng,
                  });
                }}
                className={`w-full text-left px-2.5 py-2 border-b border-stone-100 flex items-start gap-2 hover:bg-stone-100 transition-colors cursor-pointer ${
                  selectedItem?.id === amenity.id ? 'bg-stone-100' : ''
                }`}
              >
                <span className="text-sm shrink-0">{emoji}</span>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-stone-900 leading-tight truncate">{amenity.name}</div>
                  <div className="text-[9px] text-stone-500 truncate">{amenity.address}</div>
                  <a
                    href={gmapsSearch(amenity.name + ', ' + destinationName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[9px] text-teal-700 hover:underline flex items-center gap-0.5 mt-0.5"
                  >
                    <Navigation className="w-2.5 h-2.5" />Maps
                  </a>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail panel — shown when a pin is selected */}
      {selectedItem && (
        <div className="border-t border-stone-200 bg-white p-3 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mb-0.5">
              <span className="font-semibold uppercase tracking-wider text-teal-800">{selectedItem.type}</span>
              {selectedItem.cost && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-bold text-teal-900">₹{selectedItem.cost.toLocaleString()}</span>
                </>
              )}
            </div>
            <h4 className="text-xs font-bold text-stone-900 leading-snug mb-0.5">{selectedItem.title}</h4>
            <p className="text-[10px] text-stone-500 flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-teal-700 shrink-0" />
              {selectedItem.location}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {selectedItem.contact && (
              <a
                href={`tel:${selectedItem.contact.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] font-bold"
              >
                <Phone className="w-3 h-3" />
                Call
              </a>
            )}
            <a
              href={gmapsDirections(selectedItem.lat, selectedItem.lng)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-800 hover:bg-teal-900 text-white text-[10px] font-bold shadow-xs"
            >
              <Navigation className="w-3 h-3" />
              Directions
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <button
              onClick={() => setSelectedItem(null)}
              className="p-1 rounded text-stone-400 hover:text-stone-700 cursor-pointer"
              aria-label="Close detail"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
