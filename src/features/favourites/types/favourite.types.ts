/**
 * Favourite country data model.
 *
 * Uses the ISO 3166-1 alpha-3 country code (cca3) as the unique identifier.
 * No country metadata is duplicated here — the REST Countries API or cached
 * country data provides current country information at render time.
 *
 * The bucket-list status lives on the favourite itself, so a country has
 * exactly one status and the status disappears when the favourite is removed.
 *
 * Removal policy:
 * - Countries with no journal data are removed immediately.
 * - Countries with a journal note/photo require confirmation, and removing
 *   them also deletes the journal entry and its stored photo.
 */
export type BucketStatus = 'want_to_visit' | 'planning' | 'visited';

export interface FavouriteCountry {
  /** ISO 3166-1 alpha-3 country code, e.g. 'JPN'. */
  countryCode: string;
  /** ISO 8601 timestamp of when the country was saved. */
  savedAt: string;
  /** Travel planning status. Defaults to 'want_to_visit'. */
  bucketStatus: BucketStatus;
}

export const DEFAULT_BUCKET_STATUS: BucketStatus = 'want_to_visit';

/** Display order of bucket-list statuses. */
export const BUCKET_STATUSES: readonly BucketStatus[] = [
  'want_to_visit',
  'planning',
  'visited',
];

export function isBucketStatus(value: unknown): value is BucketStatus {
  return (
    typeof value === 'string' &&
    (BUCKET_STATUSES as readonly string[]).includes(value)
  );
}

export interface BucketStatusMeta {
  label: string;
  description: string;
  icon: 'star' | 'map' | 'check-circle';
  /** Theme colour token used for the status accent. */
  tone: 'accent' | 'gold' | 'success';
}

export const bucketStatusMeta: Record<BucketStatus, BucketStatusMeta> = {
  want_to_visit: {
    label: 'Want to Visit',
    description: 'A dream destination on your wishlist',
    icon: 'star',
    tone: 'accent',
  },
  planning: {
    label: 'Planning',
    description: 'You are actively planning this trip',
    icon: 'map',
    tone: 'gold',
  },
  visited: {
    label: 'Visited',
    description: 'You have been here',
    icon: 'check-circle',
    tone: 'success',
  },
};

export type BucketStatusCounts = Record<BucketStatus, number>;
