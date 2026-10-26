import { TravellerGroupType } from './travel';

export type DestinationClimate = 'tropical' | 'cold_snow' | 'monsoon' | 'desert_arid' | 'mild_hills';

export type TripType = 'adventure' | 'luxury' | 'beach' | 'cultural' | 'business' | 'spiritual';

export type PackingCategory =
  | 'clothing'
  | 'toiletries'
  | 'electronics'
  | 'documents'
  | 'medical'
  | 'activity_gear'
  | 'group_essentials';

export interface PackingItem {
  id: string;
  name: string;
  category: PackingCategory;
  quantity: number | string;
  packed: boolean;
  isEssential: boolean;
  weightGrams?: number;
  tip?: string;
  climateSpecific?: DestinationClimate[];
  tripTypeSpecific?: TripType[];
}

export interface ClimateInfo {
  id: DestinationClimate;
  name: string;
  label: string;
  tempRange: string;
  icon: string;
  description: string;
  advisory: string;
  luggageRecommendation: string;
  primaryColor: string;
}

export interface TripTypeInfo {
  id: TripType;
  name: string;
  tagline: string;
  icon: string;
  highlightItems: string[];
}

export interface PackingListPreset {
  id: string;
  title: string;
  destination: string;
  climate: DestinationClimate;
  tripType: TripType;
  days: number;
  groupType: TravellerGroupType;
  description: string;
}
