import { EmergencyHelpline, EmergencyFacility, FirstAidGuide } from '../types/emergency';

export const NATIONAL_HELPLINES: EmergencyHelpline[] = [
  {
    number: '112',
    label: 'National Emergency Service (All-in-One)',
    subtitle: 'Police, Fire, Ambulance & Mountain Rescue across India',
    category: 'all_in_one',
    icon: 'ShieldAlert',
    badge: 'PRIORITY 24/7',
    available: 'Toll-free / 24 Hours'
  },
  {
    number: '108',
    label: 'Emergency Medical & Ambulance (EMS)',
    subtitle: 'Immediate trauma ambulance dispatch with paramedic support',
    category: 'ambulance',
    icon: 'Ambulance',
    badge: 'RAPID RESPONSE',
    available: 'Toll-free / 24 Hours'
  },
  {
    number: '100',
    label: 'Police Emergency Dispatch',
    subtitle: 'Immediate law enforcement, safety escort & crowd distress',
    category: 'police',
    icon: 'BadgeAlert',
    available: 'Toll-free / 24 Hours'
  },
  {
    number: '1091',
    label: 'Women Safety & Distress Helpline',
    subtitle: 'Dedicated women & solo female traveler safety response cell',
    category: 'women',
    icon: 'HeartHandshake',
    badge: 'SOLO TRAVEL',
    available: 'Toll-free / 24 Hours'
  },
  {
    number: '1363',
    label: 'National Tourist Helpline',
    subtitle: 'Ministry of Tourism 24/7 multi-lingual guidance & safety aid',
    category: 'tourist',
    icon: 'Compass',
    available: 'English, Hindi & 10 Intl Languages'
  },
  {
    number: '1077',
    label: 'Disaster Management & Relief',
    subtitle: 'Landslide, flood, cloudburst & severe weather assistance',
    category: 'disaster',
    icon: 'AlertOctagon',
    available: 'State & District EOC / 24 Hours'
  }
];

export const DESTINATION_EMERGENCY_HUBS: Record<string, EmergencyFacility[]> = {
  'ooty': [
    {
      id: 'ooty-hosp-1',
      name: 'Government District Headquarter Hospital Ooty',
      type: 'hospital',
      phone: '+91 423 244 2212',
      address: 'Hospital Road, Upper Bazaar, Ooty, Tamil Nadu 643001',
      distance: '0.8 km from Charing Cross',
      openHours: '24/7 Emergency Casualty & Trauma',
      emergencySpecialty: '24-hour ICU, Anti-Venom Unit, High Altitude Hypothermia care',
      verified: true
    },
    {
      id: 'ooty-hosp-2',
      name: 'SM Hospital & Trauma Centre (Private)',
      type: 'hospital',
      phone: '+91 423 244 4455',
      address: 'Near Commercial Road, Ooty',
      distance: '1.2 km from Botanical Gardens',
      openHours: '24 Hours Emergency Service',
      emergencySpecialty: 'Surgical ICU, Orthopedic Fracture stabilization',
      verified: true
    },
    {
      id: 'ooty-pol-1',
      name: 'Ooty Town B1 Police Station',
      type: 'police',
      phone: '+91 423 244 2222',
      address: 'Court Road, Near Government Arts College, Ooty',
      distance: '0.6 km from Central Bus Stand',
      openHours: '24 Hours Open',
      emergencySpecialty: 'Nilgiri Ghat Road Patrol, Tourist Assistance Desk',
      verified: true
    },
    {
      id: 'ooty-pharm-1',
      name: 'Apollo Pharmacy 24x7 Emergency Branch',
      type: 'pharmacy',
      phone: '+91 423 244 7890',
      address: 'Commercial Road Junction, Ooty',
      distance: '0.4 km',
      openHours: '24/7 Open',
      emergencySpecialty: 'Inhalers, Altitude sickness medication, First aid supplies',
      verified: true
    }
  ],
  'goa': [
    {
      id: 'goa-hosp-1',
      name: 'Goa Medical College & Hospital (GMC)',
      type: 'hospital',
      phone: '+91 832 245 8700',
      address: 'NH 66, Bambolim, Goa 403202',
      distance: '5.4 km from Panaji Center',
      openHours: '24/7 Level 1 Trauma Center',
      emergencySpecialty: 'Super-specialty casualty, Marine sting treatment, ICU',
      verified: true
    },
    {
      id: 'goa-hosp-2',
      name: 'Manipal Hospital Dona Paula',
      type: 'hospital',
      phone: '+91 832 304 8800',
      address: 'Dona Paula, Panaji, Goa 403004',
      distance: '4.8 km from Miramar Beach',
      openHours: '24/7 Emergency Care',
      emergencySpecialty: 'Cardiac trauma, Advanced life support ambulance',
      verified: true
    },
    {
      id: 'goa-pol-1',
      name: 'Goa Tourist Police & Calangute Coastal Station',
      type: 'police',
      phone: '+91 832 227 8294',
      address: 'Calangute - Baga Road, North Goa',
      distance: '0.9 km from Baga Beach',
      openHours: '24 Hours Coastal Patrol',
      emergencySpecialty: 'Beach safety, Drishti Lifesaving rescue liaison',
      verified: true
    }
  ],
  'manali': [
    {
      id: 'manali-hosp-1',
      name: 'Civil Hospital Manali',
      type: 'hospital',
      phone: '+91 1902 252 240',
      address: 'Near Mall Road, Manali, Himachal Pradesh 175131',
      distance: '0.5 km from Mall Road',
      openHours: '24 Hours Casualty & Emergency',
      emergencySpecialty: 'High-Altitude Pulmonary Edema (HAPE) care, Oxygen cylinders',
      verified: true
    },
    {
      id: 'manali-pol-1',
      name: 'Manali Police Station & Mountain Rescue Cell',
      type: 'police',
      phone: '+91 1902 252 322',
      address: 'Near Bus Stand, Model Town, Manali',
      distance: '0.3 km',
      openHours: '24 Hours Mountain Helpline',
      emergencySpecialty: 'Atal Tunnel & Rohtang Pass highway emergency response',
      verified: true
    }
  ],
  'jaipur': [
    {
      id: 'jaipur-hosp-1',
      name: 'SMS Hospital & Apex Trauma Center',
      type: 'hospital',
      phone: '+91 141 251 8224',
      address: 'Jawahar Lal Nehru Marg, Jaipur, Rajasthan 302004',
      distance: '2.1 km from City Palace',
      openHours: '24 Hours Apex Trauma Center',
      emergencySpecialty: 'Largest government tertiary trauma facility in Rajasthan',
      verified: true
    },
    {
      id: 'jaipur-pol-1',
      name: 'Jaipur Tourist Police Station',
      type: 'police',
      phone: '+91 141 260 0306',
      address: 'Hawa Mahal Road, Badi Chaupar, Jaipur',
      distance: '0.4 km from Hawa Mahal',
      openHours: '24 Hours Dedicated Tourist Cell',
      emergencySpecialty: 'Multilingual visitor protection, luggage recovery',
      verified: true
    }
  ]
};

export function getEmergencyFacilitiesForDestination(destName: string): EmergencyFacility[] {
  const lower = destName.toLowerCase();
  for (const [key, facilities] of Object.entries(DESTINATION_EMERGENCY_HUBS)) {
    if (lower.includes(key)) {
      return facilities;
    }
  }

  // Smart fallback for other destinations
  return [
    {
      id: `gen-hosp-${destName}`,
      name: `${destName} District Civil & Emergency Hospital`,
      type: 'hospital',
      phone: '108',
      address: `Civil Lines & Hospital Enclave, ${destName}`,
      distance: '1.4 km from town center',
      openHours: '24/7 Emergency Casualty Unit',
      emergencySpecialty: 'General casualty, Trauma triage, 24-hr Ambulance base',
      verified: true
    },
    {
      id: `gen-police-${destName}`,
      name: `${destName} Central Police Station & Tourist Desk`,
      type: 'police',
      phone: '112',
      address: `Collectorate Road, ${destName}`,
      distance: '0.9 km from central hub',
      openHours: '24 Hours Open',
      emergencySpecialty: 'Emergency dispatch, Highway safety assistance',
      verified: true
    },
    {
      id: `gen-pharm-${destName}`,
      name: `City Meds 24-Hour Emergency Pharmacy`,
      type: 'pharmacy',
      phone: '+91 112',
      address: `Main Market Junction, ${destName}`,
      distance: '0.5 km',
      openHours: '24/7 Open',
      emergencySpecialty: 'Emergency antibiotics, Pain relief, Oral rehydration kits',
      verified: true
    }
  ];
}

export const OFFLINE_FIRST_AID_GUIDES: FirstAidGuide[] = [
  {
    id: 'guide-altitude',
    title: 'Acute Mountain Sickness (AMS) & Altitude Illness',
    category: 'mountain',
    severity: 'critical',
    symptoms: [
      'Severe throbbing headache not relieved by rest',
      'Persistent nausea, vomiting, or dizziness',
      'Loss of coordination (ataxia / walking like drunk)',
      'Breathlessness even while resting quietly'
    ],
    immediateSteps: [
      'STOP ASCENDING IMMEDIATELY. Never go higher with symptoms.',
      'Descend 300 to 1,000 meters if symptoms are moderate to severe.',
      'Administer supplemental oxygen if available (2-4 L/min).',
      'Keep the patient hydrated with warm electrolyte fluids, avoid alcohol or sedatives.',
      'If High Altitude Cerebral Edema (HACE) is suspected (confusion, disorientation), emergency evacuation is mandatory.'
    ],
    doNots: [
      'DO NOT allow the affected traveler to sleep unattended.',
      'DO NOT give sleeping pills (they depress breathing rate at altitude).',
      'DO NOT resume hiking uphill until completely symptom-free for 24 hours.'
    ],
    whenToCallAmbulance: 'Immediate evacuation required if confusion, coughing pink frothy sputum (HAPE), or inability to walk straight.'
  },
  {
    id: 'guide-heat',
    title: 'Heatstroke & Severe Dehydration',
    category: 'heat',
    severity: 'critical',
    symptoms: [
      'Body temperature over 103°F (39.4°C)',
      'Hot, red, dry or damp skin with NO sweating',
      'Rapid, strong pulse and throbbing headache',
      'Confusion, slurred speech, or loss of consciousness'
    ],
    immediateSteps: [
      'Move patient to shade or an air-conditioned cab/room immediately.',
      'Cool rapidly: apply cold, wet cloths or ice packs to neck, armpits, and groin.',
      'Fan vigorously while misting skin with cool water.',
      'Loosen or remove tight clothing.',
      'If conscious and alert, provide sips of cool water or Oral Rehydration Solution (ORS).'
    ],
    doNots: [
      'DO NOT give liquids if the person is semi-conscious or vomiting.',
      'DO NOT use an ice bath unattended or cause violent shivering.'
    ],
    whenToCallAmbulance: 'Call 108/112 immediately if the patient is unresponsive, convulsing, or vomiting repeatedly.'
  },
  {
    id: 'guide-bites',
    title: 'Snake Bite & Venomous Animal Stings',
    category: 'bites',
    severity: 'critical',
    symptoms: [
      'Visible fang puncture marks with rapid swelling & pain',
      'Dark discoloration or blistering around bite site',
      'Nausea, sweating, blurred vision, or drooping eyelids',
      'Difficulty breathing or swallowing'
    ],
    immediateSteps: [
      'Keep the victim calm and COMPLETELY STILL. Movement accelerates venom spread.',
      'Keep the bitten limb immobilized and positioned at or SLIGHTLY BELOW heart level.',
      'Remove tight rings, watches, or boots before swelling worsens.',
      'Gently wash the wound with clean water without rubbing aggressively.',
      'Transport immediately to the nearest hospital with Anti-Snake Venom (ASV).'
    ],
    doNots: [
      'DO NOT apply a tight tourniquet (cuts off arterial blood and leads to gangrene).',
      'DO NOT cut or slash the bite area with blades.',
      'DO NOT attempt to suck out venom with mouth or vacuum kits.',
      'DO NOT apply ice or electric shock.'
    ],
    whenToCallAmbulance: 'Call 112/108 immediately. Treat every snake bite in rural or forest areas as potentially venomous.'
  },
  {
    id: 'guide-fracture',
    title: 'Trail Sprains, Dislocation & Fractures',
    category: 'trauma',
    severity: 'urgent',
    symptoms: [
      'Sudden intense pain and inability to bear weight',
      'Rapid swelling, bruising, or unnatural angle/deformity',
      'Grating sensation upon attempted movement'
    ],
    immediateSteps: [
      'R.I.C.E protocol: Rest, Ice (or cold stream water in cloth), Compress, Elevate.',
      'Immobilize the joint using a rolled jacket, trekking pole, or sturdy tree branch as a splint.',
      'Pad the splint with soft clothing and tie above and below the injured joint.',
      'Keep the extremity elevated above hip level to decrease swelling.'
    ],
    doNots: [
      'DO NOT attempt to force or pop a dislocated bone back into place.',
      'DO NOT bandage so tightly that toes or fingers turn cold, pale, or numb.'
    ],
    whenToCallAmbulance: 'Call for rescue if bone penetrates skin (open fracture), or if traveler cannot walk on remote trail.'
  }
];
