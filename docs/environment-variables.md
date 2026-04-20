# Environment Variables Reference

Complete reference for all environment variables used in IVY LMS.

---

## Required Variables

### Database

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/ivy_lms` |
| `DIRECT_URL` | Direct database URL (for migrations) | `postgresql://user:pass@localhost:5432/ivy_lms` |

### Authentication

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | `super-secret-key-32-chars-long!` |
| `NEXT_PUBLIC_APP_URL` | Public app URL | `http://localhost:3000` |

---

## Auth0 Configuration (OAuth)

| Variable | Description | Example |
|----------|-------------|---------|
| `AUTH0_SECRET` | Auth0 application secret | `random-secret-string` |
| `AUTH0_BASE_URL` | Base URL of the app | `http://localhost:3000` |
| `AUTH0_ISSUER_BASE_URL` | Auth0 domain | `https://dev-xxx.us.auth0.com` |
| `AUTH0_CLIENT_ID` | Auth0 client ID | `abc123...` |
| `AUTH0_CLIENT_SECRET` | Auth0 client secret | `xyz789...` |

---

## Cloudinary (File Uploads)

| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `ivy-lms` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `secret-key` |

---

## Ollama (AI Grading - Optional)

| Variable | Description | Default |
|----------|-------------|---------|
| `OLLAMA_URL` | Ollama server URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | Model to use for grading | `llama3.2` |

---

## Development Variables

| Variable | Description | Values |
|----------|-------------|--------|
| `NODE_ENV` | Environment mode | `development`, `production`, `test` |
| `NEXT_TELEMETRY_DISABLED` | Disable Next.js telemetry | `1` |

---

## Complete .env.example

```env
# ============================================================================
# DATABASE
# ============================================================================
DATABASE_URL="postgresql://user:password@localhost:5432/ivy_lms"
DIRECT_URL="postgresql://user:password@localhost:5432/ivy_lms"

# ============================================================================
# AUTHENTICATION
# ============================================================================
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ============================================================================
# AUTH0 (Google OAuth)
# ============================================================================
AUTH0_SECRET="use [openssl rand -hex 32] to generate"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://your-domain.us.auth0.com"
AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret"

# ============================================================================
# CLOUDINARY (File Uploads)
# ============================================================================
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# ============================================================================
# OLLAMA (AI Grading - Optional)
# ============================================================================
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.2"

# ============================================================================
# DEVELOPMENT
# ============================================================================
NODE_ENV="development"
NEXT_TELEMETRY_DISABLED="1"
```

---

## Security Notes

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use strong secrets** - Generate with `openssl rand -hex 32`
3. **Rotate credentials** - Change periodically
4. **Use different values** - Per environment (dev/staging/prod)
5. **Limit access** - Only share with team members who need it

---

## Generating Secrets

### JWT Secret

```bash
# Generate secure random string
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Auth0 Secret

```bash
openssl rand -hex 32
```

---

## Environment-Specific Values

### Development

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH0_BASE_URL=http://localhost:3000
```

### Production

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
AUTH0_BASE_URL=https://your-domain.com
DATABASE_URL=postgresql://... # Use production database
```

### Testing

```env
NODE_ENV=test
DATABASE_URL=postgresql://user:pass@localhost:5432/ivy_lms_test
JWT_SECRET=test-secret-key-32-chars-long
```
