import type { CountryCurrency } from '../types';

export function normalizeCountryCode(code: unknown) {
  if (typeof code !== 'string') {
    return null;
  }
  const value = code.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(value) ? value : null;
}

export function safeMapUrl(value: unknown): string | null {
  // Allow only public map paths from the providers used by REST Countries.
  const allowed =
    /^https:\/\/(?:www\.openstreetmap\.org\/(?:relation|way|node)\/\d+\/?|goo\.gl\/maps\/[a-z0-9_-]+\/?|maps\.app\.goo\.gl\/[a-z0-9_-]+\/?)$/i;
  return typeof value === 'string' && allowed.test(value) ? value : null;
}

const numberFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

export function formatPopulation(value: number | null) {
  return value === null ? 'Unavailable' : numberFormat.format(value);
}

export function formatArea(value: number | null) {
  return value === null ? 'Unavailable' : `${numberFormat.format(value)} km²`;
}

export function formatCurrency(currency: CountryCurrency) {
  return currency.name
    ? `${currency.name} (${currency.code})${
        currency.symbol ? ` · ${currency.symbol}` : ''
      }`
    : currency.code;
}
