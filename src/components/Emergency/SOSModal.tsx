import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Phone,
  PhoneCall,
  MapPin,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  Shield,
  ShieldAlert,
  BadgeAlert,
  Hospital,
  Pill,
  ExternalLink,
  Plus,
  Trash2,
  User,
  Heart,
  Activity,
  Flame,
  X,
  RefreshCw,
  Navigation,
  Send,
  MessageSquare,
  Clock,
  RotateCcw,
  Settings2
} from 'lucide-react';
import { EmergencyContact } from '../../types/emergency';
import {
  NATIONAL_HELPLINES,
  getEmergencyFacilitiesForDestination,
  OFFLINE_FIRST_AID_GUIDES
} from '../../data/emergencyData';
import { startEmergencySiren, stopEmergencySiren } from '../../utils/sirenAudio';
import {
  createSOSLiveSession,
  startSOSLocationWatcher,
  stopSOSLiveSession,
  updateSOSLiveLocation,
  type SOSLiveLocation,
  type SavedSOSLiveSession
} from '../../lib/sosLiveLocation';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
}

const DEFAULT_CONTACTS: EmergencyContact[] = [
  {
    id: 'default-1',
    name: 'Primary Family Contact',
    relationship: 'Family / Next of Kin',
    phone: '+91 98765 43210',
    isPrimary: true
  },
  {
    id: 'default-2',
    name: 'Travel Companion / Guide',
    relationship: 'Trip Leader',
    phone: '+91 91234 56789',
    isPrimary: false
  }
];

export interface SMSDispatchRecord {
  id: string;
  timestamp: string;
  recipients: string[];
  recipientNames: string[];
  coordsText: string;
  mapsUrl: string;
}

/**
 * Format SMS URI cross-platform (iOS vs Android / RFC 5724)
 */
export const formatSMSUri = (phoneNumbers: string[], message: string): string => {
  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  // Sanitize numbers to E.164-compatible or standard digit formats
  const cleanNumbers = phoneNumbers
    .map((p) => p.replace(/[^\d+]/g, ''))
    .filter((p) => p.length >= 3);

  const encodedMessage = encodeURIComponent(message);

  if (isIOS) {
    // iOS standard format: sms:NUMBER1;NUMBER2&body=TEXT or sms:&body=TEXT
    const target = cleanNumbers.join(';');
    return target ? `sms:${target}&body=${encodedMessage}` : `sms:&body=${encodedMessage}`;
  } else {
    // Android / RFC 5724 standard format: sms:NUMBER1,NUMBER2?body=TEXT
    const target = cleanNumbers.join(',');
    return target ? `sms:${target}?body=${encodedMessage}` : `sms:?body=${encodedMessage}`;
  }
};

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  destination
}) => {
  const [activeTab, setActiveTab] = useState<'dispatch' | 'facilities' | 'contacts' | 'firstaid'>('dispatch');
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [copiedDistressText, setCopiedDistressText] = useState(false);
  const [safeBroadcastSent, setSafeBroadcastSent] = useState(false);

  // Auto-send SMS on SOS trigger setting
  const [autoSendEnabled, setAutoSendEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('voyan_auto_send_sos_sms');
      return stored !== 'false'; // Default is true!
    } catch {
      return true;
    }
  });

  // Countdown timer state (e.g. 3, 2, 1, then dispatch)
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownCancelled, setCountdownCancelled] = useState(false);

  // SMS dispatch confirmation & history
  const [lastDispatchRecord, setLastDispatchRecord] = useState<SMSDispatchRecord | null>(() => {
    try {
      const raw = localStorage.getItem('voyan_last_sos_dispatch');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // GPS State
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [liveShareUrl, setLiveShareUrl] = useState('');
  const [liveShareError, setLiveShareError] = useState<string | null>(null);
  const [copiedLiveLink, setCopiedLiveLink] = useState(false);
  const gpsCleanupRef = useRef<(() => Promise<void>) | null>(null);
  const gpsGenerationRef = useRef(0);
  const liveShareGenerationRef = useRef(0);
  const liveSessionRef = useRef<SavedSOSLiveSession | null>(null);
  const liveSessionPromiseRef = useRef<Promise<SavedSOSLiveSession | null> | null>(null);
  const latestLocationRef = useRef<SOSLiveLocation | null>(null);
  const lastLocationUpdateAtRef = useRef(0);

  // Contacts state
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    try {
      const saved = localStorage.getItem('voyan_emergency_contacts');
      return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
    } catch {
      return DEFAULT_CONTACTS;
    }
  });

  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);

  // Facilities filter
  const [facilityFilter, setFacilityFilter] = useState<'all' | 'hospital' | 'police' | 'pharmacy'>('all');
  const [selectedFirstAid, setSelectedFirstAid] = useState<string>('guide-altitude');

  const facilities = getEmergencyFacilitiesForDestination(destination);

  // Save contacts
  useEffect(() => {
    try {
      localStorage.setItem('voyan_emergency_contacts', JSON.stringify(contacts));
    } catch (e) {
      console.error('Failed to store contacts in localStorage', e);
    }
  }, [contacts]);

  // Save auto-send setting
  useEffect(() => {
    try {
      localStorage.setItem('voyan_auto_send_sos_sms', autoSendEnabled ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to store auto-send setting', e);
    }
  }, [autoSendEnabled]);

  // Compose Distress Message
  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];
  const mapsLink = coords
    ? `https://maps.google.com/?q=${coords.lat},${coords.lng}`
    : `https://maps.google.com/?q=${encodeURIComponent(destination)}`;

  const buildDistressMessageText = (targetCoords = coords) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const locationString = targetCoords
      ? `${targetCoords.lat}° N, ${targetCoords.lng}° E (±${targetCoords.accuracy || 10}m accuracy)`
      : `Live GPS unavailable; approximate destination: ${destination}`;

    return (
      `🚨 EMERGENCY DISTRESS ALERT!\n` +
      `I need immediate emergency assistance!\n\n` +
      `📍 Destination: ${destination}\n` +
      `🧭 Live GPS: ${locationString}\n` +
      `🗺️ Live Google Map: ${mapsLink}\n` +
      (liveShareUrl ? `🔴 Live tracking link: ${liveShareUrl}\n` : '') +
      `⏰ Timestamp: ${time}\n\n` +
      `Please call emergency response (112 / 108) or dispatch assistance immediately!\n` +
      `[Dispatched via Voyan Travel SOS]`
    );
  };

  const distressMessage = encodeURIComponent(buildDistressMessageText());

  const safeMessage = encodeURIComponent(
    `✅ UPDATE: I am now SAFE and secure.\n\n` +
    `The emergency at ${destination} has been resolved. Thank you for your prompt assistance and support!`
  );

  // Request GPS position when modal opens
  const publishLiveLocation = async (session: SavedSOSLiveSession, location: SOSLiveLocation, force = false) => {
    const now = Date.now();
    if (!force && now - lastLocationUpdateAtRef.current < 5000) return;
    lastLocationUpdateAtRef.current = now;
    try {
      await updateSOSLiveLocation(session, location);
      setLiveShareError(null);
    } catch (error) {
      setLiveShareError(error instanceof Error ? error.message : 'Could not update the shared SOS location.');
    }
  };

  const startLiveSharing = () => {
    const generation = liveShareGenerationRef.current;
    setLiveShareError(null);
    const sessionPromise = createSOSLiveSession()
      .then(async (session) => {
        const savedSession: SavedSOSLiveSession = { ...session, startedAt: new Date().toISOString() };
        if (generation !== liveShareGenerationRef.current) {
          await stopSOSLiveSession(savedSession);
          return null;
        }
        liveSessionRef.current = savedSession;
        setLiveShareUrl(savedSession.liveUrl);
        if (latestLocationRef.current) {
          void publishLiveLocation(savedSession, latestLocationRef.current, true);
        }
        return savedSession;
      })
      .catch((error: unknown) => {
        if (generation === liveShareGenerationRef.current) {
          setLiveShareError(error instanceof Error ? error.message : 'Could not start live SOS sharing.');
        }
        return null;
      });
    liveSessionPromiseRef.current = sessionPromise;
  };

  const fetchLocation = () => {
    const generation = ++gpsGenerationRef.current;
    const stopPreviousWatcher = gpsCleanupRef.current;
    gpsCleanupRef.current = null;
    if (stopPreviousWatcher) void stopPreviousWatcher();

    setCoords(null);
    setGpsError(null);
    setGpsLoading(true);
    latestLocationRef.current = null;

    void startSOSLocationWatcher(
      (location) => {
        if (generation !== gpsGenerationRef.current) return;
        const latestLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy
        };
        latestLocationRef.current = latestLocation;
        setCoords({
          lat: parseFloat(location.latitude.toFixed(6)),
          lng: parseFloat(location.longitude.toFixed(6)),
          accuracy: Math.round(location.accuracy)
        });
        setGpsLoading(false);
        const activeSession = liveSessionRef.current;
        if (activeSession) {
          void publishLiveLocation(activeSession, latestLocation);
        } else {
          void liveSessionPromiseRef.current?.then((session) => {
            if (session) return publishLiveLocation(session, latestLocation, true);
          });
        }
      },
      (message) => {
        if (generation !== gpsGenerationRef.current) return;
        setCoords(null);
        setGpsError(`${message} Tap Refresh GPS to try again.`);
        setGpsLoading(false);
      }
    ).then((stopWatcher) => {
      if (generation !== gpsGenerationRef.current) {
        void stopWatcher();
        return;
      }
      gpsCleanupRef.current = stopWatcher;
    }).catch((error: unknown) => {
      if (generation !== gpsGenerationRef.current) return;
      setGpsError(error instanceof Error ? error.message : 'Could not start live GPS. Check location permission and try again.');
      setGpsLoading(false);
    });
  };

  // Execute Dispatch SMS to one or multiple emergency contacts
  const executeSendSMS = (targetContacts: EmergencyContact[], isAutomated = false) => {
    if (targetContacts.length === 0) {
      // Fallback: prompt to add a contact or use default 112
      setActiveTab('contacts');
      return;
    }

    const messageText = buildDistressMessageText();
    const phoneList = targetContacts.map((c) => c.phone);
    const smsUri = formatSMSUri(phoneList, messageText);

    // 1. Copy full distress message to clipboard immediately as backup
    try {
      navigator.clipboard.writeText(messageText);
      setCopiedDistressText(true);
      setTimeout(() => setCopiedDistressText(false), 3500);
    } catch (err) {
      console.warn('Failed to copy to clipboard', err);
    }

    // 2. Trigger native SMS app
    try {
      const link = document.createElement('a');
      link.href = smsUri;
      link.setAttribute('rel', 'noopener noreferrer');
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 400);
    } catch (e) {
      console.warn('Direct SMS link trigger error:', e);
      window.location.href = smsUri;
    }

    // 3. Record dispatch log
    const record: SMSDispatchRecord = {
      id: `sos-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      recipients: phoneList,
      recipientNames: targetContacts.map((c) => c.name),
      coordsText: coords ? `${coords.lat}, ${coords.lng}` : destination,
      mapsUrl: mapsLink
    };

    setLastDispatchRecord(record);
    try {
      localStorage.setItem('voyan_last_sos_dispatch', JSON.stringify(record));
    } catch {}

    setCountdown(null);
  };

  // Triggered when modal opens: If auto-send is enabled, start 3-second countdown
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isOpen) {
      liveShareGenerationRef.current += 1;
      latestLocationRef.current = null;
      liveSessionRef.current = null;
      liveSessionPromiseRef.current = null;
      lastLocationUpdateAtRef.current = 0;
      setLiveShareUrl('');
      setLiveShareError(null);
      fetchLocation();
      startLiveSharing();
      setCountdownCancelled(false);

      if (autoSendEnabled && contacts.length > 0) {
        setCountdown(3);
      } else {
        setCountdown(null);
      }
    } else {
      // Clean up on close
      gpsGenerationRef.current += 1;
      liveShareGenerationRef.current += 1;
      const stopWatcher = gpsCleanupRef.current;
      gpsCleanupRef.current = null;
      if (stopWatcher) void stopWatcher();
      const pendingSession = liveSessionPromiseRef.current;
      liveSessionPromiseRef.current = null;
      const activeSession = liveSessionRef.current;
      liveSessionRef.current = null;
      if (activeSession) {
        void stopSOSLiveSession(activeSession).catch((error: unknown) => {
          console.error('Could not stop live SOS sharing:', error);
        });
      } else if (pendingSession) {
        void pendingSession.then((session) => {
          if (session) return stopSOSLiveSession(session);
        }).catch((error: unknown) => {
          console.error('Could not stop pending live SOS sharing:', error);
        });
      }
      latestLocationRef.current = null;
      setLiveShareUrl('');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCountdown(null);
      if (isSirenActive) {
        stopEmergencySiren();
        setIsSirenActive(false);
      }
      setIsStrobeActive(false);
    }
  }, [isOpen]);

  // Handle countdown interval
  useEffect(() => {
    if (countdown === null) return;

    if (countdown <= 0) {
      // Dispatch immediately!
      executeSendSMS(contacts, true);
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, contacts]);

  const handleCancelCountdown = () => {
    setCountdown(null);
    setCountdownCancelled(true);
  };

  // Toggle Siren
  const handleToggleSiren = () => {
    if (isSirenActive) {
      stopEmergencySiren();
      setIsSirenActive(false);
    } else {
      startEmergencySiren();
      setIsSirenActive(true);
    }
  };

  // Toggle Visual Strobe
  const handleToggleStrobe = () => {
    setIsStrobeActive((prev) => !prev);
  };

  // Strobe effect flasher interval
  const [strobeColor, setStrobeColor] = useState<'red' | 'white'>('red');
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isStrobeActive) {
      interval = setInterval(() => {
        setStrobeColor((prev) => (prev === 'red' ? 'white' : 'red'));
      }, 180);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStrobeActive]);

  // Copy coordinates
  const handleCopyCoords = () => {
    const locationText = coords ? `${coords.lat}, ${coords.lng}` : 'Live GPS unavailable';
    const mapUrl = coords
      ? `https://maps.google.com/?q=${coords.lat},${coords.lng}`
      : `https://maps.google.com/?q=${encodeURIComponent(destination)}`;
    const text = `🚨 EMERGENCY DISTRESS BEACON\nLocation: ${destination}\nCoordinates: ${locationText}\nLive Map: ${mapUrl}\nTime: ${new Date().toLocaleTimeString()}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2500);
  };

  const handleCopyLiveLink = async () => {
    if (!liveShareUrl) return;
    try {
      await navigator.clipboard.writeText(liveShareUrl);
      setCopiedLiveLink(true);
      window.setTimeout(() => setCopiedLiveLink(false), 2500);
    } catch (error) {
      setLiveShareError('Could not copy the live link. Select and copy it manually.');
    }
  };

  const handleCopyFullMessage = () => {
    navigator.clipboard.writeText(buildDistressMessageText());
    setCopiedDistressText(true);
    setTimeout(() => setCopiedDistressText(false), 2500);
  };

  const handleSendWhatsAppDistress = () => {
    const phone = primaryContact?.phone.replace(/[^0-9]/g, '') || '';
    const url = phone
      ? `https://wa.me/${phone}?text=${distressMessage}`
      : `https://wa.me/?text=${distressMessage}`;
    window.open(url, '_blank');
  };

  const handleSendSafeBroadcast = () => {
    const phone = primaryContact?.phone.replace(/[^0-9]/g, '') || '';
    const url = phone
      ? `https://wa.me/${phone}?text=${safeMessage}`
      : `https://wa.me/?text=${safeMessage}`;
    window.open(url, '_blank');
    setSafeBroadcastSent(true);
    setTimeout(() => setSafeBroadcastSent(false), 4000);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: EmergencyContact = {
      id: `contact-${Date.now()}`,
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: newContactRelation.trim() || 'Emergency Contact',
      isPrimary: contacts.length === 0
    };

    setContacts([...contacts, newContact]);
    setNewContactName('');
    setNewContactPhone('');
    setNewContactRelation('');
    setIsAddingContact(false);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const handleSetPrimary = (id: string) => {
    setContacts(
      contacts.map((c) => ({
        ...c,
        isPrimary: c.id === id
      }))
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Full-screen Visual Morse Strobe Overlay if active */}
      {isStrobeActive && (
        <div
          className={`fixed inset-0 z-100 flex flex-col items-center justify-center p-6 transition-colors duration-75 select-none ${
            strobeColor === 'red' ? 'bg-red-600 text-white' : 'bg-white text-red-600'
          }`}
        >
          <div className="text-center max-w-md animate-pulse">
            <ShieldAlert className="w-24 h-24 mx-auto mb-4" />
            <h1 className="text-4xl font-black tracking-widest uppercase mb-2">
              SOS STROBE ACTIVE
            </h1>
            <p className="text-lg font-bold opacity-90 mb-8">
              Flashing visual rescue beacon for nighttime or low-visibility detection.
            </p>
            <button
              onClick={handleToggleStrobe}
              className="px-8 py-4 bg-stone-900 text-white font-extrabold text-lg rounded-2xl shadow-2xl hover:bg-black transition-transform active:scale-95 cursor-pointer"
            >
              STOP STROBE LIGHT
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
        <div
          className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border border-red-200 overflow-hidden text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-5 py-4 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner animate-pulse">
                <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight uppercase">
                    Voyan Emergency SOS Hub
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-bold tracking-wider uppercase">
                    Auto-SMS Enabled
                  </span>
                </div>
                <p className="text-xs text-red-100 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>Active Destination: <strong className="text-white">{destination}</strong></span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Emergency Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center border-b border-stone-200 bg-stone-50 px-3 sm:px-5 shrink-0 overflow-x-auto no-scrollbar gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'dispatch'
                  ? 'border-red-600 text-red-700'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>Distress & SMS Dispatch</span>
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'contacts'
                  ? 'border-red-600 text-red-700'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <Heart className="w-4 h-4 text-red-600" />
              <span>Emergency Contacts ({contacts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('facilities')}
              className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'facilities'
                  ? 'border-red-600 text-red-700'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <Hospital className="w-4 h-4 text-rose-600" />
              <span>Hospitals & Police ({facilities.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('firstaid')}
              className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'firstaid'
                  ? 'border-red-600 text-red-700'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <Activity className="w-4 h-4 text-amber-600" />
              <span>Offline First-Aid</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* TOP DYNAMIC SOS BANNER: Live Auto-Countdown or Dispatched Status */}
            {countdown !== null && countdown > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-xl border-2 border-white/40 animate-pulse">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white text-red-700 font-black text-2xl flex items-center justify-center shrink-0 shadow-lg">
                      {countdown}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-black tracking-wide uppercase">
                          Auto-Sending SMS To {contacts.length} Emergency Contacts
                        </span>
                        <span className="text-[10px] bg-red-950/40 text-red-100 font-mono px-2 py-0.5 rounded-full">
                          {countdown}s remaining
                        </span>
                      </div>
                      <p className="text-xs text-red-100 mt-0.5">
                        Distress message with live GPS coordinates will launch in your device messenger.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={handleCancelCountdown}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel Auto-Send
                    </button>
                    <button
                      onClick={() => executeSendSMS(contacts)}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white text-red-700 hover:bg-stone-100 text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      Send Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* If countdown was cancelled */}
            {countdownCancelled && !lastDispatchRecord && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Auto-send cancelled. You can tap <strong>&ldquo;Send SMS Distress Now&rdquo;</strong> anytime to alert contacts.
                  </span>
                </div>
                <button
                  onClick={() => executeSendSMS(contacts)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer"
                >
                  Send SMS Now
                </button>
              </div>
            )}

            {/* Last Dispatch Status Confirmation Banner */}
            {lastDispatchRecord && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500/80 text-emerald-950 shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-black text-emerald-950 uppercase tracking-tight">
                          Distress SMS Dispatched
                        </h3>
                        <span className="text-[10px] font-mono font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                          {lastDispatchRecord.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 mt-1">
                        Emergency SMS intent opened for <strong>{lastDispatchRecord.recipientNames.join(', ')}</strong> with GPS coordinates:
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 font-semibold text-emerald-900">
                          {lastDispatchRecord.coordsText}
                        </span>
                        <a
                          href={lastDispatchRecord.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 underline font-semibold flex items-center gap-1 hover:text-emerald-900"
                        >
                          <span>Verify Map Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={handleCopyFullMessage}
                      className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedDistressText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedDistressText ? 'Copied' : 'Copy Alert Text'}</span>
                    </button>

                    <button
                      onClick={() => executeSendSMS(contacts)}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Resend SMS</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: DISTRESS & DISPATCH */}
            {activeTab === 'dispatch' && (
              <div className="space-y-6">
                {/* 1. Live GPS Beacon Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 text-white shadow-md relative overflow-hidden border border-stone-800">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      <h3 className="text-sm font-bold tracking-wider uppercase text-stone-200">
                        Live GPS Distress Beacon
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={fetchLocation}
                        disabled={gpsLoading}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                        <span>{gpsLoading ? 'Locating...' : 'Refresh GPS'}</span>
                      </button>

                      <button
                        onClick={handleCopyCoords}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedCoords ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Pin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-950/70 p-3.5 rounded-xl border border-stone-800">
                    <div>
                      <p className="text-[11px] text-stone-400 font-medium">Live Coordinates</p>
                      <p className="text-base font-mono font-bold text-amber-400 mt-0.5">
                        {coords
                          ? `${coords.lat}° N, ${coords.lng}° E`
                          : gpsLoading
                            ? 'Getting live location...'
                            : 'Live location unavailable'}
                      </p>
                      {coords?.accuracy && (
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          Accuracy: ±{coords.accuracy} meters • High Precision GPS
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-[11px] text-stone-400 font-medium">Destination Zone</p>
                      <p className="text-sm font-semibold text-white mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        <span>{destination}</span>
                      </p>
                      <a
                        href={mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-teal-400 hover:underline flex items-center gap-1 mt-1 font-semibold"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  {gpsError && (
                    <p className="text-[11px] text-amber-300 mt-2 bg-amber-950/40 p-2 rounded-lg border border-amber-900/50">
                      ℹ️ {gpsError}
                    </p>
                  )}
                  {liveShareUrl && (
                    <div className="mt-3 rounded-xl border border-red-900/70 bg-red-950/50 p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-red-200">Live location link is active</p>
                          <a
                            href={liveShareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block break-all text-[11px] text-white underline decoration-red-400 underline-offset-2"
                          >
                            {liveShareUrl}
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleCopyLiveLink()}
                          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                        >
                          {copiedLiveLink ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                          {copiedLiveLink ? 'Copied' : 'Copy live link'}
                        </button>
                      </div>
                      <p className="mt-2 text-[10px] text-red-200">
                        Share only with trusted emergency contacts. This link stops updating when you close SOS.
                      </p>
                    </div>
                  )}
                  {liveShareError && (
                    <p role="alert" className="mt-2 rounded-lg border border-amber-900/50 bg-amber-950/40 p-2 text-[11px] text-amber-200">
                      Live sharing issue: {liveShareError}
                    </p>
                  )}
                </div>

                {/* 2. Primary 1-Tap SOS Dispatch Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* SMS Emergency Broadcast to ALL Contacts */}
                  <button
                    onClick={() => executeSendSMS(contacts)}
                    className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold flex items-center justify-between gap-3 shadow-lg hover:shadow-xl transition-all cursor-pointer group text-left border border-red-500"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black uppercase tracking-wide">
                            Send SMS Distress
                          </span>
                          <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded font-mono">
                            {contacts.length} Contacts
                          </span>
                        </div>
                        <div className="text-xs text-red-100 mt-0.5 line-clamp-1">
                          Offline SMS blast with live GPS coordinates
                        </div>
                      </div>
                    </div>
                    <span className="text-xs bg-white text-red-700 font-black px-3 py-1.5 rounded-xl shrink-0 group-hover:bg-red-50">
                      Dispatch
                    </span>
                  </button>

                  {/* WhatsApp Emergency Broadcast */}
                  <button
                    onClick={handleSendWhatsAppDistress}
                    className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-between gap-3 shadow-lg hover:shadow-xl transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <Send className="w-5 h-5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                      <div>
                        <div className="text-sm font-black uppercase tracking-wide">
                          1-Tap WhatsApp SOS
                        </div>
                        <div className="text-xs text-emerald-100 mt-0.5 line-clamp-1">
                          Share GPS link to {primaryContact ? primaryContact.name : 'Emergency Contact'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs bg-white text-emerald-800 font-extrabold px-3 py-1.5 rounded-xl shrink-0">
                      WhatsApp
                    </span>
                  </button>
                </div>

                {/* Auto-Send SMS Preference Card */}
                <div className="p-3.5 rounded-2xl bg-stone-100/90 border border-stone-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Settings2 className="w-4 h-4 text-stone-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">
                        Auto-dispatch SMS when SOS button is pressed
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Starts a 3-second safety countdown, then immediately dispatches distress SMS with GPS coordinates.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={autoSendEnabled}
                      onChange={(e) => setAutoSendEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                {/* 3. Physical Remote Alert Tools: Audio Siren & Strobe */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-950">
                        Rescue Siren & Visual Beacon
                      </h4>
                      <p className="text-xs text-amber-800 mt-0.5">
                        High-decibel acoustic siren and optical strobe for remote trails, dark roads, or search teams.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={handleToggleSiren}
                      className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer ${
                        isSirenActive
                          ? 'bg-red-600 hover:bg-red-700 text-white animate-bounce'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      {isSirenActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span>{isSirenActive ? 'Stop Siren' : 'Loud Siren'}</span>
                    </button>

                    <button
                      onClick={handleToggleStrobe}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs bg-stone-900 hover:bg-black text-white flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span>SOS Strobe</span>
                    </button>
                  </div>
                </div>

                {/* 4. National Priority Helplines Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                      <PhoneCall className="w-4 h-4 text-red-600" />
                      <span>Instant 24/7 Helplines (Tap to Call)</span>
                    </h3>
                    <span className="text-[11px] font-semibold text-stone-500">
                      Toll-Free Across India
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {NATIONAL_HELPLINES.map((line) => (
                      <a
                        key={line.number}
                        href={`tel:${line.number}`}
                        className="p-3.5 rounded-2xl border border-stone-200 bg-white hover:border-red-400 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xl font-black text-red-600 font-mono tracking-tight group-hover:scale-105 transition-transform inline-block">
                              {line.number}
                            </span>
                            {line.badge && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                                {line.badge}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                            {line.label}
                          </h4>
                          <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2">
                            {line.subtitle}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                          <span className="text-stone-400 text-[10px]">{line.available}</span>
                          <span className="font-bold text-teal-800 flex items-center gap-1 group-hover:text-red-600">
                            <Phone className="w-3 h-3" />
                            <span>Dial</span>
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* 5. De-escalation "I am Safe" broadcast */}
                <div className="pt-2 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-stone-500">
                    Once danger has passed, notify your emergency contacts that you are out of harm’s way.
                  </p>
                  <button
                    onClick={handleSendSafeBroadcast}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{safeBroadcastSent ? 'Safe Alert Sent!' : 'Broadcast "I Am Safe"'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: EMERGENCY CONTACTS */}
            {activeTab === 'contacts' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      Personal Emergency Contacts ({contacts.length})
                    </h3>
                    <p className="text-xs text-stone-500">
                      Automatically sent distress SMS with live GPS location when you press SOS.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => executeSendSMS(contacts)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>SMS All Now</span>
                    </button>

                    <button
                      onClick={() => setIsAddingContact(!isAddingContact)}
                      className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Contact</span>
                    </button>
                  </div>
                </div>

                {/* Add Contact Form */}
                {isAddingContact && (
                  <form
                    onSubmit={handleAddContact}
                    className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-3"
                  >
                    <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                      Add New Emergency Contact
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <input
                        type="text"
                        placeholder="Full Name (e.g. Maya Sharma)"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        required
                        className="px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
                      />
                      <input
                        type="tel"
                        placeholder="Phone / SMS Number (+91...)"
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        required
                        className="px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
                      />
                      <input
                        type="text"
                        placeholder="Relationship (e.g. Mother, Partner)"
                        value={newContactRelation}
                        onChange={(e) => setNewContactRelation(e.target.value)}
                        className="px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingContact(false)}
                        className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Save Emergency Contact
                      </button>
                    </div>
                  </form>
                )}

                {/* Contacts List */}
                <div className="space-y-2.5">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs hover:border-stone-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-stone-900">
                              {contact.name}
                            </span>
                            {contact.isPrimary && (
                              <span className="text-[10px] bg-red-100 text-red-800 font-extrabold px-2 py-0.5 rounded-full">
                                PRIMARY SOS DISPATCH
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {contact.relationship} •{' '}
                            <span className="font-mono font-medium text-stone-800">{contact.phone}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                        {!contact.isPrimary && (
                          <button
                            onClick={() => handleSetPrimary(contact.id)}
                            className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:border-red-400 hover:text-red-700 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Set Primary
                          </button>
                        )}

                        {/* Direct SMS button for individual contact */}
                        <button
                          onClick={() => executeSendSMS([contact])}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          title={`Send emergency SMS with GPS to ${contact.name}`}
                        >
                          <MessageSquare className="w-3 h-3 text-white" />
                          <span>SMS</span>
                        </button>

                        <a
                          href={`tel:${contact.phone}`}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>

                        <a
                          href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}?text=${distressMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: HOSPITALS & POLICE */}
            {activeTab === 'facilities' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      Emergency Facilities near {destination}
                    </h3>
                    <p className="text-xs text-stone-500">
                      Pre-verified trauma centers, police stations, and 24/7 pharmacies
                    </p>
                  </div>

                  {/* Filter buttons */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setFacilityFilter('all')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        facilityFilter === 'all' ? 'bg-white shadow-xs text-stone-900 font-bold' : 'text-stone-600'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFacilityFilter('hospital')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        facilityFilter === 'hospital' ? 'bg-white shadow-xs text-red-700 font-bold' : 'text-stone-600'
                      }`}
                    >
                      Hospitals
                    </button>
                    <button
                      onClick={() => setFacilityFilter('police')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        facilityFilter === 'police' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-stone-600'
                      }`}
                    >
                      Police
                    </button>
                    <button
                      onClick={() => setFacilityFilter('pharmacy')}
                      className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        facilityFilter === 'pharmacy' ? 'bg-white shadow-xs text-emerald-700 font-bold' : 'text-stone-600'
                      }`}
                    >
                      Pharmacy
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {facilities
                    .filter((f) => facilityFilter === 'all' || f.type === facilityFilter)
                    .map((facility) => {
                      const icon =
                        facility.type === 'hospital' ? (
                          <Hospital className="w-5 h-5 text-red-600" />
                        ) : facility.type === 'police' ? (
                          <BadgeAlert className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Pill className="w-5 h-5 text-emerald-600" />
                        );

                      return (
                        <div
                          key={facility.id}
                          className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                              {icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-stone-900">
                                  {facility.name}
                                </h4>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                                  {facility.type}
                                </span>
                              </div>
                              <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                                <span>{facility.address} • <strong>{facility.distance}</strong></span>
                              </p>
                              {facility.emergencySpecialty && (
                                <p className="text-[11px] text-teal-800 font-medium mt-1">
                                  🏥 {facility.emergencySpecialty}
                                </p>
                              )}
                              <p className="text-[10px] text-stone-400 mt-0.5">
                                Hours: {facility.openHours}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                            <a
                              href={`tel:${facility.phone}`}
                              className="flex-1 sm:flex-initial px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call {facility.phone}</span>
                            </a>
                            <a
                              href={`https://maps.google.com/?q=${encodeURIComponent(
                                `${facility.name} ${facility.address}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              title="Directions"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* TAB 4: OFFLINE FIRST-AID */}
            {activeTab === 'firstaid' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Offline First-Aid & Triage Emergency Protocols
                  </h3>
                  <p className="text-xs text-stone-500">
                    Zero-connectivity medical guidance verified for wilderness and high-altitude travel
                  </p>
                </div>

                {/* Guide Selector Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {OFFLINE_FIRST_AID_GUIDES.map((guide) => (
                    <button
                      key={guide.id}
                      onClick={() => setSelectedFirstAid(guide.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        selectedFirstAid === guide.id
                          ? 'border-red-600 bg-red-50 text-red-900 font-bold shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <span className="text-[10px] font-extrabold uppercase tracking-wider block text-stone-400">
                        {guide.category}
                      </span>
                      <span className="text-xs font-bold line-clamp-1 mt-0.5">
                        {guide.title.split('&')[0]}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Active Guide Content */}
                {(() => {
                  const guide =
                    OFFLINE_FIRST_AID_GUIDES.find((g) => g.id === selectedFirstAid) ||
                    OFFLINE_FIRST_AID_GUIDES[0];

                  return (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div>
                          <h4 className="text-base font-bold text-stone-900">
                            {guide.title}
                          </h4>
                          <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wide">
                            Severity: {guide.severity}
                          </span>
                        </div>
                        <a
                          href="tel:108"
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call 108 Ambulance</span>
                        </a>
                      </div>

                      {/* Symptoms */}
                      <div>
                        <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Recognize Symptoms</span>
                        </h5>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-700">
                          {guide.symptoms.map((s, idx) => (
                            <li key={idx} className="flex items-start gap-2 bg-stone-50 p-2 rounded-lg">
                              <span className="text-amber-600 font-bold">•</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Immediate Steps */}
                      <div>
                        <h5 className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Immediate Life-Saving Steps</span>
                        </h5>
                        <ol className="space-y-2 text-xs text-stone-800">
                          {guide.immediateSteps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="font-medium leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Strict DO NOTS */}
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200">
                        <h5 className="text-xs font-bold text-red-900 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                          <X className="w-3.5 h-3.5 text-red-600" />
                          <span>Dangerous Mistakes: WHAT NOT TO DO</span>
                        </h5>
                        <ul className="space-y-1 text-xs text-red-800">
                          {guide.doNots.map((not, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="font-bold">✕</span>
                              <span>{not}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* When to evacuate */}
                      <div className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                        <strong>Critical Evacuation Trigger:</strong> {guide.whenToCallAmbulance}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-teal-700" />
              <span>Emergency SMS auto-dispatches to saved contacts with live GPS fix • Press <strong>Esc</strong> to close</span>
            </div>
            <div className="font-mono text-stone-400">
              Voyan Sentinel Safety Engine v2.5
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
