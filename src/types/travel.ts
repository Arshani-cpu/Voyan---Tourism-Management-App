export type TravellerGroupType = 'solo' | 'couple' | 'friends' | 'family' | 'seniors';

export interface SeniorPreferences {
  walkingDifficulty: 'flat' | 'moderate' | 'active';
  accessibilityNeeds: string[];
  restBreakFrequency: 'frequent_45m' | 'standard_2h' | 'flexible';
  travelPace: 'gentle' | 'balanced';
  requireGroundFloorOrLift: boolean;
}

export interface FamilyPreferences {
  childrenAgeRanges: ('toddlers' | 'kids' | 'teens')[];
  familyFacilities: string[];
  preferredPace: 'relaxed' | 'moderate';
  kidFriendlyDining: boolean;
}

export interface FriendsPreferences {
  groupActivityType: string[];
  budgetStyle: 'budget' | 'balanced' | 'splurge';
  nightlifeInterest: boolean;
  adventureLevel: 'mild' | 'moderate' | 'high';
}

export interface CouplePreferences {
  romanticExperiences: string[];
  intimacyPace: 'slow_intimate' | 'exploratory';
  scenicDining: boolean;
}

export interface SoloPreferences {
  safetyPriority: 'very_high' | 'standard';
  soloStayType: 'boutique_homestay' | 'hostel_private' | 'heritage_hotel';
  groupMeetupInterest: boolean;
}

export interface GroupPlanningConfig {
  groupType: TravellerGroupType;
  travellersCount: number;
  durationDays: number;
  totalBudget: number;
  transportPreference: 'self_drive' | 'private_cab' | 'train' | 'flight';
  seniorPrefs?: SeniorPreferences;
  familyPrefs?: FamilyPreferences;
  friendsPrefs?: FriendsPreferences;
  couplePrefs?: CouplePreferences;
  soloPrefs?: SoloPreferences;
}

export interface NearbyAmenity {
  id: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'police' | 'fuel';
  distance: string; // e.g. "1.2 km"
  address: string;
  contactNumber?: string;
  rating?: number;
  pricePerNight?: number;
  avgCostForTwo?: number;
  tags: string[];
  verified: boolean;
  coordinates: { x: number; y: number };
  description?: string;
  operatingHours?: string;
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  category: 'sightseeing' | 'food' | 'nature' | 'heritage' | 'leisure';
  duration: string;
  costEstimate: number; // in INR
  locationName: string;
  coordinates: { x: number; y: number }; // normalized 0-100 for visual map placement
  tips?: string;
  groupSuitability?: {
    group: TravellerGroupType;
    reason: string;
    badgeText?: string;
    walkingLevel?: 'Minimal Flat' | 'Moderate' | 'Stairs Required';
  };
}

export interface RestaurantRecommendation {
  id: string;
  name: string;
  cuisine: string;
  priceLevel: '₹' | '₹₹' | '₹₹₹';
  avgCostForTwo: number;
  highlightDish: string;
  rating: number;
  location: string;
  groupFriendlyFor?: TravellerGroupType[];
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  dateStr?: string;
  theme: string;
  activities: Activity[];
  diningOptions: RestaurantRecommendation[];
}

export interface TripPlan {
  id: string;
  title: string;
  destination: string;
  state: string;
  durationDays: number;
  travelDates: {
    start: string;
    end: string;
  };
  travellersCount: number;
  budgetTotal: number; // in INR
  budgetPerPerson: number;
  interests: string[];
  coverImage: string;
  overviewSummary: string;
  groupType: TravellerGroupType;
  transportPreference: string;
  days: ItineraryDay[];
  createdAt: string;
  saved?: boolean;
}

export interface DestinationItem {
  id: string;
  name: string;
  state: string;
  region: 'South' | 'North' | 'West' | 'East' | 'Himalayas';
  category: 'Hills & Mountains' | 'Heritage & Royal' | 'Coastal & Beach' | 'Serene & Nature';
  tagline: string;
  startingPrice: number;
  recommendedDays: number;
  bestMonths: string;
  image: string;
  rating: number;
  reviewsCount: number;
  highlights: string[];
  defaultPrompt: string;
  placeCategories?: PlaceCategory[];
}

export type PlaceCategory =
  | 'Historical & Heritage'
  | 'Adventure & Outdoors'
  | 'Temples & Pilgrimage'
  | 'Amusement & Family'
  | 'Beaches & Islands'
  | 'Resorts & Wellness'
  | 'Nature & Wildlife'
  | 'Lakes & Waterfalls'
  | 'Culture & Festivals'
  | 'Food & Markets';
