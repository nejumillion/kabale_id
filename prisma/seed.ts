import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import * as argon2 from 'argon2';
import 'dotenv/config';
import { PrismaClient, UserRole } from '../generated/prisma/client';

const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

const prisma = new PrismaClient({adapter});

/**
 * Hash a password using argon2
 */
async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
}

async function main() {
  console.log('🌱 Starting seed...');

  // Check if SYSTEM_ADMIN already exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: UserRole.SYSTEM_ADMIN,
    },
  });

  if (existingAdmin) {
    console.log('✅ SYSTEM_ADMIN user already exists. Skipping creation.');
    console.log(`   Email: ${existingAdmin.email}`);
    return;
  }

  // Get admin credentials from environment or use defaults
  const adminEmail =
    process.env.SYSTEM_ADMIN_EMAIL || 'admin@kabale.gov';
  const adminPassword =
    process.env.SYSTEM_ADMIN_PASSWORD || 'ChangeMe123!';
  const adminFirstName =
    process.env.SYSTEM_ADMIN_FIRST_NAME || 'System';
  const adminLastName =
    process.env.SYSTEM_ADMIN_LAST_NAME || 'Administrator';

  // Hash the password
  const passwordHash = await hashPassword(adminPassword);

  // Create SYSTEM_ADMIN user
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      firstName: adminFirstName,
      lastName: adminLastName,
      role: UserRole.SYSTEM_ADMIN,
    },
  });

  console.log('✅ SYSTEM_ADMIN user created successfully!');
  console.log(`   ID: ${admin.id}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
  console.log(`   Role: ${admin.role}`);
  console.log('');
  console.log('⚠️  IMPORTANT: Change the default password after first login!');
  if (!process.env.SYSTEM_ADMIN_PASSWORD) {
    console.log(`   Default password: ${adminPassword}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
