export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  allocatedAmount: number;
  percentage: number;
  color: string;
  notes: string;
}

export interface TransitOption {
  id: string;
  mode: 'flight' | 'train' | 'cab' | 'bus' | 'rental';
  title: string;
  route: string;
  duration: string;
  estimatedCost: number;
  frequency: string;
  bookingTip: string;
  bestForGroup?: string;
  accessibilityNotes?: string;
}

export interface TourismPass {
  id: string;
  title: string;
  issuingAuthority: string;
  priceAdult: number;
  priceSenior?: number;
  priceChild?: number;
  validityDuration: string;
  inclusions: string[];
  savingsDescription: string;
  officialBookingTip: string;
  instantPassCode: string;
  concessionsAvailable: boolean;
}

export interface DestinationLogistics {
  destinationId: string;
  destinationName: string;
  dailySpendAverages: {
    budget: number;
    moderate: number;
    luxury: number;
  };
  transitOptions: TransitOption[];
  passes: TourismPass[];
  localCommuteRates: {
    privateCabPerKm: number;
    autoBaseFare: number;
    rentalScooterPerDay: number;
    fuelPricePerLitre: number;
  };
}
