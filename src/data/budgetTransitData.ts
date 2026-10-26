import { DestinationLogistics, BudgetCategory } from '../types/budgetTransit';

export const DEFAULT_BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: 'stays',
    name: 'Accommodations & Stays',
    icon: 'Hotel',
    allocatedAmount: 6200,
    percentage: 42,
    color: '#0F766E', // Teal
    notes: 'Heritage colonial homestays or boutique garden cottages with breakfast included.'
  },
  {
    id: 'transit',
    name: 'Intercity Transit & Local Cabs',
    icon: 'Car',
    allocatedAmount: 3400,
    percentage: 23,
    color: '#0284C7', // Sky
    notes: 'Shared or private hill cab, toy train tickets, and fuel/toll charges.'
  },
  {
    id: 'dining',
    name: 'Food & Regional Dining',
    icon: 'Utensils',
    allocatedAmount: 2600,
    percentage: 18,
    color: '#D97706', // Amber
    notes: 'Traditional South Indian thalis, tea estate snacks, and cozy cafe dinners.'
  },
  {
    id: 'passes',
    name: 'Monuments, Entry Passes & Activities',
    icon: 'Ticket',
    allocatedAmount: 1800,
    percentage: 12,
    color: '#059669', // Emerald
    notes: 'Botanical garden passes, boat rentals, museum admissions, and factory tours.'
  },
  {
    id: 'contingency',
    name: 'Emergency & Incidentals',
    icon: 'Shield',
    allocatedAmount: 800,
    percentage: 5,
    color: '#64748B', // Slate
    notes: 'Warm fleece rentals, handmade fudge souvenirs, umbrella purchases, and tips.'
  }
];

export const DESTINATIONS_LOGISTICS: Record<string, DestinationLogistics> = {
  'ooty': {
    destinationId: 'ooty',
    destinationName: 'Ooty & Nilgiris',
    dailySpendAverages: {
      budget: 1800,
      moderate: 3800,
      luxury: 8500
    },
    localCommuteRates: {
      privateCabPerKm: 18,
      autoBaseFare: 40,
      rentalScooterPerDay: 550,
      fuelPricePerLitre: 102.5
    },
    transitOptions: [
      {
        id: 'tr-ooty-1',
        mode: 'flight',
        title: 'Fly to Coimbatore (CJB) + Hill Road Cab',
        route: 'Coimbatore Airport (CJB) → Mettupalayam → Ooty (88 km)',
        duration: '2 hrs 45 mins drive',
        estimatedCost: 2200,
        frequency: 'Pre-paid cabs available 24/7 at airport',
        bookingTip: 'Book official pre-paid airport taxi counter at CJB to avoid peak ghat road surge rates.',
        bestForGroup: 'Family & Senior Citizens (Shortest flight + cab combo)',
        accessibilityNotes: 'AC Sedans & Innovas available with door-to-door luggage support.'
      },
      {
        id: 'tr-ooty-2',
        mode: 'train',
        title: 'Nilgiri Mountain Railway (UNESCO Toy Train)',
        route: 'Mettupalayam Junction → Coonoor → Ooty (46 km)',
        duration: '4 hrs 50 mins scenic rail',
        estimatedCost: 205,
        frequency: 'Departs Mettupalayam 07:10 AM daily',
        bookingTip: 'Book 120 days in advance on IRCTC (Train #56136). Unreserved second class tickets available at station 1 hour prior.',
        bestForGroup: 'Couples, Heritage Lovers & Senior Sightseers',
        accessibilityNotes: 'Level boarding at Mettupalayam Platform 1; first-class coach has cushioned bench seats.'
      },
      {
        id: 'tr-ooty-3',
        mode: 'cab',
        title: 'Bengaluru to Ooty Highway Private Cab / Self-Drive',
        route: 'Bangalore → Mysore → Bandipur Tiger Reserve → Masinagudi 36 Hairpin Ghat → Ooty (275 km)',
        duration: '6 hrs 15 mins',
        estimatedCost: 4800,
        frequency: 'Anytime (Bandipur Forest Gate open 06:00 AM – 09:00 PM)',
        bookingTip: 'Bandipur forest checkpoint closes strictly at 9 PM. Plan to enter Mysore by 4 PM.',
        bestForGroup: 'Friends Road Trips & Families',
        accessibilityNotes: 'Multiple clean rest plazas with wheelchair washrooms along Mysore Expressway.'
      },
      {
        id: 'tr-ooty-4',
        mode: 'bus',
        title: 'KSRTC / SETC Airavat Club Class Multi-Axle Volvo',
        route: 'Majestic / Shantinagar Bangalore → Ooty Central Bus Stand',
        duration: '7 hrs overnight',
        estimatedCost: 820,
        frequency: '8 daily departures (Overnight & Day)',
        bookingTip: 'Book KSRTC online for lower berths on the middle section to avoid ghat road motion sickness.',
        bestForGroup: 'Solo Explorers & Budget Backpackers'
      }
    ],
    passes: [
      {
        id: 'pass-ooty-1',
        title: 'Nilgiri Heritage Composite Botanical Pass',
        issuingAuthority: 'Horticulture Department, Government of Tamil Nadu',
        priceAdult: 110,
        priceSenior: 50,
        priceChild: 30,
        validityDuration: '3 Days',
        inclusions: [
          'Government Botanical Gardens (55 acres)',
          'Ooty Rose Garden (Over 20,000 rose varieties)',
          'Sim’s Park Botanical Gardens Coonoor',
          'Priority Electric Battery Cart entry'
        ],
        savingsDescription: 'Save 45% compared to purchasing individual counter tickets, plus skip 30-minute weekend queues.',
        officialBookingTip: 'Available online at tn horticulture portal or at the fast-track Tourist Information Counter at Charing Cross.',
        instantPassCode: 'VOYAN-TN-HORT-8832',
        concessionsAvailable: true
      },
      {
        id: 'pass-ooty-2',
        title: 'Pykara Eco-Tourism & Lake Boating Pass',
        issuingAuthority: 'Tamil Nadu Tourism Development Corporation (TTDC)',
        priceAdult: 380,
        priceSenior: 250,
        priceChild: 180,
        validityDuration: 'Single Day',
        inclusions: [
          'Pykara Lake Reservoir Entry',
          '20-Minute Motorboat or Speedboat Token',
          'Pykara Waterfall Viewpoint Trail',
          'Forest Department Eco-Conservation Permit'
        ],
        savingsDescription: 'Includes pre-booked time slot avoiding 1-hour wait times at boat booking counter.',
        officialBookingTip: 'Present QR token at TTDC Boat House dedicated online counter.',
        instantPassCode: 'VOYAN-TTDC-PYK-4109',
        concessionsAvailable: true
      },
      {
        id: 'pass-ooty-3',
        title: 'Tea Factory & Heritage Museum Tasting Pass',
        issuingAuthority: 'Dodabetta Tea Factory & Nilgiri Planters Guild',
        priceAdult: 50,
        priceSenior: 30,
        priceChild: 20,
        validityDuration: '1 Day',
        inclusions: [
          'Full CTC and Orthodox Tea Processing Tour',
          'Guided Green & White Tea Tasting with Sommelier',
          'Complimentary 100g Cardamom Infused Tea Pouch'
        ],
        savingsDescription: 'Special guided tasting and free tea souvenir pouch with official entry.',
        officialBookingTip: 'Open daily 09:00 AM to 06:30 PM. Wheelchair accessible ground floor tasting gallery.',
        instantPassCode: 'VOYAN-DOD-TEA-1982',
        concessionsAvailable: true
      }
    ]
  },
  'goa': {
    destinationId: 'goa',
    destinationName: 'Goa',
    dailySpendAverages: {
      budget: 2200,
      moderate: 4500,
      luxury: 12000
    },
    localCommuteRates: {
      privateCabPerKm: 22,
      autoBaseFare: 50,
      rentalScooterPerDay: 400,
      fuelPricePerLitre: 98.4
    },
    transitOptions: [
      {
        id: 'tr-goa-1',
        mode: 'flight',
        title: 'Fly to Goa MOPA (GOX) or Dabolim (GOI)',
        route: 'Direct domestic flights from Mumbai, Delhi, Bengaluru',
        duration: '1 hr 15 mins from Bengaluru / Mumbai',
        estimatedCost: 3200,
        frequency: '40+ flights daily',
        bookingTip: 'For South Goa (Palolem), Dabolim (GOI) is 1.5 hrs closer than North Goa MOPA.',
        bestForGroup: 'Families & Couples'
      },
      {
        id: 'tr-goa-2',
        mode: 'rental',
        title: 'Self-Drive Scooter / Open Thar Rental',
        route: 'Local coastal roads (Palolem, Agonda, Cabo de Rama)',
        duration: 'Flexible day rental',
        estimatedCost: 400,
        frequency: 'Pick up anywhere near beach shacks',
        bookingTip: 'Ensure helmet is provided and carry valid digital driving license.',
        bestForGroup: 'Solo Explorers & Couples'
      }
    ],
    passes: [
      {
        id: 'pass-goa-1',
        title: 'Goa Heritage & Coastal Discovery Pass',
        issuingAuthority: 'Goa Tourism Development Corporation (GTDC)',
        priceAdult: 250,
        priceSenior: 150,
        priceChild: 100,
        validityDuration: '4 Days',
        inclusions: [
          'Aguada Fort Museum & Light House Entry',
          'Fontainhas Latin Quarter Guided Walking Tour Token',
          'Cabo de Rama Fortress Eco-Pass'
        ],
        savingsDescription: 'Save 35% on coastal heritage site admissions.',
        officialBookingTip: 'Download GTDC official pass or display digital barcode at entry.',
        instantPassCode: 'VOYAN-GOA-GTDC-7741',
        concessionsAvailable: true
      }
    ]
  },
  'rajasthan': {
    destinationId: 'rajasthan',
    destinationName: 'Jaipur & Amer',
    dailySpendAverages: {
      budget: 1900,
      moderate: 4200,
      luxury: 9800
    },
    localCommuteRates: {
      privateCabPerKm: 16,
      autoBaseFare: 35,
      rentalScooterPerDay: 450,
      fuelPricePerLitre: 105.8
    },
    transitOptions: [
      {
        id: 'tr-jpr-1',
        mode: 'train',
        title: 'Vande Bharat Express (Delhi to Jaipur)',
        route: 'New Delhi (NDLS) → Jaipur Junction (JP)',
        duration: '3 hrs 45 mins',
        estimatedCost: 950,
        frequency: 'Daily morning & evening runs',
        bookingTip: 'Book Executive Chair Car (EC) for extra legroom, breakfast service, and senior comfort.',
        bestForGroup: 'Senior Citizens & Families'
      }
    ],
    passes: [
      {
        id: 'pass-jpr-1',
        title: 'Rajasthan Composite Monument Mega Pass',
        issuingAuthority: 'Archaeological Survey of India & Rajasthan Tourism',
        priceAdult: 400,
        priceSenior: 200,
        priceChild: 100,
        validityDuration: '2 Days',
        inclusions: [
          'Amber Fort Palace & Sheesh Mahal',
          'Hawa Mahal (Palace of Winds)',
          'Jantar Mantar UNESCO Astronomical Observatory',
          'Albert Hall State Museum',
          'Nahargarh Fort Panorama'
        ],
        savingsDescription: 'Save over 60% compared to purchasing separate entrance tickets across all five royal palaces.',
        officialBookingTip: 'Buy directly at the Amber Fort counter #1 or book on Rajasthan Archaeology portal.',
        instantPassCode: 'VOYAN-RAJ-COMP-5512',
        concessionsAvailable: true
      }
    ]
  }
};

export function getDestinationLogistics(destName: string): DestinationLogistics {
  const lower = destName.toLowerCase();
  if (lower.includes('goa')) return DESTINATIONS_LOGISTICS['goa'];
  if (lower.includes('jaipur') || lower.includes('rajasthan')) return DESTINATIONS_LOGISTICS['rajasthan'];
  if (lower.includes('ooty') || lower.includes('nilgiri')) return DESTINATIONS_LOGISTICS['ooty'];

  const arrivalHub = lower.includes('mahabalipuram') || lower.includes('mamallapuram')
    ? 'Chennai'
    : destName;
  return {
    destinationId: lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'destination',
    destinationName: destName,
    dailySpendAverages: {
      budget: 2200,
      moderate: 4200,
      luxury: 9000,
    },
    transitOptions: [
      {
        id: 'route-train',
        mode: 'train',
        title: `Train to ${arrivalHub}`,
        route: `Check rail routes to the nearest major station for ${destName}`,
        duration: 'Varies by origin',
        estimatedCost: 800,
        frequency: 'Check current schedules and seat availability',
        bookingTip: 'Indicative planning estimate only. Check IRCTC for current schedules, fares, and seats before booking.',
      },
      {
        id: 'route-bus',
        mode: 'bus',
        title: `Intercity bus to ${destName}`,
        route: `Check state transport and licensed operators serving ${destName}`,
        duration: 'Varies by origin',
        estimatedCost: 700,
        frequency: 'Check current operator schedules',
        bookingTip: 'Indicative planning estimate only. Verify operator, route, fare, and availability before booking.',
      },
      {
        id: 'route-cab',
        mode: 'cab',
        title: `Local transfer around ${destName}`,
        route: `Arrange local transport to and around ${destName}`,
        duration: 'Depends on route',
        estimatedCost: 1200,
        frequency: 'Confirm locally',
        bookingTip: 'Compare licensed providers and confirm the final fare directly with the provider.',
      },
    ],
    passes: [],
    localCommuteRates: {
      privateCabPerKm: 20,
      autoBaseFare: 50,
      rentalScooterPerDay: 700,
      fuelPricePerLitre: 103,
    },
  };
}
