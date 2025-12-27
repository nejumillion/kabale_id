import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { ArrowLeft, Edit, Building2, CheckCircle2 } from 'lucide-react';
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

export const Route = createFileRoute('/admin/kabales/$kabaleId/edit')({
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
      address: kabale.address || '',
    },
  });

  const onSubmit = async (data: UpdateKabaleFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const updateData: UpdateKabaleFormValues & { kabaleId: string } = {
        kabaleId: kabale.id,
        ...(data.name && { name: data.name }),
        ...(data.address !== undefined && { address: data.address }),
      };

      const result = await updateKabaleFunction({ data: updateData });

      if (result.success) {
        navigate({ to: '/admin/kabales/$kabaleId', params: { kabaleId: kabale.id } });
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
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/admin/kabales/$kabaleId" params={{ kabaleId: kabale.id }}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Edit className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Edit Kabale</h1>
            <p className="text-muted-foreground mt-1.5">
              Update Kabale information
            </p>
          </div>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Kabale Information
          </CardTitle>
          <CardDescription className="text-base">
            Update the Kabale details below
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Kabale Name" className="h-11" {...field} value={field.value || ''} />
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
                      <FormLabel className="text-base">Code</FormLabel>
                      <FormControl>
                        <Input placeholder="KAB001" className="h-11" {...field} value={field.value || ''} />
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
                    <FormLabel className="text-base">Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" className="h-11" {...field} value={field.value || ''} />
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
                      <FormLabel className="text-base">Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+1234567890" className="h-11" {...field} value={field.value || ''} />
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
                      <FormLabel className="text-base">Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="kabale@example.com" className="h-11" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <Button type="submit" disabled={isLoading} className="group">
                  {isLoading ? 'Updating...' : 'Update Kabale'}
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </Button>
                <Link to="/admin/kabales/$kabaleId" params={{ kabaleId: kabale.id }}>
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
