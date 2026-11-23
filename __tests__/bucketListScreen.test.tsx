import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  configure,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { createAppStore } from '../src/app/store';
import { signIn } from '../src/features/auth/session';
import { BucketStatusSelector } from '../src/features/bucketList/components/BucketStatusSelector';
import { BucketListScreen } from '../src/features/bucketList/screens/BucketListScreen';
import { selectCountryBucketStatus } from '../src/features/favourites/store/favouritesSelectors';
import {
  addFavourite,
  hydrateFavourites,
  updateBucketStatus,
} from '../src/features/favourites/store/favouritesSlice';
import { hydrateJournal } from '../src/features/journal/store/journalSlice';
import { api } from '../src/services/api';
import { ThemeProvider } from '../src/theme/theme';
import { countryRecords } from '../test-fixtures/countries';

configure({ asyncUtilTimeout: 5000 });

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const T = '2026-11-23T08:00:00.000Z';

function setup(codes: string[]) {
  const store = createAppStore();
  store.dispatch(
    signIn({
      user: { id: 9, username: 'emilys', firstName: 'Emily', lastName: 'J' },
      expiresAt: Date.now() + 60_000,
    }),
  );
  store.dispatch(hydrateFavourites([]));
  store.dispatch(hydrateJournal({ userId: 9, entries: [] }));
  for (const countryCode of codes) {
    store.dispatch(addFavourite({ countryCode, savedAt: T }));
  }
  const wrap = (node: ReactNode) => (
    <Provider store={store}>
      <ThemeProvider>{node}</ThemeProvider>
    </Provider>
  );
  return { store, wrap };
}

beforeEach(async () => {
  await AsyncStorage.clear();
  mockNavigate.mockClear();
  jest
    .spyOn(globalThis, 'fetch')
    .mockImplementation(
      async () => new Response(JSON.stringify(countryRecords)),
    );
});

afterEach(() => jest.restoreAllMocks());

it('changes and persists a status from the segmented selector', async () => {
  const { store, wrap } = setup(['JPN']);
  render(wrap(<BucketStatusSelector countryCode="JPN" countryName="Japan" />));

  expect(screen.getByRole('radio', { name: 'Want to Visit' })).toBeChecked();
  fireEvent.press(screen.getByRole('radio', { name: 'Visited' }));

  await waitFor(() =>
    expect(selectCountryBucketStatus(store.getState(), 'JPN')).toBe('visited'),
  );
  expect(screen.getByRole('radio', { name: 'Visited' })).toBeChecked();
  expect(
    JSON.parse((await AsyncStorage.getItem('passport:favourites:9'))!)[0],
  ).toMatchObject({ countryCode: 'JPN', bucketStatus: 'visited' });
});

it('renders nothing for a country that is not saved', () => {
  const { wrap } = setup([]);
  render(wrap(<BucketStatusSelector countryCode="JPN" countryName="Japan" />));
  expect(screen.queryByRole('radio')).toBeNull();
});

it('shows counts, filters cards by status and offers useful empty states', async () => {
  const { store, wrap } = setup(['JPN', 'LKA', 'CAN']);
  store.dispatch(
    updateBucketStatus({ countryCode: 'LKA', bucketStatus: 'visited' }),
  );
  store.dispatch(
    updateBucketStatus({ countryCode: 'CAN', bucketStatus: 'visited' }),
  );
  const view = render(wrap(<BucketListScreen />));
  try {
    expect(screen.getByText('My Travel Bucket List')).toBeOnTheScreen();
    expect(
      screen.getByText('Dream it. Plan it. Explore it.'),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('tab', { name: 'Want to Visit, 1 country' }),
    ).toBeSelected();
    expect(
      screen.getByRole('tab', { name: 'Visited, 2 countries' }),
    ).toBeOnTheScreen();
    expect(
      await screen.findByRole('button', { name: /^Japan, Asia, Tokyo/ }),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('tab', { name: 'Visited, 2 countries' }));
    expect(
      await screen.findByRole('button', { name: /^Sri Lanka, / }),
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /^Japan, / })).toBeNull();
    expect(screen.getByText('2 of 3 visited')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('tab', { name: 'Planning, 0 countries' }));
    expect(screen.getByText('Nothing in planning')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'View Favourites' }));
    expect(mockNavigate).toHaveBeenCalledWith('Home', { screen: 'Saved' });
  } finally {
    view.unmount();
    store.dispatch(api.util.resetApiState());
  }
});

it('invites the user to explore when nothing is saved', () => {
  const { store, wrap } = setup([]);
  const view = render(wrap(<BucketListScreen />));
  try {
    expect(screen.getByText('Your bucket list is empty')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Explore Countries' }));
    expect(mockNavigate).toHaveBeenCalledWith('Home', { screen: 'Discover' });
  } finally {
    view.unmount();
    store.dispatch(api.util.resetApiState());
  }
});
