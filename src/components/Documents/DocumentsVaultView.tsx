import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  FileText,
  Download,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Lock,
  Eye,
  FileCheck,
  AlertTriangle,
  FolderLock
} from 'lucide-react';
import { TripDocumentItem } from '../../types/tripVault';

interface DocumentsVaultViewProps {
  documents: TripDocumentItem[];
  onUploadClick: () => void;
  onDeleteDocument: (docId: string) => void;
  onDownloadDocument: (doc: TripDocumentItem) => void;
  onViewDocument?: (doc: TripDocumentItem) => void;
}

export const DocumentsVaultView: React.FC<DocumentsVaultViewProps> = ({
  documents,
  onUploadClick,
  onDeleteDocument,
  onDownloadDocument,
  onViewDocument
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getDocIcon = (type: TripDocumentItem['docType']) => {
    switch (type) {
      case 'identity':
        return '🪪';
      case 'insurance':
        return '🛡️';
      case 'permit':
        return '📑';
      case 'medical':
        return '🩺';
      default:
        return '📄';
    }
  };

  const getDocBadgeColor = (type: TripDocumentItem['docType']) => {
    switch (type) {
      case 'identity':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'insurance':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'permit':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'medical':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-stone-50 text-stone-800 border-stone-200';
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesFilter = filterType === 'all' || doc.docType === filterType;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      doc.title.toLowerCase().includes(q) ||
      doc.holderName.toLowerCase().includes(q) ||
      doc.referenceNumber.toLowerCase().includes(q) ||
      doc.notes.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-left">
      
      {/* Top Banner & Upload CTA */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-teal-900 to-stone-900 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-800/80 border border-teal-600/40 text-[10px] font-bold uppercase tracking-wider text-teal-200 mb-2">
              <FolderLock className="w-3 h-3 text-teal-300" />
              <span>Offline Safe Storage</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Travel Documents & Identity Locker
            </h3>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 leading-relaxed">
              Upload passports, visas, insurance policies, and forest/transit permits. All files are encrypted on your device and accessible 100% offline during your travels.
            </p>
          </div>

          <button
            onClick={onUploadClick}
            className="px-4 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents or policy #..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:outline-none focus:border-teal-700"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl text-xs font-semibold overflow-x-auto">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'identity', label: 'Identity / IDs' },
            { id: 'insurance', label: 'Insurance' },
            { id: 'permit', label: 'Permits' },
            { id: 'medical', label: 'Medical' },
            { id: 'other', label: 'Vouchers' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer text-xs ${
                filterType === cat.id
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-stone-300 bg-stone-50/50">
          <FileText className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-stone-700">No documents found</h4>
          <p className="text-xs text-stone-500 mt-0.5 max-w-sm mx-auto">
            {searchQuery
              ? 'Try adjusting your search query.'
              : 'Upload your travel insurance, ID card, or permits to keep them safe and ready for future trips.'}
          </p>
          <button
            onClick={onUploadClick}
            className="mt-4 px-4 py-2 rounded-xl bg-teal-800 text-white font-semibold text-xs hover:bg-teal-900 transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Document Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl border border-stone-200/90 hover:border-teal-600/60 bg-white hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Badge & Category */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getDocIcon(doc.docType)}</span>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getDocBadgeColor(doc.docType)}`}>
                        {doc.docType}
                      </span>
                    </div>
                  </div>
                  
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <Check className="w-3 h-3" />
                    Verified
                  </span>
                </div>

                {/* Title & Holder */}
                <h4 className="text-sm font-bold text-stone-900 leading-snug">
                  {doc.title}
                </h4>
                <p className="text-xs text-stone-600 mt-1">
                  Holder: <span className="font-semibold text-stone-800">{doc.holderName}</span>
                </p>

                {/* Reference Number & Copy */}
                <div className="mt-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">
                      Ref / Policy #
                    </span>
                    <span className="font-mono text-xs font-bold text-teal-900 truncate block">
                      {doc.referenceNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(doc.id, doc.referenceNumber)}
                    title="Copy Reference Number"
                    className="p-1.5 text-stone-400 hover:text-teal-800 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedId === doc.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Validity & Notes */}
                <div className="mt-3 text-xs text-stone-500 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Validity:</span>
                    <span className="font-medium text-stone-700">{doc.expiryOrValidity}</span>
                  </div>
                  {doc.notes && (
                    <p className="text-[11px] text-stone-600 italic bg-amber-50/60 p-2 rounded-lg border border-amber-200/50 mt-1">
                      {doc.notes}
                    </p>
                  )}
                  {doc.fileName && (
                    <div className="flex items-center gap-1.5 text-[10px] text-teal-800 pt-1">
                      <FileCheck className="w-3 h-3 text-teal-700" />
                      <span className="truncate">{doc.fileName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onDownloadDocument(doc)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => onDeleteDocument(doc.id)}
                  title="Remove Document"
                  className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
