import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { ArrowLeftIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { zodV4Resolver } from '@/lib/zodV4Resolver';
import { getKabaleByIdFn, updateKabaleFn } from '@/server/kabales';

const updateKabaleSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  code: z.string().min(1, 'Code is required').optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

type UpdateKabaleFormValues = z.infer<typeof updateKabaleSchema>;

export const Route = createFileRoute('/admin/system/kabales/$kabaleId/edit')({
  loader: async ({ params }) => {
    const result = await getKabaleByIdFn({ data: { kabaleId: params.kabaleId } });

    if (!result.success) {
      throw new Response('Kabale not found', { status: 404 });
    }

    return { kabale: result.kabale };
  },
  component: UpdateKabalePage,
});

function UpdateKabalePage() {
  const navigate = useNavigate();
  const { kabale } = Route.useLoaderData();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const updateKabaleFunction = useServerFn(updateKabaleFn);

  const form = useForm<UpdateKabaleFormValues>({
    resolver: zodV4Resolver(updateKabaleSchema),
    defaultValues: {
      name: kabale.name,
      code: kabale.code,
      address: kabale.address || '',
      phone: kabale.phone || '',
      email: kabale.email || '',
    },
  });

  const onSubmit = async (data: UpdateKabaleFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const updateData: UpdateKabaleFormValues & { kabaleId: string } = {
        kabaleId: kabale.id,
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
      };

      const result = await updateKabaleFunction({ data: updateData });

      if (result.success) {
        navigate({ to: '/admin/system/kabales/$kabaleId', params: { kabaleId: kabale.id } });
      } else {
        setError(result.error || 'Failed to update Kabale');
      }
    } catch (err) {
      setError('An error occurred while updating the Kabale. Please try again.');
      console.error('Update Kabale error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/system/kabales/$kabaleId" params={{ kabaleId: kabale.id }}>
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Kabale</h1>
          <p className="text-muted-foreground mt-2">
            Update Kabale information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kabale Information</CardTitle>
          <CardDescription>
            Update the Kabale details below
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Kabale Name" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input placeholder="KAB001" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                      <div className="text-sm text-muted-foreground">
                        Unique identifier for this Kabale
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
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

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="kabale@example.com" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Kabale'}
                </Button>
                <Link to="/admin/system/kabales/$kabaleId" params={{ kabaleId: kabale.id }}>
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
