# Authentication Guide

Complete guide to the authentication system in IVY LMS.

---

## Overview

IVY LMS implements a secure authentication system with two methods:

1. **JWT-based Authentication** - Email/password login with HTTP-only cookies
2. **OAuth (Google)** - Auth0 integration for Google sign-in

---

## Authentication Flow

### JWT Authentication Flow

```
┌─────────┐                    ┌─────────────┐                    ┌──────────┐
│  User   │─── Login Request ─▶│  /api/auth/ │─── Validate ──────▶│  bcrypt  │
│         │                    │   login     │      Credentials    │  Compare │
└─────────┘                    └──────┬──────┘                    └────┬─────┘
                                      │                                  │
                                      │◀─ Password Valid ────────────────┤
                                      │
                                      │ Generate JWT
                                      ▼
                               ┌──────────────┐
                               │ HTTP-only    │
                               │ Cookie Set   │
                               └──────┬───────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │   Redirect   │
                               │   by Role    │
                               └──────────────┘
```

### OAuth Flow (Google)

```
┌─────────┐          ┌──────────┐          ┌─────────┐          ┌─────────────┐
│  User   │───Click──▶│  Auth0   │───OAuth──▶│ Google  │───Auth──▶│  /api/auth/ │
│         │  Google   │  Login   │  Flow    │ Sign-in │ Success │   google    │
└─────────┘          └──────────┘          └─────────┘          └─────────────┘
                                                                            │
                                                                            ▼
                                                                      ┌──────────┐
                                                                      │ Create/ │
                                                                      │ Update  │
                                                                      │  User   │
                                                                      └────┬─────┘
                                                                           │
                                                                           ▼
                                                                      ┌──────────┐
                                                                      │ JWT Set │
                                                                      │ Cookie  │
                                                                      └──────────┘
```

---

## JWT Implementation

### Token Storage

JWT tokens are stored in **HTTP-only cookies** to prevent XSS attacks:

```http
Set-Cookie: token=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400
```

### Token Configuration

```typescript
// Cookie settings
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24, // 24 hours
  path: '/'
};
```

### Token Payload

```typescript
interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
}
```

---

## Protected Routes

### Middleware Protection

Routes are protected by role-based middleware:

```typescript
// src/middleware.ts or route level
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  const payload = await verifyToken(token);
  
  // Check role access
  if (!hasRequiredRole(payload.role, requiredRole)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  return NextResponse.next();
}
```

### Route Groups

| Route Group | Access | Middleware |
|-------------|--------|------------|
| `(auth)/*` | Public | Redirect if authenticated |
| `(student)/*` | Students only | JWT + role check |
| `teacher/*` | Teachers only | JWT + role check |
| `(admin)/*` | Admins only | JWT + role check |

---

## Role-Based Access Control (RBAC)

### Role Hierarchy

```
ADMIN
├── Can access all routes
├── Manage users
├── Manage courses
└── View all data

TEACHER
├── Access teacher routes
├── Create assignments
├── Grade submissions
└── View enrolled students

STUDENT
├── Access student routes
├── View assignments
├── Submit work
└── View own grades
```

### Role Redirect Map

After login, users are redirected based on role:

```typescript
// src/config/auth/role-map.ts
export const redirectMap = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/dashboard'
};
```

---

## Security Features

### 1. Account Lockout

After 5 failed login attempts, account is locked:

```typescript
// src/constants/auth.ts
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MINUTES = 30;
```

### 2. Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

### 3. Password Hashing

bcrypt with 10 rounds:

```typescript
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 4. CSRF Protection

- SameSite cookie attribute
- CSRF tokens for state-changing operations (if needed)

---

## Client-Side Auth

### Auth Store (Zustand)

```typescript
// src/store/auth.store.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      // ... methods
    }),
    { name: 'ivy-auth-storage' }
  )
);
```

### Usage in Components

```typescript
import { useAuthStore } from '@/store/auth.store';

function Dashboard() {
  const { user, isAuthenticated, logout } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## API Authentication

### Verifying Tokens in API Routes

```typescript
// src/lib/auth.ts
import jwt from 'jsonwebtoken';

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
}

export async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
```

### Protected API Route Example

```typescript
// src/app/api/protected/route.ts
import { getAuthUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Process request...
}
```

---

## Auth0 Integration

### Configuration

```typescript
// src/providers/AuthProvider.tsx
import { Auth0Provider } from '@auth0/auth0-react';

export function AuthProvider({ children }) {
  return (
    <Auth0Provider
      domain="dev-enb6***.us.auth0.com"
      clientId="your-client-id"
      authorizationParams={{
        redirect_uri: typeof window !== 'undefined' ? window.location.origin : ''
      }}
    >
      {children}
    </Auth0Provider>
  );
}
```

### Google Login Flow

```typescript
// Using Auth0 React SDK
import { useAuth0 } from '@auth0/auth0-react';

function GoogleLoginButton() {
  const { loginWithRedirect } = useAuth0();
  
  return (
    <button onClick={() => loginWithRedirect({ connection: 'google-oauth2' })}>
      Sign in with Google
    </button>
  );
}
```

---

## Session Management

### Session Duration

- **JWT Token**: 24 hours
- **Cookie**: Session or 24 hours

### Refresh Strategy

Currently, tokens are refreshed on page load via `/api/auth/me`:

```typescript
// In useEffect on app mount
useEffect(() => {
  fetchMe(); // Validates token and updates user state
}, []);
```

---

## Logout

### Logout Flow

1. Clear HTTP-only cookie (server-side)
2. Clear client state (Zustand)
3. Redirect to login page

```typescript
// src/app/api/auth/logout/route.ts
export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear cookie
  response.cookies.set('token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/'
  });
  
  return response;
}
```

---

## Testing Authentication

### Test Credentials (Development)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ivy.edu | admin123 |
| Teacher | teacher@ivy.edu | teacher123 |
| Student | student@ivy.edu | student123 |

> **Note**: Change these before deploying to production.

---

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**
   - Check token expiration
   - Verify JWT_SECRET matches
   - Clear cookies and re-login

2. **OAuth redirect issues**
   - Verify Auth0 configuration
   - Check allowed callback URLs
   - Ensure HTTPS in production

3. **CORS errors**
   - Configure allowed origins
   - Check cookie SameSite settings
