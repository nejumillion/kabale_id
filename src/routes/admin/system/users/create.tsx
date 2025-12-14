import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { ArrowLeftIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodV4Resolver } from '@/lib/zodV4Resolver';
import { getAvailableKabalesFn } from '@/server/kabales';
import { createUserFn } from '@/server/system';

const createUserSchema = z
  .object({
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['SYSTEM_ADMIN', 'KABALE_ADMIN', 'CITIZEN']),
    kabaleId: z.string().optional(),
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
  .refine(
    (data) => {
      if (data.role === 'KABALE_ADMIN' && !data.kabaleId) {
        return false;
      }
      return true;
    },
    {
      message: 'Kabale is required for Kabale Admin role',
      path: ['kabaleId'],
    }
  );

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const Route = createFileRoute('/admin/system/users/create')({
  loader: async () => {
    const kabalesResult = await getAvailableKabalesFn();
    return { kabales: kabalesResult.kabales };
  },
  component: CreateUserPage,
});

function CreateUserPage() {
  const navigate = useNavigate();
  const { kabales } = Route.useLoaderData();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const createUserFunction = useServerFn(createUserFn);

  const form = useForm<CreateUserFormValues>({
    resolver: zodV4Resolver(createUserSchema),
    defaultValues: {
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      password: '',
      role: 'CITIZEN',
      kabaleId: '',
    },
  });

  const selectedRole = form.watch('role');

  const onSubmit = async (data: CreateUserFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await createUserFunction({ data });

      if (result.success && result.user) {
        navigate({ to: '/admin/system/users/$userId', params: { userId: result.user.id } });
      } else {
        setError(result.error || 'Failed to create user');
      }
    } catch (err) {
      setError('An error occurred while creating the user. Please try again.');
      console.error('Create user error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/system/users">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create User</h1>
          <p className="text-muted-foreground mt-2">
            Add a new user to the system
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Enter the details for the new user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+1234567890" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="text-sm text-muted-foreground">
                <p>At least one of email or phone is required</p>
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Minimum 8 characters" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value !== 'KABALE_ADMIN') {
                          form.setValue('kabaleId', '');
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SYSTEM_ADMIN">
                          <div className="flex items-center gap-2">
                            System Admin
                            <Badge variant="destructive" className="ml-2">System</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="KABALE_ADMIN">
                          <div className="flex items-center gap-2">
                            Kabale Admin
                            <Badge variant="default" className="ml-2">Kabale</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="CITIZEN">
                          <div className="flex items-center gap-2">
                            Citizen
                            <Badge variant="secondary" className="ml-2">Citizen</Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedRole === 'KABALE_ADMIN' && (
                <FormField
                  control={form.control}
                  name="kabaleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kabale</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a Kabale" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {kabales.map((kabale) => (
                            <SelectItem key={kabale.id} value={kabale.id}>
                              {kabale.name} ({kabale.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create User'}
                </Button>
                <Link to="/admin/system/users">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
