# PRD-07: Relatórios do Administrador

**Scope:** 7 de 8
**Ciclo:** Primeiro (6 semanas)
**Semana(s):** 5
**Risco:** Baixo
**Prioridade:** Importante (mas não bloqueante)
**Última atualização:** 22 de Março de 2026

---

## Referências

- [Pitch](../shape-up/pitch-ciclo-1.md) — seção 2 (Relatórios para o Administrador)
- [Breadboarding](../shape-up/breadboarding.md) — seção 2 (Relatórios para o Administrador)
- [Kickoff](../shape-up/kickoff.md) — Scope 7

---

## Visão Geral

Dois relatórios simples, não-interativos, exibindo dados dos últimos 7 dias. Zero customização, zero filtros, zero gráficos — conforme definido no pitch como linha no chão contra scope creep.

1. **Tempo Médio de Preparo:** Quanto tempo cada item leva da confirmação (CONFIRMADO) até ficar pronto (PRONTO_PARA_RETIRADA). Ajuda a identificar gargalos na cozinha.

2. **Desempenho da Equipe:** Quantas entregas cada entregador fez e qual o tempo médio de entrega (PRONTO_PARA_RETIRADA → ENTREGUE). Ajuda a identificar entregadores mais eficientes.

---

## Dependências

| Depende de | Motivo |
|---|---|
| PRD-01 | Auth, profiles |
| PRD-03 | Tabela order_status_history é a fonte dos dados |

| Bloqueia | Motivo |
|---|---|
| — | Nenhum scope depende dos relatórios |

---

## Schema do Banco de Dados

Nenhuma tabela nova. Os relatórios usam dados existentes:
- `order_status_history` — timestamps das transições de estado
- `order_items` — itens de cada pedido
- `menu_items` — nomes dos itens
- `profiles` — nomes dos entregadores

---

## Queries SQL

### Relatório 1: Tempo Médio de Preparo por Item

```sql
SELECT
  mi.name AS item_name,
  COUNT(DISTINCT oi.order_id) AS total_orders,
  ROUND(
    AVG(
      EXTRACT(EPOCH FROM (h_ready.created_at - h_confirmed.created_at)) / 60
    )::numeric,
    1
  ) AS avg_prep_time_min
FROM order_items oi
JOIN menu_items mi ON mi.id = oi.menu_item_id
JOIN order_status_history h_confirmed
  ON h_confirmed.order_id = oi.order_id
  AND h_confirmed.to_status = 'CONFIRMADO'
JOIN order_status_history h_ready
  ON h_ready.order_id = oi.order_id
  AND h_ready.to_status = 'PRONTO_PARA_RETIRADA'
JOIN orders o ON o.id = oi.order_id
WHERE o.restaurant_id = $1
  AND h_confirmed.created_at >= now() - INTERVAL '7 days'
GROUP BY mi.id, mi.name
ORDER BY avg_prep_time_min DESC;
```

### Relatório 2: Desempenho da Equipe (Entregadores)

```sql
SELECT
  p.name AS deliverer_name,
  COUNT(DISTINCT h_delivered.order_id) AS total_deliveries,
  ROUND(
    AVG(
      EXTRACT(EPOCH FROM (h_delivered.created_at - h_ready.created_at)) / 60
    )::numeric,
    1
  ) AS avg_delivery_time_min
FROM order_status_history h_delivered
JOIN order_status_history h_ready
  ON h_ready.order_id = h_delivered.order_id
  AND h_ready.to_status = 'PRONTO_PARA_RETIRADA'
JOIN profiles p ON p.id = h_delivered.changed_by
JOIN orders o ON o.id = h_delivered.order_id
WHERE h_delivered.to_status = 'ENTREGUE'
  AND o.restaurant_id = $1
  AND h_delivered.created_at >= now() - INTERVAL '7 days'
GROUP BY p.id, p.name
ORDER BY total_deliveries DESC;
```

---

## User Stories e Critérios de Aceitação

### US-07.1: Dashboard de relatórios

**Como** admin, **quero** ver dois relatórios dos últimos 7 dias, **para** acompanhar o desempenho do meu restaurante.

**Critérios de aceitação:**
- [ ] Tela acessível via menu lateral "Relatórios"
- [ ] Indicador de período fixo: "Últimos 7 dias" (texto, não editável)
- [ ] Duas seções (tabelas) dispostas verticalmente

### US-07.2: Tabela de tempo médio de preparo

**Como** admin, **quero** ver quanto tempo cada item demora para ser preparado, **para** identificar gargalos na cozinha.

**Critérios de aceitação:**
- [ ] Colunas: Item do Cardápio | Qtd Pedidos | Tempo Médio (min)
- [ ] Ordenado por tempo médio (maior primeiro)
- [ ] Tempo exibido com 1 casa decimal (ex: "12.5 min")
- [ ] Apenas itens com pelo menos 1 pedido nos últimos 7 dias
- [ ] Se sem dados, exibir "Nenhum pedido nos últimos 7 dias"
- [ ] Sem interação (apenas visualização)

**Tela de referência:** Breadboarding seção 2 — [Seção: Tempo Médio de Preparo]

### US-07.3: Tabela de desempenho da equipe

**Como** admin, **quero** ver o desempenho dos meus entregadores, **para** identificar os mais eficientes.

**Critérios de aceitação:**
- [ ] Colunas: Entregador | Total Entregas | Tempo Médio (min)
- [ ] Ordenado por total de entregas (maior primeiro)
- [ ] Tempo exibido com 1 casa decimal
- [ ] Apenas entregadores com pelo menos 1 entrega nos últimos 7 dias
- [ ] Se sem dados, exibir "Nenhuma entrega nos últimos 7 dias"
- [ ] Sem interação (apenas visualização)

**Tela de referência:** Breadboarding seção 2 — [Seção: Desempenho da Equipe]

---

## Rotas de API / Server Actions

| Método | Rota / Action | Descrição | Auth | Input | Output |
|---|---|---|---|---|---|
| GET | `getPrepTimeReport(restaurantId)` | Relatório de tempo de preparo | admin | `{ restaurantId }` | `PrepTimeRow[]` |
| GET | `getDeliveryPerformanceReport(restaurantId)` | Relatório de desempenho | admin | `{ restaurantId }` | `DeliveryPerformanceRow[]` |

**Tipos de retorno:**
```typescript
type PrepTimeRow = {
  itemName: string;
  totalOrders: number;
  avgPrepTimeMin: number;
};

type DeliveryPerformanceRow = {
  delivererName: string;
  totalDeliveries: number;
  avgDeliveryTimeMin: number;
};
```

---

## Componentes de UI

| Componente | Tipo | Localização | Props principais |
|---|---|---|---|
| `ReportsDashboard` | Server | `app/(admin)/reports/page.tsx` | `restaurantId` |
| `PrepTimeTable` | Server | `app/(admin)/reports/` | `data: PrepTimeRow[]` |
| `DeliveryPerformanceTable` | Server | `app/(admin)/reports/` | `data: DeliveryPerformanceRow[]` |
| `ReportPeriodBadge` | Server | `app/(admin)/reports/` | — (fixo "Últimos 7 dias") |
| `EmptyReportMessage` | Server | `components/` | `message: string` |

---

## Estrutura de Arquivos Sugerida

```
app/
  (admin)/
    reports/
      page.tsx                      # Dashboard com as duas tabelas

lib/
  queries/
    reports.ts                      # Queries SQL para relatórios

types/
  reports.ts                        # PrepTimeRow, DeliveryPerformanceRow
```

---

## Regras de Negócio

1. **Período fixo: últimos 7 dias** — contados a partir de `now()`. Não editável.
2. **Tempo de preparo = CONFIRMADO → PRONTO_PARA_RETIRADA** — se o pedido não passou por ambos os estados, não é contado.
3. **Tempo de entrega = PRONTO_PARA_RETIRADA → ENTREGUE** — mesma lógica.
4. **Pedidos cancelados não são contados** em nenhum relatório.
5. **Arredondamento: 1 casa decimal** para tempos em minutos.
6. **Relatórios são read-only** — sem filtros, sem ordenação alternativa, sem exportação.

---

## Tratamento de Erros e Edge Cases

| Cenário | Comportamento esperado |
|---|---|
| Nenhum pedido nos últimos 7 dias | Mensagem: "Nenhum pedido nos últimos 7 dias" em cada tabela |
| Restaurante novo (sem dados) | Ambas as tabelas exibem mensagem de "sem dados" |
| Pedido sem transição PRONTO_PARA_RETIRADA | Item não aparece no relatório 1 (filtrado pela query) |
| Pedido que nunca chegou a ENTREGUE | Não aparece no relatório 2 |
| Query lenta (muitos dados) | Aceitável para MVP. Se necessário, adicionar index na semana 6 |

---

## Cenários de Teste

### CT-07.1: Relatório com dados

**Dado** que meu restaurante tem 10 pedidos entregues nos últimos 7 dias
**Quando** acesso a tela de relatórios
**Então** vejo as duas tabelas com dados ordenados corretamente

### CT-07.2: Relatório vazio

**Dado** que meu restaurante não tem pedidos nos últimos 7 dias
**Quando** acesso a tela de relatórios
**Então** vejo "Nenhum pedido nos últimos 7 dias" em ambas as tabelas

### CT-07.3: Cálculo correto de tempo

**Dado** que um pedido foi confirmado às 14:00 e ficou pronto às 14:25
**Quando** vejo o relatório de tempo de preparo
**Então** o tempo médio para esse item inclui "25.0 min" no cálculo

---

## Fora de Escopo

- Filtros de data (customizáveis)
- Gráficos ou visualizações (apenas tabelas)
- Exportação CSV/PDF
- Relatório de faturamento
- Comparação entre períodos
- Relatório de itens mais vendidos (não definido no pitch)

---

## Notas de Implementação

- **Server Components:** Os relatórios são estáticos (sem interação). Usar Server Components para as tabelas — sem JavaScript no client.
- **Queries:** Executar via Supabase client com `.rpc()` ou queries raw. Considerar criar funções SQL no Supabase para encapsular as queries complexas.
- **Performance:** Para o MVP, queries diretas são suficientes. Se necessário, criar materialized views na semana 6 de polimento.
- **Formatação de tempo:** `${avgPrepTimeMin.toFixed(1)} min`.
