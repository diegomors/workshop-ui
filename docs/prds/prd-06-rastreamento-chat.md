# PRD-06: Rastreamento e Chat

**Scope:** 6 de 8
**Ciclo:** Primeiro (6 semanas)
**Semana(s):** 4-5
**Risco:** Alto
**Prioridade:** Importante
**Última atualização:** 22 de Março de 2026

---

## Referências

- [Pitch](../shape-up/pitch-ciclo-1.md) — seção 5 (Rastreamento e Encontro)
- [Breadboarding](../shape-up/breadboarding.md) — seção 5 (Rastreamento e Encontro)
- [Kickoff](../shape-up/kickoff.md) — Scope 6

---

## Visão Geral

A maior incerteza técnica do ciclo. Duas funcionalidades interligadas:

1. **Rastreamento em tempo real:** Quando o pedido entra em EM_ROTA, a posição do entregador é rastreada e exibida no mapa do cliente. Integração via SDK de mercado (HyperTrack ou Radar.io).

2. **Chat de texto:** Canal simples de comunicação entre cliente e entregador para resolver o "último metro" ("Estou de camiseta vermelha perto do palco"). Implementado via Supabase Realtime.

3. **Confirmação de entrega:** Entregador insere código de 4 dígitos (informado pelo cliente) para confirmar a entrega.

O pitch define claramente: o ciclo é de **integração**, não de construção de infraestrutura.

---

## Dependências

| Depende de | Motivo |
|---|---|
| PRD-01 | Auth, profiles |
| PRD-03 | Estado EM_ROTA dispara rastreamento; estado ENTREGUE encerra |
| PRD-04 | Componente MapView reutilizado para exibir posição do entregador |

| Bloqueia | Motivo |
|---|---|
| PRD-08 | Testes E2E incluem fluxo de entrega |

---

## Schema do Banco de Dados

```sql
-- ===========================================
-- chat_messages
-- ===========================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  message TEXT NOT NULL CHECK (char_length(message) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_order ON chat_messages(order_id, created_at);

-- RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Apenas participantes do pedido (cliente + entregador do restaurante) podem ler/escrever
CREATE POLICY "chat_select_participant"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
    OR
    sender_id = auth.uid()
    OR
    order_id IN (
      SELECT o.id FROM orders o
      JOIN restaurant_staff rs ON rs.restaurant_id = o.restaurant_id
      WHERE rs.user_id = auth.uid() AND rs.role = 'entregador'
    )
  );

CREATE POLICY "chat_insert_participant"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
      OR
      order_id IN (
        SELECT o.id FROM orders o
        JOIN restaurant_staff rs ON rs.restaurant_id = o.restaurant_id
        WHERE rs.user_id = auth.uid() AND rs.role = 'entregador'
      )
    )
  );

-- ===========================================
-- Habilitar Realtime para chat_messages
-- ===========================================
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ===========================================
-- delivery_tracking (posições do entregador)
-- ===========================================
CREATE TABLE delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  deliverer_id UUID NOT NULL REFERENCES profiles(id),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_delivery_tracking_order ON delivery_tracking(order_id, created_at DESC);

-- RLS
ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;

-- Cliente do pedido pode ler posições
CREATE POLICY "tracking_select_customer"
  ON delivery_tracking FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
  );

-- Entregador pode inserir suas posições
CREATE POLICY "tracking_insert_deliverer"
  ON delivery_tracking FOR INSERT
  TO authenticated
  WITH CHECK (deliverer_id = auth.uid());

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_tracking;
```

---

## User Stories e Critérios de Aceitação

### US-06.1: Rastreamento do entregador em tempo real

**Como** cliente com pedido EM_ROTA, **quero** ver a posição do entregador no mapa, **para** saber quando ele chegará.

**Critérios de aceitação:**
- [ ] Mapa exibe pin verde (entregador) atualizando em tempo real
- [ ] Pin azul marca a localização salva do cliente (do pedido)
- [ ] Distância estimada exibida e atualizada
- [ ] Nome do entregador exibido
- [ ] Atualização a cada 5-10 segundos (aceitável conforme pitch)
- [ ] Se posição não atualiza há mais de 30s, exibir "Última posição: X segundos atrás"

**Tela de referência:** Breadboarding seção 5 — [Tela: Acompanhamento do Pedido] Estado EM_ROTA

### US-06.2: Entregador compartilha localização

**Como** entregador, **quero** que minha localização seja compartilhada automaticamente ao iniciar entrega, **para** que o cliente me encontre.

**Critérios de aceitação:**
- [ ] Ao transicionar para EM_ROTA, ativar rastreamento GPS
- [ ] Posição enviada a cada 5 segundos via Supabase Realtime ou SDK
- [ ] Se GPS negado, exibir alerta e sugerir ativar localização
- [ ] Rastreamento encerra automaticamente ao transicionar para ENTREGUE
- [ ] Indicador visual de que rastreamento está ativo

### US-06.3: Chat entre cliente e entregador

**Como** cliente ou entregador, **quero** trocar mensagens de texto, **para** combinar o ponto de encontro.

**Critérios de aceitação:**
- [ ] Tela de chat exibe mensagens em ordem cronológica
- [ ] Campo de input de texto (max 500 caracteres)
- [ ] Botão "Enviar" (ou Enter) envia mensagem
- [ ] Mensagem aparece instantaneamente para ambos via Supabase Realtime
- [ ] Mensagens do remetente à direita, do destinatário à esquerda
- [ ] Scroll automático para última mensagem
- [ ] Chat disponível apenas em estados EM_ROTA e PRONTO_PARA_RETIRADA
- [ ] Sem envio de mídia (texto apenas, conforme pitch)

**Tela de referência:** Breadboarding seção 5 — [Tela: Chat]

### US-06.4: Confirmação de entrega com código

**Como** entregador, **quero** confirmar a entrega inserindo o código de 4 dígitos do cliente, **para** registrar que o pedido foi entregue.

**Critérios de aceitação:**
- [ ] Botão "Entreguei" no mapa de navegação
- [ ] Modal solicita código de 4 dígitos
- [ ] Input numérico com 4 campos (OTP style)
- [ ] Código correto → estado ENTREGUE, tela de sucesso "Entrega realizada com sucesso!"
- [ ] Código incorreto → mensagem "Código inválido. Tente novamente." Modal permanece aberto
- [ ] Máximo 5 tentativas; após 5 erros, bloquear por 2 minutos
- [ ] Botão "Cancelar" volta ao mapa

**Tela de referência:** Breadboarding seção 5 — [Modal: Código de Confirmação]

### US-06.5: Cliente vê seu código de entrega

**Como** cliente, **quero** ver meu código de entrega, **para** informar ao entregador quando ele chegar.

**Critérios de aceitação:**
- [ ] Código de 4 dígitos exibido na tela de acompanhamento quando estado = EM_ROTA
- [ ] Código em destaque (fonte grande, negrito)
- [ ] Texto explicativo: "Informe este código ao entregador para confirmar a entrega"

---

## Rotas de API / Server Actions

| Método | Rota / Action | Descrição | Auth | Input | Output |
|---|---|---|---|---|---|
| POST | `sendChatMessage()` | Envia mensagem no chat | cliente/entregador | `{ orderId, message }` | `ChatMessage` |
| GET | `getChatMessages(orderId)` | Lista mensagens do pedido | cliente/entregador | `{ orderId }` | `ChatMessage[]` |
| POST | `updateDelivererPosition()` | Atualiza posição do entregador | entregador | `{ orderId, lat, lng, accuracy? }` | `void` |
| GET | `getLatestDelivererPosition(orderId)` | Última posição do entregador | cliente | `{ orderId }` | `{ lat, lng, updatedAt }` |
| POST | `confirmDelivery()` | Confirma entrega com código | entregador | `{ orderId, code }` | `{ success } ou { error }` |

---

## Componentes de UI

| Componente | Tipo | Localização | Props principais |
|---|---|---|---|
| `DeliveryTrackingMap` | Client | `app/(client)/orders/[id]/` | `order, delivererPosition` |
| `DelivererPositionPin` | Client | `components/map/` | `position, lastUpdate` |
| `ChatScreen` | Client | `app/(client)/orders/[id]/chat/` | `orderId` |
| `ChatMessage` | Client | `components/chat/` | `message, isMine` |
| `ChatInput` | Client | `components/chat/` | `onSend, maxLength` |
| `DeliveryCodeDisplay` | Client | `app/(client)/orders/[id]/` | `code: string` |
| `DeliveryCodeModal` | Client | `app/(delivery)/orders/[id]/` | `orderId, onSuccess` |
| `OtpInput` | Client | `components/` | `length, onChange, value` |
| `TrackingIndicator` | Client | `app/(delivery)/` | `isActive: boolean` |

---

## Estrutura de Arquivos Sugerida

```
app/
  (client)/
    orders/
      [id]/
        page.tsx                    # Acompanhamento (inclui mapa se EM_ROTA)
        chat/
          page.tsx                  # Chat com entregador
  (delivery)/
    orders/
      [id]/
        page.tsx                    # Mapa de navegação do entregador
        chat/
          page.tsx                  # Chat com cliente

components/
  chat/
    chat-screen.tsx
    chat-message.tsx
    chat-input.tsx
  map/
    deliverer-position-pin.tsx

lib/
  hooks/
    use-chat.ts                     # Hook para Supabase Realtime chat
    use-delivery-tracking.ts        # Hook para rastreamento de posição
  tracking/
    position-sender.ts              # Lógica de envio de posição (entregador)
```

---

## Regras de Negócio

1. **Rastreamento ativo apenas em EM_ROTA** — ativa na transição para EM_ROTA, desativa na transição para ENTREGUE.
2. **Chat disponível apenas em PRONTO_PARA_RETIRADA e EM_ROTA** — antes disso, não há entregador associado.
3. **Mensagens de chat são texto puro**, máximo 500 caracteres. Sem mídia, sem links clicáveis, sem formatação.
4. **Código de entrega (delivery_code) é gerado no momento da criação do pedido** (REALIZADO) — 4 dígitos aleatórios.
5. **Máximo 5 tentativas de código errado** — após isso, bloquear por 2 minutos (evitar brute force).
6. **Frequência de atualização: 5-10 segundos** — aceitável conforme pitch. Não otimizar para menos.
7. **Se GPS do entregador é negado, chat é o fallback** — sistema funciona sem rastreamento.

---

## Tratamento de Erros e Edge Cases

| Cenário | Comportamento esperado |
|---|---|
| GPS do entregador negado | Alerta: "Ative a localização para rastreamento". Chat funciona normalmente como fallback |
| GPS perde sinal temporariamente | Manter último ponto no mapa. Exibir "Última posição: X segundos atrás" após 30s |
| Entregador fecha o navegador | Rastreamento para. Cliente vê posição estática + usa chat |
| Chat desconecta (Realtime) | Reconexão automática. Mensagens perdidas recuperadas via `getChatMessages()` |
| Código de entrega errado 5x | Bloquear input por 2 minutos. Exibir countdown |
| Mensagem muito longa (>500 chars) | Input trunca em 500. Counter visível mostrando caracteres restantes |
| Pedido muda de estado durante chat | Chat fecha se estado sair de PRONTO_PARA_RETIRADA/EM_ROTA |

---

## Cenários de Teste

### CT-06.1: Rastreamento em tempo real

**Dado** que meu pedido está em EM_ROTA
**Quando** o entregador se move
**Então** vejo o pin verde atualizar no mapa a cada 5-10 segundos

### CT-06.2: Chat funcional

**Dado** que meu pedido está em EM_ROTA
**Quando** envio "Estou na barraca azul"
**Então** o entregador vê minha mensagem instantaneamente e pode responder

### CT-06.3: Confirmação de entrega com código correto

**Dado** que sou entregador e clico "Entreguei"
**Quando** insiro o código correto de 4 dígitos
**Então** o pedido muda para ENTREGUE e vejo "Entrega realizada com sucesso!"

### CT-06.4: Código incorreto

**Dado** que insiro um código errado
**Quando** clico confirmar
**Então** vejo "Código inválido. Tente novamente." e o modal permanece aberto

### CT-06.5: GPS negado (fallback)

**Dado** que o entregador negou permissão de GPS
**Quando** o pedido está em EM_ROTA
**Então** o mapa do cliente não mostra pin do entregador, mas o chat funciona normalmente

---

## Fora de Escopo

- Histórico de chat após entrega (mensagens não são retidas indefinidamente)
- Envio de fotos, áudio ou vídeo no chat
- Rastreamento sem SDK (construir do zero)
- Navegação turn-by-turn (entregador decide o caminho)
- Rastreamento de múltiplos entregadores simultâneos por pedido

---

## Notas de Implementação

- **Decisão SDK:** Se HyperTrack/Radar.io se mostrar complexo demais na POC (Semana 4), fallback para rastreamento simples via `navigator.geolocation.watchPosition()` + Supabase Realtime insert na tabela `delivery_tracking`. Isso cobre 90% do caso de uso sem SDK externo.
- **Supabase Realtime para chat:** Subscribe ao canal `chat_messages:order_id=eq.{orderId}`. Usar `INSERT` event para novas mensagens.
- **Supabase Realtime para tracking:** Subscribe ao canal `delivery_tracking:order_id=eq.{orderId}`. Apenas o último registro importa.
- **Delivery code:** Gerar com `Math.floor(1000 + Math.random() * 9000).toString()` — garante 4 dígitos (1000-9999).
- **Cleanup de tracking data:** Posições antigas podem ser deletadas por cron job (Supabase pg_cron) após 24h. Não é prioritário para o MVP.
