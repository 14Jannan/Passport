import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { useAppDispatch } from '../../app/store';
import { AppButton } from '../../components/AppButton';
import { AppTextInput } from '../../components/AppTextInput';
import { EmptyState } from '../../components/EmptyState';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { AuthStackParams } from '../../navigation/types';
import { enterAsGuest } from './session';

export function WelcomeScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParams, 'Welcome'>) {
  const dispatch = useAppDispatch();
  return (
    <ScreenLayout>
      <EmptyState
        title="Passport"
        description="Discover new places and keep a personal travel journal."
      />
      <AppButton
        label="Continue as guest"
        onPress={() => dispatch(enterAsGuest())}
      />
      <AppButton
        label="Sign in"
        onPress={() => navigation.navigate('SignIn')}
      />
      <AppButton
        label="Create account"
        onPress={() => navigation.navigate('Register')}
      />
    </ScreenLayout>
  );
}

function EmailPreview({ title }: { title: string }) {
  const { control, trigger } = useForm({
    defaultValues: { email: '' },
    mode: 'onBlur',
  });
  return (
    <>
      <EmptyState
        title={title}
        description="Account services are planned for a future release."
      />
      <Controller
        control={control}
        name="email"
        rules={{
          required: 'Enter your email address.',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Enter a valid email address.',
          },
        }}
        render={({
          field: { onBlur, onChange, value },
          fieldState: { error },
        }) => (
          <AppTextInput
            label="Email"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            onSubmitEditing={() => trigger('email')}
            error={error?.message}
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
          />
        )}
      />
    </>
  );
}

export function SignInScreen({
  navigation,
}: NativeStackScreenProps<AuthStackParams, 'SignIn'>) {
  return (
    <ScreenLayout>
      <EmailPreview title="Sign in" />
      <AppButton
        label="Forgot password?"
        onPress={() => navigation.navigate('ForgotPassword')}
      />
    </ScreenLayout>
  );
}

export function RegisterScreen() {
  return (
    <ScreenLayout>
      <EmailPreview title="Create account" />
    </ScreenLayout>
  );
}

export function ForgotPasswordScreen() {
  return (
    <ScreenLayout>
      <EmailPreview title="Reset password" />
    </ScreenLayout>
  );
}
