import { requireAdmin, requireCitizen, requireKabaleAdmin, requireSystemAdmin } from './auth-context';
import { getKabaleScopeFilter, requireKabaleAccess } from './rbac';

/**
 * Type for server function handlers
 */
export type ServerHandler<TData = unknown, TReturn = unknown> = (data: TData) => Promise<TReturn>;

/**
 * Wrap a server function handler to require system admin access
 */
export function guardSystemAdmin<TData, TReturn>(
  handler: ServerHandler<TData, TReturn>
): ServerHandler<TData, TReturn> {
  return async (data: TData) => {
    await requireSystemAdmin();
    return await handler(data);
  };
}

/**
 * Wrap a server function handler to require Kabale admin access
 */
export function guardKabaleAdmin<TData, TReturn>(
  handler: ServerHandler<TData, TReturn>
): ServerHandler<TData, TReturn> {
  return async (data: TData) => {
    await requireKabaleAdmin();
    return await handler(data);
  };
}

/**
 * Wrap a server function handler to require citizen access
 */
export function guardCitizen<TData, TReturn>(handler: ServerHandler<TData, TReturn>): ServerHandler<TData, TReturn> {
  return async (data: TData) => {
    await requireCitizen();
    return await handler(data);
  };
}

/**
 * Wrap a server function handler to require admin access
 */
export function guardAdmin<TData, TReturn>(handler: ServerHandler<TData, TReturn>): ServerHandler<TData, TReturn> {
  return async (data: TData) => {
    await requireAdmin();
    return await handler(data);
  };
}

/**
 * Wrap a server function handler to require access to a specific Kabale
 * The handler receives the validated kabaleId as part of the data
 */
export function guardKabaleAccess<TData extends { kabaleId: string }, TReturn>(
  handler: ServerHandler<TData, TReturn>
): ServerHandler<TData, TReturn> {
  return async (data: TData) => {
    await requireKabaleAccess(data.kabaleId);
    return await handler(data);
  };
}

/**
 * Ensure server function only accesses data within Kabale scope
 * Adds kabaleId filter to the handler context
 */
export function guardKabaleScope<TData, TReturn>(
  handler: (data: TData, kabaleId: string | undefined) => Promise<TReturn>
): ServerHandler<TData, TReturn> {
  return async (data: TData) => {
    const kabaleId = await getKabaleScopeFilter();
    return await handler(data, kabaleId);
  };
}

/**
 * Prevent citizens from accessing admin server functions
 */
export async function preventCitizenServerAccess() {
  await requireAdmin();
}
