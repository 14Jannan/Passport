import { z } from 'zod';
import type { Country } from '../types';

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
      // Android and iOS Image support PNG without a separate SVG renderer.
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

export function normalizeCountries(payload: unknown): Country[] | null {
  if (!Array.isArray(payload)) {
    return null;
  }

  const countries = new Map<string, Country>();
  for (const record of payload) {
    const { data } = countryRecord.safeParse(record);
    if (!data || countries.has(data.cca3)) {
      continue;
    }

    countries.set(data.cca3, {
      cca3: data.cca3,
      commonName: data.name.common,
      officialName: data.name.official,
      capitals: data.capital.flatMap(value =>
        typeof value === 'string' && value.trim() ? [value.trim()] : [],
      ),
      region: data.region,
      subregion: data.subregion,
      population: data.population,
      area: data.area,
      flagUrl: data.flags?.png ?? null,
      flagAlt: data.flags?.alt ?? null,
    });
  }

  return payload.length > 0 && countries.size === 0
    ? null
    : [...countries.values()];
}
