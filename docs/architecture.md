# IVY LMS Architecture

This document describes the architecture and design patterns used in IVY LMS.

---

## System Overview

IVY LMS follows a modern full-stack architecture using Next.js App Router with a layered design approach.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Browser    │  │   Browser    │  │   Browser    │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
└─────────┼──────────────────┼──────────────────┼────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js App Router                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Server Components (RSC)                  │ │
│  │  - Initial render                                     │ │
│  │  - Data fetching                                      │ │
│  │  - SEO optimization                                   │ │
│  └──────────────────────────────────────────────────────┘ │
│                          │                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Client Components (RCC)                  │ │
│  │  - Interactivity                                        │ │
│  │  - State management                                     │ │
│  │  - Browser APIs                                         │ │
│  └──────────────────────────────────────────────────────┘ │
│                          │                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              API Routes (REST)                        │ │
│  │  - /api/* endpoints                                   │ │
│  │  - JWT authentication                                 │ │
│  │  - Business logic                                     │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Service Layer (Business Logic)                │
│  - Data transformation                                      │
│  - Validation                                               │
│  - External service integration                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Prisma ORM                               │   │
│  │  - Type-safe queries                                  │   │
│  │  - Migration management                               │   │
│  │  - Relation handling                                  │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              PostgreSQL                               │   │
│  │  - Relational data storage                            │   │
│  │  - ACID transactions                                  │   │
│  │  - JSON support for flexible data                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Core Framework
- **Next.js 16** - React framework with App Router
- **React 19** - UI library with Server Components
- **TypeScript 5** - Type-safe JavaScript

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Accessible UI components
- **Radix UI** - Headless UI primitives

### Database & ORM
- **PostgreSQL** - Relational database
- **Prisma ORM** - Type-safe database client
- **@prisma/adapter-pg** - PostgreSQL adapter

### State Management
- **Zustand** - Lightweight state management
- **React Hook Form** - Form state management
- **Immer** - Immutable state updates

### Authentication
- **JWT** - JSON Web Tokens (HTTP-only cookies)
- **Auth0** - OAuth provider for Google login
- **bcrypt** - Password hashing

### External Services
- **Cloudinary** - File/image uploads
- **Ollama** - AI grading for IELTS writing
- **Sonner** - Toast notifications

### Development Tools
- **Turbopack** - Fast bundler (dev & build)
- **ESLint** - Code linting
- **React Compiler** - Performance optimization

---

## Project Structure

```
ivy-lms/
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (admin)/            # Admin route group (RBAC protected)
│   │   │   ├── dashboard/
│   │   │   ├── courses/
│   │   │   └── users/
│   │   ├── (auth)/             # Auth pages (public, redirects if authenticated)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (student)/          # Student route group
│   │   │   └── dashboard/
│   │   ├── teacher/            # Teacher route group
│   │   │   ├── dashboard/
│   │   │   ├── assignments/
│   │   │   └── grade/
│   │   ├── api/                # REST API routes
│   │   ├── assignments/        # Public assignment routes
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css         # Global styles
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Layout components (sidebar, header)
│   │   ├── assignment/         # Assignment-specific components
│   │   ├── grading/            # Grading components
│   │   └── [feature]/          # Other feature components
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── prisma.ts           # Extended Prisma client
│   │   ├── api-fetch.ts        # Client-side fetch wrapper
│   │   └── swagger.ts          # API documentation setup
│   │
│   ├── store/                  # Zustand stores
│   │   ├── auth.store.ts
│   │   └── assignment-session.store.ts
│   │
│   ├── config/                 # Configuration files
│   │   ├── message.ts          # User-facing messages
│   │   ├── auth/role-map.ts   # Role-based redirects
│   │   └── [role]/side-bar-config.ts  # Navigation configs
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── enums/                  # Application enums
│   ├── types/                  # TypeScript type definitions
│   ├── constants/              # App constants
│   ├── providers/              # React context providers
│   └── generated/prisma/       # Generated Prisma client
│
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/             # Database migrations
│   └── seed.ts                # Seed data
│
├── public/                     # Static assets
├── docs/                       # Documentation
├── .env                        # Environment variables
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── eslint.config.mjs          # ESLint configuration
└── package.json               # Dependencies
```

---

## Architectural Patterns

### 1. Route Groups

Next.js App Router route groups for organizing related routes:

```
(app)/             # Shared layout for app pages
(auth)/            # Auth layout (centered, minimal)
(admin)/           # Admin layout (RBAC protected)
(student)/         # Student layout (role-based)
```

### 2. Component Architecture

Components are organized by function:

- **UI Components** (`components/ui/*`) - Reusable, unstyled primitives
- **Layout Components** (`components/layout/*`) - Page structure
- **Feature Components** (`components/[feature]/*`) - Domain-specific

### 3. State Management

Zustand stores with persistence for auth state:

```typescript
// Pattern: create store with persistence
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({ ... }),
        { name: "ivy-auth-storage", partialize: ... }
    )
);
```

### 4. API Patterns

Standardized API response format:

```typescript
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: Date;
}
```

### 5. Database Access

Extended Prisma client with middleware:

```typescript
// src/lib/prisma.ts
const prisma = new PrismaClient({...})
    .$extends({
        model: {
            user: {
                // Custom methods
            }
        }
    });
```

---

## Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────▶│ Login Page  │────▶│  API Route  │────▶│   Prisma    │
│             │     │             │     │ /api/auth/  │     │   Database   │
└─────────────┘     └─────────────┘     └──────┬──────┘     └──────┬──────┘
                                               │                    │
                                               ▼                    │
                                        ┌─────────────┐             │
                                        │   bcrypt    │─────────────│
                                        │  Compare    │             │
                                        └─────────────┘             │
                                               │                    │
                                               ▼                    │
                                        ┌─────────────┐             │
                                        │ JWT Token   │◀────────────│
                                        │ Generation  │             │
                                        └──────┬──────┘             │
                                               │                    │
                                               ▼                    │
                                        ┌─────────────┐             │
                                        │ HTTP-only   │             │
                                        │   Cookie    │             │
                                        └──────┬──────┘             │
                                               │                    │
                                               ▼                    │
                                        ┌─────────────┐             │
                                        │   Redirect   │             │
                                        │  by Role     │             │
                                        └─────────────┘             │
```

### Role-Based Redirects

After login, users are redirected based on role:

| Role | Redirect URL |
|------|--------------|
| ADMIN | `/admin` |
| TEACHER | `/teacher` |
| STUDENT | `/dashboard` |

Configured in `src/config/auth/role-map.ts`.

---

## Security Considerations

1. **JWT in HTTP-only cookies** - Prevents XSS token theft
2. **bcrypt password hashing** - 10 rounds for security
3. **Account lockout** - After 5 failed attempts
4. **CORS configuration** - Restricted to allowed origins
5. **Input validation** - Zod schemas for all inputs
6. **RBAC middleware** - Role-based route protection

---

## Performance Optimizations

1. **Turbopack** - Fast bundling for dev and production
2. **Server Components** - Reduce client-side JavaScript
3. **Prisma Connection Pooling** - Efficient database connections
4. **Image Optimization** - Next.js Image component
5. **React Compiler** - Automatic memoization

---

## Scalability Considerations

- **Microservice-ready** - Service layer abstraction
- **Database normalization** - Supports complex queries
- **Edge-ready** - API routes compatible with edge functions
- **Modular architecture** - Easy to extract services
