const DATABASE_NAME = 'voyan-offline-trip-repository';
const DATABASE_VERSION = 1;
const STORE_NAME = 'items';

export interface OfflineTripItem {
  id: string;
  tripId: string;
  kind?: 'memory' | 'email';
  title: string;
  description: string;
  location?: string;
  emailTo?: string;
  emailSubject?: string;
  emailBody?: string;
  attachmentItemIds?: string[];
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  file?: Blob;
  createdAt: string;
}

function openDatabase(): Promise<IDBDatabase> {
  if (!('indexedDB' in window)) {
    return Promise.reject(new Error('Offline file storage is not available in this browser.'));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('tripId', 'tripId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open offline file storage.'));
    request.onblocked = () => reject(new Error('Offline file storage is busy in another app tab. Close other Voyan tabs and try again.'));
  });
}

export async function listOfflineTripItems(tripId: string): Promise<OfflineTripItem[]> {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).index('tripId').getAll(tripId);
      request.onsuccess = () => resolve(request.result as OfflineTripItem[]);
      request.onerror = () => reject(request.error ?? new Error('Could not load offline trip files.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Could not load offline trip files.'));
    });
  } finally {
    database.close();
  }
}

export async function saveOfflineTripItem(item: OfflineTripItem): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(item);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not save this item for offline access.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Could not save this item for offline access.'));
    });
  } finally {
    database.close();
  }
}

export async function deleteOfflineTripItem(id: string): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not remove this offline item.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Could not remove this offline item.'));
    });
  } finally {
    database.close();
  }
}
