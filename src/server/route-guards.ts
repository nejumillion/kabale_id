import { requireAdmin, requireCitizen, requireKabaleAdmin, requireSystemAdmin } from './auth-context';
import { getKabaleScopeFilter, requireKabaleAccess } from './rbac';

/**
 * Type for route loader functions
 */
export type RouteLoader<T = unknown> = () => Promise<T>;

/**
 * Wrap a route loader to require system admin access
 */
export function withSystemAdmin<T>(loader: RouteLoader<T>): RouteLoader<T> {
  return async () => {
    await requireSystemAdmin();
    return await loader();
  };
}

/**
 * Wrap a route loader to require Kabale admin access
 */
export function withKabaleAdmin<T>(loader: RouteLoader<T>): RouteLoader<T> {
  return async () => {
    await requireKabaleAdmin();
    return await loader();
  };
}

/**
 * Wrap a route loader to require citizen access
 */
export function withCitizen<T>(loader: RouteLoader<T>): RouteLoader<T> {
  return async () => {
    await requireCitizen();
    return await loader();
  };
}

/**
 * Wrap a route loader to require admin access (system or Kabale admin)
 */
export function withAdmin<T>(loader: RouteLoader<T>): RouteLoader<T> {
  return async () => {
    await requireAdmin();
    return await loader();
  };
}

/**
 * Wrap a route loader to require access to a specific Kabale
 * The loader receives the validated kabaleId as a parameter
 */
export function withKabaleAccess<T>(
  kabaleId: string | (() => Promise<string> | string),
  loader: (kabaleId: string) => Promise<T>
): RouteLoader<T> {
  return async () => {
    const resolvedKabaleId = typeof kabaleId === 'function' ? await kabaleId() : kabaleId;
    await requireKabaleAccess(resolvedKabaleId);
    return await loader(resolvedKabaleId);
  };
}

/**
 * Wrap a route loader to ensure it only accesses data within Kabale scope
 * For SYSTEM_ADMIN: no filtering
 * For KABALE_ADMIN: filters by their Kabale
 */
export function withKabaleScope<T>(loader: (kabaleId: string | undefined) => Promise<T>): RouteLoader<T> {
  return async () => {
    const kabaleId = await getKabaleScopeFilter();
    return await loader(kabaleId);
  };
}

/**
 * Prevent citizens from accessing admin routes
 * Throws 403 if user is a citizen trying to access admin routes
 */
export async function preventCitizenAccess() {
  const user = await requireAdmin();
  return user;
}
