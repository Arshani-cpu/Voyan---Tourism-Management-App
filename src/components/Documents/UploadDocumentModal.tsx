import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  ShieldCheck,
  Calendar,
  User,
  Hash,
  AlertCircle,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { TripDocumentItem } from '../../types/tripVault';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  onSaveDocument: (doc: TripDocumentItem, fileData?: { blob: Blob; fileName: string; mimeType: string }) => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  tripId,
  onSaveDocument
}) => {
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<TripDocumentItem['docType']>('identity');
  const [holderName, setHolderName] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [expiryOrValidity, setExpiryOrValidity] = useState('');
  const [notes, setNotes] = useState('');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setErrorMsg('');
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }

    // Auto-fill title if empty
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a document title.');
      return;
    }

    setIsSubmitting(true);
    const newDocId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    
    const newDoc: TripDocumentItem = {
      id: newDocId,
      tripId,
      title: title.trim(),
      docType,
      holderName: holderName.trim() || 'Trip Traveler',
      referenceNumber: referenceNumber.trim() || `REF-${Date.now().toString().slice(-6)}`,
      expiryOrValidity: expiryOrValidity.trim() || 'Valid for upcoming travels',
      status: 'verified',
      notes: notes.trim(),
      fileName: selectedFile?.name,
      mimeType: selectedFile?.type,
      sizeBytes: selectedFile?.size
    };

    const filePayload = selectedFile
      ? { blob: selectedFile, fileName: selectedFile.name, mimeType: selectedFile.type }
      : undefined;

    onSaveDocument(newDoc, filePayload);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 border border-stone-200 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-150 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-800 text-teal-100 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Upload Travel Document
              </h3>
              <p className="text-[11px] text-stone-500">
                Safe offline storage for IDs, insurance, permits & passes
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          
          {/* File Dropzone */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Select or Drop File (PDF, PNG, JPG)
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`p-4 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                dragActive
                  ? 'border-teal-700 bg-teal-50/50'
                  : selectedFile
                  ? 'border-emerald-500 bg-emerald-50/30'
                  : 'border-stone-300 hover:border-teal-700 bg-stone-50/70'
              }`}
              onClick={() => document.getElementById('doc-file-input')?.click()}
            >
              <input
                id="doc-file-input"
                type="file"
                className="hidden"
                accept=".pdf,image/*,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {selectedFile ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left min-w-0">
                    <span className="font-bold text-stone-900 block truncate text-xs">
                      {selectedFile.name}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Ready to save
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-1.5">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-stone-800 text-xs">
                    Click to browse or drag document here
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5">
                    Aadhaar, Passport, Medical Policy, E-Ticket, Forest Pass
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Passport - Arjun Mehta or HDFC Ergo Travel Insurance"
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-teal-700"
            />
          </div>

          {/* Doc Type & Holder Name Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Category
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-teal-700"
              >
                <option value="identity">Identity / Passport / ID</option>
                <option value="insurance">Travel & Health Insurance</option>
                <option value="permit">Permit / Transit Pass</option>
                <option value="medical">Medical / Vaccination</option>
                <option value="other">Booking Voucher / Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Document Holder Name
              </label>
              <input
                type="text"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="e.g. Arjun Mehta"
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>

          {/* Reference Number & Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Policy / Reference Number
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. VOY-9842-10"
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 font-mono text-stone-900 focus:outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Valid Until / Expiry
              </label>
              <input
                type="text"
                value={expiryOrValidity}
                onChange={(e) => setExpiryOrValidity(e.target.value)}
                placeholder="e.g. 2030 or Oct 2026"
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              Private Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Helpline: +91 98450 12345, Emergency Claim Contact"
              className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-teal-700"
            />
          </div>

          {errorMsg && (
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Save Document to Vault</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
