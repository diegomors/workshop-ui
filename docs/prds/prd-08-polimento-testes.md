# PRD-08: Polimento e Testes

**Scope:** 8 de 8
**Ciclo:** Primeiro (6 semanas)
**Semana(s):** 6
**Risco:** Baixo
**Prioridade:** Importante
**Última atualização:** 22 de Março de 2026

---

## Referências

- [Pitch](../shape-up/pitch-ciclo-1.md) — todos os no-gos e rabbit holes
- [Kickoff](../shape-up/kickoff.md) — Scope 8
- PRD-01 a PRD-07 — todos os cenários de teste

---

## Visão Geral

Semana final do ciclo. Sem novas funcionalidades. Foco em: testes end-to-end do fluxo completo, acessibilidade, responsividade, edge cases, performance e preparação para deploy de staging.

Este scope é cross-cutting — referencia e valida todos os scopes anteriores.

---

## Dependências

| Depende de | Motivo |
|---|---|
| PRD-01 a PRD-07 | Todos os scopes devem estar funcionais |

| Bloqueia | Motivo |
|---|---|
| — | Último scope do ciclo |

---

## 1. Testes End-to-End (Playwright)

### Fluxo completo: Pedido → Pagamento → Preparo → Entrega

```
CT-E2E-01: Ciclo completo do pedido
─────────────────────────────────────
1. Cliente faz login
2. Cliente abre mapa e clica em restaurante
3. Cliente navega cardápio e adiciona 2 itens ao carrinho
4. Cliente abre resumo, verifica subtotal e taxa de 10%
5. Cliente marca checkbox de cancelamento e paga com cartão (teste)
6. Cliente vê confirmação com número do pedido
7. Admin confirma pedido no painel kanban
8. Cozinha inicia preparo
9. Cozinha marca como pronto
10. Entregador inicia entrega (EM_ROTA)
11. Cliente vê posição do entregador no mapa
12. Cliente e entregador trocam mensagens no chat
13. Entregador insere código de 4 dígitos
14. Pedido finalizado como ENTREGUE
```

```
CT-E2E-02: Cancelamento com estorno
─────────────────────────────────────
1. Cliente faz pedido e paga
2. Pedido em REALIZADO
3. Cliente cancela pedido
4. Verifica: estado CANCELADO, estorno processado
```

```
CT-E2E-03: Cancelamento após confirmação
─────────────────────────────────────
1. Cliente faz pedido e paga
2. Admin confirma (CONFIRMADO)
3. Cliente cancela pedido
4. Verifica: estado CANCELADO, estorno processado
```

```
CT-E2E-04: Cancelamento bloqueado em preparo
─────────────────────────────────────
1. Cliente faz pedido e paga
2. Admin confirma e cozinha inicia preparo (EM_PREPARO)
3. Verifica: botão cancelar não aparece para o cliente
```

```
CT-E2E-05: Retirada pelo cliente
─────────────────────────────────────
1. Pedido chega a PRONTO_PARA_RETIRADA
2. Admin clica "Cliente Retirou"
3. Verifica: estado RETIRADO_PELO_CLIENTE
```

---

## 2. Testes de Acessibilidade

### Checklist WCAG 2.1 AA

- [ ] **Navegação por teclado:** Todas as ações possíveis via Tab + Enter/Space
- [ ] **Skip link:** Presente em todas as páginas, leva ao conteúdo principal
- [ ] **Contraste:** Mínimo 4.5:1 para texto normal, 3:1 para texto grande (verificar paleta laranja/preto/branco)
- [ ] **Labels:** Todo `<input>` tem `<label>` associado via `htmlFor`/`id`
- [ ] **Aria:** Modais com `role="dialog"` e `aria-modal="true"`. Toasts com `role="alert"`.
- [ ] **Focus management:** Foco vai para o modal ao abrir, volta ao trigger ao fechar
- [ ] **Screen reader:** Testar com NVDA (Windows) ou VoiceOver (Mac) nos fluxos principais:
  - Login/Cadastro
  - Navegação do cardápio + adicionar ao carrinho
  - Checkout e pagamento
  - Acompanhamento do pedido
- [ ] **Reduced motion:** Animações respeitam `prefers-reduced-motion`
- [ ] **Zoom:** Conteúdo legível em zoom de 200%

### Ferramenta: axe-core

```
- Executar axe-core em todas as páginas
- Zero violações de nível A e AA
- Documentar exceções justificadas (se houver)
```

---

## 3. Testes Responsivos

### Breakpoints a testar

| Dispositivo | Largura | Prioridade |
|---|---|---|
| iPhone SE | 375px | Alta |
| iPhone 14 | 390px | Alta |
| Android médio | 360px | Alta |
| Tablet | 768px | Média |
| Desktop | 1280px | Média |

### Checklist por breakpoint

- [ ] Layout não quebra (sem overflow horizontal)
- [ ] Texto legível sem zoom
- [ ] Botões com área de toque mínima de 44x44px (mobile)
- [ ] Mapa ocupa tela inteira em mobile
- [ ] Painel kanban scrollável horizontalmente em mobile
- [ ] Formulários usáveis com teclado virtual ativo
- [ ] Modal de detalhe do item não ultrapassa a viewport
- [ ] Bottom nav visível e funcional em mobile

---

## 4. Revisão de i18n

- [ ] Todos os textos visíveis em pt-BR extraídos para `messages/pt-BR.json`
- [ ] Nenhuma string hardcoded na UI (verificar com grep)
- [ ] Estrutura de namespaces organizada (auth, menu, orders, delivery, reports, common)
- [ ] Arquivos `messages/en.json` e `messages/es.json` com chaves vazias (placeholder)
- [ ] Formatação de moeda via `Intl.NumberFormat` (não hardcode "R$")
- [ ] Formatação de data/hora via `Intl.DateTimeFormat`

---

## 5. Edge Cases por Scope

| Scope | Edge Case | Verificação |
|---|---|---|
| Auth | Sessão expirada durante ação | Redirect para login com toast |
| Cardápio | Item removido enquanto no carrinho | Toast ao abrir resumo |
| Pedidos | Dois admins clicam "Confirmar" ao mesmo tempo | Apenas um ganha, outro vê "já atualizado" |
| Mapa | GPS negado | Mapa com posição default + banner |
| Pagamento | Timeout na API do Stripe | Toast de erro + retry |
| Pagamento | Fechar aba durante pagamento | Webhook processa; pedido aparece ao voltar |
| Chat | Realtime desconecta | Reconexão automática |
| Rastreamento | Entregador sem GPS | Chat como fallback |
| Entrega | Código errado 5x | Bloqueio por 2 minutos |

---

## 6. Performance

- [ ] **Lazy loading de imagens:** Fotos do cardápio com `loading="lazy"` ou `next/image`
- [ ] **Code splitting:** Verificar que cada rota carrega apenas seu bundle
- [ ] **Leaflet:** Dynamic import (não incluir no bundle principal)
- [ ] **Queries:** Nenhuma query N+1. Cardápio busca tudo em uma query.
- [ ] **Lighthouse:** Score mínimo 80 em Performance, 90 em Accessibility
- [ ] **First Contentful Paint < 2s** em 4G simulado

---

## 7. Deploy de Staging

### Variáveis de ambiente (Vercel)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=              # Chaves de TESTE
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

### Checklist de deploy

- [ ] Projeto conectado ao Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Build sem erros
- [ ] Preview deploy funcional
- [ ] Webhook do Stripe apontando para URL de staging
- [ ] Supabase em modo de projeto de teste

---

## 8. Documentação Mínima

- [ ] `README.md` atualizado com:
  - Descrição do projeto (1 parágrafo)
  - Pré-requisitos (Node.js, npm/pnpm)
  - Setup local (`git clone`, `npm install`, env vars, `npm run dev`)
  - Variáveis de ambiente necessárias (lista com descrição)
  - Comandos úteis (dev, build, test, lint)
- [ ] `.env.example` com todas as variáveis (valores vazios)

---

## Critério de Conclusão do Ciclo

O ciclo está **concluído** quando:

1. Fluxo E2E-01 (ciclo completo) passa sem erros manuais
2. Fluxo E2E-02 e E2E-03 (cancelamento + estorno) passam
3. Zero violações axe-core de nível A/AA
4. Layout funcional em iPhone SE (375px) e Desktop (1280px)
5. Todas as strings em pt-BR extraídas para i18n
6. Deploy de staging no Vercel acessível e funcional
7. README com instruções de setup local

---

## Fora de Escopo

- Testes automatizados com Playwright (apenas roteiros manuais neste ciclo)
- CI/CD pipeline (deploy manual no Vercel)
- Monitoramento de produção (Sentry, DataDog)
- Testes de carga/stress
- Tradução completa para en/es (apenas estrutura)

---

## Notas de Implementação

- **axe-core:** Instalar `@axe-core/react` para verificação em dev mode. Ou usar extensão axe DevTools no Chrome.
- **Lighthouse:** Executar via Chrome DevTools em modo incógnito para resultados limpos.
- **Strings hardcoded:** Buscar com `grep -r "\"[A-Z]" app/ components/` para encontrar strings que deveriam estar em i18n.
- **Deploy Vercel:** Conectar repo GitHub → automatic deploys no branch `main`. Preview deploys em branches de feature.
