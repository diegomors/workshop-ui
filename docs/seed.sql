-- ===========================================
-- SEED COMPLETO DO MIZZ RESETÁVEL
-- Execute este script no Supabase SQL Editor
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
-- Note: As tabelas já devem existir via migrações, mas o seed as reforça para desenvolvimento.

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'cliente',
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- restaurants
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- restaurant_staff
CREATE TABLE IF NOT EXISTS restaurant_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role staff_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- menu_items
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

-- modifiers
CREATE TABLE IF NOT EXISTS modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  additional_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (additional_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- orders
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

-- 3. RESETAR DADOS DO SEED PARA RECRIAR TUDO
DO $$
DECLARE
  v_user_id UUID;
  v_res_id_1 UUID;
  v_res_id_2 UUID;
  v_res_id_3 UUID;
  v_cat_id UUID;
  v_item_id UUID;
BEGIN
  -- Selecionar o primeiro usuário do auth.users para ser o Admin do seed
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Nenhum usuário encontrado em auth.users. Por favor, crie uma conta no app antes de rodar o seed.';
    RETURN;
  END IF;

  -- Limpar TUDO relacionado ao seed anterior do usuário admin selecionado
  -- Remover primeiro entidades dependentes na ordem correta para evitar violação de FK
  -- Limpar Pedidos de TODOS restaurantes do usuário
  DELETE FROM public.orders WHERE restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = v_user_id);
  -- Modifiers e Menu Items de TODOS restaurantes deste dono
  DELETE FROM public.modifiers WHERE menu_item_id IN (
    SELECT mi.id FROM public.menu_items mi
    JOIN public.categories c ON mi.category_id = c.id
    JOIN public.restaurants r ON c.restaurant_id = r.id
    WHERE r.owner_id = v_user_id
  );
  DELETE FROM public.menu_items WHERE category_id IN (
    SELECT c.id FROM public.categories c
    JOIN public.restaurants r ON c.restaurant_id = r.id
    WHERE r.owner_id = v_user_id
  );
  DELETE FROM public.categories WHERE restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = v_user_id);
  DELETE FROM public.restaurant_staff WHERE restaurant_id IN (SELECT id FROM public.restaurants WHERE owner_id = v_user_id);
  DELETE FROM public.restaurants WHERE owner_id = v_user_id;

  -- (Opcional): Limpar perfil exceto para este user
  -- (Opcional): Manter apenas admin, mas neste caso não deleta para não prejudicar outros fluxos

  -- Reinserir perfil admin caso necessário
  INSERT INTO public.profiles (id, role, name)
  VALUES (v_user_id, 'admin', 'Mestre Restauranteur')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';

  -- CRIAÇÃO DOS NOVOS DADOS INICIAIS

  -- Restaurante 1: Sabor & Arte (Praça da Sé)
  INSERT INTO public.restaurants (owner_id, name, description, latitude, longitude, coverage_radius_km)
  VALUES (v_user_id, 'Restaurante Sabor & Arte', 'O melhor da culinária artesanal no centro de SP', -23.5505, -46.6333, 5.0)
  RETURNING id INTO v_res_id_1;

  -- Restaurante 2: Burger Freedom (Liberdade)
  INSERT INTO public.restaurants (owner_id, name, description, latitude, longitude, coverage_radius_km)
  VALUES (v_user_id, 'Burger Freedom', 'Hambúrgueres com alma oriental e rústica', -23.558, -46.638, 3.0)
  RETURNING id INTO v_res_id_2;

  -- Restaurante 3: Sushi Republic (República)
  INSERT INTO public.restaurants (owner_id, name, description, latitude, longitude, coverage_radius_km)
  VALUES (v_user_id, 'Sushi Republic', 'Peixe fresco e técnicas milenares', -23.542, -46.636, 4.0)
  RETURNING id INTO v_res_id_3;

  -- Criar Categorias e Itens para Restaurante 1
  INSERT INTO public.categories (restaurant_id, name, sort_order)
  VALUES (v_res_id_1, 'Lanches', 0)
  RETURNING id INTO v_cat_id;

  INSERT INTO public.menu_items (category_id, name, description, price, sort_order)
  VALUES (v_cat_id, 'X-Burguer Clássico', 'Pão brioche, carne 180g e queijo', 28.90, 0)
  RETURNING id INTO v_item_id;

  INSERT INTO public.modifiers (menu_item_id, name, additional_price)
  VALUES (v_item_id, 'Bacon Extra', 5.00);

  INSERT INTO public.categories (restaurant_id, name, sort_order)
  VALUES (v_res_id_1, 'Bebidas', 1)
  RETURNING id INTO v_cat_id;

  INSERT INTO public.menu_items (category_id, name, description, price, sort_order)
  VALUES (v_cat_id, 'Suco de Laranja', 'Natural da fruta 400ml', 12.00, 0);

  -- Criar Pedidos para visualização do mapa (dev/teste)
  INSERT INTO public.orders (restaurant_id, customer_id, status, total, service_fee, delivery_code, customer_latitude, customer_longitude)
  VALUES (v_res_id_1, v_user_id, 'EM_ROTA', 45.40, 4.50, '1234', -23.555, -46.635);

  INSERT INTO public.orders (restaurant_id, customer_id, status, total, service_fee, delivery_code, customer_latitude, customer_longitude)
  VALUES (v_res_id_1, v_user_id, 'REALIZADO', 32.00, 3.20, '4321', -23.545, -46.625);

  INSERT INTO public.orders (restaurant_id, customer_id, status, total, service_fee, delivery_code, customer_latitude, customer_longitude)
  VALUES (v_res_id_1, v_user_id, 'ENTREGUE', 105.00, 10.50, '5678', -23.552, -46.628);

  RAISE NOTICE 'Seed RESETADO com sucesso!';
  RAISE NOTICE 'Restaurantes recriados: 3';
  RAISE NOTICE 'Pedidos ativos para teste de mapa: 2';
END $$;
