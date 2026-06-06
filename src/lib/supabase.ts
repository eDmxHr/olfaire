import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database as GeneratedDatabase, Json } from './database.types';

// ── Environment variables ─────────────────────────────────────────
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
      'Check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
  );
}

// ── Database types ────────────────────────────────────────────────
export type SkinType = 'dry' | 'normal' | 'oily';
export type Lifestyle =
  | 'office'
  | 'outdoor'
  | 'creative'
  | 'home'
  | 'gym'
  | 'formal'
  | 'casual'
  | 'luxury'
  | 'nightlife'
  | 'dating'
  | 'travel'
  | 'beach'
  | 'minimal'
  | 'streetwear'
  | 'sporty'
  | 'elegant'
  | 'party'
  | 'relaxed'
  | 'business'
  | 'romantic'
  | 'winter'
  | 'summer';
export type Theme = 'light' | 'dark' | 'system';
export type StockLevel = 'full' | 'medium' | 'low' | 'empty';
export type Mood =
  | 'soft'
  | 'bold'
  | 'cosy'
  | 'sharp'
  | 'mysterious'
  | 'fresh'
  | 'dark'
  | 'romantic';
export type WearRating = 'loved' | 'neutral' | 'disliked';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  skin_type: SkinType;
  lifestyle: Lifestyle;
  preferred_families: string[];
  city: string | null;
  theme: Theme;
  notification_enabled: boolean;
  notification_time: string; // "08:00"
  is_premium: boolean;
  premium_expires_at: string | null;
  collection_public: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Fragrance {
  id: number;
  house: string | null;
  name: string | null;
  concentration: string | null;
  year: number | null;
  family: string | null;
  subfamily: string | null;
  gender: string | null;
  notes_top: string[] | null;
  notes_heart: string[] | null;
  notes_base: string[] | null;
  longevity: number | null;
  sillage: number | null;
  season_tags: string[] | null;
  occasion_tags: string[] | null;
  is_user_contributed: boolean | null;
  is_verified: boolean | null;
  image_url: string | null;
  created_at: string | null;
}

export interface CollectionItem {
  id: string;
  user_id: string;
  fragrance_id: number;
  fragrance?: Fragrance; // joined
  size_ml: number | null;
  stock_level: StockLevel;
  personal_rating: number | null;
  wear_count: number;
  last_worn_at: string | null;
  notes: string | null;
  is_wishlist: boolean;
  custom_image_url: string | null;
  added_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  suggested_fragrance_id: number | null;
  worn_fragrance_id: number | null;
  mood: Mood | null;
  occasion: string | null;
  weather_condition: string | null;
  weather_temp_c: number | null;
  weather_humidity: number | null;
  lumi_suggestion_text: string | null;
  reasoning_tags: string[] | null;
  wear_rating: WearRating | null;
  calendar_event: string | null;
  created_at: string;
}

export interface LayeringCache {
  id: string;
  fragrance_a_id: number;
  fragrance_b_id: number;
  compatibility_score: number;
  conflicts: boolean;
  severity: string | null;
  analysis_json: Record<string, any>;
  overall_character: string | null;
  created_at: string;
}

export interface Signature {
  id: string;
  user_id: string;
  layering_cache_id: string;
  name: string;
  tags: string[];
  card_image_url: string | null;
  is_public: boolean;
  share_count: number;
  created_at: string;
  // denormalised from layering_cache join — present when fetched via fetchSignatures
  fragrance_a_name?: string | null;
  fragrance_b_name?: string | null;
  analysis_json?: Record<string, any> | null;
}

export interface DNAProfile {
  user_id: string;
  families: Json; // e.g. { "Floral": 72.5, "Woody": 58.0 }
  dominant_family: string | null;
  lumi_insight: string | null;
  updated_at: string;
}

export interface FragranceContribution {
  id: string;
  submitted_by: string;
  house: string;
  name: string;
  raw_data: Record<string, any> | null;
  status: 'pending' | 'verified' | 'rejected';
  merged_into: number | null;
  created_at: string;
}

export interface FeatureRequest {
  id: string;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  upvotes: number;
  downvotes: number;
}

export interface FeatureRequestVote {
  user_id: string;
  request_id: string;
  vote: 1 | -1;
}

// ── Database schema type (generated) ─────────────────────────────
export type { GeneratedDatabase as Database };

// ── Supabase client ───────────────────────────────────────────────
export const supabase = createClient<GeneratedDatabase>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // must be false for React Native
  },
});

// ── Image source helper ───────────────────────────────────────────

const BOTTLE_PLACEHOLDER = require('../../assets/images/perume-bottle-circle.png');

/**
 * Priority: custom user photo > canonical fragrance image > placeholder.
 */
export function getFragranceImageSource(
  fragrance?: Pick<Fragrance, 'image_url'> | null,
  customImageUrl?: string | null,
): { uri: string } | number {
  if (customImageUrl) return { uri: customImageUrl };
  if (fragrance?.image_url) return { uri: fragrance.image_url };
  return BOTTLE_PLACEHOLDER;
}

// ── Storage helpers ───────────────────────────────────────────────

/**
 * Returns the public URL for a user's custom bottle image.
 * Falls back to null if no image exists.
 */
export function getBottleImageUrl(userId: string, collectionId: string): string {
  const { data } = supabase.storage
    .from('user-uploads')
    .getPublicUrl(`${userId}/${collectionId}.jpg`);
  return data.publicUrl;
}

/**
 * Returns the public URL for a saved signature card image.
 */
export function getSignatureCardUrl(userId: string, signatureId: string): string {
  const { data } = supabase.storage
    .from('signature-cards')
    .getPublicUrl(`${userId}/${signatureId}.jpg`);
  return data.publicUrl;
}

/**
 * Uploads a user's avatar to Supabase Storage.
 * Returns the public URL on success, null on failure.
 */
export async function uploadAvatarImage(userId: string, fileUri: string): Promise<string | null> {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const path = `${userId}.jpg`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
    if (error) {
      console.error('Avatar upload error:', error);
      return null;
    }
    // Signed URL valid for 1 year — regenerated on each avatar upload
    const { data: signed, error: signError } = await supabase.storage
      .from('avatars')
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signError || !signed) {
      console.error('Avatar signed URL error:', signError);
      return null;
    }
    return signed.signedUrl;
  } catch (err) {
    console.error('uploadAvatarImage failed:', err);
    return null;
  }
}

/**
 * Uploads a user's bottle photo to Supabase Storage.
 * Returns the public URL on success, null on failure.
 */
export async function uploadBottleImage(
  userId: string,
  collectionId: string,
  fileUri: string
): Promise<string | null> {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const path = `${userId}/${collectionId}.jpg`;

    const { error } = await supabase.storage
      .from('user-uploads')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }
    return getBottleImageUrl(userId, collectionId);
  } catch (err) {
    console.error('uploadBottleImage failed:', err);
    return null;
  }
}

export async function uploadSignatureCardImage(
  userId: string,
  signatureId: string,
  fileUri: string
): Promise<string | null> {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const { error } = await supabase.storage
      .from('signature-cards')
      .upload(`${userId}/${signatureId}.jpg`, blob, { upsert: true, contentType: 'image/jpeg' });
    if (error) return null;
    return getSignatureCardUrl(userId, signatureId);
  } catch {
    return null;
  }
}

// ── Auth helpers ──────────────────────────────────────────────────

/**
 * Returns the current session synchronously from the store.
 * Use this for quick checks — for reactive auth state use onAuthStateChange.
 */
export async function getCurrentSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) return null;
    return session;
  } catch {
    return null;
  }
}

/**
 * Returns the current user's ID or null if not signed in.
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await getCurrentSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
