# ApproveFlow — Feature Audit (March 19, 2026)

Funcionalidades anunciadas nos planos de pricing que **ainda não estão completas**.

---

## ⚠️ Parcialmente implementadas

| Feature                                    | Plano        | O que existe                                                                                      | O que falta                                                                                                                                 |
| ------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Storage quotas** (5 GB / 50 GB / 200 GB) | Todos        | `canUploadFile()` em `features/billing/limits.ts` agrega `fileSize` e valida no fluxo autenticado | `app/api/guest/upload/route.ts` **não chama** `canUploadFile()` — guest uploads têm apenas limite de 20 MB por arquivo, sem quota acumulada |
| **Email verification for clients**         | PRO / STUDIO | Campo `requiresEmail` salvo no banco; `createDelivery` o persiste                                 | A review page **não verifica** o campo — nenhum fluxo OTP/email-gate implementado                                                           |

---

## ❌ Não implementadas (apenas no papel)

| Feature                           | Plano        | Status                                                                                                    |
| --------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| **Priority notifications**        | PRO / STUDIO | Dependente de lógica de prioridade inexistente; emails básicos já funcionam mas sem diferenciação de tier |
| **Team collaboration**            | STUDIO       | Sem modelo `Team`, sem permissões de membros                                                              |
| **API access**                    | STUDIO       | Sem geração de API keys                                                                                   |
| **Custom branding & white-label** | STUDIO       | Nenhum código implementado                                                                                |
| **Bulk project operations**       | STUDIO       | Nenhum endpoint de bulk                                                                                   |
| **Dedicated support**             | STUDIO       | N/A (não técnico)                                                                                         |
| **Invoice after approval**        | STUDIO       | Nenhuma lógica de invoice ou trigger de billing pós-aprovação                                             |

---

## Ações prioritárias

### Críticas

1. **Storage quotas — guest upload** — `app/api/guest/upload/route.ts` precisa chamar `canUploadFile()` (já existe em `features/billing/limits.ts`) antes de emitir URL de upload para o Supabase

### Alta prioridade

2. **Email verification for clients** — implementar fluxo OTP: ao abrir link com `requiresEmail=true`, pedir email → enviar código via Resend → validar antes de exibir arquivos

### Backlog (STUDIO)

3. Team collaboration — modelo `Team` + membros no schema + UI
4. API access — geração e validação de API keys
5. Custom branding — campos de logo/cor por workspace
6. Bulk operations — endpoints e UI para operações em massa
7. Invoice after approval — status de invoice no modelo `Delivery` + trigger pós-aprovação
