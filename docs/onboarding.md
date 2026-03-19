# ApproveFlow — Developer Onboarding

Welcome to ApproveFlow. This guide explains how the project is organized,
what each part does, and how to add new features correctly.

---

## What is ApproveFlow?

A SaaS for freelancers to send files to clients and collect approvals or
change requests — all through a shareable link, without the client creating
an account.

**Core flow:**
1. Freelancer creates a **Project** (client name, email)
2. Freelancer uploads a file → a **Delivery** is created with a unique review token
3. A link like `approveflow.app/review/{token}` is shared with the client
4. Client views the file, leaves comments, clicks **Approve** or **Request Changes**
5. Freelancer sees the status update live in their dashboard

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Fill in all values (see "Environment Variables" below)

# 3. Apply database migrations
npx prisma migrate dev

# 4. Seed plans (Free / Pro / Studio)
npm run db:seed

# 5. Start dev server
npm run dev
```

Open http://localhost:3000.

**Other useful commands:**

| Command | Purpose |
|---|---|
| `npm run build` | Production build |
| `npx tsc --noEmit` | TypeScript type check |
| `npm run lint` | ESLint |
| `npx prisma studio` | Visual DB browser |

---

## Environment Variables

```env
# Database (PostgreSQL)
DATABASE_URL=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Supabase (file storage)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_BUCKET=deliveries

# Stripe (billing)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRO_PRICE_ID=

# Resend (transactional email)
RESEND_API_KEY=
RESEND_FROM=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Project Structure Overview

```
app/           → Next.js App Router — routing only, no business logic
components/    → Shared UI components (design system + layout)
features/      → Domain modules (to be built out — see architecture-migration.md)
lib/           → Infrastructure clients (Prisma, Supabase, tokens, utils)
prisma/        → DB schema and migrations
types/         → Global TypeScript types
docs/          → Architecture and onboarding docs
```

### The `app/` directory

`app/` contains only **routing, layouts, and page composition**.
Pages call server-side queries directly (Prisma), then pass data down to
`*Client.tsx` components for interactivity.

| Path | What it does |
|---|---|
| `app/(auth)/login/` | Login page |
| `app/(dashboard)/dashboard/` | Main dashboard (projects list + stats) |
| `app/(dashboard)/dashboard/billing/` | Billing / plan management |
| `app/(dashboard)/dashboard/projects/[id]/` | Single project detail |
| `app/review/[token]/` | Public review page (no auth required) |
| `app/r/[token]/` | Short-link redirect to `/review/{token}` |
| `app/api/` | REST API routes (see below) |
| `app/page.tsx` | Landing page |
| `app/client-approval-tool/`, `app/pt/*/` | SEO landing pages |

### `*PageClient.tsx` files

Pages that need client-side state use the pattern:

```
page.tsx             ← async Server Component — fetches data, passes as props
DashboardPageClient.tsx  ← "use client" — handles state, events, real-time
```

The `page.tsx` never contains `useState` or `useEffect`.
The `*Client.tsx` never does database queries.

### The `app/api/` directory

API routes are used for:
- **Webhooks** (Stripe `POST /api/billing/webhook/stripe`)
- **Actions that don't need a full page** (approve, comment, view tracking)
- **Data endpoints for real-time updates** (`GET /api/projects/[id]`)

See [When to use Server Actions vs API Routes](#server-actions-vs-api-routes).

### `components/ui/`

Shared design-system components. These have **no business logic**.

| Component | Variants |
|---|---|
| `Button` | `primary` \| `secondary` \| `ghost` \| `outline` \| `danger` |
| `Card` | `default` \| `glass` \| `elevated` \| `outlined` |
| `Badge` | `default` \| `brand` \| `success` \| `warning` \| `error` \| `info` |
| `Modal` | SSR-safe portal, controlled via `isOpen` prop |
| `Input`, `Textarea` | Forwarded ref, error state |

Import from the barrel: `import { Button, Card } from "@/components/ui"`.

### `lib/`

Infrastructure singletons only. Zero business logic.

| File | Exports |
|---|---|
| `lib/prisma.ts` | `prisma` — Prisma Client singleton |
| `lib/supabase.ts` | `getSignedUrl()`, server-side Supabase client |
| `lib/supabase-browser.ts` | `supabaseClient` — browser Supabase client |
| `lib/tokens.ts` | `generateToken()` — cryptographically random tokens |
| `lib/utils.ts` | `cn()` — Tailwind class merge utility |

---

## Domain Explanations

### auth
Authentication via NextAuth v5 + Prisma adapter.
- Credentials provider (email + bcrypt password)
- Session stored in DB (`Account`, `Session` tables)
- `auth()` from `@/auth` gives you the current session in Server Components

### billing
Stripe subscriptions + plan limits.
- `lib/billing/plans.ts` is the **source of truth** for plan definitions (Free/Pro/Studio)
- `lib/billing/limits.ts` has helpers to check if user is within limits
- `lib/billing/subscription.ts` has `getSubscriptionInfo(userId)` — used in every dashboard page
- Webhooks at `app/api/billing/webhook/stripe/route.ts` handle plan changes

**Never hardcode plan limits in UI.** Always read from `PLANS` in `plans.ts`.

### projects
A `Project` belongs to a `User` and has a `clientName` + optional `clientEmail`.
Projects contain many `Delivery` items (versions).

- CRUD in `lib/actions/projects.ts` (Server Actions)
- List/detail via Prisma in `app/(dashboard)/dashboard/page.tsx`
- API at `app/api/projects/` for real-time data refreshes

### deliveries
A `Delivery` is a single uploaded file = one version of a project.
Each delivery has a unique `reviewToken` that becomes the shareable link.

- Creation in `lib/actions/deliveries.ts`
- Files stored in Supabase Storage bucket `deliveries`
- Status: `PENDING` → `APPROVED` or `CHANGES_REQUESTED`

### review
The public-facing review flow, accessed via `/review/{token}`.
No authentication required — the token IS the authorization.

- `components/review/ReviewClientShell.tsx` — main shell (tabs, layout)
- `components/review/ApprovalPanel.tsx` — approve / request-changes buttons
- `components/review/CommentSystem.tsx` — thread comments
- `components/review/ImageWithComments.tsx` — pinned comments on images
- `components/review/PasswordGate.tsx` — password protection prompt
- API routes under `app/api/review/[token]/`

### guest-review
Guest = a client who isn't logged in but has a token.
Guests can also upload files back to the freelancer.

- `components/guest/GuestReviewShell.tsx` — review shell for non-logged users
- `components/seo/GuestUploader.tsx` — upload widget embedded on SEO pages
- API routes under `app/api/guest/`

### marketing
Landing page + SEO pages (EN + PT).
- Section components: `Hero`, `Features`, `HowItWorks`, `Pricing`, `CTA`
- SEO page templates: `ToolLandingPage` (EN), `ToolLandingPagePT` (PT)
- All stateless: no auth, no DB queries

---

## Where to Add New Features

### New dashboard page
1. Create `app/(dashboard)/dashboard/my-feature/page.tsx` (async Server Component)
2. Create `app/(dashboard)/dashboard/my-feature/MyFeaturePageClient.tsx` if client state is needed
3. Add a nav link in `components/dashboard/Sidebar.tsx`

### New API endpoint
1. Create `app/api/my-feature/route.ts`
2. Use `auth()` to guard authenticated routes
3. Return `NextResponse.json()`

### New Server Action
1. Add to the relevant `lib/actions/*.ts` file (or create a new one)
2. Mark with `"use server"` at the top
3. Validate inputs — never trust client-side data

### New UI primitive
1. Create in `components/ui/MyComponent.tsx`
2. Export it from `components/ui/index.ts`

### New billing plan
1. Add the plan object to `PLANS` in `lib/billing/plans.ts`
2. Add the corresponding `Plan` row in `prisma/seed.ts`
3. Run `npm run db:seed`
4. Create the Stripe Price in the Stripe dashboard and set the env var

---

## Server Actions vs API Routes

| Use Server Action when… | Use API Route when… |
|---|---|
| Mutating data from a form or button in a Server or Client Component | Receiving external webhooks (Stripe, etc.) |
| Simple CRUD with auth check | Endpoint needs to be called from real-time hooks or external services |
| You want automatic Next.js revalidation | Public endpoint (e.g., `/api/review/[token]/view`) |
| | Client needs to poll for updates (dashboard real-time refresh) |

**Rule of thumb:** Server Actions for user-triggered mutations.
API routes for webhooks + public/unauthenticated endpoints.

---

## Naming Conventions

| What | Convention | Example |
|---|---|---|
| Components | PascalCase | `ProjectCard.tsx` |
| Page client components | `{Page}PageClient.tsx` | `DashboardPageClient.tsx` |
| Server Actions files | camelCase | `projects.ts` |
| API route files | always `route.ts` | `app/api/projects/route.ts` |
| Hooks | `use` prefix | `useProjectStatus.ts` |
| Types | PascalCase | `ProjectData`, `DeliveryRow` |
| Database models | PascalCase (Prisma) | `Project`, `Delivery` |
| CSS classes | kebab-case Tailwind | `text-white/40` |

---

## Database Schema Quick Reference

```
User           → id, name, email, password, locale, subscription
Project        → id, name, clientName, clientEmail, userId
Delivery       → id, projectId, reviewToken, status, versionNumber, fileName, fileUrl, allowDownload, password
Comment        → id, deliveryId, content, authorName, x, y (pinned position)
View           → id, deliveryId, createdAt (tracks when client viewed)
Subscription   → id, userId, planCode, stripeCustomerId, stripeSubscriptionId, status
Plan           → id, code, name, maxProjects, maxVersionsPerProject, maxStorageBytes
```

---

## Useful Links

- [Architecture Migration Plan](./architecture-migration.md) — full restructuring roadmap
- [Prisma Studio](http://localhost:5555) (run `npx prisma studio`)
- [Supabase Dashboard](https://supabase.com/dashboard) — file storage
- [Stripe Dashboard](https://dashboard.stripe.com) — subscriptions
