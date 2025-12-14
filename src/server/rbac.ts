import { getCurrentUser, requireAuth, requireKabaleAdmin, requireSystemAdmin } from './auth-context';

/**
 * Get the Kabale ID for the current Kabale Admin
 * Returns null if user is not a Kabale Admin or profile is missing
 */
export async function getKabaleAdminKabale(): Promise<string | null> {
  const user = await getCurrentUser();

  if (!user || user.role !== 'KABALE_ADMIN' || !user.kabaleAdminProfile) {
    return null;
  }

  return user.kabaleAdminProfile.kabaleId;
}

/**
 * Require that the current user can access the specified Kabale
 * - SYSTEM_ADMIN can access any Kabale
 * - KABALE_ADMIN can only access their assigned Kabale
 * - CITIZEN cannot access any Kabale (throws 403)
 * Throws 403 if access is denied
 */
export async function requireKabaleAccess(kabaleId: string) {
  const user = await requireAuth();

  // System admins have full access
  if (user.role === 'SYSTEM_ADMIN') {
    return user;
  }

  // Kabale admins can only access their own Kabale
  if (user.role === 'KABALE_ADMIN') {
    if (!user.kabaleAdminProfile) {
      throw new Response('Forbidden: Kabale admin profile not found', {
        status: 403,
      });
    }

    if (user.kabaleAdminProfile.kabaleId !== kabaleId) {
      throw new Response('Forbidden: Cannot access this Kabale', {
        status: 403,
      });
    }

    return user;
  }

  // Citizens cannot access Kabale data
  throw new Response('Forbidden: Admin access required', { status: 403 });
}

/**
 * Check if the current user can access the specified Kabale
 * Returns true if access is allowed, false otherwise
 */
export async function canAccessKabale(kabaleId: string): Promise<boolean> {
  try {
    await requireKabaleAccess(kabaleId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the Kabale scope filter for database queries
 * - SYSTEM_ADMIN: returns undefined (no filter, full access)
 * - KABALE_ADMIN: returns their Kabale ID
 * - CITIZEN: throws 403 (should not be used for admin queries)
 */
export async function getKabaleScopeFilter(): Promise<string | undefined> {
  const user = await requireAuth();

  if (user.role === 'SYSTEM_ADMIN') {
    return undefined; // No filter, full access
  }

  if (user.role === 'KABALE_ADMIN') {
    if (!user.kabaleAdminProfile) {
      throw new Response('Forbidden: Kabale admin profile not found', {
        status: 403,
      });
    }
    return user.kabaleAdminProfile.kabaleId;
  }

  throw new Response('Forbidden: Admin access required', { status: 403 });
}

/**
 * Filter a Kabale ID by scope
 * Ensures Kabale Admins can only access their own Kabale
 * Returns the filtered Kabale ID or throws 403
 */
export async function filterKabaleByScope(kabaleId: string): Promise<string> {
  await requireKabaleAccess(kabaleId);
  return kabaleId;
}

/**
 * Check if current user is a system admin
 */
export async function isSystemAdmin(): Promise<boolean> {
  try {
    await requireSystemAdmin();
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if current user is a Kabale admin
 */
export async function isKabaleAdmin(): Promise<boolean> {
  try {
    await requireKabaleAdmin();
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if current user is a citizen
 */
export async function isCitizen(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'CITIZEN';
}
