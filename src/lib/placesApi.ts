/**
 * Frontend API client for the Voyan Places backend (/api/places).
 * Fetches all 700 Indian places from the Java Spring Boot SQLite-backed REST API.
 */
import { apiUrl } from './api';

// ── Types ────────────────────────────────────────────────────────────────────

export interface PlaceAudienceCategory {
  category_key: string;
  category_label: string;
  assignment_method: string;
  confidence: string;
  rationale: string;
  evidence_count: number;
}

export interface EntryPass {
  indian_price: number;
  foreign_price: number;
  child_price: number;
  notes: string | null;
  booking_url: string | null;
}

export interface Place {
  place_id: string;
  name: string;
  state: string | null;
  district: string | null;
  locality: string | null;
  place_type: string | null;
  description: string | null;
  opening_hours: string | null;
  rating_text: string | null;
  rating_value: number | null;
  review_count: number | null;
  google_maps_url: string | null;
  directions_url: string | null;
  selection_category: string | null;
  audience_categories: PlaceAudienceCategory[];
  source_quality_status: string | null;
  entry_pass: EntryPass | null;
}

export interface PlaceListResponse {
  total: number;
  page: number;
  size: number;
  places: Place[];
}

export interface PlaceSearchResponse {
  query: string;
  total: number;
  page: number;
  size: number;
  places: Place[];
}

export interface PlaceMetaResponse {
  states?: string[];
  categories?: string[];
}

// ── API calls ────────────────────────────────────────────────────────────────

export async function fetchPlaces(params: {
  state?: string;
  category?: string;
  audience?: string;
  minRating?: number;
  page?: number;
  size?: number;
}): Promise<PlaceListResponse> {
  const searchParams = new URLSearchParams();
  if (params.state) searchParams.set('state', params.state);
  if (params.category) searchParams.set('category', params.category);
  if (params.audience) searchParams.set('audience', params.audience);
  if (params.minRating !== undefined) searchParams.set('minRating', String(params.minRating));
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.size !== undefined) searchParams.set('size', String(params.size));

  const qs = searchParams.toString();
  const url = apiUrl(`/api/places${qs ? `?${qs}` : ''}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Places API error: ${res.status}`);
  return res.json();
}

export async function fetchPlaceById(placeId: string): Promise<Place> {
  const url = apiUrl(`/api/places/${encodeURIComponent(placeId)}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Place not found: ${placeId}`);
  return res.json();
}

export async function searchPlaces(query: string, page = 0, size = 20): Promise<PlaceSearchResponse> {
  const searchParams = new URLSearchParams({ q: query, page: String(page), size: String(size) });
  const url = apiUrl(`/api/places/search?${searchParams}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Places search error: ${res.status}`);
  return res.json();
}

export async function fetchStates(): Promise<string[]> {
  const url = apiUrl('/api/places/meta/states');
  const res = await fetch(url);
  if (!res.ok) return [];
  const data: PlaceMetaResponse = await res.json();
  return data.states ?? [];
}

export async function fetchCategories(): Promise<string[]> {
  const url = apiUrl('/api/places/meta/categories');
  const res = await fetch(url);
  if (!res.ok) return [];
  const data: PlaceMetaResponse = await res.json();
  return data.categories ?? [];
}
