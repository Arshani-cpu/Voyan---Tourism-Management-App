import { NearbyAmenity } from '../types/travel';

export const NEARBY_ESSENTIALS: Record<string, NearbyAmenity[]> = {
  'ooty': [
    // Hotels
    {
      id: 'hotel-ooty-1',
      name: 'Savoy - IHCL SeleQtions',
      type: 'hotel',
      distance: '1.2 km from town center',
      address: '77, Sylks Road, Ooty, Tamil Nadu 643001',
      contactNumber: '+91 423 222 5500',
      rating: 4.8,
      pricePerNight: 8500,
      tags: ['Heritage Cottage', 'Step-Free Lawn Access', 'Family Suites', 'Doctor on Call'],
      verified: true,
      coordinates: { x: 35, y: 48 },
      description: '180-year-old colonial hotel with sprawling level gardens, fireplace suites, and senior-accessible ground floor garden rooms.'
    },
    {
      id: 'hotel-ooty-2',
      name: 'Sterling Ooty Fern Hill',
      type: 'hotel',
      distance: '2.5 km from lake',
      address: 'Fern Hill Post, Ooty, Tamil Nadu 643004',
      contactNumber: '+91 423 244 3906',
      rating: 4.6,
      pricePerNight: 4200,
      tags: ['Kid Play Zone', 'Elevator Access', 'Paved Walking Trails', 'Restaurant on Site'],
      verified: true,
      coordinates: { x: 25, y: 65 },
      description: 'Family-friendly hill resort offering panoramic valley vistas, dedicated kids activity center, and wheelchair-accessible ramps.'
    },
    {
      id: 'hotel-ooty-3',
      name: 'Zostel Ooty (Private Rooms & Dorms)',
      type: 'hotel',
      distance: '1.8 km from railway station',
      address: 'Kerada Road, Fernhill, Ooty',
      contactNumber: '+91 22 4896 7984',
      rating: 4.7,
      pricePerNight: 1650,
      tags: ['Solo Traveler Favorite', 'Bonfire Courtyard', 'High-Speed Wi-Fi', 'Group Activities'],
      verified: true,
      coordinates: { x: 32, y: 58 },
      description: 'Vibrant travelers hub overlooking emerald tea terraces, ideal for solo explorers and friends groups with common lounge and walking tours.'
    },

    // Restaurants
    {
      id: 'rest-ooty-ess-1',
      name: 'Earl’s Secret at King’s Cliff',
      type: 'restaurant',
      distance: '2.0 km',
      address: 'Havelock Road, Ooty',
      contactNumber: '+91 423 245 2889',
      rating: 4.8,
      avgCostForTwo: 1200,
      tags: ['Candlelight Dining', 'Anglo-Indian Heritage', 'Glasshouse Seating'],
      verified: true,
      coordinates: { x: 42, y: 38 },
      description: 'Romantic glasshouse conservatory set in colonial woods serving Continental steaks, herbal teas, and woodfired roasts.'
    },
    {
      id: 'rest-ooty-ess-2',
      name: 'Hotel Nahar Nilgiris (Pure Veg)',
      type: 'restaurant',
      distance: '0.8 km',
      address: 'Charing Cross, Commercial Road, Ooty',
      contactNumber: '+91 423 244 2173',
      rating: 4.6,
      avgCostForTwo: 450,
      tags: ['Pure Vegetarian', 'Senior & Family Friendly', 'Filter Coffee Specialist'],
      verified: true,
      coordinates: { x: 50, y: 50 },
      description: 'Legendary pure vegetarian South Indian restaurant known for crispy ghee paper roast dosas, thali meals, and quick table service.'
    },

    // Police Stations & Emergency
    {
      id: 'police-ooty-1',
      name: 'Ooty Town Police Station (B1 Station)',
      type: 'police',
      distance: '0.6 km from Charing Cross',
      address: 'Hospital Road, Near Court Complex, Ooty, Tamil Nadu 643001',
      contactNumber: '+91 423 244 2222',
      tags: ['24/7 Tourist Assistance', 'Nilgiri Hill Patrol', 'Emergency 112'],
      verified: true,
      coordinates: { x: 46, y: 46 },
      description: 'Primary municipal police station with dedicated tourist help desk and 24-hour Nilgiri highway emergency patrol.',
      operatingHours: '24 Hours Open'
    },
    {
      id: 'police-ooty-2',
      name: 'Nilgiris District Police Control Room & Women Safety Cell',
      type: 'police',
      distance: '1.4 km',
      address: 'Collectorate Complex, Fingerpost, Ooty',
      contactNumber: '+91 423 244 4100',
      tags: ['Women & Solo Traveler Helpline', 'Highway Response Unit'],
      verified: true,
      coordinates: { x: 38, y: 40 },
      description: 'District control room coordinating mountain highway checkpoints, medical emergencies, and solo traveler safety queries.',
      operatingHours: '24 Hours Open'
    },

    // Petrol Bunk / Fuel Stations
    {
      id: 'fuel-ooty-1',
      name: 'Indian Oil Auto Care Fuel Station (EV Charging Available)',
      type: 'fuel',
      distance: '0.9 km from railway station',
      address: 'Coonoor Road, Commercial Area, Ooty',
      contactNumber: '+91 94430 12845',
      tags: ['Petrol & Diesel', 'Fast EV Charger 50kW', 'Air & Nitrogen', '24 Hours'],
      verified: true,
      coordinates: { x: 52, y: 54 },
      description: 'Major fuel stop along the Ooty-Coonoor highway with high-speed EV charging bay, tire pressure check, and clean restrooms.',
      operatingHours: '24 Hours Open'
    },
    {
      id: 'fuel-ooty-2',
      name: 'Bharat Petroleum (BPCL) Hill Highway Outlet',
      type: 'fuel',
      distance: '2.1 km',
      address: 'Fernhill - Mysore Road, Ooty',
      contactNumber: '+91 98421 55678',
      tags: ['Petrol & Diesel', 'Speed Premium Fuel', 'Card & UPI Accepted'],
      verified: true,
      coordinates: { x: 30, y: 62 },
      description: 'Convenient fuel station on the scenic Mysore-Ooty ghat road, equipped for private cabs and self-drive cars.',
      operatingHours: '06:00 AM – 11:00 PM'
    }
  ]
};

export function getNearbyEssentialsForDestination(destName: string): NearbyAmenity[] {
  const lower = destName.toLowerCase();
  if (lower.includes('ooty') || lower.includes('nilgiri')) {
    return NEARBY_ESSENTIALS['ooty'];
  }

  // Generative default matching the selected destination
  return [
    {
      id: 'gen-hotel-1',
      name: `Grand Heritage Resort & Spa (${destName})`,
      type: 'hotel',
      distance: '1.5 km',
      address: `Heritage District, ${destName}`,
      contactNumber: '+91 98200 12345',
      rating: 4.8,
      pricePerNight: 5800,
      tags: ['Verified Accessibility', 'Elevator', 'Family Friendly', 'Doctor on Call'],
      verified: true,
      coordinates: { x: 35, y: 45 },
      description: `Boutique luxury resort tailored for leisure with step-free entrances, fine dining, and group amenities.`
    },
    {
      id: 'gen-rest-1',
      name: `The Spice Garden Terrace (${destName})`,
      type: 'restaurant',
      distance: '0.8 km',
      address: `Main Promenade, ${destName}`,
      contactNumber: '+91 98400 67890',
      rating: 4.7,
      avgCostForTwo: 900,
      tags: ['Regional Specialties', 'Outdoor Seating', 'Pure Veg Options'],
      verified: true,
      coordinates: { x: 48, y: 40 },
      description: `Scenic terrace dining showcasing authentic local cuisine and seasonal specialties.`
    },
    {
      id: 'gen-police-1',
      name: `${destName} Central Police & Tourist Help Desk`,
      type: 'police',
      distance: '0.7 km',
      address: `Civil Lines, ${destName}`,
      contactNumber: '+91 112',
      tags: ['Emergency 112', '24/7 Tourist Unit', 'Highway Patrol'],
      verified: true,
      coordinates: { x: 50, y: 50 },
      description: `24-hour civic police station with dedicated tourist liaison and emergency medical coordination.`,
      operatingHours: '24 Hours Open'
    },
    {
      id: 'gen-fuel-1',
      name: `Indian Oil 24x7 Highway Fuel & EV Station`,
      type: 'fuel',
      distance: '1.2 km',
      address: `National Highway Arterial, ${destName}`,
      contactNumber: '+91 98111 22334',
      tags: ['Petrol', 'Diesel', 'EV Fast Charging', 'Air/Nitrogen', '24 Hours'],
      verified: true,
      coordinates: { x: 42, y: 60 },
      description: `All-night fuel facility with fast CCS2 EV charging, clean washrooms, and convenience store.`,
      operatingHours: '24 Hours Open'
    }
  ];
}
