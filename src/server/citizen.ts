import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { prisma } from '@/db';
import { profileSchema, idApplicationSchema } from '@/lib/validation';
import { requireCitizen, requireCitizenMiddleware } from './auth-context';

/**
 * Get citizen's own applications
 * Citizens can only access their own data
 */
export const getCitizenApplicationsFn = createServerFn({
  method: 'GET',
})
.middleware([requireCitizenMiddleware])
.handler(async () => {
  // Require citizen access
  const user = await requireCitizen();

  if (!user.citizenProfile) {
    return {
      success: false,
      error: 'Citizen profile not found',
    };
  }

  // Load only the citizen's own applications
  const applications = await prisma.idApplication.findMany({
    where: {
      citizenId: user.citizenProfile.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      kabale: {
        select: {
          name: true,
          code: true,
          address: true,
          phone: true,
        },
      },
      digitalId: true,
      verificationLogs: {
        orderBy: {
          verifiedAt: 'desc',
        },
        take: 5,
        include: {
          verifier: {
            select: {
              email: true,
            },
          },
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
 * Get citizen's own digital IDs
 * Citizens can only access their own data
 */
export const getCitizenDigitalIdsFn = createServerFn({ method: 'GET' }).handler(async () => {
  // Require citizen access
  const user = await requireCitizen();

  if (!user.citizenProfile) {
    return {
      success: false,
      error: 'Citizen profile not found',
    };
  }

  // Load only the citizen's own digital IDs
  const digitalIds = await prisma.digitalId.findMany({
    where: {
      citizenId: user.citizenProfile.id,
    },
    orderBy: {
      issuedAt: 'desc',
    },
    include: {
      application: {
        include: {
          kabale: {
            select: {
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
 * Get citizen dashboard data
 * Returns profile, applications, and digital IDs
 */
export const getCitizenDashboardFn = createServerFn({ method: 'GET' }).handler(async () => {
  // Require citizen access
  const user = await requireCitizen();

  if (!user.citizenProfile) {
    return {
      success: false,
      error: 'Citizen profile not found',
    };
  }

  // Load citizen's own data only
  const citizenId = user.citizenProfile.id;

  const [applications, digitalIds] = await Promise.all([
    prisma.idApplication.findMany({
      where: {
        citizenId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        kabale: {
          select: {
            name: true,
            code: true,
          },
        },
        digitalId: true,
      },
    }),
    prisma.digitalId.findMany({
      where: {
        citizenId,
      },
      orderBy: {
        issuedAt: 'desc',
      },
      include: {
        application: {
          include: {
            kabale: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    success: true,
    profile: user.citizenProfile,
    applications,
    digitalIds,
  };
});

/**
 * Create citizen profile
 * Creates a CitizenProfile linked to the user
 * userId must be provided in the data
 */
export const createCitizenProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(
    profileSchema.extend({
      userId: z.string().min(1, 'User ID is required'),
    })
  )
  .handler(async ({ data }) => {
    // Validate Kabale exists
    const kabale = await prisma.kabale.findUnique({
      where: { id: data.kabaleId },
    });

    if (!kabale) {
      return {
        success: false,
        error: 'Selected Kabale does not exist',
      };
    }

    const { userId } = data;

    // Check if user already has a profile
    const existingProfile = await prisma.citizenProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return {
        success: false,
        error: 'Profile already exists for this user',
      };
    }

    // Create citizen profile
    try {
      const profile = await prisma.citizenProfile.create({
        data: {
          userId,
          firstName: data.firstName,
          lastName: data.lastName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender || null,
          phone: data.phone || null,
          address: data.address || null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              role: true,
            },
          },
        },
      });

      return {
        success: true,
        profile,
      };
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
        return {
          success: false,
          error: 'Profile already exists for this user',
        };
      }

      return {
        success: false,
        error: 'Failed to create profile. Please try again.',
      };
    }
  });

/**
 * Create a new ID Application
 * Creates a DRAFT application for the citizen
 * Business rule: Can't create if citizen already has an ACTIVE Digital ID
 */
export const createIdApplicationFn = createServerFn({ method: 'POST' })
  .middleware([requireCitizenMiddleware])
  .inputValidator(idApplicationSchema)
  .handler(async ({ data }) => {
    const user = await requireCitizen();

    if (!user.citizenProfile) {
      return {
        success: false,
        error: 'Citizen profile not found',
      };
    }

    // Business rule: Check if citizen already has an ACTIVE Digital ID
    const activeDigitalId = await prisma.digitalId.findFirst({
      where: {
        citizenId: user.citizenProfile.id,
        status: 'ACTIVE',
      },
    });

    if (activeDigitalId) {
      return {
        success: false,
        error: 'You already have an active Digital ID. Only one active Digital ID is allowed at a time.',
      };
    }

    // Validate Kabale exists
    const kabale = await prisma.kabale.findUnique({
      where: { id: data.kabaleId },
    });

    if (!kabale) {
      return {
        success: false,
        error: 'Selected Kabale does not exist',
      };
    }

    // Create application with DRAFT status
    try {
      const application = await prisma.idApplication.create({
        data: {
          citizenId: user.citizenProfile.id,
          kabaleId: data.kabaleId,
          status: 'DRAFT',
        },
        include: {
          kabale: {
            select: {
              name: true,
              code: true,
              address: true,
              phone: true,
            },
          },
          digitalId: true,
        },
      });

      return {
        success: true,
        application,
      };
    } catch (error) {
      console.error('Failed to create application:', error);
      return {
        success: false,
        error: 'Failed to create application. Please try again.',
      };
    }
  });

/**
 * Update an ID Application
 * Can only update DRAFT applications
 * Updates the Kabale selection
 */
export const updateIdApplicationFn = createServerFn({ method: 'PUT' })
  .middleware([requireCitizenMiddleware])
  .inputValidator(
    idApplicationSchema.extend({
      applicationId: z.string().min(1, 'Application ID is required'),
    })
  )
  .handler(async ({ data }) => {
    const user = await requireCitizen();

    if (!user.citizenProfile) {
      return {
        success: false,
        error: 'Citizen profile not found',
      };
    }

    // Get the application and verify ownership
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

    // Verify application belongs to this citizen
    if (application.citizenId !== user.citizenProfile.id) {
      return {
        success: false,
        error: 'You do not have permission to update this application',
      };
    }

    // Can only edit DRAFT applications
    if (application.status !== 'DRAFT') {
      return {
        success: false,
        error: 'Only draft applications can be edited',
      };
    }

    // Validate Kabale exists
    const kabale = await prisma.kabale.findUnique({
      where: { id: data.kabaleId },
    });

    if (!kabale) {
      return {
        success: false,
        error: 'Selected Kabale does not exist',
      };
    }

    // Update application
    try {
      const updatedApplication = await prisma.idApplication.update({
        where: { id: data.applicationId },
        data: {
          kabaleId: data.kabaleId,
        },
        include: {
          kabale: {
            select: {
              name: true,
              code: true,
              address: true,
              phone: true,
            },
          },
          digitalId: true,
        },
      });

      return {
        success: true,
        application: updatedApplication,
      };
    } catch (error) {
      console.error('Failed to update application:', error);
      return {
        success: false,
        error: 'Failed to update application. Please try again.',
      };
    }
  });

/**
 * Submit an ID Application
 * Changes status from DRAFT to SUBMITTED
 * Business rule: Can't submit if citizen already has an ACTIVE Digital ID
 */
export const submitIdApplicationFn = createServerFn({ method: 'POST' })
  .middleware([requireCitizenMiddleware])
  .inputValidator(z.object({
    applicationId: z.string().min(1, 'Application ID is required'),
  }))
  .handler(async ({ data }) => {
    const user = await requireCitizen();

    if (!user.citizenProfile) {
      return {
        success: false,
        error: 'Citizen profile not found',
      };
    }

    // Get the application and verify ownership
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

    // Verify application belongs to this citizen
    if (application.citizenId !== user.citizenProfile.id) {
      return {
        success: false,
        error: 'You do not have permission to submit this application',
      };
    }

    // Can only submit DRAFT applications
    if (application.status !== 'DRAFT') {
      return {
        success: false,
        error: 'Only draft applications can be submitted',
      };
    }

    // Business rule: Check if citizen already has an ACTIVE Digital ID
    const activeDigitalId = await prisma.digitalId.findFirst({
      where: {
        citizenId: user.citizenProfile.id,
        status: 'ACTIVE',
      },
    });

    if (activeDigitalId) {
      return {
        success: false,
        error: 'You already have an active Digital ID. Only one active Digital ID is allowed at a time.',
      };
    }

    // Submit application (change status to SUBMITTED)
    try {
      const submittedApplication = await prisma.idApplication.update({
        where: { id: data.applicationId },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
        },
        include: {
          kabale: {
            select: {
              name: true,
              code: true,
              address: true,
              phone: true,
            },
          },
          digitalId: true,
        },
      });

      return {
        success: true,
        application: submittedApplication,
      };
    } catch (error) {
      console.error('Failed to submit application:', error);
      return {
        success: false,
        error: 'Failed to submit application. Please try again.',
      };
    }
  });
