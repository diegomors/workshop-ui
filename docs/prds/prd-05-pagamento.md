# PRD-05: Pagamento e Monetização

**Scope:** 5 de 8
**Ciclo:** Primeiro (6 semanas)
**Semana(s):** 3-4
**Risco:** Alto
**Prioridade:** Bloqueante
**Última atualização:** 22 de Março de 2026

---

## Referências

- [Pitch](../shape-up/pitch-ciclo-1.md) — seção 3 (Pagamento e Monetização)
- [Breadboarding](../shape-up/breadboarding.md) — seção 3 (Pagamento e Monetização)
- [Kickoff](../shape-up/kickoff.md) — Scope 5

---

## Visão Geral

Este é o scope de maior risco do ciclo. Integra o Mizz com um gateway de pagamento (Stripe Connect ou Pagar.me) para processar pagamentos com split automático: 90% para o restaurante, 10% para o Mizz. Suporta cartão de crédito e Pix.

O fluxo: cliente monta o carrinho (PRD-02) → checkout com taxa de 10% → pagamento → webhook confirma → pedido criado com estado REALIZADO (PRD-03). Cancelamento em REALIZADO/CONFIRMADO gera estorno total.

**Decisão gateway:** A escolha entre Stripe Connect e Pagar.me será feita no início da Semana 3. Este PRD usa Stripe Connect como referência, mas a arquitetura é a mesma para ambos.

---

## Dependências

| Depende de | Motivo |
|---|---|
| PRD-01 | Auth, profiles, restaurants |
| PRD-02 | Carrinho com itens e preços |
| PRD-03 | Criação do pedido com estado REALIZADO |

| Bloqueia | Motivo |
|---|---|
| PRD-06 | Entrega só ocorre após pagamento |

---

## Schema do Banco de Dados

```sql
-- ===========================================
-- Adicionar conta Stripe ao restaurante
-- (tabela restaurants já existe no PRD-01)
-- ===========================================
ALTER TABLE restaurants ADD COLUMN stripe_account_id TEXT;

-- ===========================================
-- payment_events (log de eventos do gateway)
-- ===========================================
CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  event_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_events_order ON payment_events(order_id);
CREATE INDEX idx_payment_events_stripe ON payment_events(stripe_event_id);

-- RLS: apenas server-side (service role) acessa esta tabela
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
-- Sem policies para authenticated — apenas service role acessa
```

---

## User Stories e Critérios de Aceitação

### US-05.1: Tela de checkout com taxa de serviço

**Como** cliente, **quero** ver o resumo do pedido com a taxa de serviço antes de pagar, **para** saber exatamente quanto pagarei.

**Critérios de aceitação:**
- [ ] Exibe lista de itens com modificadores e preços
- [ ] Exibe subtotal do pedido
- [ ] Exibe taxa de serviço (10% do subtotal)
- [ ] Exibe total a pagar (subtotal + taxa)
- [ ] Checkbox obrigatório: "Entendo que após o preparo iniciar, o pedido não pode ser cancelado"
- [ ] Botão "Pagar" desabilitado até checkbox marcado
- [ ] Campo opcional "Observações" (texto livre, max 500 chars)

**Tela de referência:** Breadboarding seção 3 — [Tela: Resumo do Pedido]

### US-05.2: Pagamento via cartão de crédito

**Como** cliente, **quero** pagar com cartão de crédito, **para** finalizar meu pedido.

**Critérios de aceitação:**
- [ ] Formulário de cartão renderizado via Stripe Elements (PCI compliance)
- [ ] Campos: número do cartão, validade, CVV, nome no cartão
- [ ] Validação em tempo real (Stripe Elements faz isso nativamente)
- [ ] Loading state durante processamento
- [ ] Sucesso → tela de confirmação
- [ ] Falha → mensagem de erro + opção de tentar novamente

**Tela de referência:** Breadboarding seção 3 — [Tela: Pagamento] Opção Cartão

### US-05.3: Pagamento via Pix

**Como** cliente, **quero** pagar via Pix, **para** usar meu método de pagamento preferido.

**Critérios de aceitação:**
- [ ] Ao selecionar Pix, QR Code é gerado via API do gateway
- [ ] QR Code exibido em tela com código para copiar/colar
- [ ] Timer de expiração do QR Code (ex: 15 minutos)
- [ ] Polling ou webhook para detectar pagamento completado
- [ ] Sucesso → tela de confirmação
- [ ] Expiração → mensagem "QR Code expirado" + opção de gerar novo

**Tela de referência:** Breadboarding seção 3 — [Tela: Pagamento] Opção Pix

### US-05.4: Confirmação de pagamento via webhook

**Como** sistema, **quero** receber confirmação de pagamento via webhook, **para** criar o pedido com segurança.

**Critérios de aceitação:**
- [ ] Endpoint `/api/webhooks/stripe` recebe eventos do Stripe
- [ ] Verifica assinatura do webhook (segurança)
- [ ] Evento `payment_intent.succeeded` → cria pedido com estado REALIZADO
- [ ] Evento `payment_intent.payment_failed` → loga falha, não cria pedido
- [ ] Split automático: 90% transferido para a conta conectada do restaurante
- [ ] Evento logado em `payment_events` para auditoria
- [ ] Idempotência: mesmo evento processado duas vezes não cria pedido duplicado

### US-05.5: Estorno em cancelamento

**Como** sistema, **quero** estornar o pagamento ao cancelar um pedido, **para** devolver o dinheiro ao cliente.

**Critérios de aceitação:**
- [ ] Ao transicionar para CANCELADO (PRD-03), Server Action chama API de estorno
- [ ] Estorno é do valor total (pedido + taxa de serviço)
- [ ] Evento de estorno logado em `payment_events`
- [ ] Se estorno falhar, loga erro mas mantém pedido como CANCELADO (reconciliação manual)
- [ ] Mensagem ao cliente: "Pedido cancelado. Estorno realizado automaticamente."

### US-05.6: Onboarding do restaurante no Stripe

**Como** admin/dono do restaurante, **quero** conectar minha conta ao Stripe, **para** receber pagamentos.

**Critérios de aceitação:**
- [ ] Botão "Conectar com Stripe" nas configurações do restaurante
- [ ] Redireciona para Stripe Connect Onboarding (OAuth)
- [ ] Após onboarding, `stripe_account_id` é salvo no restaurante
- [ ] Restaurante sem `stripe_account_id` não pode receber pedidos (cardápio visível mas checkout bloqueado)

---

## Rotas de API / Server Actions

| Método | Rota / Action | Descrição | Auth | Input | Output |
|---|---|---|---|---|---|
| POST | `createPaymentIntent()` | Cria Payment Intent com split | cliente | `{ restaurantId, items[], notes? }` | `{ clientSecret, paymentIntentId }` |
| POST | `createPixPayment()` | Gera QR Code Pix | cliente | `{ paymentIntentId }` | `{ qrCode, qrCodeUrl, expiresAt }` |
| POST | `/api/webhooks/stripe` | Webhook do Stripe | público (assinatura) | Stripe Event | 200 OK |
| POST | `refundPayment()` | Estorno de pagamento | sistema (service role) | `{ paymentIntentId }` | `{ refundId }` |
| POST | `createStripeConnectLink()` | Link de onboarding Stripe | admin | `{ restaurantId }` | `{ url }` |
| GET | `getStripeAccountStatus()` | Status da conta conectada | admin | `{ restaurantId }` | `{ isActive, detailsSubmitted }` |

---

## Componentes de UI

| Componente | Tipo | Localização | Props principais |
|---|---|---|---|
| `CheckoutSummary` | Client | `app/(client)/checkout/` | `cartItems, subtotal, serviceFee, total` |
| `CancellationCheckbox` | Client | `app/(client)/checkout/` | `checked, onChange` |
| `PaymentMethodSelector` | Client | `app/(client)/checkout/` | `selected, onSelect` |
| `CardPaymentForm` | Client | `app/(client)/checkout/` | `clientSecret, onSuccess, onError` |
| `PixPayment` | Client | `app/(client)/checkout/` | `qrCode, expiresAt, onPaid` |
| `OrderConfirmation` | Server | `app/(client)/checkout/confirmation/` | `orderId` |
| `StripeConnectButton` | Client | `app/(admin)/settings/` | `restaurantId` |

---

## Estrutura de Arquivos Sugerida

```
app/
  (client)/
    checkout/
      page.tsx                      # Checkout com resumo e pagamento
      confirmation/
        page.tsx                    # Confirmação do pedido
  (admin)/
    settings/
      page.tsx                      # Config do restaurante (inclui Stripe)
  api/
    webhooks/
      stripe/
        route.ts                    # Webhook handler

lib/
  stripe/
    client.ts                       # Stripe instance (server-side)
    connect.ts                      # Funções de Stripe Connect
  validations/
    checkout.ts                     # Schemas Zod para checkout
```

---

## Regras de Negócio

1. **Taxa de serviço = 10% do subtotal**, arredondado a 2 casas decimais (`Math.round(subtotal * 10) / 100`).
2. **Split: 90% para o restaurante, 10% para o Mizz** — feito via `transfer_data` do Stripe Connect.
3. **O pedido SÓ é criado após confirmação do webhook** — nunca no client.
4. **Estorno é sempre total (pedido + taxa)** — não há estorno parcial (no-go).
5. **Restaurante sem `stripe_account_id` não aceita pedidos** — checkout exibe "Restaurante não disponível para pedidos".
6. **Idempotência:** `payment_intent_id` é unique; webhook usa `stripe_event_id` para dedup.
7. **Checkbox de cancelamento é obrigatório** — sem ele, o botão "Pagar" fica desabilitado.

---

## Tratamento de Erros e Edge Cases

| Cenário | Comportamento esperado |
|---|---|
| Cartão recusado | Mensagem: "Pagamento não aprovado. Verifique os dados ou tente outro cartão." |
| Cartão com fundos insuficientes | Mensagem: "Saldo insuficiente. Tente outro cartão." |
| QR Code Pix expirado | Mensagem: "QR Code expirado." + botão "Gerar novo QR Code" |
| Webhook recebido duplicado | Ignora (verificação por `stripe_event_id`) |
| Webhook com assinatura inválida | Retorna 400, loga tentativa |
| Estorno falha na API | Loga erro, pedido continua CANCELADO, alerta admin para reconciliação |
| Restaurante sem Stripe | Checkout exibe "Este restaurante ainda não aceita pedidos online" |
| Timeout na criação do Payment Intent | Toast: "Erro de conexão. Tente novamente." |
| Usuário fecha aba durante pagamento | Webhook processa normalmente; pedido criado; cliente vê na lista de pedidos ao voltar |

---

## Cenários de Teste

### CT-05.1: Pagamento com cartão (modo teste)

**Dado** que tenho itens no carrinho e o checkbox marcado
**Quando** preencho o cartão de teste (4242...) e clico "Pagar"
**Então** vejo tela de confirmação com número do pedido e link para acompanhamento

### CT-05.2: Pagamento com Pix

**Dado** que seleciono Pix como método de pagamento
**Quando** o QR Code é gerado
**Então** vejo o QR Code e, após simular pagamento, sou redirecionado para confirmação

### CT-05.3: Taxa de serviço calculada corretamente

**Dado** que meu subtotal é R$100,00
**Quando** vejo o checkout
**Então** taxa de serviço é R$10,00 e total é R$110,00

### CT-05.4: Estorno em cancelamento

**Dado** que meu pedido está em REALIZADO
**Quando** cancelo o pedido
**Então** o estorno é processado e vejo "Estorno realizado automaticamente"

### CT-05.5: Webhook idempotente

**Dado** que o webhook `payment_intent.succeeded` é recebido
**Quando** o mesmo evento é enviado novamente
**Então** nenhum pedido duplicado é criado

---

## Fora de Escopo

- Estorno parcial
- Múltiplos métodos de pagamento por pedido
- Cartão salvo / tokenização
- Boleto bancário
- Assinatura / pagamento recorrente
- Dashboard financeiro para o restaurante (usa Stripe Dashboard)

---

## Notas de Implementação

- **Stripe Elements:** Usar `@stripe/stripe-js` + `@stripe/react-stripe-js`. Componente `PaymentElement` lida com PCI compliance.
- **Stripe Connect:** Tipo "Standard" para onboarding simplificado. Usar `transfer_data.destination` no PaymentIntent para split.
- **Webhook:** Usar `stripe.webhooks.constructEvent()` para verificar assinatura. **Não usar body parser** — precisa do raw body. No Next.js App Router: `export const config = { api: { bodyParser: false } }` não se aplica; usar `request.text()` no Route Handler.
- **Variáveis de ambiente:** `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`. **Nunca** expor `SECRET_KEY` no client.
- **Modo teste:** Usar chaves de teste do Stripe desde o dia 1. Cartão de teste: `4242 4242 4242 4242`.
