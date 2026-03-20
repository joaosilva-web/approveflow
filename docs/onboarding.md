# ApproveFlow — Onboarding para Desenvolvedores

Bem-vindo ao ApproveFlow. Este guia explica como o projeto está organizado,
o que cada parte faz e como adicionar código novo corretamente.

---

## O que é o ApproveFlow?

Um SaaS para freelancers enviarem arquivos a clientes e coletarem aprovações ou
pedidos de alteração — tudo via link compartilhável, sem o cliente precisar de conta.

**Fluxo principal:**

1. Freelancer cria um **Projeto** (nome do cliente, e-mail)
2. Freelancer faz upload de um arquivo → uma **Entrega** é criada com um token único de revisão
3. Um link como `approveflow.app/review/{token}` é compartilhado com o cliente
4. Cliente visualiza o arquivo, deixa comentários, clica em **Aprovar** ou **Solicitar Alterações**
5. Freelancer vê a atualização de status ao vivo no dashboard

---

## Rodando Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Copiar variáveis de ambiente
cp .env.example .env.local
# Preencha todos os valores (veja "Variáveis de Ambiente" abaixo)

# 3. Aplicar migrações do banco
npx prisma migrate dev

# 4. Seedar os planos (Free / Pro / Studio)
npm run db:seed

# 5. Iniciar servidor de desenvolvimento
npm run dev
```

Abra http://localhost:3000.

**Outros comandos úteis:**

| Comando             | Finalidade                  |
| ------------------- | --------------------------- |
| `npm run build`     | Build de produção           |
| `npx tsc --noEmit`  | Verificação de tipos TypeScript |
| `npm run lint`      | ESLint                      |
| `npx prisma studio` | Navegador visual do banco   |

---

## Variáveis de Ambiente

```env
# Banco de dados (PostgreSQL)
DATABASE_URL=
DIRECT_URL=

# NextAuth v5
AUTH_SECRET=

# Supabase (armazenamento de arquivos)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=deliveries
NEXT_PUBLIC_SUPABASE_BUCKET=deliveries

# Stripe (cobrança)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO=
STRIPE_PRICE_STUDIO=

# Resend (e-mail transacional)
RESEND_API_KEY=
RESEND_FROM=

# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Visão Geral da Estrutura do Projeto

```
app/           → Next.js App Router — roteamento, layouts e composição de páginas apenas
components/    → UI compartilhada e sem domínio (design system + layout de marketing)
features/      → TODA a lógica de domínio, componentes e actions (uma pasta por domínio)
lib/           → Infraestrutura apenas (Prisma, Supabase, geração de tokens, utils)
prisma/        → Schema e migrações do banco
types/         → Tipos TypeScript globais
docs/          → Documentação de arquitetura e onboarding
```

### A regra mais importante

> **Lógica de negócio fica em `features/`.**
> `app/` apenas roteia. `components/` apenas UI genérica. `lib/` apenas infraestrutura.

---

## `features/` — Módulos de Domínio

Cada domínio é autocontido em `features/{domain}/`:

```
features/
  auth/
    actions/auth.ts           ← server action registerUser()
  billing/
    plans.ts                  ← constante PLANS — fonte da verdade para limites de plano
    limits.ts                 ← canCreateProject(), canUploadVersion(), etc.
    subscription.ts           ← getSubscriptionInfo(userId)
    providers/stripe.ts       ← singleton do cliente Stripe
  dashboard/
    components/Sidebar.tsx    ← navegação do app autenticado
  deliveries/
    actions/deliveries.ts     ← getUploadUrl(), createDelivery()
    components/
      NewDeliveryModal.tsx
      UploadZone.tsx
  guest-review/
    components/
      GuestReviewShell.tsx    ← página de revisão para visitantes não autenticados
      GuestUploader.tsx       ← widget de upload para páginas SEO/ferramentas
  marketing/
    context/lang-context.tsx  ← contexto de alternância de idioma pt/en
    components/
      LandingPage.tsx         ← composição da página inicial
      Hero.tsx, Features.tsx, HowItWorks.tsx, Pricing.tsx, CTA.tsx
      ToolLandingPage.tsx     ← template de página de ferramenta SEO (EN)
      ToolLandingPagePT.tsx   ← template de página de ferramenta SEO (PT)
  projects/
    actions/projects.ts       ← createProject(), updateProject(), deleteProject()
    components/
      ProjectCard.tsx
      NewProjectModal.tsx
  review/
    components/
      ReviewClientShell.tsx   ← shell principal da página de revisão
      ApprovalPanel.tsx       ← botões Aprovar / Solicitar Alterações
      CommentSystem.tsx       ← comentários encadeados
      ImageWithComments.tsx   ← comentários fixados em imagens
      PasswordGate.tsx        ← prompt de proteção por senha
      FilePreview.tsx         ← visualizador de PDF / imagem / vídeo
      VersionSwitcher.tsx     ← alternância entre versões de entrega
```

---

## `app/` — Apenas Roteamento

`app/` é o App Router do Next.js. Gerencia roteamento, guards de autenticação e
composição de páginas. **Nenhuma lógica de negócio aqui.**

Páginas buscam dados diretamente via Prisma (RSC) e passam como props para
componentes `*PageClient.tsx` que gerenciam interatividade.

| Caminho                                    | O que faz                                          |
| ------------------------------------------ | -------------------------------------------------- |
| `app/(auth)/login/`                        | Página de login                                    |
| `app/(dashboard)/dashboard/`               | Dashboard principal (lista de projetos)            |
| `app/(dashboard)/dashboard/billing/`       | Cobrança / gerenciamento de plano                  |
| `app/(dashboard)/dashboard/projects/[id]/` | Detalhe de projeto                                 |
| `app/review/[token]/`                      | Página pública de revisão (autenticação via token) |
| `app/guest-review/[token]/`                | Página de revisão para visitantes                  |
| `app/api/`                                 | Rotas REST (webhooks + endpoints públicos)         |
| `app/(marketing)/`                         | Página inicial + páginas SEO                       |

### Padrão `*PageClient.tsx`

Páginas que precisam de estado no cliente usam essa divisão:

```
page.tsx                 ← RSC assíncrono — busca dados, renderiza HTML no servidor
DashboardPageClient.tsx  ← "use client" — estado, eventos, tempo real
```

Regra: `page.tsx` nunca tem `useState`. `*PageClient.tsx` nunca consulta o banco.

### `app/api/` — quando usar

- **Webhooks** — `POST /api/billing/webhook/stripe`
- **Endpoints públicos não autenticados** — `/api/review/[token]/view`
- **Polling em tempo real** — `GET /api/projects/[id]`
- **Mutações de componentes cliente** — aprovar, comentar, solicitar alterações

Use **Server Actions** (em `features/*/actions/`) para mutações orientadas a formulário
de páginas autenticadas. Veja [Server Actions vs Rotas de API](#server-actions-vs-rotas-de-api).

---

## `components/` — Apenas UI Genérica

Somente código verdadeiramente sem domínio pertence aqui. Se faz referência a uma
entidade do projeto, a um caminho de rota como `/dashboard` ou a um modelo Prisma
— pertence a `features/`.

### `components/ui/`

Primitivos do design system. Sem lógica de negócio.

| Componente          | Variantes                                                           |
| ------------------- | ------------------------------------------------------------------- |
| `Button`            | `primary` \| `secondary` \| `ghost` \| `outline` \| `danger`        |
| `Card`              | `default` \| `glass` \| `elevated` \| `outlined`                    |
| `Badge`             | `default` \| `brand` \| `success` \| `warning` \| `error` \| `info` |
| `Modal`             | Portal seguro para SSR, controlado via prop `isOpen`               |
| `Input`, `Textarea` | Ref encaminhada, estado de erro                                     |

Importe via barrel: `import { Button, Card } from "@/components/ui"`.

### `components/layout/`

Layout do site de marketing — `Header.tsx` e `Footer.tsx`.

---

## `lib/` — Apenas Infraestrutura

Infraestrutura pura. Sem lógica de domínio, sem templates de e-mail, sem definições de plano.

| Arquivo                   | Exportações                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| `lib/prisma/client.ts`    | `prisma` — singleton do Prisma Client                              |
| `lib/supabase/server.ts`  | `uploadFile()`, `getSignedUrl()`, `getSignedUploadUrl()`           |
| `lib/supabase/browser.ts` | `supabaseClient` — cliente Supabase para o browser                 |
| `lib/tokens.ts`           | `generateReviewToken()`, `generateOtpCode()` — utilitários de criptografia |
| `lib/utils.ts`            | `cn()` — utilitário de merge de classes Tailwind                   |
| `lib/email.ts`            | Cliente Resend + helpers de e-mail transacional                    |

---

## Explicação dos Domínios

### auth

Autenticação via NextAuth v5 + adaptador Prisma.

- Provider de credenciais (e-mail + senha bcrypt)
- Sessão persistida no banco (tabelas `Account`, `Session`)
- `auth()` de `@/auth` — chame em qualquer Server Component para obter a sessão
- Registro de usuário: `features/auth/actions/auth.ts` → `registerUser()`

### billing

Assinaturas Stripe + limites de funcionalidades por plano.

- `features/billing/plans.ts` — **fonte da verdade** para definições de plano (Free/Pro/Studio)
- `features/billing/limits.ts` — `canCreateProject()`, `canUploadVersion()`, `canUploadFile()`
- `features/billing/subscription.ts` — `getSubscriptionInfo(userId)` usado em todas as páginas do dashboard
- `features/billing/providers/stripe.ts` — singleton do SDK Stripe
- Handler de webhook: `app/api/billing/webhook/stripe/route.ts`

**Nunca hardcode limites de plano na UI.** Sempre leia de `PLANS` em `features/billing/plans.ts`.

### projects

Um `Project` pertence a um `User` e tem `clientName` + `clientEmail` opcional.
Cada projeto contém múltiplas versões de `Delivery`.

- CRUD: `features/projects/actions/projects.ts`
- Componentes: `features/projects/components/`
- API (tempo real): `app/api/projects/`

### deliveries

Uma `Delivery` é um arquivo enviado — uma versão do projeto.
Cada entrega tem um `reviewToken` único que vira o link compartilhável.

- Actions: `features/deliveries/actions/deliveries.ts`
- Componentes: `features/deliveries/components/`
- Arquivos armazenados no bucket `deliveries` do Supabase Storage
- Status: `PENDING` → `APPROVED` ou `CHANGES_REQUESTED`

### review

O fluxo público de revisão, acessado via `/review/{token}`.
Nenhum login necessário — o token É a autorização.

- Todos os componentes: `features/review/components/`
- Rotas de API: `app/api/review/[token]/`
- Ponto de entrada: `app/review/[token]/page.tsx`

### guest-review

Visitantes não autenticados (clientes sem conta) podem fazer upload de arquivos de volta.

- Componentes: `features/guest-review/components/`
- Rotas de API: `app/api/guest/`
- Ponto de entrada: `app/guest-review/[token]/page.tsx`

### marketing

Página inicial + páginas de ferramentas SEO (bilíngue EN + PT).

- Todos os componentes: `features/marketing/components/`
- Contexto de idioma: `features/marketing/context/lang-context.tsx`
- Ponto de entrada: `app/(marketing)/page.tsx`
- Páginas SEO: `app/client-approval-tool/`, `app/pt/*/`, etc.

### dashboard

O shell autenticado que envolve todas as páginas do dashboard.

- Navegação lateral: `features/dashboard/components/Sidebar.tsx`
- Layout: `app/(dashboard)/layout.tsx` (guard de autenticação + renderização do Sidebar)

---

## Onde Adicionar Código Novo

### Nova página do dashboard

1. Crie `app/(dashboard)/dashboard/minha-feature/page.tsx` (RSC assíncrono — busca de dados)
2. Crie `app/(dashboard)/dashboard/minha-feature/MinhaFeaturePageClient.tsx` se precisar de estado no cliente
3. Adicione o link de navegação em `features/dashboard/components/Sidebar.tsx`
4. Coloque a lógica de negócio em `features/minha-feature/actions/` ou `features/minha-feature/components/`

### Novo endpoint de API

1. Crie `app/api/minha-feature/route.ts`
2. Use `auth()` para proteger rotas autenticadas
3. Retorne `NextResponse.json()`

### Nova Server Action

1. Crie `features/{domain}/actions/minha-action.ts`
2. Adicione `"use server"` no topo do arquivo
3. Valide todas as entradas — nunca confie em dados do cliente

### Novo primitivo de UI (sem lógica de domínio)

1. Crie `components/ui/MeuComponente.tsx`
2. Exporte de `components/ui/index.ts`

### Novo componente específico de domínio

1. Crie `features/{domain}/components/MeuComponente.tsx`
2. Importe-o na página ou shell relevante

### Novo plano de cobrança

1. Adicione o objeto do plano em `PLANS` em `features/billing/plans.ts`
2. Adicione a linha `Plan` em `prisma/seed.ts`
3. Execute `npm run db:seed`
4. Crie o Preço no dashboard do Stripe e defina a env var `STRIPE_PRICE_*`

---

## Server Actions vs Rotas de API

| Use Server Action quando…                                              | Use Rota de API quando…                                                    |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Mutando dados de um formulário ou botão                                | Recebendo webhooks externos (Stripe, etc.)                                 |
| CRUD simples com verificação de autenticação                           | Endpoint chamado por hooks de tempo real ou serviços externos              |
| Quer revalidação automática do Next.js via `revalidatePath`            | Endpoint público não autenticado (ex: `/api/review/[token]/view`)          |
|                                                                        | Polling do cliente para atualizações ao vivo                               |

**Regra geral:** Server Actions para mutações autenticadas de usuário.
Rotas de API para webhooks, endpoints públicos e polling em tempo real.

---

## Convenções de Nomenclatura

| O quê                          | Convenção              | Exemplo                        |
| ------------------------------ | ---------------------- | ------------------------------ |
| Componentes                    | PascalCase             | `ProjectCard.tsx`              |
| Componentes cliente de página  | `{Pagina}PageClient.tsx` | `DashboardPageClient.tsx`    |
| Arquivos de server action      | camelCase              | `projects.ts`, `deliveries.ts` |
| Arquivos de rota de API        | sempre `route.ts`      | `app/api/projects/route.ts`    |
| Hooks                          | prefixo `use`          | `useProjectStatus.ts`          |
| Tipos                          | PascalCase             | `ProjectData`, `DeliveryRow`   |
| Modelos do banco               | PascalCase (Prisma)    | `Project`, `Delivery`          |
| Classes CSS                    | kebab-case Tailwind    | `text-white/40`                |

---

## Referência Rápida do Schema do Banco

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

## Links Úteis

- [Prisma Studio](http://localhost:5555) — execute `npx prisma studio`
- [Supabase Dashboard](https://supabase.com/dashboard) — armazenamento de arquivos
- [Stripe Dashboard](https://dashboard.stripe.com) — assinaturas
