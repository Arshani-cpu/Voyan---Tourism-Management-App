import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Shield, MapPin, Plane, Train, Hotel, Car, Ticket, ExternalLink, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { BookingItem, TripDocumentItem } from '../../types/tripVault';

interface DigitalPassModalProps {
  booking: BookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  attachments: TripDocumentItem[];
  onDownloadFile: (fileId: string, fileName: string) => void;
}

export const DigitalPassModal: React.FC<DigitalPassModalProps> = ({ booking, isOpen, onClose, attachments, onDownloadFile }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!booking?.confirmationCode) return;
    let isCancelled = false;
    QRCode.toDataURL(booking.confirmationCode, {
      width: 200,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((url) => {
        if (!isCancelled) setQrDataUrl(url);
      })
      .catch(() => {
        // Fallback gracefully
      });
    return () => {
      isCancelled = true;
    };
  }, [booking?.confirmationCode]);

  if (!isOpen || !booking) return null;

  const isPass = booking.type === 'pass';
  const isBookMyShow = /bookmyshow/i.test(booking.provider);

  const getIcon = () => {
    switch (booking.type) {
      case 'flight':
        return <Plane className="w-5 h-5 text-white" />;
      case 'train':
        return <Train className="w-5 h-5 text-white" />;
      case 'hotel':
        return <Hotel className="w-5 h-5 text-white" />;
      case 'cab':
        return <Car className="w-5 h-5 text-white" />;
      default:
        return <Ticket className="w-5 h-5 text-white" />;
    }
  };

  const getHeaderGradient = () => {
    if (isBookMyShow) return 'from-rose-700 via-rose-800 to-rose-950';
    switch (booking.type) {
      case 'flight':
        return 'from-sky-800 to-sky-950';
      case 'train':
        return 'from-teal-800 to-slate-900';
      case 'hotel':
        return 'from-emerald-800 to-stone-900';
      case 'cab':
        return 'from-amber-800 to-stone-900';
      default:
        return 'from-teal-800 to-teal-950';
    }
  };

  const searchVerificationUrl = isBookMyShow
    ? `https://in.bookmyshow.com/`
    : `https://www.google.com/search?q=${encodeURIComponent(`${booking.provider} ${booking.title} booking verification`)}`;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 text-left max-h-[90vh] overflow-y-auto">
        {/* Confirmation summary */}
        <div className={`p-6 bg-gradient-to-br ${getHeaderGradient()} text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              {getIcon()}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200">
                {booking.provider} {isPass && '· ENTRY PASS'}
              </span>
              <h3 className="text-lg font-bold leading-tight">{booking.title}</h3>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs mt-4 pt-3 border-t border-white/20">
            <div>
              <span className="text-[10px] text-stone-300 uppercase block">Confirmation / Pass ID</span>
              <span className="font-mono font-bold text-sm text-yellow-300 tracking-wider">
                {booking.confirmationCode}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-300 uppercase block">Status</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {booking.status}
              </span>
            </div>
          </div>
        </div>

        {/* Pass Details Body */}
        <div className="p-6 space-y-5 bg-white">
          {/* Key Timings & Locations */}
          <div className="grid grid-cols-2 gap-4 text-xs pb-4 border-b border-stone-100">
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-semibold block">Date & Time</span>
              <span className="font-bold text-stone-900 block mt-0.5">{booking.dateStr}</span>
              <span className="text-stone-600 text-[11px]">{booking.timeStr}</span>
            </div>
            <div>
              <span className="text-stone-400 text-[10px] uppercase font-semibold block">Allocation / Seat</span>
              <span className="font-bold text-stone-900 block mt-0.5">{booking.seatOrRoom || 'General Admission'}</span>
              {booking.platformOrTerminal && <span className="text-stone-600 text-[11px]">{booking.platformOrTerminal}</span>}
            </div>
          </div>

          {booking.departureLocation && (
            <div className="text-xs space-y-1.5 pb-4 border-b border-stone-100">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-400 text-[10px] uppercase font-semibold block">Venue / Origin</span>
                  <span className="text-stone-800 font-medium">{booking.departureLocation}</span>
                </div>
              </div>
              {booking.arrivalLocation && (
                <div className="flex items-start gap-2 pt-1">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-semibold block">Destination</span>
                    <span className="text-stone-800 font-medium">{booking.arrivalLocation}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scannable QR Pass Section */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              Digital E-Pass & Gate Scan Code
            </span>
            {qrDataUrl ? (
              <div className="mx-auto w-fit p-3 bg-white rounded-2xl border border-stone-200 shadow-xs">
                <img src={qrDataUrl} alt={`QR Pass for ${booking.title}`} className="h-44 w-44 mx-auto" />
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-stone-400">
                Generating QR pass...
              </div>
            )}
            <p className="font-mono text-sm font-bold text-stone-900">{booking.confirmationCode}</p>
            <p className="text-[11px] text-stone-600">
              Show this QR code at the entrance or ticket counter for gate validation.
            </p>

            <div className="pt-2 flex items-center justify-center gap-2">
              <a
                href={searchVerificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-800 text-white font-semibold text-xs hover:bg-teal-900 transition-colors shadow-xs"
              >
                <span>{isBookMyShow ? 'Open on BookMyShow' : 'Verify on Official Site'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {booking.sourceEmailSubject && (
              <p className="text-[10px] text-stone-500">Imported from: {booking.sourceEmailSubject}</p>
            )}
            {attachments.map((attachment) => attachment.fileId && (
              <button
                key={attachment.id}
                onClick={() => onDownloadFile(attachment.fileId!, attachment.fileName || attachment.title)}
                className="block text-xs text-teal-800 underline"
              >
                Download {attachment.fileName || attachment.title}
              </button>
            ))}
          </div>

          {/* Notes & Baggage / ID requirement */}
          {booking.notes && (
            <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-100 text-[11px] text-teal-950 flex items-start gap-2">
              <Shield className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span>{booking.notes}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
