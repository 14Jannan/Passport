import {
  loginSchema,
  registrationSchema,
} from '../src/features/auth/validation/authSchemas';

const valid = {
  fullName: 'Riley Traveller',
  email: 'riley@example.com',
  username: 'riley',
  password: 'demo-pass',
  confirmPassword: 'demo-pass',
};

it('requires login credentials and validates username syntax', () => {
  expect(loginSchema.safeParse({ username: '', password: '' }).success).toBe(
    false,
  );
  expect(
    loginSchema.safeParse({ username: 'invalid name', password: 'pass' })
      .success,
  ).toBe(false);
  expect(
    loginSchema.parse({ username: ' riley ', password: 'pass' }).username,
  ).toBe('riley');
});

it.each([
  ['fullName', ' ', 'Enter your full name.'],
  ['email', 'invalid-email', 'Enter a valid email address.'],
  ['username', '', 'Enter a username.'],
  ['password', 'short', 'Use at least 8 characters.'],
  ['confirmPassword', 'other-pass', 'Passwords must match.'],
] as const)('reports a specific error for %s', (field, value, message) => {
  const parsed = registrationSchema.safeParse({ ...valid, [field]: value });
  expect(parsed.error?.issues).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ path: [field], message }),
    ]),
  );
});

it('accepts valid registration details', () => {
  expect(registrationSchema.safeParse(valid).success).toBe(true);
});
