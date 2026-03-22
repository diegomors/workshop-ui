# PRD-04: Mapa Interativo

**Scope:** 4 de 8
**Ciclo:** Primeiro (6 semanas)
**Semana(s):** 3-4
**Risco:** Médio
**Prioridade:** Bloqueante
**Última atualização:** 22 de Março de 2026

---

## Referências

- [Pitch](../shape-up/pitch-ciclo-1.md) — seção 4 (Mapa Interativo)
- [Breadboarding](../shape-up/breadboarding.md) — seção 4 (Mapa Interativo)
- [Kickoff](../shape-up/kickoff.md) — Scope 4

---

## Visão Geral

O mapa é o elemento central da experiência. Para o cliente, é a tela home — ele descobre restaurantes próximos e inicia o fluxo de pedido. Para o entregador, é a ferramenta de navegação até o cliente.

A integração usa Leaflet + OpenStreetMap (zero custo de API). O componente de mapa é reutilizável e será usado tanto pelo cliente quanto pelo entregador e pelo acompanhamento de entrega (PRD-06).

---

## Dependências

| Depende de | Motivo |
|---|---|
| PRD-01 | Auth, profiles, restaurants |
| PRD-02 | Link do mapa leva ao cardápio do restaurante |
| PRD-03 | Localização do cliente é salva no pedido |

| Bloqueia | Motivo |
|---|---|
| PRD-06 | Rastreamento reutiliza o componente de mapa |

---

## Schema do Banco de Dados

```sql
-- ===========================================
-- Adicionar campos de localização a restaurants
-- (tabela já criada no PRD-01)
-- ===========================================
ALTER TABLE restaurants ADD COLUMN latitude DOUBLE PRECISION;
ALTER TABLE restaurants ADD COLUMN longitude DOUBLE PRECISION;
ALTER TABLE restaurants ADD COLUMN coverage_radius_km DOUBLE PRECISION NOT NULL DEFAULT 2.0;

-- Index espacial simplificado (sem PostGIS para manter simplicidade)
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Nota: customer_latitude e customer_longitude já foram adicionados
-- à tabela orders no PRD-03
```

---

## User Stories e Critérios de Aceitação

### US-04.1: Mapa home do cliente

**Como** cliente, **quero** ver um mapa com minha localização e restaurantes próximos, **para** descobrir onde posso pedir.

**Critérios de aceitação:**
- [ ] Mapa ocupa a tela inteira (mobile-first)
- [ ] Solicita permissão de geolocalização ao carregar
- [ ] Pin azul marca a localização do cliente
- [ ] Pins laranja marcam restaurantes ativos dentro do raio de cobertura
- [ ] Mapa centraliza na localização do cliente
- [ ] Zoom e pan atualizados de forma fluida
- [ ] Barra de busca no topo filtra restaurantes por nome (client-side)

**Tela de referência:** Breadboarding seção 4 — [Tela: Home / Mapa]

### US-04.2: Preview do restaurante

**Como** cliente, **quero** ver um preview ao clicar em um restaurante no mapa, **para** decidir se quero ver o cardápio.

**Critérios de aceitação:**
- [ ] Click no pin abre popup com: nome, descrição curta, distância estimada
- [ ] Botão "Ver Cardápio" navega para `/restaurant/{id}` (PRD-02)
- [ ] Distância calculada em linha reta (Haversine, exibida em metros ou km)
- [ ] Popup fecha ao clicar fora ou em outro pin

**Tela de referência:** Breadboarding seção 4 — [Popup: Preview do Restaurante]

### US-04.3: Mapa de navegação do entregador

**Como** entregador, **quero** ver a localização do cliente no mapa, **para** saber para onde ir.

**Critérios de aceitação:**
- [ ] Mapa exibe pin verde (entregador) e pin azul (cliente)
- [ ] Distância estimada exibida entre os dois pontos
- [ ] Mapa atualiza a posição do entregador (via GPS do navegador, a cada 5s)
- [ ] Botões: "Chat" (PRD-06) e "Entreguei" (PRD-06)

**Tela de referência:** Breadboarding seção 4 — [Tela: Mapa de Navegação]

### US-04.4: Salvar localização do cliente no pedido

**Como** sistema, **quero** salvar a localização do cliente no momento do pedido, **para** que o entregador saiba onde encontrá-lo.

**Critérios de aceitação:**
- [ ] No checkout (PRD-05), a geolocalização atual do cliente é capturada
- [ ] `customer_latitude` e `customer_longitude` são salvos na tabela orders
- [ ] Se GPS negado, campos ficam null (chat será o fallback)

### US-04.5: Geolocalização negada (fallback)

**Como** cliente com GPS negado, **quero** ainda usar o app, **para** fazer pedidos mesmo sem compartilhar localização.

**Critérios de aceitação:**
- [ ] Se geolocalização negada, mapa mostra posição default (centro da cidade/evento)
- [ ] Lista todos os restaurantes ativos (sem filtro por raio)
- [ ] Banner informativo: "Ative sua localização para ver restaurantes próximos"
- [ ] Pedido pode ser realizado sem localização (entregador usa chat para encontrar)

---

## Rotas de API / Server Actions

| Método | Rota / Action | Descrição | Auth | Input | Output |
|---|---|---|---|---|---|
| GET | `getNearbyRestaurants()` | Restaurantes dentro do raio | autenticado | `{ lat, lng, radiusKm? }` | `Restaurant[]` |
| GET | `getAllActiveRestaurants()` | Todos os restaurantes ativos | autenticado | — | `Restaurant[]` |
| GET | `getOrderLocation(orderId)` | Localização do cliente no pedido | entregador | `{ orderId }` | `{ lat, lng }` |

---

## Componentes de UI

| Componente | Tipo | Localização | Props principais |
|---|---|---|---|
| `MapView` | Client | `components/map/map-view.tsx` | `center, zoom, children` |
| `RestaurantPin` | Client | `components/map/restaurant-pin.tsx` | `restaurant, onClick` |
| `ClientPin` | Client | `components/map/client-pin.tsx` | `position` |
| `DeliveryPin` | Client | `components/map/delivery-pin.tsx` | `position` |
| `RestaurantPopup` | Client | `components/map/restaurant-popup.tsx` | `restaurant, distance` |
| `MapSearchBar` | Client | `components/map/map-search-bar.tsx` | `onSearch, restaurants` |
| `LocationBanner` | Client | `components/map/location-banner.tsx` | `onRequestPermission` |
| `DeliveryMap` | Client | `app/(delivery)/orders/[id]/` | `order, delivererPosition` |

---

## Estrutura de Arquivos Sugerida

```
app/
  (client)/
    page.tsx                        # Home = Mapa (usa MapView)
  (delivery)/
    orders/
      [id]/
        page.tsx                    # Mapa de navegação do entregador

components/
  map/
    map-view.tsx                    # Componente Leaflet wrapper (dynamic import)
    restaurant-pin.tsx
    client-pin.tsx
    delivery-pin.tsx
    restaurant-popup.tsx
    map-search-bar.tsx
    location-banner.tsx

lib/
  geo.ts                            # Haversine, formatDistance, etc.
  hooks/
    use-geolocation.ts              # Hook para geolocalização do navegador
```

---

## Regras de Negócio

1. Restaurantes só aparecem no mapa se `is_active = true` e possuem `latitude`/`longitude` preenchidos.
2. O raio de busca padrão é `coverage_radius_km` do restaurante (default 2.0 km).
3. Distância exibida em metros (< 1km) ou km (>= 1km), arredondada a 1 decimal.
4. A localização do cliente é capturada uma vez no checkout e salva no pedido — não é atualizada depois.
5. Se o GPS é negado, o sistema funciona sem localização — chat é o fallback para o entregador.

---

## Tratamento de Erros e Edge Cases

| Cenário | Comportamento esperado |
|---|---|
| GPS negado pelo navegador | Mapa mostra posição default; banner pedindo ativação; lista todos restaurantes |
| GPS indisponível (sem HTTPS) | Mesmo tratamento do GPS negado |
| Nenhum restaurante no raio | Mensagem: "Nenhum restaurante encontrado perto de você" + sugestão de aumentar zoom |
| Restaurante sem coordenadas | Não aparece no mapa (filtrado na query) |
| Mapa não carrega (CDN Leaflet) | Fallback: lista simples de restaurantes sem mapa |
| Posição do entregador não atualiza | Após 30s sem atualização, exibir "Última localização: X min atrás" |

---

## Cenários de Teste

### CT-04.1: Cliente descobre restaurante no mapa

**Dado** que estou logado como cliente com GPS ativado
**Quando** abro a home
**Então** vejo o mapa centralizado na minha posição com pins de restaurantes próximos

### CT-04.2: Preview e navegação para cardápio

**Dado** que vejo pins de restaurantes no mapa
**Quando** clico em um pin
**Então** vejo popup com nome, distância e botão "Ver Cardápio" que me leva ao cardápio

### CT-04.3: Busca por nome

**Dado** que estou no mapa com 10 restaurantes visíveis
**Quando** digito "Pizza" na barra de busca
**Então** apenas restaurantes com "Pizza" no nome ficam visíveis

### CT-04.4: GPS negado

**Dado** que nego a permissão de geolocalização
**Quando** o mapa carrega
**Então** vejo posição default, banner de ativação e todos os restaurantes listados

---

## Fora de Escopo

- Cálculo de rota (entregador decide o caminho)
- Filtros por categoria/tipo de comida
- Favoritar restaurantes
- PostGIS (query espacial feita com cálculo Haversine no server)

---

## Notas de Implementação

- **Leaflet + SSR:** Leaflet não funciona em SSR. Usar `dynamic(() => import('./MapView'), { ssr: false })` no Next.js.
- **Tiles:** OpenStreetMap tiles gratuitos. URL: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.
- **react-leaflet:** Usar `react-leaflet` v4+ para integração com React 18.
- **Haversine:** Fórmula simples para cálculo de distância. Implementar em `lib/geo.ts`, ~10 linhas.
- **Busca de restaurantes:** Para o MVP, buscar todos os restaurantes ativos e filtrar client-side por raio. Se performance for problema (>100 restaurantes), mover filtro para o server com `WHERE latitude BETWEEN ... AND longitude BETWEEN ...` (bounding box).
