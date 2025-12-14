import * as argon2 from 'argon2';
import { prisma } from '@/db';
import type { Prisma } from '../../generated/prisma/client';

/**
 * Hash a password using argon2
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/**
 * Generate a cryptographically secure random token for sessions
 */
export function generateSessionToken(): string {
  // Generate a 32-byte random token and convert to hex (64 characters)
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if an identifier is an email or phone number
 */
export function isEmail(identifier: string): boolean {
  return identifier.includes('@');
}

/**
 * Find a user by email or phone
 */
export async function findUserByIdentifier(identifier: string) {
  if (isEmail(identifier)) {
    return await prisma.user.findUnique({
      where: { email: identifier },
      include: {
        citizenProfile: true,
        kabaleAdminProfile: {
          include: {
            kabale: true,
          },
        },
      },
    });
  }

  // For phone, use findFirst - works the same as findUnique for unique fields
  // but handles nullable unique fields better in TypeScript
  return await prisma.user.findFirst({
    where: { phone: identifier } as Prisma.UserWhereInput,
    include: {
      citizenProfile: true,
      kabaleAdminProfile: {
        include: {
          kabale: true,
        },
      },
    },
  });
}
