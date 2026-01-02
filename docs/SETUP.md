# Setup and Installation Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Configuration](#database-configuration)
- [Installation Steps](#installation-steps)
- [Development Setup](#development-setup)
- [Running the Application](#running-the-application)
- [Database Migrations](#database-migrations)
- [Database Seeding](#database-seeding)
- [Verification](#verification)

## Prerequisites

Before setting up the Kabale Digital ID Card system, ensure you have the following installed:

### Required Software

1. **Node.js** (version 18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **pnpm** (Package Manager)
   - Install globally: `npm install -g pnpm`
   - Verify installation: `pnpm --version`

3. **MySQL or MariaDB** (version 10.3 or higher)
   - Download MySQL from [mysql.com](https://www.mysql.com/downloads/)
   - Or MariaDB from [mariadb.org](https://mariadb.org/download/)
   - Verify installation: `mysql --version`

4. **Git** (for cloning the repository)
   - Download from [git-scm.com](https://git-scm.com/)

### Optional Tools

- **Database GUI**: MySQL Workbench, DBeaver, or phpMyAdmin for database management
- **Code Editor**: VS Code, WebStorm, or your preferred IDE

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd kabale_id
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all required npm packages including:
- TanStack Start and Router
- Prisma ORM
- React and React DOM
- Shadcn UI components
- And all other dependencies

### 3. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env  # If .env.example exists
# Or create .env manually
```

Required environment variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=kabale_id

# Application Configuration (optional)
NODE_ENV=development
PORT=3000

# Session Configuration (optional)
SESSION_SECRET=your-secret-key-here
SESSION_MAX_AGE=86400000  # 24 hours in milliseconds
```

### Environment Variable Details

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DB_HOST` | Yes | MySQL/MariaDB server hostname | - |
| `DB_PORT` | Yes | Database server port | `3306` |
| `DB_USER` | Yes | Database username | - |
| `DB_PASSWORD` | Yes | Database password | - |
| `DB_NAME` | Yes | Database name | - |
| `NODE_ENV` | No | Environment mode (`development` or `production`) | `development` |
| `PORT` | No | Application port | `3000` |
| `SESSION_SECRET` | No | Secret key for session encryption | - |
| `SESSION_MAX_AGE` | No | Session expiration time (ms) | `86400000` |

## Database Configuration

### 1. Create Database

Connect to your MySQL/MariaDB server and create a new database:

```sql
CREATE DATABASE kabale_id CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Create Database User (Optional but Recommended)

For production, create a dedicated database user:

```sql
CREATE USER 'kabale_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON kabale_id.* TO 'kabale_user'@'localhost';
FLUSH PRIVILEGES;
```

Update your `.env` file with the new user credentials.

### 3. Verify Database Connection

Test the connection using the Prisma CLI:

```bash
pnpm prisma db pull  # This will test the connection
```

## Installation Steps

### Step 1: Generate Prisma Client

```bash
pnpm prisma generate
```

This generates the Prisma client in `generated/prisma/` based on your schema.

### Step 2: Run Database Migrations

```bash
pnpm prisma migrate dev
```

This will:
- Create all database tables
- Set up relationships and constraints
- Create indexes
- Apply all migrations from `prisma/migrations/`

### Step 3: Seed the Database (Optional)

Populate the database with initial data:

```bash
pnpm seed
```

The seed script typically creates:
- Initial system admin user
- Sample Kabales
- Sample Kabale admins (optional)
- Test data for development

**Note**: Check `prisma/seed.ts` to see what data is being seeded.

### Step 4: Verify Installation

1. Check that Prisma client is generated:
   ```bash
   ls generated/prisma/
   ```

2. Verify database tables exist:
   ```bash
   pnpm prisma studio
   ```
   This opens Prisma Studio, a visual database browser.

## Development Setup

### 1. Start Development Server

```bash
pnpm dev
```

The application will start on `http://localhost:3000`

### 2. Development Scripts

```bash
# Start on default port (3000)
pnpm dev

# Start on port 3001
pnpm dev:1

# Start on port 3002
pnpm dev:2

# Start with load balancer (multiple instances)
pnpm load
```

### 3. Code Quality Tools

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Run both lint and format
pnpm check

# Auto-fix issues
pnpm lint:fix
pnpm format:fix
pnpm check:fix
```

### 4. Development Workflow

1. **Make Schema Changes**: Edit `prisma/schema.prisma`
2. **Create Migration**: `pnpm prisma migrate dev --name your_migration_name`
3. **Generate Client**: `pnpm prisma generate` (auto-runs with migrate)
4. **Update Code**: Modify server functions and components
5. **Test Changes**: Use `pnpm dev` to see changes in real-time

## Running the Application

### Development Mode

```bash
pnpm dev
```

Features:
- Hot module replacement (HMR)
- Fast refresh for React components
- Development error overlay
- TanStack Router DevTools (if enabled)

### Production Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Production Start

```bash
pnpm start
```

This runs the built application from `.output/server/index.mjs`

## Database Migrations

### Creating Migrations

When you modify `prisma/schema.prisma`:

```bash
pnpm prisma migrate dev --name descriptive_migration_name
```

This will:
1. Create a new migration file
2. Apply it to your database
3. Regenerate the Prisma client

### Applying Migrations

For existing migrations (e.g., in production):

```bash
pnpm prisma migrate deploy
```

### Migration Best Practices

1. **Always create migrations** for schema changes
2. **Use descriptive names**: `add_verification_notes`, `add_id_expiration`
3. **Review migration SQL** before applying in production
4. **Backup database** before running migrations in production
5. **Test migrations** in development first

### Resetting Database (Development Only)

⚠️ **Warning**: This will delete all data!

```bash
pnpm prisma migrate reset
```

This will:
- Drop the database
- Recreate it
- Apply all migrations
- Run the seed script

## Database Seeding

### Seed Script Location

The seed script is located at `prisma/seed.ts`

### Running Seed

```bash
pnpm seed
```

Or directly:

```bash
pnpm prisma db seed
```

### Customizing Seed Data

Edit `prisma/seed.ts` to customize:
- Initial admin users
- Sample Kabales
- Test citizens
- Other development data

### Seed Script Structure

```typescript
// Example seed structure
async function main() {
  // Create system admin
  const admin = await prisma.user.create({...});
  
  // Create Kabales
  const kabale1 = await prisma.kabale.create({...});
  
  // Create Kabale admins
  // Create test citizens
  // etc.
}
```

## Verification

### 1. Check Application Starts

```bash
pnpm dev
```

Visit `http://localhost:3000` - you should see the landing page.

### 2. Check Database Connection

```bash
pnpm prisma studio
```

You should see all tables listed.

### 3. Test Authentication

1. Visit `/register` and create a test account
2. Visit `/login` and log in
3. Verify you're redirected to the appropriate dashboard

### 4. Verify Routes

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/admin` - Admin dashboard (requires SYSTEM_ADMIN)
- `/kabale` - Kabale admin dashboard (requires KABALE_ADMIN)
- `/citizen` - Citizen dashboard (requires CITIZEN)

### 5. Check Console for Errors

Open browser developer tools and check:
- No console errors
- Network requests succeed
- Authentication works

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL/MariaDB is running
   - Check `.env` credentials
   - Test connection: `mysql -u $DB_USER -p $DB_NAME`

2. **Prisma Client Not Generated**
   - Run: `pnpm prisma generate`
   - Check `generated/prisma/` directory exists

3. **Migration Errors**
   - Check database user has proper permissions
   - Verify database exists
   - Review migration SQL files

4. **Port Already in Use**
   - Change port in `.env` or use `pnpm dev:1`
   - Kill process using port: `lsof -ti:3000 | xargs kill`

5. **Module Not Found Errors**
   - Run: `pnpm install`
   - Clear node_modules: `rm -rf node_modules && pnpm install`

For more troubleshooting help, see [Troubleshooting Guide](TROUBLESHOOTING.md).

## Next Steps

After successful setup:

1. Read the [Architecture Documentation](ARCHITECTURE.md) to understand the system
2. Review [Developer Guide](DEVELOPER.md) for coding conventions
3. Check [User Guides](USER_GUIDES.md) to understand user workflows
4. Explore the [API Documentation](API.md) for server functions

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [TanStack Start Documentation](https://tanstack.com/start)
- [TanStack Router Documentation](https://tanstack.com/router)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

