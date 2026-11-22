import { api } from '../../../services/api';
import type { Country, CountryDetails } from '../types';
import { normalizeCountryCode } from '../utils/countryDetails';
import {
  normalizeCountries,
  normalizeCountryDetails,
} from './normalizeCountries';

// Public v3.1-compatible mirror of the original REST Countries dataset.
const countriesHost = 'https://pw-d20261017a29.plainwork-apps.workers.dev/v3.1';
export const countriesEndpoint = `${countriesHost}/all`;
export function countryDetailsUrl(code: string) {
  return `${countriesHost}/alpha/${encodeURIComponent(code)}`;
}
const fields = 'name,cca3,capital,region,subregion,population,area,flags';

export const countriesApi = api.injectEndpoints({
  endpoints: build => ({
    getCountryDetails: build.query<CountryDetails | null, string>({
      keepUnusedDataFor: 300,
      async queryFn(arg, _api, _options, baseQuery) {
        const code = normalizeCountryCode(arg);
        if (!code) {
          return {
            error: { status: 'CUSTOM_ERROR', error: 'Invalid country code.' },
          };
        }
        const result = await baseQuery({
          url: countryDetailsUrl(code),
          params: {
            fields:
              fields + ',languages,currencies,timezones,continents,latlng,maps',
          },
        });
        if (result.error?.status === 404) {
          return { data: null };
        }
        if (result.error) {
          return { error: result.error };
        }
        if (Array.isArray(result.data) && result.data.length === 0) {
          return { data: null };
        }
        const data = normalizeCountryDetails(result.data, code);
        return data
          ? { data }
          : {
              error: {
                status: 'CUSTOM_ERROR',
                error: 'Invalid country details response.',
              },
            };
      },
    }),
    getCountries: build.query<Country[], void>({
      keepUnusedDataFor: 300,
      async queryFn(_arg, _api, _options, baseQuery) {
        const result = await baseQuery({
          url: countriesEndpoint,
          params: { fields },
        });
        if (result.error) {
          return { error: result.error };
        }
        const data = normalizeCountries(result.data);
        if (!data) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Invalid country catalog response.',
            },
          };
        }
        return { data };
      },
    }),
  }),
});

export const { useGetCountriesQuery, useGetCountryDetailsQuery } = countriesApi;
