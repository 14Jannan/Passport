import { z } from 'zod';

const username = z
  .string()
  .trim()
  .min(1, 'Enter a username.')
  .regex(
    /^[a-zA-Z0-9_.-]+$/,
    'Use letters, numbers, dots, hyphens or underscores.',
  );

export const loginSchema = z.object({
  username,
  password: z.string().min(1, 'Enter your password.'),
});

export const registrationSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Enter your full name.'),
    email: z.string().trim().pipe(z.email('Enter a valid email address.')),
    username,
    password: z.string().min(8, 'Use at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine(values => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match.',
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registrationSchema>;
