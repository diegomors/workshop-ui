-- ===========================================
-- PRD-03: Máquina de Estados e Painel de Pedidos
-- ===========================================

-- 1. ENUM: estados do pedido
DO $$ BEGIN
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
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. orders
CREATE TABLE IF NOT EXISTS orders (
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

CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status ON orders(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- RLS orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_customer" ON orders;
CREATE POLICY "orders_select_customer"
  ON orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "orders_select_staff" ON orders;
CREATE POLICY "orders_select_staff"
  ON orders FOR SELECT
  TO authenticated
  USING (
    check_is_restaurant_owner(restaurant_id)
    OR
    check_is_restaurant_staff(restaurant_id)
  );

DROP POLICY IF EXISTS "orders_select_delivery" ON orders;
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

-- 3. order_items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  modifiers_json JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- RLS order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select" ON order_items;
CREATE POLICY "order_items_select"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
    OR
    order_id IN (
      SELECT o.id FROM orders o
      WHERE check_is_restaurant_owner(o.restaurant_id)
      OR check_is_restaurant_staff(o.restaurant_id)
    )
  );

-- 4. order_status_history
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status order_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_status_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_status_history_created ON order_status_history(created_at);

-- RLS order_status_history
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "status_history_select" ON order_status_history;
CREATE POLICY "status_history_select"
  ON order_status_history FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
    OR
    order_id IN (
      SELECT o.id FROM orders o
      WHERE check_is_restaurant_owner(o.restaurant_id)
      OR check_is_restaurant_staff(o.restaurant_id)
    )
  );

-- 5. Trigger updated_at para orders
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. Habilitar Realtime para orders
-- Nota: Pode falhar se já estiver habilitado, mas é bom ter no script
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
END $$;
