import React, { useState } from 'react';
import { X, Copy, Check, Share2, QrCode, Download } from 'lucide-react';
import { TripPlan } from '../../types/travel';
import { apiUrl } from '../../lib/api';

interface ShareTripModalProps {
  plan: TripPlan;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareTripModal: React.FC<ShareTripModalProps> = ({ plan, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/#trip=${plan.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    setStatus('sending');
    try {
      const response = await fetch(apiUrl('/api/send-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          tripTitle: plan.title,
          destination: plan.destination,
          shareUrl
        })
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || `The email service returned an error (${response.status}).`);
      }
      setStatus('sent');
      setEmailError('');
    } catch (error) {
      setStatus('error');
      setEmailError(error instanceof Error
        ? error.message
        : 'Could not send the itinerary. Check your connection and email configuration.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150 text-left">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">Share Itinerary</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-5">
          <h4 className="text-sm font-bold text-stone-900">{plan.title}</h4>
          <p className="text-xs text-stone-500 mt-0.5">
            {plan.destination} · {plan.durationDays} Days · ₹{plan.budgetPerPerson.toLocaleString()} / person
          </p>
        </div>

        {/* Shareable Link Input */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Direct Itinerary Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-600 font-mono truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-200" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="share-email" className="block text-xs font-semibold text-stone-700 mb-1.5">
            Email this itinerary
          </label>
          <div className="flex items-center gap-2">
            <input
              id="share-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setStatus('idle');
                setEmailError('');
              }}
              placeholder="name@example.com"
              className="flex-1 min-w-0 px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 text-stone-700"
            />
            <button
              onClick={handleSendEmail}
              disabled={!email.trim() || status === 'sending'}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shrink-0"
            >
              {status === 'sending' ? 'Sending…' : status === 'sent' ? 'Sent ✓' : 'Send'}
            </button>
          </div>
          {status === 'error' && (
            <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5" role="alert">
              <p className="font-semibold text-[11px]">Server email requires SMTP configuration. Open directly in your email app instead:</p>
              <div className="flex gap-2 pt-1">
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(`Voyan Trip Plan: ${plan.title}`)}&body=${encodeURIComponent(`Here is our trip plan for ${plan.destination}:\n${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-stone-800 font-semibold text-[11px] hover:bg-stone-50"
                >
                  Open in Gmail ↗
                </a>
                <a
                  href={`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Voyan Trip Plan: ${plan.title}`)}&body=${encodeURIComponent(`Here is our trip plan for ${plan.destination}:\n${shareUrl}`)}`}
                  className="px-2.5 py-1 rounded-lg bg-teal-800 text-white font-semibold text-[11px] hover:bg-teal-900"
                >
                  Open in Mail App
                </a>
              </div>
            </div>
          )}
          {status === 'sent' && (
            <p className="mt-1.5 text-xs text-emerald-700" role="status">Itinerary email sent successfully.</p>
          )}
        </div>

        {/* QR Code Simulation & Export */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-teal-800 shrink-0">
            <QrCode className="w-10 h-10" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-stone-900">Scan on Mobile</div>
            <p className="text-stone-500 text-[11px] mt-0.5">
              Sync this live plan with all your travel companions on Android or iOS.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <button
            onClick={handlePrintSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF / Print</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
