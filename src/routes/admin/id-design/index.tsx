import { createFileRoute } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodV4Resolver } from '@/lib/zodV4Resolver';
import { getIdDesignConfigFn, updateIdDesignConfigFn } from '@/server/system';
import { requireSystemAdmin } from '@/server/auth-context';
import { IdCardPreview } from '@/components/id-card-preview';
import type { IdDesignConfig } from '@/lib/pdf-types';

const idDesignConfigSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Primary color must be a valid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Secondary color must be a valid hex color'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Background color must be a valid hex color'),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Text color must be a valid hex color'),
  fontFamily: z.string().min(1, 'Font family is required'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  headerText: z.string().optional(),
  layoutTemplate: z.enum(['standard', 'compact', 'detailed']),
  backBackgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Back background color must be a valid hex color').optional(),
  backTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Back text color must be a valid hex color').optional(),
  backHeaderText: z.string().optional(),
  backContentText: z.string().optional(),
  nationality: z.string().optional(),
  expiryDurationYears: z.number().int().min(1, 'Expiry duration must be at least 1 year').max(20, 'Expiry duration must be at most 20 years').default(3),
});

type IdDesignConfigFormValues = z.infer<typeof idDesignConfigSchema>;

export const Route = createFileRoute('/admin/id-design/')({
  beforeLoad: async () => {
    await requireSystemAdmin();
  },
  loader: async () => {
    const result = await getIdDesignConfigFn();
    if (!result.success) {
      throw new Error('Failed to load design configuration');
    }
    return { config: result.config };
  },
  component: IdDesignConfigPage,
});

function IdDesignConfigPage() {
  const { config: initialConfig } = Route.useLoaderData();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const updateConfigFn = useServerFn(updateIdDesignConfigFn);

  const form = useForm<IdDesignConfigFormValues>({
    resolver: zodV4Resolver(idDesignConfigSchema),
    defaultValues: {
      primaryColor: initialConfig.primaryColor || '#1e40af',
      secondaryColor: initialConfig.secondaryColor || '#3b82f6',
      backgroundColor: initialConfig.backgroundColor || '#ffffff',
      textColor: initialConfig.textColor || '#1f2937',
      fontFamily: initialConfig.fontFamily || 'Helvetica',
      logoUrl: initialConfig.logoUrl || '',
      headerText: initialConfig.headerText || 'Residential ID Card',
      layoutTemplate: initialConfig.layoutTemplate || 'standard',
      backBackgroundColor: (initialConfig as any).backBackgroundColor || '#f3f4f6',
      backTextColor: (initialConfig as any).backTextColor || '#1f2937',
      backHeaderText: (initialConfig as any).backHeaderText || 'Verification Information',
      backContentText: (initialConfig as any).backContentText || 'This is an official Digital ID card issued by the Kabale administration.',
      nationality: (initialConfig as any).nationality || 'Ethiopian',
      expiryDurationYears: (initialConfig as any).expiryDurationYears || 3,
    },
  });

  const formValues = form.watch();
  
  // Create config object for live preview
  const livePreviewConfig: IdDesignConfig = {
    primaryColor: formValues.primaryColor || initialConfig.primaryColor || '#1e40af',
    secondaryColor: formValues.secondaryColor || initialConfig.secondaryColor || '#3b82f6',
    backgroundColor: formValues.backgroundColor || initialConfig.backgroundColor || '#ffffff',
    textColor: formValues.textColor || initialConfig.textColor || '#1f2937',
    fontFamily: formValues.fontFamily || initialConfig.fontFamily || 'Helvetica',
    logoUrl: formValues.logoUrl || initialConfig.logoUrl,
    headerText: formValues.headerText || initialConfig.headerText,
    layoutTemplate: formValues.layoutTemplate || initialConfig.layoutTemplate || 'standard',
    backBackgroundColor: formValues.backBackgroundColor || (initialConfig as any).backBackgroundColor || '#f3f4f6',
    backTextColor: formValues.backTextColor || (initialConfig as any).backTextColor || '#1f2937',
    backHeaderText: formValues.backHeaderText || (initialConfig as any).backHeaderText,
    backContentText: formValues.backContentText || (initialConfig as any).backContentText,
    nationality: formValues.nationality || (initialConfig as any).nationality || 'Ethiopian',
    expiryDurationYears: formValues.expiryDurationYears || (initialConfig as any).expiryDurationYears || 3,
  };

  const onSubmit = async (data: IdDesignConfigFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const result = await updateConfigFn({ data });

      if (result.success) {
        toast.success('Design configuration updated successfully');
      } else {
        setError('Failed to update design configuration');
      }
    } catch (err) {
      setError('An error occurred while updating the design configuration. Please try again.');
      console.error('Update design config error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">ID Card Design Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Customize the appearance of digital ID cards
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:order-2">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              Preview how the ID card will look with current settings. Changes update in real-time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-2 border-dashed border-primary/20 p-4 bg-muted/20">
              <IdCardPreview config={livePreviewConfig} />
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground">
                💡 Tip: Adjust colors and settings to see changes instantly in the preview above.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:order-1">
          <CardHeader>
            <CardTitle>Design Settings</CardTitle>
            <CardDescription>
              Configure colors, fonts, and layout for ID cards
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
                  name="headerText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Header Text (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Residential ID Card"
                          value={field.value || ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-16 h-10"
                            />
                            <Input
                              type="text"
                              placeholder="#1e40af"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-16 h-10"
                            />
                            <Input
                              type="text"
                              placeholder="#3b82f6"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="backgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-16 h-10"
                            />
                            <Input
                              type="text"
                              placeholder="#ffffff"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="textColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-16 h-10"
                            />
                            <Input
                              type="text"
                              placeholder="#1f2937"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="fontFamily"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Font Family</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select font family" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Times-Roman">Times Roman</SelectItem>
                          <SelectItem value="Courier">Courier</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="layoutTemplate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Layout Template</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select layout" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com/logo.png"
                          value={field.value || ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Back Side Configuration</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="backBackgroundColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Back Background Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={field.value || '#f3f4f6'}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="w-16 h-10"
                              />
                              <Input
                                type="text"
                                placeholder="#f3f4f6"
                                value={field.value || ''}
                                onChange={field.onChange}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="backTextColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Back Text Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={field.value || '#1f2937'}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="w-16 h-10"
                              />
                              <Input
                                type="text"
                                placeholder="#1f2937"
                                value={field.value || ''}
                                onChange={field.onChange}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="backHeaderText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Back Header Text (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Verification Information"
                            value={field.value || ''}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="backContentText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Back Content Text (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="This is an official Digital ID card issued by the Kabale administration."
                            value={field.value || ''}
                            onChange={field.onChange}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality (Default)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ethiopian"
                            value={field.value || ''}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">ID Expiry Configuration</h3>
                  
                  <FormField
                    control={form.control}
                    name="expiryDurationYears"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Duration (Years)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            placeholder="3"
                            value={field.value ?? 3}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 3)}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          ID cards will expire after this many years from the date of issue (1-20 years)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Saving...' : 'Save Configuration'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
