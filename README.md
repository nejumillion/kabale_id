# Kabale Digital ID Card System

A single-city digital identity platform where citizens register online, complete their profiles, apply for digital ID cards, and receive approval after in-person verification at selected Kabale offices.

## Overview

The Kabale Digital ID Card system provides a secure, verifiable digital identity solution for citizens. The platform supports three main user roles:

- **Citizens**: Register, create profiles, apply for digital IDs, and view their status
- **Kabale Administrators**: Verify citizens in person and approve/reject ID applications for their assigned Kabale
- **System Administrators**: Manage the entire system, including Kabales, users, and system settings

## Key Features

- 🔐 Secure role-based authentication and authorization
- 👤 Online citizen registration and profile management
- 📋 Digital ID application workflow
- ✅ In-person verification requirement
- 🆔 Digital ID card generation (PDF format)
- 📱 QR code generation for verification
- 📊 Role-based dashboards and analytics
- 📝 Comprehensive audit logging
- 🎨 Customizable ID card design

## Technology Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) with [TanStack Router](https://tanstack.com/router)
- **Language**: TypeScript (strict mode)
- **UI**: [Shadcn UI](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: MySQL (via MariaDB adapter)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Linting/Formatting**: [Biome](https://biomejs.dev/)

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm installed
- MySQL/MariaDB database server
- Environment variables configured (see [Setup Guide](docs/SETUP.md))

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env  # Edit .env with your database credentials

# Run database migrations
pnpm prisma migrate dev

# Seed the database (optional)
pnpm seed

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

For detailed setup instructions, see the [Setup Guide](docs/SETUP.md).

## Project Structure

```
kabale_id/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Shadcn UI components
│   │   └── ...             # Custom components
│   ├── routes/             # TanStack Router file-based routes
│   │   ├── admin/         # System admin routes
│   │   ├── citizen/       # Citizen routes
│   │   └── kabale/        # Kabale admin routes
│   ├── server/             # Server functions and business logic
│   │   ├── auth.ts        # Authentication functions
│   │   ├── citizen.ts     # Citizen-related functions
│   │   ├── kabales.ts     # Kabale-related functions
│   │   ├── system.ts      # System admin functions
│   │   └── rbac.ts        # Role-based access control
│   ├── lib/               # Utility functions and helpers
│   └── db.ts              # Prisma client configuration
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── generated/             # Generated Prisma client
└── docs/                  # Documentation
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Architecture](docs/ARCHITECTURE.md)** - System design, RBAC, data flows, and architecture diagrams
- **[Setup Guide](docs/SETUP.md)** - Installation, environment setup, and development configuration
- **[Database Schema](docs/DATABASE.md)** - Entity relationships, models, and schema documentation
- **[Authentication](docs/AUTHENTICATION.md)** - Auth flow, sessions, and security practices
- **[API Reference](docs/API.md)** - Server functions and endpoint documentation
- **[User Guides](docs/USER_GUIDES.md)** - User documentation for all roles
- **[Developer Guide](docs/DEVELOPER.md)** - Code structure, conventions, and development practices
- **[Deployment](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server on port 3000
pnpm dev:1            # Start dev server on port 3001
pnpm dev:2            # Start dev server on port 3002
pnpm load             # Start load balancer

# Build
pnpm build            # Build for production
pnpm preview          # Preview production build

# Database
pnpm prisma migrate dev    # Run migrations
pnpm prisma generate      # Generate Prisma client
pnpm seed                 # Seed database

# Code Quality
pnpm lint            # Lint code
pnpm format          # Format code
pnpm check           # Run lint and format checks

# Testing
pnpm test            # Run tests
```

## ID Application Lifecycle

1. **DRAFT** - Citizen creates an application but hasn't submitted it
2. **SUBMITTED** - Citizen submits the application for review
3. **PENDING_VERIFICATION** - Application is waiting for in-person verification
4. **APPROVED** - Application approved after verification, Digital ID issued
5. **REJECTED** - Application rejected after verification

## Digital ID States

- **ACTIVE** - Valid and active digital ID
- **REVOKED** - ID has been revoked by system admin
- **EXPIRED** - ID has expired (if expiration is configured)

## Role-Based Access Control

The system implements strict role-based access control:

- **SYSTEM_ADMIN**: Full system access, can manage all Kabales and users
- **KABALE_ADMIN**: Can only access and manage data for their assigned Kabale
- **CITIZEN**: Can only access their own profile and applications

For detailed information, see [Architecture Documentation](docs/ARCHITECTURE.md).

## Contributing

1. Follow the code style enforced by Biome
2. Use TypeScript strict mode
3. Follow the existing code structure and patterns
4. Write clear, readable code with appropriate comments
5. Ensure all server functions include proper authorization checks

## License

[Add your license information here]

## Support

For issues, questions, or contributions, please refer to the [Troubleshooting Guide](docs/TROUBLESHOOTING.md) or open an issue in the repository.
