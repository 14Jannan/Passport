import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { AppButton } from '../../../components/AppButton';
import type { AuthStackParams } from '../../../navigation/types';
import { demoCredentials, registrationNotice } from '../authCopy';
import { AuthField } from '../components/AuthField';
import { AuthForm, AuthLink, AuthMessage } from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { useAuthSubmission } from '../hooks/useAuthSubmission';
import { loginSchema, type LoginValues } from '../validation/authSchemas';

export function LoginScreen({
  navigation,
  route,
}: NativeStackScreenProps<AuthStackParams, 'SignIn'>) {
  const { login } = useAuth();
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
      {route.params?.registered && <AuthMessage message={registrationNotice} />}
      <AuthField
        control={control}
        name="username"
        label="Username"
        editable={!pending}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
      />
      <AuthField
        control={control}
        name="password"
        label="Password"
        secret
        editable={!pending}
        autoComplete="current-password"
      />
      {error ? <AuthMessage error message={error} /> : null}
      <AppButton
        label="Sign in"
        loading={pending}
        onPress={handleSubmit(values => run(() => login(values)))}
      />
      <AuthLink
        label="Use demo credentials"
        disabled={pending}
        onPress={() => reset(demoCredentials)}
      />
      <AuthLink
        label="Create a demo account"
        disabled={pending}
        onPress={() => navigation.navigate('Register')}
      />
    </AuthForm>
  );
}
