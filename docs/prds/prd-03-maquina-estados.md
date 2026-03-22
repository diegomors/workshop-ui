# PRD-03: Máquina de Estados e Painel de Pedidos

**Scope:** 3 de 8
**Ciclo:** Primeiro (6 semanas)
**Semana(s):** 2-3
**Risco:** Médio
**Prioridade:** Bloqueante
**Última atualização:** 22 de Março de 2026

---

## Referências

- [Pitch](../shape-up/pitch-ciclo-1.md) — seção 6 (Máquina de Estados e Notificações)
- [Breadboarding](../shape-up/breadboarding.md) — seção 6 (Máquina de Estados e Notificações)
- [Kickoff](../shape-up/kickoff.md) — Scope 3

---

## Visão Geral

Este scope implementa o motor central do Mizz: o ciclo de vida do pedido como uma máquina de estados explícita, o painel kanban para admin/cozinha operarem, e a tela de acompanhamento do cliente com notificações em tempo real.

A máquina de estados é a invariante mais crítica do sistema — toda transição deve ser validada no backend. O Supabase Realtime é o mecanismo de notificação.

---

## Dependências

| Depende de | Motivo |
|---|---|
| PRD-01 | Auth, profiles, restaurants |
| PRD-02 | Itens do cardápio referenciados nos pedidos |

| Bloqueia | Motivo |
|---|---|
| PRD-04 | Mapa precisa de localização salva no pedido |
| PRD-05 | Pagamento cria pedidos com estado REALIZADO |
| PRD-06 | Rastreamento depende do estado EM_ROTA |
| PRD-07 | Relatórios usam order_status_history |

---

## Schema do Banco de Dados

```sql
-- ===========================================
-- ENUM: estados do pedido
-- ===========================================
CREATE TYPE order_status AS ENUM (
  'REALIZADO',
  'CONFIRMADO',
  'CANCELADO',
  'EM_PREPARO',
  'PRONTO_PARA_RETIRADA',
  'RETIRADO_PELO_CLIENTE',
  'EM_ROTA',
  'ENTREGUE'
);

-- ===========================================
-- orders
-- ===========================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  status order_status NOT NULL DEFAULT 'REALIZADO',
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  service_fee NUMERIC(10, 2) NOT NULL CHECK (service_fee >= 0),
  payment_intent_id TEXT,
  delivery_code CHAR(4),
  notes TEXT,
  customer_latitude DOUBLE PRECISION,
  customer_longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_restaurant_status ON orders(restaurant_id, status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Cliente vê seus próprios pedidos
CREATE POLICY "orders_select_customer"
  ON orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Staff do restaurante vê pedidos do restaurante
CREATE POLICY "orders_select_staff"
  ON orders FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
    OR
    restaurant_id IN (SELECT restaurant_id FROM restaurant_staff WHERE user_id = auth.uid())
  );

-- Entregador vê pedidos PRONTO_PARA_RETIRADA e EM_ROTA do restaurante
CREATE POLICY "orders_select_delivery"
  ON orders FOR SELECT
  TO authenticated
  USING (
    status IN ('PRONTO_PARA_RETIRADA', 'EM_ROTA', 'ENTREGUE')
    AND restaurant_id IN (
      SELECT restaurant_id FROM restaurant_staff
      WHERE user_id = auth.uid() AND role = 'entregador'
    )
  );

-- Inserção apenas via Server Action (service role)
-- Update apenas via Server Action (validação de transição)

-- ===========================================
-- order_items
-- ===========================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  modifiers_json JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Mesma visibilidade que orders (via join)
CREATE POLICY "order_items_select"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
    OR
    order_id IN (
      SELECT o.id FROM orders o
      WHERE o.restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
      OR o.restaurant_id IN (SELECT restaurant_id FROM restaurant_staff WHERE user_id = auth.uid())
    )
  );

-- ===========================================
-- order_status_history
-- ===========================================
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status order_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_status_history_order ON order_status_history(order_id);
CREATE INDEX idx_status_history_created ON order_status_history(created_at);

-- RLS
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "status_history_select"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
    OR
    order_id IN (
      SELECT o.id FROM orders o
      WHERE o.restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
      OR o.restaurant_id IN (SELECT restaurant_id FROM restaurant_staff WHERE user_id = auth.uid())
    )
  );

-- ===========================================
-- Trigger: updated_at automático
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- Habilitar Realtime para orders
-- ===========================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

---

## Máquina de Estados: Transições Válidas

```
Estado Atual              → Estados Permitidos          | Quem pode disparar
─────────────────────────────────────────────────────────────────────────────
REALIZADO                 → CONFIRMADO                  | admin
REALIZADO                 → CANCELADO                   | admin, cliente
CONFIRMADO                → EM_PREPARO                  | admin, cozinha
CONFIRMADO                → CANCELADO                   | admin, cliente
EM_PREPARO                → PRONTO_PARA_RETIRADA        | admin, cozinha
EM_PREPARO                → RETIRADO_PELO_CLIENTE       | admin
PRONTO_PARA_RETIRADA      → EM_ROTA                     | entregador
PRONTO_PARA_RETIRADA      → RETIRADO_PELO_CLIENTE       | admin
EM_ROTA                   → ENTREGUE                    | entregador
```

**Implementação:** Lookup table no backend (objeto/Map). Toda chamada `transitionOrder(orderId, newStatus)` valida:
1. Estado atual permite transição para o novo estado
2. O role do usuário tem permissão para essa transição
3. Se passa, atualiza `orders.status` e insere em `order_status_history`

### Notificações por Transição

| Transição → | Notificação ao Cliente |
|---|---|
| → REALIZADO | "Pedido enviado! Aguardando confirmação." |
| → CONFIRMADO | "Pedido confirmado! Em breve começa o preparo." |
| → CANCELADO | "Pedido cancelado. Estorno realizado automaticamente." |
| → EM_PREPARO | "Seu pedido está sendo preparado!" |
| → PRONTO_PARA_RETIRADA | "Pedido pronto! Entregador a caminho." |
| → EM_ROTA | "Seu pedido saiu para entrega!" |
| → RETIRADO_PELO_CLIENTE | "Pedido retirado. Bom apetite!" |
| → ENTREGUE | "Pedido entregue! Esperamos que goste." |

---

## User Stories e Critérios de Aceitação

### US-03.1: Transição de estado (Backend)

**Como** sistema, **quero** validar cada transição de estado, **para** garantir integridade do ciclo de vida do pedido.

**Critérios de aceitação:**
- [ ] Server Action `transitionOrder(orderId, newStatus)` valida transição e role
- [ ] Transição inválida retorna erro 400 com mensagem descritiva
- [ ] Role não autorizado retorna erro 403
- [ ] Cada transição insere registro em `order_status_history`
- [ ] `orders.status` e `orders.updated_at` são atualizados atomicamente

### US-03.2: Painel kanban de pedidos (Admin/Cozinha)

**Como** admin ou cozinha, **quero** ver pedidos organizados em colunas por estado, **para** gerenciar o fluxo de preparo.

**Critérios de aceitação:**
- [ ] Colunas: Novos (REALIZADO), Confirmados (CONFIRMADO), Em Preparo (EM_PREPARO), Aguardando Entrega (PRONTO_PARA_RETIRADA), Em Rota (EM_ROTA)
- [ ] Cada card exibe: número do pedido (últimos 4 chars do UUID), itens resumidos, horário de criação
- [ ] Botões de ação por coluna conforme breadboarding:
  - REALIZADO: Confirmar, Cancelar
  - CONFIRMADO: Iniciar Preparo, Cancelar
  - EM_PREPARO: Pronto!
  - PRONTO_PARA_RETIRADA: Cliente Retirou
  - EM_ROTA: apenas visualização
- [ ] Cancelar exige confirmação via modal
- [ ] Cards atualizam em tempo real via Supabase Realtime (sem refresh)
- [ ] Role `cozinha` vê apenas colunas CONFIRMADO a PRONTO_PARA_RETIRADA
- [ ] Notificação sonora ao chegar novo pedido (REALIZADO)

**Tela de referência:** Breadboarding seção 6 — [Tela: Painel de Pedidos]

### US-03.3: Acompanhamento do pedido (Cliente)

**Como** cliente, **quero** ver o estado atual do meu pedido e uma timeline de transições, **para** saber quando meu pedido chegará.

**Critérios de aceitação:**
- [ ] Tela exibe: número do pedido, estado atual (com ícone/cor), lista de itens, total
- [ ] Timeline vertical mostrando estados já percorridos com horário
- [ ] Estado atual atualiza em tempo real via Supabase Realtime
- [ ] Botão "Cancelar Pedido" visível apenas em REALIZADO e CONFIRMADO
- [ ] Ao cancelar: modal de confirmação → estorno automático (PRD-05)
- [ ] Notificação toast a cada mudança de estado

**Tela de referência:** Breadboarding seção 6 — [Tela: Acompanhamento do Pedido]

### US-03.4: Lista de pedidos do cliente

**Como** cliente, **quero** ver meus pedidos ativos e histórico, **para** acompanhar o que pedi.

**Critérios de aceitação:**
- [ ] Seção "Pedidos Ativos" mostra pedidos com status != CANCELADO, ENTREGUE, RETIRADO_PELO_CLIENTE
- [ ] Seção "Histórico" mostra pedidos finalizados (últimos 30 dias)
- [ ] Click em um pedido abre tela de acompanhamento

---

## Rotas de API / Server Actions

| Método | Rota / Action | Descrição | Auth | Input | Output |
|---|---|---|---|---|---|
| POST | `createOrder()` | Cria pedido (chamado pelo checkout) | cliente | `{ restaurantId, items[], customerLat?, customerLng?, notes? }` | `Order` |
| POST | `transitionOrder()` | Muda estado do pedido | autenticado (por role) | `{ orderId, newStatus }` | `Order` |
| GET | `getOrder(orderId)` | Detalhe do pedido | autenticado | `{ orderId }` | `Order + OrderItems + StatusHistory` |
| GET | `getRestaurantOrders(restaurantId)` | Pedidos do restaurante | admin/cozinha | `{ restaurantId, statuses? }` | `Order[]` |
| GET | `getCustomerOrders()` | Pedidos do cliente logado | cliente | — | `Order[]` |
| GET | `getOrderStatusHistory(orderId)` | Histórico de transições | autenticado | `{ orderId }` | `OrderStatusHistory[]` |

---

## Componentes de UI

| Componente | Tipo | Localização | Props principais |
|---|---|---|---|
| `OrderKanban` | Client | `app/(admin)/orders/` | `restaurantId` |
| `KanbanColumn` | Client | `app/(admin)/orders/` | `status, orders[], actions[]` |
| `OrderCard` | Client | `app/(admin)/orders/` | `order: Order` |
| `CancelOrderModal` | Client | `components/` | `orderId, onConfirm, onCancel` |
| `OrderTracking` | Client | `app/(client)/orders/[id]/` | `orderId` |
| `OrderTimeline` | Client | `app/(client)/orders/[id]/` | `history: StatusHistory[]` |
| `OrderStatusBadge` | Server | `components/` | `status: OrderStatus` |
| `OrderList` | Client | `app/(client)/orders/` | `orders: Order[]` |

---

## Estrutura de Arquivos Sugerida

```
app/
  (admin)/
    orders/
      page.tsx                      # Painel kanban
  (client)/
    orders/
      page.tsx                      # Lista de pedidos do cliente
      [id]/
        page.tsx                    # Acompanhamento do pedido

lib/
  order-machine.ts                  # Transições válidas, validação
  validations/
    order.ts                        # Schemas Zod para pedidos

types/
  order.ts                          # Order, OrderItem, OrderStatus, StatusHistory
```

---

## Regras de Negócio

1. **Transições são unidirecionais** — não é possível voltar a um estado anterior (exceto via CANCELADO que é terminal).
2. **CANCELADO e ENTREGUE e RETIRADO_PELO_CLIENTE são estados terminais** — sem transições a partir deles.
3. **Cancelamento só é permitido em REALIZADO e CONFIRMADO** — conforme regra do pitch.
4. **O delivery_code (4 dígitos) é gerado no momento da criação do pedido** (estado REALIZADO) — usado na confirmação de entrega (PRD-06).
5. **service_fee = total × 0.10** — calculado no server, nunca no client.
6. **modifiers_json em order_items é um snapshot** — armazena nome e preço no momento do pedido (desnormalizado propositalmente para histórico).
7. **Apenas um pedido ativo por cliente por restaurante** — evita duplicações acidentais.

---

## Tratamento de Erros e Edge Cases

| Cenário | Comportamento esperado |
|---|---|
| Transição inválida (ex: REALIZADO → EM_PREPARO) | Erro 400: "Transição não permitida de REALIZADO para EM_PREPARO" |
| Role não autorizado (ex: cliente tenta CONFIRMAR) | Erro 403: "Você não tem permissão para esta ação" |
| Pedido não encontrado | Erro 404 |
| Dois admins clicam "Confirmar" ao mesmo tempo | Primeiro ganha (verificação otimista de status); segundo recebe "Pedido já foi atualizado" |
| Realtime desconecta | Reconexão automática + polling a cada 30s como fallback |
| Cliente tenta cancelar em EM_PREPARO | Botão "Cancelar" não é renderizado; se forçado via API, retorna erro 400 |

---

## Cenários de Teste

### CT-03.1: Ciclo completo de pedido

**Dado** que um pedido está em REALIZADO
**Quando** o admin confirma, cozinha inicia preparo, cozinha marca pronto, entregador pega e confirma entrega
**Então** o pedido percorre: REALIZADO → CONFIRMADO → EM_PREPARO → PRONTO_PARA_RETIRADA → EM_ROTA → ENTREGUE

### CT-03.2: Cancelamento pelo cliente

**Dado** que meu pedido está em CONFIRMADO
**Quando** clico "Cancelar Pedido" e confirmo no modal
**Então** o estado muda para CANCELADO e vejo mensagem de estorno

### CT-03.3: Transição inválida rejeitada

**Dado** que um pedido está em EM_PREPARO
**Quando** um cliente tenta cancelar via API
**Então** recebe erro 400 "Transição não permitida"

### CT-03.4: Atualização em tempo real

**Dado** que estou na tela de acompanhamento com pedido CONFIRMADO
**Quando** a cozinha muda para EM_PREPARO
**Então** minha tela atualiza automaticamente (sem refresh) e exibo toast com a notificação

---

## Fora de Escopo

- Arrastar cards entre colunas no kanban (apenas botões)
- Notificações push (Web Push) — apenas in-app via Realtime
- Histórico de pedidos com paginação complexa
- Impressão de comanda

---

## Notas de Implementação

- Supabase Realtime: subscribir ao canal `orders:restaurant_id=eq.{id}` no painel admin, e `orders:customer_id=eq.{uid}` no acompanhamento do cliente.
- Gerar `delivery_code` como 4 dígitos aleatórios: `Math.floor(1000 + Math.random() * 9000).toString()`.
- `modifiers_json` formato: `[{ "name": "Sem Cebola", "price": 0 }, { "name": "Bacon Extra", "price": 5.00 }]`.
- Race condition no kanban: usar `UPDATE orders SET status = $new WHERE id = $id AND status = $current` — se 0 rows affected, retornar "já atualizado".
- Notificação sonora: usar Web Audio API com um beep curto (sem dependência externa).
