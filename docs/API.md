# API Documentation

## Table of Contents

- [Overview](#overview)
- [Server Function Pattern](#server-function-pattern)
- [Authentication Functions](#authentication-functions)
- [Citizen Functions](#citizen-functions)
- [Kabale Admin Functions](#kabale-admin-functions)
- [System Admin Functions](#system-admin-functions)
- [Error Handling](#error-handling)
- [Response Format](#response-format)

## Overview

The Kabale Digital ID Card system uses TanStack Start server functions for all API operations. Server functions are type-safe, validated, and protected by middleware.

### Key Characteristics

- **Type-Safe**: Full TypeScript support with Zod validation
- **Middleware-Based**: Authorization handled via middleware
- **Input Validation**: All inputs validated with Zod schemas
- **Error Handling**: Consistent error response format
- **Server-Side Only**: All functions execute on the server

## Server Function Pattern

### Basic Structure

```typescript
export const myFunction = createServerFn({ method: 'GET' | 'POST' })
  .inputValidator(z.object({ ... }))  // Optional: Validate input
  .middleware([...])                  // Optional: Auth middleware
  .handler(async ({ data }) => {
    // Function logic
    return { success: true, data: ... };
  });
```

### Calling Server Functions

```typescript
// In React components
const result = await myFunction({ input: 'value' });

if (result.success) {
  // Handle success
} else {
  // Handle error: result.error
}
```

## Authentication Functions

All authentication functions are in `src/server/auth.ts`.

### `loginFn`

Authenticates a user and creates a session.

**Method**: `POST`  
**Authorization**: None (public)  
**Input**:
```typescript
{
  identifier: string;  // Email or phone
  password: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  error?: string;  // Present if success is false
}
```

**Behavior**:
- Finds user by email or phone
- Verifies password using Argon2
- Creates session and sets cookie
- Redirects to home page on success

**Errors**:
- `Invalid email/phone or password` - User not found or password incorrect

### `logoutFn`

Logs out the current user.

**Method**: `POST`  
**Authorization**: None (authenticated users)  
**Input**: None

**Response**: Redirects to home page

**Behavior**:
- Clears session from database
- Clears session cookie
- Redirects to home

### `registerFn`

Registers a new citizen user.

**Method**: `POST`  
**Authorization**: None (public)  
**Input**:
```typescript
{
  firstName: string;
  lastName: string;
  email?: string;  // At least one of email or phone required
  phone?: string;
  password: string;
  confirmPassword: string;
}
```

**Response**: Redirects to home page on success

**Errors**:
- `Email is already registered`
- `Phone number is already registered`
- `Either email or phone is required`
- `Passwords don't match`

### `getCurrentUserFn`

Gets the current authenticated user.

**Method**: `GET`  
**Authorization**: Authenticated users  
**Input**: None

**Response**:
```typescript
{
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    kabaleAdminProfile?: KabaleAdminProfile | null;
    citizenProfile?: CitizenProfile | null;
  };
}
```

**Behavior**:
- Returns user from session
- Includes related profiles
- Redirects to login if not authenticated

### `updateProfileFn`

Updates user profile information.

**Method**: `POST`  
**Authorization**: Authenticated users  
**Input**:
```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  user?: User;
  error?: string;
}
```

**Errors**:
- `Not authenticated`
- `Email is already in use`
- `Phone number is already in use`

### `updatePasswordFn`

Updates user password.

**Method**: `POST`  
**Authorization**: Authenticated users  
**Input**:
```typescript
{
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  message?: string;
  error?: string;
}
```

**Errors**:
- `Not authenticated`
- `Current password is incorrect`
- `New passwords do not match`

## Citizen Functions

All citizen functions are in `src/server/citizen.ts`.

### `getCitizenApplicationsFn`

Gets all applications for the current citizen.

**Method**: `GET`  
**Authorization**: `requireCitizenMiddleware`  
**Input**: None

**Response**:
```typescript
{
  success: boolean;
  applications?: IdApplication[];
  error?: string;
}
```

**Includes**:
- Kabale information
- Digital ID (if approved)
- Recent verification logs

### `getCitizenDigitalIdsFn`

Gets all digital IDs for the current citizen.

**Method**: `GET`  
**Authorization**: `requireCitizenMiddleware`  
**Input**: None

**Response**:
```typescript
{
  success: boolean;
  digitalIds?: DigitalId[];
  error?: string;
}
```

**Includes**:
- Application information
- Kabale information

### `getCitizenDashboardFn`

Gets dashboard data for the current citizen.

**Method**: `GET`  
**Authorization**: `requireCitizenMiddleware`  
**Input**: None

**Response**:
```typescript
{
  success: boolean;
  dashboard?: {
    profile: CitizenProfile;
    applications: IdApplication[];
    digitalIds: DigitalId[];
    stats: {
      totalApplications: number;
      pendingApplications: number;
      activeDigitalIds: number;
    };
  };
  error?: string;
}
```

### `createCitizenProfileFn`

Creates a citizen profile.

**Method**: `POST`  
**Authorization**: `requireCitizenMiddleware`  
**Input**:
```typescript
{
  dateOfBirth: Date;
  gender?: string;
  phone?: string;
  address?: string;
  kabaleId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  profile?: CitizenProfile;
  error?: string;
}
```

**Errors**:
- `Citizen profile already exists`
- `Kabale not found`
- `Please select a Kabale`

### `createIdApplicationFn`

Creates a new ID application.

**Method**: `POST`  
**Authorization**: `requireCitizenMiddleware`  
**Input**:
```typescript
{
  kabaleId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  application?: IdApplication;
  error?: string;
}
```

**Errors**:
- `Citizen profile not found`
- `Kabale not found`
- `Active application already exists`

### `updateIdApplicationFn`

Updates an existing ID application.

**Method**: `POST`  
**Authorization**: `requireCitizenMiddleware`  
**Input**:
```typescript
{
  applicationId: string;
  kabaleId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  application?: IdApplication;
  error?: string;
}
```

**Errors**:
- `Application not found`
- `Cannot update submitted application`
- `Kabale not found`

### `submitIdApplicationFn`

Submits an ID application for review.

**Method**: `POST`  
**Authorization**: `requireCitizenMiddleware`  
**Input**:
```typescript
{
  applicationId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  application?: IdApplication;
  error?: string;
}
```

**Behavior**:
- Changes status from `DRAFT` to `SUBMITTED`
- Sets `submittedAt` timestamp

**Errors**:
- `Application not found`
- `Application already submitted`
- `Citizen profile not found`

### `downloadDigitalIdPdfFn`

Downloads a digital ID as PDF.

**Method**: `GET`  
**Authorization**: `requireCitizenMiddleware`  
**Input**:
```typescript
{
  digitalIdId: string;
}
```

**Response**: PDF file (binary)

**Behavior**:
- Generates PDF using current ID design config
- Includes QR code for verification
- Returns PDF as download

**Errors**:
- `Digital ID not found`
- `Not authorized to access this Digital ID`

## Kabale Admin Functions

All Kabale admin functions are in `src/server/kabales.ts`.

### `getKabaleAdminDashboardFn`

Gets dashboard data for Kabale admin.

**Method**: `GET`  
**Authorization**: `requireKabaleAdminMiddleware`  
**Input**: None

**Response**:
```typescript
{
  success: boolean;
  dashboard?: {
    kabale: Kabale;
    applications: IdApplication[];
    stats: {
      totalApplications: number;
      pendingVerification: number;
      approved: number;
      rejected: number;
    };
  };
  error?: string;
}
```

### `getKabaleAdminApplicationsFn`

Gets applications for the Kabale admin's Kabale.

**Method**: `GET`  
**Authorization**: `requireKabaleAdminMiddleware`  
**Input**: None

**Response**:
```typescript
{
  success: boolean;
  applications?: IdApplication[];
  error?: string;
}
```

**Includes**:
- Citizen profile information
- Verification logs
- Digital ID (if approved)

### `getKabaleAdminCitizensFn`

Gets citizens who have applications for the Kabale admin's Kabale.

**Method**: `GET`  
**Authorization**: `requireKabaleAdminMiddleware`  
**Input**: None

**Response**:
```typescript
{
  success: boolean;
  citizens?: CitizenProfile[];
  error?: string;
}
```

### `getKabaleAdminCitizenByIdFn`

Gets a specific citizen by ID (must have application for admin's Kabale).

**Method**: `GET`  
**Authorization**: `requireKabaleAdminMiddleware`  
**Input**:
```typescript
{
  citizenId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  citizen?: CitizenProfile;
  error?: string;
}
```

**Includes**:
- User information
- Applications for this Kabale
- Digital IDs

**Errors**:
- `Citizen not found`
- `Not authorized to access this citizen`

### `reviewApplicationFn`

Reviews an application (moves to verification or approves/rejects).

**Method**: `POST`  
**Authorization**: `requireKabaleAdminMiddleware`  
**Input**:
```typescript
{
  applicationId: string;
  action: 'move_to_verification' | 'approve' | 'reject';
  notes?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  application?: IdApplication;
  digitalId?: DigitalId;  // Present if approved
  error?: string;
}
```

**Behavior**:
- `move_to_verification`: Changes status to `PENDING_VERIFICATION`
- `approve`: Creates verification log, approves application, creates DigitalId
- `reject`: Creates verification log, rejects application

**Errors**:
- `Application not found`
- `Not authorized to review this application`
- `Invalid action for current status`

### `getKabaleDigitalIdsFn`

Gets digital IDs for applications in a specific Kabale.

**Method**: `GET`  
**Authorization**: System Admin or Kabale Admin (scoped)  
**Input**:
```typescript
{
  kabaleId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  digitalIds?: DigitalId[];
  error?: string;
}
```

## System Admin Functions

All system admin functions are in `src/server/system.ts`.

### `getSystemStatsFn`

Gets system-wide statistics.

**Method**: `GET`  
**Authorization**: `requireSystemAdminMiddleware`  
**Input**: None

**Response**:
```typescript
{
  success: boolean;
  stats?: {
    totalUsers: number;
    totalKabales: number;
    totalCitizens: number;
    totalKabaleAdmins: number;
    totalSystemAdmins: number;
    totalApplications: number;
    totalDigitalIds: number;
    applicationsByStatus: {
      draft: number;
      submitted: number;
      pendingVerification: number;
      approved: number;
      rejected: number;
    };
    digitalIdsByStatus: {
      active: number;
      revoked: number;
      expired: number;
    };
  };
}
```

### `getAllUsersFn`

Gets all users (excluding citizens).

**Method**: `GET`  
**Authorization**: `requireSystemAdminMiddleware`  
**Input**: None

**Response**:
```typescript
{
  success: boolean;
  users?: User[];
}
```

**Includes**:
- Kabale admin profiles with Kabale info
- Citizen profiles
- Session and verification log counts

### `getUserByIdFn`

Gets a specific user by ID.

**Method**: `GET`  
**Authorization**: `requireSystemAdminMiddleware`  
**Input**:
```typescript
{
  userId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  user?: User;
  error?: string;
}
```

**Includes**:
- Full profile information
- Recent applications and digital IDs
- Session and verification log counts

### `createUserFn`

Creates a new user (admin or Kabale admin).

**Method**: `POST`  
**Authorization**: `requireSystemAdminMiddleware`  
**Input**:
```typescript
{
  email?: string;  // At least one of email or phone required
  phone?: string;
  firstName: string;
  lastName: string;
  password: string;
  role: 'SYSTEM_ADMIN' | 'KABALE_ADMIN' | 'CITIZEN';
  kabaleId?: string;  // Required if role is KABALE_ADMIN
}
```

**Response**:
```typescript
{
  success: boolean;
  user?: User;
  error?: string;
}
```

**Errors**:
- `Email is already registered`
- `Phone number is already registered`
- `Kabale is required for Kabale Admin role`
- `Kabale not found`

### `updateUserFn`

Updates an existing user.

**Method**: `POST`  
**Authorization**: `requireSystemAdminMiddleware`  
**Input**:
```typescript
{
  userId: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  kabaleId?: string;  // For Kabale Admin role changes
  password?: string;  // Optional password update
}
```

**Response**:
```typescript
{
  success: boolean;
  user?: User;
  error?: string;
}
```

**Errors**:
- `User not found`
- `Email is already in use`
- `Phone number is already in use`
- `Kabale not found`

### `getAllCitizensFn`

Gets all citizens in the system.

**Method**: `GET`  
**Authorization**: `requireSystemAdminMiddleware`  
**Input**: None

**Response**:
```typescript
{
  success: boolean;
  citizens?: CitizenProfile[];
}
```

### `getCitizenByIdFn`

Gets a specific citizen by ID.

**Method**: `GET`  
**Authorization**: `requireSystemAdminMiddleware`  
**Input**:
```typescript
{
  citizenId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  citizen?: CitizenProfile;
  error?: string;
}
```

**Includes**:
- User information
- All applications
- All digital IDs

### `getAllDigitalIdsFn`

Gets all digital IDs in the system.

**Method**: `GET`  
**Authorization**: `requireSystemAdminMiddleware`  
**Input**: None

**Response**:
```typescript
{
  success: boolean;
  digitalIds?: DigitalId[];
}
```

### `getAllApplicationsFn`

Gets all applications in the system.

**Method**: `GET`  
**Authorization**: `requireSystemAdminMiddleware`  
**Input**: None

**Response**:
```typescript
{
  success: boolean;
  applications?: IdApplication[];
}
```

**Includes**:
- Citizen profile information
- Kabale information
- Verification logs
- Digital ID (if approved)

### `revokeDigitalIdFn`

Revokes a digital ID.

**Method**: `POST`  
**Authorization**: `requireSystemAdminMiddleware`  
**Input**:
```typescript
{
  digitalIdId: string;
  reason: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  digitalId?: DigitalId;
  error?: string;
}
```

**Behavior**:
- Changes status to `REVOKED`
- Sets `revokedAt` timestamp
- Records `revokedBy` and `revokedReason`

**Errors**:
- `Digital ID not found`
- `Digital ID is already revoked`

### `getIdDesignConfigFn`

Gets the active ID design configuration.

**Method**: `GET`  
**Authorization**: None (public, but design is role-based)  
**Input**: None

**Response**:
```typescript
{
  success: boolean;
  config?: IdDesignConfig;
}
```

### `updateIdDesignConfigFn`

Updates the ID design configuration.

**Method**: `POST`  
**Authorization**: `requireSystemAdminMiddleware`  
**Input**:
```typescript
{
  config: Json;  // Design configuration JSON
}
```

**Response**:
```typescript
{
  success: boolean;
  config?: IdDesignConfig;
  error?: string;
}
```

**Behavior**:
- Deactivates previous active config
- Creates new active config

### `verifyDigitalIdFn`

Verifies a digital ID by QR code or ID.

**Method**: `GET`  
**Authorization**: None (public verification)  
**Input**:
```typescript
{
  id: string;  // Digital ID ID or QR code data
}
```

**Response**:
```typescript
{
  success: boolean;
  digitalId?: {
    id: string;
    status: DigitalIdStatus;
    citizen: {
      firstName: string;
      lastName: string;
      dateOfBirth: Date;
    };
    issuedAt: DateTime;
    application: {
      kabale: {
        name: string;
      };
    };
  };
  error?: string;
}
```

**Errors**:
- `Digital ID not found`
- `Digital ID is revoked`
- `Digital ID is expired`

## Kabale Management Functions

Functions for managing Kabales are in `src/server/kabales.ts`.

### `getAllKabalesFn`

Gets all Kabales in the system.

**Method**: `GET`  
**Authorization**: `requireSystemAdminMiddleware`  
**Input**: None

**Response**:
```typescript
{
  success: boolean;
  kabales?: Kabale[];
}
```

**Includes**:
- Admin count
- Application count

### `getKabaleByIdFn`

Gets a specific Kabale by ID.

**Method**: `GET`  
**Authorization**: System Admin or Kabale Admin (scoped)  
**Input**:
```typescript
{
  kabaleId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  kabale?: Kabale;
  error?: string;
}
```

**Includes**:
- All admins with user information
- Admin and application counts

### `getKabaleApplicationsFn`

Gets applications for a specific Kabale.

**Method**: `GET`  
**Authorization**: System Admin or Kabale Admin (scoped)  
**Input**:
```typescript
{
  kabaleId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  applications?: IdApplication[];
  error?: string;
}
```

### `getAvailableKabalesFn`

Gets all available Kabales (for citizen selection).

**Method**: `GET`  
**Authorization**: None (public)  
**Input**: None

**Response**:
```typescript
{
  success: boolean;
  kabales?: Kabale[];
}
```

### `createKabaleFn`

Creates a new Kabale.

**Method**: `POST`  
**Authorization**: `requireSystemAdminMiddleware`  
**Input**:
```typescript
{
  name: string;
  address?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  kabale?: Kabale;
  error?: string;
}
```

**Errors**:
- `Kabale name is required`

### `updateKabaleFn`

Updates an existing Kabale.

**Method**: `POST`  
**Authorization**: `requireSystemAdminMiddleware`  
**Input**:
```typescript
{
  kabaleId: string;
  name?: string;
  address?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  kabale?: Kabale;
  error?: string;
}
```

**Errors**:
- `Kabale not found`

## Error Handling

### Standard Error Response

All functions return errors in a consistent format:

```typescript
{
  success: false;
  error: string;  // Human-readable error message
}
```

### Common Error Scenarios

1. **Authentication Errors**:
   - User not authenticated → Redirect to login
   - Insufficient permissions → 403 Forbidden

2. **Validation Errors**:
   - Invalid input → Error message with field details
   - Missing required fields → Field-specific errors

3. **Business Logic Errors**:
   - Entity not found → "X not found"
   - Duplicate entry → "X is already registered"
   - Invalid state → "Cannot perform action in current state"

4. **Authorization Errors**:
   - Wrong role → Redirect to forbidden page
   - Out of scope → "Not authorized to access this resource"

## Response Format

### Success Response

```typescript
{
  success: true;
  data?: T;  // Response data (type varies by function)
}
```

### Error Response

```typescript
{
  success: false;
  error: string;  // Error message
}
```

### Redirect Response

Some functions (like `loginFn`, `logoutFn`) throw redirects instead of returning data:

```typescript
throw redirect({ to: '/path' });
```

## Best Practices

1. **Always Check `success`**: Verify `result.success` before accessing data
2. **Handle Errors Gracefully**: Display user-friendly error messages
3. **Validate Input**: Client-side validation should match server validation
4. **Type Safety**: Use TypeScript types from function return types
5. **Loading States**: Show loading indicators while functions execute
6. **Error Boundaries**: Wrap function calls in error boundaries

## Related Documentation

- [Authentication Documentation](AUTHENTICATION.md) - Auth flow and security
- [Architecture Documentation](ARCHITECTURE.md) - System design
- [Developer Guide](DEVELOPER.md) - Code patterns and conventions

