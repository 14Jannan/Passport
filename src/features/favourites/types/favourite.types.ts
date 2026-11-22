/**
 * Favourite country data model.
 *
 * Uses the ISO 3166-1 alpha-3 country code (cca3) as the unique identifier.
 * No country metadata is duplicated here — the REST Countries API or cached
 * country data provides current country information at render time.
 *
 * bucketStatus supports future Bucket List functionality (Prompt 7).
 *
 * Removal policy:
 * - Countries with no journal data are removed immediately.
 * - When journal notes/photos are introduced (Prompt 6), removal of a country
 *   that has journal data should prompt for confirmation before deleting
 *   associated content. Personal journal content must never be silently deleted.
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
