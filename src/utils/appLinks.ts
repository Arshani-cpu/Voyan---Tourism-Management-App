export type AppCategory = 'travel' | 'food' | 'shopping';

export interface PartnerApp {
  id: string;
  name: string;
  category: AppCategory;
  tagline: string;
  color: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  iconType: string;
  defaultUrl: string;
  popularFor: string[];
  getUrl: (params?: { destination?: string; query?: string; lat?: number; lng?: number }) => string;
}

export const ON_DEMAND_APPS: PartnerApp[] = [
  // --- TRAVEL & RIDES ---
  {
    id: 'rapido',
    name: 'Rapido',
    category: 'travel',
    tagline: "India's favorite bike taxi, auto & budget city rides",
    color: '#F9D100',
    badgeBg: 'bg-amber-100',
    textColor: 'text-amber-950',
    borderColor: 'border-amber-300',
    iconType: 'bike',
    defaultUrl: 'https://rapido.bike/',
    popularFor: ['Quick Auto booking', 'Bike Taxis through traffic', 'Low-cost city hops'],
    getUrl: (params) => {
      const dest = params?.destination ? encodeURIComponent(params.destination) : '';
      return dest ? `https://rapido.bike/?destination=${dest}` : 'https://rapido.bike/';
    },
  },
  {
    id: 'uber',
    name: 'Uber',
    category: 'travel',
    tagline: 'Reliable on-demand cabs, autos & intercity rentals',
    color: '#000000',
    badgeBg: 'bg-stone-900',
    textColor: 'text-white',
    borderColor: 'border-stone-700',
    iconType: 'car',
    defaultUrl: 'https://m.uber.com/',
    popularFor: ['Airport pickups', 'Uber Go & Premier Cabs', 'Hourly rentals'],
    getUrl: (params) => {
      if (params?.destination) {
        return `https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${encodeURIComponent(params.destination)}`;
      }
      return 'https://m.uber.com/';
    },
  },
  {
    id: 'ola',
    name: 'Ola Cabs',
    category: 'travel',
    tagline: 'City cabs, auto rickshaws & outstation travel',
    color: '#00D154',
    badgeBg: 'bg-emerald-50',
    textColor: 'text-emerald-900',
    borderColor: 'border-emerald-300',
    iconType: 'car',
    defaultUrl: 'https://book.olacabs.com/',
    popularFor: ['Ola Prime', 'Ola Auto', 'Outstation day cabs'],
    getUrl: (params) => {
      const dest = params?.destination ? encodeURIComponent(params.destination) : '';
      return dest ? `https://book.olacabs.com/?drop=${dest}` : 'https://book.olacabs.com/';
    },
  },
  {
    id: 'redbus',
    name: 'redBus',
    category: 'travel',
    tagline: 'Intercity AC sleeper, Volvo & state transport buses',
    color: '#D84E55',
    badgeBg: 'bg-rose-50',
    textColor: 'text-rose-900',
    borderColor: 'border-rose-200',
    iconType: 'bus',
    defaultUrl: 'https://www.redbus.in/',
    popularFor: ['Overnight bus bookings', 'State transport passes', 'Live bus tracking'],
    getUrl: (params) => {
      const dest = params?.destination ? encodeURIComponent(params.destination) : '';
      return dest ? `https://www.redbus.in/bus-tickets/${dest}` : 'https://www.redbus.in/';
    },
  },
  {
    id: 'irctc',
    name: 'IRCTC Trains',
    category: 'travel',
    tagline: 'Official Indian Railways train reservations & Tatkal',
    color: '#213D77',
    badgeBg: 'bg-blue-50',
    textColor: 'text-blue-900',
    borderColor: 'border-blue-200',
    iconType: 'train',
    defaultUrl: 'https://www.irctc.co.in/nget/train-search',
    popularFor: ['Vande Bharat Express', 'Tatkal tickets', 'Scenic rail routes'],
    getUrl: () => 'https://www.irctc.co.in/nget/train-search',
  },

  // --- FOOD & DINING ---
  {
    id: 'zomato',
    name: 'Zomato',
    category: 'food',
    tagline: 'Discover top local restaurants, menu reviews & instant food delivery',
    color: '#CB202D',
    badgeBg: 'bg-red-50',
    textColor: 'text-red-900',
    borderColor: 'border-red-200',
    iconType: 'utensils',
    defaultUrl: 'https://www.zomato.com/',
    popularFor: ['Famous local eateries', 'Verified diner reviews', 'Late-night delivery'],
    getUrl: (params) => {
      const q = [params?.query, params?.destination].filter(Boolean).join(' ');
      return q ? `https://www.zomato.com/search?q=${encodeURIComponent(q)}` : 'https://www.zomato.com/';
    },
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    category: 'food',
    tagline: 'Food delivery, Dineout discounts & quick Instamart essentials',
    color: '#FC8019',
    badgeBg: 'bg-orange-50',
    textColor: 'text-orange-900',
    borderColor: 'border-orange-200',
    iconType: 'bag',
    defaultUrl: 'https://www.swiggy.com/',
    popularFor: ['Hot meal delivery to stays', 'Swiggy Dineout table bookings', 'Instamart quick snacks'],
    getUrl: (params) => {
      const q = [params?.query, params?.destination].filter(Boolean).join(' ');
      return q ? `https://www.swiggy.com/search?query=${encodeURIComponent(q)}` : 'https://www.swiggy.com/';
    },
  },
  {
    id: 'blinkit',
    name: 'Blinkit',
    category: 'food',
    tagline: '10-minute delivery for packaged snacks, water, phone chargers & essentials',
    color: '#F4C430',
    badgeBg: 'bg-yellow-50',
    textColor: 'text-yellow-950',
    borderColor: 'border-yellow-300',
    iconType: 'zap',
    defaultUrl: 'https://blinkit.com/',
    popularFor: ['Emergency phone chargers', 'Bottled drinking water', 'Snacks for road trips'],
    getUrl: (params) => {
      const q = params?.query || params?.destination || 'travel essentials';
      return `https://blinkit.com/s/?q=${encodeURIComponent(q)}`;
    },
  },

  // --- SHOPPING & TRAVEL ESSENTIALS ---
  {
    id: 'meesho',
    name: 'Meesho',
    category: 'shopping',
    tagline: 'Budget-friendly travel fashion, regional ethnic wear & packing accessories',
    color: '#9C27B0',
    badgeBg: 'bg-purple-50',
    textColor: 'text-purple-900',
    borderColor: 'border-purple-200',
    iconType: 'shopping-bag',
    defaultUrl: 'https://www.meesho.com/',
    popularFor: ['Temple darshan ethnic wear', 'Affordable tote bags', 'Travel footwear'],
    getUrl: (params) => {
      const q = params?.query || `${params?.destination || ''} travel accessories`.trim();
      return `https://www.meesho.com/search?q=${encodeURIComponent(q)}`;
    },
  },
  {
    id: 'amazon',
    name: 'Amazon India',
    category: 'shopping',
    tagline: 'Power banks, luggage, toiletries, rainwear & next-day delivery',
    color: '#FF9900',
    badgeBg: 'bg-amber-50',
    textColor: 'text-amber-950',
    borderColor: 'border-amber-300',
    iconType: 'package',
    defaultUrl: 'https://www.amazon.in/',
    popularFor: ['Power banks & cords', 'Trekking gear & backpacks', 'Weather-proof luggage'],
    getUrl: (params) => {
      const q = params?.query || `${params?.destination || ''} travel essentials`.trim();
      return `https://www.amazon.in/s?k=${encodeURIComponent(q)}`;
    },
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    category: 'shopping',
    tagline: 'Luggage bags, outdoor footwear, gadgets & travel clothing',
    color: '#2874F0',
    badgeBg: 'bg-blue-50',
    textColor: 'text-blue-900',
    borderColor: 'border-blue-200',
    iconType: 'shopping-cart',
    defaultUrl: 'https://www.flipkart.com/',
    popularFor: ['Strolley bags & duffels', 'Walking shoes', 'Winter jackets for hills'],
    getUrl: (params) => {
      const q = params?.query || `${params?.destination || ''} travel gear`.trim();
      return `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`;
    },
  },
];

export function getAppsByCategory(category: AppCategory): PartnerApp[] {
  return ON_DEMAND_APPS.filter((a) => a.category === category);
}
