import { fireEvent, render, screen } from '@testing-library/react-native';
import App from '../App';

it('opens the protected experience after a successful login and signs out from Profile', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockImplementation(
    async () =>
      new Response(
        JSON.stringify({
          id: 1,
          username: 'emilys',
          firstName: 'Emily',
          lastName: 'Johnson',
          accessToken: 'test-access',
          refreshToken: 'test-refresh',
        }),
      ),
  );

  try {
    render(<App />);
    expect(screen.queryByText('Find a place for your next trip.')).toBeNull();
    fireEvent.press(
      await screen.findByRole('button', { name: 'Use demo credentials' }),
    );
    fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
    expect(
      await screen.findByText('Find a place for your next trip.'),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByText('Profile'));
    expect(await screen.findByText('Emily Johnson')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Log out' }));
    expect(await screen.findByText('Welcome back')).toBeOnTheScreen();
    expect(screen.queryByText('Emily Johnson')).toBeNull();
  } finally {
    fetch.mockRestore();
  }
});
