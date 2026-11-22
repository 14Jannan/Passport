import type { Country } from '../types';

export const regions = [
  'All',
  'Africa',
  'Americas',
  'Asia',
  'Europe',
  'Oceania',
  'Antarctica',
] as const;
export type Region = (typeof regions)[number];

export const sortOptions = [
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
  { value: 'population-desc', label: 'Population High–Low' },
  { value: 'population-asc', label: 'Population Low–High' },
  { value: 'area-desc', label: 'Area High–Low' },
  { value: 'area-asc', label: 'Area Low–High' },
] as const;

export type CountrySort = (typeof sortOptions)[number]['value'];
export const defaultSort: CountrySort = 'name-asc';

const collator = new Intl.Collator('en', { sensitivity: 'base' });

export function filterCountries(
  countries: readonly Country[],
  search: string,
  region: Region,
) {
  const query = search.trim().toLowerCase();
  return countries.filter(country => {
    const inRegion =
      region === 'All' ||
      country.region === region ||
      (region === 'Antarctica' && country.region === 'Antarctic');
    return (
      inRegion &&
      (country.commonName.toLowerCase().includes(query) ||
        country.officialName?.toLowerCase().includes(query))
    );
  });
}

function compareNumber(
  left: number | null,
  right: number | null,
  direction: number,
) {
  if (left === null) {
    return right === null ? 0 : 1;
  }
  return right === null ? -1 : (left - right) * direction;
}

export function sortCountries(
  countries: readonly Country[],
  sort: CountrySort,
) {
  const direction = sort.endsWith('desc') ? -1 : 1;
  return [...countries].sort((left, right) => {
    const byName = collator.compare(left.commonName, right.commonName);
    const byCode = left.cca3.localeCompare(right.cca3, 'en');

    if (sort === 'name-asc' || sort === 'name-desc') {
      return byName * direction || byCode;
    }

    const metric =
      sort === 'area-asc' || sort === 'area-desc' ? 'area' : 'population';
    return (
      compareNumber(left[metric], right[metric], direction) || byName || byCode
    );
  });
}
