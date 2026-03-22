-- ===========================================
-- SEED COMPLETO DO MIZZ
-- Execute este script no Supabase SQL Editor
-- ===========================================

-- 1. Criar ENUM e tabelas do PRD-01 (se não existirem)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('cliente', 'admin', 'cozinha', 'entregador');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE staff_role AS ENUM ('admin', 'cozinha', 'entregador');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'cliente',
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS profiles
DROP POLICY IF EXISTS "profiles_select_authenticated" ON profiles;
CREATE POLICY "profiles_select_authenticated" ON profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Trigger de criação de perfil
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name)
  VALUES (
    NEW.id,
    'cliente',
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Helpers para evitar recursão infinita no RLS
CREATE OR REPLACE FUNCTION public.check_is_restaurant_staff(res_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.restaurant_staff
    WHERE restaurant_id = res_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_is_restaurant_owner(res_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE id = res_id AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_is_restaurant_admin(res_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    check_is_restaurant_owner(res_id)
    OR
    EXISTS (
      SELECT 1 FROM public.restaurant_staff
      WHERE restaurant_id = res_id AND user_id = auth.uid() AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "restaurants_select_active" ON restaurants;
CREATE POLICY "restaurants_select_active" ON restaurants FOR SELECT TO authenticated
  USING (is_active = true OR owner_id = auth.uid());
DROP POLICY IF EXISTS "restaurants_insert_owner" ON restaurants;
CREATE POLICY "restaurants_insert_owner" ON restaurants FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "restaurants_update_owner" ON restaurants;
CREATE POLICY "restaurants_update_owner" ON restaurants FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- restaurant_staff
CREATE TABLE IF NOT EXISTS restaurant_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role staff_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_staff_restaurant ON restaurant_staff(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_user ON restaurant_staff(user_id);
ALTER TABLE restaurant_staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_select_same_restaurant" ON restaurant_staff;
CREATE POLICY "staff_select_same_restaurant" ON restaurant_staff FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR check_is_restaurant_owner(restaurant_id));
DROP POLICY IF EXISTS "staff_insert_owner" ON restaurant_staff;
CREATE POLICY "staff_insert_owner" ON restaurant_staff FOR INSERT TO authenticated
  WITH CHECK (check_is_restaurant_owner(restaurant_id));
DROP POLICY IF EXISTS "staff_delete_owner" ON restaurant_staff;
CREATE POLICY "staff_delete_owner" ON restaurant_staff FOR DELETE TO authenticated
  USING (check_is_restaurant_owner(restaurant_id));

-- ===========================================
-- 2. Tabelas do PRD-02 (Cardápio)
-- ===========================================

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(restaurant_id, sort_order);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_public" ON categories;
CREATE POLICY "categories_select_public" ON categories FOR SELECT TO authenticated
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE is_active = true) 
    OR 
    check_is_restaurant_staff(restaurant_id) 
    OR 
    check_is_restaurant_owner(restaurant_id)
  );
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
CREATE POLICY "categories_insert_admin" ON categories FOR INSERT TO authenticated
  WITH CHECK (check_is_restaurant_admin(restaurant_id));
DROP POLICY IF EXISTS "categories_update_admin" ON categories;
CREATE POLICY "categories_update_admin" ON categories FOR UPDATE TO authenticated
  USING (check_is_restaurant_admin(restaurant_id));
DROP POLICY IF EXISTS "categories_delete_admin" ON categories;
CREATE POLICY "categories_delete_admin" ON categories FOR DELETE TO authenticated
  USING (check_is_restaurant_admin(restaurant_id));

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
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "menu_items_select" ON menu_items;
CREATE POLICY "menu_items_select" ON menu_items FOR SELECT TO authenticated
  USING (
    (is_active = true AND category_id IN (SELECT id FROM categories WHERE restaurant_id IN (SELECT id FROM restaurants WHERE is_active = true)))
    OR 
    category_id IN (SELECT id FROM categories WHERE check_is_restaurant_owner(restaurant_id))
    OR 
    category_id IN (SELECT id FROM categories WHERE check_is_restaurant_staff(restaurant_id))
  );
DROP POLICY IF EXISTS "menu_items_insert_admin" ON menu_items;
CREATE POLICY "menu_items_insert_admin" ON menu_items FOR INSERT TO authenticated
  WITH CHECK (category_id IN (SELECT id FROM categories WHERE check_is_restaurant_admin(restaurant_id)));
DROP POLICY IF EXISTS "menu_items_update_admin" ON menu_items;
CREATE POLICY "menu_items_update_admin" ON menu_items FOR UPDATE TO authenticated
  USING (category_id IN (SELECT id FROM categories WHERE check_is_restaurant_admin(restaurant_id)));
DROP POLICY IF EXISTS "menu_items_delete_admin" ON menu_items;
CREATE POLICY "menu_items_delete_admin" ON menu_items FOR DELETE TO authenticated
  USING (category_id IN (SELECT id FROM categories WHERE check_is_restaurant_admin(restaurant_id)));

-- modifiers
CREATE TABLE IF NOT EXISTS modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  additional_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (additional_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_modifiers_item ON modifiers(menu_item_id);
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "modifiers_select" ON modifiers;
CREATE POLICY "modifiers_select" ON modifiers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "modifiers_insert_admin" ON modifiers;
CREATE POLICY "modifiers_insert_admin" ON modifiers FOR INSERT TO authenticated
  WITH CHECK (menu_item_id IN (SELECT mi.id FROM menu_items mi JOIN categories c ON c.id = mi.category_id WHERE check_is_restaurant_admin(c.restaurant_id)));
DROP POLICY IF EXISTS "modifiers_update_admin" ON modifiers;
CREATE POLICY "modifiers_update_admin" ON modifiers FOR UPDATE TO authenticated
  USING (menu_item_id IN (SELECT mi.id FROM menu_items mi JOIN categories c ON c.id = mi.category_id WHERE check_is_restaurant_admin(c.restaurant_id)));
DROP POLICY IF EXISTS "modifiers_delete_admin" ON modifiers;
CREATE POLICY "modifiers_delete_admin" ON modifiers FOR DELETE TO authenticated
  USING (menu_item_id IN (SELECT mi.id FROM menu_items mi JOIN categories c ON c.id = mi.category_id WHERE check_is_restaurant_admin(c.restaurant_id)));

-- ===========================================
-- 3. SEED: Dados mockados
-- ===========================================

-- Pegar o primeiro usuário existente e promover a admin
DO $$
DECLARE
  v_user_id UUID;
  v_restaurant_id UUID;
  v_cat_lanches UUID;
  v_cat_bebidas UUID;
  v_cat_porcoes UUID;
  v_cat_sobremesas UUID;
  v_item_id UUID;
BEGIN
  -- Pega o primeiro usuário cadastrado
  SELECT id INTO v_user_id FROM profiles LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuário cadastrado. Crie uma conta primeiro.';
  END IF;

  -- Promover para admin e limpar dados existentes
  UPDATE profiles SET role = 'admin' WHERE id = v_user_id;
  DELETE FROM restaurants WHERE owner_id = v_user_id;

  -- Criar restaurante
  INSERT INTO restaurants (id, owner_id, name, description, is_active)
  VALUES (gen_random_uuid(), v_user_id, 'Restaurante Sabor & Arte', 'O melhor da culinária artesanal', true)
  RETURNING id INTO v_restaurant_id;

  -- =====================
  -- CATEGORIA: Lanches
  -- =====================
  INSERT INTO categories (id, restaurant_id, name, sort_order)
  VALUES (gen_random_uuid(), v_restaurant_id, 'Lanches', 0)
  RETURNING id INTO v_cat_lanches;

  -- Item: X-Burguer Clássico
  INSERT INTO menu_items (id, category_id, name, description, price, is_active, sort_order)
  VALUES (gen_random_uuid(), v_cat_lanches, 'X-Burguer Clássico', 'Pão brioche, hambúrguer 180g, queijo cheddar, alface, tomate e molho especial', 28.90, true, 0)
  RETURNING id INTO v_item_id;
  INSERT INTO modifiers (menu_item_id, name, additional_price) VALUES
    (v_item_id, 'Bacon Extra', 5.00),
    (v_item_id, 'Ovo', 3.00),
    (v_item_id, 'Sem Cebola', 0.00);

  -- Item: X-Salada
  INSERT INTO menu_items (id, category_id, name, description, price, is_active, sort_order)
  VALUES (gen_random_uuid(), v_cat_lanches, 'X-Salada', 'Pão integral, hambúrguer 150g, queijo branco, rúcula e tomate seco', 26.90, true, 1)
  RETURNING id INTO v_item_id;
  INSERT INTO modifiers (menu_item_id, name, additional_price) VALUES
    (v_item_id, 'Bacon Extra', 5.00),
    (v_item_id, 'Queijo Extra', 4.00);

  -- Item: Frango Empanado
  INSERT INTO menu_items (id, category_id, name, description, price, is_active, sort_order)
  VALUES (gen_random_uuid(), v_cat_lanches, 'Frango Empanado', 'Filé de frango crocante, maionese de ervas e salada', 24.50, true, 2)
  RETURNING id INTO v_item_id;

  -- Item: Veggie Burger
  INSERT INTO menu_items (id, category_id, name, description, price, is_active, sort_order)
  VALUES (gen_random_uuid(), v_cat_lanches, 'Veggie Burger', 'Hambúrguer de grão-de-bico, guacamole e rúcula', 27.90, true, 3)
  RETURNING id INTO v_item_id;
  INSERT INTO modifiers (menu_item_id, name, additional_price) VALUES
    (v_item_id, 'Queijo Vegano', 4.00);

  -- =====================
  -- CATEGORIA: Bebidas
  -- =====================
  INSERT INTO categories (id, restaurant_id, name, sort_order)
  VALUES (gen_random_uuid(), v_restaurant_id, 'Bebidas', 1)
  RETURNING id INTO v_cat_bebidas;

  INSERT INTO menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES
    (v_cat_bebidas, 'Água Mineral 500ml', 'Sem gás', 5.00, true, 0),
    (v_cat_bebidas, 'Refrigerante Lata', 'Coca-Cola, Guaraná ou Sprite', 7.00, true, 1),
    (v_cat_bebidas, 'Suco Natural', 'Laranja, limão, maracujá ou abacaxi', 12.00, true, 2),
    (v_cat_bebidas, 'Cerveja Artesanal IPA', 'Lata 473ml — Brew Dog Punk IPA', 18.00, true, 3),
    (v_cat_bebidas, 'Limonada Suíça', 'Com leite condensado e hortelã', 14.00, true, 4);

  -- Modificador na Água
  SELECT id INTO v_item_id FROM menu_items WHERE category_id = v_cat_bebidas AND name = 'Água Mineral 500ml';
  INSERT INTO modifiers (menu_item_id, name, additional_price) VALUES
    (v_item_id, 'Com Gás', 1.00);

  -- =====================
  -- CATEGORIA: Porções
  -- =====================
  INSERT INTO categories (id, restaurant_id, name, sort_order)
  VALUES (gen_random_uuid(), v_restaurant_id, 'Porções', 2)
  RETURNING id INTO v_cat_porcoes;

  INSERT INTO menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES
    (v_cat_porcoes, 'Batata Frita', 'Porção generosa com cheddar e bacon', 22.00, true, 0),
    (v_cat_porcoes, 'Onion Rings', '12 anéis de cebola empanados crocantes', 19.00, true, 1),
    (v_cat_porcoes, 'Nuggets de Frango', '10 unidades com molho barbecue', 18.00, true, 2),
    (v_cat_porcoes, 'Mandioca Frita', 'Com molho de pimenta', 16.00, true, 3);

  -- =====================
  -- CATEGORIA: Sobremesas
  -- =====================
  INSERT INTO categories (id, restaurant_id, name, sort_order)
  VALUES (gen_random_uuid(), v_restaurant_id, 'Sobremesas', 3)
  RETURNING id INTO v_cat_sobremesas;

  INSERT INTO menu_items (id, category_id, name, description, price, is_active, sort_order)
  VALUES (gen_random_uuid(), v_cat_sobremesas, 'Brownie com Sorvete', 'Brownie quente de chocolate belga com sorvete de creme', 19.90, true, 0)
  RETURNING id INTO v_item_id;
  INSERT INTO modifiers (menu_item_id, name, additional_price) VALUES
    (v_item_id, 'Calda de Caramelo', 3.00),
    (v_item_id, 'Chantilly', 2.00);

  INSERT INTO menu_items (category_id, name, description, price, is_active, sort_order)
  VALUES
    (v_cat_sobremesas, 'Petit Gâteau', 'Bolo quente de chocolate com interior cremoso e sorvete', 24.00, true, 1),
    (v_cat_sobremesas, 'Açaí 500ml', 'Com granola, banana e leite condensado', 22.00, true, 2);

  RAISE NOTICE 'Seed concluído! Restaurante "Sabor & Arte" criado com 4 categorias e 15 itens.';
  RAISE NOTICE 'Usuário % promovido para admin.', v_user_id;
  RAISE NOTICE 'ID do restaurante: %', v_restaurant_id;
END $$;
