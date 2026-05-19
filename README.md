# Yoga Studio Management System

A full-stack web application for managing yoga studio operations, including session scheduling, teacher management, and user registrations.

## Tech Stack

### Backend

- Node.js 22 LTS
- Express.js 4.x
- TypeScript 5.4+ (Strict Mode)
- Prisma ORM
- PostgreSQL 16
- Zod (validation)
- JWT (authentication)
- bcrypt (password hashing)

### Frontend

- React 19 (Hooks only)
- TypeScript 5.9+ (Strict Mode)
- Vite 7.x
- TailwindCSS 4.x
- React Router 6.x
- Axios

### Testing

- **Backend** : Vitest + Supertest
- **Frontend** : Vitest + React Testing Library
- **E2E** : Cypress

### Infrastructure

- Docker + Docker Compose
- PostgreSQL container

## Features

### Authentication

- User registration
- User login with JWT tokens

### Sessions Management

- List all yoga sessions
- View session details
- Create new sessions (admin only)
- Update sessions (admin only)
- Delete sessions (admin only)
- Join/leave sessions (regular users)

### Teachers

- View list of teachers
- View teacher details

### User Profile

- View user profile
- Delete user account

## Prerequisites

- Node.js 22 LTS or higher
- Docker and Docker Compose
- npm

## Installation

### 1. Clone the repository

```bash
cd p4-dfsjs
```

### 2. Install all dependencies

```bash
npm run install:all
```

### 3. Set up environment variables

```bash
cd backend
cp .env.example .env
```

Default configuration:

```env
DATABASE_URL="postgresql://yogauser:yogapass@localhost:5432/yogastudio"
JWT_SECRET="your-secret-key-change-me-in-production"
PORT=8080
NODE_ENV=development
```

### 4. Start PostgreSQL with Docker

From the project root:

```bash
npm run docker
```

### 5. Run database migrations

```bash
cd backend
npm run prisma:migrate
```

### 6. Seed the database

```bash
npm run prisma:seed
```

This creates:

- 1 admin user: `yoga@studio.com` / `test!1234`
- 1 regular user: `user@test.com` / `test!1234`
- 3 teachers
- 4 yoga sessions

## Running the Application

### Start backend + frontend simultaneously (from project root)

```bash
npm run dev
```

Or separately:

```bash
# Terminal 1 — backend (http://localhost:8080)
cd backend && npm run dev

# Terminal 2 — frontend (http://localhost:3000)
cd frontend && npm run dev
```

## Default Credentials

| Role  | Email             | Password    |
| ----- | ----------------- | ----------- |
| Admin | `yoga@studio.com` | `test!1234` |
| User  | `user@test.com`   | `test!1234` |

## Testing

### Backend — Unit & Integration tests

Tests are located in `backend/src/tests/`.

- **Unit tests** : service tests (auth, sessions, teacher, user)
- **Integration tests** : controller tests via Supertest (auth, sessions, teachers, users)

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Coverage thresholds (configured in `vitest.config.ts`):

| Indicator  | Threshold | Result |
| ---------- | --------- | ------ |
| Statements | 80%       | 98.44% |
| Branches   | 80%       | 90.83% |
| Functions  | 80%       | 97.67% |
| Lines      | 80%       | 98.73% |

### Frontend — Unit & Integration tests

Tests are located in `frontend/src/tests/`.

- **Unit tests** : component tests (Login, Register, Navbar, Sessions, SessionDetail, SessionForm, Profile)
- **Integration tests** : service tests (auth service)

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Coverage thresholds (configured in `vite.config.ts`):

| Indicator  | Threshold | Result |
| ---------- | --------- | ------ |
| Statements | 80%       | 86.52% |
| Branches   | 80%       | 82.29% |
| Functions  | 80%       | 80.00% |
| Lines      | 80%       | 86.52% |

### E2E tests — Cypress

E2E tests are located in `frontend/cypress/e2e/`.

**Prerequisites:** backend and frontend must be running before launching Cypress.

```bash
# Start backend + frontend (from project root)
npm run dev

# Then, in another terminal:
cd frontend

# Interactive mode (Cypress UI)
npm run cypress:open

# Headless mode (CI)
npm run cypress:run
```

Tests cover all screens:

| File                            | Scenarios                                                  |
| ------------------------------- | ---------------------------------------------------------- |
| `auth/login.cy.ts`              | Successful login, wrong password, wrong email              |
| `auth/logout.cy.ts`             | Logout and redirect                                        |
| `auth/register.cy.ts`           | Successful registration, existing email                    |
| `sessions/sessions.cy.ts`       | Redirect if not authenticated, list display, admin actions |
| `sessions/session-detail.cy.ts` | Detail display, join/leave (user), edit/delete (admin)     |
| `sessions/session-form.cy.ts`   | Non-admin redirect, create, edit, delete                   |
| `profile/profile.cy.ts`         | Profile display, account type, account deletion            |

Credentials used by E2E tests are stored in `frontend/cypress.env.json` (not committed to git).

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Sessions

- `GET /api/session` - Get all sessions (protected)
- `GET /api/session/:id` - Get session by ID (protected)
- `POST /api/session` - Create session (admin only)
- `PUT /api/session/:id` - Update session (admin only)
- `DELETE /api/session/:id` - Delete session (admin only)
- `POST /api/session/:id/participate/:userId` - Join session (protected)
- `DELETE /api/session/:id/participate/:userId` - Leave session (protected)

### Teachers

- `GET /api/teacher` - Get all teachers (protected)
- `GET /api/teacher/:id` - Get teacher by ID (protected)

### Users

- `GET /api/user/:id` - Get user by ID (protected)
- `DELETE /api/user/:id` - Delete user account (protected)
- `POST /api/user/promote-admin` - Promote user to admin (dev only)

## Project Structure

```
p4-dfsjs/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Auth middleware
│   │   ├── dto/              # Zod validation schemas
│   │   ├── utils/            # JWT utilities
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Data access layer
│   │   └── app.ts            # Express app setup
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Database seeding
│   └── vitest.config.ts      # Test + coverage config
├── frontend/
│   ├── src/
│   │   ├── pages/            # React page components
│   │   ├── components/       # Reusable components
│   │   ├── services/         # API services
│   │   ├── types/            # TypeScript types
│   │   └── tests/            # Vitest + RTL tests
│   ├── cypress/
│   │   ├── e2e/              # Cypress E2E tests
│   │   └── support/          # Custom commands
│   └── vite.config.ts        # Test + coverage config
├── docker-compose.yml
└── README.md
```

## Development Scripts (project root)

```bash
npm run dev            # Start backend + frontend simultaneously
npm run docker         # Start PostgreSQL container
npm run docker:down    # Stop PostgreSQL container
npm run docker:reset   # Reset PostgreSQL container (deletes data)
npm run install:all    # Install all dependencies
```

## Troubleshooting

### Database connection issues

```bash
# Check if PostgreSQL is running
docker ps

# Restart PostgreSQL
npm run docker:down && npm run docker

# View logs
docker compose logs postgres
```

### Recreate database from scratch

```bash
npm run docker:reset
cd backend
npm run prisma:migrate
npm run prisma:seed
```

### Port already in use

```bash
# Check what's using port 8080
lsof -i :8080

# Check what's using port 3000
lsof -i :3000

kill -9 <PID>
```

### Prisma issues

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

## License

MIT
