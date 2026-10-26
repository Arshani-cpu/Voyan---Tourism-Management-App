import { Capacitor, CapacitorHttp, registerPlugin } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { API_BASE_URL, apiUrl } from './api';
import type {
  BackgroundGeolocationPlugin,
  Location as NativeLocation
} from '@capacitor-community/background-geolocation';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');
const SESSION_STORAGE_KEY = 'voyan_active_sos_share';

export interface SOSLiveSession {
  id: string;
  updateToken: string;
  liveUrl: string;
  expiresAt: string;
}

export interface SOSLiveLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface SavedSOSLiveSession extends SOSLiveSession {
  startedAt: string;
}

export interface SOSLiveLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  updatedAt: string;
}

export interface SOSLiveStatus {
  active: boolean;
  expiresAt: string;
  location: SOSLiveLocationData | null;
}

export function readSavedSOSSession(): SavedSOSLiveSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as SavedSOSLiveSession;
    if (
      typeof session.id !== 'string' ||
      typeof session.updateToken !== 'string' ||
      typeof session.liveUrl !== 'string' ||
      Date.parse(session.expiresAt) <= Date.now()
    ) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Could not restore the active SOS sharing session:', error);
    return null;
  }
}

export function saveSOSSession(session: SOSLiveSession): SavedSOSLiveSession {
  const saved = { ...session, startedAt: new Date().toISOString() };
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(saved));
  } catch (error) {
    console.error('Could not save the active SOS sharing session:', error);
    throw new Error('Voyan could not save the SOS session on this device.');
  }
  return saved;
}

export function clearSavedSOSSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Could not clear the saved SOS session:', error);
  }
}

export async function createSOSLiveSession(): Promise<SOSLiveSession> {
  const result = await sosRequest<SOSLiveSession>('/api/sos/sessions', { method: 'POST' });
  if (!result.id || !result.updateToken || !result.liveUrl || !result.expiresAt) {
    throw new Error('The live SOS service returned an incomplete session.');
  }
  return result;
}

export async function updateSOSLiveLocation(
  session: SavedSOSLiveSession,
  location: SOSLiveLocation
): Promise<void> {
  await sosRequest(`/api/sos/sessions/${encodeURIComponent(session.id)}`, {
    method: 'PATCH',
    token: session.updateToken,
    body: location
  });
}

export async function stopSOSLiveSession(session: SavedSOSLiveSession): Promise<void> {
  await sosRequest(`/api/sos/sessions/${encodeURIComponent(session.id)}`, {
    method: 'DELETE',
    token: session.updateToken
  });
}

export async function getSOSLiveStatus(shareToken: string): Promise<SOSLiveStatus> {
  return sosRequest<SOSLiveStatus>(`/api/sos/live/${encodeURIComponent(shareToken)}`, { method: 'GET' });
}

export async function startSOSLocationWatcher(
  onLocation: (location: SOSLiveLocation) => void,
  onError: (message: string) => void
): Promise<() => Promise<void>> {
  if (Capacitor.isNativePlatform()) {
    try {
      const notificationPermission = await LocalNotifications.checkPermissions();
      if (notificationPermission.display !== 'granted') {
        const requestedPermission = await LocalNotifications.requestPermissions();
        if (requestedPermission.display !== 'granted') {
          throw new Error('Allow notifications so the phone can show that emergency location sharing is active.');
        }
      }

      const watcherId = await BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: 'Voyan SOS is sharing your location. Open Voyan to stop sharing.',
          backgroundTitle: 'Emergency location sharing active',
          requestPermissions: true,
          stale: false,
          distanceFilter: 25
        },
        (location?: NativeLocation, error?: Error & { code?: string }) => {
          if (error) {
            onError(error.code === 'NOT_AUTHORIZED'
              ? 'Location permission is required. Allow background location in app settings to keep SOS sharing active.'
              : `Background location error: ${error.message || error.code || 'unknown error'}`);
            return;
          }
          if (!location) return;
          onLocation({
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy
          });
        }
      );
      return async () => BackgroundGeolocation.removeWatcher({ id: watcherId });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Could not start background location.');
    }
  }

  if (!window.isSecureContext || !navigator.geolocation) {
    throw new Error('This page cannot access GPS because it is not a secure context. On a phone, use the HTTPS website or the installed Voyan app; http://192.168.x.x does not allow browser location access.');
  }

  const watcherId = navigator.geolocation.watchPosition(
    (position) => onLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy
    }),
    (error) => {
      const message = error.code === error.PERMISSION_DENIED
        ? 'Location permission is blocked. Allow location access for Voyan in browser or phone settings.'
        : error.code === error.POSITION_UNAVAILABLE
          ? 'The device could not determine its location. Check that GPS/location services are enabled.'
          : error.code === error.TIMEOUT
            ? 'GPS took too long to respond. Move to an area with a clearer sky view and retry.'
            : error.message || 'Could not read the device location.';
      onError(message);
    },
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
  );
  return async () => navigator.geolocation.clearWatch(watcherId);
}

async function sosRequest<T>(
  endpoint: string,
  options: { method: string; token?: string; body?: SOSLiveLocation }
): Promise<T> {
  if (Capacitor.isNativePlatform() && !API_BASE_URL) {
    throw new Error('The native app is missing VITE_SOS_API_URL. Configure the public HTTPS Voyan server before building the mobile app.');
  }
  const url = apiUrl(endpoint);
  const headers: Record<string, string> = {};
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.body) headers['Content-Type'] = 'application/json';

  if (Capacitor.isNativePlatform()) {
    const response = await CapacitorHttp.request({
      url,
      method: options.method,
      headers,
      data: options.body
    });
    if (response.status < 200 || response.status >= 300) {
      const message = response.data && typeof response.data === 'object' && 'error' in response.data
        ? String(response.data.error)
        : `Live SOS request failed (${response.status}).`;
      throw new Error(message);
    }
    return response.data as T;
  }

  const response = await fetch(url, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store'
  });
  const data = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(data.error || `Live SOS request failed (${response.status}).`);
  return data as T;
}
