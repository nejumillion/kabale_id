import { useSession } from '@tanstack/react-start/server';
import { prisma } from '@/db';
import { CitizenProfile, KabaleAdminProfile, UserRole } from '@/prisma';
import { generateSessionToken } from './auth-utils';

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type AuthUser = {
  id: string,
  name: string,
  email: string,
  phone: string | null,
  role: UserRole,
  kabaleAdminProfile: KabaleAdminProfile | null,
  citizenProfile: CitizenProfile | null,
}

export type Session = {
  token: string,
  user: AuthUser,
}

// Use secure session configuration
export function useAppSession() {
  return useSession<Session>({
    name: 'app-session',
    password: process.env.SESSION_SECRET || 'default-secret', // 32+ characters
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax', // CSRF protection
      httpOnly: true, // XSS protection
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
  })
}
/**
 * Create a new session for a user
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Get a session by token, including user data
 */
export async function getSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          citizenProfile: true,
          kabaleAdminProfile: {
            include: {
              kabale: true,
            },
          },
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    // Delete expired session
    await prisma.session.delete({
      where: { id: session.id },
    });
    return null;
  }

  return session;
}

/**
 * Delete a session by token
 */
export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { token },
  });
}

/**
 * Delete all sessions for a user
 */
export async function deleteUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

/**
 * Clean up expired sessions
 * This should be called periodically (e.g., via cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}
