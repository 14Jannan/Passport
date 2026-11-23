import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  JOURNAL_NOTE_MAX,
  JOURNAL_STORAGE_VERSION,
  type JournalEntry,
  type StoredJournal,
} from '../types';

export function journalStorageKey(userId: number): string {
  return `passport:journal:${userId}`;
}

function isEntry(value: unknown): value is JournalEntry {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.countryCode === 'string' &&
    /^[A-Z]{3}$/.test(entry.countryCode) &&
    typeof entry.note === 'string' &&
    (entry.photoUri === null || typeof entry.photoUri === 'string') &&
    typeof entry.createdAt === 'string' &&
    typeof entry.updatedAt === 'string'
  );
}

/**
 * Parse a stored journal document.
 *
 * Accepts the versioned `{ version, entries }` format and the bare array
 * format (migration-safe). Invalid entries are dropped individually and
 * corrupted JSON yields an empty journal instead of crashing.
 */
export function parseStoredJournal(raw: string | null): JournalEntry[] {
  if (raw === null) {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  const list = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' &&
      parsed !== null &&
      Array.isArray((parsed as { entries?: unknown }).entries)
    ? (parsed as { entries: unknown[] }).entries
    : [];

  const byCountry = new Map<string, JournalEntry>();
  for (const item of list) {
    if (!isEntry(item)) {
      continue;
    }
    const entry: JournalEntry = {
      countryCode: item.countryCode,
      note: item.note.slice(0, JOURNAL_NOTE_MAX),
      photoUri: item.photoUri || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
    if (entry.note || entry.photoUri) {
      byCountry.set(entry.countryCode, entry);
    }
  }
  return [...byCountry.values()];
}

/** Load journal entries for one user. Throws on storage read failure. */
export async function loadJournal(userId: number): Promise<JournalEntry[]> {
  return parseStoredJournal(
    await AsyncStorage.getItem(journalStorageKey(userId)),
  );
}

/** Persist the full journal for one user. */
export async function saveJournal(
  userId: number,
  entries: JournalEntry[],
): Promise<void> {
  const document: StoredJournal = {
    version: JOURNAL_STORAGE_VERSION,
    entries,
  };
  await AsyncStorage.setItem(
    journalStorageKey(userId),
    JSON.stringify(document),
  );
}

export async function clearJournal(userId: number): Promise<void> {
  await AsyncStorage.removeItem(journalStorageKey(userId));
}
