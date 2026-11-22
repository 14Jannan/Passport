import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { AppButton } from '../../../components/AppButton';
import type { AuthStackParams } from '../../../navigation/types';
import { AuthField } from '../components/AuthField';
import { AuthForm, AuthLink, AuthMessage } from '../components/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { useAuthSubmission } from '../hooks/useAuthSubmission';
import {
  registrationSchema,
  type RegisterValues,
} from '../validation/authSchemas';

export function RegisterScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParams, 'Register'>) {
  const { register } = useAuth();
  const { pending, error, run } = useAuthSubmission('register');
  const { control, handleSubmit } = useForm<RegisterValues>({
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(registrationSchema),
  });

  return (
    <AuthForm
      title="Create a demo account"
      description="DummyJSON simulates registration. Use sample details and a password you use only for this demo."
    >
      <AuthField
        control={control}
        name="fullName"
        label="Full name"
        editable={!pending}
        autoComplete="name"
        autoCapitalize="words"
      />
      <AuthField
        control={control}
        name="email"
        label="Email"
        editable={!pending}
        autoComplete="email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <AuthField
        control={control}
        name="username"
        label="Username"
        editable={!pending}
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <AuthField
        control={control}
        name="password"
        label="Password"
        secret
        editable={!pending}
        autoComplete="new-password"
      />
      <AuthField
        control={control}
        name="confirmPassword"
        label="Confirm password"
        secret
        editable={!pending}
        autoComplete="new-password"
      />
      {error ? <AuthMessage error message={error} /> : null}
      <AppButton
        label="Create account"
        loading={pending}
        onPress={handleSubmit(values =>
          run(async () => {
            await register(values);
            if (navigation.isFocused()) {
              navigation.popTo('SignIn', { registered: true });
            }
          }),
        )}
      />
      <AuthLink
        label="Back to sign in"
        disabled={pending}
        onPress={() => navigation.goBack()}
      />
    </AuthForm>
  );
}
