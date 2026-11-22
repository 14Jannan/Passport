import { normalizeCountries } from '../src/features/countries/api/normalizeCountries';
import { countryRecords } from '../test-fixtures/countries';

it('maps REST Countries fields to a country and retains the provided flag and alt text', () => {
  expect(normalizeCountries(countryRecords)?.[0]).toEqual({
    cca3: 'LKA',
    commonName: 'Sri Lanka',
    officialName: 'Democratic Socialist Republic of Sri Lanka',
    capitals: ['Sri Jayawardenepura Kotte'],
    region: 'Asia',
    subregion: 'Southern Asia',
    population: 21763170,
    area: 65610,
    flagUrl: 'https://flagcdn.com/w320/lk.png',
    flagAlt: 'Flag of Sri Lanka',
  });
});

it('handles missing optional fields, invalid records and duplicate codes', () => {
  expect(
    normalizeCountries([
      countryRecords[3],
      { ...countryRecords[3], cca3: ' ata ' },
      { cca3: 'bad1' },
    ]),
  ).toEqual([
    {
      cca3: 'ATA',
      commonName: 'Antarctica',
      officialName: null,
      capitals: [],
      region: 'Antarctic',
      subregion: null,
      population: null,
      area: null,
      flagUrl: null,
      flagAlt: null,
    },
  ]);
});

it('distinguishes a valid empty catalog from an error envelope or unusable data', () => {
  expect(normalizeCountries([])).toEqual([]);
  expect(normalizeCountries({ success: false, data: null })).toBeNull();
  expect(normalizeCountries([{ name: {} }])).toBeNull();
});
