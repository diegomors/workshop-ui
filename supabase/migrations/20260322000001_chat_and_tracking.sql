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

-- Apenas participantes do pedido (cliente + entregador do restaurante) podem ler
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
