import {
  DestinationClimate,
  TripType,
  PackingCategory,
  PackingItem,
  ClimateInfo,
  TripTypeInfo,
  PackingListPreset,
} from '../types/packing';
import { TravellerGroupType } from '../types/travel';

export const CLIMATE_DETAILS: Record<DestinationClimate, ClimateInfo> = {
  tropical: {
    id: 'tropical',
    name: 'Tropical & Beach',
    label: 'Warm & Humid (28°C - 35°C)',
    tempRange: '28°C – 35°C',
    icon: 'Palmtree',
    description: 'Hot sun, high humidity, and coastal sea breezes. Lightweight breathable fabrics and UV shield are critical.',
    advisory: 'High UV index & sweating expected. Carry reef-safe sunscreen SPF 50+, hydration electrolytes, and mosquito repelling wipes.',
    luggageRecommendation: 'Lightweight Cabin Trolley (under 8-10 kg) with ventilated footwear compartments.',
    primaryColor: 'amber',
  },
  cold_snow: {
    id: 'cold_snow',
    name: 'Cold, Sub-Zero & Snow',
    label: 'Freezing (-4°C - 10°C)',
    tempRange: '-4°C – 10°C',
    icon: 'Snowflake',
    description: 'Biting mountain winds, frost, and potential snowfall. 3-layer insulation system is mandatory.',
    advisory: 'Wind chill is harsh. Ensure thermal innerwear (merino/polypropylene), insulated water-resistant outer jacket, and touch-screen gloves.',
    luggageRecommendation: 'Expandable Check-in Luggage (15-20 kg) to accommodate heavy outerwear and fleece layers.',
    primaryColor: 'sky',
  },
  monsoon: {
    id: 'monsoon',
    name: 'Monsoon & Wet Season',
    label: 'Rainy & Lush (21°C - 27°C)',
    tempRange: '21°C – 27°C',
    icon: 'CloudRain',
    description: 'Sudden tropical downpours, mist, and high moisture. Waterproof protection for gadgets and documents is vital.',
    advisory: 'Slippery trails & high humidity. Pack anti-fungal foot powder, quick-dry synthetic clothing, silica gel for camera bags, and dry sacks.',
    luggageRecommendation: 'Waterproof Duffle or Rain-Covered Backpack with sealed internal ziploc pouches.',
    primaryColor: 'indigo',
  },
  desert_arid: {
    id: 'desert_arid',
    name: 'Desert & Arid',
    label: 'Dry Heat & Chilly Nights (12°C - 38°C)',
    tempRange: '12°C – 38°C',
    icon: 'Sun',
    description: 'Extreme diurnal temperature swings. Scorching dry daytime sun dropping to crisp, chilly desert nights.',
    advisory: 'Dust & dry air. Carry polarized sunglasses, broad-brim safari hat, saline nasal spray, intensive moisturizer, and a warm evening shawl.',
    luggageRecommendation: 'Dust-sealed hard-shell luggage with high-grade roller wheels for sand/stone terrain.',
    primaryColor: 'orange',
  },
  mild_hills: {
    id: 'mild_hills',
    name: 'Mild & Hill Station',
    label: 'Crisp Mountain Breeze (11°C - 21°C)',
    tempRange: '11°C – 21°C',
    icon: 'Mountain',
    description: 'Pleasant daytime walking conditions with cool misty evenings and sudden mountain showers.',
    advisory: 'Evening temperatures dip quickly. Bring versatile cardigans, light windcheaters, comfortable walking sneakers, and anti-fog lens wipes.',
    luggageRecommendation: 'Medium Weekender bag (10-12 kg) with easy-access exterior jacket pouch.',
    primaryColor: 'emerald',
  },
};

export const TRIP_TYPES: Record<TripType, TripTypeInfo> = {
  adventure: {
    id: 'adventure',
    name: 'Adventure & Trekking',
    tagline: 'High mobility, trail ruggedness, hydration & safety gear',
    icon: 'Compass',
    highlightItems: ['Trekking poles', 'Blister prevention tape', '20,000mAh rugged power bank', 'Headlamp', 'Hydration pack'],
  },
  luxury: {
    id: 'luxury',
    name: 'Luxury & Resort',
    tagline: 'Fine dining attire, spa lounging, wrinkle-free evening wear',
    icon: 'Sparkles',
    highlightItems: ['Evening blazer/cocktail wear', 'Wrinkle release spray', 'Silk sleep mask', 'Fragrance decanter', 'Leather dress shoes'],
  },
  beach: {
    id: 'beach',
    name: 'Beach & Coastal',
    tagline: 'Swimwear, sun protection, reef-safe lotions & dry sacks',
    icon: 'Waves',
    highlightItems: ['UV rash guard / swimwear', 'Reef-safe sunscreen SPF50+', 'Waterproof phone dry-bag', 'Microfiber beach towel', 'Polarized shades'],
  },
  cultural: {
    id: 'cultural',
    name: 'Cultural & Heritage',
    tagline: 'Temple-appropriate modest attire, slip-on shoes & cameras',
    icon: 'Landmark',
    highlightItems: ['Modest shoulder/knee shawls', 'Easy slip-on walking shoes', 'Shoe carry bag for shrines', 'Compact travel tripod', 'Audio guide earphones'],
  },
  business: {
    id: 'business',
    name: 'Business & Bleisure',
    tagline: 'Wrinkle-resistant workwear, laptop tech & portable office gear',
    icon: 'Briefcase',
    highlightItems: ['Wrinkle-free formal shirts', 'Universal laptop adapter & HDMI', 'Noise-canceling headset', 'Travel garment steamer', 'Portfolio notebook'],
  },
  spiritual: {
    id: 'spiritual',
    name: 'Spiritual & Wellness',
    tagline: 'Meditation whites, yoga wear, herbal care & mindfulness tools',
    icon: 'Heart',
    highlightItems: ['White/earth-tone breathable cottons', 'Travel yoga/meditation mat', 'Copper water flask', 'Herbal insect balm', 'Gratitude journal'],
  },
};

export const PACKING_PRESETS: PackingListPreset[] = [
  {
    id: 'preset-ooty',
    title: 'Ooty & Nilgiri Hills (3 Days)',
    destination: 'Ooty, Tamil Nadu',
    climate: 'mild_hills',
    tripType: 'luxury',
    days: 3,
    groupType: 'seniors',
    description: 'Scenic tea gardens, heritage toy train ride, and cool misty botanical walks for 2 travelers.',
  },
  {
    id: 'preset-goa',
    title: 'Goa Coastal Getaway (5 Days)',
    destination: 'North & South Goa',
    climate: 'tropical',
    tripType: 'beach',
    days: 5,
    groupType: 'friends',
    description: 'Beach shacks, water sports, sunset cruises, and vibrant evening nightlife.',
  },
  {
    id: 'preset-manali',
    title: 'Manali & Solang Snow Trek (6 Days)',
    destination: 'Manali, Himachal Pradesh',
    climate: 'cold_snow',
    tripType: 'adventure',
    days: 6,
    groupType: 'friends',
    description: 'High-altitude snow viewpoints, pine forests, valley trekking, and cozy mountain cafes.',
  },
  {
    id: 'preset-rajasthan',
    title: 'Jaipur & Udaipur Royal Tour (4 Days)',
    destination: 'Rajasthan Forts & Palaces',
    climate: 'desert_arid',
    tripType: 'cultural',
    days: 4,
    groupType: 'family',
    description: 'Grand royal forts, heritage palace hotels, desert evenings, and traditional bazaar shopping.',
  },
  {
    id: 'preset-rishikesh',
    title: 'Rishikesh Yoga & River (3 Days)',
    destination: 'Rishikesh, Uttarakhand',
    climate: 'mild_hills',
    tripType: 'spiritual',
    days: 3,
    groupType: 'solo',
    description: 'Ganga Aarti, yoga ashrams, mountain meditation, and gentle white-water rafting.',
  },
  {
    id: 'preset-kerala',
    title: 'Munnar & Alleppey Backwaters (4 Days)',
    destination: 'Kerala',
    climate: 'tropical',
    tripType: 'luxury',
    days: 4,
    groupType: 'couple',
    description: 'Spice garden estates, luxury houseboat stays, and tranquil lagoons.',
  },
];

export const CATEGORY_LABELS: Record<PackingCategory, { label: string; icon: string }> = {
  clothing: { label: 'Clothing & Footwear', icon: 'Shirt' },
  toiletries: { label: 'Toiletries & Personal Care', icon: 'Sparkles' },
  electronics: { label: 'Electronics & Tech Gear', icon: 'Zap' },
  documents: { label: 'Passports, IDs & Tickets', icon: 'FileText' },
  medical: { label: 'First Aid & Health', icon: 'HeartPulse' },
  activity_gear: { label: 'Trip & Activity Essentials', icon: 'Compass' },
  group_essentials: { label: 'Traveller Group Essentials', icon: 'Users' },
};

/**
 * Core Automated Packing List Generation Engine
 * Dynamically computes quantities, climate-appropriate layers, and activity-specific gear.
 */
export function generateAutomatedPackingList(
  climate: DestinationClimate,
  tripType: TripType,
  days: number,
  groupType: TravellerGroupType = 'solo'
): PackingItem[] {
  const items: PackingItem[] = [];
  const safeDays = Math.max(1, Math.min(days, 30));

  // Helper to add item
  const addItem = (
    name: string,
    category: PackingCategory,
    quantity: number | string,
    isEssential: boolean,
    weightGrams: number,
    tip?: string,
    climateFilter?: DestinationClimate[],
    tripFilter?: TripType[]
  ) => {
    items.push({
      id: `pack-${category}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      category,
      quantity,
      packed: false,
      isEssential,
      weightGrams,
      tip,
      climateSpecific: climateFilter,
      tripTypeSpecific: tripFilter,
    });
  };

  // ==========================================
  // 1. CLOTHING & APPAREL (Dynamically Scaled)
  // ==========================================
  const topsCount = safeDays <= 3 ? safeDays + 1 : Math.min(safeDays, 8);
  const bottomsCount = safeDays <= 3 ? 2 : Math.min(Math.ceil(safeDays / 2) + 1, 5);
  const undergarmentCount = safeDays <= 5 ? safeDays + 2 : Math.min(safeDays + 2, 9);
  const socksCount = safeDays <= 4 ? safeDays + 1 : Math.min(safeDays + 1, 7);

  // Climate-specific tops
  if (climate === 'tropical' || climate === 'monsoon') {
    addItem(
      'Breathable Cotton / Linen Tops',
      'clothing',
      `x ${topsCount}`,
      true,
      topsCount * 140,
      'Loose-fitting, moisture-wicking fabrics help prevent heat rash in humid weather.'
    );
  } else if (climate === 'cold_snow') {
    addItem(
      'Thermal Base Layer Tops (Merino/Poly)',
      'clothing',
      `x ${Math.min(safeDays, 3)}`,
      true,
      400,
      'First layer against skin. Traps body warmth without trapping perspiration.'
    );
    addItem(
      'Fleece / Wool Sweaters & Pullovers',
      'clothing',
      `x ${Math.min(Math.ceil(safeDays / 2), 3)}`,
      true,
      800,
      'Mid-layer insulating garments.'
    );
  } else if (climate === 'desert_arid') {
    addItem(
      'Full-Sleeve Breathable Cotton Shirts',
      'clothing',
      `x ${topsCount}`,
      true,
      topsCount * 150,
      'Full sleeves protect your arms from harsh desert UV and windblown dust.'
    );
  } else {
    // mild_hills
    addItem(
      'Comfortable Casual Tops / Kurtas',
      'clothing',
      `x ${topsCount}`,
      true,
      topsCount * 150,
      'Versatile for layering as hill station temperatures shift between day and dusk.'
    );
    addItem(
      'Lightweight Cardigan or Fleece Pullover',
      'clothing',
      `x ${safeDays <= 3 ? 1 : 2}`,
      true,
      450,
      'Essential for chilly Nilgiri / hill evenings.'
    );
  }

  // Outerwear based on climate
  if (climate === 'cold_snow') {
    addItem(
      'Heavy Insulated Down Jacket / Parka',
      'clothing',
      'x 1',
      true,
      1100,
      'Water-resistant and windproof outer shell for sub-zero conditions.'
    );
    addItem(
      'Thermal Base Layer Bottoms (Long Johns)',
      'clothing',
      `x ${Math.min(safeDays, 3)}`,
      true,
      350,
      'Wear underneath trousers during snow tours.'
    );
    addItem(
      'Woolen Beanie & Thermal Neck Gaiter',
      'clothing',
      'x 1 set',
      true,
      180,
      'Crucial to prevent core heat loss via head and neck.'
    );
    addItem(
      'Touch-Screen Thermal Gloves',
      'clothing',
      'x 1 pair',
      true,
      140,
      'Keep fingers warm while snapping mountain photos.'
    );
  } else if (climate === 'monsoon') {
    addItem(
      'Waterproof Rain Poncho or Gore-Tex Jacket',
      'clothing',
      'x 1',
      true,
      320,
      'Breathable waterproof membrane with hood for heavy monsoon spells.'
    );
    addItem(
      'Quick-Dry Synthetic Trousers',
      'clothing',
      `x ${bottomsCount}`,
      true,
      bottomsCount * 220,
      'Synthetic blends dry in 2 hours compared to denim which stays soaked all day.'
    );
  } else if (climate === 'desert_arid') {
    addItem(
      'Warm Evening Shawl / Fleece Jacket',
      'clothing',
      'x 1',
      true,
      450,
      'Desert temperatures plunge by 15°C after sunset.'
    );
    addItem(
      'Light Cotton Trousers / Palazzos',
      'clothing',
      `x ${bottomsCount}`,
      true,
      bottomsCount * 250,
      'Loose trousers prevent chafing and protect against sand.'
    );
  } else {
    // Standard bottoms
    addItem(
      'Pants / Jeans / Chinos',
      'clothing',
      `x ${bottomsCount}`,
      true,
      bottomsCount * 380,
      'Pack comfortable dark or neutral shades that match multiple shirts.'
    );
  }

  // Undergarments & socks
  addItem(
    'Underwear & Innerwear',
    'clothing',
    `x ${undergarmentCount}`,
    true,
    undergarmentCount * 60,
    safeDays > 7 ? 'Includes laundry rotation calculation. Quick-dry fabrics recommended.' : 'One for each day plus safety backups.'
  );

  addItem(
    climate === 'cold_snow' ? 'Merino Wool Hiking Socks' : 'Cotton / Bamboo Socks',
    'clothing',
    `x ${socksCount}`,
    true,
    socksCount * (climate === 'cold_snow' ? 80 : 40),
    climate === 'cold_snow' ? 'Cushioned heel and seamless toe prevents frostbite.' : 'Breathable anti-odor socks.'
  );

  // Footwear based on trip type & climate
  if (tripType === 'adventure' || climate === 'cold_snow') {
    addItem(
      'Waterproof High-Traction Trekking Shoes',
      'clothing',
      'x 1 pair',
      true,
      950,
      'Break in shoes at least 10 days before the trip to avoid trail blisters.'
    );
    addItem(
      'Camp Slides / Comfortable Recovery Slip-ons',
      'clothing',
      'x 1 pair',
      false,
      350,
      'For relaxing feet around the lodge or tent.'
    );
  } else if (tripType === 'luxury') {
    addItem(
      'Evening Dress / Linen Blazer Ensemble',
      'clothing',
      'x 1-2 sets',
      true,
      600,
      'Refined attire for 5-star heritage dining and cocktail hours.'
    );
    addItem(
      'Smart Leather Loafers / Elegant Flats',
      'clothing',
      'x 1 pair',
      true,
      500,
      'Polished footwear for hotel lounges and fine restaurants.'
    );
    addItem(
      'Comfortable Memory-Foam Walking Loafers',
      'clothing',
      'x 1 pair',
      true,
      450,
      'For daytime sightseeing without compromising elegance.'
    );
  } else if (tripType === 'beach') {
    addItem(
      'Swimwear / UV Rash Guard Sets',
      'clothing',
      'x 2 sets',
      true,
      300,
      'Two sets allow one to dry while you swim in the other.'
    );
    addItem(
      'Water-Resistant Beach Slides / Flip-flops',
      'clothing',
      'x 1 pair',
      true,
      300,
      'Sand-resistant and easy to rinse at hotel entrances.'
    );
  } else if (tripType === 'cultural') {
    addItem(
      'Temple-Appropriate Modest Shawl / Dupatta',
      'clothing',
      'x 1-2',
      true,
      180,
      'Required for head and shoulder covering at historic shrines and temples.'
    );
    addItem(
      'Slip-On Walking Shoes (Easy Temple Removal)',
      'clothing',
      'x 1 pair',
      true,
      400,
      'Avoid laces since temple courtyards require taking shoes on and off frequently.'
    );
  } else if (tripType === 'spiritual') {
    addItem(
      'White / Natural Cotton Yoga Pants & Kurta',
      'clothing',
      'x 2-3 sets',
      true,
      500,
      'Respectful, breathable attire suited for meditation halls and ashrams.'
    );
    addItem(
      'Comfortable Slip-on Sandals',
      'clothing',
      'x 1 pair',
      true,
      350,
      'Easy to leave outside ashrams and yoga shalas.'
    );
  } else {
    // Business / standard
    addItem(
      'Wrinkle-Resistant Blazers & Formal Shirts',
      'clothing',
      'x 2 sets',
      true,
      650,
      'Non-iron fabrics that look sharp straight from the suitcase.'
    );
    addItem(
      'Comfortable Walking Sneakers',
      'clothing',
      'x 1 pair',
      true,
      550,
      'Cushioned sole for airport walking and city exploration.'
    );
  }

  // ==========================================
  // 2. TOILETRIES & PERSONAL CARE
  // ==========================================
  addItem(
    'Toothbrush, Dental Floss & Mini Paste (50g)',
    'toiletries',
    'x 1 kit',
    true,
    110,
    'Keep in TSA cabin bag compliance (<100ml liquid limits).'
  );

  if (climate === 'tropical' || tripType === 'beach') {
    addItem(
      'Reef-Safe Sunscreen SPF 50+ PA++++ (100ml)',
      'toiletries',
      'x 1 bottle',
      true,
      130,
      'Protects ocean coral while preventing sunburn in high UV zones.'
    );
    addItem(
      'DEET-free Mosquito Repellent Cream / Spray',
      'toiletries',
      'x 1 bottle',
      true,
      120,
      'Essential for evening beach shacks and tropical backwaters.'
    );
    addItem(
      'Soothing Aloe Vera After-Sun Gel',
      'toiletries',
      'x 1 tube',
      false,
      100,
      'Cools skin after extended beach or boat sun exposure.'
    );
  } else if (climate === 'cold_snow') {
    addItem(
      'Intensive Lip Balm with SPF 30 & Shea Butter',
      'toiletries',
      'x 1 tube',
      true,
      30,
      'Prevents painful lip cracking in freezing dry mountain wind.'
    );
    addItem(
      'Ultra-Hydrating Cold Cream / Moisturizer',
      'toiletries',
      'x 1 jar (75ml)',
      true,
      110,
      'Restores skin barrier against snow glare and high-altitude dryness.'
    );
  } else if (climate === 'monsoon') {
    addItem(
      'Anti-Fungal Body & Foot Powder',
      'toiletries',
      'x 1 bottle',
      true,
      120,
      'Keeps toes and skin folds dry during rainy walking tours.'
    );
    addItem(
      'Waterproof Wet Wipes & Sanitizing Gel',
      'toiletries',
      'x 1 pack',
      true,
      150,
      'For quick cleanups on damp outdoor excursions.'
    );
  } else if (climate === 'desert_arid') {
    addItem(
      'Moisturizing Saline Nasal Spray',
      'toiletries',
      'x 1 spray',
      true,
      60,
      'Relieves irritated nasal passages from dry desert dust.'
    );
    addItem(
      'Broad-Spectrum Sun Protection SPF 50',
      'toiletries',
      'x 1 bottle',
      true,
      120,
      'Protects from intense desert glare and reflections.'
    );
  } else {
    // mild hills
    addItem(
      'Sunscreen SPF 40+ & Hydrating Face Mist',
      'toiletries',
      'x 1 bottle',
      true,
      120,
      'High elevation increases UV exposure even when the air feels chilly.'
    );
  }

  if (tripType === 'luxury') {
    addItem(
      'Travel Wrinkle-Release Spray & Mini Perfume Decanter',
      'toiletries',
      'x 1 kit',
      false,
      140,
      'Keep outfits crisp without waiting for hotel valet pressing.'
    );
    addItem(
      'Silk Eye Mask & Earplugs Kit',
      'toiletries',
      'x 1 set',
      true,
      50,
      'Guarantees 5-star sleep quality in transit and hotel rooms.'
    );
  }

  // Quick travel shampoo/soap
  addItem(
    'Solid Shampoo Bar & Travel Body Wash (100ml)',
    'toiletries',
    'x 1 each',
    true,
    180,
    'Solid bars never leak in luggage and are 100% spill-proof.'
  );

  // ==========================================
  // 3. ELECTRONICS & GADGETS
  // ==========================================
  addItem(
    'High-Capacity Power Bank (10,000 - 20,000 mAh)',
    'electronics',
    'x 1 unit',
    true,
    320,
    'Must be carried in CABIN baggage according to DGCA/airline safety regulations.'
  );

  addItem(
    'Multi-Head Braided Charging Cables (Type-C / Lightning)',
    'electronics',
    'x 2 cables',
    true,
    90,
    'Pack one in daypack and keep one backup in luggage.'
  );

  if (climate === 'monsoon' || tripType === 'beach') {
    addItem(
      'IPX8 Certified Waterproof Phone Dry Pouch',
      'electronics',
      'x 1 pouch',
      true,
      60,
      'Allows touchscreen photography underwater and during downpours.'
    );
  }

  if (tripType === 'adventure') {
    addItem(
      'LED Rechargeable Headlamp (with Red Night Mode)',
      'electronics',
      'x 1 unit',
      true,
      95,
      'Keeps hands free for trekking poles during dawn summit pushes.'
    );
  }

  if (tripType === 'business') {
    addItem(
      'Laptop, 65W GaN Fast Charger & HDMI Adapter',
      'electronics',
      'x 1 set',
      true,
      1400,
      'Compact GaN chargers power phone, tablet, and laptop from a single wall socket.'
    );
    addItem(
      'Active Noise-Canceling Wireless Headphones',
      'electronics',
      'x 1 unit',
      true,
      250,
      'Blocks engine drone on flights and trains for seamless conference calls.'
    );
  }

  // ==========================================
  // 4. DOCUMENTS & TRAVEL WALLET
  // ==========================================
  addItem(
    'Govt Photo ID (Original Aadhaar Card / Driving License / Passport)',
    'documents',
    'x 1-2 IDs',
    true,
    30,
    'Mandatory for airport entry, train verification, and hotel check-in across India.'
  );

  addItem(
    'Offline Downloaded Boarding Passes, Train PNR & Hotel Vouchers',
    'documents',
    'Saved in Voyan Vault',
    true,
    10,
    'Cellular networks often drop in mountain ghats and remote coastal zones.'
  );

  addItem(
    'Emergency Cash Reserve (₹2,000 - ₹5,000 in ₹100/₹500 notes)',
    'documents',
    'Emergency Stash',
    true,
    40,
    'UPI sometimes experiences server downtime or spotty 4G in hill stations and remote toll booths.'
  );

  // ==========================================
  // 5. FIRST AID, MEDICAL & HEALTH
  // ==========================================
  addItem(
    'Prescribed Daily Medicines with Doctor Prescription Copy',
    'medical',
    `${safeDays + 2} days supply`,
    true,
    120,
    'Always carry extra 2-3 days supply in case of transit or weather delays.'
  );

  if (climate === 'mild_hills' || tripType === 'adventure') {
    addItem(
      'Motion Sickness Tablets (Dimenhydrinate / Avomine)',
      'medical',
      'x 1 strip',
      true,
      20,
      'Crucial for windy hairpin bends on Ooty, Manali, and hill station roads.'
    );
    addItem(
      'Electrolyte ORS Sachets (Electral / Enerzal)',
      'medical',
      'x 4-6 packs',
      true,
      100,
      'Rapid hydration for mountain climbs or long walking excursions.'
    );
  }

  addItem(
    'Compact First Aid Pouch (Band-Aids, Antiseptic Wipe, Paracetamol)',
    'medical',
    'x 1 pouch',
    true,
    140,
    'Immediate relief for minor cuts, blisters, and sudden travel headaches.'
  );

  if (tripType === 'adventure') {
    addItem(
      'Hydrocolloid Blister Relief Cushions (Compeed)',
      'medical',
      'x 1 pack',
      true,
      30,
      'Second-skin protection if hiking boots rub your heels.'
    );
  }

  // ==========================================
  // 6. TRIP & ACTIVITY GEAR
  // ==========================================
  if (tripType === 'adventure') {
    addItem(
      'Collapsible Lightweight Trekking Poles',
      'activity_gear',
      'x 1 pair',
      true,
      480,
      'Reduces knee impact by up to 25% on steep descents.'
    );
    addItem(
      '2L Insulated Hydration Bladder / Sturdy Bottle',
      'activity_gear',
      'x 1 unit',
      true,
      200,
      'Hands-free drinking on mountain trails.'
    );
    addItem(
      'Microfiber Quick-Drying Compact Towel',
      'activity_gear',
      'x 1 towel',
      true,
      120,
      'Dries in 30 minutes and rolls up smaller than an apple.'
    );
  } else if (tripType === 'beach') {
    addItem(
      'Waterproof Dry Sack (10L)',
      'activity_gear',
      'x 1 bag',
      true,
      160,
      'Keeps dry clothes and electronics completely safe while on speedboats or beach.'
    );
    addItem(
      'Polarized UV400 Sunglasses with Floating Strap',
      'activity_gear',
      'x 1 pair',
      true,
      60,
      'Eliminates harsh sea water reflections and won’t sink if dropped.'
    );
  } else if (tripType === 'spiritual') {
    addItem(
      'Travel Foldable Yoga Mat / Cotton Asana Cloth',
      'activity_gear',
      'x 1 mat',
      true,
      550,
      'Hygienic personal surface for morning yoga and meditation sessions.'
    );
    addItem(
      'Copper Water Flask & Pocket Gratitude Journal',
      'activity_gear',
      'x 1 set',
      false,
      280,
      'Classic mindful travel accessories.'
    );
  } else if (tripType === 'cultural') {
    addItem(
      'Cloth Shoe Carry Sack for Temples & Shrines',
      'activity_gear',
      'x 2 sacks',
      true,
      40,
      'Carry your own footwear safely instead of leaving them in crowded temple counters.'
    );
    addItem(
      'Noise-Isolating Earphones for Audio Heritage Tours',
      'activity_gear',
      'x 1 set',
      false,
      30,
      'Plug into official monument QR audio guides at forts and UNESCO palaces.'
    );
  }

  // ==========================================
  // 7. TRAVELLER GROUP ESSENTIALS (Group Aware)
  // ==========================================
  if (groupType === 'seniors') {
    addItem(
      '7-Day AM/PM Compartment Pill Organizer Box',
      'group_essentials',
      'x 1 box',
      true,
      80,
      'Never miss morning or evening doses with visible organized days.'
    );
    addItem(
      'Orthopedic Cushioned Shoe Insoles',
      'group_essentials',
      'x 1 pair',
      true,
      90,
      'Relieves pressure on lower back and knees during museum or garden strolls.'
    );
    addItem(
      'Warm Cashmere / Woolen Lap Shawl for AC Transit',
      'group_essentials',
      'x 1 shawl',
      true,
      250,
      'Protects against freezing bus, cab, and flight air-conditioning.'
    );
  } else if (groupType === 'family') {
    addItem(
      'Kids Wet Wipes, Hand Sanitizer & Snack Zip Bags',
      'group_essentials',
      'x 1 family kit',
      true,
      300,
      'Quick cleanup for messy sticky fingers on long road trips.'
    );
    addItem(
      'Compact Travel Board Games / Coloring Books & Crayons',
      'group_essentials',
      'x 1 kit',
      false,
      220,
      'Keeps young children engaged during restaurant waits and flights.'
    );
    addItem(
      'Pediatric Thermometer & Children Paracetamol Syrup',
      'group_essentials',
      'x 1 kit',
      true,
      120,
      'Immediate peace of mind for sudden temperature spikes.'
    );
  } else if (groupType === 'friends') {
    addItem(
      'Multi-Port Fast USB-C Charging Hub (4-in-1)',
      'group_essentials',
      'x 1 hub',
      true,
      180,
      'Eliminates hotel room socket battles by charging 4 phones from 1 wall outlet.'
    );
    addItem(
      'Card Games (Uno / Exploding Kittens) & Bluetooth Speaker',
      'group_essentials',
      'x 1 pack',
      false,
      350,
      'Great for late-night bonfire chats and hostel lounges.'
    );
  } else if (groupType === 'couple') {
    addItem(
      'Dual Headphone Audio Splitter / Bluetooth Dual-Link',
      'group_essentials',
      'x 1 adapter',
      false,
      25,
      'Listen to the same podcast, movie, or Lyria soundscape together during train rides.'
    );
    addItem(
      'Handheld Travel Garment Steamer',
      'group_essentials',
      'x 1 unit',
      false,
      480,
      'Quick touch-up for romantic candlelit dinner dresses and shirts.'
    );
  } else {
    // Solo
    addItem(
      'Portable Safety Door Stopper Alarm & Whistle',
      'group_essentials',
      'x 1 unit',
      true,
      110,
      'Extra security layer for hotel or homestay bedroom doors.'
    );
    addItem(
      'Compact Foldable Daypack (15L)',
      'group_essentials',
      'x 1 bag',
      true,
      120,
      'Leaves bulky luggage at the hotel while keeping daily essentials light on your back.'
    );
  }

  return items;
}

/**
 * Calculate total estimated luggage weight
 */
export function calculateEstimatedWeightKg(items: PackingItem[]): number {
  const grams = items.reduce((sum, item) => sum + (item.weightGrams || 150), 0);
  // Add base suitcase weight (~2.5 kg)
  return Number(((grams + 2400) / 1000).toFixed(1));
}

/**
 * Format packing checklist as copyable WhatsApp/Notes text
 */
export function formatPackingListAsText(
  items: PackingItem[],
  climate: DestinationClimate,
  tripType: TripType,
  days: number,
  destination: string
): string {
  const packedCount = items.filter((i) => i.packed).length;
  let text = `🎒 *Voyan Smart Packing List: ${destination}*\n`;
  text += `📅 Duration: ${days} Days | 🌤️ Climate: ${CLIMATE_DETAILS[climate].name} | 🎯 Style: ${TRIP_TYPES[tripType].name}\n`;
  text += `📊 Progress: ${packedCount}/${items.length} items packed\n\n`;

  const categories = Array.from(new Set(items.map((i) => i.category)));

  categories.forEach((cat) => {
    const catItems = items.filter((i) => i.category === cat);
    text += `*${CATEGORY_LABELS[cat]?.label.toUpperCase() || cat}*\n`;
    catItems.forEach((item) => {
      const check = item.packed ? '✅' : '⬜';
      const ess = item.isEssential ? ' [Must Have]' : '';
      text += `${check} ${item.name} (${item.quantity})${ess}\n`;
    });
    text += '\n';
  });

  text += `Generated with Voyan AI Travel Planner\nhttps://voyan.travel`;
  return text;
}
