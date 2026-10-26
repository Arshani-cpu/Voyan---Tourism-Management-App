// Geo coordinates mapping utility for Google Maps Platform

export interface LatLng {
  lat: number;
  lng: number;
}

export const DESTINATION_COORDINATES: Record<string, LatLng> = {
  'ooty': { lat: 11.4102, lng: 76.6950 },
  'ooty & nilgiris': { lat: 11.4102, lng: 76.6950 },
  'nilgiris': { lat: 11.4102, lng: 76.6950 },
  'manali': { lat: 32.2396, lng: 77.1887 },
  'himachal pradesh': { lat: 32.2396, lng: 77.1887 },
  'himachal': { lat: 32.2396, lng: 77.1887 },
  'kashmir': { lat: 34.0837, lng: 74.7973 },
  'srinagar': { lat: 34.0837, lng: 74.7973 },
  'kashmir & srinagar': { lat: 34.0837, lng: 74.7973 },
  'goa': { lat: 15.2993, lng: 74.1240 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'rajasthan': { lat: 26.9124, lng: 75.7873 },
  'udaipur': { lat: 24.5854, lng: 73.7125 },
  'kerala': { lat: 10.0889, lng: 77.0595 },
  'munnar': { lat: 10.0889, lng: 77.0595 },
  'rishikesh': { lat: 30.0869, lng: 78.2676 },
  'varanasi': { lat: 25.3176, lng: 82.9739 },
  'hampi': { lat: 15.3350, lng: 76.4600 },
  'pondicherry': { lat: 11.9416, lng: 79.8083 },
  'leh': { lat: 34.1526, lng: 77.5771 },
  'ladakh': { lat: 34.1526, lng: 77.5771 },
  'coorg': { lat: 12.3375, lng: 75.8069 },
};

// Known POI coordinates in major destinations
export const KNOWN_POI_COORDINATES: Record<string, LatLng> = {
  // Ooty POIs
  'botanical gardens': { lat: 11.4173, lng: 76.7112 },
  'government botanical garden': { lat: 11.4173, lng: 76.7112 },
  'doddabetta peak': { lat: 11.4011, lng: 76.7364 },
  'ooty lake': { lat: 11.4065, lng: 76.6875 },
  'boat house': { lat: 11.4065, lng: 76.6875 },
  'rose garden': { lat: 11.4087, lng: 76.7082 },
  'pykara lake': { lat: 11.4589, lng: 76.5982 },
  'pykara waterfalls': { lat: 11.4589, lng: 76.5982 },
  'tea factory': { lat: 11.4182, lng: 76.7301 },
  'tea museum': { lat: 11.4182, lng: 76.7301 },
  'nilgiri mountain railway': { lat: 11.4050, lng: 76.6974 },
  'charing cross': { lat: 11.4116, lng: 76.7032 },
  'savoy - ihcl seleqtions': { lat: 11.4135, lng: 76.6980 },
  'sterling ooty fern hill': { lat: 11.3985, lng: 76.6820 },
  'zostel ooty': { lat: 11.3950, lng: 76.6890 },
  'earl’s secret at king’s cliff': { lat: 11.4230, lng: 76.7010 },
  'shinkow’s chinese restaurant': { lat: 11.4110, lng: 76.7040 },
  'ooty town police station': { lat: 11.4089, lng: 76.6998 },
  'hp petrol bunk - charing cross': { lat: 11.4120, lng: 76.7045 },
  'indian oil petrol pump - coonoor road': { lat: 11.4070, lng: 76.7120 },

  // Kashmir POIs
  'dal lake': { lat: 34.1120, lng: 74.8680 },
  'mughal gardens': { lat: 34.1250, lng: 74.8720 },
  'nishat bagh': { lat: 34.1250, lng: 74.8720 },
  'shalimar bagh': { lat: 34.1450, lng: 74.8740 },
  'gulmarg': { lat: 34.0484, lng: 74.3805 },
  'gulmarg gondola': { lat: 34.0530, lng: 74.3850 },
  'pahalgam': { lat: 34.0150, lng: 75.3150 },
  'betaab valley': { lat: 34.0280, lng: 75.3520 },

  // Jaipur POIs
  'hawa mahal': { lat: 26.9239, lng: 75.8267 },
  'city palace': { lat: 26.9258, lng: 75.8237 },
  'amber palace': { lat: 26.9855, lng: 75.8513 },
  'amer fort': { lat: 26.9855, lng: 75.8513 },
  'nahargarh fort': { lat: 26.9378, lng: 75.8156 },
  'jantar mantar': { lat: 26.9248, lng: 75.8246 },

  // Goa POIs
  'baga beach': { lat: 15.5553, lng: 73.7517 },
  'calangute beach': { lat: 15.5440, lng: 73.7554 },
  'aguada fort': { lat: 15.4925, lng: 73.7736 },
  'basilica of bom jesus': { lat: 15.5009, lng: 73.9116 },
  'dudhsagar falls': { lat: 15.3144, lng: 74.3143 },

  // Manali POIs
  'solang valley': { lat: 32.3166, lng: 77.1578 },
  'rohtang pass': { lat: 32.3716, lng: 77.2466 },
  'hadimba temple': { lat: 32.2483, lng: 77.1804 },
  'old manali': { lat: 32.2530, lng: 77.1750 },
  'jogini waterfall': { lat: 32.2680, lng: 77.1950 },
};

/**
 * Returns accurate LatLng for a destination name
 */
export function getDestinationCenter(destName: string): LatLng {
  const normalized = destName.toLowerCase().trim();
  for (const [key, coords] of Object.entries(DESTINATION_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }
  // Default fallback center: Ooty
  return { lat: 11.4102, lng: 76.6950 };
}

/**
 * Resolves precise coordinates for a POI / activity / amenity
 */
export function resolveLocationCoordinates(
  name: string,
  destName: string,
  normalizedFallback?: { x: number; y: number }
): LatLng {
  const normName = name.toLowerCase().trim();

  // 1. Direct match in known POIs
  for (const [poiKey, coords] of Object.entries(KNOWN_POI_COORDINATES)) {
    if (normName.includes(poiKey) || poiKey.includes(normName)) {
      return coords;
    }
  }

  // 2. Base on destination center + normalized offset
  const center = getDestinationCenter(destName);
  if (normalizedFallback) {
    // Map 0..100 x,y to roughly +/- 0.05 degrees (~5 km radius) around center
    const latOffset = ((50 - normalizedFallback.y) / 100) * 0.06;
    const lngOffset = ((normalizedFallback.x - 50) / 100) * 0.06;
    return {
      lat: Number((center.lat + latOffset).toFixed(5)),
      lng: Number((center.lng + lngOffset).toFixed(5)),
    };
  }

  return center;
}
