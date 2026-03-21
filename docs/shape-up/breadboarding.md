# Mizz: Breadboarding - Primeiro Ciclo

Diagramas de fluxo para cada elemento funcional do pitch. Cada breadboard mostra **places** (telas), **affordances** (elementos interativos) e **connection lines** (fluxos entre telas).

---

## 1. Cardápio Digital (Admin)

### Fluxo: Gerenciamento do Cardápio

```
[Dashboard Admin]
    |
    |--> (Botão: Cardápio)
            |
            v
[Tela: Lista de Categorias]
    | Exibe: categorias ordenadas (ex: Bebidas, Lanches, Porções)
    |
    |--> (Botão: + Nova Categoria)
    |       |
    |       v
    |   [Modal: Criar Categoria]
    |       | Campo: Nome da categoria
    |       |--> (Botão: Salvar) --> volta para [Lista de Categorias]
    |
    |--> (Click: Categoria existente)
            |
            v
[Tela: Itens da Categoria]
    | Exibe: lista de itens com foto, nome, preço, status (ativo/inativo)
    |
    |--> (Botão: + Novo Item)
    |       |
    |       v
    |   [Tela: Criar/Editar Item]
    |       | Campo: Nome
    |       | Campo: Descrição
    |       | Campo: Preço (R$)
    |       | Campo: Foto (upload)
    |       | Campo: Modificadores (lista dinâmica)
    |       |   |--> (Botão: + Adicionar Modificador)
    |       |           | Campo: Nome (ex: "Sem Cebola")
    |       |           | Campo: Preço adicional (R$ 0,00 default)
    |       | Toggle: Ativo/Inativo
    |       |--> (Botão: Salvar) --> volta para [Itens da Categoria]
    |
    |--> (Click: Item existente) --> [Tela: Criar/Editar Item] (modo edição)
    |
    |--> (Drag & Drop: reordenar itens)
```

### Fluxo: Visualização do Cardápio (Cliente)

```
[Tela: Mapa com Restaurantes]
    |
    |--> (Click: Pin do restaurante)
            |
            v
[Tela: Cardápio do Restaurante]
    | Exibe: nome do restaurante, categorias como tabs/seções
    | Exibe: itens com foto, nome, preço
    |
    |--> (Click: Item)
            |
            v
    [Modal: Detalhe do Item]
        | Exibe: foto grande, nome, descrição, preço
        | Exibe: lista de modificadores (checkboxes)
        | Campo: Quantidade (-, 1, +)
        | Exibe: Subtotal calculado
        |--> (Botão: Adicionar ao Pedido) --> volta para [Cardápio] com badge no carrinho
        |
        v
[Tela: Cardápio] (com carrinho flutuante)
    |
    |--> (Botão: Ver Pedido / Carrinho)
            |
            v
[Tela: Resumo do Pedido] --> continua no fluxo de Pagamento (seção 3)
```

---

## 2. Relatórios para o Administrador

### Fluxo: Dashboard de Relatórios

```
[Dashboard Admin]
    |
    |--> (Botão/Tab: Relatórios)
            |
            v
[Tela: Dashboard de Relatórios]
    | Exibe: período fixo "Últimos 7 dias" (não editável)
    |
    |--- [Seção: Tempo Médio de Preparo]
    |       | Exibe: tabela simples
    |       | Colunas: Item do Cardápio | Qtd Pedidos | Tempo Médio (min)
    |       | Ordenado: por tempo médio (maior primeiro)
    |       | Dados: CONFIRMADO --> PRONTO_PARA_RETIRADA
    |       | Sem interação (apenas visualização)
    |
    |--- [Seção: Desempenho da Equipe]
            | Exibe: tabela simples
            | Colunas: Entregador | Total Entregas | Tempo Médio (min)
            | Ordenado: por total de entregas (maior primeiro)
            | Dados: PRONTO_PARA_RETIRADA --> ENTREGUE
            | Sem interação (apenas visualização)
```

---

## 3. Pagamento e Monetização

### Fluxo: Checkout e Pagamento

```
[Tela: Resumo do Pedido]
    | Exibe: lista de itens com modificadores e preços
    | Exibe: Subtotal do pedido
    | Exibe: Taxa de serviço (10%)
    | Exibe: Total a pagar
    | Checkbox: "Entendo que após o preparo iniciar, o pedido não pode ser cancelado"
    |
    |--> (Botão: Pagar) [desabilitado até checkbox marcado]
            |
            v
[Tela: Pagamento]
    | Exibe: Total a pagar
    | Opção: Cartão de Crédito
    |   | Campos: número, validade, CVV, nome
    | Opção: Pix
    |   | Exibe: QR Code gerado pelo gateway
    |
    |--> (Ação: Processar pagamento via gateway)
            |
            |--> [Sucesso]
            |       | Split automático: 90% restaurante / 10% Mizz
            |       | Pedido criado com estado REALIZADO
            |       v
            |   [Tela: Confirmação do Pedido]
            |       | Exibe: "Pedido enviado! Aguardando confirmação."
            |       | Exibe: número do pedido
            |       |--> (Link: Acompanhar Pedido) --> [Tela: Acompanhamento]
            |
            |--> [Falha]
                    v
                [Tela: Pagamento] com mensagem de erro
                    | "Pagamento não aprovado. Tente novamente."
```

### Fluxo: Cancelamento e Estorno

```
[Tela: Acompanhamento do Pedido]
    | Estado atual: REALIZADO ou CONFIRMADO
    |
    |--> (Botão: Cancelar Pedido) [visível apenas em REALIZADO/CONFIRMADO]
            |
            v
    [Modal: Confirmar Cancelamento]
        | "Deseja cancelar o pedido? O valor será estornado integralmente."
        |--> (Botão: Sim, cancelar)
        |       | Gateway processa estorno (pedido + taxa)
        |       | Estado --> CANCELADO
        |       v
        |   [Tela: Pedido Cancelado]
        |       | "Pedido cancelado. Estorno realizado automaticamente."
        |
        |--> (Botão: Não, manter pedido) --> volta para [Acompanhamento]
```

---

## 4. Mapa Interativo

### Fluxo: Cliente - Descoberta de Restaurantes

```
[Tela: Home / Mapa]
    | Exibe: Mapa (Leaflet + OpenStreetMap)
    | Exibe: Localização atual do cliente (pin azul)
    | Exibe: Restaurantes próximos (pins laranja)
    | Exibe: Barra de busca no topo (filtrar por nome)
    |
    |--> (Click: Pin de restaurante)
    |       |
    |       v
    |   [Popup: Preview do Restaurante]
    |       | Exibe: Nome, categoria, distância estimada
    |       |--> (Botão: Ver Cardápio) --> [Tela: Cardápio do Restaurante]
    |
    |--> (Gesto: Zoom/Pan no mapa) --> atualiza pins visíveis
```

### Fluxo: Entregador - Localização do Cliente

```
[Tela: Painel do Entregador]
    | Exibe: lista de pedidos PRONTO_PARA_RETIRADA
    |
    |--> (Click: Pedido)
            |
            v
[Tela: Detalhe da Entrega]
    | Exibe: itens do pedido
    | Exibe: nome do cliente
    |--> (Botão: Iniciar Entrega)
            | Estado --> EM_ROTA
            | Ativa rastreamento GPS (SDK)
            v
[Tela: Mapa de Navegação]
    | Exibe: Mapa com localização do entregador (pin verde, tempo real)
    | Exibe: Localização do cliente (pin azul)
    | Exibe: distância estimada
    |--> (Botão: Chat) --> [Tela: Chat] (ver seção 5)
    |--> (Botão: Entreguei) --> [Modal: Código de Confirmação]
```

---

## 5. Rastreamento e Encontro

### Fluxo: Cliente acompanha entrega

```
[Tela: Acompanhamento do Pedido]
    | Estado: EM_ROTA
    | Exibe: Mapa com localização do entregador (tempo real)
    | Exibe: nome do entregador
    | Exibe: distância estimada
    |
    |--> (Botão: Chat com Entregador)
            |
            v
[Tela: Chat]
    | Exibe: mensagens de texto simples (sem mídia)
    | Campo: input de texto
    | Participantes: cliente <-> entregador
    |--> (Botão: Enviar) --> mensagem aparece na conversa
    |--> (Botão: Voltar) --> [Tela: Acompanhamento]
```

### Fluxo: Confirmação de Entrega

```
[Tela: Mapa de Navegação] (Entregador)
    |
    |--> (Botão: Entreguei)
            |
            v
[Modal: Código de Confirmação]
    | Campo: Código de 4 dígitos (informado pelo cliente)
    |--> (Botão: Confirmar)
    |       |
    |       |--> [Código correto]
    |       |       | Estado --> ENTREGUE
    |       |       v
    |       |   [Tela: Entrega Confirmada]
    |       |       | "Entrega realizada com sucesso!"
    |       |
    |       |--> [Código incorreto]
    |               | Mensagem: "Código inválido. Tente novamente."
    |               | Permanece no modal
    |
    |--> (Botão: Cancelar) --> volta para [Mapa de Navegação]
```

---

## 6. Máquina de Estados e Notificações

### Fluxo: Ciclo de Vida do Pedido

```
                            [REALIZADO]
                    (cliente paga com sucesso)
                                |
                    +-----------+-----------+
                    |                       |
            (admin confirma)        (admin/cliente cancela)
                    |                       |
                    v                       v
              [CONFIRMADO]            [CANCELADO]
                    |                 (estorno automático)
            +-------+-------+
            |               |
    (admin/cliente      (cozinha inicia)
     cancela)               |
            |               v
            v          [EM_PREPARO]
      [CANCELADO]           |
      (estorno              |
       automático)  +-------+-------+
                    |               |
            (cozinha finaliza) (cliente retira)
                    |               |
                    v               v
        [PRONTO_PARA_RETIRADA]  [RETIRADO_PELO_CLIENTE]
                    |
            (entregador pega)
                    |
                    v
                [EM_ROTA]
                    |
            (entregador confirma
             com código)
                    |
                    v
                [ENTREGUE]
```

### Fluxo: Painel de Gerenciamento de Pedidos (Admin/Cozinha)

```
[Tela: Painel de Pedidos]
    | Exibe: pedidos organizados por estado (colunas kanban ou tabs)
    |
    |--- [Coluna: Novos (REALIZADO)]
    |       | Card do pedido: número, itens, horário
    |       |--> (Botão: Confirmar) --> Estado: CONFIRMADO
    |       |--> (Botão: Cancelar) --> Modal confirmação --> Estado: CANCELADO
    |
    |--- [Coluna: Confirmados (CONFIRMADO)]
    |       |--> (Botão: Iniciar Preparo) --> Estado: EM_PREPARO
    |       |--> (Botão: Cancelar) --> Modal confirmação --> Estado: CANCELADO
    |
    |--- [Coluna: Em Preparo (EM_PREPARO)]
    |       |--> (Botão: Pronto!) --> Estado: PRONTO_PARA_RETIRADA
    |
    |--- [Coluna: Aguardando Entrega (PRONTO_PARA_RETIRADA)]
    |       | Aguardando entregador pegar o pedido
    |       |--> (Botão: Cliente Retirou) --> Estado: RETIRADO_PELO_CLIENTE
    |
    |--- [Coluna: Em Rota (EM_ROTA)]
            | Apenas visualização - entregador confirma entrega
```

---

## 7. Autenticação

### Fluxo: Login/Cadastro do Cliente

```
[Tela: Splash / Home]
    |
    |--> (Botão: Entrar)
            |
            v
[Tela: Login]
    | Campo: Email ou telefone
    | Campo: Senha
    |--> (Botão: Entrar) --> [Tela: Mapa / Home]
    |--> (Link: Criar conta)
    |       |
    |       v
    |   [Tela: Cadastro]
    |       | Campo: Nome
    |       | Campo: Email
    |       | Campo: Telefone
    |       | Campo: Senha
    |       |--> (Botão: Criar conta) --> [Tela: Mapa / Home]
    |
    |--> (Link: Esqueci minha senha)
            |
            v
        [Tela: Recuperar Senha]
            | Campo: Email
            |--> (Botão: Enviar link) --> email com link de reset
```

### Fluxo: Login do Admin/Entregador

```
[Tela: Login Admin]
    | Campo: Email
    | Campo: Senha
    |--> (Botão: Entrar)
            |
            |--> [Role: admin] --> [Dashboard Admin]
            |--> [Role: cozinha] --> [Painel de Pedidos] (filtrado)
            |--> [Role: entregador] --> [Painel do Entregador]
```

---

## Mapa de Telas (Resumo)

| Persona | Telas Principais |
|---|---|
| **Cliente** | Mapa/Home, Cardápio, Detalhe do Item, Resumo do Pedido, Pagamento, Confirmação, Acompanhamento, Chat |
| **Admin** | Dashboard, Cardápio (CRUD), Painel de Pedidos, Relatórios |
| **Cozinha** | Painel de Pedidos (filtrado: CONFIRMADO a PRONTO_PARA_RETIRADA) |
| **Entregador** | Painel de Entregas, Mapa de Navegação, Chat, Confirmação de Entrega |
