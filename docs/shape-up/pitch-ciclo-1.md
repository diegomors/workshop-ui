# Mizz: Pitch para o Primeiro Ciclo (Shape Up)

**Autor:** Manus AI
**Data:** 21 de Março de 2026
**Versão:** 8.5 (Relatórios e Cardápio)

---

## 1. Problema

Em ambientes de alto fluxo como praias e eventos, a experiência de consumo é quebrada por duas dores principais:

1. **Atrito no Pedido:** O cliente precisa se deslocar longas distâncias, esperar por um garçom sobrecarregado, ou gritar para ser ouvido, resultando em um processo lento, inconveniente e propenso a erros de anotação.

2. **Caos na Entrega:** O ambiente físico é grande, lotado e sem endereços, tornando a pergunta "Onde entregar?" um desafio logístico que causa demora e frustração tanto para o cliente quanto para o entregador.

## 2. Apetite

**Um ciclo de 6 semanas.**

> **Contexto de Desenvolvimento:** Este ciclo será executado com **desenvolvimento assistido por IA**. A integração de um SDK de localização (HyperTrack/Radar) e de um gateway de pagamento (Pagar.me/Stripe) é complexa, mas a assistência da IA nos permite acomodar essa complexidade dentro do apetite de 6 semanas.

## 3. Solução

Um sistema que permite ao cliente fazer um pedido e ser encontrado em um ambiente caótico. A solução é construída sobre uma base de **acessibilidade, usabilidade e internacionalização**, com uma identidade visual **minimalista e amigável** (Laranja/Preto/Branco).

### Elementos Funcionais (Breadboarding)

#### 1. Cardápio Digital

- **Fluxo:** O administrador do restaurante pode criar, editar e organizar seu cardápio através de uma interface web simples. O cardápio suporta itens, categorias, preços, fotos e modificadores (ex: "Sem Cebola", "Bacon Extra"). Para o MVP, o cadastro inicial pode ser feito pela equipe do Mizz como um serviço de onboarding.

#### 2. Relatórios para o Administrador

- **Fluxo:** O administrador terá acesso a uma tela de dashboard com dois relatórios principais, ambos não-interativos e mostrando dados dos últimos 7 dias.

- **Relatório 1: Tempo Médio de Preparo:** Mede o tempo entre o pedido ser `CONFIRMADO` e ficar `PRONTO_PARA_RETIRADA`, agrupado por item do cardápio. Ajuda a identificar gargalos na cozinha.

- **Relatório 2: Desempenho da Equipe:** Mede o número de entregas e o tempo médio de entrega (entre `PRONTO_PARA_RETIRADA` e `ENTREGUE`) por entregador. Ajuda a identificar os entregadores mais eficientes.

#### 3. Pagamento e Monetização

- **Fluxo:** O cliente paga pelo pedido no momento da compra, via cartão de crédito ou Pix. O valor total cobrado do cliente será o valor do pedido + uma **taxa de serviço de 10%**. O pagamento deve ser confirmado antes que o pedido seja enviado ao restaurante.

- **Tecnologia:** A integração será feita com um gateway de pagamento que suporte **split de pagamento** (ex: Pagar.me, Stripe Connect). O sistema fará o split automaticamente: 90% do valor do pedido para o restaurante, e os 10% restantes + valor do pedido para a conta do Mizz. A taxa do Mizz cobre os custos do gateway e gera o lucro da plataforma.

- **Cancelamento:** Pedidos cancelados antes do preparo terão o valor total (pedido + taxa) estornado automaticamente para o cliente via API do gateway.

#### 4. Mapa Interativo como Elemento Central

- **Fluxo:** A experiência do cliente e do entregador é centrada em um mapa. O cliente vê os restaurantes dentro da sua área, e o entregador vê a localização do cliente para a entrega.

- **Tecnologia:** A visualização será feita com **Leaflet + OpenStreetMap** para evitar custos de API do Google Maps.

#### 5. Rastreamento e Encontro

- **Fluxo:** Após o pedido entrar em `EM_ROTA`, o cliente pode ver a localização do entregador no mapa em tempo real. Para facilitar o encontro final, o sistema terá um **chat de texto simples** entre cliente e entregador para troca de referências ("Estou de camiseta vermelha perto do palco principal").

- **Tecnologia:** A infraestrutura de rastreamento será implementada com um **SDK de mercado (HyperTrack ou Radar.io)**.

#### 6. Máquina de Estados e Notificações

- **Fluxo:** O ciclo de vida do pedido é gerenciado por uma máquina de estados explícita. Cada transição de estado dispara uma notificação para o cliente, garantindo visibilidade total do processo.

| Estado | Quem Dispara | Notificação ao Cliente |
|---|---|---|
| `REALIZADO` | Cliente (ao pagar) | "Pedido enviado! Aguardando confirmação." |
| `CONFIRMADO` | Admin do restaurante | "Pedido confirmado! Em breve começa o preparo." |
| `CANCELADO` | Admin do restaurante | "Pedido cancelado. Estorno realizado automaticamente." |
| `EM_PREPARO` | Cozinha | "Seu pedido está sendo preparado!" |
| `PRONTO_PARA_RETIRADA` | Cozinha | "Pedido pronto! Entregador a caminho." |
| `EM_ROTA` | Entregador | "Seu pedido saiu para entrega!" |
| `RETIRADO_PELO_CLIENTE` | Admin | "Pedido retirado. Bom apetite!" |
| `ENTREGUE` | Entregador (com código) | "Pedido entregue! Esperamos que goste." |

#### 7. Demais Funcionalidades

- (Conforme definido na v8.1) Autenticação, múltiplos pedidos, avaliação, configurações de loja, etc.

## 4. Rabbit Holes (Possíveis Armadilhas)

- **Relatórios Customizáveis**
  - **Risco:** Tentar construir um sistema de relatórios com filtros de data, exportação e gráficos interativos pode consumir o ciclo inteiro.
  - **A Linha no Chão:** Os relatórios serão **não-interativos** e exibirão dados apenas dos **últimos 7 dias**. A interface será uma visualização simples de dados, sem customização pelo usuário.

- **Construir Infraestrutura de Pagamento**
  - **Risco:** Tentar construir um sistema de split de pagamento, estorno e conciliação do zero é um projeto de meses e com altíssimo risco regulatório.
  - **A Linha no Chão: NÃO construiremos nossa própria lógica de pagamento.** A solução **DEVE** usar um gateway de mercado que ofereça split de pagamento e estorno via API (Pagar.me, Stripe Connect).

- **Construir Infraestrutura de Rastreamento**
  - **Risco:** Tentar construir um sistema de rastreamento GPS do zero é um projeto de meses.
  - **A Linha no Chão: NÃO construiremos nosso próprio sistema de rastreamento.** A solução **DEVE** usar um SDK de mercado como HyperTrack ou Radar.io. O trabalho do ciclo é de **integração**, não de construção de infraestrutura.

- **Precisão do GPS**
  - **Risco:** Gastar semanas tentando obter precisão de centímetros do GPS em uma multidão.
  - **A Linha no Chão:** O GPS nos dará uma proximidade de 5-10 metros. O **chat de texto** é a camada de segurança para resolver o "último metro". **NÃO** buscaremos soluções de hardware ou algoritmos complexos para aumentar a precisão do GPS.

## 5. No-Gos (O Que NÃO Faremos)

- **NENHUM** controle de estoque.
- **NENHUMA** otimização de rotas para entregadores (o entregador decide o melhor caminho).
- **NENHUM** aplicativo nativo (100% web responsiva).
- **NENHUM** estorno parcial.
- **NENHUM** relatório customizável ou com filtros complexos (além dos dois definidos na solução).
- **NENHUM** botão "sinalizador" piscante na v1 (o chat é mais simples e eficaz).

---

## Regra de Cancelamento

A janela de cancelamento é definida pela máquina de estados. O cancelamento (pelo cliente ou pelo restaurante) só é permitido nos estados `REALIZADO` e `CONFIRMADO`. Uma vez que o pedido entra em `EM_PREPARO`, ele não pode mais ser cancelado e o estorno não é mais possível. O cliente deve concordar com esta regra via um checkbox no checkout antes de finalizar o pagamento.
