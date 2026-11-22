import * as Keychain from 'react-native-keychain';
import { z } from 'zod';
import { tokensSchema } from '../api/authApi';

const sessionOptions = { service: 'com.passport.session' };
const sessionSchema = tokensSchema.extend({
  expiresAt: z.number().int().positive(),
});

export type StoredSession = z.infer<typeof sessionSchema>;

export class InvalidSavedSession extends Error {}
export class SessionWriteError extends Error {}

export async function saveSession(session: StoredSession) {
  try {
    const saved = await Keychain.setGenericPassword(
      'passport',
      JSON.stringify(session),
      {
        ...sessionOptions,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
      },
    );
    if (saved) {
      return;
    }
  } catch {
    // The native error can include implementation details.
  }
  throw new SessionWriteError(
    'Could not save your session securely. Try again.',
  );
}

export async function getSession(): Promise<StoredSession | null> {
  const credentials = await Keychain.getGenericPassword(sessionOptions);
  if (!credentials) {
    return null;
  }

  try {
    return sessionSchema.parse(JSON.parse(credentials.password));
  } catch {
    throw new InvalidSavedSession('The saved session is invalid.');
  }
}

export async function clearSession() {
  const cleared = await Keychain.resetGenericPassword(sessionOptions);
  if (!cleared && (await Keychain.hasGenericPassword(sessionOptions))) {
    throw new Error('Could not remove the saved session.');
  }
}
