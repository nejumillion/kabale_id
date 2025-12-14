import { prisma } from '@/db';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireKabaleAdmin, requireKabaleAdminMiddleware, requireSystemAdminMiddleware } from './auth-context';
import { hashPassword } from './auth-utils';

/**
 * Get system-wide statistics (System Admin only)
 */
export const getSystemStatsFn = createServerFn({ method: 'GET' })
  .middleware([requireSystemAdminMiddleware])
  .handler(async () => {
    // Get counts in parallel for better performance
    const [
      totalUsers,
      totalKabales,
      totalCitizens,
      totalKabaleAdmins,
      totalSystemAdmins,
      totalApplications,
      totalDigitalIds,
      applicationsByStatus,
      digitalIdsByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.kabale.count(),
      prisma.user.count({ where: { role: 'CITIZEN' } }),
      prisma.user.count({ where: { role: 'KABALE_ADMIN' } }),
      prisma.user.count({ where: { role: 'SYSTEM_ADMIN' } }),
      prisma.idApplication.count(),
      prisma.digitalId.count(),
      prisma.idApplication.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
      prisma.digitalId.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      }),
    ]);

    // Transform grouped data into objects for easier access
    const applicationsStatusCounts = applicationsByStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

    const digitalIdsStatusCounts = digitalIdsByStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      success: true,
      stats: {
        totalUsers,
        totalKabales,
        totalCitizens,
        totalKabaleAdmins,
        totalSystemAdmins,
        totalApplications,
        totalDigitalIds,
        applicationsByStatus: {
          draft: applicationsStatusCounts.DRAFT || 0,
          submitted: applicationsStatusCounts.SUBMITTED || 0,
          pendingVerification: applicationsStatusCounts.PENDING_VERIFICATION || 0,
          approved: applicationsStatusCounts.APPROVED || 0,
          rejected: applicationsStatusCounts.REJECTED || 0,
        },
        digitalIdsByStatus: {
          active: digitalIdsStatusCounts.ACTIVE || 0,
          revoked: digitalIdsStatusCounts.REVOKED || 0,
          expired: digitalIdsStatusCounts.EXPIRED || 0,
        },
      },
    };
  });

/**
 * Get all users (System Admin only)
 */
export const getAllUsersFn = createServerFn({ method: 'GET' })
  .middleware([requireSystemAdminMiddleware])
  .handler(async () => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        kabaleAdminProfile: {
          include: {
            kabale: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        citizenProfile: true,
        _count: {
          select: {
            sessions: true,
            verificationLogs: true,
          },
        },
      },
    });

    return {
      success: true,
      users,
    };
  });

/**
 * Get a single user by ID (System Admin only)
 */
export const getUserByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.string() }))
  .middleware([requireSystemAdminMiddleware])
  .handler(async ({ data }) => {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: {
        kabaleAdminProfile: {
          include: {
            kabale: {
              select: {
                id: true,
                name: true,
                code: true,
                address: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        citizenProfile: {
          include: {
            idApplications: {
              select: {
                id: true,
                status: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
            digitalIds: {
              select: {
                id: true,
                status: true,
                issuedAt: true,
              },
              orderBy: { issuedAt: 'desc' },
              take: 5,
            },
          },
        },
        _count: {
          select: {
            sessions: true,
            verificationLogs: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      user,
    };
  });

/**
 * Create a new user (System Admin only)
 */
const createUserSchema = z
  .object({
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['SYSTEM_ADMIN', 'KABALE_ADMIN', 'CITIZEN']),
    kabaleId: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasEmail = data.email && data.email.trim() !== '';
      const hasPhone = data.phone && data.phone.trim() !== '';
      return hasEmail || hasPhone;
    },
    {
      message: 'Either email or phone is required',
      path: ['email'],
    }
  )
  .refine(
    (data) => {
      if (data.role === 'KABALE_ADMIN' && !data.kabaleId) {
        return false;
      }
      return true;
    },
    {
      message: 'Kabale is required for Kabale Admin role',
      path: ['kabaleId'],
    }
  );

export const createUserFn = createServerFn({ method: 'POST' })
  .inputValidator(createUserSchema)
  .middleware([requireSystemAdminMiddleware])
  .handler(async ({ data }) => {
    const email = data.email?.trim() || null;
    const phone = data.phone?.trim() || null;

    // Check if email is already taken
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

    // Check if phone is already taken
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

    // Verify Kabale exists if Kabale Admin
    if (data.role === 'KABALE_ADMIN' && data.kabaleId) {
      const kabale = await prisma.kabale.findUnique({
        where: { id: data.kabaleId },
      });
      if (!kabale) {
        return {
          success: false,
          error: 'Kabale not found',
        };
      }
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const userData = email
      ? {
          firstName: data.firstName,
          lastName: data.lastName,
          email,
          ...(phone && { phone }),
          passwordHash,
          role: data.role,
        }
      : {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: phone || '',
          passwordHash,
          role: data.role,
          email: '', // Temporary email
        };

    const user = await prisma.user.create({
      data: userData,
      include: {
        kabaleAdminProfile: {
          include: {
            kabale: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        citizenProfile: true,
      },
    });

    // Create Kabale Admin Profile if needed
    if (data.role === 'KABALE_ADMIN' && data.kabaleId) {
      await prisma.kabaleAdminProfile.create({
        data: {
          userId: user.id,
          kabaleId: data.kabaleId,
          ...(phone ? { phone } : {}),
          
        },
      });
    }

    // Reload user with profile
    const createdUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        kabaleAdminProfile: {
          include: {
            kabale: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        citizenProfile: true,
      },
    });

    return {
      success: true,
      user: createdUser,
    };
  });

/**
 * Update a user (System Admin only)
 */
const updateUserSchema = z
  .object({
    userId: z.string(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().min(1, 'Last name is required').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    role: z.enum(['SYSTEM_ADMIN', 'KABALE_ADMIN', 'CITIZEN']).optional(),
    kabaleId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'KABALE_ADMIN' && !data.kabaleId) {
        // Check if user already has a kabale admin profile
        return false;
      }
      return true;
    },
    {
      message: 'Kabale is required for Kabale Admin role',
      path: ['kabaleId'],
    }
  );

export const updateUserFn = createServerFn({ method: 'POST' })
  .inputValidator(updateUserSchema)
  .middleware([requireSystemAdminMiddleware])
  .handler(async ({ data }) => {
    const { userId, ...updateData } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        kabaleAdminProfile: true,
      },
    });

    if (!existingUser) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    // Check email uniqueness if changing email
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: updateData.email },
      });
      if (emailTaken) {
        return {
          success: false,
          error: 'Email is already registered',
        };
      }
    }

    // Check phone uniqueness if changing phone
    if (updateData.phone && updateData.phone !== existingUser.phone) {
      const phoneTaken = await prisma.user.findFirst({
        where: { phone: updateData.phone },
      });
      if (phoneTaken) {
        return {
          success: false,
          error: 'Phone number is already registered',
        };
      }
    }

    // Verify Kabale exists if updating to Kabale Admin
    if (updateData.role === 'KABALE_ADMIN' && updateData.kabaleId) {
      const kabale = await prisma.kabale.findUnique({
        where: { id: updateData.kabaleId },
      });
      if (!kabale) {
        return {
          success: false,
          error: 'Kabale not found',
        };
      }
    }

    // Prepare update data
    const userUpdateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string | null;
      passwordHash?: string;
      role?: 'SYSTEM_ADMIN' | 'KABALE_ADMIN' | 'CITIZEN';
    } = {};

    if (updateData.firstName) userUpdateData.firstName = updateData.firstName;
    if (updateData.lastName) userUpdateData.lastName = updateData.lastName;
    if (updateData.email !== undefined) {
      userUpdateData.email = updateData.email.trim() || undefined;
    }
    if (updateData.phone !== undefined) {
      userUpdateData.phone = updateData.phone.trim() || undefined;
    }
    if (updateData.password) {
      userUpdateData.passwordHash = await hashPassword(updateData.password);
    }
    if (updateData.role) userUpdateData.role = updateData.role;

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
    });

    // Handle Kabale Admin Profile
    if (updateData.role === 'KABALE_ADMIN' && updateData.kabaleId) {
      if (existingUser.kabaleAdminProfile) {
        // Update existing profile
        await prisma.kabaleAdminProfile.update({
          where: { userId },
          data: {
            kabaleId: updateData.kabaleId,
            ...(updateData.phone && { phone: updateData.phone }),
          },
        });
      } else {
        // Create new profile
        const profileData = {
          userId,
          kabaleId: updateData.kabaleId,
          ...(updateData.phone ? { phone: updateData.phone } : {}),
        };
        // biome-ignore lint/suspicious/noExplicitAny: Prisma type issue with optional fields
        await prisma.kabaleAdminProfile.create({
          data: profileData as any,
        });
      }
    } else if (updateData.role && updateData.role !== 'KABALE_ADMIN' && existingUser.kabaleAdminProfile) {
      // Remove Kabale Admin Profile if role changed
      await prisma.kabaleAdminProfile.delete({
        where: { userId },
      });
    }

    // Reload user with profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        kabaleAdminProfile: {
          include: {
            kabale: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        citizenProfile: true,
      },
    });

    return {
      success: true,
      user: updatedUser,
    };
  });

/**
 * Get all citizens (System Admin only)
 */
export const getAllCitizensFn = createServerFn({ method: 'GET' })
  .middleware([requireSystemAdminMiddleware])
  .handler(async () => {
    const citizens = await prisma.citizenProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            idApplications: true,
            digitalIds: true,
          },
        },
      },
    });

    return {
      success: true,
      citizens,
    };
  });

/**
 * Get a single citizen by ID (System Admin only)
 */
export const getCitizenByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ citizenId: z.string() }))
  .middleware([requireSystemAdminMiddleware])
  .handler(async ({ data }) => {
    const citizen = await prisma.citizenProfile.findUnique({
      where: { id: data.citizenId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        idApplications: {
          orderBy: { createdAt: 'desc' },
          include: {
            kabale: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            digitalId: {
              select: {
                id: true,
                status: true,
                issuedAt: true,
              },
            },
            _count: {
              select: {
                verificationLogs: true,
              },
            },
          },
        },
        digitalIds: {
          orderBy: { issuedAt: 'desc' },
          include: {
            application: {
              include: {
                kabale: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            idApplications: true,
            digitalIds: true,
          },
        },
      },
    });

    if (!citizen) {
      return {
        success: false,
        error: 'Citizen not found',
      };
    }

    return {
      success: true,
      citizen,
    };
  });

/**
 * Get all digital IDs (System Admin only)
 */
export const getAllDigitalIdsFn = createServerFn({ method: 'GET' })
  .middleware([requireSystemAdminMiddleware])
  .handler(async () => {
    const digitalIds = await prisma.digitalId.findMany({
      orderBy: { issuedAt: 'desc' },
      include: {
        citizen: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        application: {
          include: {
            kabale: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      digitalIds,
    };
  });


  export const getKabaleDigitalIdsFn = createServerFn({ method: 'GET' })
   .middleware([requireKabaleAdminMiddleware])
  .handler(async () => {
      const user = await requireKabaleAdmin();
     
         if (!user.kabaleAdminProfile) {
           return {
             success: false,
             error: 'Kabale admin profile not found',
           };
         }
     
         const kabaleId = user.kabaleAdminProfile.kabaleId;
     

    const digitalIds = await prisma.digitalId.findMany({
      where: { application: { kabaleId } },
      orderBy: { issuedAt: 'desc' },
      include: {
        citizen: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        application: {
          include: {
            kabale: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      digitalIds,
    };
  });
/**
 * Get all applications (System Admin only)
 */
export const getAllApplicationsFn = createServerFn({ method: 'GET' })
  .middleware([requireSystemAdminMiddleware])
  .handler(async () => {
    const applications = await prisma.idApplication.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        citizenProfile: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        kabale: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        digitalId: true,
        _count: {
          select: {
            verificationLogs: true,
          },
        },
      },
    });

    return {
      success: true,
      applications,
    };
  });
