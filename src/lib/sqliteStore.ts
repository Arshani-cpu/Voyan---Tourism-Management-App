import { auth } from './firebase';
import { apiUrl } from './api';

export interface StoredRecord<T> {
  id: string;
  data: T;
  createdAt: string;
  updatedAt: string;
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in to access saved data.');

  const token = await user.getIdToken();
  const response = await fetch(apiUrl(url), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers
    }
  });

  // Guard: parse JSON only when the server actually returned JSON.
  // When only the Vite dev-server is running (no Express backend), /api routes
  // fall through to the SPA rewrite and return an HTML page — calling .json()
  // on that gives "Unexpected end of JSON input".
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status}. Make sure the backend server is running (npm run dev:all).`
      );
    }
    // Non-JSON 2xx (e.g. 204 No Content from DELETE) — treat as success with no body
    return undefined as unknown as T;
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new Error('Could not parse server response. The backend may not be running.');
  }

  if (!response.ok) {
    const err = result as Record<string, string>;
    throw new Error(err.message || err.error || 'Could not access saved data.');
  }
  return result as T;
}

const encodeKey = (value: string) => encodeURIComponent(value);

export const sqliteStore = {
  async downloadFile(fileId: string): Promise<Blob> {
    const user = auth.currentUser;
    if (!user) throw new Error('Sign in to download saved files.');

    const token = await user.getIdToken();
    const response = await fetch(apiUrl(`/api/files/${encodeKey(fileId)}`), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Could not download the file.');
    }
    return response.blob();
  },

  async list<T>(collection: string): Promise<StoredRecord<T>[]> {
    const result = await request<{ records: StoredRecord<T>[] }>(`/api/data/${encodeKey(collection)}`);
    return result?.records ?? [];
  },

  get<T>(collection: string, id: string): Promise<StoredRecord<T>> {
    return request(`/api/data/${encodeKey(collection)}/${encodeKey(id)}`);
  },

  save<T>(collection: string, id: string, data: T): Promise<{ ok: true; id: string; updatedAt: string }> {
    return request(`/api/data/${encodeKey(collection)}/${encodeKey(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ data })
    });
  },

  async remove(collection: string, id: string): Promise<void> {
    await request(`/api/data/${encodeKey(collection)}/${encodeKey(id)}`, { method: 'DELETE' });
  }
};