import { countryDetailsUrl } from '../api/countriesApi';
import type { Country } from '../types';
import { normalizeCountryCode } from './countryDetails';

type ShareCountry = Pick<
  Country,
  'cca3' | 'commonName' | 'capitals' | 'region'
>;

export function buildCountryShare(country: ShareCountry) {
  const code = normalizeCountryCode(country.cca3);
  if (!code) {
    return null;
  }
  const title = `Explore ${country.commonName} with Passport!`;
  const message = [
    title,
    '',
    `Capital: ${country.capitals.join(', ') || 'Unavailable'}`,
    `Region: ${country.region ?? 'Unavailable'}`,
    '',
    'Learn more:',
    countryDetailsUrl(code),
  ].join('\n');

  return { title, message };
}
