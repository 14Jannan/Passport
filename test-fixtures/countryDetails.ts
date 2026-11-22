import { countryRecords } from './countries';

export const japanDetails = {
  ...countryRecords[1],
  population: 123210000,
  languages: { jpn: 'Japanese' },
  currencies: { JPY: { name: 'Japanese yen', symbol: '¥' } },
  timezones: ['UTC+09:00'],
  continents: ['Asia'],
  latlng: [36, 138],
  maps: { openStreetMaps: 'https://www.openstreetmap.org/relation/382313' },
};
