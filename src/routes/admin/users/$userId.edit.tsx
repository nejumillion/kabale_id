import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { ArrowLeft, Edit, Building2, MapPin, CheckCircle2 } from 'lucide-react';
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
import { getUserByIdFn, updateUserFn } from '@/server/system';

const updateUserSchema = z
  .object({
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    role: z.enum(['SYSTEM_ADMIN', 'KABALE_ADMIN', 'CITIZEN']).optional(),
    kabaleId: z.string().optional(),
  })
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

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export const Route = createFileRoute('/admin/users/$userId/edit')({
  loader: async ({ params }) => {
    const [userResult, kabalesResult] = await Promise.all([
      getUserByIdFn({ data: { userId: params.userId } }),
      getAvailableKabalesFn(),
    ]);

    if (!userResult.success) {
      throw new Response('User not found', { status: 404 });
    }

    return {
      user: userResult.user,
      kabales: kabalesResult.kabales,
    };
  },
  component: UpdateUserPage,
});

function UpdateUserPage() {
  const navigate = useNavigate();
  const { user, kabales } = Route.useLoaderData();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const updateUserFunction = useServerFn(updateUserFn);

  const form = useForm<UpdateUserFormValues>({
    resolver: zodV4Resolver(updateUserSchema),
    defaultValues: {
      email: user.email || '',
      phone: user.phone || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      password: '',
      role: user.role,
      kabaleId: user.kabaleAdminProfile?.kabaleId || '',
    },
  });

  const selectedRole = form.watch('role');

  const onSubmit = async (data: UpdateUserFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      // Only include fields that have changed or are required
      const updateData: UpdateUserFormValues & { userId: string } = {
        userId: user.id,
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.password && { password: data.password }),
        ...(data.role && { role: data.role }),
        ...(data.role === 'KABALE_ADMIN' && data.kabaleId && { kabaleId: data.kabaleId }),
      };

      const result = await updateUserFunction({ data: updateData });

      if (result.success) {
        navigate({ to: '/admin/users/$userId', params: { userId: user.id } });
      } else {
        setError(result.error || 'Failed to update user');
      }
    } catch (err) {
      setError('An error occurred while updating the user. Please try again.');
      console.error('Update user error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/admin/users/$userId" params={{ userId: user.id }}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Edit className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Edit User</h1>
            <p className="text-muted-foreground mt-1.5">
              Update user information
            </p>
          </div>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Edit className="h-5 w-5 text-primary" />
            User Information
          </CardTitle>
          <CardDescription className="text-base">
            Update the user details below. Leave password empty to keep current password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-2">
                  <AlertDescription className="font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" className="h-11" {...field} value={field.value || ''} />
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
                      <FormLabel className="text-base">Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" className="h-11" {...field} value={field.value || ''} />
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
                      <FormLabel className="text-base">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" className="h-11" {...field} value={field.value || ''} />
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
                      <FormLabel className="text-base">Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+1234567890" className="h-11" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <p>At least one of email or phone is required</p>
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">New Password (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Leave empty to keep current password"
                        className="h-11"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-sm text-muted-foreground">
                      Only enter a password if you want to change it
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Role</FormLabel>
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
                        <SelectTrigger className="h-11">
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
                      <FormLabel className="text-base">Kabale</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select a Kabale" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {kabales.map((kabale) => (
                            <SelectItem key={kabale.id} value={kabale.id}>
                              {kabale.name} ({kabale.address})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {kabales.find(k => k.id === field.value) && (
                        <Card className="mt-3 border-2 bg-muted/50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-primary" />
                              Selected Kabale
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            {kabales.find(k => k.id === field.value)?.address && (
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <span className="text-muted-foreground">{kabales.find(k => k.id === field.value)?.address}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </FormItem>
                  )}
                />
              )}

              <div className="flex gap-4 pt-2">
                <Button type="submit" disabled={isLoading} className="group">
                  {isLoading ? 'Updating...' : 'Update User'}
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </Button>
                <Link to="/admin/users/$userId" params={{ userId: user.id }}>
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
