import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/custom-tabs';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { RegistrationFormValues, registrationSchema } from '@/lib/validation';
import { zodV4Resolver } from '@/lib/zodV4Resolver';
import { registerFn } from '@/server/auth';
import { requireUnauth } from '@/server/auth-context';

export const Route = createFileRoute('/register')({
  beforeLoad: async () => {
		await requireUnauth();
	},
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const registerMutation = useServerFn(registerFn);
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');

  const form = useForm<RegistrationFormValues>({
    resolver: zodV4Resolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await registerMutation({ data });
      if (!result.success) {
        setError(result.error || 'Registration failed');
      } 

    } catch (err: any) {
      setError(err?.message||'An error occurred during registration. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Enter your email or phone number and create a password to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs
              defaultValue="email"
              value={contactMethod}
              onValueChange={(value) => {
              	setContactMethod(value as "email" | "phone");
              	// Clear the other field when switching tabs
              	if (value === "email") {
              		form.setValue("phone", "");
              	} else {
              		form.setValue("email", "");
              	}
              }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>

              <Field>
                <FieldLabel>
                  First Name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...form.register('firstName')}
                  type="text"
                  placeholder="First Name"
                />
                {form.formState.errors.firstName && (
                  <FieldError>{form.formState.errors.firstName.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel>
                  Last Name <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...form.register('lastName')}
                  type="text"
                  placeholder="Last Name"
                />
                {form.formState.errors.lastName && (
                  <FieldError>{form.formState.errors.lastName.message}</FieldError>
                )}
              </Field>

              <TabsContent value="email" className="mt-0">
                <Field>
                  <FieldLabel>
                    Email <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...form.register('email')}
                    type="email"
                    placeholder="email@example.com"
                  />
                  {form.formState.errors.email && (
                    <FieldError>{form.formState.errors.email.message}</FieldError>
                  )}
                </Field>
              </TabsContent>

              <TabsContent value="phone" className="mt-0">
                <Field>
                  <FieldLabel>
                    Phone <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...form.register('phone')}
                    type="tel"
                    placeholder="+1234567890"
                  />
                  {form.formState.errors.phone && (
                    <FieldError>{form.formState.errors.phone.message}</FieldError>
                  )}
                </Field>
              </TabsContent>

              <Field>
                <FieldLabel>
                  Password <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...form.register('password')}
                  type="password"
                  placeholder="At least 8 characters"
                />
                {form.formState.errors.password && (
                  <FieldError>{form.formState.errors.password.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel>
                  Confirm Password <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  {...form.register('confirmPassword')}
                  type="password"
                  placeholder="Confirm your password"
                />
                {form.formState.errors.confirmPassword && (
                  <FieldError>{form.formState.errors.confirmPassword.message}</FieldError>
                )}
              </Field>
            </Tabs>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="text-muted-foreground text-center text-sm">
              Already have an account?{' '}
              <Button type="button" variant="link" className="h-auto p-0" onClick={() => navigate({ to: '/login' })}>
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
