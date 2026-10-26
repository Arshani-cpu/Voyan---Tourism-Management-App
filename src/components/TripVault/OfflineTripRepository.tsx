import React, { useEffect, useMemo, useState } from 'react';
import { Archive, Download, FileText, Image, Mail, Send, Trash2, Upload, Wifi, WifiOff, X } from 'lucide-react';
import {
  deleteOfflineTripItem,
  listOfflineTripItems,
  OfflineTripItem,
  saveOfflineTripItem,
} from '../../lib/offlineTripRepository';

interface OfflineTripRepositoryProps {
  tripId: string;
}

const formatFileSize = (sizeBytes?: number) => {
  if (!sizeBytes) return 'Note';
  if (sizeBytes < 1024 * 1024) return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const OfflineTripRepository: React.FC<OfflineTripRepositoryProps> = ({ tripId }) => {
  const [items, setItems] = useState<OfflineTripItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<OfflineTripItem | null>(null);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([]);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [activeEmailDraft, setActiveEmailDraft] = useState<OfflineTripItem | null>(null);

  useEffect(() => {
    let isActive = true;
    void listOfflineTripItems(tripId)
      .then((storedItems) => {
        if (isActive) setItems(storedItems.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      })
      .catch((loadError: unknown) => {
        if (isActive) setError(loadError instanceof Error ? loadError.message : 'Could not load offline trip files.');
      });
    return () => {
      isActive = false;
    };
  }, [tripId]);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const previewUrl = useMemo(() => {
    if (!previewItem?.file) return null;
    return URL.createObjectURL(previewItem.file);
  }, [previewItem]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || (!selectedFile && !description.trim())) {
      setError('Add a title and either choose a file or write a note.');
      return;
    }
    if (selectedFile && selectedFile.size > 50 * 1024 * 1024) {
      setError('Files must be 50 MB or smaller to save offline.');
      return;
    }

    setError(null);
    setIsSaving(true);
    const item: OfflineTripItem = {
      id: crypto.randomUUID(),
      tripId,
      title: title.trim(),
      description: description.trim(),
      fileName: selectedFile?.name,
      mimeType: selectedFile?.type || undefined,
      sizeBytes: selectedFile?.size,
      file: selectedFile || undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      await saveOfflineTripItem(item);
      setItems((current) => [item, ...current]);
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      const input = document.getElementById('offline-trip-file') as HTMLInputElement | null;
      if (input) input.value = '';
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save this item for offline access.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: OfflineTripItem) => {
    setError(null);
    try {
      await deleteOfflineTripItem(item.id);
      setItems((current) => current.filter((saved) => saved.id !== item.id));
      if (previewItem?.id === item.id) setPreviewItem(null);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not remove this offline item.');
    }
  };

  const downloadItem = (item: OfflineTripItem) => {
    if (!item.file) return;
    const url = URL.createObjectURL(item.file);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.fileName || item.title;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleSendEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    const recipient = emailTo.trim();
    const subject = emailSubject.trim();
    if (!recipient || !subject || !emailBody.trim()) {
      setError('Enter a recipient, subject, and message before sending.');
      return;
    }

    const attachments = items.filter((item) => selectedAttachmentIds.includes(item.id) && item.file);
    const emailContent = `To: ${recipient}\nSubject: ${subject}\n\n${emailBody.trim()}`;
    const archiveItem: OfflineTripItem = {
      id: crypto.randomUUID(),
      tripId,
      kind: 'email',
      title: subject,
      description: emailContent,
      emailTo: recipient,
      emailSubject: subject,
      emailBody: emailBody.trim(),
      attachmentItemIds: attachments.map((item) => item.id),
      createdAt: new Date().toISOString(),
    };

    setError(null);
    setEmailStatus(null);

    try {
      await saveOfflineTripItem(archiveItem);
      setItems((current) => [archiveItem, ...current]);
      setActiveEmailDraft(archiveItem);
      setEmailStatus('Draft saved locally. Open it below in your email app, then press Send there.');
      setEmailTo('');
      setEmailSubject('');
      setEmailBody('');
      setSelectedAttachmentIds([]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not archive this email draft.');
    }
  };

  const openEmailShareSheet = async (draft: OfflineTripItem) => {
    const attachments = items.filter(
      (item) => draft.attachmentItemIds?.includes(item.id) && item.file
    );
    const files = attachments.map((item) =>
      new File([item.file!], item.fileName || item.title, {
        type: item.mimeType || item.file!.type || 'application/octet-stream',
      })
    );
    if (!navigator.share || !files.length || !navigator.canShare?.({ files })) {
      setEmailStatus('This device cannot attach files through its share sheet. Download the files below and attach them in your email app.');
      return;
    }
    try {
      await navigator.share({
        title: draft.emailSubject || draft.title,
        text: `To: ${draft.emailTo}\n\n${draft.emailBody || ''}`,
        files,
      });
      setEmailStatus('Share sheet opened. Choose your email app, confirm the recipient, and press Send.');
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === 'AbortError') {
        setEmailStatus('Sharing was cancelled. Your draft is still saved.');
      } else {
        setError(shareError instanceof Error ? shareError.message : 'Could not open the device share sheet.');
      }
    }
  };

  const emailDraftHref = (draft: OfflineTripItem) => {
    const recipient = draft.emailTo || '';
    const subject = draft.emailSubject || draft.title;
    const body = draft.emailBody || '';
    return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const webmailDraftHref = (draft: OfflineTripItem, provider: 'gmail' | 'outlook') => {
    const params = new URLSearchParams({
      to: draft.emailTo || '',
      subject: draft.emailSubject || draft.title,
      body: draft.emailBody || '',
    });
    return provider === 'gmail'
      ? `https://mail.google.com/mail/?view=cm&fs=1&${params.toString()}`
      : `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`;
  };

  return (
    <section className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-4 sm:p-6 space-y-5" aria-labelledby="offline-repository-title">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-800" />
            <h4 id="offline-repository-title" className="text-base font-bold text-stone-900">Offline Trip Repository</h4>
          </div>
          <p className="mt-1 text-xs text-stone-600">
            Save travel documents, photos, and notes on this device to open without internet.
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[11px] font-semibold ${isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {isOnline ? 'Online · saves on device' : 'Offline · files stay available'}
        </span>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-xs font-semibold text-stone-700">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder="e.g. Hotel confirmation"
            className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-normal"
            required
          />
        </label>
        <label className="text-xs font-semibold text-stone-700">
          Add a document or photo
          <input
            id="offline-trip-file"
            type="file"
            accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            className="mt-1 block w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs"
          />
        </label>
        <label className="text-xs font-semibold text-stone-700 sm:col-span-2">
          Description or trip note
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
            rows={2}
            placeholder="Add confirmation details, directions, or other information to keep offline."
            className="mt-1 w-full resize-y rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-normal"
          />
        </label>
        <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[11px] text-stone-500">Files up to 50 MB · Stored only in this browser on this device</span>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-900 disabled:opacity-60"
          >
            <Upload className="w-4 h-4" />
            {isSaving ? 'Saving offline…' : 'Save to repository'}
          </button>
        </div>
      </form>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{error}</p>}
      {emailStatus && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{emailStatus}</p>}

      {activeEmailDraft && (
        <div className="rounded-xl border border-teal-200 bg-white p-4 space-y-3">
          <div>
            <p className="text-sm font-bold text-stone-900">Ready to send: {activeEmailDraft.emailSubject}</p>
            <p className="text-xs text-stone-600">To: {activeEmailDraft.emailTo}. Voyan saves the draft, but your email app sends it only after you tap Send.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={emailDraftHref(activeEmailDraft)}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-900"
            >
              <Send className="h-4 w-4" /> Open email app
            </a>
            <a
              href={webmailDraftHref(activeEmailDraft, 'gmail')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-50"
            >
              Open Gmail
            </a>
            <a
              href={webmailDraftHref(activeEmailDraft, 'outlook')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-50"
            >
              Open Outlook
            </a>
            {activeEmailDraft.attachmentItemIds?.length ? (
              <button
                type="button"
                onClick={() => void openEmailShareSheet(activeEmailDraft)}
                className="inline-flex items-center gap-2 rounded-xl border border-teal-200 px-4 py-2.5 text-xs font-semibold text-teal-900 hover:bg-teal-50"
              >
                <Mail className="h-4 w-4" /> Share with attachments
              </button>
            ) : null}
          </div>
          {activeEmailDraft.attachmentItemIds?.length ? (
            <div className="flex flex-wrap gap-2">
              {items.filter((item) => activeEmailDraft.attachmentItemIds?.includes(item.id)).map((item) => (
                <button key={item.id} type="button" onClick={() => downloadItem(item)} className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2.5 py-1.5 text-[11px] font-semibold text-stone-700 hover:bg-stone-200">
                  <Download className="h-3 w-3" /> {item.fileName || item.title}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <form onSubmit={handleSendEmail} className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-teal-800" />
          <h5 className="text-sm font-bold text-stone-900">Email trip documents</h5>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-stone-700">
            Recipient
            <input
              type="email"
              value={emailTo}
              onChange={(event) => setEmailTo(event.target.value)}
              placeholder="name@example.com"
              required
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-normal"
            />
          </label>
          <label className="text-xs font-semibold text-stone-700">
            Subject
            <input
              value={emailSubject}
              onChange={(event) => setEmailSubject(event.target.value)}
              maxLength={160}
              placeholder="Trip documents"
              required
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-normal"
            />
          </label>
          <label className="text-xs font-semibold text-stone-700 sm:col-span-2">
            Message
            <textarea
              value={emailBody}
              onChange={(event) => setEmailBody(event.target.value)}
              maxLength={5000}
              rows={3}
              placeholder="Add a message..."
              required
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-normal"
            />
          </label>
        </div>
        {items.some((item) => item.file) && (
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-stone-700">Attach saved documents or photos</legend>
            <div className="max-h-32 overflow-y-auto rounded-xl border border-stone-200 divide-y divide-stone-100">
              {items.filter((item) => item.file).map((item) => (
                <label key={item.id} className="flex items-center gap-2 px-3 py-2 text-xs text-stone-700">
                  <input
                    type="checkbox"
                    checked={selectedAttachmentIds.includes(item.id)}
                    onChange={(event) => setSelectedAttachmentIds((current) =>
                      event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id)
                    )}
                  />
                  <span className="truncate">{item.title} · {item.fileName || item.title}</span>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-stone-500">With attachments, choose your email app in the phone/browser share sheet. Without attachments, Voyan opens a prefilled email draft.</p>
          </fieldset>
        )}
        <button type="submit" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-900">
          <Archive className="h-4 w-4" />
          Save email draft
        </button>
      </form>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white/70 p-6 text-center">
          <FileText className="mx-auto h-6 w-6 text-stone-400" />
          <p className="mt-2 text-sm font-semibold text-stone-700">Your offline repository is empty</p>
          <p className="mt-1 text-xs text-stone-500">Add a file or save a text note above. It will remain available on this device.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item) => (
            <article key={item.id} className="min-w-0 rounded-xl border border-stone-200 bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  {item.kind === 'email'
                    ? <Archive className="mt-0.5 h-4 w-4 shrink-0 text-indigo-700" />
                    : item.mimeType?.startsWith('image/')
                      ? <Image className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                      : <FileText className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />}
                  <div className="min-w-0">
                    <h5 className="truncate text-sm font-bold text-stone-900">{item.title}</h5>
                    {item.fileName && <p className="truncate text-[11px] text-stone-500">{item.fileName} · {formatFileSize(item.sizeBytes)}</p>}
                  </div>
                </div>
                <button type="button" onClick={() => void handleDelete(item)} className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-700" aria-label={`Delete ${item.title}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {item.description && <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs text-stone-600">{item.description}</p>}
              <div className="mt-3 flex items-center gap-2 border-t border-stone-100 pt-2">
                {item.file && (
                  <button type="button" onClick={() => setPreviewItem(item)} className="rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-900 hover:bg-teal-100">
                    Open offline
                  </button>
                )}
                {item.kind === 'email' && item.emailTo && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveEmailDraft(item);
                      setEmailStatus('Draft loaded. Open it in your email app, then press Send there.');
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-900 hover:bg-indigo-100"
                  >
                    <Mail className="h-3.5 w-3.5" /> Open draft
                  </button>
                )}
                {item.file && (
                  <button type="button" onClick={() => downloadItem(item)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100" aria-label={`Download ${item.title}`}>
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                )}
                <span className="ml-auto text-[10px] text-stone-400">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {previewItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label={previewItem.title}>
          <div className="flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-stone-900">{previewItem.title}</h3>
                {previewItem.fileName && <p className="truncate text-[11px] text-stone-500">{previewItem.fileName}</p>}
              </div>
              <button type="button" onClick={() => setPreviewItem(null)} className="rounded-lg p-2 text-stone-500 hover:bg-stone-100" aria-label="Close preview">
                <X className="h-4 w-4" />
              </button>
            </div>
            {previewItem.description && <p className="border-b border-stone-100 px-4 py-2 text-xs text-stone-600">{previewItem.description}</p>}
            <div className="min-h-0 flex-1 overflow-auto bg-stone-100">
              {previewUrl && previewItem.mimeType?.startsWith('image/') ? (
                <img src={previewUrl} alt={previewItem.title} className="mx-auto max-h-full max-w-full object-contain" />
              ) : previewUrl && previewItem.mimeType === 'application/pdf' ? (
                <iframe src={previewUrl} title={previewItem.title} className="h-[70vh] w-full" />
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-stone-700">This file type cannot be previewed here. Download it to open with a compatible app.</p>
                  <button type="button" onClick={() => downloadItem(previewItem)} className="mt-3 rounded-xl bg-teal-800 px-4 py-2 text-xs font-semibold text-white">Download file</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
