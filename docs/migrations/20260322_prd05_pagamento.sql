-- ===========================================
-- PRD-05: Pagamento e Monetização
-- ===========================================

-- Adicionar conta Stripe ao restaurante
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
