# IVY English LMS

Unified multi-program Learning Management System built with a modern **full-stack web architecture** designed for scalability, performance, and rapid iteration.

---

## Tech Stack

### Frontend
- **Next.js (React)**
  - App Router
  - Server Components
  - SSR / SSG support
- **TypeScript**
- **Tailwind CSS**

### Backend
- **Next.js Route Handlers / API Routes**
  - RESTful API architecture
  - Middleware-based authentication & authorization

### Database
- **PostgreSQL**
  - Relational schema supporting multi-program enrollment
  - Optimized indexing for scheduling and academic queries

### ORM
- **Prisma ORM**
  - Type-safe queries
  - Migration system
  - Relation modeling

### Notifications
- Email notification service
- Zalo integration (planned)

### DevOps / Tooling
- GitHub
- Environment management via `.env`
- ESLint + Prettier
- CI/CD pipeline (planned)

---

## System Architecture

```
Client (Next.js Frontend)
         ↓
Next.js API Routes / Route Handlers
         ↓
Service Layer (Business Logic)
         ↓
Prisma ORM
         ↓
PostgreSQL Database
         ↓
External Services (Notification APIs)
```

---

## Core Technical Modules

- Authentication & RBAC (Role-based access control)
- Student / Teacher / Admin APIs
- Course & Program Management
- Schedule Management Engine
- Assignment Submission System
- Session-based Feedback Service
- Notification Service
- Analytics & Reporting APIs

---

## Project Structure

```
ivy-lms/
│
├── app/              # Next.js App Router
├── components/       # Reusable UI components
├── modules/          # Domain modules (student, course, schedule)
├── lib/
│   ├── prisma/       # Prisma client
│   ├── auth/         # Authentication utilities
│   └── services/     # Business logic layer
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── styles/
├── .env
└── package.json
```

---

## Getting Started

### 1. Clone repository

```bash
git clone https://github.com/your-org/ivy-lms.git
cd ivy-lms
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ivy_lms
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Run database migration

```bash
npx prisma migrate dev
```

### 5. Start development server

```bash
npm run dev
```

---

## Scripts

```bash
npm run dev          # start dev server
npm run build        # production build
npm run start        # start production server
npm run lint         # lint code
npx prisma studio    # database GUI
```

---

## Scalability Design

- Modular domain-driven architecture
- Service-layer abstraction for microservice-ready migration
- Database normalization supporting multi-program enrollment
- Server Components to reduce frontend bundle size
- Edge-ready API routes

---

## Future Technical Roadmap

- Microservice extraction (notification & analytics)
- Redis caching layer
- Queue system (BullMQ / Kafka)
- Multi-tenant architecture
- Mobile API gateway
- Real-time classroom features via WebSocket

---

## Maintainer

**Nghiêm Thành Công**  
Full-Stack Developer  
Next.js • PostgreSQL • Prisma • System Architecture