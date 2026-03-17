# ApproveFlow — Feature Audit (March 17, 2026)

Auditoria de todas as funcionalidades expostas nos planos de pricing versus o que está realmente implementado no sistema.

---

## ✅ Implementadas e funcionando

| Feature                         | Plano        | Detalhe                                                 |
| ------------------------------- | ------------ | ------------------------------------------------------- |
| 3 active projects (limite FREE) | FREE         | Enforced em `lib/billing/limits.ts::canCreateProject()` |
| Unlimited projects              | PRO / STUDIO | `maxProjects=null` para tiers pagos                     |
| Public review links             | Todos        | `/review/[token]` acessível sem auth                    |
| Approval flow                   | Todos        | Workflow completo com signer tracking e API routes      |
| Custom link expiration          | PRO / STUDIO | `expiresAt` verificado na API — retorna 410 se expirado |
| Unlimited version history       | PRO / STUDIO | Sem limite de versões, todas exibidas na UI             |

---

## ⚠️ Parcialmente implementadas

| Feature                            | Plano        | O que existe                                        | O que falta                                                        |
| ---------------------------------- | ------------ | --------------------------------------------------- | ------------------------------------------------------------------ |
| **Version history (3 versions)**   | FREE         | Versões são rastreadas e incrementadas              | Limite 3 **nunca é checado** — free users sobem versões ilimitadas |
| **Email notifications**            | Todos        | Endereço de email salvo no banco                    | Nenhum email enviado — falta integração Resend/SendGrid            |
| **Email verification for clients** | PRO / STUDIO | Campo `requiresEmail` existe no schema              | A API não valida o campo; sem fluxo de OTP/confirmação             |
| **Activity tracking & logs**       | PRO / STUDIO | Modelos `View`, `Comment`, `Approval` coletam dados | Não existe dashboard de logs — dashboard mostra só "last viewed"   |

---

## ❌ Não implementadas (apenas no papel)

| Feature                                    | Plano        | Status                                                             |
| ------------------------------------------ | ------------ | ------------------------------------------------------------------ |
| **Storage quotas** (5 GB / 50 GB / 200 GB) | Todos        | `fileSize` salvo no banco mas nunca agregado nem verificado        |
| **Password-protected links**               | PRO / STUDIO | Campo `password` no schema, sem UI, sem hash, sem validação na API |
| **Priority notifications**                 | PRO / STUDIO | Dependente do sistema de email inexistente                         |
| **Team collaboration**                     | STUDIO       | Sem modelo `Team`, sem permissões de membros                       |
| **API access**                             | STUDIO       | Sem geração de API keys                                            |
| **Custom branding & white-label**          | STUDIO       | Nenhum código implementado                                         |
| **Bulk project operations**                | STUDIO       | Nenhum endpoint de bulk                                            |
| **Dedicated support**                      | STUDIO       | N/A (não técnico)                                                  |
| **Invoice after approval**                 | STUDIO       | Nenhuma lógica de invoice ou trigger de billing pós-aprovação      |

---

## Ações prioritárias

### Críticas (features anunciadas que enganam o usuário)

1. **Version limit FREE** — adicionar check em `lib/actions/deliveries.ts` antes de criar nova versão; retornar erro se `versionNumber >= 3` para plano FREE
2. **Storage quotas** — agregar `fileSize` por usuário/projeto via query Prisma; validar no upload antes de subir para Supabase
3. **Password-protected links** — completar: campo de senha no `NewDeliveryModal`, hash com bcryptjs, verificação nos routes `/review/[token]`; ou remover do pricing
4. **Email** — integrar Resend (ou SendGrid) para notificações de novo review e aprovação; sem isso "Email notifications" e "Priority notifications" são falsas promessas

### Alta prioridade

5. **Email verification for clients** — implementar fluxo OTP: ao abrir link, pedir email → enviar código → validar antes de exibir arquivos
6. **Activity logs dashboard** — página `/dashboard/projects/[id]/activity` listando views, comments e approvals com timestamps

### Backlog (STUDIO)

7. Team collaboration — modelo `Team` + membros no schema + UI
8. API access — geração e validação de API keys
9. Custom branding — campos de logo/cor por workspace
10. Bulk operations — endpoints e UI para operações em massa
11. Invoice after approval — status de invoice no modelo `Delivery` + trigger pós-aprovação
