import type {
  BookingItem,
  ExpenseItem,
  MemoryItem,
  TripDocumentItem
} from '../types/tripVault';

export const INITIAL_SAMPLE_BOOKINGS: BookingItem[] = [
  {
    id: 'sample-flight-ooty',
    type: 'flight',
    title: 'Bengaluru to Coimbatore',
    provider: 'IndiGo Airlines',
    confirmationCode: '6E-W8P42K',
    status: 'confirmed',
    dateStr: '24 Oct 2026',
    timeStr: '06:15 AM – 07:25 AM',
    departureLocation: 'Bengaluru (BLR), Terminal 1',
    arrivalLocation: 'Coimbatore (CJB)',
    seatOrRoom: 'Seat 12F',
    platformOrTerminal: 'Terminal 1',
    price: 3450,
    paidBy: 'Priya Sharma',
    notes: 'Check-in baggage: 15 kg.'
  },
  {
    id: 'sample-train-ooty',
    type: 'train',
    title: 'Nilgiri Mountain Railway',
    provider: 'Indian Railways',
    confirmationCode: '4218941029',
    status: 'confirmed',
    dateStr: '25 Oct 2026',
    timeStr: '02:00 PM – 03:15 PM',
    departureLocation: 'Ooty Railway Station',
    arrivalLocation: 'Coonoor',
    seatOrRoom: 'Coach FC-1',
    price: 410,
    paidBy: 'Arjun Mehta',
    notes: 'Arrive at the station 20 minutes before departure.'
  },
  {
    id: 'sample-hotel-ooty',
    type: 'hotel',
    title: 'Fern Hill Cottage',
    provider: 'Sterling Fern Hill Ooty',
    confirmationCode: 'STR-OOTY-94218',
    status: 'confirmed',
    dateStr: '24–26 Oct 2026',
    timeStr: 'Check-in: 12:00 PM',
    departureLocation: 'Fern Hill, Ooty',
    seatOrRoom: 'Valley Cottage #204',
    price: 6800,
    paidBy: 'Priya Sharma',
    notes: 'Check-in requires photo identification.'
  },
  {
    id: 'sample-pass-bms',
    type: 'pass',
    title: 'Nilgiri Heritage & Cultural Evening Show',
    provider: 'BookMyShow',
    confirmationCode: 'BMS-PASS-99214',
    status: 'confirmed',
    dateStr: '25 Oct 2026',
    timeStr: '06:30 PM – 08:30 PM',
    departureLocation: 'Ooty Cultural Auditorium, Coonoor Road',
    seatOrRoom: 'Row D, Seats 14-15',
    price: 900,
    paidBy: 'Priya Sharma',
    notes: 'BookMyShow M-Ticket. Show QR pass at door entry. Valid photo ID required.'
  },
  {
    id: 'sample-pass-entry',
    type: 'pass',
    title: 'Government Botanical Garden & Lake E-Pass',
    provider: 'Tamil Nadu Tourism & Forest Portal',
    confirmationCode: 'TN-EPASS-44182',
    status: 'confirmed',
    dateStr: '24 Oct 2026',
    timeStr: '09:00 AM – 05:30 PM (All-Day Pass)',
    departureLocation: 'Vannarapettai, Ooty, Tamil Nadu',
    seatOrRoom: 'Adult Fast-Track Admission x 2',
    price: 320,
    paidBy: 'Arjun Mehta',
    notes: 'Official Google / Tourism website e-pass. Camera and boating charges included.'
  }
];

export const INITIAL_SAMPLE_EXPENSES: ExpenseItem[] = [
  {
    id: 'sample-expense-lunch',
    title: 'Lunch near Ooty Lake',
    amount: 920,
    category: 'food',
    paidBy: 'Priya',
    splitWith: ['Priya', 'Arjun'],
    date: '24 Oct 2026',
    time: '01:30 PM',
    paymentMethod: 'UPI'
  },
  {
    id: 'sample-expense-taxi',
    title: 'Airport taxi to Ooty',
    amount: 1800,
    category: 'transit',
    paidBy: 'Arjun',
    splitWith: ['Priya', 'Arjun'],
    date: '24 Oct 2026',
    time: '09:00 AM',
    paymentMethod: 'Card'
  }
];

export const INITIAL_SAMPLE_MEMORIES: MemoryItem[] = [
  {
    id: 'sample-memory-tea-garden',
    dayNumber: 1,
    title: 'Morning in the tea gardens',
    location: 'Doddabetta, Ooty',
    timestamp: '24 Oct 2026, 10:15 AM',
    imageUrl: '/src/assets/images/memory_tea_garden_1792473340498.jpg',
    caption: 'Cool mountain air and endless green tea slopes made the perfect start to our trip.',
    author: 'Priya Sharma',
    tags: ['Nilgiris', 'Tea Gardens'],
    ambientAudioTitle: 'Morning birdsong',
    moodEmoji: '🌿'
  }
];

export const INITIAL_SAMPLE_DOCUMENTS: TripDocumentItem[] = [
  {
    id: 'sample-document-insurance',
    title: 'Travel insurance summary',
    docType: 'insurance',
    holderName: 'Priya Sharma',
    referenceNumber: 'VOY-INS-2026-1042',
    expiryOrValidity: 'Valid through 26 Oct 2026',
    status: 'verified',
    notes: 'Keep the policy details available during the trip.'
  },
  {
    id: 'sample-document-id',
    title: 'Identity document checklist',
    docType: 'identity',
    holderName: 'Arjun Mehta',
    referenceNumber: 'ID-CHECK-02',
    expiryOrValidity: 'Check validity before travel',
    status: 'uploaded',
    notes: 'Carry a valid government-issued photo ID.'
  }
];

export const SAMPLE_PARSE_SNIPPETS = [
  {
    id: 'flight',
    label: 'Flight confirmation',
    snippet: 'Your IndiGo flight 6E-241 is confirmed. PNR: 6E-W8P42K.'
  },
  {
    id: 'train',
    label: 'Train ticket',
    snippet: 'IRCTC train ticket confirmed. PNR: 4218941029.'
  },
  {
    id: 'hotel',
    label: 'Hotel booking',
    snippet: 'Your hotel booking at Sterling Fern Hill Ooty is confirmed.'
  },
  {
    id: 'bms_pass',
    label: 'BookMyShow Pass',
    snippet: 'BookMyShow Booking Confirmed: Nilgiri Heritage & Cultural Evening Show. Booking ID: BMS-PASS-99214. 2 Tickets.'
  },
  {
    id: 'entry_pass',
    label: 'Place Entry Pass',
    snippet: 'Official Entry Pass Confirmed: Government Botanical Garden & Lake Boating. Pass ID: TN-EPASS-44182.'
  }
];
