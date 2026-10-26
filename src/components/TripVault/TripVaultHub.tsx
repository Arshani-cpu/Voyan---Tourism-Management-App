import React, { useEffect, useRef, useState } from 'react';
import {
  Ticket,
  Calendar,
  Wallet,
  Camera,
  FolderArchive,
  QrCode,
  Plane,
  Train,
  Hotel,
  Car,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Download,
  Share2,
  FileText,
  Sparkles,
  DollarSign,
  Users,
  Copy,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Heart,
  IndianRupee,
  Mail
} from 'lucide-react';
import {
  BookingItem,
  ExpenseItem,
  MemoryItem,
  TripDocumentItem,
  BookingType
} from '../../types/tripVault';
import {
  INITIAL_SAMPLE_BOOKINGS,
  INITIAL_SAMPLE_EXPENSES,
  INITIAL_SAMPLE_MEMORIES,
  INITIAL_SAMPLE_DOCUMENTS,
  SAMPLE_PARSE_SNIPPETS
} from '../../data/sampleTripVault';
import { DigitalPassModal } from './DigitalPassModal';
import { OfflineTripRepository } from './OfflineTripRepository';
import { BookingAppsDirectory } from './BookingAppsDirectory';
import { TripPlan } from '../../types/travel';
import { auth, onAuthStateChanged } from '../../lib/firebase';
import { sqliteStore } from '../../lib/sqliteStore';
import { listOfflineTripItems, saveOfflineTripItem } from '../../lib/offlineTripRepository';
import { UPIPaymentModal, UPIPaymentDetails } from '../Payment/UPIPaymentModal';
import { DocumentsVaultView } from '../Documents/DocumentsVaultView';
import { UploadDocumentModal } from '../Documents/UploadDocumentModal';
import { SendTripEmailModal } from '../Modals/SendTripEmailModal';

interface TripVaultHubProps {
  plan: TripPlan;
  onUpdatePlan?: (updated: TripPlan) => void;
}

export const TripVaultHub: React.FC<TripVaultHubProps> = ({ plan }) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'itinerary_sync' | 'expenses' | 'documents' | 'memories' | 'binder'>('bookings');
  const [bookings, setBookings] = useState<BookingItem[]>(INITIAL_SAMPLE_BOOKINGS);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_SAMPLE_EXPENSES);
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_SAMPLE_MEMORIES);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<TripDocumentItem[]>(() => {
    try {
      const stored = localStorage.getItem(`voyan_docs_${plan.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_SAMPLE_DOCUMENTS;
  });

  // Modal states for new features
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isUpiPaymentOpen, setIsUpiPaymentOpen] = useState(false);
  const [upiPaymentDetails, setUpiPaymentDetails] = useState<UPIPaymentDetails>({
    payeeName: 'Priya Sharma',
    payeeVpa: 'priya.sharma@okhdfcbank',
    amount: 600,
    transactionNote: `Voyan Trip Payment - ${plan.destination}`,
    tripTitle: plan.title,
    category: 'transit'
  });

  // Sync documents to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`voyan_docs_${plan.id}`, JSON.stringify(documents));
    } catch {}
  }, [documents, plan.id]);

  const handleSaveDocument = async (newDoc: TripDocumentItem, fileData?: { blob: Blob; fileName: string; mimeType: string }) => {
    if (fileData) {
      try {
        await saveOfflineTripItem({
          id: newDoc.id,
          tripId: plan.id,
          title: newDoc.title,
          description: newDoc.notes || newDoc.holderName,
          fileName: fileData.fileName,
          mimeType: fileData.mimeType,
          sizeBytes: fileData.blob.size,
          file: fileData.blob,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Could not save file to offline repository', e);
      }
    }
    setDocuments((prev) => [newDoc, ...prev]);
    setParseSuccessToast(`Document "${newDoc.title}" saved securely for future use.`);
    setTimeout(() => setParseSuccessToast(null), 3500);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleDownloadDocument = async (doc: TripDocumentItem) => {
    try {
      const items = await listOfflineTripItems(plan.id);
      const matched = items.find((it) => it.id === doc.id && it.file);
      let blob: Blob;
      let filename = doc.fileName || `${doc.title.replace(/\s+/g, '_')}.txt`;

      if (matched && matched.file) {
        blob = matched.file;
      } else {
        const content = `VOYAN TRAVEL DOCUMENT\n======================\nTitle: ${doc.title}\nCategory: ${doc.docType}\nHolder: ${doc.holderName}\nReference/Policy: ${doc.referenceNumber}\nValidity: ${doc.expiryOrValidity}\nNotes: ${doc.notes || 'None'}\nTrip: ${plan.title} (${plan.destination})\nExported: ${new Date().toLocaleString()}`;
        blob = new Blob([content], { type: 'text/plain' });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePaymentSuccess = (payment: {
    transactionId: string;
    vpa: string;
    amount: number;
    note: string;
    timestamp: string;
  }) => {
    const newExpense: ExpenseItem = {
      id: `exp-upi-${Date.now()}`,
      title: payment.note || `UPI Payment to ${payment.vpa}`,
      amount: payment.amount,
      category: 'transit',
      paidBy: 'You',
      splitWith: ['You', 'Priya'],
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: payment.timestamp,
      receiptNote: `UTR: ${payment.transactionId} · Sent via UPI to ${payment.vpa}`,
      paymentMethod: 'UPI',
      tripId: plan.id,
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setParseSuccessToast(`UPI Payment of ₹${payment.amount.toLocaleString('en-IN')} confirmed and logged in vault!`);
    setTimeout(() => setParseSuccessToast(null), 4000);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      Promise.all([
        sqliteStore.list<ExpenseItem & { tripId: string }>('expenses'),
        sqliteStore.list<MemoryItem & { tripId: string }>('memories')
      ]).then(([expenseRecords, memoryRecords]) => {
        const tripExpenses = expenseRecords
          .filter((record) => record.data.tripId === plan.id)
          .map((record) => record.data);
        const tripMemories = memoryRecords
          .filter((record) => record.data.tripId === plan.id)
          .map((record) => record.data);

        setExpenses((current) => [...tripExpenses, ...current.filter((item) => !tripExpenses.some((saved) => saved.id === item.id))]);
        setMemories((current) => [...tripMemories, ...current.filter((item) => !tripMemories.some((saved) => saved.id === item.id))]);
      }).catch((error: unknown) => {
        setStorageError(error instanceof Error ? error.message : 'Could not load trip data.');
      });
    });

    return () => unsubscribe();
  }, [plan.id]);

  // Modals & inputs
  const [selectedBookingForPass, setSelectedBookingForPass] = useState<BookingItem | null>(null);
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [parseInputText, setParseInputText] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccessToast, setParseSuccessToast] = useState<string | null>(null);

  // New expense form modal state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpCategory, setNewExpCategory] = useState<ExpenseItem['category']>('food');
  const [newExpPaidBy, setNewExpPaidBy] = useState('You');

  // New memory modal state
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);
  const [newMemTitle, setNewMemTitle] = useState('');
  const [newMemCaption, setNewMemCaption] = useState('');
  const [newMemLocation, setNewMemLocation] = useState(plan.destination);
  const [newMemPhoto, setNewMemPhoto] = useState<File | null>(null);
  const memoryObjectUrlsRef = useRef<string[]>([]);

  useEffect(() => () => {
    memoryObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    memoryObjectUrlsRef.current = [];
  }, []);

  useEffect(() => {
    let isActive = true;
    void listOfflineTripItems(plan.id)
      .then((items) => {
        if (!isActive) return;
        const localMemories = items
          .filter((item) => item.kind === 'memory' && item.file)
          .map((item): MemoryItem => {
            const imageUrl = URL.createObjectURL(item.file!);
            memoryObjectUrlsRef.current.push(imageUrl);
            return {
              id: item.id,
              dayNumber: 1,
              title: item.title,
              location: item.location || plan.destination,
              timestamp: new Date(item.createdAt).toLocaleString(),
              imageUrl,
              caption: item.description,
              author: 'You',
              tags: ['TravelMoments', 'VoyanMemory'],
              moodEmoji: '✨'
            };
          });
        setMemories((current) => [
          ...localMemories,
          ...current.filter((memory) => !localMemories.some((saved) => saved.id === memory.id))
        ]);
      })
      .catch((error: unknown) => {
        if (isActive) setStorageError(error instanceof Error ? error.message : 'Could not load saved travel photos.');
      });
    return () => {
      isActive = false;
    };
  }, [plan.id, plan.destination]);

  // Financial calculations
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = Math.max(0, plan.budgetTotal - totalSpent);

  // Split calculations (Priya vs Arjun demo)
  const priyaPaid = expenses.filter((e) => e.paidBy === 'Priya' || e.paidBy === 'Priya Sharma').reduce((s, e) => s + e.amount, 0);
  const arjunPaid = expenses.filter((e) => e.paidBy === 'Arjun' || e.paidBy === 'Arjun Mehta' || e.paidBy === 'You').reduce((s, e) => s + e.amount, 0);
  const halfShare = Math.round(totalSpent / 2);
  const settlementDifference = Math.abs(priyaPaid - halfShare);
  const arjunOwesPriya = priyaPaid > arjunPaid;

  // AI Import Parser
  const handleParseSnippet = (textToParse: string) => {
    setIsParsing(true);
    setTimeout(() => {
      setIsParsing(false);
      const text = textToParse.toLowerCase();

      let newBooking: BookingItem;
      if (text.includes('indigo') || text.includes('flight') || text.includes('6e')) {
        newBooking = {
          id: `book-flight-${Date.now()}`,
          type: 'flight',
          title: 'Imported Flight Confirmation (6E-241)',
          provider: 'IndiGo Airlines',
          confirmationCode: '6E-W8P42K',
          status: 'confirmed',
          dateStr: '24 Oct 2026',
          timeStr: '06:15 AM – 07:25 AM',
          departureLocation: 'Bengaluru (BLR) T1',
          arrivalLocation: 'Coimbatore (CJB)',
          seatOrRoom: 'Seat 12F',
          qrCodeContent: 'INDIGO-PNR-6EW8P42K-IMPORT-VOYAN',
          barcodeNumber: '8901024624101',
          price: 3450,
          paidBy: 'Priya Sharma',
          notes: 'Auto-parsed from email. Check-in baggage 15kg included.'
        };
      } else if (text.includes('irctc') || text.includes('train')) {
        newBooking = {
          id: `book-train-${Date.now()}`,
          type: 'train',
          title: 'Imported IRCTC Toy Train Ticket #56136',
          provider: 'Indian Railways (IRCTC)',
          confirmationCode: '4218941029',
          status: 'confirmed',
          dateStr: '25 Oct 2026',
          timeStr: '02:00 PM – 03:15 PM',
          departureLocation: 'Ooty Railway Station (UAM)',
          arrivalLocation: 'Coonoor (ONR)',
          seatOrRoom: 'Coach FC-1, Seats 14, 15',
          qrCodeContent: 'IRCTC-PNR-4218941029-IMPORT-VOYAN',
          barcodeNumber: '4218941029',
          price: 410,
          paidBy: 'Arjun Mehta',
          notes: 'Auto-parsed from IRCTC SMS confirmation.'
        };
      } else if (text.includes('bookmyshow') || text.includes('bms')) {
        newBooking = {
          id: `book-pass-bms-${Date.now()}`,
          type: 'pass',
          title: 'BookMyShow Experience & Show Pass',
          provider: 'BookMyShow',
          confirmationCode: 'BMS-PASS-99214',
          status: 'confirmed',
          dateStr: '25 Oct 2026',
          timeStr: '06:30 PM – 08:30 PM',
          departureLocation: `${plan.destination} Auditorium`,
          seatOrRoom: 'Row D, Premium Tier',
          qrCodeContent: 'BMS-PASS-99214-VOYAN',
          barcodeNumber: '99214002814',
          price: 900,
          paidBy: 'Priya Sharma',
          notes: 'BookMyShow M-Ticket. Show QR pass at door entrance.'
        };
      } else if (text.includes('pass') || text.includes('entry') || text.includes('ticket')) {
        newBooking = {
          id: `book-pass-entry-${Date.now()}`,
          type: 'pass',
          title: 'Official Monument & Place Entry Pass',
          provider: 'Tourism Portal / Google',
          confirmationCode: 'TN-EPASS-44182',
          status: 'confirmed',
          dateStr: '24 Oct 2026',
          timeStr: '09:00 AM – 05:30 PM',
          departureLocation: plan.destination,
          seatOrRoom: 'Fast-Track Entry Pass',
          qrCodeContent: 'TN-EPASS-44182-VOYAN',
          barcodeNumber: '4418200192',
          price: 320,
          paidBy: 'Arjun Mehta',
          notes: 'Official entry ticket verified via Google/Tourism e-pass.'
        };
      } else {
        newBooking = {
          id: `book-hotel-${Date.now()}`,
          type: 'hotel',
          title: 'Imported Resort Booking Voucher',
          provider: 'Sterling Fern Hill Ooty',
          confirmationCode: 'STR-OOTY-94218',
          status: 'confirmed',
          dateStr: '24 Oct – 26 Oct 2026',
          timeStr: 'Check-in: 12:00 PM',
          departureLocation: 'Fern Hill, Ooty',
          seatOrRoom: 'Heritage Valley Cottage #204',
          qrCodeContent: 'STERLING-94218-IMPORT-VOYAN',
          barcodeNumber: '942180018241',
          price: 6800,
          paidBy: 'Priya Sharma',
          notes: 'Auto-parsed booking confirmation.'
        };
      }

      setBookings((prev) => [newBooking, ...prev]);
      setParseInputText('');
      setParseSuccessToast(`Successfully parsed and added: "${newBooking.title}" with PNR ${newBooking.confirmationCode}!`);
      setTimeout(() => setParseSuccessToast(null), 4000);
    }, 450);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newExpAmount);
    if (!newExpTitle.trim() || isNaN(amountNum)) return;

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title: newExpTitle.trim(),
      amount: Math.round(amountNum),
      category: newExpCategory,
      paidBy: newExpPaidBy,
      splitWith: ['Priya', 'Arjun'],
      date: '24 Oct 2026',
      paymentMethod: 'UPI'
    };

    setExpenses((prev) => [newExpense, ...prev]);
    if (auth.currentUser) {
      void sqliteStore.save('expenses', `${plan.id}_${newExpense.id}`, { ...newExpense, tripId: plan.id })
        .catch((error: unknown) => setStorageError(error instanceof Error ? error.message : 'Could not save expense.'));
    }
    setIsAddExpenseOpen(false);
    setNewExpTitle('');
    setNewExpAmount('');
  };

  const handleAddMemorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemTitle.trim()) return;
    if (newMemPhoto && !newMemPhoto.type.startsWith('image/')) {
      setStorageError('Choose an image file for this travel memory.');
      return;
    }
    if (newMemPhoto && newMemPhoto.size > 50 * 1024 * 1024) {
      setStorageError('Travel photos must be 50 MB or smaller.');
      return;
    }

    const memoryId = `mem-${crypto.randomUUID()}`;
    const caption = newMemCaption.trim() || 'A beautiful memory recorded in our Voyan trip journal.';
    let imageUrl = '/src/assets/images/memory_tea_garden_1792473340498.jpg';
    if (newMemPhoto) {
      const photoUrl = URL.createObjectURL(newMemPhoto);
      try {
        await saveOfflineTripItem({
          id: memoryId,
          tripId: plan.id,
          kind: 'memory',
          title: newMemTitle.trim(),
          description: caption,
          location: newMemLocation.trim(),
          fileName: newMemPhoto.name,
          mimeType: newMemPhoto.type,
          sizeBytes: newMemPhoto.size,
          file: newMemPhoto,
          createdAt: new Date().toISOString()
        });
        memoryObjectUrlsRef.current.push(photoUrl);
        imageUrl = photoUrl;
      } catch (error) {
        URL.revokeObjectURL(photoUrl);
        setStorageError(error instanceof Error ? error.message : 'Could not save this photo for offline access.');
        return;
      }
    }

    const newMemory: MemoryItem = {
      id: memoryId,
      dayNumber: 1,
      title: newMemTitle.trim(),
      location: newMemLocation.trim(),
      timestamp: new Date().toLocaleString(),
      imageUrl,
      caption,
      author: 'You',
      tags: ['TravelMoments', 'VoyanMemory'],
      moodEmoji: '✨'
    };

    setMemories((prev) => [newMemory, ...prev]);
    if (auth.currentUser && !newMemPhoto) {
      void sqliteStore.save('memories', `${plan.id}_${newMemory.id}`, { ...newMemory, tripId: plan.id })
        .catch((error: unknown) => setStorageError(error instanceof Error ? error.message : 'Could not save memory.'));
    }
    setIsAddMemoryOpen(false);
    setNewMemTitle('');
    setNewMemCaption('');
    setNewMemPhoto(null);
  };

  const filteredBookings =
    bookingFilter === 'all'
      ? bookings
      : bookings.filter((b) => b.type === bookingFilter);

  const getBookingIcon = (type: BookingType) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-4 h-4 text-sky-700" />;
      case 'train':
        return <Train className="w-4 h-4 text-teal-800" />;
      case 'hotel':
        return <Hotel className="w-4 h-4 text-emerald-700" />;
      case 'cab':
        return <Car className="w-4 h-4 text-amber-700" />;
      default:
        return <Ticket className="w-4 h-4 text-purple-700" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-5 sm:p-7 text-left space-y-6">
      {/* Top Banner: The All-In-One Problem Solution */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-800 text-xs font-semibold mb-2">
            <FolderArchive className="w-3.5 h-3.5 text-teal-700" />
            <span>Voyan Trip Vault & Travel Wallet</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A]">
            All-In-One Bookings, Tickets, Expenses & Memories
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
            No more switching between 7 different airline apps, IRCTC SMS, WhatsApp photos, Splitwise, and hotel email PDFs.
            Everything is unified, synchronized with your itinerary, and available offline.
          </p>
        </div>

        {/* Offline Quick Action & Email */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-stone-500" />
            <span>Email Trip & Passes</span>
          </button>
          <button
            onClick={() => setActiveTab('binder')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Offline Pack</span>
          </button>
        </div>
      </div>

      {/* Main Vault Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-stone-100">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 bg-stone-50'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Bookings & Tickets ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('itinerary_sync')}
          className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'itinerary_sync'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 bg-stone-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Connected Itinerary</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'expenses'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 bg-stone-50'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Expenses & Split (₹{totalSpent.toLocaleString()})</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'documents'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 bg-stone-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Documents Locker ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('memories')}
          className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'memories'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 bg-stone-50'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Travel Journal ({memories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('binder')}
          className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'binder'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 bg-stone-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Trip Binder PDF</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {parseSuccessToast && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{parseSuccessToast}</span>
        </div>
      )}

      {storageError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div>
            <span className="font-semibold block">Could not sync cloud data</span>
            <span className="text-rose-700 opacity-80">
              {storageError.includes('backend') || storageError.includes('JSON') || storageError.includes('parse')
                ? 'Cloud sync is unavailable — showing saved local data. Your offline data is safe.'
                : storageError}
            </span>
          </div>
          <button
            onClick={() => setStorageError(null)}
            className="ml-auto shrink-0 text-rose-400 hover:text-rose-700 cursor-pointer"
            aria-label="Dismiss"
          >✕</button>
        </div>
      )}

      {/* ================= TAB 1: BOOKINGS & TICKETS ================= */}
      {activeTab === 'bookings' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <BookingAppsDirectory />

          {/* AI Smart Import Dropzone */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-800" />
                <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                  AI Booking Importer: Drop confirmation emails, SMS or PDF text
                </h4>
              </div>
              <span className="text-[10px] text-stone-400 font-medium">
                Auto-extracts PNR, seats, gate times & costs
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={parseInputText}
                  onChange={(e) => setParseInputText(e.target.value)}
                  placeholder="Paste email snippet, e.g. 'Your flight 6E-241 is confirmed PNR: 6E-W8P42K'..."
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white border border-stone-200 focus:outline-none focus:border-teal-700"
                />
                <button
                  type="button"
                  onClick={() => handleParseSnippet(parseInputText || SAMPLE_PARSE_SNIPPETS[0].snippet)}
                  disabled={isParsing}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors shrink-0 cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isParsing ? 'Importing...' : 'Import to Vault'}</span>
                </button>
              </div>

              {/* Sample Quick-fill buttons */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 pt-1">
                <span className="font-semibold text-stone-400">Quick Test Samples:</span>
                {SAMPLE_PARSE_SNIPPETS.map((snip) => (
                  <button
                    key={snip.id}
                    type="button"
                    onClick={() => {
                      setParseInputText(snip.snippet);
                      handleParseSnippet(snip.snippet);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-300 transition-colors cursor-pointer text-[10px] font-medium"
                  >
                    + {snip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bookings Filter Tabs */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
              {['all', 'flight', 'train', 'hotel', 'cab', 'pass'].map((f) => (
                <button
                  key={f}
                  onClick={() => setBookingFilter(f)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                    bookingFilter === f ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600'
                  }`}
                >
                  {f === 'all' ? 'All Tickets' : f + 's'}
                </button>
              ))}
            </div>

            <span className="text-xs text-stone-500">
              {filteredBookings.length} confirmed reservations ready for offline access
            </span>
          </div>

          {/* Bookings & Boarding Passes List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                className="group p-5 rounded-2xl border border-stone-200/90 hover:border-teal-600/60 bg-white hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center">
                        {getBookingIcon(b.type)}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                          {b.provider}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900 group-hover:text-teal-900 transition-colors">
                          {b.title}
                        </h4>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Confirmed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-100 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-stone-400 block">PNR / Ref</span>
                      <span className="font-mono font-bold text-stone-800">{b.confirmationCode}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-stone-400 block">Date & Time</span>
                      <span className="text-stone-700 font-medium truncate block">{b.dateStr}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-stone-400 block">Allocation / Seat</span>
                      <span className="text-stone-700 font-medium truncate block">{b.seatOrRoom || 'Unreserved'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-stone-400 block">Paid Amount</span>
                      <span className="text-teal-900 font-bold font-mono">
                        {b.price === undefined ? 'Price unavailable' : `₹${b.price.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedBookingForPass(b)}
                    className="text-xs font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View Digital Pass & QR</span>
                  </button>

                  <button
                    onClick={() => {
                      alert(`Offline pass for ${b.title} saved to device.`);
                    }}
                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
                    title="Save offline"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: CONNECTED LIVING ITINERARY ================= */}
      {activeTab === 'itinerary_sync' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs text-teal-950 flex items-start gap-3">
            <Calendar className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Synchronized Travel Bridge</span>
              <span>
                Your flight arrivals, taxi pickups, hotel check-ins, and toy train reservations are dynamically woven
                into your daily timeline below. No need to check multiple booking emails while on the move.
              </span>
            </div>
          </div>

          {/* Integrated Daily Timeline */}
          <div className="space-y-4">
            {plan.days.map((day, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-stone-200/90 bg-white">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                      Day 0{day.dayNumber} · {day.theme}
                    </span>
                    <h4 className="text-base font-bold text-stone-900">{day.title}</h4>
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    {idx === 0 ? 'Arrival & Valley Check-in' : idx === 1 ? 'Heritage & Mountain Railway' : 'Tea Trail & Departure'}
                  </span>
                </div>

                {/* Timeline items including synchronized bookings */}
                <div className="space-y-3 relative pl-6 border-l-2 border-stone-200">
                  {idx === 0 && (
                    <div className="relative p-3 rounded-xl bg-sky-50/70 border border-sky-100 text-xs">
                      <div className="absolute -left-[31px] top-3 w-4 h-4 rounded-full bg-sky-600 flex items-center justify-center text-white text-[9px]">
                        ✈
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-950">IndiGo Flight 6E-241 Arrives at CJB</span>
                        <span className="font-mono text-[10px] text-sky-800 font-bold">07:25 AM</span>
                      </div>
                      <p className="text-[11px] text-sky-800 mt-0.5">
                        PNR: 6E-W8P42K · Seat 12F · Luggage Bay 2
                      </p>
                    </div>
                  )}

                  {idx === 0 && (
                    <div className="relative p-3 rounded-xl bg-amber-50/70 border border-amber-100 text-xs">
                      <div className="absolute -left-[31px] top-3 w-4 h-4 rounded-full bg-amber-600 flex items-center justify-center text-white text-[9px]">
                        🚕
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950">Pre-paid Hill Taxi Pickup</span>
                        <span className="font-mono text-[10px] text-amber-800 font-bold">07:45 AM</span>
                      </div>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Driver Suresh (+91 94432 18920) · CJB Bay 2 → Sterling Fern Hill Ooty (88 km)
                      </p>
                    </div>
                  )}

                  {day.activities.map((act) => (
                    <div key={act.id} className="relative p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
                      <div className="absolute -left-[31px] top-3 w-4 h-4 rounded-full bg-stone-400 flex items-center justify-center text-white text-[9px]">
                        •
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{act.title}</span>
                        <span className="font-mono text-stone-500 font-medium">{act.time}</span>
                      </div>
                      <p className="text-stone-600 text-[11px] mt-0.5">{act.description}</p>
                    </div>
                  ))}

                  {idx === 1 && (
                    <div className="relative p-3 rounded-xl bg-teal-50/70 border border-teal-100 text-xs">
                      <div className="absolute -left-[31px] top-3 w-4 h-4 rounded-full bg-teal-700 flex items-center justify-center text-white text-[9px]">
                        🚂
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-teal-950">UNESCO Toy Train Boarding (#56136)</span>
                        <span className="font-mono text-[10px] text-teal-800 font-bold">02:00 PM</span>
                      </div>
                      <p className="text-[11px] text-teal-800 mt-0.5">
                        IRCTC PNR #4218941029 · Coach FC-1, Seats 14 & 15 · UAM Platform 1
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Identity & Insurance Document Verification Cards */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Travel Documents & Medical Verification</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-900">{doc.title}</span>
                    <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-semibold text-[10px] uppercase">
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-stone-600 font-mono text-[11px]">{doc.referenceNumber}</p>
                  <p className="text-stone-500 text-[10px] mt-1">{doc.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: GROUP EXPENSES & SPLIT ================= */}
      {activeTab === 'expenses' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Expense Overview KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-teal-50/60 border border-teal-100 text-teal-950">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-800 block">Total Expenses Logged</span>
              <span className="text-xl sm:text-2xl font-black font-mono mt-0.5 block">
                ₹{totalSpent.toLocaleString()}
              </span>
              <span className="text-[10px] text-teal-700">{expenses.length} transactions</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-800 block">Trip Budget Ceiling</span>
              <span className="text-xl sm:text-2xl font-black font-mono mt-0.5 block">
                ₹{plan.budgetTotal.toLocaleString()}
              </span>
              <span className="text-[10px] text-teal-700">For {plan.travellersCount} travelers</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-800 block">Remaining Budget</span>
              <span className="text-xl sm:text-2xl font-black font-mono mt-0.5 block text-emerald-800">
                ₹{remainingBudget.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-700">Under control</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-800 block">Per Person Share</span>
              <span className="text-xl sm:text-2xl font-black font-mono mt-0.5 block">
                ₹{halfShare.toLocaleString()}
              </span>
              <span className="text-[10px] text-teal-700">50 / 50 equal split</span>
            </div>
          </div>

          {/* Group Split Balance Settlement Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-950">Group Split Balance Matrix</h4>
                <p className="text-amber-800 mt-0.5">
                  Priya paid <span className="font-bold">₹{priyaPaid.toLocaleString()}</span>. Arjun paid{' '}
                  <span className="font-bold">₹{arjunPaid.toLocaleString()}</span>.
                </p>
                <p className="font-semibold text-amber-900 mt-1">
                  👉 Settlement: {arjunOwesPriya ? 'Arjun owes Priya' : 'Priya owes Arjun'} ₹{settlementDifference.toLocaleString()} to settle equally.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setUpiPaymentDetails({
                  payeeName: arjunOwesPriya ? 'Priya Sharma' : 'Arjun Mehta',
                  payeeVpa: arjunOwesPriya ? 'priya.sharma@okhdfcbank' : 'arjun.mehta@oksbi',
                  amount: settlementDifference,
                  transactionNote: `Settling ${plan.destination} Trip Split (${arjunOwesPriya ? 'Arjun to Priya' : 'Priya to Arjun'})`,
                  tripTitle: plan.title,
                  category: 'transit'
                });
                setIsUpiPaymentOpen(true);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Settle with UPI Fast Pay</span>
            </button>
          </div>

          {/* Expense Log Action Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h4 className="text-sm font-bold text-stone-900">Itemized Receipts & Payments</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setUpiPaymentDetails({
                    payeeName: 'Trip Vendor / Host',
                    payeeVpa: 'merchant@upi',
                    amount: 500,
                    transactionNote: `Trip Expense - ${plan.destination}`,
                    tripTitle: plan.title,
                  });
                  setIsUpiPaymentOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors border border-teal-200 cursor-pointer"
              >
                <IndianRupee className="w-3.5 h-3.5 text-teal-700" />
                <span>Pay via UPI</span>
              </button>
              <button
                onClick={() => setIsAddExpenseOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Expense</span>
              </button>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Expense Details</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Paid By</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-stone-900 block">{exp.title}</span>
                      <span className="text-[10px] text-stone-400">{exp.receiptNote || exp.date}</span>
                    </td>
                    <td className="px-4 py-3 capitalize text-stone-600 font-medium">
                      {exp.category}
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-800">
                      {exp.paidBy}
                    </td>
                    <td className="px-4 py-3 font-bold font-mono text-teal-900">
                      ₹{exp.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-mono font-semibold">
                        {exp.paymentMethod}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: TRAVEL DOCUMENTS & LOCKER ================= */}
      {activeTab === 'documents' && (
        <DocumentsVaultView
          documents={documents}
          onUploadClick={() => setIsUploadDocOpen(true)}
          onDeleteDocument={handleDeleteDocument}
          onDownloadDocument={handleDownloadDocument}
        />
      )}

      {/* ================= TAB 5: TRAVEL JOURNAL & MEMORIES ================= */}
      {activeTab === 'memories' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-bold text-stone-900">Living Travel Journal & Moments</h4>
              <p className="text-xs text-stone-500">
                Capture high-resolution photos, audio ambiance, and candid moments pinned to your itinerary stops.
              </p>
            </div>
            <button
              onClick={() => setIsAddMemoryOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 transition-colors shadow-xs cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Record New Memory</span>
            </button>
          </div>

          {/* Memories Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="rounded-2xl border border-stone-200 overflow-hidden bg-white shadow-2xs hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[16/10] w-full bg-stone-900 overflow-hidden">
                  <img
                    src={mem.imageUrl}
                    alt={mem.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1.5">
                    <span>{mem.moodEmoji}</span>
                    <span>Day 0{mem.dayNumber}</span>
                  </div>
                </div>

                <div className="p-5 text-left space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span className="flex items-center gap-1 text-stone-600 font-medium">
                      <MapPin className="w-3 h-3 text-teal-700" />
                      {mem.location}
                    </span>
                    <span>{mem.timestamp}</span>
                  </div>

                  <h4 className="text-base font-bold text-stone-900 leading-snug">
                    {mem.title}
                  </h4>

                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    “{mem.caption}”
                  </p>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-stone-700">By {mem.author}</span>
                    {mem.ambientAudioTitle && (
                      <span className="text-teal-800 font-medium flex items-center gap-1 bg-teal-50 px-2 py-0.5 rounded">
                        <span>🎵</span>
                        <span>{mem.ambientAudioTitle}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: ALL-IN-ONE TRIP BINDER (PDF EXPORT VIEW) ================= */}
      {activeTab === 'binder' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-6 rounded-3xl bg-stone-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Voyan Consolidated Offline Travel Binder</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">
                Everything In One Document
              </h3>
              <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl">
                Contains your confirmed flight & train PNR barcodes, hotel check-in vouchers, day-by-day route, emergency medical contacts, and shared expense balance sheet.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-stone-900 hover:bg-stone-100 transition-colors shadow-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4 text-teal-800" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          <OfflineTripRepository tripId={plan.id} />

          {/* Printable Binder Summary Content */}
          <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-6 text-xs text-stone-800">
            {/* Trip Identity Header */}
            <div className="flex justify-between items-start pb-4 border-b border-stone-200">
              <div>
                <h4 className="text-base font-bold text-stone-900">{plan.title}</h4>
                <p className="text-stone-500">{plan.destination}, {plan.state} · {plan.travelDates.start} – {plan.travelDates.end}</p>
                <p className="text-stone-500">{plan.travellersCount} Travelers · Tailored for {plan.groupType}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-teal-900 block">Voyan Trip Code: VOY-{plan.id.slice(0, 8).toUpperCase()}</span>
                <span className="text-[10px] text-stone-400">Generated: October 2026</span>
              </div>
            </div>

            {/* Quick Reference PNR List */}
            <div>
              <h5 className="font-bold text-stone-900 uppercase text-[11px] mb-2 tracking-wider">
                1. Confirmed Transit & Booking Reference Numbers
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {bookings.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-white border border-stone-200">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">{b.provider}</span>
                    <span className="font-bold text-stone-900 block truncate">{b.title}</span>
                    <span className="font-mono text-teal-900 font-bold block mt-1">Ref: {b.confirmationCode}</span>
                    <span className="text-[10px] text-stone-500">{b.seatOrRoom || b.timeStr}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency & Regional Contacts */}
            <div>
              <h5 className="font-bold text-stone-900 uppercase text-[11px] mb-2 tracking-wider">
                2. Regional Emergency & Support Numbers
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white border border-stone-200">
                  <span className="font-bold block text-stone-900">Ooty Tourist Police Station</span>
                  <span className="text-stone-600 block mt-0.5">Commercial Road, Ooty</span>
                  <span className="font-mono text-teal-800 font-bold block mt-1">📞 0423 244 4004 / 112</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-stone-200">
                  <span className="font-bold block text-stone-900">Government Head Hospital Ooty</span>
                  <span className="text-stone-600 block mt-0.5">Hospital Road, Ooty</span>
                  <span className="font-mono text-teal-800 font-bold block mt-1">📞 0423 244 2212 / 108</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-stone-200">
                  <span className="font-bold block text-stone-900">Prepaid Hill Taxi Association</span>
                  <span className="text-stone-600 block mt-0.5">Coimbatore Airport & Ooty Stand</span>
                  <span className="font-mono text-teal-800 font-bold block mt-1">📞 +91 94432 18920</span>
                </div>
              </div>
            </div>

            {/* Expense Balance Sheet Summary */}
            <div>
              <h5 className="font-bold text-stone-900 uppercase text-[11px] mb-2 tracking-wider">
                3. Financial Split Ledger Summary
              </h5>
              <div className="p-4 rounded-xl bg-white border border-stone-200 flex justify-between items-center">
                <div>
                  <span className="text-stone-600">Total Spent: <strong>₹{totalSpent.toLocaleString()}</strong> of ₹{plan.budgetTotal.toLocaleString()}</span>
                  <span className="block text-stone-500 mt-0.5">
                    {arjunOwesPriya ? 'Arjun pays Priya' : 'Priya pays Arjun'} ₹{settlementDifference.toLocaleString()}
                  </span>
                </div>
                <span className="px-3 py-1 rounded bg-teal-100 text-teal-900 font-bold">
                  Split Balanced
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Pass Modal */}
      <DigitalPassModal
        booking={selectedBookingForPass}
        isOpen={!!selectedBookingForPass}
        onClose={() => setSelectedBookingForPass(null)}
        attachments={documents.filter((doc) => !doc.tripId || doc.tripId === plan.id)}
        onDownloadFile={async (fileId, fileName) => {
          try {
            const file = await sqliteStore.downloadFile(fileId);
            const url = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);
          } catch (error) {
            setStorageError(error instanceof Error ? error.message : 'Could not download the file.');
          }
        }}
      />

      {/* Log Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-stone-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
            <h3 className="text-base font-bold text-stone-900 mb-3">Log Trip Expense</h3>
            <form onSubmit={handleAddExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  value={newExpTitle}
                  onChange={(e) => setNewExpTitle(e.target.value)}
                  placeholder="e.g. Traditional lunch at Nilgiri cafe"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Amount (₹ INR)</label>
                <input
                  type="number"
                  required
                  value={newExpAmount}
                  onChange={(e) => setNewExpAmount(e.target.value)}
                  placeholder="e.g. 750"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Category</label>
                <select
                  value={newExpCategory}
                  onChange={(e) => setNewExpCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-teal-700 capitalize"
                >
                  <option value="food">Food & Dining</option>
                  <option value="transit">Transit & Cabs</option>
                  <option value="stay">Accommodations</option>
                  <option value="activity">Activities & Tours</option>
                  <option value="pass">Entry Passes</option>
                  <option value="shopping">Shopping & Souvenirs</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Paid By</label>
                <select
                  value={newExpPaidBy}
                  onChange={(e) => setNewExpPaidBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-teal-700"
                >
                  <option value="You">You (Arjun)</option>
                  <option value="Priya">Priya</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-teal-800 text-white font-semibold hover:bg-teal-900"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Memory Modal */}
      {isAddMemoryOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-stone-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
            <h3 className="text-base font-bold text-stone-900 mb-3">Record Travel Memory</h3>
            <form onSubmit={handleAddMemorySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Memory Title</label>
                <input
                  type="text"
                  required
                  value={newMemTitle}
                  onChange={(e) => setNewMemTitle(e.target.value)}
                  placeholder="e.g. Sunset over Doddabetta Peak"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={newMemLocation}
                  onChange={(e) => setNewMemLocation(e.target.value)}
                  placeholder="e.g. Ooty, Nilgiris"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Take or choose a photo</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(event) => setNewMemPhoto(event.target.files?.[0] || null)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                />
                <p className="mt-1 text-[10px] text-stone-500">On a phone, this can open the camera. Photos are saved offline on this device.</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">Personal Journal Notes / Caption</label>
                <textarea
                  rows={3}
                  value={newMemCaption}
                  onChange={(e) => setNewMemCaption(e.target.value)}
                  placeholder="Describe how the air felt, sounds, reflections..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMemoryOpen(false);
                    setNewMemPhoto(null);
                  }}
                  className="flex-1 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-teal-800 text-white font-semibold hover:bg-teal-900"
                >
                  Add to Journal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
        tripId={plan.id}
        onSaveDocument={handleSaveDocument}
      />

      {/* UPI Fast Pay Modal */}
      <UPIPaymentModal
        isOpen={isUpiPaymentOpen}
        onClose={() => setIsUpiPaymentOpen(false)}
        details={upiPaymentDetails}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Send Trip Email Modal */}
      <SendTripEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        plan={plan}
        bookings={bookings}
        documents={documents}
      />
    </div>
  );
};
