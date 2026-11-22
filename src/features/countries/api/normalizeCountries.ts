import { z } from 'zod';
import type { Country, CountryDetails } from '../types';
import { safeMapUrl } from '../utils/countryDetails';

const optionalText = z.string().trim().min(1).nullable().catch(null);
const optionalNumber = z.number().finite().nonnegative().nullable().catch(null);
const countryRecord = z.object({
  cca3: z
    .string()
    .trim()
    .regex(/^[a-z]{3}$/i)
    .transform(code => code.toUpperCase()),
  name: z.object({ common: z.string().trim().min(1), official: optionalText }),
  capital: z.array(z.unknown()).catch([]),
  region: optionalText,
  subregion: optionalText,
  population: optionalNumber,
  area: optionalNumber,
  flags: z
    .object({
      // Android and iOS Image support PNG without an SVG renderer.
      png: z
        .string()
        .trim()
        .refine(url => url.startsWith('https://'))
        .nullable()
        .catch(null),
      alt: optionalText,
    })
    .nullable()
    .catch(null),
});

const detailRecord = countryRecord.extend({
  languages: z.record(z.string(), z.unknown()).catch({}),
  currencies: z.record(z.string(), z.unknown()).catch({}),
  timezones: z.array(z.unknown()).catch([]),
  continents: z.array(z.unknown()).catch([]),
  latlng: z
    .tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)])
    .nullable()
    .catch(null),
  maps: z
    .object({ googleMaps: optionalText, openStreetMaps: optionalText })
    .nullable()
    .catch(null),
});

const currencyRecord = z.object({ name: optionalText, symbol: optionalText });

function strings(values: unknown[]) {
  return [
    ...new Set(
      values.flatMap(value =>
        typeof value === 'string' && value.trim() ? [value.trim()] : [],
      ),
    ),
  ];
}

function toCountry(data: z.infer<typeof countryRecord>): Country {
  return {
    cca3: data.cca3,
    commonName: data.name.common,
    officialName: data.name.official,
    capitals: strings(data.capital),
    region: data.region,
    subregion: data.subregion,
    population: data.population,
    area: data.area,
    flagUrl: data.flags?.png ?? null,
    flagAlt: data.flags?.alt ?? null,
  };
}

export function normalizeCountries(payload: unknown): Country[] | null {
  if (!Array.isArray(payload)) {
    return null;
  }

  const countries = new Map<string, Country>();
  for (const record of payload) {
    const { data } = countryRecord.safeParse(record);
    if (data && !countries.has(data.cca3)) {
      countries.set(data.cca3, toCountry(data));
    }
  }
  return payload.length > 0 && countries.size === 0
    ? null
    : [...countries.values()];
}

export function normalizeCountryDetails(
  payload: unknown,
  code: string,
): CountryDetails | null {
  for (const record of Array.isArray(payload) ? payload : [payload]) {
    const { data } = detailRecord.safeParse(record);
    if (!data || data.cca3 !== code) {
      continue;
    }

    return {
      ...toCountry(data),
      languages: strings(Object.values(data.languages)),
      currencies: Object.entries(data.currencies).flatMap(([key, value]) => {
        const parsed = currencyRecord.safeParse(value);
        return /^[A-Z]{3}$/.test(key) && parsed.success
          ? [{ code: key, ...parsed.data }]
          : [];
      }),
      timezones: strings(data.timezones),
      continents: strings(data.continents),
      coordinates: data.latlng,
      mapUrl:
        safeMapUrl(data.maps?.openStreetMaps) ??
        safeMapUrl(data.maps?.googleMaps),
    };
  }
  return null;
}
