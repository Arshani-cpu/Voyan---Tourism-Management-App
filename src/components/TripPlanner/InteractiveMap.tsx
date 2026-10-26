/// <reference types="google.maps" />
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  Pin
} from '@vis.gl/react-google-maps';
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
  Info
} from 'lucide-react';
import { Activity, RestaurantRecommendation, NearbyAmenity } from '../../types/travel';
import { getNearbyEssentialsForDestination } from '../../data/nearbyEssentials';
import { getDestinationCenter, resolveLocationCoordinates, LatLng } from '../../utils/geoUtils';

interface InteractiveMapProps {
  activities: Activity[];
  restaurants: RestaurantRecommendation[];
  selectedActivityId: string | null;
  onSelectActivity: (id: string) => void;
  destinationName: string;
}

// Child component to control Google Maps Traffic Layer
function TrafficLayerOverlay({ enabled }: { enabled: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;
    try {
      const trafficLayer = new google.maps.TrafficLayer();
      if (enabled) {
        trafficLayer.setMap(map);
      }
      return () => {
        trafficLayer.setMap(null);
      };
    } catch (e) {
      console.warn('TrafficLayer error:', e);
    }
  }, [map, enabled]);
  return null;
}

// Child component to draw smooth itinerary route polyline
function ItineraryPolyline({ coordinates }: { coordinates: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (!map || coordinates.length < 2 || typeof google === 'undefined' || !google.maps) return;
    try {
      const polyline = new google.maps.Polyline({
        path: coordinates,
        geodesic: true,
        strokeColor: '#0F766E', // teal-700
        strokeOpacity: 0.9,
        strokeWeight: 4,
      });
      polyline.setMap(map);
      return () => {
        polyline.setMap(null);
      };
    } catch (e) {
      console.warn('Polyline error:', e);
    }
  }, [map, coordinates]);
  return null;
}

// Child component to pan camera when destination changes
function MapCameraController({ center }: { center: LatLng }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.panTo(center);
  }, [map, center.lat, center.lng]);
  return null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  activities,
  restaurants,
  selectedActivityId,
  onSelectActivity,
  destinationName,
}) => {
  const [activeLayer, setActiveLayer] = useState<'all' | 'activities' | 'hotels' | 'dining' | 'police' | 'fuel'>('all');
  const [showTraffic, setShowTraffic] = useState(false);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const locationWatchRef = React.useRef<number | null>(null);

  // Active selected item for InfoWindow
  const [selectedPlace, setSelectedPlace] = useState<{
    id: string;
    title: string;
    type: 'activity' | 'restaurant' | 'hotel' | 'police' | 'fuel';
    description: string;
    cost?: number;
    location: string;
    contact?: string;
    position: LatLng;
  } | null>(null);

  const destinationCenter = useMemo(() => getDestinationCenter(destinationName), [destinationName]);
  const nearbyAmenities = useMemo(() => getNearbyEssentialsForDestination(destinationName), [destinationName]);

  // Pre-calculate real-world coordinates for all activities
  const activityMarkers = useMemo(() => {
    return activities.map((act, index) => {
      const position = resolveLocationCoordinates(act.locationName || act.title, destinationName, act.coordinates);
      return {
        ...act,
        order: index + 1,
        position,
      };
    });
  }, [activities, destinationName]);

  // Pre-calculate real-world coordinates for amenities
  const amenityMarkers = useMemo(() => {
    return nearbyAmenities.map((amenity) => {
      const position = resolveLocationCoordinates(amenity.name, destinationName, amenity.coordinates);
      return {
        ...amenity,
        position,
      };
    });
  }, [nearbyAmenities, destinationName]);

  // Sequence of points for route line
  const routePoints = useMemo(() => activityMarkers.map((a) => a.position), [activityMarkers]);

  useEffect(() => () => {
    if (locationWatchRef.current !== null) {
      navigator.geolocation?.clearWatch(locationWatchRef.current);
    }
  }, []);

  // Keep the user's map marker current while location tracking is enabled.
  const handleLocateMe = useCallback(() => {
    if (locationWatchRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
      setIsTrackingLocation(false);
      setLocationError(null);
      return;
    }

    if (!window.isSecureContext) {
      setLocationError('Live location requires HTTPS. Open Voyan using a secure HTTPS address.');
      return;
    }
    if (!navigator.geolocation) {
      setLocationError('Live location is not supported by this browser.');
      return;
    }

    setLocationError(null);
    locationWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsTrackingLocation(true);
        setLocationError(null);
      },
      (error) => {
        console.warn('Live location access failed:', error);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? 'Location permission was denied. Allow location access in your browser settings.'
            : 'Unable to get your location. Check your device GPS and try again.'
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

  // Sync external selection
  useEffect(() => {
    if (selectedActivityId) {
      const found = activityMarkers.find((a) => a.id === selectedActivityId);
      if (found) {
        setSelectedPlace({
          id: found.id,
          title: found.title,
          type: 'activity',
          description: found.description,
          cost: found.costEstimate,
          location: found.locationName,
          position: found.position,
        });
      }
    }
  }, [selectedActivityId, activityMarkers]);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden flex flex-col h-[600px] lg:h-[calc(100vh-140px)] sticky top-24 text-left">
      {/* Map Header Toolbar with Real-Time Toggles */}
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
                Google Maps
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Toggles (Traffic, Satellite, Locate) */}
        <div className="flex items-center gap-1.5">
          {/* Traffic Toggle */}
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            title="Toggle Live Google Traffic"
            className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
              showTraffic
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Car className="w-3 h-3" />
            <span>Traffic</span>
            {showTraffic && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
          </button>

          {/* Map Type Switcher */}
          <button
            onClick={() =>
              setMapTypeId((prev) =>
                prev === 'roadmap' ? 'satellite' : prev === 'satellite' ? 'terrain' : 'roadmap'
              )
            }
            title="Toggle Map Style (Road / Satellite / Terrain)"
            className="px-2 py-1 text-[10px] font-bold rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Layers className="w-3 h-3 text-teal-700" />
            <span className="capitalize">{mapTypeId}</span>
          </button>

          {/* Locate Me */}
          <button
            onClick={handleLocateMe}
            title={isTrackingLocation ? 'Stop live location tracking' : 'Share live location with this map'}
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

        {/* Category Filter Badges */}
        <div className="w-full flex items-center gap-1 bg-white p-0.5 rounded-lg border border-stone-200 overflow-x-auto">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeLayer === 'all'
                ? 'bg-teal-800 text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Pins
          </button>
          <button
            onClick={() => setActiveLayer('activities')}
            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeLayer === 'activities'
                ? 'bg-teal-800 text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Day Route ({activities.length})
          </button>
          <button
            onClick={() => setActiveLayer('hotels')}
            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-0.5 cursor-pointer ${
              activeLayer === 'hotels'
                ? 'bg-teal-800 text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Hotel className="w-2.5 h-2.5" />
            <span>Hotels</span>
          </button>
          <button
            onClick={() => setActiveLayer('dining')}
            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-0.5 cursor-pointer ${
              activeLayer === 'dining'
                ? 'bg-teal-800 text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Utensils className="w-2.5 h-2.5" />
            <span>Dining</span>
          </button>
          <button
            onClick={() => setActiveLayer('police')}
            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-0.5 cursor-pointer ${
              activeLayer === 'police'
                ? 'bg-rose-800 text-white'
                : 'text-rose-700 hover:text-rose-900'
            }`}
          >
            <Shield className="w-2.5 h-2.5" />
            <span>Police</span>
          </button>
          <button
            onClick={() => setActiveLayer('fuel')}
            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-0.5 cursor-pointer ${
              activeLayer === 'fuel'
                ? 'bg-emerald-800 text-white'
                : 'text-emerald-700 hover:text-emerald-900'
            }`}
          >
            <Fuel className="w-2.5 h-2.5" />
            <span>Petrol Bunk</span>
          </button>
        </div>
      </div>

      {/* Main Google Map Canvas */}
      <div className="relative flex-1 w-full h-full min-h-[400px] overflow-hidden bg-stone-100">
        <Map
            mapId="DEMO_MAP_ID"
            defaultCenter={destinationCenter}
            defaultZoom={13}
            mapTypeId={mapTypeId}
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Camera updater */}
            <MapCameraController center={isTrackingLocation && userLocation ? userLocation : destinationCenter} />

            {/* Live Traffic Overlay */}
            <TrafficLayerOverlay enabled={showTraffic} />

            {/* Polyline Route */}
            {(activeLayer === 'all' || activeLayer === 'activities') && (
              <ItineraryPolyline coordinates={routePoints} />
            )}

            {/* 1. Activities Advanced Markers */}
            {(activeLayer === 'all' || activeLayer === 'activities') &&
              activityMarkers.map((act) => {
                const isSelected = selectedActivityId === act.id;
                return (
                  <AdvancedMarker
                    key={act.id}
                    position={act.position}
                    title={act.title}
                    onClick={() => {
                      onSelectActivity(act.id);
                      setSelectedPlace({
                        id: act.id,
                        title: act.title,
                        type: 'activity',
                        description: act.description,
                        cost: act.costEstimate,
                        location: act.locationName,
                        position: act.position,
                      });
                    }}
                  >
                    <Pin
                      background={isSelected ? '#0F766E' : '#115E59'}
                      borderColor="#FFFFFF"
                      glyphColor="#FFFFFF"
                      scale={isSelected ? 1.25 : 1.0}
                    >
                      <span className="text-[11px] font-extrabold text-white">
                        {act.order}
                      </span>
                    </Pin>
                  </AdvancedMarker>
                );
              })}

            {/* 2. Hotel Pins */}
            {(activeLayer === 'all' || activeLayer === 'hotels') &&
              amenityMarkers
                .filter((a) => a.type === 'hotel')
                .map((hotel) => (
                  <AdvancedMarker
                    key={hotel.id}
                    position={hotel.position}
                    title={hotel.name}
                    onClick={() => {
                      setSelectedPlace({
                        id: hotel.id,
                        title: hotel.name,
                        type: 'hotel',
                        description: hotel.description || hotel.tags.join(' · '),
                        cost: hotel.pricePerNight,
                        location: hotel.address,
                        contact: hotel.contactNumber,
                        position: hotel.position,
                      });
                    }}
                  >
                    <Pin
                      background="#0284C7"
                      borderColor="#FFFFFF"
                      glyphColor="#FFFFFF"
                      scale={0.9}
                    >
                      🏨
                    </Pin>
                  </AdvancedMarker>
                ))}

            {/* 3. Dining Pins */}
            {(activeLayer === 'all' || activeLayer === 'dining') &&
              amenityMarkers
                .filter((a) => a.type === 'restaurant')
                .map((rest) => (
                  <AdvancedMarker
                    key={rest.id}
                    position={rest.position}
                    title={rest.name}
                    onClick={() => {
                      setSelectedPlace({
                        id: rest.id,
                        title: rest.name,
                        type: 'restaurant',
                        description: rest.description || rest.tags.join(' · '),
                        cost: rest.avgCostForTwo,
                        location: rest.address,
                        contact: rest.contactNumber,
                        position: rest.position,
                      });
                    }}
                  >
                    <Pin
                      background="#D97706"
                      borderColor="#FFFFFF"
                      glyphColor="#FFFFFF"
                      scale={0.9}
                    >
                      🍽️
                    </Pin>
                  </AdvancedMarker>
                ))}

            {/* 4. Police Station Pins */}
            {(activeLayer === 'all' || activeLayer === 'police') &&
              amenityMarkers
                .filter((a) => a.type === 'police')
                .map((police) => (
                  <AdvancedMarker
                    key={police.id}
                    position={police.position}
                    title={police.name}
                    onClick={() => {
                      setSelectedPlace({
                        id: police.id,
                        title: police.name,
                        type: 'police',
                        description: police.description || 'Emergency police station & helpline',
                        location: police.address,
                        contact: police.contactNumber,
                        position: police.position,
                      });
                    }}
                  >
                    <Pin
                      background="#BE123C"
                      borderColor="#FFFFFF"
                      glyphColor="#FFFFFF"
                      scale={1.1}
                    >
                      👮
                    </Pin>
                  </AdvancedMarker>
                ))}

            {/* 5. Petrol Bunk Pins */}
            {(activeLayer === 'all' || activeLayer === 'fuel') &&
              amenityMarkers
                .filter((a) => a.type === 'fuel')
                .map((fuel) => (
                  <AdvancedMarker
                    key={fuel.id}
                    position={fuel.position}
                    title={fuel.name}
                    onClick={() => {
                      setSelectedPlace({
                        id: fuel.id,
                        title: fuel.name,
                        type: 'fuel',
                        description: fuel.description || fuel.tags.join(' · '),
                        location: fuel.address,
                        contact: fuel.contactNumber,
                        position: fuel.position,
                      });
                    }}
                  >
                    <Pin
                      background="#059669"
                      borderColor="#FFFFFF"
                      glyphColor="#FFFFFF"
                      scale={0.9}
                    >
                      ⛽
                    </Pin>
                  </AdvancedMarker>
                ))}

            {/* User GPS Location Marker */}
            {userLocation && (
              <AdvancedMarker position={userLocation} title="Your Location">
                <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-lg ring-4 ring-blue-400/30 animate-pulse" />
              </AdvancedMarker>
            )}

            {/* Interactive InfoWindow */}
            {selectedPlace && (
              <InfoWindow
                position={selectedPlace.position}
                onCloseClick={() => setSelectedPlace(null)}
                maxWidth={300}
              >
                <div className="p-1 text-stone-900 text-left font-['Plus_Jakarta_Sans',sans-serif]">
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mb-1">
                    <span className="font-semibold uppercase tracking-wider text-teal-800">
                      {selectedPlace.type}
                    </span>
                    {selectedPlace.cost && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-bold text-teal-900">
                          ₹{selectedPlace.cost.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-stone-900 mb-1 leading-snug">
                    {selectedPlace.title}
                  </h4>

                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed mb-2">
                    {selectedPlace.description}
                  </p>

                  <div className="text-[10px] text-stone-500 flex items-center gap-1 mb-2.5 truncate">
                    <MapPin className="w-3 h-3 text-teal-700 shrink-0" />
                    <span className="truncate">{selectedPlace.location}</span>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    {selectedPlace.contact && (
                      <a
                        href={`tel:${selectedPlace.contact.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] font-bold"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    )}

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.position.lat},${selectedPlace.position.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-800 hover:bg-teal-900 text-white text-[10px] font-bold ml-auto shadow-xs"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Directions</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </InfoWindow>
            )}
        </Map>

        {/* Live Route Summary Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-lg px-2.5 py-1.5 border border-stone-200/90 shadow-xs flex items-center gap-2 text-[11px] text-stone-800 font-medium z-10 pointer-events-auto">
          <Navigation className="w-3.5 h-3.5 text-teal-700" />
          <span>Day {activities.length} Waypoints · Live Google Traffic</span>
        </div>

        {/* Active Traffic Notice Pill when Traffic is turned on */}
        {showTraffic && (
          <div className="absolute bottom-3 left-3 bg-amber-500/95 text-white backdrop-blur-md rounded-lg px-2.5 py-1 border border-amber-600 shadow-xs flex items-center gap-1.5 text-[10px] font-bold z-10 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>Google Real-Time Traffic Layer Active</span>
          </div>
        )}
        {isTrackingLocation && (
          <div className="absolute bottom-3 right-3 bg-blue-600/95 text-white rounded-lg px-2.5 py-1.5 shadow-xs flex items-center gap-2 text-[10px] font-bold z-10">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Live location on</span>
          </div>
        )}
        {locationError && (
          <div role="status" className="absolute bottom-3 right-3 max-w-[min(24rem,85%)] bg-white text-rose-800 rounded-lg px-3 py-2 border border-rose-200 shadow-xs text-[11px] z-10">
            {locationError}
          </div>
        )}
      </div>
    </div>
  );
};
