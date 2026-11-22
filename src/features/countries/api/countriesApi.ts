import { api } from '../../../services/api';
import type { Country } from '../types';
import { normalizeCountries } from './normalizeCountries';

// Public v3.1-compatible mirror of the original REST Countries dataset.
export const countriesEndpoint =
  'https://pw-d20261017a29.plainwork-apps.workers.dev/v3.1/all';
const fields = 'name,cca3,capital,region,subregion,population,area,flags';

export const countriesApi = api.injectEndpoints({
  endpoints: build => ({
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

export const { useGetCountriesQuery } = countriesApi;
