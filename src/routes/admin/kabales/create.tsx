import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { ArrowLeft, Plus, Building2 } from 'lucide-react';
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
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/admin/kabales">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Create Kabale</h1>
            <p className="text-muted-foreground mt-1.5">
              Add a new administrative unit
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
            Enter the details for the new Kabale
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

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Kabale Name" className="h-11" {...field} />
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
                    <FormLabel className="text-base">Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" className="h-11" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-2">
                <Button type="submit" disabled={isLoading} className="group">
                  {isLoading ? 'Creating...' : 'Create Kabale'}
                  <Plus className="h-4 w-4 ml-2 transition-transform group-hover:rotate-90" />
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
