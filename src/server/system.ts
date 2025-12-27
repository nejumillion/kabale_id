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
                address: true,
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
                address: true,
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
                address: true,
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
                address: true,
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
                address: true,
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
                address: true,
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
                    address: true,
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
                address: true,
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
                  address: true,
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
            address: true,
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

/**
 * Design configuration schema
 */
const idDesignConfigSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Primary color must be a valid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Secondary color must be a valid hex color'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Background color must be a valid hex color'),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Text color must be a valid hex color'),
  fontFamily: z.string().min(1, 'Font family is required'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  headerText: z.string().optional(),
  layoutTemplate: z.enum(['standard', 'compact', 'detailed']).default('standard'),
  // Back-side design settings
  backBackgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Back background color must be a valid hex color').optional(),
  backTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Back text color must be a valid hex color').optional(),
  backHeaderText: z.string().optional(),
  backContentText: z.string().optional(),
  // Expiry duration configuration
  expiryDurationYears: z.number().int().min(1, 'Expiry duration must be at least 1 year').max(20, 'Expiry duration must be at most 20 years').default(3),
});

/**
 * Get ID design configuration
 * Returns the active design config or creates a default one
 */
export const getIdDesignConfigFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    // Try to get active config
    let config = await prisma.idDesignConfig.findFirst({
      where: { isActive: true },
    });

    // If no config exists, create default
    // Use upsert to handle race conditions where another request might have created it
    if (!config) {
      const defaultConfig = {
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Helvetica',
        logoUrl: '',
        headerText: 'Residential ID Card',
        layoutTemplate: 'standard' as const,
        backBackgroundColor: '#f3f4f6',
        backTextColor: '#1f2937',
        backHeaderText: 'Verification Information',
        backContentText: 'This is an official Digital ID card issued by the Kabale administration.',
        expiryDurationYears: 3,
      };

      try {
        config = await prisma.idDesignConfig.create({
          data: {
            config: defaultConfig,
            isActive: true,
          },
        });
      } catch (error: any) {
        // If unique constraint fails, another request created it - fetch it
        if (error?.code === 'P2002' || error?.message?.includes('Unique constraint')) {
          config = await prisma.idDesignConfig.findFirst({
            where: { isActive: true },
          });
        } else {
          throw error;
        }
      }
    }

    // If still no config (shouldn't happen, but safety check)
    if (!config) {
      return {
        success: false,
        error: 'Failed to load or create design configuration',
      };
    }

    return {
      success: true,
      config: config.config as z.infer<typeof idDesignConfigSchema>,
    };
  });

/**
 * Update ID design configuration (System Admin only)
 */
export const updateIdDesignConfigFn = createServerFn({ method: 'POST' })
  .inputValidator(idDesignConfigSchema)
  .middleware([requireSystemAdminMiddleware])
  .handler(async ({ data }) => {
    // Validate the config data
    const validatedConfig = idDesignConfigSchema.parse(data);

    // Get or create active config
    let activeConfig = await prisma.idDesignConfig.findFirst({
      where: { isActive: true },
    });

    if (activeConfig) {
      // Update existing config
      activeConfig = await prisma.idDesignConfig.update({
        where: { id: activeConfig.id },
        data: {
          config: validatedConfig,
        },
      });
    } else {
      // Create new config
      // Handle potential race condition where another request might have created it
      try {
        activeConfig = await prisma.idDesignConfig.create({
          data: {
            config: validatedConfig,
            isActive: true,
          },
        });
      } catch (error: any) {
        // If unique constraint fails, another request created it - fetch and update it
        if (error?.code === 'P2002' || error?.message?.includes('Unique constraint')) {
          activeConfig = await prisma.idDesignConfig.findFirst({
            where: { isActive: true },
          });
          if (activeConfig) {
            activeConfig = await prisma.idDesignConfig.update({
              where: { id: activeConfig.id },
              data: {
                config: validatedConfig,
              },
            });
          } else {
            return {
              success: false,
              error: 'Failed to create or update design configuration',
            };
          }
        } else {
          throw error;
        }
      }
    }

    return {
      success: true,
      config: activeConfig.config as z.infer<typeof idDesignConfigSchema>,
    };
  });

/**
 * Verify digital ID (Public access)
 * Returns public information about a digital ID for verification purposes
 */
export const verifyDigitalIdFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ digitalIdId: z.string() }))
  .handler(async ({ data }) => {
    const digitalId = await prisma.digitalId.findUnique({
      where: { id: data.digitalIdId },
      include: {
        citizen: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: false, // Don't expose email in public verification
              },
            },
          },
        },
        application: {
          include: {
            kabale: {
              select: {
                name: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!digitalId) {
      return {
        success: false,
        error: 'Digital ID not found',
      };
    }

    // Return only public verification information
    return {
      success: true,
      digitalId: {
        id: digitalId.id,
        status: digitalId.status,
        issuedAt: digitalId.issuedAt,
        expiresAt: digitalId.expiresAt,
        citizen: {
          name: `${digitalId.citizen.user.firstName || ''} ${digitalId.citizen.user.lastName || ''}`.trim(),
        },
        kabale: {
          name: digitalId.application.kabale.name,
          address: digitalId.application.kabale.address,
        },
      },
    };
  });