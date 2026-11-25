# Getting Started with IVY LMS

This guide will help you set up and run the IVY Learning Management System on your local machine.

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/downloads))

### Optional (for AI Grading feature)

- **Ollama** ([Download](https://ollama.ai))

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/DwaftPainter/IVY-LMS
cd ivy-lms
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies and automatically generate the Prisma client.

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then update the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ivy_lms"
DIRECT_URL="postgresql://username:password@localhost:5432/ivy_lms"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Auth0 (for Google OAuth)
AUTH0_SECRET="your-auth0-secret"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://dev-enb6***.us.auth0.com"
AUTH0_CLIENT_ID="your-auth0-client-id"
AUTH0_CLIENT_SECRET="your-auth0-client-secret"

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Ollama (for AI grading - optional)
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.2"
```

### 4. Set Up the Database

Create the database in PostgreSQL:

```bash
# Using psql
psql -U postgres -c "CREATE DATABASE ivy_lms;"
```

Run migrations to set up the schema:

```bash
npx prisma migrate dev
```

### 5. Seed the Database (Optional)

```bash
npx prisma db seed
```

---

## Running the Development Server

Start the development server with Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production with Turbopack |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma migrate dev` | Run migrations in development |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma db seed` | Run database seed |

---

## Verifying the Installation

After starting the development server:

1. **Homepage**: Visit `http://localhost:3000` - Should show the landing page
2. **Login**: Navigate to `/login` - Should display the login form
3. **Database**: Run `npx prisma studio` to verify database connection
4. **API**: Test an API endpoint at `/api/auth/me`

---

## Troubleshooting

### Database Connection Issues

**Problem**: `Error: Can't reach database server`

**Solution**:
- Verify PostgreSQL is running: `pg_ctl status`
- Check your `DATABASE_URL` format
- Ensure the database exists: `psql -U postgres -c "\l"`

### Prisma Client Issues

**Problem**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
npx prisma generate
```

### Port Already in Use

**Problem**: `Port 3000 is already in use`

**Solution**:
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
npm run dev -- --port 3001
```

### Environment Variables Not Loading

**Problem**: Environment variables are undefined

**Solution**:
- Ensure `.env` file is in the project root
- Restart the development server after changing `.env`
- Variable names must start with `NEXT_PUBLIC_` to be exposed to the browser

---

## Next Steps

- Read the [Architecture Guide](./architecture.md) to understand the system design
- Explore the [API Reference](./api-reference.md) for available endpoints
- Check [Authentication](./authentication.md) for auth flows
- Review [Database Schema](./database.md) for data models
