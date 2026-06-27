# ManiCRM — Project Context

## What this is

A CRM for Ukrainian beauty salons and studios. Initially an internal tool for administrators and employees to manage scheduling; later extended with a public booking portal for clients.

Multi-tenancy is a first-class concern: users create **workspaces** and invite members with roles. An **admin** manages everything in the workspace; an **employee** manages only their own appointments.

## Monorepo layout

```
manicrm/
  apps/
    api/          # NestJS backend
    web/          # Vite + React frontend
  eslint.config.js
  lefthook.yml    # pre-commit: prettier + eslint (runs in parallel)
  pnpm-workspace.yaml
```

Package manager: **pnpm**. Run workspace commands from the repo root.

## Development commands

```bash
pnpm dev:api        # NestJS watch mode
pnpm dev:web        # Vite dev server
pnpm lint           # ESLint across all packages
pnpm lint:fix       # ESLint auto-fix
pnpm format         # Prettier write
pnpm format:check   # Prettier check (used in CI)
```

Run inside a specific app when the workspace filter isn't needed:

```bash
cd apps/api && pnpm start:dev
cd apps/web && pnpm dev
```

## Tech stack

### Frontend (`apps/web`)

| Concern        | Library                             |
| -------------- | ----------------------------------- |
| Build          | Vite                                |
| UI framework   | React 19                            |
| Routing        | react-router                        |
| Data fetching  | TanStack Query                      |
| HTTP client    | ky                                  |
| State (global) | Zustand (only if needed)            |
| Styling        | Tailwind CSS                        |
| Components     | shadcn/ui (built on Radix UI)       |
| Forms          | react-hook-form                     |
| i18n           | react-i18next (Ukrainian + English) |

**i18n notes:** Ukrainian is the primary locale; English is secondary. Translation keys live in `apps/web/src/locales/`. Never hardcode UI strings — always go through i18n keys.

### Backend (`apps/api`)

| Concern        | Library                    |
| -------------- | -------------------------- |
| Framework      | NestJS 11                  |
| Database       | PostgreSQL (via Docker)    |
| ORM            | Drizzle ORM                |
| Auth           | better-auth (Google OAuth) |
| Validation     | Zod                        |
| Infrastructure | docker-compose             |

**Auth notes:** better-auth issues **opaque session tokens**. The frontend stores the token in cookie and attaches it to every request.

## Domain model (MVP)

- **Workspace** — top-level tenant unit (a salon/studio)
- **WorkspaceMember** — join between user ↔ workspace, carries role (`admin` | `employee`)
- **Service** — a treatment offered by the workspace (e.g. gel manicure, pedicure)
- **Client** — a customer record scoped to a workspace
- **Booking** — an appointment linking a client, service, employee, and time slot

## MVP scope

- [ ] Google OAuth login via better-auth
- [ ] Workspace creation and management
- [ ] Workspace member management (invite, assign roles)
- [ ] Service CRUD within a workspace
- [ ] Client CRUD within a workspace
- [ ] Booking management (admin: all bookings; employee: own bookings only)

## Future plans (out of MVP scope — do not build yet)

- Budgeting, salary and revenue calculation
- Statistics (services, clients, visits)
- Public booking portal for clients
- Additional roles or permission granularity

## Conventions

### General

- TypeScript everywhere; no `any` unless there is no alternative and you document why.
- Zod schemas are the single source of truth for request/response shapes; derive TS types from them with `z.infer`.
- No comments unless the _why_ is non-obvious. Never describe what the code does.

### Backend (NestJS)

- One NestJS module per domain entity (e.g. `WorkspaceModule`, `BookingModule`).
- Controllers handle HTTP only — business logic lives in services.
- Drizzle schema files live in `apps/api/src/db/schema/`.
- Run migrations explicitly with Drizzle Kit; do not auto-migrate on startup.
- Guard all workspace-scoped routes with a `WorkspaceMemberGuard` that validates the caller is a member of the requested workspace. Enforce role checks with a separate `RolesGuard`.

### Frontend (React)

- Feature folders under `apps/web/src/features/<feature-name>/`.
- TanStack Query for all server state; do not duplicate server data in Zustand.
- shadcn/ui components live in `apps/web/src/components/ui/` (the default shadcn output path); do not modify them directly — compose or wrap them.
- All i18n strings via `useTranslation` hook; namespace matches the feature folder name.
- Forms use react-hook-form; pair with Zod via `@hookform/resolvers/zod` for schema-driven validation.

## Testing

Skipped for MVP. Add tests before going to production.

## Environment variables

- Backend config via NestJS `ConfigModule` reading from `.env` (gitignored).
- Frontend uses Vite's `import.meta.env` with `VITE_` prefix.
- Document all required vars in `.env.example` files in each app.

## Tips

- Feel free to update CLAUDE.md while iterating on the project to add new conventions, fix wrong assumptions, mark completed tasks etc.
