import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { AppButton } from '../../../components/AppButton';
import type { AuthStackParams } from '../../../navigation/types';
import { demoCredentials, registrationNotice } from '../authCopy';
import { AuthField } from '../components/AuthField';
import { AuthForm, AuthLink, AuthMessage } from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { useAuthSubmission } from '../hooks/useAuthSubmission';
import { logoutSession, restoreSession } from '../services/sessionActions';
import { loginSchema, type LoginValues } from '../validation/authSchemas';

export function LoginScreen({
  navigation,
  route,
}: NativeStackScreenProps<AuthStackParams, 'SignIn'>) {
  const { login } = useAuth();
  const dispatch = useAppDispatch();
  const issue = useAppSelector(state =>
    state.session.status === 'signedOut' ? state.session.issue : undefined,
  );
  const removalRequired = issue?.kind === 'clear';
  const { pending, error, run } = useAuthSubmission('login');
  const { control, handleSubmit, reset } = useForm<LoginValues>({
    mode: 'onBlur',
    defaultValues: { username: '', password: '' },
    resolver: zodResolver(loginSchema),
  });

  return (
    <AuthForm
      title="Welcome back"
      description="Sign in to explore new places and revisit your travel memories."
    >
      {issue && <AuthMessage error message={issue.message} />}
      {issue?.kind === 'retry' && (
        <AuthLink
          label="Retry saved session"
          disabled={pending}
          onPress={() => run(() => dispatch(restoreSession()))}
        />
      )}
      {removalRequired && (
        <AuthLink
          label="Retry session removal"
          disabled={pending}
          onPress={() => run(() => dispatch(logoutSession()))}
        />
      )}
      {route.params?.registered && <AuthMessage message={registrationNotice} />}
      <AuthField
        control={control}
        name="username"
        label="Username"
        editable={!pending && !removalRequired}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
      />
      <AuthField
        control={control}
        name="password"
        label="Password"
        secret
        editable={!pending && !removalRequired}
        autoComplete="current-password"
      />
      {error ? <AuthMessage error message={error} /> : null}
      <AppButton
        label="Sign in"
        loading={pending}
        disabled={removalRequired}
        onPress={handleSubmit(values => run(() => login(values)))}
      />
      <AuthLink
        label="Use demo credentials"
        disabled={pending || removalRequired}
        onPress={() => reset(demoCredentials)}
      />
      <AuthLink
        label="Create a demo account"
        disabled={pending || removalRequired}
        onPress={() => navigation.navigate('Register')}
      />
    </AuthForm>
  );
}
