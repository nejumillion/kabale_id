import { redirect } from '@tanstack/react-router';
import { createMiddleware } from '@tanstack/react-start';
import { getCurrentUserFn } from './auth';

/**
 * Get the current authenticated user
 * This can be used in route loaders or server components
 */
export async function getCurrentUser() {
  try {
    const result = await getCurrentUserFn();
    return result.success ? result.user : null;
  } catch {
    return null;
  }
}

/**
 * Require authentication - throws if user is not authenticated
 * Use this in route loaders for protected routes
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw redirect({ to: '/login' });
  }

  return user;
}


export async function requireUnauth() {
  const user = await getCurrentUser();

  if (user) {
    throw redirect({ to: '/' });
  }
}


export const requireAuthMiddleware = createMiddleware().server(async ({ next }) => {
  await requireAuth();
  return next();
});

/**
 * Require a specific role
 * Use this in route loaders for role-based access control
 */
export async function requireRole(role: 'SYSTEM_ADMIN' | 'KABALE_ADMIN' | 'CITIZEN') {
  const user = await requireAuth();

  if (user.role !== role) {
    throw redirect({ to: '/forbidden'});
  }

  return user;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: 'SYSTEM_ADMIN' | 'KABALE_ADMIN' | 'CITIZEN') {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * Require SYSTEM_ADMIN role
 * Throws 403 if user is not a system admin
 */
export async function requireSystemAdmin() {
  const user = await requireAuth();

  if (user.role !== 'SYSTEM_ADMIN') {
    throw redirect({ to: '/forbidden'});
  }

  return user;
}

export const requireSystemAdminMiddleware = createMiddleware().server(async ({ next }) => {
  await requireSystemAdmin();
  return next();
});

/**
 * Require KABALE_ADMIN role
 * Throws 403 if user is not a Kabale admin
 * Returns user with kabaleAdminProfile loaded
 */
export async function requireKabaleAdmin() {
  const user = await requireAuth();

  if (user.role !== 'KABALE_ADMIN') {
    throw redirect({ to: '/forbidden'});
  }

  if (!user?.kabaleAdminProfile) {
    throw redirect({ to: '/forbidden'});
  }

  return user;
}

export const requireKabaleAdminMiddleware = createMiddleware().server(async ({ next }) => {
  await requireKabaleAdmin();
  return next();
});

/**
 * Require CITIZEN role
 * Throws 403 if user is not a citizen
 */
export async function requireCitizen() {
  const user = await requireAuth();
  
  if (user.role !== 'CITIZEN') {
    throw redirect({ to: '/forbidden'});
  }

  return user;
}

export const requireCitizenMiddleware = createMiddleware().server(async ({ next }) => {
  await requireCitizen();
  return next();
});

/**
 * Require CITIZEN role with a valid citizen profile
 * Redirects to /register-profile if profile is missing
 * Returns user with citizenProfile loaded
 */
export async function requireCitizenProfile() {
  const user = await requireCitizen();
  
  if (!user.citizenProfile) {
    throw redirect({ 
      to: '/register-profile',
      search: { userId: user.id }
    });
  }

  return user;
}

/**
 * Require admin role (either SYSTEM_ADMIN or KABALE_ADMIN)
 * Throws 403 if user is not an admin
 */
export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== 'SYSTEM_ADMIN' && user.role !== 'KABALE_ADMIN') {
    throw redirect({ to: '/forbidden'});
  }

  return user;
}

export const requireAdminMiddleware = createMiddleware().server(async ({ next }) => {
  await requireAdmin();
  return next();
});
