# ApproveFlow — Developer Onboarding

Welcome to ApproveFlow. This guide explains how the project is organized,
what each part does, and how to add new code correctly.

---

## What is ApproveFlow?

A SaaS for freelancers to send files to clients and collect approvals or
change requests — all through a shareable link, without the client needing
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

| Command             | Purpose               |
| ------------------- | --------------------- |
| `npm run build`     | Production build      |
| `npx tsc --noEmit`  | TypeScript type check |
| `npm run lint`      | ESLint                |
| `npx prisma studio` | Visual DB browser     |

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
app/           → Next.js App Router — routing, layouts, page composition only
components/    → Shared, domain-agnostic UI (design system + marketing layout)
features/      → ALL domain logic, components, and actions (one folder per domain)
lib/           → Infrastructure only (Prisma, Supabase, token generation, utils)
prisma/        → DB schema and migrations
types/         → Global TypeScript types
docs/          → Architecture and onboarding docs
```

### The rule that matters most

> **Business logic lives in `features/`.**
> `app/` only routes. `components/` only generic UI. `lib/` only infrastructure.

---

## `features/` — Domain Modules

Each domain is self-contained under `features/{domain}/`:

```
features/
  auth/
    actions/auth.ts           ← registerUser() server action
  billing/
    plans.ts                  ← PLANS constant — source of truth for plan limits
    limits.ts                 ← canCreateProject(), canUploadVersion(), etc.
    subscription.ts           ← getSubscriptionInfo(userId)
    providers/stripe.ts       ← Stripe client singleton
  dashboard/
    components/Sidebar.tsx    ← Authenticated app navigation
  deliveries/
    actions/deliveries.ts     ← getUploadUrl(), createDelivery()
    components/
      NewDeliveryModal.tsx
      UploadZone.tsx
  guest-review/
    components/
      GuestReviewShell.tsx    ← Review page for unauthenticated guests
      GuestUploader.tsx       ← File upload widget for SEO/tool pages
  marketing/
    context/lang-context.tsx  ← pt/en language toggle context
    components/
      LandingPage.tsx         ← Home page composition
      Hero.tsx, Features.tsx, HowItWorks.tsx, Pricing.tsx, CTA.tsx
      ToolLandingPage.tsx     ← SEO tool page template (EN)
      ToolLandingPagePT.tsx   ← SEO tool page template (PT)
  projects/
    actions/projects.ts       ← createProject(), updateProject(), deleteProject()
    components/
      ProjectCard.tsx
      NewProjectModal.tsx
  review/
    components/
      ReviewClientShell.tsx   ← Main review page shell
      ApprovalPanel.tsx       ← Approve / Request Changes buttons
      CommentSystem.tsx       ← Threaded comments
      ImageWithComments.tsx   ← Pinned comments on images
      PasswordGate.tsx        ← Password protection prompt
      FilePreview.tsx         ← PDF / image / video viewer
      VersionSwitcher.tsx     ← Switch between delivery versions
```

---

## `app/` — Routing Only

`app/` is the Next.js App Router. It handles routing, auth guards, and page
composition. **No business logic here.**

Pages fetch data directly via Prisma (RSC), then pass it as props to
`*PageClient.tsx` components for interactivity.

| Path                                       | What it does                                  |
| ------------------------------------------ | --------------------------------------------- |
| `app/(auth)/login/`                        | Login page                                    |
| `app/(dashboard)/dashboard/`               | Main dashboard (projects list)                |
| `app/(dashboard)/dashboard/billing/`       | Billing / plan management                     |
| `app/(dashboard)/dashboard/projects/[id]/` | Single project detail                         |
| `app/review/[token]/`                      | Public review page (auth via token)           |
| `app/guest-review/[token]/`                | Guest upload review page                      |
| `app/api/`                                 | REST API routes (webhooks + public endpoints) |
| `app/(marketing)/`                         | Landing page + SEO tool pages                 |

### `*PageClient.tsx` pattern

Pages that need client-side state use this split:

```
page.tsx                 ← async RSC — fetches data, renders server HTML
DashboardPageClient.tsx  ← "use client" — state, events, real-time
```

Rule: `page.tsx` never has `useState`. `*PageClient.tsx` never queries the DB.

### `app/api/` — when to use

- **Webhooks** — `POST /api/billing/webhook/stripe`
- **Public unauthenticated endpoints** — `/api/review/[token]/view`
- **Real-time polling** — `GET /api/projects/[id]`
- **Mutations from client components** — approve, comment, request-changes

Use **Server Actions** (in `features/*/actions/`) for form-driven mutations
from authenticated pages. See [Server Actions vs API Routes](#server-actions-vs-api-routes).

---

## `components/` — Generic UI Only

Only truly domain-agnostic code belongs here. If it references a project entity,
a route path like `/dashboard`, or a Prisma model — it belongs in `features/`.

### `components/ui/`

Design-system primitives. No business logic.

| Component           | Variants                                                            |
| ------------------- | ------------------------------------------------------------------- |
| `Button`            | `primary` \| `secondary` \| `ghost` \| `outline` \| `danger`        |
| `Card`              | `default` \| `glass` \| `elevated` \| `outlined`                    |
| `Badge`             | `default` \| `brand` \| `success` \| `warning` \| `error` \| `info` |
| `Modal`             | SSR-safe portal, controlled via `isOpen` prop                       |
| `Input`, `Textarea` | Forwarded ref, error state                                          |

Import from the barrel: `import { Button, Card } from "@/components/ui"`.

### `components/layout/`

Marketing site layout — `Header.tsx` and `Footer.tsx`.

---

## `lib/` — Infrastructure Only

Pure infrastructure. No domain logic, no email templates, no plan definitions.

| File                      | Exports                                                         |
| ------------------------- | --------------------------------------------------------------- |
| `lib/prisma/client.ts`    | `prisma` — Prisma Client singleton                              |
| `lib/supabase/server.ts`  | `uploadFile()`, `getSignedUrl()`, `getSignedUploadUrl()`        |
| `lib/supabase/browser.ts` | `supabaseClient` — browser Supabase client                      |
| `lib/tokens.ts`           | `generateReviewToken()`, `generateOtpCode()` — crypto utilities |
| `lib/utils.ts`            | `cn()` — Tailwind class merge utility                           |
| `lib/email.ts`            | Resend client + transactional email helpers                     |

---

## Domain Explanations

### auth

Authentication via NextAuth v5 + Prisma adapter.

- Credentials provider (email + bcrypt password)
- Session persisted in DB (`Account`, `Session` tables)
- `auth()` from `@/auth` — call in any Server Component to get the session
- User registration: `features/auth/actions/auth.ts` → `registerUser()`

### billing

Stripe subscriptions + plan-based feature limits.

- `features/billing/plans.ts` — **source of truth** for plan definitions (Free/Pro/Studio)
- `features/billing/limits.ts` — `canCreateProject()`, `canUploadVersion()`, `canUploadFile()`
- `features/billing/subscription.ts` — `getSubscriptionInfo(userId)` used on every dashboard page
- `features/billing/providers/stripe.ts` — Stripe SDK singleton
- Webhook handler: `app/api/billing/webhook/stripe/route.ts`

**Never hardcode plan limits in UI.** Always read from `PLANS` in `features/billing/plans.ts`.

### projects

A `Project` belongs to a `User` and has a `clientName` + optional `clientEmail`.
Each project holds multiple `Delivery` versions.

- CRUD: `features/projects/actions/projects.ts`
- Components: `features/projects/components/`
- API (real-time): `app/api/projects/`

### deliveries

A `Delivery` is one uploaded file — one version of a project.
Each delivery has a unique `reviewToken` that becomes the shareable link.

- Actions: `features/deliveries/actions/deliveries.ts`
- Components: `features/deliveries/components/`
- Files stored in Supabase Storage bucket `deliveries`
- Status: `PENDING` → `APPROVED` or `CHANGES_REQUESTED`

### review

The public-facing review flow, accessed via `/review/{token}`.
No login required — the token IS the authorization.

- All components: `features/review/components/`
- API routes: `app/api/review/[token]/`
- Entry point: `app/review/[token]/page.tsx`

### guest-review

Unauthenticated guests (clients without an account) can upload files back.

- Components: `features/guest-review/components/`
- API routes: `app/api/guest/`
- Entry point: `app/guest-review/[token]/page.tsx`

### marketing

Landing page + SEO tool pages (EN + PT bilingual).

- All components: `features/marketing/components/`
- Language context: `features/marketing/context/lang-context.tsx`
- Entry point: `app/(marketing)/page.tsx`
- SEO pages: `app/client-approval-tool/`, `app/pt/*/`, etc.

### dashboard

The authenticated shell wrapping all dashboard pages.

- Sidebar navigation: `features/dashboard/components/Sidebar.tsx`
- Layout: `app/(dashboard)/layout.tsx` (auth guard + Sidebar render)

---

## Where to Add New Code

### New dashboard page

1. Create `app/(dashboard)/dashboard/my-feature/page.tsx` (async RSC — data fetch)
2. Create `app/(dashboard)/dashboard/my-feature/MyFeaturePageClient.tsx` if client state needed
3. Add the nav link in `features/dashboard/components/Sidebar.tsx`
4. Put any business logic in `features/my-feature/actions/` or `features/my-feature/components/`

### New API endpoint

1. Create `app/api/my-feature/route.ts`
2. Use `auth()` to guard authenticated routes
3. Return `NextResponse.json()`

### New Server Action

1. Create `features/{domain}/actions/my-action.ts`
2. Add `"use server"` at the top of the file
3. Validate all inputs — never trust client data

### New UI primitive (no domain logic)

1. Create `components/ui/MyComponent.tsx`
2. Export from `components/ui/index.ts`

### New domain-specific component

1. Create `features/{domain}/components/MyComponent.tsx`
2. Import it in the relevant page or shell component

### New billing plan

1. Add the plan object to `PLANS` in `features/billing/plans.ts`
2. Add the `Plan` row in `prisma/seed.ts`
3. Run `npm run db:seed`
4. Create the Stripe Price in the Stripe dashboard and set `STRIPE_*_PRICE_ID` env var

---

## Server Actions vs API Routes

| Use Server Action when…                                      | Use API Route when…                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------------ |
| Mutating data from a form or button                          | Receiving external webhooks (Stripe, etc.)                         |
| Simple CRUD with auth check                                  | Endpoint called from real-time hooks or external services          |
| You want automatic Next.js revalidation via `revalidatePath` | Public unauthenticated endpoint (e.g., `/api/review/[token]/view`) |
|                                                              | Client polling for live updates                                    |

**Rule of thumb:** Server Actions for authenticated user mutations.
API routes for webhooks, public endpoints, and real-time polling.

---

## Naming Conventions

| What                   | Convention             | Example                        |
| ---------------------- | ---------------------- | ------------------------------ |
| Components             | PascalCase             | `ProjectCard.tsx`              |
| Page client components | `{Page}PageClient.tsx` | `DashboardPageClient.tsx`      |
| Server action files    | camelCase              | `projects.ts`, `deliveries.ts` |
| API route files        | always `route.ts`      | `app/api/projects/route.ts`    |
| Hooks                  | `use` prefix           | `useProjectStatus.ts`          |
| Types                  | PascalCase             | `ProjectData`, `DeliveryRow`   |
| Database models        | PascalCase (Prisma)    | `Project`, `Delivery`          |
| CSS classes            | kebab-case Tailwind    | `text-white/40`                |

---

## Database Schema Quick Reference

```
User           → id, name, email, password, locale
Project        → id, name, clientName, clientEmail, userId
Delivery       → id, projectId, reviewToken, status, versionNumber, fileName, filePath, mimeType
Comment        → id, deliveryId, content, authorName, xPosition, yPosition
View           → id, deliveryId, createdAt
Approval       → id, deliveryId, userId, status
Subscription   → id, userId, planCode, stripeCustomerId, stripeSubscriptionId, status
Plan           → id, code, name, maxProjects, maxVersionsPerProject, maxStorageBytes
GuestUpload    → id, reviewToken, claimToken, filePath, fileName, mimeType, status, expiresAt
GuestComment   → id, guestUploadId, content, authorName, authorType, xPosition, yPosition
GuestView      → id, guestUploadId, ipAddress, userAgent
```

---

## Useful Links

- [Prisma Studio](http://localhost:5555) — run `npx prisma studio`
- [Supabase Dashboard](https://supabase.com/dashboard) — file storage
- [Stripe Dashboard](https://dashboard.stripe.com) — subscriptions
