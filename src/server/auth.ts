import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { prisma } from '@/db';
import { registrationSchema } from '@/lib/validation';
import { findUserByIdentifier, hashPassword, verifyPassword } from './auth-utils';
import { createSession, useAppSession } from './session';
/**
 * Login server function
 * Authenticates user via email or phone and creates a session
 */
export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      identifier: z.string().min(1, 'Email or phone is required'),
      password: z.string().min(1, 'Password is required'),
    })
  )
  .handler(async ({ data }) => {
    // Find user by email or phone
    const user = await findUserByIdentifier(data.identifier);

    if (!user) {
      return {
        success: false,
        error: 'Invalid email/phone or password',
      };
    }

    // Verify password
    const isValid = await verifyPassword(user.passwordHash, data.password);

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid email/phone or password',
      };
    }

    // Create session
    const token = await createSession(user.id);
    const session = await useAppSession();

    // Cookie will be set by the framework
    // Return token in response for client-side cookie handling if needed
    await session.update({
      token,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        role: user.role,
        kabaleAdminProfile: user.kabaleAdminProfile,
        citizenProfile: user.citizenProfile,
      },
    });

    throw redirect({ to: '/' });
  });

// Logout server function
export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useAppSession();
  await session.clear();
  throw redirect({ to: '/' });
});

/**
 * Get current user server function
 * Returns the authenticated user from the session
 */
export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAppSession();
  const { token, user } = session.data;

  if (!(token && user)) {
    throw redirect({ to: '/login' });
  }

  const userData = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      kabaleAdminProfile: true,
      citizenProfile: true,
    },
  });

  if (!userData) {
    throw redirect({ to: '/login' });
  }

  return {
    success: true,
    user: {
      id: userData.id,
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      kabaleAdminProfile: userData.kabaleAdminProfile,
      citizenProfile: userData.citizenProfile,
    },
  };
});

/**
 * Register a new citizen user
 * Creates a User account with CITIZEN role
 */
export const registerFn = createServerFn({ method: 'POST' })
  .inputValidator(registrationSchema)
  .handler(async ({ data }) => {
    // Normalize email and phone
    const email = data.email?.trim() || null;
    const phone = data.phone?.trim() || null;

    // // Check if email is already taken
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        return {
          success: false,
          error: 'Email is already registered',
        };
      }
    }

    // // Check if phone is already taken
    if (phone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone },
      });
      if (existingPhone) {
        return {
          success: false,
          error: 'Phone number is already registered',
        };
      }
    }

    // // Hash password
    const passwordHash = await hashPassword(data.password);

    // // Create user account
      //   // Build user data - at least one of email or phone must be provided
      //   // Note: Prisma schema requires email, but we allow phone-only registration
      //   // We'll use a type assertion to handle this
      const userData = email
        ? {
            firstName: data.firstName,
            lastName: data.lastName,
            email,
            ...(phone && { phone }),
            passwordHash,
            role: 'CITIZEN' as const,
          }
        : {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: phone || '',
            passwordHash,
            role: 'CITIZEN' as const,
            email: '', // Temporary email, will be updated if needed
          };

      const user = await prisma.user.create({
        data: userData,
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          firstName: true,
          lastName: true,
          kabaleAdminProfile: true,
          citizenProfile: true,
        },
      });

      const token = await createSession(user.id);
      const session = await useAppSession();
      await session.update({
        token,
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: user.phone,
          role: user.role,
          kabaleAdminProfile: user.kabaleAdminProfile,
          citizenProfile: user.citizenProfile,
        },
      });
      throw redirect({ to: '/' });
  });

/**
 * Update user profile
 * Allows users to update their firstName, lastName, email, and phone
 */
export const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      email: z.string().email('Invalid email address'),
      phone: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const { user } = session.data;

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Check if email is already taken by another user
    if (data.email !== user.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingEmail && existingEmail.id !== user.id) {
        return {
          success: false,
          error: 'Email is already in use',
        };
      }
    }

    // Check if phone is already taken by another user
    if (data.phone && data.phone !== user.phone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone: data.phone },
      });
      if (existingPhone && existingPhone.id !== user.id) {
        return {
          success: false,
          error: 'Phone number is already in use',
        };
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
      },
      include: {
        kabaleAdminProfile: true,
        citizenProfile: true,
      },
    });

    // Update session with new user data
    await session.update({
      token: session.data.token,
      user: {
        id: updatedUser.id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        kabaleAdminProfile: updatedUser.kabaleAdminProfile,
        citizenProfile: updatedUser.citizenProfile,
      },
    });

    return {
      success: true,
      user: {
        id: updatedUser.id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
    };
  });

/**
 * Update user password
 * Requires current password for verification
 */
export const updatePasswordFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
  )
  .handler(async ({ data }) => {
    const session = await useAppSession();
    const { user } = session.data;

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Verify passwords match
    if (data.newPassword !== data.confirmPassword) {
      return {
        success: false,
        error: 'New passwords do not match',
      };
    }

    // Get user with password hash
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Verify current password
    const isValid = await verifyPassword(dbUser.passwordHash, data.currentPassword);

    if (!isValid) {
      return {
        success: false,
        error: 'Current password is incorrect',
      };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(data.newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return {
      success: true,
      message: 'Password updated successfully',
    };
  });

