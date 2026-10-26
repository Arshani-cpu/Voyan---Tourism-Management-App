import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Sparkles,
  IndianRupee
} from 'lucide-react';
import QRCode from 'qrcode';

export interface UPIPaymentDetails {
  payeeName: string;
  payeeVpa: string; // e.g. "priya.sharma@okhdfcbank" or "voyan.travel@icici"
  amount: number; // in INR
  transactionNote: string;
  tripTitle?: string;
  category?: string;
}

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: UPIPaymentDetails;
  onPaymentSuccess?: (paymentRecord: {
    transactionId: string;
    vpa: string;
    amount: number;
    note: string;
    timestamp: string;
  }) => void;
}

export const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  onClose,
  details,
  onPaymentSuccess
}) => {
  const [payeeVpa, setPayeeVpa] = useState(details.payeeVpa || 'priya.sharma@okhdfcbank');
  const [payeeName, setPayeeName] = useState(details.payeeName || 'Priya Sharma');
  const [amount, setAmount] = useState<number>(details.amount || 500);
  const [note, setNote] = useState(details.transactionNote || 'Voyan Trip Payment');
  
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrError, setQrError] = useState<string>('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Payment verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [txnRefNumber, setTxnRefNumber] = useState('');

  // Sync props when details change
  useEffect(() => {
    if (details) {
      setPayeeVpa(details.payeeVpa || 'priya.sharma@okhdfcbank');
      setPayeeName(details.payeeName || 'Priya Sharma');
      setAmount(details.amount || 500);
      setNote(details.transactionNote || 'Voyan Trip Payment');
      setPaymentDone(false);
      setIsVerifying(false);
    }
  }, [details, isOpen]);

  // Construct standard UPI deep link
  // upi://pay?pa={vpa}&pn={name}&am={amount}&tn={note}&cu=INR
  const upiUri = `upi://pay?pa=${encodeURIComponent(payeeVpa)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&tn=${encodeURIComponent(note)}&cu=INR`;

  // Generate QR code whenever payment parameters change
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    QRCode.toDataURL(upiUri, {
      width: 280,
      margin: 2,
      color: {
        dark: '#042f2e',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => {
        if (isMounted) {
          setQrCodeDataUrl(url);
          setQrError('');
        }
      })
      .catch((err) => {
        if (isMounted) {
          setQrError('Failed to generate UPI QR code');
          console.error(err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [upiUri, isOpen]);

  const handleCopyVpa = async () => {
    try {
      await navigator.clipboard.writeText(payeeVpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const handleCopyUpiLink = async () => {
    try {
      await navigator.clipboard.writeText(upiUri);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.warn('Copy link failed', e);
    }
  };

  const handleSimulatePayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const generatedRef = `UPI-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;
      setTxnRefNumber(generatedRef);
      setIsVerifying(false);
      setPaymentDone(true);

      if (onPaymentSuccess) {
        onPaymentSuccess({
          transactionId: generatedRef,
          vpa: payeeVpa,
          amount,
          note,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 border border-stone-200 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-teal-100 flex items-center justify-center shadow-xs">
              <IndianRupee className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
                <span>UPI Fast Pay</span>
                <span className="text-[10px] font-mono bg-teal-100 text-teal-900 px-1.5 py-0.2 rounded font-semibold">
                  Zero Fee
                </span>
              </h3>
              <p className="text-[11px] text-stone-500">
                GPay · PhonePe · Paytm · BHIM · Any UPI App
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

        {paymentDone ? (
          /* Payment Confirmed State */
          <div className="py-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Payment Completed
              </span>
              <h4 className="text-2xl font-black text-stone-900 mt-1 font-mono">
                ₹{amount.toLocaleString('en-IN')}
              </h4>
              <p className="text-xs text-stone-600 mt-1">
                Sent to <span className="font-semibold text-stone-900">{payeeName}</span> ({payeeVpa})
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-left space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Transaction UTR:</span>
                <span className="font-mono font-bold text-stone-900">{txnRefNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Purpose / Note:</span>
                <span className="font-semibold text-stone-800">{note}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Status:</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                  <Check className="w-3.5 h-3.5" /> Settled in Voyan Vault
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 transition-colors shadow-xs"
            >
              Done & Return to Trip
            </button>
          </div>
        ) : (
          /* Active UPI Payment Screen */
          <div className="mt-4 space-y-4">
            
            {/* Amount & Payee Summary Card */}
            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-800 block">
                  Amount to Pay
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-teal-950 font-mono">
                    ₹{amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-[11px] text-teal-800 font-medium">
                  To: <strong>{payeeName}</strong>
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-stone-500 block mb-0.5">Payee UPI ID</span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-xs font-mono font-semibold text-teal-900">
                  <span>{payeeVpa}</span>
                  <button
                    onClick={handleCopyVpa}
                    title="Copy UPI ID"
                    className="p-0.5 hover:text-teal-700 cursor-pointer"
                  >
                    {copiedVpa ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-stone-400" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Editable Details Accordion / Toggle */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Edit Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 font-mono font-bold text-stone-900 focus:outline-none focus:border-teal-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">Receiver VPA / Phone</label>
                <input
                  type="text"
                  value={payeeVpa}
                  onChange={(e) => setPayeeVpa(e.target.value)}
                  placeholder="name@upi"
                  className="w-full px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 font-mono text-stone-900 focus:outline-none focus:border-teal-700"
                />
              </div>
            </div>

            {/* Dynamic Scannable QR Code */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-stone-700 mb-2 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-teal-800" />
                <span>Scan with any UPI App</span>
              </span>

              <div className="w-48 h-48 bg-white p-2.5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-center">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Scan UPI QR Code to pay"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-stone-400 text-xs flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-teal-800" />
                    <span>{qrError || 'Generating QR...'}</span>
                  </div>
                )}
              </div>

              <div className="mt-2.5 flex items-center gap-2 text-[10px] text-stone-500">
                <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 font-medium">Google Pay</span>
                <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 font-medium">PhonePe</span>
                <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 font-medium">Paytm</span>
                <span className="px-1.5 py-0.5 rounded bg-white border border-stone-200 font-medium">BHIM</span>
              </div>
            </div>

            {/* 1-Tap Mobile App Deeplink Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-stone-700 block">
                Or Tap to Pay Directly on Mobile:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href={upiUri}
                  className="px-3 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Open Any UPI App</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyUpiLink}
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                  <span>{copiedLink ? 'Copied Link!' : 'Copy Payment Link'}</span>
                </button>
              </div>
            </div>

            {/* Note */}
            <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              <span className="font-semibold text-stone-700">Note: </span>
              {note}
            </div>

            {/* Settle / Verify Simulation Action */}
            <div className="pt-2 border-t border-stone-100 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isVerifying}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying with Bank...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                    <span>Confirm / Record Paid (₹{amount})</span>
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
