import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  Ticket,
  ShieldCheck,
  Smartphone,
  IndianRupee,
  RefreshCw
} from 'lucide-react';
import { TripPlan } from '../../types/travel';
import { BookingItem, TripDocumentItem } from '../../types/tripVault';
import { apiUrl } from '../../lib/api';

interface SendTripEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: TripPlan;
  bookings?: BookingItem[];
  documents?: TripDocumentItem[];
}

export const SendTripEmailModal: React.FC<SendTripEmailModalProps> = ({
  isOpen,
  onClose,
  plan,
  bookings = [],
  documents = []
}) => {
  const [recipient, setRecipient] = useState('');
  const [includeBookings, setIncludeBookings] = useState(true);
  const [includeDocs, setIncludeDocs] = useState(true);
  const [customNote, setCustomNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'fallback'>('idle');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Generate formatted email subject and body
  const subject = `Voyan Travel Plan: ${plan.title} (${plan.destination})`;

  let body = `Hello!\n\nHere are the trip details and travel passes for our trip to ${plan.destination}, ${plan.state || ''}.\n\n`;
  body += `📅 DATES: ${plan.travelDates.start} – ${plan.travelDates.end} (${plan.durationDays} Days)\n`;
  body += `👥 TRAVELERS: ${plan.travellersCount} (${plan.groupType})\n`;
  body += `💰 ESTIMATED BUDGET: ₹${plan.budgetTotal.toLocaleString('en-IN')}\n\n`;

  if (customNote.trim()) {
    body += `📝 NOTE FROM ORGANIZER:\n${customNote.trim()}\n\n`;
  }

  if (includeBookings && bookings.length > 0) {
    body += `🎟️ CONFIRMED BOOKINGS & TRANSIT PASSES:\n`;
    bookings.forEach((b, idx) => {
      body += `${idx + 1}. [${b.type.toUpperCase()}] ${b.title}\n`;
      body += `   • Provider: ${b.provider}\n`;
      body += `   • PNR / Confirmation: ${b.confirmationCode}\n`;
      body += `   • Timing: ${b.dateStr} (${b.timeStr})\n`;
      if (b.seatOrRoom) body += `   • Seat/Room: ${b.seatOrRoom}\n`;
      body += `\n`;
    });
  }

  if (includeDocs && documents.length > 0) {
    body += `🛡️ VERIFIED TRAVEL DOCUMENTS & INSURANCE:\n`;
    documents.forEach((d, idx) => {
      body += `${idx + 1}. ${d.title} (${d.docType})\n`;
      body += `   • Holder: ${d.holderName}\n`;
      body += `   • Ref #: ${d.referenceNumber}\n`;
      body += `   • Validity: ${d.expiryOrValidity}\n\n`;
    });
  }

  body += `🌐 ACCESS LIVE INTERACTIVE ITINERARY & OFFLINE VAULT:\n`;
  body += `${window.location.origin}/?tab=planner\n\n`;
  body += `Planned thoughtfully with Voyan AI Travel Planning.`;

  // Deep links
  const mailtoHref = `mailto:${encodeURIComponent(recipient.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient.trim())}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const handleSendViaApi = async () => {
    if (!recipient.trim() || !recipient.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch(apiUrl('/api/send-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient.trim(),
          tripTitle: plan.title,
          destination: plan.destination,
          shareUrl: `${window.location.origin}/?tab=planner`
        })
      });

      if (response.ok) {
        setStatus('sent');
      } else {
        // Fallback to client email
        setStatus('fallback');
      }
    } catch {
      // Network or SMTP not configured: fallback smoothly to 1-tap client send
      setStatus('fallback');
    }
  };

  const handleCopyBody = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 border border-stone-200 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-teal-100 flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Send Trip by Email
              </h3>
              <p className="text-[11px] text-stone-500">
                Share complete itinerary, confirmed tickets & passes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-stone-900">Email Sent Successfully!</h4>
            <p className="text-xs text-stone-500">
              Trip plan and vouchers have been dispatched to <strong>{recipient}</strong>.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-5 py-2 rounded-xl bg-teal-800 text-white font-semibold text-xs hover:bg-teal-900 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4 text-xs">
            
            {/* Recipient Input */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Recipient Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={recipient}
                  onChange={(e) => {
                    setRecipient(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="traveler@example.com, family@domain.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-teal-700"
                />
              </div>
              {errorMessage && (
                <p className="text-[11px] text-rose-600 mt-1">{errorMessage}</p>
              )}
            </div>

            {/* Checklist of what to include */}
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-[11px] font-bold text-stone-800 block">
                Include in Email:
              </span>
              <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBookings}
                  onChange={(e) => setIncludeBookings(e.target.checked)}
                  className="rounded text-teal-800 focus:ring-teal-700"
                />
                <Ticket className="w-3.5 h-3.5 text-teal-800" />
                <span>Confirmed Tickets & PNR Barcodes ({bookings.length} reservations)</span>
              </label>

              <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDocs}
                  onChange={(e) => setIncludeDocs(e.target.checked)}
                  className="rounded text-teal-800 focus:ring-teal-700"
                />
                <ShieldCheck className="w-3.5 h-3.5 text-teal-800" />
                <span>Travel Documents & Insurance Reference ({documents.length} items)</span>
              </label>
            </div>

            {/* Custom Note */}
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Personal Note / Message (Optional)
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. Please check your assigned seat and confirm check-in time!"
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-teal-700"
              />
            </div>

            {/* 1-Click Launch Options */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-stone-700 block">
                Choose How to Send:
              </span>

              <div className="grid grid-cols-2 gap-2">
                {/* 1. Open in Gmail */}
                <a
                  href={gmailHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 rounded-xl bg-white border border-stone-200 hover:border-red-400 text-stone-800 font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 font-bold text-[10px] flex items-center justify-center">M</span>
                  <span>Send via Gmail</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>

                {/* 2. Open in Default Mail App (iPhone / Android / Outlook) */}
                <a
                  href={mailtoHref}
                  className="px-3 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Smartphone className="w-3.5 h-3.5 text-teal-200" />
                  <span>Open in Mail App</span>
                </a>
              </div>

              {/* Direct copy */}
              <button
                type="button"
                onClick={handleCopyBody}
                className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                <span>{copied ? 'Copied Email Body to Clipboard!' : 'Copy Formatted Email Text'}</span>
              </button>
            </div>

            {/* Direct Send API Button */}
            <div className="pt-2 border-t border-stone-100 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSendViaApi}
                disabled={status === 'sending'}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {status === 'sending' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send from Voyan Server</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
