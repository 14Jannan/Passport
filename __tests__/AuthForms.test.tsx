import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import App from '../App';

function deferredResponse() {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>(done => {
    resolve = done;
  });
  return { promise, resolve };
}

afterEach(() => jest.restoreAllMocks());

it('focuses an empty login field and shows specific validation and visibility controls', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch');
  render(<App />);
  const username = await screen.findByLabelText('Username');
  fireEvent(username, 'focus', { nativeEvent: {} });
  fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByText('Enter a username.')).toBeOnTheScreen();
  expect(await screen.findByText('Enter your password.')).toBeOnTheScreen();
  expect(screen.getByLabelText('Password')).toHaveProp('secureTextEntry', true);
  fireEvent.press(screen.getByRole('button', { name: 'Show password' }));
  expect(screen.getByLabelText('Password')).toHaveProp(
    'secureTextEntry',
    false,
  );
  expect(fetch).not.toHaveBeenCalled();
});

it('shows login loading, rejects incorrect credentials and explains a network failure', async () => {
  const response = deferredResponse();
  const fetch = jest
    .spyOn(globalThis, 'fetch')
    .mockReturnValueOnce(response.promise)
    .mockRejectedValueOnce(new Error('Network unavailable'));
  render(<App />);
  fireEvent.press(
    await screen.findByRole('button', { name: 'Use demo credentials' }),
  );
  const submit = () =>
    fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
  submit();
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled(),
  );
  await act(async () => response.resolve(new Response('{}', { status: 400 })));
  expect(
    await screen.findByText(/Username or password is incorrect/),
  ).toBeOnTheScreen();
  submit();
  expect(
    await screen.findByText(/Check your internet connection/),
  ).toBeOnTheScreen();
  expect(fetch).toHaveBeenCalledTimes(2);
});

it('prevents duplicate registration requests and confirms simulated registration on login', async () => {
  const response = deferredResponse();
  const fetch = jest
    .spyOn(globalThis, 'fetch')
    .mockReturnValueOnce(response.promise);
  render(<App />);
  fireEvent.press(
    await screen.findByRole('button', { name: 'Create a demo account' }),
  );
  expect(await screen.findByText(/Use sample details/)).toBeOnTheScreen();
  for (const [label, value] of Object.entries({
    'Full name': 'Riley Traveller',
    Email: 'riley@example.com',
    Username: 'riley',
    Password: 'demo-pass',
    'Confirm password': 'demo-pass',
  })) {
    fireEvent.changeText(screen.getByLabelText(label), value);
  }
  const submit = screen.getByRole('button', { name: 'Create account' });
  fireEvent.press(submit);
  fireEvent.press(submit);
  await waitFor(() => expect(submit).toBeDisabled());
  await act(async () =>
    response.resolve(new Response('{"id":209}', { status: 201 })),
  );
  expect(
    await screen.findByText(/this account cannot be used to sign in/),
  ).toBeOnTheScreen();
  expect(screen.getByText('Welcome back')).toBeOnTheScreen();
  expect(fetch).toHaveBeenCalledTimes(1);
});
