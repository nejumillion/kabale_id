# Developer Guide

## Table of Contents

- [Code Structure](#code-structure)
- [File Naming Conventions](#file-naming-conventions)
- [Routing with TanStack Router](#routing-with-tanstack-router)
- [Server Functions](#server-functions)
- [Form Handling](#form-handling)
- [UI Components](#ui-components)
- [State Management](#state-management)
- [Database Access](#database-access)
- [Testing](#testing)
- [Code Style Guidelines](#code-style-guidelines)

## Code Structure

### Project Organization

```
src/
├── components/          # React components
│   ├── ui/            # Shadcn UI components
│   └── ...            # Custom components
├── routes/            # TanStack Router file-based routes
│   ├── admin/        # System admin routes
│   ├── citizen/      # Citizen routes
│   └── kabale/       # Kabale admin routes
├── server/           # Server functions and business logic
│   ├── auth.ts      # Authentication functions
│   ├── citizen.ts   # Citizen functions
│   ├── kabales.ts   # Kabale functions
│   ├── system.ts    # System admin functions
│   └── rbac.ts      # Role-based access control
├── lib/             # Utility functions and helpers
│   ├── validation.ts    # Zod schemas
│   ├── utils.ts         # General utilities
│   └── ...              # Other helpers
├── context/         # React contexts
├── hooks/           # Custom React hooks
└── db.ts            # Prisma client configuration
```

### Key Principles

1. **Separation of Concerns**: Routes handle UI, server functions handle logic
2. **Type Safety**: Full TypeScript with strict mode
3. **Server-Side Logic**: Business logic in server functions, not components
4. **Reusability**: Shared components and utilities in appropriate directories

## File Naming Conventions

### Routes

- **File-based routing**: Routes match file structure
- **Dynamic routes**: Use `$param` syntax (e.g., `$userId.tsx`)
- **Layout routes**: Use `route.tsx` for layout components
- **Root route**: `__root.tsx`

**Examples**:
- `/admin/users` → `src/routes/admin/users/index.tsx`
- `/admin/users/$userId` → `src/routes/admin/users/$userId.tsx`
- `/admin/users/$userId.edit` → `src/routes/admin/users/$userId.edit.tsx`

### Components

- **PascalCase**: Component files use PascalCase
- **Descriptive names**: Names should describe component purpose
- **Co-location**: Related components can be in the same directory

**Examples**:
- `Header.tsx`
- `IdCardPreview.tsx`
- `ApplicationForm.tsx`

### Server Functions

- **CamelCase with Fn suffix**: Server functions end with `Fn`
- **Descriptive names**: Names should describe function purpose
- **Grouped by domain**: Functions grouped in domain files

**Examples**:
- `getUserByIdFn`
- `createIdApplicationFn`
- `revokeDigitalIdFn`

### Utilities

- **camelCase**: Utility functions use camelCase
- **Descriptive names**: Clear purpose from name
- **File by purpose**: Group related utilities

**Examples**:
- `hashPassword()`
- `generateSessionToken()`
- `validateEmail()`

## Routing with TanStack Router

### Basic Route Structure

```typescript
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/path')({
  loader: async () => {
    // Load data before rendering
    const data = await fetchData();
    return { data };
  },
  component: MyComponent,
});

function MyComponent() {
  const { data } = Route.useLoaderData();
  return <div>{/* Use data */}</div>;
}
```

### Protected Routes

```typescript
import { withSystemAdmin } from '@/server/route-guards';

export const Route = createFileRoute('/admin/users')({
  loader: withSystemAdmin(async () => {
    const users = await getAllUsersFn();
    return { users };
  }),
  component: AdminUsersPage,
});
```

### Dynamic Routes

```typescript
export const Route = createFileRoute('/admin/users/$userId')({
  loader: async ({ params }) => {
    const user = await getUserByIdFn({ userId: params.userId });
    return { user };
  },
  component: UserDetailPage,
});
```

### Route Guards

Available guard functions (`src/server/route-guards.ts`):

- `withSystemAdmin<T>(loader)` - Requires SYSTEM_ADMIN role
- `withKabaleAdmin<T>(loader)` - Requires KABALE_ADMIN role
- `withCitizen<T>(loader)` - Requires CITIZEN role
- `withAdmin<T>(loader)` - Requires admin (system or Kabale)
- `withKabaleAccess<T>(kabaleId, loader)` - Requires access to specific Kabale
- `withKabaleScope<T>(loader)` - Filters by Kabale scope

### Navigation

```typescript
import { Link, useNavigate } from '@tanstack/react-router';

// Link component
<Link to="/admin/users">Users</Link>
<Link to="/admin/users/$userId" params={{ userId: '123' }}>User</Link>

// Programmatic navigation
const navigate = useNavigate();
navigate({ to: '/admin/users' });
```

## Server Functions

### Creating Server Functions

```typescript
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSystemAdminMiddleware } from '@/server/auth-context';

export const myFunction = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
    })
  )
  .middleware([requireSystemAdminMiddleware])
  .handler(async ({ data }) => {
    // data is typed and validated
    // Authorization already checked by middleware
    
    const result = await processData(data);
    
    return {
      success: true,
      data: result,
    };
  });
```

### Server Function Patterns

#### Pattern 1: Simple GET Function

```typescript
export const getDataFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async () => {
    const data = await fetchData();
    return { success: true, data };
  });
```

#### Pattern 2: POST with Validation

```typescript
export const createDataFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1),
    })
  )
  .middleware([requireSystemAdminMiddleware])
  .handler(async ({ data }) => {
    const result = await prisma.model.create({
      data: { name: data.name },
    });
    
    return { success: true, data: result };
  });
```

#### Pattern 3: Error Handling

```typescript
export const updateDataFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string(), name: z.string() }))
  .handler(async ({ data }) => {
    const existing = await prisma.model.findUnique({
      where: { id: data.id },
    });
    
    if (!existing) {
      return {
        success: false,
        error: 'Record not found',
      };
    }
    
    const updated = await prisma.model.update({
      where: { id: data.id },
      data: { name: data.name },
    });
    
    return { success: true, data: updated };
  });
```

### Calling Server Functions

```typescript
// In React components
const result = await myFunction({ name: 'John', email: 'john@example.com' });

if (result.success) {
  // Handle success: result.data
} else {
  // Handle error: result.error
}
```

### Important Rules

1. **Never access Prisma in loaders**: Use server functions instead
2. **Always validate input**: Use Zod schemas
3. **Always check authorization**: Use middleware
4. **Return consistent format**: `{ success: boolean, data?: T, error?: string }`
5. **Handle errors gracefully**: Return error messages, don't throw (unless redirecting)

## Form Handling

### React Hook Form with Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { zodV4Resolver } from '@/lib/zodV4Resolver';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type FormValues = z.infer<typeof schema>;

function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodV4Resolver(schema),
    defaultValues: {
      name: '',
      email: '',
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    const result = await createDataFn(data);
    if (result.success) {
      // Handle success
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Using Shadcn Form Components

```typescript
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
```

## UI Components

### Shadcn UI

The project uses [Shadcn UI](https://ui.shadcn.com/) components. To add a new component:

```bash
pnpm dlx shadcn@latest add button
```

Components are located in `src/components/ui/`.

### Using Components

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text" />
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

### Custom Components

Create custom components in `src/components/`:

```typescript
// src/components/id-card-preview.tsx
export function IdCardPreview({ data }: { data: DigitalId }) {
  return (
    <div className="id-card">
      {/* Component implementation */}
    </div>
  );
}
```

## State Management

### Server State

Server state is managed through TanStack Router loaders:

```typescript
// Loader provides data
export const Route = createFileRoute('/path')({
  loader: async () => {
    const data = await fetchData();
    return { data };
  },
  component: MyComponent,
});

// Component uses loader data
function MyComponent() {
  const { data } = Route.useLoaderData();
  // data is available
}
```

### Client State

For client-side state, use React hooks:

```typescript
import { useState, useEffect } from 'react';

function MyComponent() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // Side effects
  }, []);
  
  return <div>{count}</div>;
}
```

### Context

For shared state, use React Context:

```typescript
// src/context/auth-context.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user } = Route.useLoaderData();
  
  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## Database Access

### Prisma Client

Always use Prisma through the configured client:

```typescript
import { prisma } from '@/db';

// Query
const user = await prisma.user.findUnique({
  where: { id: userId },
});

// Create
const newUser = await prisma.user.create({
  data: { email, passwordHash },
});

// Update
const updated = await prisma.user.update({
  where: { id: userId },
  data: { email: newEmail },
});

// Delete
await prisma.user.delete({
  where: { id: userId },
});
```

### Important Rules

1. **Never access Prisma in loaders**: Use server functions
2. **Always include relations**: Use `include` for related data
3. **Use transactions**: For multiple operations
4. **Handle errors**: Wrap in try-catch when appropriate

### Query Optimization

```typescript
// ✅ Good: Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    role: true,
  },
});

// ✅ Good: Use includes for relations
const application = await prisma.idApplication.findUnique({
  where: { id },
  include: {
    citizenProfile: true,
    kabale: true,
  },
});

// ❌ Bad: Fetching everything
const users = await prisma.user.findMany(); // No select/include
```

## Testing

### Test Structure

Tests should be co-located with code or in a `__tests__` directory:

```
src/
├── components/
│   ├── MyComponent.tsx
│   └── __tests__/
│       └── MyComponent.test.tsx
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
pnpm test        # Run tests once
pnpm test:watch  # Watch mode (if configured)
```

## Code Style Guidelines

### Biome Configuration

The project uses [Biome](https://biomejs.dev/) for linting and formatting.

### Formatting

```bash
pnpm format      # Check formatting
pnpm format:fix  # Fix formatting
```

### Linting

```bash
pnpm lint        # Check linting
pnpm lint:fix    # Fix linting
```

### Combined Check

```bash
pnpm check       # Check both lint and format
pnpm check:fix   # Fix both
```

### Code Style Rules

1. **TypeScript Strict Mode**: Always enabled
2. **No `any` Types**: Use proper types or `unknown`
3. **Explicit Returns**: Prefer explicit return types for functions
4. **Consistent Naming**: Follow established conventions
5. **Comments**: Add comments for complex logic
6. **Error Handling**: Always handle errors appropriately

### Example: Well-Formatted Code

```typescript
/**
 * Creates a new ID application for the current citizen
 * @param kabaleId - The ID of the selected Kabale
 * @returns The created application or an error
 */
export async function createIdApplication(
  kabaleId: string
): Promise<{ success: boolean; application?: IdApplication; error?: string }> {
  try {
    const user = await requireCitizen();
    
    if (!user.citizenProfile) {
      return {
        success: false,
        error: 'Citizen profile not found',
      };
    }
    
    const application = await prisma.idApplication.create({
      data: {
        citizenId: user.citizenProfile.id,
        kabaleId,
        status: 'DRAFT',
      },
    });
    
    return {
      success: true,
      application,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to create application',
    };
  }
}
```

## Best Practices

### 1. Type Safety

Always use TypeScript types:

```typescript
// ✅ Good
function processUser(user: User): ProcessedUser {
  // ...
}

// ❌ Bad
function processUser(user: any): any {
  // ...
}
```

### 2. Error Handling

Handle errors gracefully:

```typescript
// ✅ Good
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: 'Operation failed' };
}

// ❌ Bad
const result = await riskyOperation(); // No error handling
```

### 3. Authorization

Always check authorization:

```typescript
// ✅ Good
.middleware([requireSystemAdminMiddleware])

// ❌ Bad
// No authorization check
```

### 4. Input Validation

Always validate input:

```typescript
// ✅ Good
.inputValidator(z.object({ email: z.string().email() }))

// ❌ Bad
// No validation
```

### 5. Database Queries

Optimize database queries:

```typescript
// ✅ Good: Select only needed fields
const users = await prisma.user.findMany({
  select: { id: true, email: true },
});

// ❌ Bad: Fetch everything
const users = await prisma.user.findMany();
```

## Common Patterns

### Pattern 1: Protected Route with Data

```typescript
export const Route = createFileRoute('/admin/users')({
  loader: withSystemAdmin(async () => {
    const result = await getAllUsersFn();
    if (!result.success) {
      throw new Error(result.error);
    }
    return { users: result.users };
  }),
  component: AdminUsersPage,
});
```

### Pattern 2: Form with Server Function

```typescript
function MyForm() {
  const form = useForm({
    resolver: zodV4Resolver(schema),
  });
  
  const onSubmit = async (data: FormValues) => {
    const result = await createDataFn(data);
    if (result.success) {
      // Handle success
      form.reset();
    } else {
      // Handle error
      form.setError('root', { message: result.error });
    }
  };
  
  return <Form {...form}>...</Form>;
}
```

### Pattern 3: Conditional Rendering

```typescript
function MyComponent() {
  const { user } = Route.useLoaderData();
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  if (user.role === 'SYSTEM_ADMIN') {
    return <AdminView />;
  }
  
  return <UserView />;
}
```

## Related Documentation

- [Architecture Documentation](ARCHITECTURE.md) - System design
- [API Documentation](API.md) - Server function reference
- [Authentication Documentation](AUTHENTICATION.md) - Auth patterns
- [Setup Guide](SETUP.md) - Development setup

