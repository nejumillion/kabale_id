import { z } from 'zod';

/**
 * Registration schema
 * Requires either email or phone, and password confirmation
 */
export const registrationSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => {
      const hasEmail = data.email && data.email.trim() !== '';
      const hasPhone = data.phone && data.phone.trim() !== '';
      return hasEmail || hasPhone;
    },
    {
      message: 'Either email or phone is required',
      path: ['email'],
    }
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegistrationFormValues = z.infer<typeof registrationSchema>;

/**
 * Profile creation schema
 * Requires personal information and Kabale selection
 */
export const profileSchema = z.object({
  dateOfBirth: z.date('Date of birth is required'),
  gender: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  kabaleId: z.string().min(1, 'Please select a Kabale'),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

/**
 * ID Application schema
 * Requires Kabale selection
 */
export const idApplicationSchema = z.object({
  kabaleId: z.string().min(1, 'Please select a Kabale'),
});

export type IdApplicationFormValues = z.infer<typeof idApplicationSchema>;
