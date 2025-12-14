import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { KeyIcon, UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUserFn, updatePasswordFn, updateProfileFn } from '@/server/auth';
import { zodV4Resolver } from '@/lib/zodV4Resolver';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const Route = createFileRoute('/profile')({
  loader: async () => {
    const result = await getCurrentUserFn();
    if (!result.success) {
      throw new Response('Failed to load user data', { status: 500 });
    }
    return { user: result.user };
  },
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useLoaderData();
  const router = useRouter();
  const updateProfile = useServerFn(updateProfileFn);
  const updatePassword = useServerFn(updatePasswordFn);

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Split the name back into firstName and lastName
  const nameParts = user.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const profileForm = useForm<ProfileFormData>({
    resolver: zodV4Resolver(profileSchema),
    defaultValues: {
      firstName,
      lastName,
      email: user.email,
      phone: user.phone || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodV4Resolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      const result = await updateProfile({ data });

      if (result.success) {
        toast.success('Profile updated successfully');
        router.invalidate();
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating your profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsUpdatingPassword(true);
    try {
      const result = await updatePassword({ data });

      if (result.success) {
        toast.success('Password updated successfully');
        passwordForm.reset();
      } else {
        toast.error(result.error || 'Failed to update password');
      }
    } catch (error) {
      toast.error('An error occurred while updating your password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return 'System Admin';
      case 'KABALE_ADMIN':
        return 'Kabale Admin';
      case 'CITIZEN':
        return 'Citizen';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return 'destructive' as const;
      case 'KABALE_ADMIN':
        return 'default' as const;
      case 'CITIZEN':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-6 my-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information and security settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your current role and account status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Role:</span>
            <Badge variant={getRoleBadgeVariant(user.role)}>
              {getRoleLabel(user.role)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="password">
            <KeyIcon className="mr-2 h-4 w-4" />
            Password
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>
                      First Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...profileForm.register('firstName')}
                      placeholder="Enter your first name"
                    />
                    {profileForm.formState.errors.firstName && (
                      <FieldError>{profileForm.formState.errors.firstName.message}</FieldError>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel>
                      Last Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...profileForm.register('lastName')}
                      placeholder="Enter your last name"
                    />
                    {profileForm.formState.errors.lastName && (
                      <FieldError>{profileForm.formState.errors.lastName.message}</FieldError>
                    )}
                  </Field>
                </div>

                <Field>
                  <FieldLabel>
                    Email <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...profileForm.register('email')}
                    type="email"
                    placeholder="Enter your email"
                  />
                  {profileForm.formState.errors.email && (
                    <FieldError>{profileForm.formState.errors.email.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Phone Number</FieldLabel>
                  <Input
                    {...profileForm.register('phone')}
                    type="tel"
                    placeholder="Enter your phone number"
                  />
                  {profileForm.formState.errors.phone && (
                    <FieldError>{profileForm.formState.errors.phone.message}</FieldError>
                  )}
                </Field>

                <Separator />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <Field>
                  <FieldLabel>
                    Current Password <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...passwordForm.register('currentPassword')}
                    type="password"
                    placeholder="Enter your current password"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <FieldError>{passwordForm.formState.errors.currentPassword.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel>
                    New Password <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...passwordForm.register('newPassword')}
                    type="password"
                    placeholder="Enter your new password"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <FieldError>{passwordForm.formState.errors.newPassword.message}</FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel>
                    Confirm New Password <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...passwordForm.register('confirmPassword')}
                    type="password"
                    placeholder="Confirm your new password"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <FieldError>{passwordForm.formState.errors.confirmPassword.message}</FieldError>
                  )}
                </Field>

                <Separator />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
