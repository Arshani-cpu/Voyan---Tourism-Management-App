import { BookingItem, BookingType } from '../types/tripVault';

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
}

interface GoogleTokenClient {
  requestAccessToken(options?: { prompt?: string }): void;
}

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailPart {
  filename?: string;
  mimeType?: string;
  body?: { data?: string; attachmentId?: string; size?: number };
  parts?: GmailPart[];
}

interface GmailMessageResponse {
  id: string;
  snippet?: string;
  internalDate?: string;
  payload?: { headers?: GmailHeader[]; mimeType?: string; body?: { data?: string }; parts?: GmailPart[] };
}

interface GoogleIdentity {
  accounts: {
    oauth2: {
      initTokenClient(options: {
        client_id: string;
        scope: string;
        callback: (response: GoogleTokenResponse) => void;
        error_callback?: (error: { message?: string }) => void;
        include_granted_scopes?: boolean;
      }): GoogleTokenClient;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

export interface GmailTripMessage {
  id: string;
  subject: string;
  from: string;
  date: string;
  text: string;
  attachments: { id: string; name: string; mimeType: string; size: number }[];
}

function loadGoogleIdentity(): Promise<void> {
  if (window.google?.accounts.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Could not load Google sign-in.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Google sign-in.'));
    document.head.appendChild(script);
  });
}

export async function requestGmailReadAccess(clientId: string): Promise<string> {
  if (!clientId) throw new Error('Set VITE_GOOGLE_CLIENT_ID to enable Gmail import.');
  await loadGoogleIdentity();
  return new Promise((resolve, reject) => {
    const tokenClient = window.google?.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/gmail.readonly',
      callback: (response) => {
        if (response.access_token) resolve(response.access_token);
        else reject(new Error(response.error || 'Google did not grant Gmail read access.'));
      },
      error_callback: (error) => reject(new Error(error.message || 'Google authorization failed.'))
    });
    if (!tokenClient) {
      reject(new Error('Google sign-in could not be initialized.'));
      return;
    }
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export async function revokeGmailReadAccess(accessToken: string): Promise<void> {
  const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`, { method: 'POST' });
  if (!response.ok) throw new Error('Google could not revoke Gmail access.');
}

function decodeBase64Url(data: string): string {
  const binary = atob(data.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function extractText(part: GmailPart): string[] {
  let text: string[] = [];
  if (part.body?.data && part.mimeType === 'text/plain') {
    text = [decodeBase64Url(part.body.data)];
  } else if (part.body?.data && part.mimeType === 'text/html') {
    const html = decodeBase64Url(part.body.data)
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, ' ');
    text = [html];
  }
  return [...text, ...(part.parts || []).flatMap(extractText)];
}

async function gmailRequest<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error?.message || 'Gmail could not return messages.');
  }
  return result as T;
}

export async function searchGmailTripMessages(
  accessToken: string,
  destination: string
): Promise<GmailTripMessage[]> {
  const destinationTerm = destination.split(',')[0].trim();
  const query = [`"${destinationTerm}"`, '{booking reservation ticket itinerary PNR flight hotel train}'].filter(Boolean).join(' ');
  const listUrl = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
  listUrl.searchParams.set('q', query);
  listUrl.searchParams.set('maxResults', '15');
  const listing = await gmailRequest<{ messages?: { id: string }[] }>(listUrl.toString(), accessToken);
  const messages = await Promise.all((listing.messages || []).map(async ({ id }) => {
    const message = await gmailRequest<GmailMessageResponse>(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(id)}?format=full`,
      accessToken
    );
    const headers = message.payload?.headers || [];
    const header = (name: string) => headers.find((item) => item.name.toLowerCase() === name.toLowerCase())?.value || '';
    const body = (message.payload?.parts || []).flatMap(extractText).join('\n') ||
      (message.payload?.body?.data
        ? extractText({ mimeType: message.payload.mimeType, body: message.payload.body }).join('\n')
        : '');
    const collectAttachments = (parts: GmailPart[] = []): GmailTripMessage['attachments'] =>
      parts.flatMap((part) => [
        ...(part.filename && part.body?.attachmentId
          ? [{ id: part.body.attachmentId, name: part.filename, mimeType: part.mimeType || 'application/octet-stream', size: part.body.size || 0 }]
          : []),
        ...collectAttachments(part.parts)
      ]);
    const date = header('Date') || (message.internalDate ? new Date(Number(message.internalDate)).toISOString() : '');
    return {
      id: message.id,
      subject: header('Subject') || 'Trip confirmation',
      from: header('From'),
      date,
      text: [header('Subject'), header('From'), body, message.snippet || ''].filter(Boolean).join('\n'),
      attachments: collectAttachments(message.payload?.parts)
    };
  }));
  return messages.filter((message) => {
    const destinationMatches = !destinationTerm || message.text.toLowerCase().includes(destinationTerm.toLowerCase());
    return destinationMatches;
  });
}

export async function fetchGmailAttachments(accessToken: string, message: GmailTripMessage): Promise<File[]> {
  const supportedTypes = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]);
  const files: File[] = [];
  for (const attachment of message.attachments) {
    if (!supportedTypes.has(attachment.mimeType)) continue;
    if (attachment.size > 10 * 1024 * 1024) {
      throw new Error(`${attachment.name} exceeds the 10 MB attachment limit.`);
    }
    const response = await gmailRequest<{ data?: string; size?: number }>(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(message.id)}/attachments/${encodeURIComponent(attachment.id)}`,
      accessToken
    );
    if (!response.data) continue;
    const binary = atob(response.data.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    if (bytes.byteLength > 10 * 1024 * 1024) {
      throw new Error(`${attachment.name} exceeds the 10 MB attachment limit.`);
    }
    files.push(new File([bytes], attachment.name, { type: attachment.mimeType }));
  }
  return files;
}

export function parseBookingEmail(message: GmailTripMessage, tripId: string): BookingItem | null {
  const text = message.text;
  const normalized = text.toLowerCase();
  const type: BookingType | null = /flight|airline|boarding pass/i.test(text)
    ? 'flight'
    : /irctc|railway|train|pnr/i.test(normalized)
      ? 'train'
      : /hotel|resort|check[\s-]?in|accommodation|room/i.test(normalized)
        ? 'hotel'
        : /cab|taxi|car rental/i.test(normalized)
          ? 'cab'
          : /ticket|pass|entry/i.test(normalized)
            ? 'pass'
            : null;
  const reference = text.match(/(?:PNR|booking(?:\s*(?:ID|ref(?:erence)?))?|reservation(?:\s*(?:ID|number|no))?|confirmation(?:\s*(?:code|number|no))?)\s*(?:is|:|#|-)?\s*([A-Z0-9][A-Z0-9-]{3,})/i)?.[1];
  if (!type || !reference) return null;

  const amountMatch = text.match(/(?:₹\s*|INR\s*|Rs\.?\s*)([\d,]+(?:\.\d{1,2})?)/i) ||
    text.match(/(?:total(?:\s+(?:amount|fare|paid|price))?)\s*(?:is|:)?\s*(?:₹\s*|INR\s*|Rs\.?\s*)?([\d,]+(?:\.\d{1,2})?)/i);
  const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : 0;
  const dateMatch = text.match(/\b\d{1,2}[ -](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[ ,/-]*\d{0,4}\b/i);
  const timeMatch = text.match(/\b\d{1,2}:\d{2}\s?(?:AM|PM)\b/i);
  const route = text.match(/\b([A-Z]{3})\s*(?:->|→|\bto\b)\s*([A-Z]{3})\b/);
  const seatOrRoom = text.match(/(?:seat|berth|coach|room)\s*(?:no\.?|number|:|#)?\s*([A-Z0-9-]{1,12})/i)?.[1];
  const provider = message.from.split('<')[0].trim().replace(/^"|"$/g, '') || 'Email confirmation';
  const title = message.subject.trim() || `${type[0].toUpperCase()}${type.slice(1)} booking`;
  const status = /cancelled|canceled|refunded|waitlist|pending|processing/i.test(text) ? 'pending' : 'confirmed';

  return {
    id: `gmail-${message.id}`,
    tripId,
    type,
    title,
    provider,
    confirmationCode: reference,
    status,
    dateStr: dateMatch?.[0] || 'See email confirmation',
    timeStr: timeMatch?.[0] || 'See email confirmation',
    departureLocation: route?.[1],
    arrivalLocation: route?.[2],
    seatOrRoom,
    price: Number.isFinite(amount) && amount > 0 ? amount : undefined,
    paidBy: 'You',
    notes: 'Imported from Gmail. Verify all details against the original confirmation.',
    sourceEmailId: message.id,
    sourceEmailSubject: message.subject,
    sourceEmailDate: message.date
  };
}
