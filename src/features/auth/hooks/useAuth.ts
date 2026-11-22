import { useAppDispatch } from '../../../app/store';
import { authApi } from '../api/authApi';
import { saveSession } from '../services/authStorage';
import { nextExpiry } from '../services/sessionActions';
import { signIn } from '../session';
import type { LoginValues, RegisterValues } from '../validation/authSchemas';

export function useAuth() {
  const dispatch = useAppDispatch();

  async function login(values: LoginValues) {
    const expiresAt = nextExpiry();
    const { id, username, firstName, lastName, accessToken, refreshToken } =
      await dispatch(
        authApi.endpoints.login.initiate(values, { track: false }),
      ).unwrap();
    await saveSession({ accessToken, refreshToken, expiresAt });
    dispatch(
      signIn({ user: { id, username, firstName, lastName }, expiresAt }),
    );
  }

  async function register({
    fullName,
    email,
    username,
    password,
  }: RegisterValues) {
    await dispatch(
      authApi.endpoints.register.initiate(
        { fullName, email, username, password },
        { track: false },
      ),
    ).unwrap();
  }

  return { login, register };
}
