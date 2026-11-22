import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import App from '../App';

it('opens the guest experience from the welcome screen', async () => {
  let app!: ReactTestRenderer;
  await act(async () => {
    app = create(<App />);
  });

  try {
    const button = app.root
      .findAllByProps({ accessibilityRole: 'button' })
      .find(
        node =>
          typeof node.props.onPress === 'function' &&
          node.findAllByProps({ children: 'Continue as guest' }).length > 0,
      );
    expect(button).toBeDefined();
    await act(async () => button!.props.onPress());
    expect(
      app.root.findAllByProps({ children: 'Find a place for your next trip.' })
        .length,
    ).toBeGreaterThan(0);
  } finally {
    await act(async () => app.unmount());
  }
});
