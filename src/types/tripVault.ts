export type BookingType = 'flight' | 'train' | 'hotel' | 'cab' | 'pass';

export interface BookingItem {
  id: string;
  type: BookingType;
  title: string;
  provider: string; // e.g. "IndiGo Airlines", "IRCTC Nilgiri Mountain Railway", "Sterling Fern Hill"
  confirmationCode: string; // PNR or Booking Ref
  status: 'confirmed' | 'active' | 'completed' | 'pending';
  dateStr: string; // e.g. "24 Oct 2026"
  timeStr: string; // e.g. "06:15 AM - 07:30 AM"
  departureLocation?: string;
  arrivalLocation?: string;
  seatOrRoom?: string; // e.g. "Seat 12F", "Deluxe Valley Cottage #204"
  platformOrTerminal?: string; // e.g. "Terminal 1, Gate 4B"
  qrCodeContent?: string;
  barcodeNumber?: string;
  price?: number; // in INR when present in the source confirmation
  paidBy: string; // e.g. "Priya Sharma"
  notes?: string;
  tripId?: string;
  sourceEmailId?: string;
  sourceEmailSubject?: string;
  sourceEmailDate?: string;
  itineraryDayNumber?: number;
  attachments?: {
    name: string;
    size: string;
    type: 'pdf' | 'qr' | 'image';
  }[];
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number; // in INR
  category: 'stay' | 'transit' | 'food' | 'activity' | 'pass' | 'shopping' | 'emergency';
  paidBy: string; // e.g. "You", "Priya", "Arjun"
  splitWith: string[]; // e.g. ["You", "Priya", "Arjun"]
  date: string;
  time?: string;
  receiptNote?: string;
  receiptFileId?: string;
  receiptFileName?: string;
  paymentMethod: 'UPI' | 'Card' | 'Cash' | 'NetBanking';
  tripId?: string;
}

export interface MemoryItem {
  id: string;
  dayNumber: number;
  title: string;
  location: string;
  timestamp: string;
  imageUrl?: string;
  caption: string;
  author: string;
  tags: string[];
  ambientAudioTitle?: string;
  moodEmoji: string;
  tripId?: string;
  imageFileId?: string;
  imageFileName?: string;
}

export interface TripDocumentItem {
  id: string;
  title: string;
  docType: 'identity' | 'insurance' | 'permit' | 'medical' | 'other';
  holderName: string;
  referenceNumber: string;
  expiryOrValidity: string;
  status: 'verified' | 'uploaded' | 'pending';
  notes: string;
  tripId?: string;
  fileId?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  sourceEmailId?: string;
}

export interface ExpenseSettlement {
  from: string;
  to: string;
  amount: number;
}
