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
import { createKabaleFn } from '@/server/kabales';

const createKabaleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
});

type CreateKabaleFormValues = z.infer<typeof createKabaleSchema>;

export const Route = createFileRoute('/admin/kabales/create')({
  component: CreateKabalePage,
});

function CreateKabalePage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const createKabaleFunction = useServerFn(createKabaleFn);

  const form = useForm<CreateKabaleFormValues>({
    resolver: zodV4Resolver(createKabaleSchema),
    defaultValues: {
      name: '',
      address: '',
    },
  });

  const onSubmit = async (data: CreateKabaleFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await createKabaleFunction({ data });

      if (result.success && result.kabale) {
        navigate({ to: '/admin/kabales/$kabaleId', params: { kabaleId: result.kabale.id } });
      } else {
        setError('Failed to create Kabale');
      }
    } catch (err) {
      setError('An error occurred while creating the Kabale. Please try again.');
      console.error('Create Kabale error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/kabales">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Kabale</h1>
          <p className="text-muted-foreground mt-2">
            Add a new administrative unit
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kabale Information</CardTitle>
          <CardDescription>
            Enter the details for the new Kabale
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

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Kabale Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Kabale'}
                </Button>
                <Link to="/admin/kabales">
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
