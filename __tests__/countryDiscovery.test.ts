import { act, renderHook } from '@testing-library/react-native';
import { normalizeCountries } from '../src/features/countries/api/normalizeCountries';
import { useDebouncedSearch } from '../src/features/countries/hooks/useDebouncedSearch';
import {
  filterCountries,
  sortCountries,
  type CountrySort,
} from '../src/features/countries/utils/discovery';
import { countryRecords } from '../test-fixtures/countries';

const catalog = Object.freeze(normalizeCountries(countryRecords) ?? []);
const codes = (items: typeof catalog) => items.map(country => country.cca3);

it('matches partial common and official names case-insensitively after trimming', () => {
  expect(codes(filterCountries(catalog, '  SrI ', 'All'))).toEqual(['LKA']);
  expect(codes(filterCountries(catalog, 'socialist republic', 'All'))).toEqual([
    'LKA',
  ]);
  expect(filterCountries(catalog, 'not a country', 'All')).toEqual([]);
});

it('filters actual regions and maps the Antarctica chip to the API’s Antarctic label', () => {
  expect(codes(filterCountries(catalog, '', 'Asia'))).toEqual(['LKA', 'JPN']);
  expect(codes(filterCountries(catalog, '', 'Americas'))).toEqual(['CAN']);
  expect(codes(filterCountries(catalog, '', 'Antarctica'))).toEqual(['ATA']);
  expect(filterCountries(catalog, 'Canada', 'Asia')).toEqual([]);
});

it.each<[CountrySort, string[]]>([
  ['name-asc', ['ATA', 'CAN', 'JPN', 'LKA']],
  ['name-desc', ['LKA', 'JPN', 'CAN', 'ATA']],
  ['population-asc', ['LKA', 'CAN', 'JPN', 'ATA']],
  ['population-desc', ['JPN', 'CAN', 'LKA', 'ATA']],
  ['area-asc', ['LKA', 'JPN', 'CAN', 'ATA']],
  ['area-desc', ['CAN', 'JPN', 'LKA', 'ATA']],
])('sorts by %s without mutating the cache', (option, expected) => {
  expect(codes(sortCountries(catalog, option))).toEqual(expected);
  expect(codes(catalog)).toEqual(['LKA', 'JPN', 'CAN', 'ATA']);
});

it('breaks numerical ties by country name and then code', () => {
  const tied = [
    { ...catalog[0], population: 1 },
    { ...catalog[1], population: 1 },
    { ...catalog[1], cca3: 'AAA', population: 1 },
  ];
  expect(codes(sortCountries(tied, 'population-desc'))).toEqual([
    'AAA',
    'JPN',
    'LKA',
  ]);
});

it('applies all three controls to the same cache', () => {
  expect(
    codes(
      sortCountries(filterCountries(catalog, ' a ', 'Asia'), 'population-desc'),
    ),
  ).toEqual(['JPN', 'LKA']);
});

it('debounces typing for 300 ms, drops earlier input and clears immediately', () => {
  jest.useFakeTimers();
  const { result, unmount } = renderHook(() => useDebouncedSearch());
  try {
    act(() => result.current.change('s'));
    act(() => jest.advanceTimersByTime(200));
    act(() => result.current.change('  sri '));
    act(() => jest.advanceTimersByTime(299));
    expect(result.current.query).toBe('');
    act(() => jest.advanceTimersByTime(1));
    expect(result.current.query).toBe('sri');
    act(() => result.current.change(''));
    expect(result.current.query).toBe('');
  } finally {
    unmount();
    jest.useRealTimers();
  }
});
