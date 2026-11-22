import {
  act,
  configure,
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native';
import { Alert, Linking, Share } from 'react-native';
import type { ComponentProps } from 'react';
import { Provider } from 'react-redux';
import { createAppStore } from '../src/app/store';
import { CountryDetailsScreen } from '../src/features/countries/screens/CountryDetailsScreen';
import { api } from '../src/services/api';
import { countryDetailsUrl } from '../src/features/countries/api/countriesApi';
import { normalizeCountryDetails } from '../src/features/countries/api/normalizeCountries';
import { ShareCountryButton } from '../src/features/countries/components/CountryDetailsActions';
import { CountryDetailsContent } from '../src/features/countries/components/CountryDetailsContent';
import {
  formatArea,
  formatCurrency,
  formatPopulation,
  normalizeCountryCode,
  safeMapUrl,
} from '../src/features/countries/utils/countryDetails';
import { buildCountryShare } from '../src/features/countries/utils/countryShare';
import { japanDetails } from '../test-fixtures/countryDetails';

configure({ asyncUtilTimeout: 5000 });

const country = normalizeCountryDetails(japanDetails, 'JPN')!;

afterEach(() => jest.restoreAllMocks());

it('normalizes an object and an array and converts language and currency records', () => {
  expect(country).toMatchObject({
    cca3: 'JPN',
    capitals: ['Tokyo'],
    commonName: 'Japan',
    coordinates: [36, 138],
    languages: ['Japanese'],
    currencies: [{ code: 'JPY', name: 'Japanese yen', symbol: '¥' }],
    continents: ['Asia'],
    timezones: ['UTC+09:00'],
    mapUrl: japanDetails.maps.openStreetMaps,
  });
  expect(normalizeCountryDetails([japanDetails], 'JPN')).toEqual(country);
  expect(formatCurrency(country.currencies[0])).toBe('Japanese yen (JPY) · ¥');
  expect(formatCurrency({ code: 'JPY', name: null, symbol: null })).toBe('JPY');
});

it('formats population and area with locale grouping and units', () => {
  expect(formatPopulation(123210000)).toBe(
    new Intl.NumberFormat().format(123210000),
  );
  expect(formatArea(377930.5)).toBe(
    `${new Intl.NumberFormat().format(377930.5)} km²`,
  );
  expect(formatArea(null)).toBe('Unavailable');
  expect(formatPopulation(null)).toBe('Unavailable');
});

it('falls back safely for missing or invalid optional fields', () => {
  const minimal = normalizeCountryDetails(
    {
      cca3: 'ATA',
      name: { common: 'Antarctica' },
      latlng: [181, 0],
      languages: { x: 11 },
    },
    'ATA',
  );
  expect(minimal).toMatchObject({
    capitals: [],
    coordinates: null,
    languages: [],
    currencies: [],
    timezones: [],
    continents: [],
    mapUrl: null,
    population: null,
    area: null,
    flagUrl: null,
  });
  render(<CountryDetailsContent country={minimal!} />);
  expect(screen.getByText('Antarctica')).toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'Open map' })).toBeNull();
});

it('rejects invalid codes, malformed payloads, and mismatched rows', () => {
  expect(normalizeCountryCode(' jpn ')).toBe('JPN');
  expect(normalizeCountryCode('../')).toBeNull();
  expect(normalizeCountryDetails([], 'JPN')).toBeNull();
  expect(normalizeCountryDetails({ success: false }, 'JPN')).toBeNull();
  expect(normalizeCountryDetails([japanDetails], 'LKA')).toBeNull();
});

it('restricts map actions to HTTPS map URLs and uses Linking', () => {
  expect(
    safeMapUrl('https://www.openstreetmap.org.evil.invalid/relation/1'),
  ).toBeNull();
  expect(safeMapUrl('http://www.openstreetmap.org/relation/1')).toBeNull();
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  render(<CountryDetailsContent country={country} />);
  expect(screen.getByText('Japanese')).toBeOnTheScreen();
  expect(screen.getByText('Japanese yen (JPY) · ¥')).toBeOnTheScreen();
  fireEvent.press(screen.getByRole('button', { name: 'Open map' }));
  expect(open).toHaveBeenCalledWith(japanDetails.maps.openStreetMaps);
});

it('generates a safe, readable share message even without optional fields', () => {
  expect(buildCountryShare(country)).toEqual({
    title: 'Explore Japan with Passport!',
    message: [
      'Explore Japan with Passport!',
      '',
      'Capital: Tokyo',
      'Region: Asia',
      '',
      'Learn more:',
      countryDetailsUrl('JPN'),
    ].join('\n'),
  });
  expect(
    buildCountryShare({ ...country, capitals: [], region: null })?.message,
  ).toContain('Capital: Unavailable');
  expect(buildCountryShare({ ...country, cca3: '../' })).toBeNull();
});

it.each([Share.sharedAction, Share.dismissedAction])(
  'opens native Share and accepts %s silently',
  async action => {
    const share = jest.spyOn(Share, 'share').mockResolvedValue({ action });
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    render(<ShareCountryButton country={country} />);
    await act(async () =>
      fireEvent.press(screen.getByRole('button', { name: 'Share Japan' })),
    );
    expect(share).toHaveBeenCalledWith(
      buildCountryShare(country),
      expect.objectContaining({ subject: 'Explore Japan with Passport!' }),
    );
    expect(alert).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Share Japan' })).toBeEnabled();
  },
);

it('alerts on native share failure and allows retry', async () => {
  jest.spyOn(Share, 'share').mockRejectedValue(new Error('Unavailable'));
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  render(<ShareCountryButton country={country} />);
  await act(async () =>
    fireEvent.press(screen.getByRole('button', { name: 'Share Japan' })),
  );
  expect(alert).toHaveBeenCalledWith(
    'Could not share country',
    expect.any(String),
  );
  expect(screen.getByRole('button', { name: 'Share Japan' })).toBeEnabled();
});

it('skips invalid routes and handles a failed detail request followed by a not-found result', async () => {
  const fetch = jest
    .spyOn(globalThis, 'fetch')
    .mockRejectedValueOnce(new Error('Offline'))
    .mockImplementationOnce(async () => new Response('{}', { status: 404 }));
  const store = createAppStore();
  const navigation = { setOptions: jest.fn() } as unknown as ComponentProps<
    typeof CountryDetailsScreen
  >['navigation'];
  const viewFor = (countryCode: string) => (
    <Provider store={store}>
      <CountryDetailsScreen
        navigation={navigation}
        route={{
          key: 'details',
          name: 'CountryDetails',
          params: { countryCode },
        }}
      />
    </Provider>
  );
  const rendered = render(viewFor('../'));
  try {
    expect(screen.getByText('Invalid country code')).toBeOnTheScreen();
    expect(fetch).not.toHaveBeenCalled();
    rendered.rerender(viewFor('ZZZ'));
    expect(
      screen.getByRole('progressbar', { name: 'Loading country details' }),
    ).toBeOnTheScreen();
    expect(
      await screen.findByText('Could not load country details'),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Country not found')).toBeOnTheScreen();
    expect(fetch).toHaveBeenCalledTimes(2);
  } finally {
    rendered.unmount();
    store.dispatch(api.util.resetApiState());
  }
});
