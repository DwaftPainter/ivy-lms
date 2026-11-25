# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IVY LMS is a Learning Management System built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4. It uses PostgreSQL with Prisma ORM and JWT-based authentication.

## Common Commands

```bash
# Development (uses Turbopack)
pnpm dev

# Production build (uses Turbopack)
pnpm build

# Start production server
pnpm start

# Lint (ESLint with strict rules)
pnpm lint

# Database commands
pnpm dlx prisma migrate dev      # Run migrations in development
pnpm dlx prisma migrate deploy   # Run migrations in production
pnpm dlx prisma generate         # Generate Prisma client (runs automatically on postinstall)
pnpm dlx prisma studio           # Open database GUI
pnpm dlx prisma db seed          # Run database seed
```

## Architecture

### Stack
- **Framework**: Next.js 16 with App Router
- **Build Tool**: Turbopack (configured in both dev and build)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM (client generated to `src/generated/prisma`)
- **State Management**: Zustand with persistence
- **Authentication**: JWT tokens in HTTP-only cookies + Auth0 for Google OAuth
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner toast notifications

### Project Structure

```
src/
├── app/
│   ├── (admin)/          # Admin route group (RBAC protected)
│   ├── (auth)/           # Auth pages (login, register) - redirects if authenticated
│   ├── (student)/        # Student route group
│   ├── teacher/          # Teacher route group
│   └── api/              # API routes (RESTful)
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components (sidebar, header)
│   └── [feature]/         # Feature-specific components
├── lib/
│   ├── prisma.ts         # Extended Prisma client with bcrypt for passwords
│   ├── api-fetch.ts      # Client-side fetch wrapper
│   └── swagger.ts        # API documentation setup
├── store/
│   └── [feature].store.ts   # Zustand stores (auth.store.ts is primary)
├── config/
│   ├── message.ts        # Centralized user-facing messages
│   ├── auth/role-map.ts  # Role-based redirect map
│   └── [role]/side-bar-config.ts  # Navigation configs
├── enums/                # Application enums
├── types/                # Shared TypeScript types
├── constants/            # App constants (MAX_ATTEMPT, etc.)
├── providers/            # React context providers (AuthProvider with Auth0)
└── generated/prisma/     # Generated Prisma client
```

### Authentication Flow

1. **Login**: POST to `/api/auth/login` → JWT token set in HTTP-only cookie → redirect based on `redirectMap` in role
2. **Session**: Token validated via `/api/auth/me` (called by `useAuthStore.fetchMe()`)
3. **Logout**: POST to `/api/auth/logout` → clears cookie and storage
4. **Google OAuth**: Auth0 React SDK → POST user data to `/api/auth/google`

### API Patterns

- All API routes use standard Next.js Route Handlers (`route.ts` with `GET`, `POST`, etc.)
- JWT middleware validates tokens in cookies
- Standard response format: `{ success: boolean, message: string, data: T, timestamp: Date }`
- Error responses use `http-status-codes` package with descriptive codes
- Swagger documentation available via JSDoc comments

### State Management Pattern (Zustand)

```typescript
// Stores use persistence for auth state
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({ ... }),
        { name: "ivy-auth-storage", partialize: ... }
    )
);
```

### Database Patterns

- Extended Prisma client with automatic password hashing in `src/lib/prisma.ts`
- Uses `@prisma/adapter-pg` for PostgreSQL connection
- Enums defined in schema and imported from `@/generated/prisma/enums`
- Schema uses soft delete patterns via `isActive` flags

## ESLint Configuration

Strict rules configured in `eslint.config.mjs`:
- `@typescript-eslint/no-unused-vars`: Error (allowed: `_` prefix for ignored vars)
- `no-console`: Error
- `eqeqeq`: Error (strict equality required)

## Important Configuration

- **Prisma**: Client generates to `src/generated/prisma` (not node_modules)
- **Next.js**: React Compiler enabled, SVG support via `@svgr/webpack`
- **Tailwind**: v4 with PostCSS integration
- **Auth0**: Hardcoded credentials in `AuthProvider.tsx` (domain: `dev-enb6***.us.auth0.com`)

## Role-Based Routing

After login, users are redirected based on role (see `src/config/auth/role-map.ts`):
- `ADMIN` → `/admin`
- `TEACHER` → `/teacher`
- `STUDENT` → `/dashboard` (inside `(student)` route group)

## Security Features

- JWT in HTTP-only cookies
- Account lockout after 5 failed attempts (`MAX_ATTEMPT` constant)
- Password hashing with bcrypt (10 rounds)
- Auth provider tracking (LOCAL vs GOOGLE)
