# ApproveFlow — Architecture Migration Plan

This document describes the target domain-driven architecture for ApproveFlow
and provides a full mapping from the current structure to the new one.
It is a **living spec** — implement it incrementally, one domain at a time.

---

## Why restructure?

| Problem (current)                                                        | Goal (target)                                                  |
| ------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Business logic mixed with routing in `app/`                              | `app/` contains only routing, layouts and page composition     |
| Features split across `components/`, `lib/`, `app/api/` with no grouping | Each feature lives in `features/{domain}/`                     |
| `_client.tsx` naming pattern obscures component purpose                  | Explicit names like `DashboardPageClient.tsx`                  |
| `components/dashboard/`, `components/review/` grow unbounded             | Domain directories own their components                        |
| `lib/billing/` is flat — no distinction between infra and actions        | Clear split: `plans.ts`, `limits.ts`, `providers/`, `actions/` |
| SEO pages scattered at root level of `app/`                              | Grouped under `app/(marketing)/`                               |

---

## New Folder Structure

```
app/
  (auth)/
    layout.tsx
    login/page.tsx
  (dashboard)/
    layout.tsx
    dashboard/
      page.tsx
      DashboardPageClient.tsx         ✅ done (was _client.tsx)
      billing/
        page.tsx
        BillingPageClient.tsx         ✅ done (was _client.tsx)
      projects/
        [id]/
          page.tsx
          ProjectDetailClient.tsx     ✅ done (was _client.tsx)
  (marketing)/                        ← NEW route group
    page.tsx                          ← move from app/page.tsx
    layout.tsx                        ← optional, shared <Header>/<Footer>
    client-approval-tool/page.tsx
    design-review-tool/page.tsx
    logo-feedback-tool/page.tsx
    ui-feedback-tool/page.tsx
    website-review-tool/page.tsx
    pt/
      aprovacao-layout/page.tsx
      aprovar-design-cliente/page.tsx
      enviar-layout-cliente/page.tsx
      feedback-design/page.tsx
      feedback-site/page.tsx
      ferramenta-aprovacao-cliente/page.tsx
      revisao-design-online/page.tsx
      revisao-design-ui/page.tsx
      revisao-ui/page.tsx
      revisar-mockup/page.tsx
  review/
    [token]/page.tsx
  r/
    [token]/page.tsx
  api/
    auth/[...nextauth]/route.ts
    billing/
      cancel-subscription/route.ts
      create-checkout/route.ts
      subscription/route.ts
      webhook/stripe/route.ts
    guest/
      upload/route.ts
      [token]/
        approve/route.ts
        comment/route.ts
        request-changes/route.ts
    projects/
      route.ts
      [id]/route.ts
      [id]/deliveries/route.ts
      by-delivery/[deliveryId]/route.ts
    review/
      [token]/
        approve/route.ts
        comment/route.ts
        request-changes/route.ts
        verify-password/route.ts
        view/route.ts
  globals.css
  layout.tsx

features/
  auth/
    actions/
      auth.ts
  billing/
    plans.ts
    limits.ts
    subscription.ts
    providers/
      stripe.ts
  projects/
    components/
      ProjectCard.tsx
      NewProjectModal.tsx
    actions/
      projects.ts
  deliveries/
    components/
      NewDeliveryModal.tsx
      UploadZone.tsx
    actions/
      deliveries.ts
  review/
    components/
      ReviewClientShell.tsx
      ApprovalPanel.tsx
      CommentSystem.tsx
      FilePreview.tsx
      ImageWithComments.tsx
      VersionSwitcher.tsx
      PasswordGate.tsx
  guest-review/
    components/
      GuestReviewShell.tsx
      GuestUploader.tsx
  marketing/
    components/
      Hero.tsx
      Features.tsx
      HowItWorks.tsx
      Pricing.tsx
      CTA.tsx
      ToolLandingPage.tsx
      ToolLandingPagePT.tsx

components/
  ui/
    Avatar.tsx
    Badge.tsx
    Button.tsx
    Card.tsx
    ConfirmDialog.tsx
    Container.tsx
    index.ts
    Input.tsx
    Modal.tsx
    Spinner.tsx
    Tabs.tsx
    Textarea.tsx
  layout/
    Header.tsx
    Footer.tsx
  dashboard/
    Sidebar.tsx             ← stays here (layout/nav concern, not domain logic)

lib/
  prisma/
    client.ts               ← rename from lib/prisma.ts
  supabase/
    server.ts               ← rename from lib/supabase.ts
    browser.ts              ← rename from lib/supabase-browser.ts
  tokens.ts                 ← stays
  utils.ts                  ← stays (cn() utility)

types/
  index.ts
  next-auth.d.ts

docs/
  onboarding.md
  architecture-migration.md  ← this file

prisma/
  schema.prisma
  seed.ts
  migrations/

auth.config.ts              ← stays at root (NextAuth requirement)
auth.ts                     ← stays at root (NextAuth requirement)
```

---

## Migration Mapping — OLD → NEW

### Server Actions

| Old path                    | New path                                    |
| --------------------------- | ------------------------------------------- |
| `lib/actions/auth.ts`       | `features/auth/actions/auth.ts`             |
| `lib/actions/projects.ts`   | `features/projects/actions/projects.ts`     |
| `lib/actions/deliveries.ts` | `features/deliveries/actions/deliveries.ts` |

### Billing

| Old path                          | New path                               |
| --------------------------------- | -------------------------------------- |
| `lib/billing/plans.ts`            | `features/billing/plans.ts`            |
| `lib/billing/limits.ts`           | `features/billing/limits.ts`           |
| `lib/billing/subscription.ts`     | `features/billing/subscription.ts`     |
| `lib/billing/providers/stripe.ts` | `features/billing/providers/stripe.ts` |

### Core lib

| Old path                  | New path                  |
| ------------------------- | ------------------------- |
| `lib/prisma.ts`           | `lib/prisma/client.ts`    |
| `lib/supabase.ts`         | `lib/supabase/server.ts`  |
| `lib/supabase-browser.ts` | `lib/supabase/browser.ts` |
| `lib/tokens.ts`           | `lib/tokens.ts` (stays)   |
| `lib/utils.ts`            | `lib/utils.ts` (stays)    |

### Dashboard / Projects components

| Old path                                    | New path                                              |
| ------------------------------------------- | ----------------------------------------------------- |
| `components/dashboard/ProjectCard.tsx`      | `features/projects/components/ProjectCard.tsx`        |
| `components/dashboard/NewProjectModal.tsx`  | `features/projects/components/NewProjectModal.tsx`    |
| `components/dashboard/NewDeliveryModal.tsx` | `features/deliveries/components/NewDeliveryModal.tsx` |
| `components/dashboard/UploadZone.tsx`       | `features/deliveries/components/UploadZone.tsx`       |
| `components/dashboard/Sidebar.tsx`          | `components/dashboard/Sidebar.tsx` (stays)            |

### Review components

| Old path                                  | New path                                           |
| ----------------------------------------- | -------------------------------------------------- |
| `components/review/ReviewClientShell.tsx` | `features/review/components/ReviewClientShell.tsx` |
| `components/review/ApprovalPanel.tsx`     | `features/review/components/ApprovalPanel.tsx`     |
| `components/review/CommentSystem.tsx`     | `features/review/components/CommentSystem.tsx`     |
| `components/review/FilePreview.tsx`       | `features/review/components/FilePreview.tsx`       |
| `components/review/ImageWithComments.tsx` | `features/review/components/ImageWithComments.tsx` |
| `components/review/VersionSwitcher.tsx`   | `features/review/components/VersionSwitcher.tsx`   |
| `components/review/PasswordGate.tsx`      | `features/review/components/PasswordGate.tsx`      |

### Guest / SEO components

| Old path                                | New path                                                |
| --------------------------------------- | ------------------------------------------------------- |
| `components/guest/GuestReviewShell.tsx` | `features/guest-review/components/GuestReviewShell.tsx` |
| `components/seo/GuestUploader.tsx`      | `features/guest-review/components/GuestUploader.tsx`    |
| `components/seo/ToolLandingPage.tsx`    | `features/marketing/components/ToolLandingPage.tsx`     |
| `components/seo/ToolLandingPagePT.tsx`  | `features/marketing/components/ToolLandingPagePT.tsx`   |

### Landing page sections

| Old path                             | New path                                       |
| ------------------------------------ | ---------------------------------------------- |
| `components/sections/Hero.tsx`       | `features/marketing/components/Hero.tsx`       |
| `components/sections/Features.tsx`   | `features/marketing/components/Features.tsx`   |
| `components/sections/HowItWorks.tsx` | `features/marketing/components/HowItWorks.tsx` |
| `components/sections/Pricing.tsx`    | `features/marketing/components/Pricing.tsx`    |
| `components/sections/CTA.tsx`        | `features/marketing/components/CTA.tsx`        |

### App routing

| Old path                            | New path                                        |
| ----------------------------------- | ----------------------------------------------- |
| `app/page.tsx` (landing)            | `app/(marketing)/page.tsx`                      |
| `app/client-approval-tool/page.tsx` | `app/(marketing)/client-approval-tool/page.tsx` |
| `app/design-review-tool/page.tsx`   | `app/(marketing)/design-review-tool/page.tsx`   |
| `app/logo-feedback-tool/page.tsx`   | `app/(marketing)/logo-feedback-tool/page.tsx`   |
| `app/ui-feedback-tool/page.tsx`     | `app/(marketing)/ui-feedback-tool/page.tsx`     |
| `app/website-review-tool/page.tsx`  | `app/(marketing)/website-review-tool/page.tsx`  |
| `app/pt/*/page.tsx` (10 pages)      | `app/(marketing)/pt/*/page.tsx`                 |

> **Note:** Moving pages into `(marketing)/` does NOT change URLs. Route groups
> with parentheses are invisible to the URL. `/client-approval-tool` stays
> `/client-approval-tool`.

---

## Recommended Migration Order

Tackle one domain at a time. Each step is independently deployable.

### Step 1 — Core lib (lowest risk, no breaking changes to callers)

```
lib/prisma.ts        → lib/prisma/client.ts
lib/supabase.ts      → lib/supabase/server.ts
lib/supabase-browser.ts → lib/supabase/browser.ts
```

Add re-export barrel files at the old paths to keep existing imports working
during the transition:

```ts
// lib/prisma.ts (temporary barrel)
export { prisma } from "./prisma/client";
```

Once all callers are updated, delete the barrels.

### Step 2 — Billing feature

```
lib/billing/ → features/billing/
```

This is self-contained — only callers are API routes and server pages.
Search for `from "@/lib/billing` to find all callers; update them.

### Step 3 — Projects feature

```
lib/actions/projects.ts            → features/projects/actions/projects.ts
components/dashboard/ProjectCard.tsx     → features/projects/components/ProjectCard.tsx
components/dashboard/NewProjectModal.tsx → features/projects/components/NewProjectModal.tsx
```

### Step 4 — Deliveries feature

```
lib/actions/deliveries.ts               → features/deliveries/actions/deliveries.ts
components/dashboard/NewDeliveryModal.tsx → features/deliveries/components/NewDeliveryModal.tsx
components/dashboard/UploadZone.tsx      → features/deliveries/components/UploadZone.tsx
```

### Step 5 — Review feature

```
components/review/* → features/review/components/*
```

### Step 6 — Guest review feature

```
components/guest/GuestReviewShell.tsx → features/guest-review/components/
components/seo/GuestUploader.tsx      → features/guest-review/components/
```

### Step 7 — Marketing feature + route group

```
components/sections/* → features/marketing/components/*
components/seo/ToolLandingPage*.tsx → features/marketing/components/*
app/page.tsx + app/*/page.tsx (SEO) → app/(marketing)/
```

### Step 8 — Auth feature

```
lib/actions/auth.ts → features/auth/actions/auth.ts
```

---

## Import Update Patterns

When moving a file, search for its old import path and replace:

```bash
# Example: after moving lib/billing/plans.ts
grep -r "from \"@/lib/billing/plans\"" --include="*.ts" --include="*.tsx" .
grep -r "from \"@/lib/billing/limits\"" --include="*.ts" --include="*.tsx" .
```

**On Windows (PowerShell):**

```powershell
Get-ChildItem -Recurse -Include *.ts,*.tsx | Select-String "@/lib/billing"
```

---

## Code Adjustments — What to Watch

### 1. `@/*` path alias

The `tsconfig.json` maps `@/*` to the project root. All new paths under
`features/` and `lib/*/` will work automatically — no tsconfig change needed.

### 2. `app/(marketing)/` route group

When you move `app/page.tsx` (root landing page) into `app/(marketing)/page.tsx`,
the root `app/layout.tsx` must remain at `app/layout.tsx` (not inside the group).
The `(marketing)` group can have its own `layout.tsx` if you want to inject
`<Header>` / `<Footer>` only on marketing pages. This avoids wrapping the
dashboard or review pages in the landing layout.

### 3. NextAuth files stay at root

`auth.ts` and `auth.config.ts` must stay at the project root — NextAuth v5
expects them there.

### 4. API routes stay in `app/api/`

API routes don't move. The API surface doesn't change.

### 5. Circular dependency risk

`features/billing` → imports from `lib/prisma` ✅ safe  
`features/projects` → imports from `features/billing` ✅ safe  
`features/billing` → must NOT import from `features/projects` ← watch this

---

## What NOT to touch

- `prisma/schema.prisma` — no DB schema changes
- `app/api/**` — API routes stay where they are
- `auth.ts`, `auth.config.ts` — stay at root
- `components/ui/` — shared UI, stays where it is
- Business logic — reorganisation only, no rewrites

---

## Optional Improvements (do NOT implement now)

These are future opportunities, not part of this migration:

1. **`features/{domain}/index.ts` barrel files** — expose public API per domain
   (`export { ProjectCard } from "./components/ProjectCard"`) so callers never
   import internal paths directly.

2. **React Query / SWR for client data fetching** — replace the manual `fetch`
   in dashboard `useEffect` with proper cache semantics.

3. **Zod schemas in `features/{domain}/schemas/`** — centralize validation
   schemas next to the domain that owns them.

4. **`features/{domain}/queries/`** — extract Prisma queries from page.tsx
   Server Components into dedicated query files for testability.

5. **End-to-end tests (Playwright)** — add `e2e/` at the root with smoke tests
   for the review flow and billing flow before doing large refactors.

6. **Storybook** — once `features/*/components/` is stable, add Storybook for
   isolated component development.
