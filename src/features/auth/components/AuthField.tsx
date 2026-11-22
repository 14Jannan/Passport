import {
  Controller,
  type Control,
  type FieldPathByValue,
  type FieldValues,
} from 'react-hook-form';
import type { ComponentProps } from 'react';
import { AppTextInput } from '../../../components/AppTextInput';
import { PasswordInput } from './PasswordInput';

type Props<T extends FieldValues> = Omit<
  ComponentProps<typeof AppTextInput>,
  'value'
> & {
  control: Control<T>;
  name: FieldPathByValue<T, string>;
  secret?: boolean;
};

export function AuthField<T extends FieldValues>({
  control,
  name,
  secret,
  ...props
}: Props<T>) {
  const Input = secret ? PasswordInput : AppTextInput;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          {...props}
          inputRef={field.ref}
          value={String(field.value ?? '')}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
