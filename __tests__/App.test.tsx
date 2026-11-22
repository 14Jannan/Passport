import {
  act,
  configure,
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native';
import * as Keychain from 'react-native-keychain';
import App from '../App';
import { CountryDetailsScreen } from '../src/features/countries/screens/CountryDetailsScreen';
import { japanDetails } from '../test-fixtures/countryDetails';
import { countryRecords } from '../test-fixtures/countries';

configure({ asyncUtilTimeout: 5000 });
jest.setTimeout(20000);

it('opens the protected experience after a successful login and signs out from Profile', async () => {
  let resolveStorage!: (value: false) => void;
  jest.mocked(Keychain.getGenericPassword).mockReturnValueOnce(
    new Promise<false>(resolve => {
      resolveStorage = resolve;
    }),
  );
  const fetch = jest.spyOn(globalThis, 'fetch').mockImplementation(
    async request =>
      new Response(
        JSON.stringify(
          request instanceof Request &&
            new URL(request.url).pathname === '/v3.1/all'
            ? countryRecords
            : request instanceof Request &&
              new URL(request.url).pathname === '/v3.1/alpha/JPN'
            ? japanDetails
            : {
                id: 1,
                username: 'emilys',
                firstName: 'Emily',
                lastName: 'Johnson',
                accessToken: 'test-access',
                refreshToken: 'test-refresh',
              },
        ),
      ),
  );

  try {
    render(<App />);
    expect(screen.getByRole('progressbar')).toBeOnTheScreen();
    expect(screen.queryByText('Where to next?')).toBeNull();
    await act(async () => resolveStorage(false));
    fireEvent.press(
      screen.getByRole('button', { name: 'Use demo credentials' }),
    );
    fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Where to next?')).toBeOnTheScreen();
    expect(await screen.findByText('Sri Lanka')).toBeOnTheScreen();
    expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByRole('button', { name: 'Asia region' }));
    fireEvent.changeText(screen.getByLabelText('Search countries'), 'Japan');
    expect(await screen.findByText('1 country')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: /Sort: Name/ }));
    fireEvent.press(screen.getByRole('radio', { name: /Area High/ }));
    fireEvent.press(screen.getByRole('button', { name: 'Japan, Tokyo, Asia' }));
    expect(await screen.findByText('Japanese')).toBeOnTheScreen();
    const details = screen.UNSAFE_getByType(CountryDetailsScreen).props;
    expect(details.route.params).toEqual({ countryCode: 'JPN' });
    expect(
      fetch.mock.calls.some(
        ([request]) =>
          request instanceof Request &&
          new URL(request.url).pathname === '/v3.1/alpha/JPN',
      ),
    ).toBe(true);
    await act(async () => details.navigation.goBack());
    expect(screen.getByLabelText('Search countries')).toHaveDisplayValue(
      'Japan',
    );
    expect(screen.getByRole('button', { name: 'Asia region' })).toBeSelected();
    expect(
      screen.getByRole('button', { name: /Sort: Area High/ }),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Profile'));
    expect(await screen.findByText('Emily Johnson')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Log out' }));
    expect(await screen.findByText('Welcome back')).toBeOnTheScreen();
    expect(screen.queryByText('Emily Johnson')).toBeNull();
    expect(Keychain.resetGenericPassword).toHaveBeenCalledTimes(1);
  } finally {
    fetch.mockRestore();
  }
});
