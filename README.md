# IVY LMS

A comprehensive Learning Management System built for IELTS preparation with AI-powered grading capabilities.

---

## Overview

IVY LMS is a full-featured learning management platform designed for educational institutions offering IELTS preparation courses. Built with modern web technologies, it supports multiple user roles (Admin, Teacher, Student) and provides specialized tools for IELTS skill development.

### Key Features

- **Multi-Role System**: Admin, Teacher, and Student portals
- **IELTS Skills**: Support for Listening, Reading, Writing, and Speaking
- **AI Grading**: Automated essay evaluation using local LLM (Ollama)
- **Assignment Management**: Create, submit, and grade assignments
- **Real-time Notifications**: In-app notification system
- **OAuth Integration**: Google login via Auth0
- **File Uploads**: Cloudinary integration for media storage

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| State | Zustand |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Auth | JWT (HTTP-only cookies) + Auth0 |
| AI | Ollama (local LLM) |
| Uploads | Cloudinary |

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [PostgreSQL](https://www.postgresql.org/) 14+
- [Git](https://git-scm.com/)

### Installation

```bash
# Clone repository
git clone https://github.com/DwaftPainter/IVY-LMS.git
cd IVY-LMS

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npx prisma migrate dev
npx prisma db seed  # Optional

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Documentation

Comprehensive documentation is available in the [`docs`](./docs) folder:

| Document | Description |
|----------|-------------|
| [Getting Started](./docs/getting-started.md) | Development setup guide |
| [Architecture](./docs/architecture.md) | System design and patterns |
| [API Reference](./docs/api-reference.md) | API endpoints documentation |
| [Database](./docs/database.md) | Schema and models reference |
| [Authentication](./docs/authentication.md) | Auth flows and security |
| [Deployment](./docs/deployment.md) | Production deployment guide |
| [Contributing](./docs/contributing.md) | Contribution guidelines |
| [Environment Variables](./docs/environment-variables.md) | Configuration reference |
| [AI Grading](./docs/ai-grading.md) | AI grading feature docs |

---

## Project Structure

```
ivy-lms/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (admin)/         # Admin routes (protected)
│   │   ├── (auth)/          # Auth pages (login, register)
│   │   ├── (student)/       # Student routes (protected)
│   │   ├── api/             # REST API routes
│   │   ├── teacher/         # Teacher routes (protected)
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Landing page
│   │
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── assignment/      # Assignment components
│   │   ├── grading/         # Grading components
│   │   └── layout/          # Layout components
│   │
│   ├── lib/                 # Utility libraries
│   ├── store/               # Zustand stores
│   ├── config/              # Configuration files
│   ├── hooks/               # Custom React hooks
│   ├── enums/               # Application enums
│   ├── types/               # TypeScript types
│   ├── constants/           # App constants
│   └── providers/           # React context providers
│
├── prisma/                  # Database schema and migrations
├── docs/                    # Documentation
├── public/                  # Static assets
└── ...config files
```

---

## Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Production
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma migrate dev  # Run migrations
npx prisma db seed      # Seed database
npx prisma studio       # Open database GUI

# Linting
npm run lint            # Run ESLint
```

---

## Authentication

IVY LMS uses JWT-based authentication with HTTP-only cookies:

- **Local Auth**: Email/password with bcrypt hashing
- **OAuth**: Google sign-in via Auth0
- **Security**: Account lockout after 5 failed attempts

Role-based redirects after login:
- Admin -> `/admin`
- Teacher -> `/teacher`
- Student -> `/dashboard`

See [Authentication Guide](./docs/authentication.md) for details.

---

## AI Grading

IVY LMS integrates with Ollama for automated IELTS Writing assessment:

- **Supported Tasks**: Writing Task 1 and Task 2
- **Scoring**: IELTS band score (0-9)
- **Feedback**: Detailed criteria-based evaluation
- **Language**: Vietnamese feedback
- **Corrections**: Inline error highlighting

Setup:
```bash
# Install Ollama
ollama pull llama3.2
ollama serve
```

See [AI Grading Documentation](./docs/ai-grading.md) for setup and usage.

---

## Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

### Docker

```bash
docker-compose up -d
```

See [Deployment Guide](./docs/deployment.md) for detailed instructions.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "feat: add feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

See [Contributing Guide](./docs/contributing.md) for guidelines.

---

## License

Private - All rights reserved.

---

## Maintainer

**Nghiêm Thành Công**

- Full-Stack Developer
- Next.js - PostgreSQL - Prisma - System Architecture

---

## Support

For questions or issues:

- Check the [documentation](./docs)
- Review [troubleshooting](./docs/getting-started.md#troubleshooting)
- Contact the maintainer
