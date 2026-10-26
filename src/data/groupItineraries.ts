import { TripPlan, TravellerGroupType, GroupPlanningConfig } from '../types/travel';
import { SAMPLE_TRIPS } from './sampleTrips';

export interface GroupCardInfo {
  id: TravellerGroupType;
  title: string;
  tagline: string;
  image: string;
  iconName: string;
  defaultTravellers: number;
  highlightPointers: string[];
}

export const GROUP_CARDS: GroupCardInfo[] = [
  {
    id: 'solo',
    title: 'Solo Explorer',
    tagline: 'Self-paced discovery, authentic local stays & safety-rated solo trails.',
    image: '/src/assets/images/group_solo_explorer_1792467958461.jpg',
    iconName: 'User',
    defaultTravellers: 1,
    highlightPointers: ['Independent itinerary rhythm', 'Safety-verified accommodations', 'Co-working friendly cafes']
  },
  {
    id: 'couple',
    title: 'Couple Getaway',
    tagline: 'Romantic sunsets, candlelit dining & boutique heritage hideaways.',
    image: '/src/assets/images/group_couple_getaway_1792467959773.jpg',
    iconName: 'Heart',
    defaultTravellers: 2,
    highlightPointers: ['Private scenic viewpoints', 'Candlelit dining & tea tastings', 'Boutique colonial suites']
  },
  {
    id: 'friends',
    title: 'Friends Trip',
    tagline: 'Group adventures, shared budget splitting, lively cafes & road trip routes.',
    image: '/src/assets/images/group_friends_trip_1792467961484.jpg',
    iconName: 'Users',
    defaultTravellers: 4,
    highlightPointers: ['Transparent per-person split', 'High-energy outdoor activities', 'Evening bonfires & music']
  },
  {
    id: 'family',
    title: 'Family Vacation',
    tagline: 'Kid-friendly pacing, spacious family suites & minimal transit fatigue.',
    image: '/src/assets/images/group_family_vacation_1792467961550.jpg',
    iconName: 'Sparkles',
    defaultTravellers: 4,
    highlightPointers: ['Stroller/kid-safe level trails', 'Family interconnected rooms', 'Low-fatigue transit spacing']
  },
  {
    id: 'seniors',
    title: 'Senior Citizens',
    tagline: 'Unhurried itineraries, verified walking levels, elevator access & resting benches.',
    image: '/src/assets/images/group_senior_citizens_1792467960348.jpg',
    iconName: 'ShieldCheck',
    defaultTravellers: 2,
    highlightPointers: ['Paved level pathways with carts', 'Rest breaks every 45–60 mins', 'Medical & hospital proximity']
  }
];

export function generateGroupTailoredPlan(config: GroupPlanningConfig & { destination?: string; query?: string }): TripPlan {
  const dest = config.destination || 'Ooty & Nilgiris';
  const group = config.groupType;

  // Build tailored activities based on the group
  if (group === 'seniors') {
    return {
      id: `plan-seniors-${Date.now()}`,
      title: 'Gentle Nilgiri Flora & Colonial Heritage Tour',
      destination: dest,
      state: 'Tamil Nadu',
      durationDays: config.durationDays || 3,
      travelDates: {
        start: 'Fri, 24 Oct 2026',
        end: 'Sun, 26 Oct 2026'
      },
      travellersCount: config.travellersCount || 2,
      budgetTotal: config.totalBudget || 14000,
      budgetPerPerson: Math.round((config.totalBudget || 14000) / (config.travellersCount || 2)),
      interests: ['Paved Garden Walks', 'Colonial Tea Tasting', 'Heritage Toy Train (First Class)'],
      coverImage: '/src/assets/images/dest_ooty_hills_1792467058609.jpg',
      groupType: 'seniors',
      transportPreference: 'Private AC Chauffeur Cab (Door-to-door)',
      overviewSummary: 'Thoughtfully paced for seniors with leisurely 10:00 AM starts, paved level walkways, electric cart shuttle assistance, and rest stops after every 45 minutes.',
      createdAt: '2026-10-19',
      saved: true,
      days: [
        {
          dayNumber: 1,
          title: 'Gentle Arrival & Century-Old Botanical Promenade',
          theme: 'Level Flora Walk & Colonial High Tea',
          activities: [
            {
              id: 'sen-1-1',
              time: '10:30 AM',
              title: 'Check-in at Savoy IHCL SeleQtions',
              description: 'Ground floor heritage garden cottage with step-free private veranda, on-call doctor, and fireplace heater.',
              category: 'leisure',
              duration: '1.5 hrs',
              costEstimate: 4200,
              locationName: 'Sylks Road',
              coordinates: { x: 35, y: 48 },
              tips: 'Porter handles all luggage directly to room; wheelchair available at reception on request.',
              groupSuitability: {
                group: 'seniors',
                reason: 'Verified ground-floor room with grab rails in bathroom, gentle ramps, and tranquil private garden.',
                badgeText: 'Verified Accessible Stays',
                walkingLevel: 'Minimal Flat'
              }
            },
            {
              id: 'sen-1-2',
              time: '02:00 PM',
              title: 'Battery-Cart Guided Tour of Ooty Botanical Gardens',
              description: 'Board the municipal eco-friendly battery cart gliding along paved tarmac flower beds, glasshouses, and the ancient fossil tree.',
              category: 'nature',
              duration: '1.5 hrs',
              costEstimate: 120,
              locationName: 'Botanical Garden Main Gate',
              coordinates: { x: 48, y: 35 },
              tips: 'Benches with backrests available every 40 meters along the lower lawn.',
              groupSuitability: {
                group: 'seniors',
                reason: 'Zero steep climbing: 100% paved main pathway with battery shuttle option avoiding uphill walking.',
                badgeText: 'Level Path & Cart Shuttle',
                walkingLevel: 'Minimal Flat'
              }
            },
            {
              id: 'sen-1-3',
              time: '04:30 PM',
              title: 'Colonial High Tea & Handcrafted Biscuit Tasting',
              description: 'Relax over warm Nilgiri single-estate Orange Pekoe tea and freshly baked varkey biscuits at a cozy conservatory.',
              category: 'food',
              duration: '1.25 hrs',
              costEstimate: 350,
              locationName: 'Commissioner’s Road',
              coordinates: { x: 42, y: 44 },
              tips: 'Heated indoor seating with comfortable armchair support.',
              groupSuitability: {
                group: 'seniors',
                reason: 'Unhurried rest stop allowing travel party to converse and recharge before early dusk.',
                badgeText: 'Comfort Rest Stop',
                walkingLevel: 'Minimal Flat'
              }
            }
          ],
          diningOptions: [
            {
              id: 'rest-sen-1',
              name: 'Hotel Nahar Chandrakala (Pure Vegetarian)',
              cuisine: 'South Indian & North Indian Vegetarian',
              priceLevel: '₹',
              avgCostForTwo: 450,
              highlightDish: 'Soft Steamed Idli, Ghee Pongal & Filter Coffee',
              rating: 4.7,
              location: 'Charing Cross Road',
              groupFriendlyFor: ['seniors', 'family']
            }
          ]
        },
        {
          dayNumber: 2,
          title: 'First-Class Heritage Toy Train to Coonoor & Tea Lounge',
          theme: 'Scenic Rail Vistas without Walking Fatigue',
          activities: [
            {
              id: 'sen-2-1',
              time: '10:00 AM',
              title: 'Nilgiri Mountain Railway (First Class Reserved)',
              description: 'Pre-reserved padded seats on the UNESCO steam toy train with panoramic window views of cascading gorges.',
              category: 'heritage',
              duration: '1 hr 15 mins',
              costEstimate: 200,
              locationName: 'Ooty Railway Station Platform 1',
              coordinates: { x: 33, y: 44 },
              tips: 'Platform 1 has level direct road access with no overhead pedestrian bridge required.',
              groupSuitability: {
                group: 'seniors',
                reason: 'Panoramic mountain vistas enjoyed comfortably from cushioned window seats with zero physical exertion.',
                badgeText: 'Comfort Sightseeing',
                walkingLevel: 'Minimal Flat'
              }
            },
            {
              id: 'sen-2-2',
              time: '12:30 PM',
              title: 'Highfield Tea Estate Lounge & Factory Walkway',
              description: 'Experience an aroma-filled tea processing demonstration with step-free wooden walkways and private tasting.',
              category: 'nature',
              duration: '1.25 hrs',
              costEstimate: 100,
              locationName: 'Coonoor Tea Estate',
              coordinates: { x: 74, y: 78 },
              tips: 'Ramps provided at entrance; seating provided throughout the tasting gallery.',
              groupSuitability: {
                group: 'seniors',
                reason: 'Flat wooden ramped gallery with dedicated seated presentation area.',
                badgeText: 'Ramped Gallery Access',
                walkingLevel: 'Minimal Flat'
              }
            }
          ],
          diningOptions: [
            {
              id: 'rest-sen-2',
              name: 'Café Diem Conservatory',
              cuisine: 'Gentle French-Nilgiri Soups & Breads',
              priceLevel: '₹₹',
              avgCostForTwo: 650,
              highlightDish: 'Roasted Pumpkin Soup & Herbal Tisanes',
              rating: 4.8,
              location: 'Kotagiri Road, Coonoor',
              groupFriendlyFor: ['seniors', 'couple']
            }
          ]
        }
      ]
    };
  }

  if (group === 'family') {
    return {
      id: `plan-family-${Date.now()}`,
      title: 'Family Adventure & Tea Valley Discovery',
      destination: dest,
      state: 'Tamil Nadu',
      durationDays: config.durationDays || 3,
      travelDates: {
        start: 'Fri, 24 Oct 2026',
        end: 'Sun, 26 Oct 2026'
      },
      travellersCount: config.travellersCount || 4,
      budgetTotal: config.totalBudget || 16000,
      budgetPerPerson: Math.round((config.totalBudget || 16000) / (config.travellersCount || 4)),
      interests: ['Kid-Friendly Parks', 'Boating & Train Rides', 'Chocolate Factory Tour'],
      coverImage: '/src/assets/images/dest_ooty_hills_1792467058609.jpg',
      groupType: 'family',
      transportPreference: 'Private Cab with Baby Seat Option',
      overviewSummary: 'Designed for multi-generational families with fun interactive stops for kids, spacious gardens, chocolate tastings, and comfortable pacing.',
      createdAt: '2026-10-19',
      saved: true,
      days: [
        {
          dayNumber: 1,
          title: 'Toy Train Joyride, Botanical Park & Chocolate Tour',
          theme: 'Fun & Wonder for All Ages',
          activities: [
            {
              id: 'fam-1-1',
              time: '09:30 AM',
              title: 'Check-in at Sterling Fern Hill Family Suite',
              description: 'Interconnected family suite with play lawns, indoor kids clubhouse, and buffet dining.',
              category: 'leisure',
              duration: '1.5 hrs',
              costEstimate: 4500,
              locationName: 'Fern Hill Post',
              coordinates: { x: 25, y: 65 },
              tips: 'Board games and hot chocolate complimentary in the lobby.',
              groupSuitability: {
                group: 'family',
                reason: 'Children’s indoor clubhouse, wide running lawns, and spacious suites accommodating 4 travellers.',
                badgeText: 'Family Suite & Play Zone',
                walkingLevel: 'Minimal Flat'
              }
            },
            {
              id: 'fam-1-2',
              time: '11:30 AM',
              title: 'Nilgiri Toy Train Joyride (Ooty to Lovedale)',
              description: 'A 25-minute nostalgic heritage train joyride through pine forests that kids adore, without exhaustion.',
              category: 'heritage',
              duration: '1 hr',
              costEstimate: 160,
              locationName: 'Ooty Railway Station',
              coordinates: { x: 33, y: 44 },
              tips: 'Bring toy train books for children to collect stamp souvenirs from the station master.',
              groupSuitability: {
                group: 'family',
                reason: 'Short 25-minute duration keeps children excited without transit restlessness.',
                badgeText: 'Child Friendly Duration',
                walkingLevel: 'Minimal Flat'
              }
            },
            {
              id: 'fam-1-3',
              time: '03:30 PM',
              title: 'Handmade Nilgiri Chocolate Factory & Sampling Workshop',
              description: 'Watch live liquid dark and milk chocolate pouring, hazelnut roasting, and sample freshly made cocoa treats.',
              category: 'food',
              duration: '1.5 hrs',
              costEstimate: 300,
              locationName: 'Ooty Chocolate Factory, Commercial Road',
              coordinates: { x: 50, y: 48 },
              tips: 'Kids receive a mini chocolate mold souvenir to take home.',
              groupSuitability: {
                group: 'family',
                reason: 'Highly engaging interactive food experience that delights kids and adults alike.',
                badgeText: 'Interactive for Kids',
                walkingLevel: 'Minimal Flat'
              }
            }
          ],
          diningOptions: [
            {
              id: 'rest-fam-1',
              name: 'Shinkow’s Chinese Family Diner',
              cuisine: 'Mild Indo-Chinese & Steamed Dim Sums',
              priceLevel: '₹₹',
              avgCostForTwo: 600,
              highlightDish: 'Sweet Corn Soup, Veg Spring Rolls & Butter Noodles',
              rating: 4.6,
              location: 'Commissioner’s Road',
              groupFriendlyFor: ['family', 'friends']
            }
          ]
        }
      ]
    };
  }

  if (group === 'friends') {
    return {
      id: `plan-friends-${Date.now()}`,
      title: 'Nilgiri Road Trip, Trekking & Lakeside Chill',
      destination: dest,
      state: 'Tamil Nadu',
      durationDays: config.durationDays || 3,
      travelDates: {
        start: 'Fri, 24 Oct 2026',
        end: 'Sun, 26 Oct 2026'
      },
      travellersCount: config.travellersCount || 4,
      budgetTotal: config.totalBudget || 18000,
      budgetPerPerson: Math.round((config.totalBudget || 18000) / (config.travellersCount || 4)),
      interests: ['High Speedboating', 'Pine Forest Hikes', 'Bonfire Evenings', 'Cafe Hopping'],
      coverImage: '/src/assets/images/dest_ooty_hills_1792467058609.jpg',
      groupType: 'friends',
      transportPreference: 'Self-Drive SUV or Shared Private Van',
      overviewSummary: 'High-energy road trip featuring shared costs, speedboating on Pykara reservoir, pine forest photo hikes, and bonfire cafe nights.',
      createdAt: '2026-10-19',
      saved: true,
      days: [
        {
          dayNumber: 1,
          title: 'Pykara Speedboat Thrills & Pine Forest Campfire',
          theme: 'Adventure & Group Bonding',
          activities: [
            {
              id: 'fr-1-1',
              time: '09:00 AM',
              title: 'Check-in at Zostel Ooty Hillside Cottage',
              description: '4-bed private chalet with balcony overlooking tea terraces, common gaming room, and evening bonfire pit.',
              category: 'leisure',
              duration: '1.5 hrs',
              costEstimate: 2800,
              locationName: 'Fernhill Road',
              coordinates: { x: 32, y: 58 },
              tips: 'Split easily across 4 friends with transparent per-person rates.',
              groupSuitability: {
                group: 'friends',
                reason: 'Group chalet with social bonfire pit and acoustic guitar lounge for late night talks.',
                badgeText: 'Social Group Stay',
                walkingLevel: 'Moderate'
              }
            },
            {
              id: 'fr-1-2',
              time: '12:00 PM',
              title: '6-Seater High-Speed Boat on Pykara Reservoir',
              description: 'Charter a private speedboat cutting through wild mountain waters with spray and thrilling turns.',
              category: 'nature',
              duration: '2 hrs',
              costEstimate: 950,
              locationName: 'Pykara Lake Boathouse',
              coordinates: { x: 14, y: 18 },
              tips: 'Wear life jackets and keep phones strapped securely during speed turns.',
              groupSuitability: {
                group: 'friends',
                reason: 'High-adrenaline shared group experience with instant cost-splitting.',
                badgeText: 'High Energy Group Activity',
                walkingLevel: 'Moderate'
              }
            },
            {
              id: 'fr-1-3',
              time: '04:30 PM',
              title: 'Shooting Point Pine Forest Hike & Golden Hour Photos',
              description: 'Trek up the pine-studded slope of Wenlock Downs for panoramic group photos against the setting sun.',
              category: 'nature',
              duration: '2 hrs',
              costEstimate: 60,
              locationName: 'Wenlock Downs 9th Mile',
              coordinates: { x: 22, y: 28 },
              tips: 'Carry frisbees or football for the wide rolling grassy meadows.',
              groupSuitability: {
                group: 'friends',
                reason: 'Spacious rolling meadow ideal for group games and photography.',
                badgeText: 'Scenic Group Trek',
                walkingLevel: 'Moderate'
              }
            }
          ],
          diningOptions: [
            {
              id: 'rest-fr-1',
              name: 'Willy’s Coffee Pub & Bakery',
              cuisine: 'Artisanal Pizzas, Burgers & Nilgiri Dark Roast',
              priceLevel: '₹',
              avgCostForTwo: 500,
              highlightDish: 'Woodfired Mushroom Pizza & Cold Brews',
              rating: 4.8,
              location: 'Kandal, Ooty',
              groupFriendlyFor: ['friends', 'solo']
            }
          ]
        }
      ]
    };
  }

  if (group === 'couple') {
    return {
      id: `plan-couple-${Date.now()}`,
      title: 'Romantic Nilgiri Mountain Retreat for Two',
      destination: dest,
      state: 'Tamil Nadu',
      durationDays: config.durationDays || 3,
      travelDates: {
        start: 'Fri, 24 Oct 2026',
        end: 'Sun, 26 Oct 2026'
      },
      travellersCount: 2,
      budgetTotal: config.totalBudget || 15000,
      budgetPerPerson: Math.round((config.totalBudget || 15000) / 2),
      interests: ['Candlelight Dining', 'Private Shikara/Pedal Boat', 'Sunset Viewpoints'],
      coverImage: '/src/assets/images/dest_ooty_hills_1792467058609.jpg',
      groupType: 'couple',
      transportPreference: 'Private Dedicated Cab',
      overviewSummary: 'Curated intimate getaway featuring colonial heritage stays with private fireplaces, candlelit glasshouse dining, and tranquil sunset walks.',
      createdAt: '2026-10-19',
      saved: true,
      days: [
        {
          dayNumber: 1,
          title: 'Candlelight Dinner & Twilight Boat for Two',
          theme: 'Intimate Mountain Romance',
          activities: [
            {
              id: 'cp-1-1',
              time: '02:00 PM',
              title: 'Check-in at King’s Cliff Heritage Suite',
              description: 'Romantic colonial bedroom with wooden four-poster bed, antique fireplace, and view of Nilgiri pines.',
              category: 'leisure',
              duration: '1.5 hrs',
              costEstimate: 5200,
              locationName: 'Havelock Road',
              coordinates: { x: 42, y: 38 },
              tips: 'Request fireplace lighting at 7:00 PM.',
              groupSuitability: {
                group: 'couple',
                reason: 'Secluded romantic heritage ambiance with private fireplace and complimentary wine & cookies.',
                badgeText: 'Romantic Heritage Suite',
                walkingLevel: 'Minimal Flat'
              }
            },
            {
              id: 'cp-1-2',
              time: '04:30 PM',
              title: 'Private Sunset Pedal Boating on Ooty Lake',
              description: 'Glide peacefully across the water as the dusk colors reflect off the eucalyptus shoreline.',
              category: 'nature',
              duration: '1 hr',
              costEstimate: 260,
              locationName: 'Ooty Boathouse Private Jetty',
              coordinates: { x: 28, y: 62 },
              tips: 'Take a two-seater boat towards the secluded southern cove.',
              groupSuitability: {
                group: 'couple',
                reason: 'Quiet personal experience on calm water away from crowds.',
                badgeText: 'Intimate Sunset Experience',
                walkingLevel: 'Minimal Flat'
              }
            },
            {
              id: 'cp-1-3',
              time: '07:30 PM',
              title: 'Candlelit Glasshouse Dinner at Earl’s Secret',
              description: 'Fine Anglo-Indian dining under glass conservatory surrounded by moonlit pine trees and acoustic melodies.',
              category: 'food',
              duration: '2 hrs',
              costEstimate: 1400,
              locationName: 'King’s Cliff Lawn',
              coordinates: { x: 42, y: 38 },
              tips: 'Book table #4 beside the bay window.',
              groupSuitability: {
                group: 'couple',
                reason: 'Voted top romantic dinner destination in Nilgiris with private candle setup.',
                badgeText: 'Candlelight Setting',
                walkingLevel: 'Minimal Flat'
              }
            }
          ],
          diningOptions: [
            {
              id: 'rest-cp-1',
              name: 'Earl’s Secret Glasshouse',
              cuisine: 'Anglo-Indian & Continental Roast',
              priceLevel: '₹₹₹',
              avgCostForTwo: 1400,
              highlightDish: 'Mushroom Strudel & Herb-Roasted Chicken',
              rating: 4.9,
              location: 'Havelock Road',
              groupFriendlyFor: ['couple']
            }
          ]
        }
      ]
    };
  }

  // Default to Solo Explorer
  return {
    id: `plan-solo-${Date.now()}`,
    title: 'Mindful Solo Discovery & Tea Estate Trails',
    destination: dest,
    state: 'Tamil Nadu',
    durationDays: config.durationDays || 3,
    travelDates: {
      start: 'Fri, 24 Oct 2026',
      end: 'Sun, 26 Oct 2026'
    },
    travellersCount: 1,
    budgetTotal: config.totalBudget || 4800,
    budgetPerPerson: config.totalBudget || 4800,
    interests: ['Solo Nature Trails', 'Social Tea Tastings', 'Peaceful Photography'],
    coverImage: '/src/assets/images/dest_ooty_hills_1792467058609.jpg',
    groupType: 'solo',
    transportPreference: 'Local Shared Cabs & Heritage Rail',
    overviewSummary: 'Crafted for independent explorers seeking safety-verified accommodations, quiet photography viewpoints, and authentic community connections.',
    createdAt: '2026-10-19',
    saved: true,
    days: [
      {
        dayNumber: 1,
        title: 'Arrival & Independent Tea Trail Walk',
        theme: 'Quiet Mountain Solitude & Safety',
        activities: [
          {
            id: 'so-1-1',
            time: '10:00 AM',
            title: 'Check-in at Safety-Verified Homestay',
            description: 'Cozy private room with 24/7 front desk, verified women-safety certifications, and communal garden.',
            category: 'leisure',
            duration: '1.5 hrs',
            costEstimate: 1600,
            locationName: 'Fernhill Road',
            coordinates: { x: 38, y: 55 },
            tips: 'Host provides detailed local transit map and emergency contact cards.',
            groupSuitability: {
              group: 'solo',
              reason: 'Safety-verified property with 24/7 staff, well-lit street access, and community lounge.',
              badgeText: 'Verified Solo Safe',
              walkingLevel: 'Minimal Flat'
            }
          },
          {
            id: 'so-1-2',
            time: '01:30 PM',
            title: 'Solo Tea Tasting & Estate History at Highfield',
            description: 'Join a small communal tasting circle to learn tea tasting notes and converse with local estate managers.',
            category: 'nature',
            duration: '2 hrs',
            costEstimate: 120,
            locationName: 'Coonoor Road',
            coordinates: { x: 74, y: 78 },
            tips: 'Great opportunity to meet other mindful solo travelers.',
            groupSuitability: {
              group: 'solo',
              reason: 'Warm social setting where solo explorers can easily interact without feeling out of place.',
              badgeText: 'Social Friendly',
              walkingLevel: 'Moderate'
            }
          }
        ],
        diningOptions: [
          {
            id: 'rest-so-1',
            name: 'Willy’s Coffee Pub',
            cuisine: 'Nilgiri Coffee & Single Origin Espresso',
            priceLevel: '₹',
            avgCostForTwo: 350,
            highlightDish: 'Cold Brew & Cinnamon Pastry',
            rating: 4.8,
            location: 'Kandal, Ooty',
            groupFriendlyFor: ['solo']
          }
        ]
      }
    ]
  };
}
