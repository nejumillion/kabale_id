import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { prisma } from '@/db';
import { requireKabaleAdmin, requireKabaleAdminMiddleware, requireSystemAdmin, requireSystemAdminMiddleware } from './auth-context';
import { getKabaleScopeFilter, requireKabaleAccess } from './rbac';
import { getIdDesignConfigFn } from './system';

/**
 * Get all Kabales (System Admin only)
 */
export const getAllKabalesFn = createServerFn({ method: 'GET' })
  .middleware([requireSystemAdminMiddleware])
  .handler(async () => {
    const kabales = await prisma.kabale.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            admins: true,
            idApplications: true,
          },
        },
      },
    });

    return {
      success: true,
      kabales,
    };
  });

/**
 * Get a specific Kabale by ID
 * - System Admin: can access any Kabale
 * - Kabale Admin: can only access their own Kabale
 */
export const getKabaleByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ kabaleId: z.string() }))
  .handler(async ({ data }) => {
    // Check access to this Kabale
    await requireKabaleAccess(data.kabaleId);

    const kabale = await prisma.kabale.findUnique({
      where: { id: data.kabaleId },
      include: {
        admins: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
                id: true,
              },
            },
          },
        },
        _count: {
          select: {
            admins: true,
            idApplications: true,
          },
        },
      },
    });

    if (!kabale) {
      return {
        success: false,
        error: 'Kabale not found',
      };
    }

    return {
      success: true,
      kabale,
    };
  });

/**
 * Get applications for a Kabale
 * - System Admin: can access any Kabale's applications
 * - Kabale Admin: can only access their own Kabale's applications
 */
export const getKabaleApplicationsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ kabaleId: z.string() }))
  .handler(async ({ data }) => {
    // Check access to this Kabale
    await requireKabaleAccess(data.kabaleId);

    const applications = await prisma.idApplication.findMany({
      where: {
        kabaleId: data.kabaleId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        citizenProfile: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
        digitalId: true,
      },
    });

    return {
      success: true,
      applications,
    };
  });


  export const getAllApplicationsFn = createServerFn({ method: 'GET' })
  .middleware([requireSystemAdminMiddleware])
  .handler(async () => {
    // Check access to this Kabale

    const applications = await prisma.idApplication.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        citizenProfile: {
          include: {
            user: {
              select: {
                email: true,
                phone: true,
              },
            },
          },
        },
        digitalId: true,
      },
    });

    return {
      success: true,
      applications,
    };
  });
/**
 * Get applications scoped by user's Kabale access
 * - System Admin: gets all applications
 * - Kabale Admin: gets only their Kabale's applications
 */
export const getScopedApplicationsFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  // Get Kabale scope filter
  const kabaleId = await getKabaleScopeFilter();

  const applications = await prisma.idApplication.findMany({
    where: kabaleId
      ? {
          kabaleId,
        }
      : undefined, // System admin - no filter
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      citizenProfile: {
        include: {
          user: {
            select: {
              email: true,
              phone: true,
            },
          },
        },
      },
      kabale: {
        select: {
          name: true,
        },
      },
      digitalId: true,
    },
  });

  return {
    success: true,
    applications,
    scope: kabaleId ? 'kabale' : 'system',
  };
});

/**
 * Get applications for the current Kabale Admin's Kabale
 * Includes verification logs count
 * Kabale Admin only - automatically scoped to their Kabale
 */
export const getKabaleAdminApplicationsFn = createServerFn({
  method: 'GET',
})
  .middleware([requireKabaleAdminMiddleware])
  .handler(async () => {
    // Require Kabale admin access
  const user = await requireKabaleAdmin();

  if (!user.kabaleAdminProfile) {
    return {
      success: false,
      error: 'Kabale admin profile not found',
    };
  }

  const kabaleId = user.kabaleAdminProfile.kabaleId;

    // Load applications only for this Kabale (scoped access)
    const applications = await prisma.idApplication.findMany({
      where: {
        kabaleId,
      },
      orderBy: {
        createdAt: 'desc',
      },
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
      kabaleId,
    };
  });

/**
 * Get Kabale Admin dashboard data
 * Returns Kabale info and statistics for the admin's Kabale
 * Kabale Admin only - automatically scoped to their Kabale
 */
export const getKabaleAdminDashboardFn = createServerFn({
  method: 'GET',
})
  .middleware([requireKabaleAdminMiddleware])
  .handler(async () => {
    // Require Kabale admin access
    const user = await requireKabaleAdmin();

    if (!user.kabaleAdminProfile) {
      return {
        success: false,
        error: 'Kabale admin profile not found',
      };
    }

    const kabaleId = user.kabaleAdminProfile.kabaleId;

    // Get Kabale info and statistics
    const [kabale, applications, applicationsByStatus, digitalIdsByStatus] = await Promise.all([
      prisma.kabale.findUnique({
        where: { id: kabaleId },
        select: {
          id: true,
          name: true,
          address: true,
        },
      }),
      prisma.idApplication.findMany({
        where: { kabaleId },
        select: { status: true },
      }),
      prisma.idApplication.groupBy({
        by: ['status'],
        where: { kabaleId },
        _count: {
          status: true,
        },
      }),
      prisma.digitalId.findMany({
        where: {
          application: {
            kabaleId,
          },
        },
        select: { status: true },
      }),
    ]);

    if (!kabale) {
      return {
        success: false,
        error: 'Kabale not found',
      };
    }

    // Transform grouped data
    const applicationsStatusCounts = applicationsByStatus.reduce(
      (acc, item) => {
        acc[item.status] = item._count.status;
        return acc;
      },
      {} as Record<string, number>
    );

    const digitalIdsStatusCounts = digitalIdsByStatus.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      success: true,
      kabale,
      stats: {
        totalApplications: applications.length,
        totalDigitalIds: digitalIdsByStatus.length,
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
 * Get citizens for the current Kabale Admin's Kabale
 * Returns unique citizens who have at least one application to this Kabale
 * Kabale Admin only - automatically scoped to their Kabale
 */
export const getKabaleAdminCitizensFn = createServerFn({
  method: 'GET',
})
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

    // Get unique citizen IDs who have applications to this Kabale
    const applications = await prisma.idApplication.findMany({
      where: { kabaleId },
      select: {
        citizenId: true,
      },
      distinct: ['citizenId'],
    });

    const citizenIds = applications.map((app) => app.citizenId);

    if (citizenIds.length === 0) {
      return {
        success: true,
        citizens: [],
      };
    }

    // Get citizens with counts scoped to this kabale
    const citizens = await prisma.citizenProfile.findMany({
      where: {
        id: { in: citizenIds },
      },
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
            idApplications: {
              where: { kabaleId },
            },
            digitalIds: {
              where: {
                application: { kabaleId },
              },
            },
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
 * Get a single citizen by ID for Kabale Admin
 * Only accessible if the citizen has applications to the admin's Kabale
 * Kabale Admin only - automatically scoped to their Kabale
 */
export const getKabaleAdminCitizenByIdFn = createServerFn({
  method: 'GET',
})
  .inputValidator(z.object({ citizenId: z.string() }))
  .middleware([requireKabaleAdminMiddleware])
  .handler(async ({ data }) => {
    const user = await requireKabaleAdmin();

    if (!user.kabaleAdminProfile) {
      return {
        success: false,
        error: 'Kabale admin profile not found',
      };
    }

    const kabaleId = user.kabaleAdminProfile.kabaleId;

    // First verify the citizen has at least one application to this Kabale
    const hasAccess = await prisma.idApplication.findFirst({
      where: {
        citizenId: data.citizenId,
        kabaleId,
      },
    });

    if (!hasAccess) {
      return {
        success: false,
        error: 'Citizen not found or not accessible',
      };
    }

    // Get citizen with applications and digital IDs filtered to this kabale
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
          where: { kabaleId },
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
          where: {
            application: { kabaleId },
          },
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
            idApplications: {
              where: { kabaleId },
            },
            digitalIds: {
              where: {
                application: { kabaleId },
              },
            },
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
 * Get all available Kabales for selection
 * Public endpoint - no authentication required
 * Used in registration/profile creation forms
 */
export const getAvailableKabalesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const kabales = await prisma.kabale.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      address: true,
    },
  });

  return {
    success: true,
    kabales,
  };
});

/**
 * Create a new Kabale (System Admin only)
 */
const createKabaleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().optional(),
});

export const createKabaleFn = createServerFn({ method: 'POST' })
  .inputValidator(createKabaleSchema)
  .middleware([requireSystemAdminMiddleware])
  .handler(async ({ data }) => {
    const kabale = await prisma.kabale.create({
      data: {
        name: data.name,
        address: data.address || null,
      },
      include: {
        _count: {
          select: {
            admins: true,
            idApplications: true,
          },
        },
      },
    });

    return {
      success: true,
      kabale,
    };
  });

/**
 * Update a Kabale (System Admin only)
 */
const updateKabaleSchema = z.object({
  kabaleId: z.string(),
  name: z.string().min(1, 'Name is required').optional(),
  address: z.string().optional(),
});

export const updateKabaleFn = createServerFn({ method: 'POST' })
  .inputValidator(updateKabaleSchema)
  .middleware([requireSystemAdminMiddleware])
  .handler(async ({ data }) => {
    const { kabaleId, ...updateData } = data;

    // Check if Kabale exists
    const existingKabale = await prisma.kabale.findUnique({
      where: { id: kabaleId },
    });

    if (!existingKabale) {
      return {
        success: false,
        error: 'Kabale not found',
      };
    }

    // Prepare update data
    const kabaleUpdateData: {
      name?: string;
      address?: string | null;
    } = {};

    if (updateData.name) kabaleUpdateData.name = updateData.name;
    if (updateData.address !== undefined) kabaleUpdateData.address = updateData.address || null;

    const kabale = await prisma.kabale.update({
      where: { id: kabaleId },
      data: kabaleUpdateData,
      include: {
        admins: {
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
        _count: {
          select: {
            admins: true,
            idApplications: true,
          },
        },
      },
    });

    return {
      success: true,
      kabale,
    };
  });

/**
 * Review an ID Application (Approve or Reject)
 * Kabale Admin only
 */
const reviewApplicationSchema = z.object({
  applicationId: z.string(),
  action: z.enum(['APPROVE', 'REJECT']),
  notes: z.string().optional(),
});

export const reviewApplicationFn = createServerFn({ method: 'POST' })
  .inputValidator(reviewApplicationSchema)
  .middleware([requireKabaleAdminMiddleware])
  .handler(async ({ data }) => {
    // Require Kabale admin access
    const user = await requireKabaleAdmin();

    if (!user.kabaleAdminProfile) {
      return {
        success: false,
        error: 'Kabale admin profile not found',
      };
    }

    const kabaleId = user.kabaleAdminProfile.kabaleId;

    // Get the application
    const application = await prisma.idApplication.findUnique({
      where: { id: data.applicationId },
      include: {
        citizenProfile: true,
      },
    });

    if (!application) {
      return {
        success: false,
        error: 'Application not found',
      };
    }

    // Verify application belongs to this Kabale
    if (application.kabaleId !== kabaleId) {
      return {
        success: false,
        error: 'Application does not belong to your Kabale',
      };
    }

    // Verify application status
    if (application.status !== 'SUBMITTED' && application.status !== 'PENDING_VERIFICATION') {
      return {
        success: false,
        error: 'Application is not in a reviewable state',
      };
    }

    // Perform the review action
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create verification log
        await tx.verificationLog.create({
          data: {
            applicationId: data.applicationId,
            verifiedBy: user.id,
            result: data.action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
            notes: data.notes,
          },
        });

        // 2. Update application status
        const newStatus = data.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        const updatedApplication = await tx.idApplication.update({
          where: { id: data.applicationId },
          data: {
            status: newStatus,
          },
        });

        // 3. If approved, create Digital ID
        if (data.action === 'APPROVE') {
          // Check if already has active ID (double check)
          const existingActiveId = await tx.digitalId.findFirst({
            where: {
              citizenId: application.citizenId,
              status: 'ACTIVE',
            },
          });

          if (existingActiveId) {
            throw new Error('Citizen already has an active Digital ID');
          }

          // Get design config to calculate expiry date
          const designConfigResult = await getIdDesignConfigFn();
          const expiryDurationYears = designConfigResult.success && designConfigResult.config.expiryDurationYears
            ? designConfigResult.config.expiryDurationYears
            : 3; // Default to 3 years if config not available

          // Calculate expiry date: issuedAt + expiryDurationYears
          const issuedAt = new Date();
          const expiresAt = new Date(
            issuedAt.getFullYear() + expiryDurationYears,
            issuedAt.getMonth(),
            issuedAt.getDate()
          );

          await tx.digitalId.create({
            data: {
              applicationId: data.applicationId,
              citizenId: application.citizenId,
              status: 'ACTIVE',
              issuedAt,
              expiresAt,
            },
          });
        }

        return updatedApplication;
      });

      return {
        success: true,
        application: result,
      };
    } catch (error) {
      console.error('Failed to review application:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to review application',
      };
    }
  });
