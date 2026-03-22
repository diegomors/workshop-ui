# PRD-02: Cardápio Digital

**Scope:** 2 de 8
**Ciclo:** Primeiro (6 semanas)
**Semana(s):** 1-2
**Risco:** Baixo
**Prioridade:** Bloqueante
**Última atualização:** 22 de Março de 2026

---

## Referências

- [Pitch](../shape-up/pitch-ciclo-1.md) — seção 1 (Cardápio Digital)
- [Breadboarding](../shape-up/breadboarding.md) — seção 1 (Cardápio Digital)
- [Kickoff](../shape-up/kickoff.md) — Scope 2

---

## Visão Geral

O cardápio é o coração do pedido. Este scope cobre duas perspectivas: o admin que cria e gerencia o cardápio (categorias, itens, modificadores, fotos), e o cliente que navega, seleciona itens e monta seu pedido em um carrinho.

O carrinho é local (não persiste no banco) e alimenta o fluxo de checkout no PRD-05.

---

## Dependências

| Depende de | Motivo |
|---|---|
| PRD-01 | Auth, profiles, restaurants, padrões de projeto |

| Bloqueia | Motivo |
|---|---|
| PRD-03 | Pedidos referenciam itens do cardápio |
| PRD-05 | Checkout usa dados do carrinho |

---

## Schema do Banco de Dados

```sql
-- ===========================================
-- categories
-- ===========================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX idx_categories_sort ON categories(restaurant_id, sort_order);

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Todos podem ler categorias de restaurantes ativos
CREATE POLICY "categories_select_public"
  ON categories FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE is_active = true)
    OR
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
    OR
    restaurant_id IN (SELECT restaurant_id FROM restaurant_staff WHERE user_id = auth.uid())
  );

-- Apenas owner/admin do restaurante pode gerenciar
CREATE POLICY "categories_insert_admin"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
    OR
    restaurant_id IN (
      SELECT restaurant_id FROM restaurant_staff
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "categories_update_admin"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
    OR
    restaurant_id IN (
      SELECT restaurant_id FROM restaurant_staff
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "categories_delete_admin"
  ON categories FOR DELETE
  TO authenticated
  USING (
    restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())
    OR
    restaurant_id IN (
      SELECT restaurant_id FROM restaurant_staff
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ===========================================
-- menu_items
-- ===========================================
CREATE TABLE menu_items (
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

CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_active ON menu_items(category_id, is_active) WHERE is_active = true;

-- RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Clientes veem apenas itens ativos; admin vê todos do seu restaurante
CREATE POLICY "menu_items_select"
  ON menu_items FOR SELECT
  TO authenticated
  USING (
    (is_active = true AND category_id IN (
      SELECT id FROM categories WHERE restaurant_id IN (
        SELECT id FROM restaurants WHERE is_active = true
      )
    ))
    OR
    category_id IN (
      SELECT id FROM categories WHERE restaurant_id IN (
        SELECT id FROM restaurants WHERE owner_id = auth.uid()
      )
    )
    OR
    category_id IN (
      SELECT id FROM categories WHERE restaurant_id IN (
        SELECT restaurant_id FROM restaurant_staff WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "menu_items_insert_admin"
  ON menu_items FOR INSERT
  TO authenticated
  WITH CHECK (
    category_id IN (
      SELECT c.id FROM categories c
      JOIN restaurants r ON r.id = c.restaurant_id
      WHERE r.owner_id = auth.uid()
    )
    OR
    category_id IN (
      SELECT c.id FROM categories c
      JOIN restaurant_staff rs ON rs.restaurant_id = c.restaurant_id
      WHERE rs.user_id = auth.uid() AND rs.role = 'admin'
    )
  );

CREATE POLICY "menu_items_update_admin"
  ON menu_items FOR UPDATE
  TO authenticated
  USING (
    category_id IN (
      SELECT c.id FROM categories c
      JOIN restaurants r ON r.id = c.restaurant_id
      WHERE r.owner_id = auth.uid()
    )
    OR
    category_id IN (
      SELECT c.id FROM categories c
      JOIN restaurant_staff rs ON rs.restaurant_id = c.restaurant_id
      WHERE rs.user_id = auth.uid() AND rs.role = 'admin'
    )
  );

CREATE POLICY "menu_items_delete_admin"
  ON menu_items FOR DELETE
  TO authenticated
  USING (
    category_id IN (
      SELECT c.id FROM categories c
      JOIN restaurants r ON r.id = c.restaurant_id
      WHERE r.owner_id = auth.uid()
    )
    OR
    category_id IN (
      SELECT c.id FROM categories c
      JOIN restaurant_staff rs ON rs.restaurant_id = c.restaurant_id
      WHERE rs.user_id = auth.uid() AND rs.role = 'admin'
    )
  );

-- ===========================================
-- modifiers
-- ===========================================
CREATE TABLE modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  additional_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (additional_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_modifiers_item ON modifiers(menu_item_id);

-- RLS
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;

-- Mesmas políticas de leitura que menu_items (via join)
CREATE POLICY "modifiers_select"
  ON modifiers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "modifiers_insert_admin"
  ON modifiers FOR INSERT
  TO authenticated
  WITH CHECK (
    menu_item_id IN (
      SELECT mi.id FROM menu_items mi
      JOIN categories c ON c.id = mi.category_id
      JOIN restaurants r ON r.id = c.restaurant_id
      WHERE r.owner_id = auth.uid()
    )
    OR
    menu_item_id IN (
      SELECT mi.id FROM menu_items mi
      JOIN categories c ON c.id = mi.category_id
      JOIN restaurant_staff rs ON rs.restaurant_id = c.restaurant_id
      WHERE rs.user_id = auth.uid() AND rs.role = 'admin'
    )
  );

CREATE POLICY "modifiers_update_admin"
  ON modifiers FOR UPDATE
  TO authenticated
  USING (
    menu_item_id IN (
      SELECT mi.id FROM menu_items mi
      JOIN categories c ON c.id = mi.category_id
      JOIN restaurants r ON r.id = c.restaurant_id
      WHERE r.owner_id = auth.uid()
    )
  );

CREATE POLICY "modifiers_delete_admin"
  ON modifiers FOR DELETE
  TO authenticated
  USING (
    menu_item_id IN (
      SELECT mi.id FROM menu_items mi
      JOIN categories c ON c.id = mi.category_id
      JOIN restaurants r ON r.id = c.restaurant_id
      WHERE r.owner_id = auth.uid()
    )
  );

-- ===========================================
-- Supabase Storage: bucket para imagens
-- ===========================================
-- Criar bucket 'menu-images' com:
--   public: true (imagens são públicas)
--   file_size_limit: 5MB
--   allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp']
```

---

## User Stories e Critérios de Aceitação

### US-02.1: CRUD de categorias (Admin)

**Como** admin, **quero** criar, editar, reordenar e excluir categorias do cardápio, **para** organizar os itens do meu restaurante.

**Critérios de aceitação:**
- [ ] Tela lista categorias ordenadas por `sort_order`
- [ ] Modal para criar categoria (campo: nome)
- [ ] Edição inline do nome da categoria
- [ ] Drag & drop para reordenar (atualiza `sort_order` de todas as categorias afetadas)
- [ ] Botão excluir com confirmação ("Excluir categoria e todos os itens?")
- [ ] Categoria com itens não pode ser excluída sem confirmação explícita

**Tela de referência:** Breadboarding seção 1 — [Tela: Lista de Categorias]

### US-02.2: CRUD de itens do cardápio (Admin)

**Como** admin, **quero** criar e editar itens com nome, descrição, preço, foto e status, **para** compor o cardápio.

**Critérios de aceitação:**
- [ ] Tela lista itens da categoria com foto miniatura, nome, preço e toggle ativo/inativo
- [ ] Formulário de criação/edição: nome (obrigatório), descrição, preço (obrigatório, formato R$), foto (upload), toggle ativo/inativo
- [ ] Upload de foto: aceita JPEG/PNG/WebP, máximo 5MB, preview antes de salvar
- [ ] Imagem redimensionada/otimizada antes do upload (max 800px largura)
- [ ] Toggle ativo/inativo atualizável diretamente na lista (sem abrir formulário)
- [ ] Drag & drop para reordenar itens dentro da categoria

**Tela de referência:** Breadboarding seção 1 — [Tela: Criar/Editar Item]

### US-02.3: CRUD de modificadores (Admin)

**Como** admin, **quero** adicionar modificadores aos itens (ex: "Sem Cebola", "Bacon Extra +R$5"), **para** permitir customizações.

**Critérios de aceitação:**
- [ ] Lista de modificadores no formulário do item
- [ ] Cada modificador tem: nome (obrigatório) e preço adicional (default R$0,00)
- [ ] Botão "+ Adicionar Modificador" adiciona nova linha
- [ ] Botão remover (X) ao lado de cada modificador
- [ ] Modificadores são salvos junto com o item

**Tela de referência:** Breadboarding seção 1 — Campo: Modificadores

### US-02.4: Visualização do cardápio (Cliente)

**Como** cliente, **quero** navegar pelo cardápio de um restaurante com categorias e itens, **para** escolher o que pedir.

**Critérios de aceitação:**
- [ ] Tela exibe nome do restaurante no topo
- [ ] Categorias como seções com scroll (ou tabs se poucas categorias)
- [ ] Cada item exibe: foto, nome, preço formatado (R$ X,XX)
- [ ] Apenas itens com `is_active = true` são exibidos
- [ ] Categorias vazias (sem itens ativos) não são exibidas

**Tela de referência:** Breadboarding seção 1 — [Tela: Cardápio do Restaurante]

### US-02.5: Detalhe do item e adição ao carrinho (Cliente)

**Como** cliente, **quero** ver detalhes de um item, selecionar modificadores e adicionar ao carrinho, **para** montar meu pedido.

**Critérios de aceitação:**
- [ ] Modal exibe: foto grande, nome, descrição, preço base
- [ ] Lista de modificadores como checkboxes (multi-seleção)
- [ ] Controle de quantidade: botões - e + (mínimo 1, máximo 99)
- [ ] Subtotal calculado em tempo real: (preço base + modificadores selecionados) × quantidade
- [ ] Botão "Adicionar ao Pedido" fecha modal e incrementa badge do carrinho
- [ ] Se item já está no carrinho, adiciona nova entrada (não agrupa)

**Tela de referência:** Breadboarding seção 1 — [Modal: Detalhe do Item]

### US-02.6: Carrinho e resumo do pedido (Cliente)

**Como** cliente, **quero** ver meu carrinho e revisar o pedido antes de pagar, **para** conferir itens e valores.

**Critérios de aceitação:**
- [ ] Botão flutuante do carrinho com badge de quantidade total
- [ ] Tela de resumo lista: nome do item, modificadores selecionados, quantidade, subtotal por item
- [ ] Botão remover item do carrinho
- [ ] Botão alterar quantidade (+/-)
- [ ] Subtotal geral calculado
- [ ] Botão "Continuar para Pagamento" (leva ao checkout — PRD-05)
- [ ] Carrinho vazio exibe mensagem e botão "Voltar ao Cardápio"

**Tela de referência:** Breadboarding seção 1 — [Tela: Resumo do Pedido]

---

## Rotas de API / Server Actions

| Método | Rota / Action | Descrição | Auth | Input | Output |
|---|---|---|---|---|---|
| GET | `getCategories(restaurantId)` | Lista categorias ordenadas | autenticado | `{ restaurantId: uuid }` | `Category[]` |
| POST | `createCategory()` | Cria categoria | admin | `{ restaurantId, name }` | `Category` |
| PUT | `updateCategory()` | Atualiza nome | admin | `{ id, name }` | `Category` |
| PUT | `reorderCategories()` | Reordena categorias | admin | `{ restaurantId, orderedIds: uuid[] }` | `void` |
| DELETE | `deleteCategory()` | Exclui categoria + itens | admin | `{ id }` | `void` |
| GET | `getMenuItems(categoryId)` | Lista itens da categoria | autenticado | `{ categoryId: uuid }` | `MenuItem[]` |
| GET | `getRestaurantMenu(restaurantId)` | Cardápio completo (categorias + itens + modificadores) | autenticado | `{ restaurantId: uuid }` | `MenuData` |
| POST | `createMenuItem()` | Cria item | admin | `{ categoryId, name, description?, price, imageUrl?, isActive, modifiers[] }` | `MenuItem` |
| PUT | `updateMenuItem()` | Atualiza item | admin | `{ id, ...fields }` | `MenuItem` |
| PUT | `toggleMenuItemActive()` | Toggle ativo/inativo | admin | `{ id, isActive }` | `void` |
| PUT | `reorderMenuItems()` | Reordena itens | admin | `{ categoryId, orderedIds: uuid[] }` | `void` |
| DELETE | `deleteMenuItem()` | Exclui item + modificadores | admin | `{ id }` | `void` |
| POST | `uploadMenuImage()` | Upload de foto | admin | `FormData (file)` | `{ url: string }` |

---

## Componentes de UI

| Componente | Tipo | Localização | Props principais |
|---|---|---|---|
| `CategoryList` | Client | `app/(admin)/menu/` | `restaurantId: string` |
| `CategoryModal` | Client | `app/(admin)/menu/` | `onSave, category?` |
| `MenuItemList` | Client | `app/(admin)/menu/[categoryId]/` | `categoryId: string` |
| `MenuItemForm` | Client | `app/(admin)/menu/[categoryId]/` | `item?, categoryId` |
| `ModifierFields` | Client | `app/(admin)/menu/` | `modifiers, onChange` |
| `ImageUpload` | Client | `components/` | `onUpload, currentUrl?` |
| `RestaurantMenu` | Server | `app/(client)/restaurant/[id]/` | `restaurantId` |
| `MenuSection` | Client | `app/(client)/restaurant/[id]/` | `category, items` |
| `MenuItemCard` | Client | `app/(client)/restaurant/[id]/` | `item: MenuItem` |
| `ItemDetailModal` | Client | `app/(client)/restaurant/[id]/` | `item, modifiers, onAdd` |
| `CartButton` | Client | `components/` | `itemCount: number` |
| `CartSummary` | Client | `app/(client)/cart/` | — |
| `CartItemRow` | Client | `app/(client)/cart/` | `cartItem, onRemove, onUpdateQty` |

---

## Estrutura de Arquivos Sugerida

```
app/
  (admin)/
    menu/
      page.tsx                      # Lista de categorias
      [categoryId]/
        page.tsx                    # Itens da categoria
        new/page.tsx                # Criar item
        [itemId]/edit/page.tsx      # Editar item
  (client)/
    restaurant/
      [id]/
        page.tsx                    # Cardápio do restaurante
    cart/
      page.tsx                      # Resumo do pedido

lib/
  validations/
    menu.ts                         # Schemas Zod para cardápio
  hooks/
    use-cart.ts                     # Hook/context do carrinho

types/
  menu.ts                           # MenuItem, Category, Modifier, CartItem
```

---

## Regras de Negócio

1. Preço do item deve ser >= R$0,00 (NUMERIC(10,2)).
2. Preço adicional do modificador deve ser >= R$0,00.
3. Itens inativos (`is_active = false`) não aparecem para o cliente, mas são visíveis para o admin.
4. Categorias sem itens ativos não são exibidas para o cliente.
5. O carrinho é armazenado em React Context + localStorage (persiste entre page refreshes, mas não entre dispositivos).
6. Cada adição ao carrinho cria uma nova entrada (mesmo item com modificadores diferentes = entradas separadas).
7. Upload de imagem: máximo 5MB, formatos JPEG/PNG/WebP.
8. Ao excluir uma categoria, todos os itens e modificadores são excluídos em cascata (CASCADE no FK).

---

## Tratamento de Erros e Edge Cases

| Cenário | Comportamento esperado |
|---|---|
| Upload de foto > 5MB | Toast: "Imagem deve ter no máximo 5MB" |
| Upload de formato inválido | Toast: "Formato não suportado. Use JPEG, PNG ou WebP" |
| Excluir categoria com itens | Modal de confirmação: "Esta categoria tem X itens. Excluir tudo?" |
| Cardápio sem categorias | Cliente vê mensagem "Cardápio em construção" |
| Carrinho vazio ao tentar checkout | Botão desabilitado + mensagem "Adicione itens ao pedido" |
| Item removido do cardápio enquanto no carrinho | Ao abrir resumo, remover item e exibir toast "Alguns itens foram removidos" |
| Falha no upload de imagem | Toast: "Erro ao enviar imagem. Tente novamente." Item salvo sem foto. |

---

## Cenários de Teste

### CT-02.1: Admin cria cardápio completo

**Dado** que sou admin logado no meu restaurante
**Quando** crio uma categoria "Bebidas", adiciono um item "Água" com preço R$5,00 e um modificador "Com Gás +R$1,00"
**Então** o item aparece na lista da categoria com foto, nome e preço

### CT-02.2: Cliente navega e adiciona ao carrinho

**Dado** que sou um cliente na tela de cardápio de um restaurante
**Quando** clico em um item, seleciono um modificador, escolho quantidade 2 e clico "Adicionar ao Pedido"
**Então** o modal fecha, o badge do carrinho mostra "2" e o resumo exibe o item com subtotal correto

### CT-02.3: Reordenação de categorias

**Dado** que sou admin com 3 categorias (Bebidas, Lanches, Porções)
**Quando** arrasto "Porções" para a primeira posição
**Então** a ordem persiste após reload: Porções, Bebidas, Lanches

### CT-02.4: Toggle ativo/inativo

**Dado** que sou admin com um item "Cerveja" ativo
**Quando** desativo o toggle na lista
**Então** o item não aparece mais para clientes, mas permanece visível para o admin

---

## Fora de Escopo

- Variações de item (tamanhos P/M/G) — usar modificadores com preço diferente
- Horários de disponibilidade por item
- Copiar cardápio de outro restaurante
- Busca de itens dentro do cardápio (apenas scroll por categoria)

---

## Notas de Implementação

- Drag & drop: usar `@dnd-kit/core` (leve, acessível, suporta touch).
- Upload de imagem: comprimir no client antes do upload com `browser-image-compression` (max 800px, quality 0.8).
- Carrinho: React Context com `useReducer` + `localStorage` para persistência. Namespace por `restaurantId`.
- Cardápio do cliente: buscar tudo em uma query (categorias + itens + modificadores) via `getRestaurantMenu()` para evitar waterfall.
- Formatação de preço: usar `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
