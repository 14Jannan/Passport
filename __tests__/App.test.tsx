import {
  act,
  configure,
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native';
import * as Keychain from 'react-native-keychain';
import App from '../App';
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
