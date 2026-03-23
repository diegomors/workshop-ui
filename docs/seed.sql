-- ===========================================
-- SEED COMPLETO DO MIZZ — IDEMPOTENTE
-- Execute quantas vezes quiser: sempre volta
-- ao estado inicial sem duplicar dados.
-- ===========================================

-- 1. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('cliente', 'admin', 'cozinha', 'entregador');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE staff_role AS ENUM ('admin', 'cozinha', 'entregador');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

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

-- 2. TABELAS (Garantir existência)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'cliente',
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  coverage_radius_km DOUBLE PRECISION DEFAULT 5.0,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS restaurant_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role staff_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  additional_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (additional_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  modifiers_json JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status order_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  message TEXT NOT NULL CHECK (char_length(message) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  deliverer_id UUID NOT NULL REFERENCES profiles(id),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. RESETAR E RECRIAR DADOS
DO $$
DECLARE
  v_admin_id       UUID;
  v_res_id_1       UUID;
  v_res_id_2       UUID;
  v_res_id_3       UUID;
  v_cat_id         UUID;
  v_item_id        UUID;
  v_item_id_2      UUID;
  v_item_id_3      UUID;
  v_order_id       UUID;
  v_order_id_2     UUID;
  v_order_id_3     UUID;
  v_order_id_4     UUID;
  v_order_id_5     UUID;
  v_order_id_6     UUID;
BEGIN
  -- Pegar o primeiro usuário como admin do seed
  SELECT id INTO v_admin_id FROM auth.users LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE NOTICE 'Nenhum usuário em auth.users. Crie uma conta antes de rodar o seed.';
    RETURN;
  END IF;

  -- ═══════════════════════════════════════
  -- LIMPEZA COMPLETA (ordem de FK)
  -- ═══════════════════════════════════════
  DELETE FROM public.delivery_tracking WHERE order_id IN (
    SELECT id FROM public.orders WHERE restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = v_admin_id
    )
  );
  DELETE FROM public.chat_messages WHERE order_id IN (
    SELECT id FROM public.orders WHERE restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = v_admin_id
    )
  );
  DELETE FROM public.order_status_history WHERE order_id IN (
    SELECT id FROM public.orders WHERE restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = v_admin_id
    )
  );
  DELETE FROM public.order_items WHERE order_id IN (
    SELECT id FROM public.orders WHERE restaurant_id IN (
      SELECT id FROM public.restaurants WHERE owner_id = v_admin_id
    )
  );
  DELETE FROM public.orders WHERE restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = v_admin_id
  );
  DELETE FROM public.modifiers WHERE menu_item_id IN (
    SELECT mi.id FROM public.menu_items mi
    JOIN public.categories c ON mi.category_id = c.id
    JOIN public.restaurants r ON c.restaurant_id = r.id
    WHERE r.owner_id = v_admin_id
  );
  DELETE FROM public.menu_items WHERE category_id IN (
    SELECT c.id FROM public.categories c
    JOIN public.restaurants r ON c.restaurant_id = r.id
    WHERE r.owner_id = v_admin_id
  );
  DELETE FROM public.categories WHERE restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = v_admin_id
  );
  DELETE FROM public.restaurant_staff WHERE restaurant_id IN (
    SELECT id FROM public.restaurants WHERE owner_id = v_admin_id
  );
  DELETE FROM public.restaurants WHERE owner_id = v_admin_id;

  -- ═══════════════════════════════════════
  -- PERFIL ADMIN
  -- ═══════════════════════════════════════
  INSERT INTO public.profiles (id, role, name, phone)
  VALUES (v_admin_id, 'admin', 'Admin Mizz', '+5511999990000')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', name = 'Admin Mizz', phone = '+5511999990000';

  -- ═══════════════════════════════════════
  -- RESTAURANTE 1: Sabor & Arte (centro SP)
  -- ═══════════════════════════════════════
  INSERT INTO public.restaurants (owner_id, name, description, latitude, longitude, coverage_radius_km)
  VALUES (v_admin_id, 'Restaurante Sabor & Arte', 'O melhor da culinária artesanal no centro de SP', -23.5505, -46.6333, 5.0)
  RETURNING id INTO v_res_id_1;

  -- Staff do restaurante 1 (admin como cozinha e entregador dele mesmo, para poder testar role switch)
  INSERT INTO public.restaurant_staff (restaurant_id, user_id, role)
  VALUES (v_res_id_1, v_admin_id, 'admin');

  -- == Categorias & Itens ==

  -- Lanches
  INSERT INTO public.categories (restaurant_id, name, sort_order)
  VALUES (v_res_id_1, 'Lanches', 0)
  RETURNING id INTO v_cat_id;

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'X-Burguer Clássico', 'Pão brioche, carne 180g, queijo cheddar e alface', 28.90, true, 0)
  RETURNING id INTO v_item_id;
  INSERT INTO public.modifiers (menu_item_id, name, additional_price) VALUES (v_item_id, 'Bacon Extra', 5.00);
  INSERT INTO public.modifiers (menu_item_id, name, additional_price) VALUES (v_item_id, 'Queijo Dobro', 4.00);
  INSERT INTO public.modifiers (menu_item_id, name, additional_price) VALUES (v_item_id, 'Ovo', 3.00);

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'X-Salada', 'Pão, carne 150g, queijo, alface e tomate', 25.90, true, 1)
  RETURNING id INTO v_item_id_2;
  INSERT INTO public.modifiers (menu_item_id, name, additional_price) VALUES (v_item_id_2, 'Bacon', 5.00);

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Hot Dog Especial', 'Pão, salsicha, purê, vinagrete e batata palha', 18.50, true, 2);

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Wrap de Frango', 'Tortilla com frango desfiado, cream cheese e rúcula', 22.00, false, 3);

  -- Bebidas
  INSERT INTO public.categories (restaurant_id, name, sort_order)
  VALUES (v_res_id_1, 'Bebidas', 1)
  RETURNING id INTO v_cat_id;

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Suco de Laranja', 'Natural da fruta 400ml', 12.00, true, 0)
  RETURNING id INTO v_item_id_3;

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Refrigerante Lata', 'Coca-Cola, Guaraná ou Fanta', 7.00, true, 1);

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Água Mineral', '500ml sem gás', 4.00, true, 2);

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Cerveja Artesanal', 'IPA 350ml', 16.00, true, 3);

  -- Sobremesas
  INSERT INTO public.categories (restaurant_id, name, sort_order)
  VALUES (v_res_id_1, 'Sobremesas', 2)
  RETURNING id INTO v_cat_id;

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Pudim', 'Pudim de leite condensado tradicional', 10.00, true, 0);

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Brownie com Sorvete', 'Brownie de chocolate com bola de creme', 18.00, true, 1);

  -- Pratos do Dia
  INSERT INTO public.categories (restaurant_id, name, sort_order)
  VALUES (v_res_id_1, 'Pratos do Dia', 3)
  RETURNING id INTO v_cat_id;

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Filé Grelhado', 'Filé mignon grelhado com arroz, feijão e farofa', 42.90, true, 0);

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Frango à Parmegiana', 'Filé de frango empanado com molho e queijo gratinado', 38.90, true, 1);

  -- ═══════════════════════════════════════
  -- RESTAURANTE 2: Burger Freedom (Liberdade)
  -- ═══════════════════════════════════════
  INSERT INTO public.restaurants (owner_id, name, description, latitude, longitude, coverage_radius_km)
  VALUES (v_admin_id, 'Burger Freedom', 'Hambúrgueres com alma oriental e rústica', -23.558, -46.638, 3.0)
  RETURNING id INTO v_res_id_2;

  INSERT INTO public.categories (restaurant_id, name, sort_order)
  VALUES (v_res_id_2, 'Burgers', 0)
  RETURNING id INTO v_cat_id;

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Smash Burger Duplo', 'Dois smash patties, cheddar, cebola caramelizada', 34.90, true, 0)
  RETURNING id INTO v_item_id;
  INSERT INTO public.modifiers (menu_item_id, name, additional_price) VALUES (v_item_id, 'Patty Extra', 8.00);
  INSERT INTO public.modifiers (menu_item_id, name, additional_price) VALUES (v_item_id, 'Molho Trufa', 3.00);

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Chicken Burger', 'Frango crispy com maionese de wasabi', 29.90, true, 1);

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Veggie Burger', 'Hambúrguer de grão de bico com guacamole', 27.90, true, 2);

  INSERT INTO public.categories (restaurant_id, name, sort_order)
  VALUES (v_res_id_2, 'Acompanhamentos', 1)
  RETURNING id INTO v_cat_id;

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Batata Frita', 'Porção 300g com sal e orégano', 15.00, true, 0);

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Onion Rings', 'Anéis de cebola empanados', 14.00, true, 1);

  INSERT INTO public.categories (restaurant_id, name, sort_order)
  VALUES (v_res_id_2, 'Bebidas', 2)
  RETURNING id INTO v_cat_id;

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Milkshake Chocolate', 'Milkshake cremoso de chocolate 400ml', 18.00, true, 0);

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Soda Italiana', 'Frutas vermelhas com água com gás', 14.00, true, 1);

  -- ═══════════════════════════════════════
  -- RESTAURANTE 3: Sushi Republic (República)
  -- ═══════════════════════════════════════
  INSERT INTO public.restaurants (owner_id, name, description, latitude, longitude, coverage_radius_km)
  VALUES (v_admin_id, 'Sushi Republic', 'Peixe fresco e técnicas milenares', -23.542, -46.636, 4.0)
  RETURNING id INTO v_res_id_3;

  INSERT INTO public.categories (restaurant_id, name, sort_order)
  VALUES (v_res_id_3, 'Combinados', 0)
  RETURNING id INTO v_cat_id;

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Combo Salmão 10 pcs', 'Nigiri e uramaki de salmão', 52.00, true, 0)
  RETURNING id INTO v_item_id;
  INSERT INTO public.modifiers (menu_item_id, name, additional_price) VALUES (v_item_id, 'Gengibre Extra', 2.00);
  INSERT INTO public.modifiers (menu_item_id, name, additional_price) VALUES (v_item_id, 'Wasabi Extra', 1.50);

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Combo Misto 15 pcs', 'Salmão, atum, kani e camarão', 68.00, true, 1);

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Temaki Filadélfia', 'Salmão, cream cheese e cebolinha', 28.00, true, 2);

  INSERT INTO public.categories (restaurant_id, name, sort_order)
  VALUES (v_res_id_3, 'Pratos Quentes', 1)
  RETURNING id INTO v_cat_id;

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Yakissoba Frango', 'Macarrão oriental com frango e legumes', 32.00, true, 0);

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Gyoza (6 un)', 'Guioza de carne suína e legumes', 22.00, true, 1);

  INSERT INTO public.categories (restaurant_id, name, sort_order)
  VALUES (v_res_id_3, 'Bebidas', 2)
  RETURNING id INTO v_cat_id;

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Chá Verde', 'Quente ou gelado 300ml', 8.00, true, 0);

  INSERT INTO public.menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES (v_cat_id, 'Sakê', 'Sakê servido quente 180ml', 24.00, true, 1);

  -- ═══════════════════════════════════════
  -- PEDIDOS — todos os status
  -- ═══════════════════════════════════════

  -- Pedido 1: REALIZADO (novo)
  INSERT INTO public.orders (restaurant_id, customer_id, status, total, service_fee, delivery_code, notes, customer_latitude, customer_longitude, created_at)
  VALUES (v_res_id_1, v_admin_id, 'REALIZADO', 53.90, 5.39, '1001', 'Sem cebola no lanche', -23.555, -46.635, now() - interval '5 minutes')
  RETURNING id INTO v_order_id;
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id, NULL, 'REALIZADO', v_admin_id);

  -- Pedido 2: CONFIRMADO
  INSERT INTO public.orders (restaurant_id, customer_id, status, total, service_fee, delivery_code, customer_latitude, customer_longitude, created_at)
  VALUES (v_res_id_1, v_admin_id, 'CONFIRMADO', 40.90, 4.09, '1002', -23.548, -46.630, now() - interval '15 minutes')
  RETURNING id INTO v_order_id_2;
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_2, NULL, 'REALIZADO', v_admin_id);
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_2, 'REALIZADO', 'CONFIRMADO', v_admin_id);

  -- Pedido 3: EM_PREPARO
  INSERT INTO public.orders (restaurant_id, customer_id, status, total, service_fee, delivery_code, customer_latitude, customer_longitude, created_at)
  VALUES (v_res_id_1, v_admin_id, 'EM_PREPARO', 72.80, 7.28, '1003', -23.552, -46.628, now() - interval '30 minutes')
  RETURNING id INTO v_order_id_3;
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_3, NULL, 'REALIZADO', v_admin_id);
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_3, 'REALIZADO', 'CONFIRMADO', v_admin_id);
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_3, 'CONFIRMADO', 'EM_PREPARO', v_admin_id);

  -- Pedido 4: EM_ROTA (com tracking de entregador)
  INSERT INTO public.orders (restaurant_id, customer_id, status, total, service_fee, delivery_code, customer_latitude, customer_longitude, created_at)
  VALUES (v_res_id_1, v_admin_id, 'EM_ROTA', 45.40, 4.54, '1004', -23.560, -46.640, now() - interval '45 minutes')
  RETURNING id INTO v_order_id_4;
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_4, NULL, 'REALIZADO', v_admin_id);
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_4, 'REALIZADO', 'CONFIRMADO', v_admin_id);
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_4, 'CONFIRMADO', 'EM_PREPARO', v_admin_id);
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_4, 'EM_PREPARO', 'PRONTO_PARA_RETIRADA', v_admin_id);
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_4, 'PRONTO_PARA_RETIRADA', 'EM_ROTA', v_admin_id);

  -- Posições de tracking do entregador
  INSERT INTO public.delivery_tracking (order_id, deliverer_id, latitude, longitude, accuracy, created_at)
  VALUES
    (v_order_id_4, v_admin_id, -23.5505, -46.6333, 10, now() - interval '10 minutes'),
    (v_order_id_4, v_admin_id, -23.553, -46.635, 8, now() - interval '7 minutes'),
    (v_order_id_4, v_admin_id, -23.556, -46.637, 12, now() - interval '4 minutes'),
    (v_order_id_4, v_admin_id, -23.558, -46.639, 6, now() - interval '1 minute');

  -- Mensagens de chat para pedido em rota
  INSERT INTO public.chat_messages (order_id, sender_id, message, created_at)
  VALUES
    (v_order_id_4, v_admin_id, 'Saindo do restaurante agora!', now() - interval '10 minutes'),
    (v_order_id_4, v_admin_id, 'Estou a caminho, trânsito tranquilo.', now() - interval '5 minutes'),
    (v_order_id_4, v_admin_id, 'Chegando em 5 minutos!', now() - interval '1 minute');

  -- Pedido 5: ENTREGUE (concluído)
  INSERT INTO public.orders (restaurant_id, customer_id, status, total, service_fee, delivery_code, customer_latitude, customer_longitude, created_at, updated_at)
  VALUES (v_res_id_1, v_admin_id, 'ENTREGUE', 105.00, 10.50, '1005', -23.545, -46.625, now() - interval '2 hours', now() - interval '1 hour')
  RETURNING id INTO v_order_id_5;
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_5, NULL, 'REALIZADO', v_admin_id);
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_5, 'REALIZADO', 'CONFIRMADO', v_admin_id);
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_5, 'CONFIRMADO', 'EM_PREPARO', v_admin_id);
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_5, 'EM_PREPARO', 'PRONTO_PARA_RETIRADA', v_admin_id);
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_5, 'PRONTO_PARA_RETIRADA', 'EM_ROTA', v_admin_id);
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_5, 'EM_ROTA', 'ENTREGUE', v_admin_id);

  -- Pedido 6: CANCELADO
  INSERT INTO public.orders (restaurant_id, customer_id, status, total, service_fee, delivery_code, notes, customer_latitude, customer_longitude, created_at)
  VALUES (v_res_id_1, v_admin_id, 'CANCELADO', 32.00, 3.20, '1006', 'Cliente desistiu', -23.557, -46.632, now() - interval '3 hours')
  RETURNING id INTO v_order_id_6;
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_6, NULL, 'REALIZADO', v_admin_id);
  INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by) VALUES (v_order_id_6, 'REALIZADO', 'CANCELADO', v_admin_id);

  -- Pedido no restaurante 2 (EM_PREPARO)
  INSERT INTO public.orders (restaurant_id, customer_id, status, total, service_fee, delivery_code, customer_latitude, customer_longitude, created_at)
  VALUES (v_res_id_2, v_admin_id, 'EM_PREPARO', 64.80, 6.48, '2001', -23.560, -46.635, now() - interval '20 minutes');

  -- Pedido no restaurante 3 (PRONTO_PARA_RETIRADA)
  INSERT INTO public.orders (restaurant_id, customer_id, status, total, service_fee, delivery_code, customer_latitude, customer_longitude, created_at)
  VALUES (v_res_id_3, v_admin_id, 'PRONTO_PARA_RETIRADA', 80.00, 8.00, '3001', -23.545, -46.630, now() - interval '40 minutes');

  -- ═══════════════════════════════════════
  -- ORDER ITEMS (itens de pedido para relatórios)
  -- ═══════════════════════════════════════
  -- Itens do pedido 1 (REALIZADO)
  INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price, modifiers_json, subtotal)
  SELECT v_order_id, mi.id, 1, mi.price, '[]'::jsonb, mi.price
  FROM public.menu_items mi
  JOIN public.categories c ON mi.category_id = c.id
  WHERE c.restaurant_id = v_res_id_1 AND mi.name = 'X-Burguer Clássico'
  LIMIT 1;

  INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price, modifiers_json, subtotal)
  SELECT v_order_id, mi.id, 2, mi.price, '[]'::jsonb, mi.price * 2
  FROM public.menu_items mi
  JOIN public.categories c ON mi.category_id = c.id
  WHERE c.restaurant_id = v_res_id_1 AND mi.name = 'Suco de Laranja'
  LIMIT 1;

  -- Itens do pedido 5 (ENTREGUE) — para relatórios de vendas
  INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price, modifiers_json, subtotal)
  SELECT v_order_id_5, mi.id, 2, mi.price, '[{"name":"Bacon Extra","price":5.00}]'::jsonb, (mi.price + 5.00) * 2
  FROM public.menu_items mi
  JOIN public.categories c ON mi.category_id = c.id
  WHERE c.restaurant_id = v_res_id_1 AND mi.name = 'X-Burguer Clássico'
  LIMIT 1;

  INSERT INTO public.order_items (order_id, menu_item_id, quantity, unit_price, modifiers_json, subtotal)
  SELECT v_order_id_5, mi.id, 1, mi.price, '[]'::jsonb, mi.price
  FROM public.menu_items mi
  JOIN public.categories c ON mi.category_id = c.id
  WHERE c.restaurant_id = v_res_id_1 AND mi.name = 'Brownie com Sorvete'
  LIMIT 1;

  RAISE NOTICE '✓ Seed RESETADO com sucesso!';
  RAISE NOTICE '  Restaurantes: 3 (Sabor & Arte, Burger Freedom, Sushi Republic)';
  RAISE NOTICE '  Categorias total: 9';
  RAISE NOTICE '  Itens de cardápio: ~25';
  RAISE NOTICE '  Pedidos: 8 (todos os status)';
  RAISE NOTICE '  Tracking de entrega: 4 posições';
  RAISE NOTICE '  Mensagens de chat: 3';
  RAISE NOTICE '  Histórico de status: completo em todos os pedidos';
END $$;
