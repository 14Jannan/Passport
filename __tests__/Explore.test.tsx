import {
  act,
  configure,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { createAppStore } from '../src/app/store';
import { ExploreScreen } from '../src/features/countries/screens/ExploreScreen';
import { api } from '../src/services/api';
import { countryRecords } from '../test-fixtures/countries';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

configure({ asyncUtilTimeout: 5000 });
jest.setTimeout(20000);

function renderExplore() {
  const store = createAppStore();
  const result = render(
    <Provider store={store}>
      <ExploreScreen />
    </Provider>,
  );
  return () => {
    result.unmount();
    store.dispatch(api.util.resetApiState());
  };
}

afterEach(() => {
  jest.restoreAllMocks();
  mockNavigate.mockClear();
});

it('loads countries, combines filters and sort, and only passes the country code to details', async () => {
  const fetch = jest
    .spyOn(globalThis, 'fetch')
    .mockImplementation(
      async () => new Response(JSON.stringify(countryRecords)),
    );
  const dispose = renderExplore();
  try {
    expect(
      screen.getByRole('progressbar', { name: 'Loading countries' }),
    ).toBeOnTheScreen();
    expect(await screen.findByText('4 countries')).toBeOnTheScreen();
    const flag = screen.getByLabelText('Flag of Sri Lanka');
    expect(flag).toHaveProp('source', { uri: countryRecords[0].flags?.png });
    fireEvent(flag, 'error');
    expect(screen.queryByLabelText('Flag of Sri Lanka')).toBeNull();

    fireEvent.press(screen.getByRole('button', { name: 'Asia region' }));
    expect(screen.getByRole('button', { name: 'Asia region' })).toBeSelected();
    fireEvent.changeText(screen.getByLabelText('Search countries'), ' a ');
    fireEvent.press(screen.getByRole('button', { name: 'Sort: Name A–Z' }));
    fireEvent.press(screen.getByRole('radio', { name: 'Population Low–High' }));
    const results = screen.getAllByRole('button', {
      name: /Tokyo|Sri Jayawardenepura Kotte/,
    });
    expect(results[0]).toHaveAccessibleName(/Sri Lanka/);
    expect(results[1]).toHaveAccessibleName(/Japan/);
    fireEvent.press(results[0]);
    expect(mockNavigate).toHaveBeenCalledWith('CountryDetails', {
      countryCode: 'LKA',
    });
    expect(fetch).toHaveBeenCalledTimes(1);

    fireEvent.changeText(screen.getByLabelText('Search countries'), 'no match');
    expect(await screen.findByText('No countries found')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Clear Filters' }));
    expect(screen.getByText('4 countries')).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Sort: Population Low–High' }),
    ).toBeOnTheScreen();
    fireEvent.press(
      screen.getByRole('button', { name: 'Sort: Population Low–High' }),
    );
    fireEvent.press(screen.getByRole('button', { name: 'Reset sorting' }));
    expect(
      screen.getByRole('button', { name: 'Sort: Name A–Z' }),
    ).toBeOnTheScreen();
  } finally {
    dispose();
  }
});

it('retries a failed catalog request and preserves cached cards during a failed refresh', async () => {
  let finishRefresh!: (response: Response) => void;
  const pendingRefresh = new Promise<Response>(resolve => {
    finishRefresh = resolve;
  });
  const fetch = jest
    .spyOn(globalThis, 'fetch')
    .mockRejectedValueOnce(new Error('No connection'))
    .mockImplementationOnce(
      async () => new Response(JSON.stringify(countryRecords)),
    )
    .mockReturnValueOnce(pendingRefresh);
  const dispose = renderExplore();
  try {
    expect(
      await screen.findByText('Could not load countries'),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Sri Lanka')).toBeOnTheScreen();
    fireEvent(screen.getByTestId('country-list'), 'refresh');
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    expect(screen.getByText('Sri Lanka')).toBeOnTheScreen();
    await act(async () => finishRefresh(new Response('{}', { status: 503 })));
    expect(
      await screen.findByText(/Showing the last loaded countries/),
    ).toBeOnTheScreen();
    expect(screen.getByText('Sri Lanka')).toBeOnTheScreen();
  } finally {
    dispose();
  }
});
