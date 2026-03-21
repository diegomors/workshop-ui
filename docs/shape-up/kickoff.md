# Mizz: Kickoff - Primeiro Ciclo

**Ciclo:** 6 semanas
**Início:** 24 de Março de 2026
**Fim:** 02 de Maio de 2026
**Método:** Shape Up com desenvolvimento assistido por IA

---

## Contexto

Este documento traduz o pitch e o breadboarding em **escopos de trabalho (scopes)** para o ciclo de 6 semanas. O objetivo é dar à equipe clareza sobre o que construir, em que ordem, e quais são os riscos técnicos a resolver primeiro.

Referências:
- [Pitch v8.5](./pitch-ciclo-1.md)
- [Breadboarding](./breadboarding.md)

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js (App Router) + React + TypeScript |
| Estilização | Tailwind CSS (paleta: Laranja/Preto/Branco) |
| Backend/API | Next.js API Routes / Server Actions |
| Banco de Dados | Supabase (PostgreSQL + Auth + Realtime) |
| Mapas | Leaflet + OpenStreetMap |
| Pagamento | Stripe Connect (ou Pagar.me) |
| Rastreamento GPS | HyperTrack ou Radar.io SDK |
| Chat em Tempo Real | Supabase Realtime |
| Notificações | Supabase Realtime (in-app) + Web Push API |
| Deploy | Vercel |
| i18n | next-intl (pt-BR, en, es) |
| Acessibilidade | Radix UI primitives + axe-core para testes |

---

## Scopes

Os scopes são organizados por **risco decrescente** — começamos pelo que tem mais incerteza técnica e terminamos com o que é mais previsível.

---

### Scope 1: Fundação e Autenticação
**Semana 1** | Risco: Baixo | Prioridade: Bloqueante

O alicerce do projeto. Sem isso, nada mais funciona.

**O que construir:**
- [ ] Setup do projeto Next.js + Tailwind + TypeScript
- [ ] Integração Supabase (projeto, schema inicial, variáveis de ambiente)
- [ ] Sistema de autenticação com Supabase Auth (email/senha)
- [ ] Roles: `cliente`, `admin`, `cozinha`, `entregador`
- [ ] Middleware de proteção de rotas por role
- [ ] Layout base responsivo (header, navegação por role)
- [ ] Telas: Login, Cadastro, Recuperar Senha
- [ ] Setup de i18n (pt-BR como default, estrutura para en/es)
- [ ] Configuração de acessibilidade base (Radix primitives, skip links, contraste AA)

**Schema inicial:**
```sql
-- profiles (extends Supabase auth.users)
profiles (id, role, name, phone, avatar_url, created_at)

-- restaurants
restaurants (id, owner_id, name, description, logo_url, is_active, created_at)

-- restaurant_staff
restaurant_staff (id, restaurant_id, user_id, role, created_at)
```

**Critério de conclusão:** Um usuário pode se cadastrar, fazer login e ver um dashboard diferente conforme seu role.

---

### Scope 2: Cardápio Digital
**Semanas 1-2** | Risco: Baixo | Prioridade: Bloqueante

O cardápio é o coração do pedido. Sem cardápio, não há pedido.

**O que construir:**
- [ ] Schema: categorias, itens, modificadores
- [ ] Admin: CRUD de categorias (criar, editar, reordenar, excluir)
- [ ] Admin: CRUD de itens (nome, descrição, preço, foto, toggle ativo/inativo)
- [ ] Admin: CRUD de modificadores por item (nome, preço adicional)
- [ ] Upload de fotos (Supabase Storage)
- [ ] Cliente: tela de cardápio por restaurante (categorias como seções)
- [ ] Cliente: modal de detalhe do item com modificadores e quantidade
- [ ] Cliente: carrinho flutuante com badge de quantidade
- [ ] Cliente: tela de resumo do pedido (itens, modificadores, subtotal)

**Schema:**
```sql
categories (id, restaurant_id, name, sort_order, created_at)

menu_items (id, category_id, name, description, price, image_url, is_active, sort_order, created_at)

modifiers (id, menu_item_id, name, additional_price, created_at)
```

**Critério de conclusão:** Admin cria um cardápio completo; cliente navega, adiciona itens ao carrinho e vê o resumo do pedido.

---

### Scope 3: Máquina de Estados e Painel de Pedidos
**Semanas 2-3** | Risco: Médio | Prioridade: Bloqueante

O motor central do sistema. Define o ciclo de vida do pedido e a interface de operação.

**O que construir:**
- [ ] Schema: pedidos, itens do pedido, histórico de estados
- [ ] Máquina de estados no backend (transições válidas, validação)
- [ ] Notificações em tempo real via Supabase Realtime (mudança de estado)
- [ ] Admin/Cozinha: painel kanban de pedidos (colunas por estado)
- [ ] Admin: ações por coluna (confirmar, cancelar, iniciar preparo, pronto)
- [ ] Cliente: tela de acompanhamento com estado atual e timeline
- [ ] Notificações in-app para o cliente (toast/banner a cada transição)
- [ ] Regra de cancelamento: botão só visível em REALIZADO/CONFIRMADO

**Schema:**
```sql
orders (id, restaurant_id, customer_id, status, total, service_fee,
        payment_intent_id, delivery_code, notes, created_at, updated_at)

order_items (id, order_id, menu_item_id, quantity, unit_price,
             modifiers_json, subtotal, created_at)

order_status_history (id, order_id, from_status, to_status,
                      changed_by, created_at)
```

**Estados e transições válidas:**
```
REALIZADO      → CONFIRMADO, CANCELADO
CONFIRMADO     → EM_PREPARO, CANCELADO
EM_PREPARO     → PRONTO_PARA_RETIRADA, RETIRADO_PELO_CLIENTE
PRONTO_PARA_RETIRADA → EM_ROTA, RETIRADO_PELO_CLIENTE
EM_ROTA        → ENTREGUE
```

**Critério de conclusão:** Um pedido percorre todos os estados com notificações em tempo real. Admin opera o painel kanban. Cliente acompanha o status.

---

### Scope 4: Mapa Interativo
**Semanas 3-4** | Risco: Médio | Prioridade: Bloqueante

O mapa é o elemento central da experiência. Conecta cliente a restaurante e entregador a cliente.

**O que construir:**
- [ ] Schema: localização do restaurante (lat/lng), área de cobertura
- [ ] Integração Leaflet + OpenStreetMap (componente React reutilizável)
- [ ] Cliente: mapa como tela home com geolocalização do navegador
- [ ] Cliente: pins de restaurantes próximos (raio configurável)
- [ ] Cliente: popup de preview do restaurante → link para cardápio
- [ ] Entregador: mapa de navegação com pin do cliente
- [ ] Salvamento da localização do cliente no momento do pedido

**Schema adicional:**
```sql
-- Adicionar a restaurants:
ALTER TABLE restaurants ADD COLUMN latitude DOUBLE PRECISION;
ALTER TABLE restaurants ADD COLUMN longitude DOUBLE PRECISION;
ALTER TABLE restaurants ADD COLUMN coverage_radius_km DOUBLE PRECISION DEFAULT 2.0;

-- Adicionar a orders:
ALTER TABLE orders ADD COLUMN customer_latitude DOUBLE PRECISION;
ALTER TABLE orders ADD COLUMN customer_longitude DOUBLE PRECISION;
```

**Critério de conclusão:** Cliente vê restaurantes no mapa baseado em sua localização. Entregador vê a localização do cliente para navegação.

---

### Scope 5: Pagamento e Monetização
**Semanas 3-4** | Risco: Alto | Prioridade: Bloqueante

Integração com gateway externo. Alto risco por depender de API de terceiros e fluxo financeiro.

**O que construir:**
- [ ] Conta Stripe Connect (ou Pagar.me) configurada
- [ ] Onboarding do restaurante no Stripe Connect (conta conectada)
- [ ] Cliente: tela de checkout com resumo + taxa de 10%
- [ ] Cliente: checkbox obrigatório de política de cancelamento
- [ ] Integração: criação de Payment Intent com split (90%/10%)
- [ ] Integração: pagamento via cartão (Stripe Elements)
- [ ] Integração: pagamento via Pix (QR Code via API)
- [ ] Webhook: confirmação de pagamento → criar pedido com status REALIZADO
- [ ] Cancelamento: estorno automático via API ao cancelar pedido
- [ ] Tratamento de falhas de pagamento (mensagem de erro, retry)

**Variáveis de ambiente:**
```
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

**Critério de conclusão:** Cliente paga (cartão ou Pix), split é feito automaticamente, pedido é criado. Cancelamento gera estorno.

---

### Scope 6: Rastreamento e Chat
**Semanas 4-5** | Risco: Alto | Prioridade: Importante

A maior incerteza técnica do ciclo. Depende de SDK externo + tempo real.

**O que construir:**
- [ ] Integração SDK de rastreamento (HyperTrack ou Radar.io)
- [ ] Entregador: ativação de rastreamento ao mudar para EM_ROTA
- [ ] Cliente: visualização em tempo real da posição do entregador no mapa
- [ ] Chat simples via Supabase Realtime (texto apenas)
- [ ] Schema: mensagens de chat vinculadas ao pedido
- [ ] Entregador: tela de chat com cliente
- [ ] Cliente: tela de chat com entregador
- [ ] Confirmação de entrega: modal com código de 4 dígitos
- [ ] Geração do código de entrega no momento do pedido

**Schema:**
```sql
chat_messages (id, order_id, sender_id, message, created_at)

-- delivery_code já está em orders.delivery_code (4 dígitos gerados no REALIZADO)
```

**Riscos específicos:**
- SDK de rastreamento pode ter latência alta → aceitar atualização a cada 5-10s
- Permissão de GPS no navegador pode ser negada → fallback para chat
- Consumo de bateria no dispositivo do entregador → monitorar

**Critério de conclusão:** Entregador é rastreado em tempo real, cliente vê no mapa, ambos se comunicam via chat, entrega é confirmada com código.

---

### Scope 7: Relatórios do Administrador
**Semana 5** | Risco: Baixo | Prioridade: Importante (mas não bloqueante)

Relatórios simples com dados dos últimos 7 dias. Zero interatividade.

**O que construir:**
- [ ] Query: tempo médio de preparo por item (CONFIRMADO → PRONTO_PARA_RETIRADA)
- [ ] Query: desempenho por entregador (total entregas, tempo médio PRONTO → ENTREGUE)
- [ ] Admin: dashboard com duas tabelas estáticas
- [ ] Tabela 1: Item | Qtd Pedidos | Tempo Médio (min) — ordenado por tempo
- [ ] Tabela 2: Entregador | Total Entregas | Tempo Médio (min) — ordenado por total
- [ ] Indicador de período: "Últimos 7 dias" (fixo, não editável)

**Critério de conclusão:** Admin vê os dois relatórios com dados reais dos últimos 7 dias.

---

### Scope 8: Polimento e Testes
**Semana 6** | Risco: Baixo | Prioridade: Importante

Semana final para fechar pontas soltas, testar fluxos ponta a ponta e preparar para produção.

**O que fazer:**
- [ ] Teste end-to-end do fluxo completo (pedido → pagamento → preparo → entrega)
- [ ] Testes de acessibilidade (navegação por teclado, screen reader, contraste)
- [ ] Testes responsivos (mobile-first: iPhone SE, iPhone 14, Android médio)
- [ ] Revisão de i18n (textos em pt-BR completos, estrutura para en/es)
- [ ] Tratamento de edge cases (pedido sem itens, GPS negado, pagamento timeout)
- [ ] Performance: lazy loading de imagens, otimização de queries
- [ ] Deploy de staging no Vercel para testes com usuários reais
- [ ] Documentação mínima: variáveis de ambiente, setup local, deploy

---

## Timeline Visual

```
Semana 1  ████████████████████████████████████████
          [Scope 1: Fundação]  [Scope 2: Cardápio (início)]

Semana 2  ████████████████████████████████████████
          [Scope 2: Cardápio]  [Scope 3: Estado/Painel (início)]

Semana 3  ████████████████████████████████████████
          [Scope 3: Estado/Painel]  [Scope 4: Mapa]  [Scope 5: Pagamento (início)]

Semana 4  ████████████████████████████████████████
          [Scope 4: Mapa]  [Scope 5: Pagamento]  [Scope 6: Rastreamento (início)]

Semana 5  ████████████████████████████████████████
          [Scope 6: Rastreamento/Chat]  [Scope 7: Relatórios]

Semana 6  ████████████████████████████████████████
          [Scope 8: Polimento e Testes]
```

---

## Decisões Técnicas Importantes

### 1. Por que Supabase?
- Auth pronto (email, OAuth, roles via RLS)
- Realtime nativo (chat e notificações sem infraestrutura adicional)
- PostgreSQL com RLS (segurança por row-level sem middleware)
- Storage para fotos do cardápio
- Reduz drasticamente o tempo de setup do backend

### 2. Por que Leaflet + OpenStreetMap?
- Zero custo de API (Google Maps cobra por request)
- Boa performance para mapas simples
- Ecossistema React maduro (react-leaflet)

### 3. Por que Stripe Connect (vs Pagar.me)?
- Decisão a ser tomada na Semana 3 com base em:
  - Suporte a Pix nativo
  - Facilidade de onboarding de restaurantes brasileiros
  - Qualidade da documentação e SDKs
  - Taxas por transação
- **Ambos suportam split de pagamento**, que é o requisito hard

### 4. Por que SDK de rastreamento (vs build próprio)?
- Conforme definido no pitch: o ciclo é de **integração**, não de construção
- HyperTrack e Radar.io oferecem SDK pronto para web
- Decisão final entre os dois na Semana 4 após POC

---

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| API do gateway de pagamento instável | Alto | Implementar retry com backoff; modo de teste do Stripe desde o dia 1 |
| SDK de rastreamento com latência alta | Médio | Aceitar atualização a cada 5-10s; chat como fallback |
| GPS negado pelo navegador | Médio | Fallback para input manual de referência; chat |
| Complexidade do split de pagamento | Alto | Usar conta de teste; validar fluxo completo na Semana 3 |
| Escopo creep nos relatórios | Baixo | Relatórios são fixos, sem filtros, sem gráficos — conforme no-gos |

---

## O Que NÃO Faremos (Reforço dos No-Gos)

Estes itens estão **fora do escopo** deste ciclo. Se alguém sugerir, a resposta é "não neste ciclo":

- Controle de estoque
- Otimização de rotas
- App nativo
- Estorno parcial
- Relatórios customizáveis
- Botão sinalizador
- Filtros de data nos relatórios
- Exportação de dados (CSV/PDF)
- Múltiplos idiomas completos (só estrutura de i18n)
