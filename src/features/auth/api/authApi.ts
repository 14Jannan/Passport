import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { z } from 'zod';
import { api } from '../../../services/api';
import type { LoginValues, RegisterValues } from '../validation/authSchemas';

const profileSchema = z.object({
  id: z.number().int(),
  username: z.string().min(1),
  firstName: z.string(),
  lastName: z.string(),
});

export const tokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

const loginResponseSchema = profileSchema.extend(tokensSchema.shape);

export type AuthUser = z.infer<typeof profileSchema>;
export type AuthTokens = z.infer<typeof tokensSchema>;
type LoginResponse = z.infer<typeof loginResponseSchema>;
type RegistrationRequest = Omit<RegisterValues, 'confirmPassword'>;
export const sessionDurationMinutes = 30;

function parseResponse<T>(
  result: { data?: unknown; error?: FetchBaseQueryError },
  schema: z.ZodType<T>,
) {
  if (result.error) {
    const { status } = result.error;
    if (typeof status === 'number') {
      return { error: { status, data: null } };
    }
    if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR') {
      return { error: { status, error: 'Request failed.' } };
    }
    return {
      error: { status: 'CUSTOM_ERROR' as const, error: 'Request failed.' },
    };
  }
  const parsed = schema.safeParse(result.data);
  if (!parsed.success) {
    return {
      error: {
        status: 'CUSTOM_ERROR' as const,
        error: 'Invalid API response.',
      },
    };
  }
  return { data: parsed.data };
}

export const authApi = api.injectEndpoints({
  endpoints: build => ({
    login: build.mutation<LoginResponse, LoginValues>({
      async queryFn(values, _api, _options, baseQuery) {
        return parseResponse(
          await baseQuery({
            url: 'auth/login',
            method: 'POST',
            body: { ...values, expiresInMins: sessionDurationMinutes },
          }),
          loginResponseSchema,
        );
      },
    }),
    currentUser: build.mutation<AuthUser, string>({
      async queryFn(accessToken, _api, _options, baseQuery) {
        return parseResponse(
          await baseQuery({
            url: 'auth/me',
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          profileSchema,
        );
      },
    }),
    refresh: build.mutation<AuthTokens, string>({
      async queryFn(refreshToken, _api, _options, baseQuery) {
        return parseResponse(
          await baseQuery({
            url: 'auth/refresh',
            method: 'POST',
            body: { refreshToken, expiresInMins: sessionDurationMinutes },
          }),
          tokensSchema,
        );
      },
    }),
    register: build.mutation<{ id: number }, RegistrationRequest>({
      async queryFn({ fullName, ...fields }, _api, _options, baseQuery) {
        const [firstName, ...remaining] = fullName.split(/\s+/);
        return parseResponse(
          await baseQuery({
            url: 'users/add',
            method: 'POST',
            body: { ...fields, firstName, lastName: remaining.join(' ') },
          }),
          z.object({ id: z.number().int() }),
        );
      },
    }),
  }),
});

function hasStatus(error: unknown): error is { status: number | string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (typeof error.status === 'number' || typeof error.status === 'string')
  );
}

export function isRejectedCredential(error: unknown) {
  return (
    hasStatus(error) && [400, 401, 403].some(status => status === error.status)
  );
}

export function authErrorMessage(
  error: unknown,
  operation: 'login' | 'register' | 'restore',
) {
  if (
    hasStatus(error) &&
    (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR')
  ) {
    return 'Could not reach DummyJSON. Check your internet connection and try again.';
  }
  if (operation === 'login' && isRejectedCredential(error)) {
    return 'Username or password is incorrect. Check your details and try again.';
  }
  if (operation === 'register') {
    return 'Could not complete demo registration. Try again.';
  }
  return operation === 'restore'
    ? 'Could not verify your saved session. Try again or sign in.'
    : 'Could not sign in. Try again.';
}
