# ApproveFlow — Feature Roadmap Audit

Objetivo: verificar o que já está implementado, o que está parcial e o que ainda não existe.

Classificar cada item como:

- ✅ Implementado
- ⚠️ Parcial
- ❌ Não implementado

---

# 🧠 VISÃO DO PRODUTO

ApproveFlow = aprovação + decisão + avanço do projeto

Não é apenas comentários — é fluxo de trabalho.

---

# 🟢 FASE 1 — MVP MATADOR

Objetivo: resolver o problema central com excelência.

---

## 1. Link de revisão (core)

- Geração de link único com token
- Acesso sem login
- Proteção por senha (opcional)
- Expiração do link (opcional)

Status: ✅ Implementado

- Token gerado em `lib/tokens.ts`, armazenado em `Delivery.reviewToken` (`@unique`) no schema Prisma
- Página pública sem autenticação: `app/review/[token]/page.tsx`
- Expiração: campo `expiresAt` em `Delivery`, verificado na rota da página de revisão
- ⚠️ Proteção por senha: UI existe (`features/review/components/PasswordGate.tsx`) e campo `password` existe no schema, mas **a senha não é validada no backend** (não é verificada em nenhuma API route)

---

## 2. Visualização + comentários

- Upload de arquivo
- Comentários no arquivo (tipo Figma)
- Comentários com posição fixa

Status: ✅ Implementado

- Upload via `features/deliveries/actions/deliveries.ts` → `getUploadUrl()` + `createDelivery()` com Supabase Storage
- Comentários armazenados com `xPosition` e `yPosition` (normalizados 0–1) no modelo `Comment` do schema
- Renderização com marcadores fixos na imagem: `features/review/components/ImageWithComments.tsx`
- API de comentários: `app/api/review/[token]/comment/route.ts`
- Visualizador de PDF, vídeo, imagens: `features/review/components/FilePreview.tsx`

---

## 3. Aprovação simples

- Botão “Aprovar”
- Botão “Solicitar alterações”
- UX clara e sem fricção

Status: ✅ Implementado

- Botões em `features/review/components/ApprovalPanel.tsx` com banner de status e formulários modais
- Aprovar → `app/api/review/[token]/approve/route.ts` (cria registro `Approval`, atualiza status para `APPROVED`, dispara e-mail)
- Solicitar alterações → `app/api/review/[token]/request-changes/route.ts` (atualiza status para `CHANGES_REQUESTED`, dispara e-mail)

---

## 4. Histórico de versões

- Versionamento (v1, v2, v3…)
- Navegação entre versões

Status: ✅ Implementado

- Campo `Delivery.versionNumber` no schema Prisma
- Página de revisão carrega todas as versões do projeto (ordenadas por `versionNumber desc`)
- UI de navegação: `features/review/components/VersionSwitcher.tsx` com badges de status por versão
- ⚠️ Limite de versões por plano (FREE: 3) existe em `features/billing/plans.ts` mas **não é aplicado** — usuários podem subir versões ilimitadas

---

## 5. Status do projeto

- Pending
- In review
- Changes requested
- Approved

Status: ✅ Implementado

- Enum `DeliveryStatus` no schema: `PENDING | APPROVED | CHANGES_REQUESTED`
- `StatusBanner` exibido no `ApprovalPanel.tsx` com ícones e cores por estado
- Status exibido nos cards do dashboard (`DashboardPageClient.tsx`) via campo `latestStatus`
- ⚠️ Estado "In review" (cliente abriu) não é status formal — é `PENDING` + view tracking separado

---

## 6. Notificações básicas

- Email quando:
  - Cliente comenta
  - Cliente aprova

Status: ✅ Implementado

- Integração com Resend em `lib/email.ts` com templates HTML bilíngues (PT/EN)
- `sendNewReviewEmail()` — enviado quando entrega é criada (link para o cliente)
- `sendApprovalEmail()` — enviado quando cliente aprova
- `sendChangesRequestedEmail()` — enviado quando cliente solicita alterações
- ⚠️ Notificação quando cliente **comenta** não existe — apenas aprovação e alterações disparam e-mail

---

## 7. UX (experiência do usuário)

- Interface limpa
- Navegação intuitiva
- Cliente entende sem explicação

Status: ✅ Implementado

- Shell completa da página de revisão: `features/review/components/ReviewClientShell.tsx`
- Design escuro com accent violeta, responsivo via Tailwind
- Componentes focados em clareza: `ApprovalPanel`, `CommentSystem`, `ImageWithComments`, `VersionSwitcher`, `PasswordGate`, `FilePreview`
- Página para convidados (sem conta): `features/guest-review/components/GuestReviewShell.tsx`

---

# 🟡 FASE 2 — PRODUCT-MARKET FIT

Objetivo: tornar o produto indispensável.

---

## 8. Aprovação → ação automática

- Ao aprovar:
  - Atualiza status
  - Dispara evento interno
  - Preparação para webhooks

Status: ⚠️ Parcial

- ✅ Status é atualizado para `APPROVED` na rota de aprovação
- ✅ E-mail de notificação é disparado (fire & forget)
- ✅ Registro imutável criado no modelo `Approval` com timestamp e IP
- ❌ Nenhum webhook outbound implementado
- ❌ Nenhuma automação de pagamento encadeada
- ❌ Nenhum evento interno publicado para consumers externos

---

## 9. Pagamentos integrados

- Após aprovação:
  - Botão “Pagar agora”
- Integrações:
  - Pix
  - Stripe (futuro)

Status: ❌ Não implementado

- O billing atual (Stripe) é exclusivamente para assinaturas do freelancer na plataforma
- Nenhum fluxo de pagamento pós-aprovação existe para o cliente final
- Sem integração Pix
- Sem botão "Pagar agora" em nenhuma tela
- Abordagem sugerida: adicionar `paymentUrl` opcional na `Delivery`; exibir botão no `ApprovalPanel` após aprovação

---

## 10. Página de entrega profissional

- Branding do freelancer
- Interface bonita para o cliente
- Experiência premium

Status: ❌ Não implementado

- Branding fixo da ApproveFlow em todas as páginas de revisão
- O plano Pro lista "Custom branding (coming soon)" em `features/billing/plans.ts` mas sem implementação
- Sem campos de branding no modelo `Project` ou `User` (logo, cor primária, nome do estúdio)
- Abordagem sugerida: adicionar `brandLogo`, `brandColor`, `studioName` ao `User`; renderizar no `ReviewClientShell` quando disponíveis

---

## 11. Comentários avançados

- Threads (respostas)
- Marcar como resolvido

Status: ❌ Não implementado

- Modelo `Comment` no schema é plano — sem `parentCommentId`, sem campo `resolved`
- `CommentSystem.tsx` renderiza lista plana, sem respostas encadeadas
- Sem botão "Resolver" ou "Responder"
- Abordagem sugerida: adicionar `parentId` e `resolvedAt` ao modelo `Comment`; atualizar UI no `CommentSystem.tsx`

---

## 12. Notificações avançadas

- Cliente abriu o link
- Cliente visualizou
- (Futuro: WhatsApp)

Status: ⚠️ Parcial

- ✅ Rastreamento de views implementado: modelo `View` no schema (IP, userAgent, timestamp), registrado em `app/review/[token]/page.tsx`
- ✅ `lastViewedAt` exibido nos cards do dashboard
- ❌ Nenhuma notificação por e-mail enviada ao freelancer quando o cliente abre o link
- ❌ Sem histórico de views visível na UI do dashboard
- ❌ Sem integração WhatsApp

---

## 13. Dashboard simples

- Lista de projetos
- Status de cada projeto
- Visão geral

Status: ✅ Implementado

- Lista de projetos com status, data e stats: `app/(dashboard)/dashboard/DashboardPageClient.tsx`
- Cards de métricas: total de projetos, pendentes, aprovados, com alterações solicitadas
- Busca por nome e filtro por status
- Atualização em tempo real via Supabase Realtime
- Página de detalhe do projeto: `app/(dashboard)/dashboard/projects/[id]/`

---

## 14. Templates de projeto

- Tipos pré-configurados:
  - Logo
  - Website
  - Feature dev

Status: ❌ Não implementado

- Sem modelo `Template` no schema Prisma
- `NewProjectModal.tsx` tem formulário simples sem seleção de template
- `createProject()` aceita apenas `name`, `clientName`, `description`
- Abordagem sugerida: adicionar enum `ProjectType` (LOGO, WEBSITE, FEATURE, OTHER) ao modelo `Project`; usar no modal de criação

---

# 🔴 FASE 3 — ESCALA E DIFERENCIAL

Objetivo: criar vantagem competitiva forte (moat).

---

## 15. IA para feedback

- Resumo de comentários
- Sugestão de melhorias
- Checklist automático

Status: ❌ Não implementado

- Zero referências a OpenAI, Claude, Gemini ou qualquer LLM no código
- Comentários são armazenados mas sem processamento de IA
- Abordagem sugerida: Server Action em `features/review/actions/ai.ts` usando OpenAI para sumarizar comentários de uma entrega

---

## 16. Fluxos automatizados

- Aprovação → pagamento
- Pagamento → liberação final

Status: ⚠️ Parcial

- ✅ Aprovação → e-mail automático disparado
- ✅ Aprovação → status atualizado automaticamente
- ❌ Aprovação → pagamento: não existe
- ❌ Pagamento → liberação de download: não existe
- ❌ Nenhuma orchestração de fluxo de trabalho além do e-mail

---

## 17. Prova de aprovação (legal)

- Registro de aprovação
- Timestamp
- Histórico confiável

Status: ✅ Implementado

- Modelo `Approval` no schema armazena: `signerName`, `signerEmail`, `ipAddress`, `createdAt` (imutável)
- Registro criado na rota `app/api/review/[token]/approve/route.ts`
- ⚠️ Sem exportação do registro (PDF de prova, e-mail de confirmação com hash)
- ⚠️ Dados acessíveis apenas no banco — sem UI de histórico de aprovações no dashboard

---

## 18. Entrega final estruturada

- Download final
- Versão final bloqueada

Status: ✅ Implementado

- `DownloadFileButton` em `ReviewClientShell.tsx` com controle via `Delivery.allowDownload` (booleano)
- URLs assinadas de 2h geradas via Supabase (`app/review/[token]/page.tsx`)
- ⚠️ Sem "bloqueio" explícito de versão aprovada — versão aprovada é imutável por design mas sem enforcement visual
- ⚠️ Sem arquivo de entrega final diferenciado (ex: versão sem marca d'água após aprovação)

---

## 19. Integrações

- Notion
- Slack
- ClickUp
- Webhooks

Status: ❌ Não implementado

- Nenhuma infraestrutura de webhook outbound (apenas webhook inbound do Stripe em `app/api/billing/webhook/`)
- Sem modelos de integração no schema
- Sem Notion, Slack, ClickUp, Zapier ou webhooks customizados
- Abordagem sugerida: modelo `Webhook` no schema + fila de eventos internos disparados pós-aprovação

---

## 20. SEO + páginas públicas

- Landing pages:
  - /client-approval-tool
  - /design-feedback-tool

Status: ✅ Implementado

- Páginas EN: `app/client-approval-tool/`, `app/design-review-tool/`, `app/logo-feedback-tool/`, `app/ui-feedback-tool/`, `app/website-review-tool/`
- Páginas PT: `app/pt/aprovacao-layout/`, `app/pt/aprovar-design-cliente/`, `app/pt/feedback-design/`, e mais
- Templates reutilizáveis: `features/marketing/components/ToolLandingPage.tsx` (EN) e `ToolLandingPagePT.tsx` (PT)
- Componentes de marketing: `Hero`, `Features`, `HowItWorks`, `Pricing`, `CTA`
- Contexto bilíngue PT/EN: `features/marketing/context/lang-context.tsx`

---

## 21. Mobile-first

- UX otimizada para celular
- Experiência fluida via WhatsApp

Status: ✅ Implementado (parcialmente)

- ✅ Tailwind CSS com breakpoints responsivos em todos os componentes (`md:`, `sm:`, `lg:`)
- ✅ E-mails com `<meta name="viewport">` para mobile
- ✅ Elementos condicionais no mobile: `hidden sm:block` em `GuestReviewShell.tsx`
- ❌ Sem otimização específica para abertura via WhatsApp (deep link, preview rico)
- ❌ Sem PWA / instalação na tela inicial

---

# 🧠 INSTRUÇÕES PARA ANÁLISE

Para cada item:

1. Verifique se já existe no código
2. Marque como:
   - ✅ Implementado
   - ⚠️ Parcial
   - ❌ Não implementado
3. Se parcial:
   - explicar o que falta
4. Se implementado:
   - apontar onde está no código (arquivo/pasta)
5. Se não implementado:
   - sugerir abordagem de implementação

---

# 🎯 OBJETIVO FINAL

- Identificar gaps reais do produto
- Evitar retrabalho
- Priorizar próximas features com clareza
