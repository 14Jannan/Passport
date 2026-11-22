import { useAppDispatch } from '../../../app/store';
import { authApi } from '../api/authApi';
import { signIn } from '../session';
import type { LoginValues, RegisterValues } from '../validation/authSchemas';

export function useAuth() {
  const dispatch = useAppDispatch();

  async function login(values: LoginValues) {
    const { id, username, firstName, lastName } = await dispatch(
      authApi.endpoints.login.initiate(values, { track: false }),
    ).unwrap();
    dispatch(signIn({ id, username, firstName, lastName }));
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
