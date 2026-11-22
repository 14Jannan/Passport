import React from 'react';
import { act, create } from 'react-test-renderer';
import App from '../App';

it('renders Passport', async () => {
  let app: ReturnType<typeof create>;
  await act(async () => {
    app = create(<App />);
  });
  expect(app!.toJSON()).toBeTruthy();
  await act(async () => app!.unmount());
});
