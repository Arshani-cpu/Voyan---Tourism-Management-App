export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary?: boolean;
}

export interface EmergencyHelpline {
  number: string;
  label: string;
  subtitle: string;
  category: 'all_in_one' | 'police' | 'ambulance' | 'women' | 'tourist' | 'disaster';
  icon: string;
  badge?: string;
  available: string;
}

export interface EmergencyFacility {
  id: string;
  name: string;
  type: 'hospital' | 'police' | 'pharmacy' | 'ambulance';
  phone: string;
  address: string;
  distance: string;
  openHours: string;
  emergencySpecialty?: string;
  verified: boolean;
}

export interface FirstAidGuide {
  id: string;
  title: string;
  category: 'mountain' | 'heat' | 'bites' | 'trauma' | 'resuscitation';
  severity: 'critical' | 'urgent' | 'moderate';
  symptoms: string[];
  immediateSteps: string[];
  doNots: string[];
  whenToCallAmbulance: string;
}
