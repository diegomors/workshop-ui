# PRD-01: Fundação e Autenticação

**Scope:** 1 de 8
**Ciclo:** Primeiro (6 semanas)
**Semana(s):** 1
**Risco:** Baixo
**Prioridade:** Bloqueante
**Última atualização:** 22 de Março de 2026

---

## Referências

- [Pitch](../shape-up/pitch-ciclo-1.md) — seção 7 (Autenticação)
- [Breadboarding](../shape-up/breadboarding.md) — seção 7 (Autenticação)
- [Kickoff](../shape-up/kickoff.md) — Scope 1

---

## Visão Geral

Este scope estabelece a fundação técnica do Mizz: projeto Next.js, integração com Supabase, sistema de autenticação com 4 roles, e os padrões de código que todos os scopes seguintes irão herdar.

Sem este scope, nada mais pode ser construído. Ele define as convenções de projeto (estrutura de pastas, client Supabase, tratamento de erros, validação de formulários, i18n e acessibilidade) que serão referenciadas como padrão nos PRDs subsequentes.

---

## Dependências

| Depende de | Motivo |
|---|---|
| — | Nenhuma dependência. Este é o primeiro scope. |

| Bloqueia | Motivo |
|---|---|
| PRD-02 a PRD-08 | Todos dependem de auth, schema base e padrões de projeto |

---

## Schema do Banco de Dados

```sql
-- ===========================================
-- ENUM: roles do sistema
-- ===========================================
CREATE TYPE user_role AS ENUM ('cliente', 'admin', 'cozinha', 'entregador');

-- ===========================================
-- profiles (extends auth.users do Supabase)
-- ===========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'cliente',
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index para buscas por role
CREATE INDEX idx_profiles_role ON profiles(role);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ler perfis
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Usuário só edita o próprio perfil
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Inserção via trigger (ver abaixo)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ===========================================
-- Trigger: criar perfil ao cadastrar usuário
-- ===========================================
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===========================================
-- restaurants
-- ===========================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_restaurants_active ON restaurants(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Todos podem ler restaurantes ativos
CREATE POLICY "restaurants_select_active"
  ON restaurants FOR SELECT
  TO authenticated
  USING (is_active = true OR owner_id = auth.uid());

-- Apenas o dono pode inserir/atualizar
CREATE POLICY "restaurants_insert_owner"
  ON restaurants FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "restaurants_update_owner"
  ON restaurants FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ===========================================
-- restaurant_staff
-- ===========================================
CREATE TYPE staff_role AS ENUM ('admin', 'cozinha', 'entregador');

CREATE TABLE restaurant_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role staff_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(restaurant_id, user_id)
);

CREATE INDEX idx_staff_restaurant ON restaurant_staff(restaurant_id);
CREATE INDEX idx_staff_user ON restaurant_staff(user_id);

-- RLS
ALTER TABLE restaurant_staff ENABLE ROW LEVEL SECURITY;

-- Staff pode ver colegas do mesmo restaurante
CREATE POLICY "staff_select_same_restaurant"
  ON restaurant_staff FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM restaurant_staff WHERE user_id = auth.uid()
    )
    OR
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- Apenas o dono do restaurante pode gerenciar staff
CREATE POLICY "staff_insert_owner"
  ON restaurant_staff FOR INSERT
  TO authenticated
  WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "staff_delete_owner"
  ON restaurant_staff FOR DELETE
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );
```

---

## User Stories e Critérios de Aceitação

### US-01.1: Cadastro de cliente

**Como** visitante, **quero** criar uma conta com nome, email, telefone e senha, **para** fazer pedidos no Mizz.

**Critérios de aceitação:**
- [ ] Formulário com campos: nome (obrigatório), email (obrigatório), telefone (opcional), senha (min 6 caracteres)
- [ ] Validação client-side e server-side (Zod)
- [ ] Após cadastro, perfil é criado automaticamente via trigger com role `cliente`
- [ ] Usuário é redirecionado para a tela Home/Mapa
- [ ] Erro exibido em toast se email já existe

**Tela de referência:** Breadboarding seção 7 — [Tela: Cadastro]

### US-01.2: Login

**Como** usuário cadastrado, **quero** fazer login com email e senha, **para** acessar o sistema.

**Critérios de aceitação:**
- [ ] Formulário com campos: email, senha
- [ ] Redirecionamento baseado no role:
  - `cliente` → `/` (Mapa/Home)
  - `admin` → `/admin` (Dashboard)
  - `cozinha` → `/admin/orders` (Painel de Pedidos)
  - `entregador` → `/delivery` (Painel de Entregas)
- [ ] Erro genérico em toast se credenciais inválidas ("Email ou senha incorretos")
- [ ] Sessão persistida via cookie (Supabase SSR)

**Tela de referência:** Breadboarding seção 7 — [Tela: Login]

### US-01.3: Recuperação de senha

**Como** usuário, **quero** recuperar minha senha via email, **para** voltar a acessar minha conta.

**Critérios de aceitação:**
- [ ] Campo de email + botão "Enviar link"
- [ ] Email enviado via Supabase Auth (resetPasswordForEmail)
- [ ] Mensagem de sucesso exibida independente de o email existir (segurança)
- [ ] Link no email leva a tela de redefinição de senha

**Tela de referência:** Breadboarding seção 7 — [Tela: Recuperar Senha]

### US-01.4: Proteção de rotas por role

**Como** sistema, **quero** proteger rotas por role, **para** que usuários não acessem áreas não autorizadas.

**Critérios de aceitação:**
- [ ] Middleware Next.js verifica sessão em todas as rotas protegidas
- [ ] Rotas `/admin/*` acessíveis apenas por `admin` e `cozinha`
- [ ] Rotas `/delivery/*` acessíveis apenas por `entregador`
- [ ] Rotas `/` (cliente) acessíveis por `cliente`
- [ ] Usuário não autenticado é redirecionado para `/login`
- [ ] Usuário autenticado com role incorreto é redirecionado para sua home

### US-01.5: Layout base responsivo

**Como** usuário, **quero** ver uma interface adaptada ao meu dispositivo e role, **para** navegar facilmente.

**Critérios de aceitação:**
- [ ] Header com logo Mizz e nome do usuário
- [ ] Navegação lateral (desktop) / bottom nav (mobile) com itens baseados no role
- [ ] Admin: Cardápio, Pedidos, Relatórios
- [ ] Cozinha: Pedidos
- [ ] Entregador: Entregas
- [ ] Cliente: sem nav (mapa é a home)
- [ ] Skip link para conteúdo principal (acessibilidade)
- [ ] Contraste mínimo AA (4.5:1)

---

## Rotas de API / Server Actions

| Método | Rota / Action | Descrição | Auth | Input | Output |
|---|---|---|---|---|---|
| POST | `signUp()` (Supabase Auth) | Cadastro de usuário | público | `{ email, password, name, phone }` | `{ user, session }` |
| POST | `signIn()` (Supabase Auth) | Login | público | `{ email, password }` | `{ user, session }` |
| POST | `signOut()` (Supabase Auth) | Logout | autenticado | — | — |
| POST | `resetPassword()` (Supabase Auth) | Envio de email de reset | público | `{ email }` | `{ success }` |
| GET | `getProfile()` Server Action | Busca perfil do usuário logado | autenticado | — | `Profile` |
| PUT | `updateProfile()` Server Action | Atualiza perfil | autenticado | `{ name?, phone?, avatar_url? }` | `Profile` |

---

## Componentes de UI

| Componente | Tipo | Localização | Props principais |
|---|---|---|---|
| `LoginForm` | Client | `app/(auth)/login/` | — |
| `SignUpForm` | Client | `app/(auth)/signup/` | — |
| `ResetPasswordForm` | Client | `app/(auth)/reset-password/` | — |
| `AdminLayout` | Server | `app/(admin)/layout.tsx` | `children` |
| `ClientLayout` | Server | `app/(client)/layout.tsx` | `children` |
| `DeliveryLayout` | Server | `app/(delivery)/layout.tsx` | `children` |
| `Header` | Server | `components/header.tsx` | `user: Profile` |
| `BottomNav` | Client | `components/bottom-nav.tsx` | `role: UserRole, items: NavItem[]` |
| `SkipLink` | Server | `components/skip-link.tsx` | — |

---

## Estrutura de Arquivos Sugerida

```
app/
  (auth)/
    login/page.tsx
    signup/page.tsx
    reset-password/page.tsx
    layout.tsx
  (admin)/
    layout.tsx
    page.tsx                    # Dashboard admin
  (client)/
    layout.tsx
    page.tsx                    # Home/Mapa (placeholder)
  (delivery)/
    layout.tsx
    page.tsx                    # Painel entregas (placeholder)
  layout.tsx                    # Root layout (providers, i18n, fonts)
  middleware.ts                 # Proteção de rotas

lib/
  supabase/
    client.ts                   # createBrowserClient
    server.ts                   # createServerClient
    middleware.ts               # createMiddlewareClient
  validations/
    auth.ts                     # Schemas Zod para auth

components/
  ui/                           # Radix primitives customizados
    button.tsx
    input.tsx
    toast.tsx
  header.tsx
  bottom-nav.tsx
  skip-link.tsx

messages/
  pt-BR.json                   # Mensagens i18n
  en.json                      # Estrutura vazia (placeholder)
  es.json                      # Estrutura vazia (placeholder)

i18n.ts                         # Config next-intl
```

---

## Regras de Negócio

1. Todo usuário novo recebe role `cliente` por padrão.
2. Roles `admin`, `cozinha` e `entregador` só são atribuídos manualmente (via Supabase Dashboard ou seed).
3. Um usuário pode ser staff de múltiplos restaurantes.
4. Um restaurante tem exatamente um `owner_id` (que é um `admin`).
5. A sessão expira conforme configuração do Supabase Auth (default: 1 hora com refresh token).

---

## Tratamento de Erros e Edge Cases

| Cenário | Comportamento esperado |
|---|---|
| Email já cadastrado | Toast: "Este email já está em uso" |
| Senha fraca (< 6 chars) | Validação client-side impede envio |
| Sessão expirada | Redirect para `/login` com toast "Sessão expirada" |
| Role não autorizado para rota | Redirect para home do role correto |
| Supabase indisponível | Toast: "Erro de conexão. Tente novamente." |

---

## Cenários de Teste

### CT-01.1: Cadastro e login completo

**Dado** que sou um visitante na tela de cadastro
**Quando** preencho nome, email, telefone e senha e clico em "Criar conta"
**Então** sou redirecionado para a Home/Mapa e vejo meu nome no header

### CT-01.2: Login com redirecionamento por role

**Dado** que sou um admin cadastrado
**Quando** faço login com minhas credenciais
**Então** sou redirecionado para `/admin` (Dashboard)

### CT-01.3: Proteção de rota não autorizada

**Dado** que estou logado como `cliente`
**Quando** acesso `/admin` diretamente na URL
**Então** sou redirecionado para `/` (Home/Mapa)

### CT-01.4: Recuperação de senha

**Dado** que estou na tela de recuperação de senha
**Quando** digito meu email e clico em "Enviar link"
**Então** vejo mensagem "Link enviado" (independente de o email existir)

---

## Fora de Escopo

- OAuth (Google, Apple, etc.) — apenas email/senha neste ciclo
- Edição de role pelo admin via UI (usa Supabase Dashboard)
- Verificação de email obrigatória
- Autenticação multifator (MFA)

---

## Notas de Implementação

- Usar `@supabase/ssr` para criar clients (browser, server, middleware) — não usar o client JS legado.
- Formulários com `react-hook-form` + `zod` resolver para validação.
- Toast via Radix `Toast` primitive ou equivalente acessível.
- i18n: configurar `next-intl` com middleware de detecção de locale, `pt-BR` como default.
- Acessibilidade: todo `<input>` deve ter `<label>` associado; usar `aria-describedby` para erros.

---

## Padrões Estabelecidos (Referência para PRDs 02-08)

Estes padrões definidos neste scope devem ser seguidos por todos os PRDs:

1. **Supabase Client:** `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server components/actions), `lib/supabase/middleware.ts` (middleware).
2. **Validação:** Schemas Zod em `lib/validations/`. Validar no client (react-hook-form) e no server (actions).
3. **Tratamento de erros:** Try/catch em Server Actions, retornar `{ data, error }`. Toast no client para exibir.
4. **Componentes UI:** Radix primitives em `components/ui/`. Estilos via Tailwind.
5. **i18n:** Namespaces em `messages/{locale}.json`. Usar `useTranslations('namespace')`.
6. **Rotas:** Route groups `(auth)`, `(admin)`, `(client)`, `(delivery)`.
7. **Loading states:** Skeleton components durante carregamento via `loading.tsx`.
