import { TripPlan } from '../types/travel';

export const SAMPLE_TRIPS: Record<string, TripPlan> = {
  'ooty-budget': {
    id: 'ooty-budget-3day',
    title: 'Misty Nilgiris & Tea Valley Retreat',
    destination: 'Ooty & Coonoor',
    state: 'Tamil Nadu',
    durationDays: 3,
    travelDates: {
      start: 'Fri, 24 Oct 2026',
      end: 'Sun, 26 Oct 2026'
    },
    travellersCount: 2,
    budgetTotal: 9600,
    budgetPerPerson: 4800,
    interests: ['Tea Estates', 'Mountain Viewpoints', 'Heritage Toy Train', 'Cozy Cafes'],
    coverImage: '/src/assets/images/dest_ooty_hills_1792467058609.jpg',
    overviewSummary: 'Curated 3-day budget itinerary designed to experience the misty tea slopes, Nilgiri Mountain Railway heritage ride, and pine valley walks under ₹5,000 per person.',
    groupType: 'seniors',
    transportPreference: 'Private AC Chauffeur Cab',
    createdAt: '2026-10-19',
    saved: true,
    days: [
      {
        dayNumber: 1,
        title: 'Arrival, Pine Forest & Sunset Over Ooty Lake',
        theme: 'Acclimatization & Nature Walk',
        activities: [
          {
            id: 'ooty-1-1',
            time: '09:30 AM',
            title: 'Check-in at Colonial Hillside Homestay',
            description: 'Settle into a cozy garden homestay overlooking tea plantations with complimentary Nilgiri black tea.',
            category: 'leisure',
            duration: '1.5 hrs',
            costEstimate: 1600,
            locationName: 'Fernhill Palace Road',
            coordinates: { x: 38, y: 55 },
            tips: 'Ask the host for local handmade fudge and extra warm blankets.'
          },
          {
            id: 'ooty-1-2',
            time: '11:45 AM',
            title: 'Stroll through the Century-Old Botanical Gardens',
            description: 'Explore 55 acres of terraced exotic flora, Italian gardens, and a 20-million-year-old fossil tree trunk.',
            category: 'sightseeing',
            duration: '2 hrs',
            costEstimate: 60,
            locationName: 'Vannarapettai',
            coordinates: { x: 48, y: 35 },
            tips: 'Carry light woolens as the shaded canopy can be crisp.'
          },
          {
            id: 'ooty-1-3',
            time: '04:15 PM',
            title: 'Rowing at Ooty Lake & Pine Forest Walk',
            description: 'Rent a peaceful pedal boat on the shimmering eucalyptus-fringed lake, followed by a stroll under tall pine woods.',
            category: 'nature',
            duration: '2 hrs',
            costEstimate: 240,
            locationName: 'Ooty Boathouse',
            coordinates: { x: 28, y: 62 },
            tips: 'Visit after 4 PM for soft golden light through the tree trunks.'
          }
        ],
        diningOptions: [
          {
            id: 'rest-ooty-1',
            name: 'Shinkow’s Chinese Restaurant',
            cuisine: 'Indo-Chinese Heritage',
            priceLevel: '₹₹',
            avgCostForTwo: 550,
            highlightDish: 'Steamed Chilli Chicken & Hot Garlic Noodles',
            rating: 4.6,
            location: 'Commissioner’s Road'
          },
          {
            id: 'rest-ooty-2',
            name: 'Earl’s Secret at King’s Cliff',
            cuisine: 'Colonial Anglo-Indian',
            priceLevel: '₹₹₹',
            avgCostForTwo: 1100,
            highlightDish: 'Herb-Roasted Pot Roast & Nilgiri Green Salad',
            rating: 4.8,
            location: 'Havelock Road'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Nilgiri Heritage Toy Train to Coonoor & Tea Estate Trail',
        theme: 'UNESCO Railway & Tea Culture',
        activities: [
          {
            id: 'ooty-2-1',
            time: '08:45 AM',
            title: 'Nilgiri Mountain Railway (Toy Train to Coonoor)',
            description: 'Board the iconic blue-and-cream steam rack railway through 16 tunnels, 250 bridges, and panoramic cliff ravines.',
            category: 'heritage',
            duration: '1 hr 20 mins',
            costEstimate: 90,
            locationName: 'Udhagamandalam Railway Station',
            coordinates: { x: 33, y: 44 },
            tips: 'Sit on the right side facing forward for sweeping gorge views.'
          },
          {
            id: 'ooty-2-2',
            time: '11:15 AM',
            title: 'Highfield Tea Estate Factory Tour & Tasting',
            description: 'Witness orthodox green and black tea processing, smell fresh oxidising leaves, and taste single-estate brews.',
            category: 'nature',
            duration: '1.5 hrs',
            costEstimate: 120,
            locationName: 'Coonoor Tea Estate',
            coordinates: { x: 74, y: 78 },
            tips: 'Purchase freshly packed Silver Tips White Tea directly from factory outlet.'
          },
          {
            id: 'ooty-2-3',
            time: '03:30 PM',
            title: 'Dolphin’s Nose & Catherine Falls Panorama',
            description: 'Stand at the dramatic cliff outcrop jutting into the valley with an unobstructed view of cascading Catherine Falls.',
            category: 'sightseeing',
            duration: '2 hrs',
            costEstimate: 80,
            locationName: 'Dolphin’s Nose Point',
            coordinates: { x: 88, y: 84 },
            tips: 'The winding mountain roads are best traveled via shared taxi.'
          }
        ],
        diningOptions: [
          {
            id: 'rest-ooty-3',
            name: 'Café Diem',
            cuisine: 'Artisanal French & Nilgiri Fusion',
            priceLevel: '₹₹',
            avgCostForTwo: 700,
            highlightDish: 'Mushroom Galette & Lavender Tea',
            rating: 4.9,
            location: 'Kotagiri Road, Coonoor'
          },
          {
            id: 'rest-ooty-4',
            name: 'Hotel Nahar Nilgiris (Chandrakala)',
            cuisine: 'Pure South Indian Vegetarian Thali',
            priceLevel: '₹',
            avgCostForTwo: 360,
            highlightDish: 'Ghee Roast Dosa & Filter Coffee',
            rating: 4.5,
            location: 'Commercial Street, Ooty'
          }
        ]
      },
      {
        dayNumber: 3,
        title: 'Doddabetta Peak & Pykara Waterfall Tranquility',
        theme: 'High Altitude Summits & Pristine Waters',
        activities: [
          {
            id: 'ooty-3-1',
            time: '07:30 AM',
            title: 'Early Morning Ascent to Doddabetta Peak (2,637m)',
            description: 'Highest vantage point in the Nilgiri hills. Enjoy sweeping views of the Coimbatore plains and Chamundi hills on clear days.',
            category: 'nature',
            duration: '2 hrs',
            costEstimate: 50,
            locationName: 'Doddabetta Summit',
            coordinates: { x: 70, y: 25 },
            tips: 'Arrive before 8:30 AM to beat tourist buses and morning mist.'
          },
          {
            id: 'ooty-3-2',
            time: '12:00 PM',
            title: 'Pykara Lake Speedboating & Forest Cascades',
            description: 'Venture 21 km outside town through Toda tribal settlements to the untamed, crystal clear waters of Pykara reservoir.',
            category: 'nature',
            duration: '2.5 hrs',
            costEstimate: 350,
            locationName: 'Pykara Dam & Falls',
            coordinates: { x: 14, y: 18 },
            tips: 'Combine with a 15-minute downhill walk to the multi-tiered Pykara waterfalls.'
          },
          {
            id: 'ooty-3-3',
            time: '05:00 PM',
            title: 'Handmade Nilgiri Chocolate & Spices Shopping',
            description: 'Browse local heritage confectioneries on Charing Cross for artisanal roasted almond dark chocolate, cardamoms, and eucalyptus oils.',
            category: 'leisure',
            duration: '1.5 hrs',
            costEstimate: 450,
            locationName: 'Charing Cross Market',
            coordinates: { x: 50, y: 48 },
            tips: 'Sample the dark bitter chocolate with roasted hazelnuts before purchasing.'
          }
        ],
        diningOptions: [
          {
            id: 'rest-ooty-5',
            name: 'Willy’s Coffee Pub',
            cuisine: 'Nilgiri Coffee & Baked Breads',
            priceLevel: '₹',
            avgCostForTwo: 320,
            highlightDish: 'Cinnamon Brioche & Dark Roast Pour-over',
            rating: 4.7,
            location: 'Kandal, Ooty'
          }
        ]
      }
    ]
  },
  'kashmir-peaceful': {
    id: 'kashmir-peaceful-5day',
    title: 'Serene Valleys & Saffron Waters of Kashmir',
    destination: 'Srinagar & Gulmarg',
    state: 'Jammu & Kashmir',
    durationDays: 5,
    travelDates: {
      start: 'Wed, 12 Nov 2026',
      end: 'Sun, 16 Nov 2026'
    },
    travellersCount: 2,
    budgetTotal: 23000,
    budgetPerPerson: 11500,
    interests: ['Houseboat Stay', 'Shikara Dawn Ride', 'Gulmarg Snow Gondola', 'Mughal Gardens'],
    coverImage: '/src/assets/images/dest_kashmir_dal_lake_1792467060538.jpg',
    overviewSummary: '5-day tranquil immersive journey featuring cedarwood houseboat stays on Dal Lake, floating vegetable markets at dawn, and pine meadow gondola rides.',
    groupType: 'couple',
    transportPreference: 'Private Dedicated Cab & Shikara',
    createdAt: '2026-10-18',
    saved: true,
    days: [
      {
        dayNumber: 1,
        title: 'Arrival in Srinagar & Sunset Shikara on Dal Lake',
        theme: 'Water World & Alpine Reflections',
        activities: [
          {
            id: 'kash-1-1',
            time: '02:00 PM',
            title: 'Check-in to Carved Cedar Houseboat',
            description: 'Welcome saffron Kahwa tea served on the wood-carved front deck looking across mirror reflections of the Zabarwan range.',
            category: 'leisure',
            duration: '2 hrs',
            costEstimate: 2800,
            locationName: 'Ghat No. 7, Boulevard Road',
            coordinates: { x: 45, y: 45 }
          },
          {
            id: 'kash-1-2',
            time: '05:00 PM',
            title: 'Tranquil Sunset Shikara Cruise to Char Chinar',
            description: 'Gliding silently past lotus gardens and floating post offices to the four ancient Chinar trees island.',
            category: 'nature',
            duration: '2 hrs',
            costEstimate: 700,
            locationName: 'Dal Lake Char Chinar',
            coordinates: { x: 55, y: 50 }
          }
        ],
        diningOptions: [
          {
            id: 'rest-kash-1',
            name: 'Ahdoos Traditional Wazwan',
            cuisine: 'Kashmiri Wazwan & Rogan Josh',
            priceLevel: '₹₹',
            avgCostForTwo: 900,
            highlightDish: 'Gushtaba, Rista, and Kashmiri Pulao',
            rating: 4.8,
            location: 'Residency Road, Srinagar'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Mughal Terraced Gardens & Old City Copper Craft',
        theme: 'Imperial Architecture & Living Craft',
        activities: [
          {
            id: 'kash-2-1',
            time: '09:30 AM',
            title: 'Nishat Bagh & Shalimar Bagh Royal Terraces',
            description: 'Walk through 12 cascade terraces built by Emperor Jahangir with fountains framed against Pir Panjal crests.',
            category: 'heritage',
            duration: '2.5 hrs',
            costEstimate: 100,
            locationName: 'Foreshore Road',
            coordinates: { x: 65, y: 35 }
          },
          {
            id: 'kash-2-2',
            time: '03:00 PM',
            title: 'Downtown Srinagar Heritage Walk & Jamia Masjid',
            description: 'Discover 378 deodar wooden pillar courtyards and traditional walnut wood artisans in historic Shehr-e-Khaas.',
            category: 'heritage',
            duration: '2 hrs',
            costEstimate: 0,
            locationName: 'Nowhatta, Srinagar',
            coordinates: { x: 30, y: 40 }
          }
        ],
        diningOptions: [
          {
            id: 'rest-kash-2',
            name: 'Chai Jaai Tea Room',
            cuisine: 'Artisanal Teas & Kashmiri Breads',
            priceLevel: '₹₹',
            avgCostForTwo: 550,
            highlightDish: 'Noon Chai with Girda and Bakarkhani',
            rating: 4.9,
            location: 'The Bund, Srinagar'
          }
        ]
      }
    ]
  },
  'jaipur-royal': {
    id: 'jaipur-royal-3day',
    title: 'Pink City Regal Heritage & Culinary Trail',
    destination: 'Jaipur & Amer',
    state: 'Rajasthan',
    durationDays: 3,
    travelDates: {
      start: 'Thu, 05 Nov 2026',
      end: 'Sat, 07 Nov 2026'
    },
    travellersCount: 2,
    budgetTotal: 13600,
    budgetPerPerson: 6800,
    interests: ['Palaces & Forts', 'Rajasthani Thali', 'Heritage Stepwells', 'Textile Bazaars'],
    coverImage: '/src/assets/images/dest_jaipur_palace_1792467061075.jpg',
    overviewSummary: 'A 3-day royal journey through Jaipur’s grand Rajput ramparts, early morning Hawa Mahal vistas, and century-old sweet shops.',
    groupType: 'friends',
    transportPreference: 'Self-Drive Car & Private Auto',
    createdAt: '2026-10-15',
    saved: false,
    days: [
      {
        dayNumber: 1,
        title: 'Amber Fort Ramparts & Panna Meena Stepwell',
        theme: 'Rajput Architecture & Geometric Marvels',
        activities: [
          {
            id: 'jpr-1-1',
            time: '08:30 AM',
            title: 'Early Morning Amber Palace (Sheesh Mahal)',
            description: 'Explore the mirror hall that glistens in candlelight and high battlement terraces overlooking Maota Lake.',
            category: 'heritage',
            duration: '3 hrs',
            costEstimate: 200,
            locationName: 'Amer Fort Complex',
            coordinates: { x: 75, y: 20 }
          },
          {
            id: 'jpr-1-2',
            time: '01:00 PM',
            title: 'Geometric Symmetry at Panna Meena Ka Kund',
            description: 'Photograph the mesmerizing 16th-century eight-storey stepwell with crisscross staircases.',
            category: 'sightseeing',
            duration: '1 hr',
            costEstimate: 50,
            locationName: 'Amer Village',
            coordinates: { x: 78, y: 15 }
          }
        ],
        diningOptions: [
          {
            id: 'rest-jpr-1',
            name: '1135 AD at Amer Fort',
            cuisine: 'Royal Rajput Fine Dining',
            priceLevel: '₹₹₹',
            avgCostForTwo: 2200,
            highlightDish: 'Laal Maas & Junglee Maas with Bajra Roti',
            rating: 4.7,
            location: 'Amer Fort'
          }
        ]
      }
    ]
  },
  'goa-coastal': {
    id: 'goa-coastal-4day',
    title: 'South Goa Untamed Shores & Latin Quarters',
    destination: 'South Goa',
    state: 'Goa',
    durationDays: 4,
    travelDates: {
      start: 'Mon, 17 Nov 2026',
      end: 'Thu, 20 Nov 2026'
    },
    travellersCount: 2,
    budgetTotal: 15000,
    budgetPerPerson: 7500,
    interests: ['Quiet Beaches', 'Seafood Shacks', 'Portuguese Architecture', 'Sunset Kayaking'],
    coverImage: '/src/assets/images/dest_goa_beach_1792467060231.jpg',
    overviewSummary: 'Unwind along tranquil Palolem and Agonda shores, explore colorful pastel alleys of Fontainhas, and savor coastal Goan fish curry.',
    groupType: 'couple',
    transportPreference: 'Self-Drive Scooter / Open Thar',
    createdAt: '2026-10-14',
    saved: false,
    days: [
      {
        dayNumber: 1,
        title: 'Palolem Crescent Beach & Agonda Sunset Cove',
        theme: 'Coastal Repose & Sunset Dining',
        activities: [
          {
            id: 'goa-1-1',
            time: '03:30 PM',
            title: 'Check-in to Beachside Eco-Cottage',
            description: 'Relax in sustainable bamboo cottages under coconut canopy just 30 steps from the waves.',
            category: 'leisure',
            duration: '1.5 hrs',
            costEstimate: 2200,
            locationName: 'Palolem Beach South',
            coordinates: { x: 45, y: 70 }
          },
          {
            id: 'goa-1-2',
            time: '05:30 PM',
            title: 'Sunset Stand-Up Paddle or Sea Kayaking',
            description: 'Paddle along the calm cove waters as the sun dips below the Arabian Sea horizon.',
            category: 'nature',
            duration: '1 hr',
            costEstimate: 400,
            locationName: 'Palolem Backwaters',
            coordinates: { x: 50, y: 75 }
          }
        ],
        diningOptions: [
          {
            id: 'rest-goa-1',
            name: 'Fisherman’s Wharf',
            cuisine: 'Goan Coastal & Seafood',
            priceLevel: '₹₹',
            avgCostForTwo: 950,
            highlightDish: 'Rava Fried Kingfish & Goan Prawn Balchão',
            rating: 4.8,
            location: 'Cavelossim'
          }
        ]
      }
    ]
  }
};

export function generateCustomTripPlan(params: {
  query?: string;
  destination?: string;
  durationDays?: number;
  budgetPerPerson?: number;
  travellersCount?: number;
  interests?: string[];
}): TripPlan {
  const queryLower = (params.query || '').toLowerCase();
  
  if (queryLower.includes('ooty') || (params.destination && params.destination.toLowerCase().includes('ooty'))) {
    const base = JSON.parse(JSON.stringify(SAMPLE_TRIPS['ooty-budget'])) as TripPlan;
    if (params.budgetPerPerson) {
      base.budgetPerPerson = params.budgetPerPerson;
      base.budgetTotal = params.budgetPerPerson * (params.travellersCount || 2);
    }
    if (params.travellersCount) base.travellersCount = params.travellersCount;
    return base;
  }

  if (queryLower.includes('kashmir') || queryLower.includes('mountain') || queryLower.includes('peaceful') || (params.destination && params.destination.toLowerCase().includes('kashmir'))) {
    const base = JSON.parse(JSON.stringify(SAMPLE_TRIPS['kashmir-peaceful'])) as TripPlan;
    if (params.travellersCount) base.travellersCount = params.travellersCount;
    return base;
  }

  if (queryLower.includes('jaipur') || queryLower.includes('palace') || queryLower.includes('royal') || (params.destination && params.destination.toLowerCase().includes('jaipur'))) {
    const base = JSON.parse(JSON.stringify(SAMPLE_TRIPS['jaipur-royal'])) as TripPlan;
    if (params.travellersCount) base.travellersCount = params.travellersCount;
    return base;
  }

  if (queryLower.includes('goa') || queryLower.includes('beach') || (params.destination && params.destination.toLowerCase().includes('goa'))) {
    const base = JSON.parse(JSON.stringify(SAMPLE_TRIPS['goa-coastal'])) as TripPlan;
    if (params.travellersCount) base.travellersCount = params.travellersCount;
    return base;
  }

  // Fallback to default personalized Ooty trip matching the user prompt
  const fallback = JSON.parse(JSON.stringify(SAMPLE_TRIPS['ooty-budget'])) as TripPlan;
  if (params.query) {
    fallback.overviewSummary = `Custom synthesized itinerary based on "${params.query}". Tailored for optimal travel times, regional budget management, and authentic experiences.`;
  }
  return fallback;
}

// ── Place-aware trip plan generator ──────────────────────────────────────────
// Uses real Place data from the 700-places database to build a place-specific
// 3-day itinerary with real entry pass costs, opening hours, and category.

export interface PlaceForPlan {
  place_id: string;
  name: string;
  state: string | null;
  district: string | null;
  locality: string | null;
  place_type: string | null;
  description: string | null;
  opening_hours: string | null;
  rating_value: number | null;
  selection_category: string | null;
  google_maps_url: string | null;
  audience_categories: { category_label: string }[];
  entry_pass: {
    indian_price: number;
    foreign_price: number;
    child_price: number;
    notes: string | null;
    booking_url: string | null;
  } | null;
}

function categoryToAct(cat: string | null): Activity['category'] {
  if (!cat) return 'sightseeing';
  if (cat.includes('Wildlife') || cat.includes('nature')) return 'nature';
  if (cat.includes('Heritage') || cat.includes('Historical')) return 'heritage';
  if (cat.includes('Religious') || cat.includes('Temple')) return 'leisure';
  if (cat.includes('Museum')) return 'heritage';
  return 'sightseeing';
}

function foodBudget(state: string | null) {
  return ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal'].includes(state || '') ? 900 : 600;
}

function accomBudget(state: string | null, cat: string | null) {
  if (['Goa', 'Himachal Pradesh', 'Uttarakhand', 'Andaman and Nicobar Islands', 'Jammu and Kashmir'].includes(state || '')) return 2500;
  if (cat?.includes('Wildlife')) return 3500;
  return 1500;
}

function transportLabel(state: string | null) {
  return ['Himachal Pradesh', 'Uttarakhand', 'Sikkim', 'Meghalaya', 'Jammu and Kashmir'].includes(state || '')
    ? 'Shared Taxi & Local Bus' : 'Auto Rickshaw & State Bus';
}

function placeRestaurant(place: PlaceForPlan, day: number): RestaurantRecommendation {
  const loc = place.district || place.locality || place.state || place.name;
  const priceMap: Record<string, RestaurantRecommendation['priceLevel']> = {
    Maharashtra: '₹₹', Delhi: '₹₹', Karnataka: '₹₹', Tamil_Nadu: '₹', Rajasthan: '₹₹', Goa: '₹₹₹',
  };
  const price = priceMap[place.state || ''] || '₹₹';
  return {
    id: `r-${place.place_id}-${day}`,
    name: `Local Eatery near ${loc}`,
    cuisine: 'Regional Home-style',
    priceLevel: price,
    avgCostForTwo: price === '₹' ? 350 : price === '₹₹₹' ? 1100 : 650,
    highlightDish: `${place.state || 'Indian'} Thali`,
    rating: parseFloat((4.1 + day * 0.15).toFixed(1)),
    location: loc,
  };
}

export function generatePlaceTripPlan(place: PlaceForPlan, travellersCount = 2): TripPlan {
  const entry = place.entry_pass?.indian_price ?? 0;
  const food = foodBudget(place.state);
  const accom = accomBudget(place.state, place.selection_category);
  const transport = 1200;
  const days = 3;
  const budgetPP = entry + (food + accom + 300) * days + transport;
  const act = categoryToAct(place.selection_category);
  const loc = [place.district, place.state].filter(Boolean).join(', ');
  const tip = place.entry_pass?.notes || (place.opening_hours ? `Timings: ${place.opening_hours}` : 'Check local timings before visiting.');

  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + days);
  const fmt = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const audiences = place.audience_categories.map(a => a.category_label.toLowerCase());
  const groupType: TripPlan['groupType'] =
    audiences.some(l => l.includes('senior')) ? 'seniors' :
    audiences.some(l => l.includes('family')) ? 'family' :
    audiences.some(l => l.includes('couple')) ? 'couple' :
    audiences.some(l => l.includes('solo')) ? 'solo' : 'friends';

  return {
    id: `plan-${place.place_id}-${Date.now()}`,
    title: `${place.name} – ${days}-Day Itinerary`,
    destination: place.name,
    state: place.state || '',
    durationDays: days,
    travelDates: { start: fmt(today), end: fmt(end) },
    travellersCount,
    budgetPerPerson: budgetPP,
    budgetTotal: budgetPP * travellersCount,
    interests: [
      place.selection_category || 'Sightseeing',
      entry === 0 ? 'Free Entry' : `Entry ₹${entry}`,
      place.rating_value && place.rating_value >= 4.5 ? 'Top Rated' : null,
      place.district || null,
    ].filter(Boolean).slice(0, 4) as string[],
    coverImage: '/src/assets/images/dest_ooty_hills_1792467058609.jpg',
    overviewSummary:
      (place.description ? place.description.slice(0, 200) + '…' : `Explore ${place.name} in ${loc}.`) +
      ` Entry: ${entry > 0 ? `₹${entry}/person` : 'Free'}. Stay: ~₹${accom}/night. Food: ~₹${food}/day.`,
    groupType,
    transportPreference: transportLabel(place.state),
    createdAt: today.toISOString().split('T')[0],
    saved: false,
    days: [
      {
        dayNumber: 1,
        title: `Arrival & First Visit – ${place.name}`,
        theme: `Discover ${place.name}`,
        activities: [
          {
            id: `${place.place_id}-d1-a`, time: '10:00 AM',
            title: `Arrive in ${place.district || place.state || place.name}`,
            description: `Check into accommodation in ${loc}. Freshen up and get oriented before your first visit to ${place.name}.`,
            category: 'leisure', duration: '1.5 hrs', costEstimate: accom,
            locationName: place.district || place.state || 'Destination',
            coordinates: { x: 30, y: 40 },
            tips: 'Book accommodation in advance — especially on weekends.',
          },
          {
            id: `${place.place_id}-d1-b`, time: place.opening_hours ? '02:00 PM' : '11:30 AM',
            title: `Visit ${place.name}`,
            description: place.description
              ? place.description.slice(0, 220) + (place.description.length > 220 ? '…' : '')
              : `Explore ${place.name}, a remarkable attraction in ${loc}.`,
            category: act, duration: '3 hrs',
            costEstimate: entry * travellersCount,
            locationName: place.name, coordinates: { x: 55, y: 50 }, tips: tip,
          },
          {
            id: `${place.place_id}-d1-c`, time: '05:30 PM',
            title: `Evening stroll – ${place.district || place.locality || 'local market'}`,
            description: `Walk through the local market near ${place.name}. Try street food, browse handicrafts, and soak in the evening atmosphere.`,
            category: 'leisure', duration: '1.5 hrs', costEstimate: 200,
            locationName: `${place.district || place.state} Market`, coordinates: { x: 45, y: 65 },
            tips: 'Bargain at local shops. Try regional snacks from street stalls.',
          },
        ],
        diningOptions: [placeRestaurant(place, 1)],
      },
      {
        dayNumber: 2,
        title: `In-Depth Exploration – ${loc}`,
        theme: `Explore ${loc}`,
        activities: [
          {
            id: `${place.place_id}-d2-a`, time: '09:00 AM',
            title: `Morning at ${place.name}`,
            description: `Experience ${place.name} in the peaceful morning hours. Best time for photography and avoiding crowds.`,
            category: act, duration: '2 hrs',
            costEstimate: entry * travellersCount,
            locationName: place.name, coordinates: { x: 55, y: 45 },
            tips: 'Arrive 30 minutes before opening to beat the crowds.',
          },
          {
            id: `${place.place_id}-d2-b`, time: '12:00 PM',
            title: `Nearby attractions in ${place.district || place.state}`,
            description: `Explore other points of interest in ${loc} — local temples, viewpoints, museums, or parks near ${place.name}.`,
            category: 'sightseeing', duration: '2.5 hrs', costEstimate: 150,
            locationName: `${place.district || place.state} surroundings`, coordinates: { x: 70, y: 55 },
            tips: 'Ask locals or your hotel for hidden gems in the area.',
          },
          {
            id: `${place.place_id}-d2-c`, time: '04:00 PM',
            title: `Cultural experience – ${place.state}`,
            description: `Dive into ${place.state}'s culture. Visit a craft market, attend a local performance, or browse a regional museum.`,
            category: 'heritage', duration: '2 hrs', costEstimate: 350,
            locationName: `${place.state} Cultural Zone`, coordinates: { x: 35, y: 70 },
            tips: 'Government emporiums offer authentic handicrafts at fixed prices.',
          },
        ],
        diningOptions: [placeRestaurant(place, 2)],
      },
      {
        dayNumber: 3,
        title: 'Final Morning & Departure',
        theme: 'Last Memories & Farewell',
        activities: [
          {
            id: `${place.place_id}-d3-a`, time: '09:00 AM',
            title: `Final visit to ${place.name}`,
            description: `One last morning at ${place.name} to capture memories, revisit favourite spots, or explore any missed corners.`,
            category: act, duration: '1.5 hrs', costEstimate: 0,
            locationName: place.name, coordinates: { x: 55, y: 50 },
            tips: place.entry_pass?.booking_url ? 'Book online to skip ticket queues.' : 'Carry a camera — morning light is beautiful.',
          },
          {
            id: `${place.place_id}-d3-b`, time: '11:30 AM',
            title: 'Souvenir shopping & breakfast',
            description: `Shop for local handicrafts, spices, and regional specialties unique to ${place.state}. Grab a traditional breakfast at a local café.`,
            category: 'food', duration: '1.5 hrs', costEstimate: 600,
            locationName: `${place.district || place.state} Bazaar`, coordinates: { x: 40, y: 60 },
            tips: `Buy directly from artisans in ${place.state} for the best prices and authenticity.`,
          },
          {
            id: `${place.place_id}-d3-c`, time: '01:00 PM',
            title: 'Departure',
            description: 'Check out and head to the nearest bus stand or railway station. Safe travels!',
            category: 'leisure', duration: '1 hr', costEstimate: transport,
            locationName: 'Bus Stand / Railway Station', coordinates: { x: 20, y: 30 },
          },
        ],
        diningOptions: [placeRestaurant(place, 3)],
      },
    ],
  };
}
