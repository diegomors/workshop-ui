// Dados mockados para visualização da interface sem banco de dados
// Remover quando os dados estiverem no Supabase

export const MOCK_RESTAURANT_ID = 'mock-restaurant-001'

export const MOCK_RESTAURANTS = [
  {
    id: MOCK_RESTAURANT_ID,
    name: 'Restaurante Sabor & Arte',
    description: 'O melhor da culinária artesanal',
  },
  {
    id: 'mock-restaurant-002',
    name: 'Pizzaria Bella Napoli',
    description: 'Pizzas artesanais com massa fermentada 48h',
  },
]

export const MOCK_MENU = {
  restaurant: { id: MOCK_RESTAURANT_ID, name: 'Restaurante Sabor & Arte' },
  categories: [
    {
      id: 'cat-lanches',
      name: 'Lanches',
      sort_order: 0,
      restaurant_id: MOCK_RESTAURANT_ID,
      created_at: new Date().toISOString(),
      menu_items: [
        {
          id: 'item-xburguer',
          category_id: 'cat-lanches',
          name: 'X-Burguer Clássico',
          description: 'Pão brioche, hambúrguer 180g, queijo cheddar, alface, tomate e molho especial',
          price: 28.90,
          image_url: null,
          is_active: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
          modifiers: [
            { id: 'mod-bacon', menu_item_id: 'item-xburguer', name: 'Bacon Extra', additional_price: 5.00, created_at: new Date().toISOString() },
            { id: 'mod-ovo', menu_item_id: 'item-xburguer', name: 'Ovo', additional_price: 3.00, created_at: new Date().toISOString() },
            { id: 'mod-semcebola', menu_item_id: 'item-xburguer', name: 'Sem Cebola', additional_price: 0.00, created_at: new Date().toISOString() },
          ]
        },
        {
          id: 'item-xsalada',
          category_id: 'cat-lanches',
          name: 'X-Salada',
          description: 'Pão integral, hambúrguer 150g, queijo branco, rúcula e tomate seco',
          price: 26.90,
          image_url: null,
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
          modifiers: [
            { id: 'mod-bacon2', menu_item_id: 'item-xsalada', name: 'Bacon Extra', additional_price: 5.00, created_at: new Date().toISOString() },
            { id: 'mod-queijo', menu_item_id: 'item-xsalada', name: 'Queijo Extra', additional_price: 4.00, created_at: new Date().toISOString() },
          ]
        },
        {
          id: 'item-frango',
          category_id: 'cat-lanches',
          name: 'Frango Empanado',
          description: 'Filé de frango crocante, maionese de ervas e salada',
          price: 24.50,
          image_url: null,
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
          modifiers: []
        },
        {
          id: 'item-veggie',
          category_id: 'cat-lanches',
          name: 'Veggie Burger',
          description: 'Hambúrguer de grão-de-bico, guacamole e rúcula',
          price: 27.90,
          image_url: null,
          is_active: true,
          sort_order: 3,
          created_at: new Date().toISOString(),
          modifiers: [
            { id: 'mod-queijoveg', menu_item_id: 'item-veggie', name: 'Queijo Vegano', additional_price: 4.00, created_at: new Date().toISOString() },
          ]
        },
      ]
    },
    {
      id: 'cat-bebidas',
      name: 'Bebidas',
      sort_order: 1,
      restaurant_id: MOCK_RESTAURANT_ID,
      created_at: new Date().toISOString(),
      menu_items: [
        {
          id: 'item-agua',
          category_id: 'cat-bebidas',
          name: 'Água Mineral 500ml',
          description: 'Sem gás',
          price: 5.00,
          image_url: null,
          is_active: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
          modifiers: [
            { id: 'mod-comgas', menu_item_id: 'item-agua', name: 'Com Gás', additional_price: 1.00, created_at: new Date().toISOString() },
          ]
        },
        {
          id: 'item-refri',
          category_id: 'cat-bebidas',
          name: 'Refrigerante Lata',
          description: 'Coca-Cola, Guaraná ou Sprite',
          price: 7.00,
          image_url: null,
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
          modifiers: []
        },
        {
          id: 'item-suco',
          category_id: 'cat-bebidas',
          name: 'Suco Natural',
          description: 'Laranja, limão, maracujá ou abacaxi',
          price: 12.00,
          image_url: null,
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
          modifiers: []
        },
        {
          id: 'item-cerveja',
          category_id: 'cat-bebidas',
          name: 'Cerveja Artesanal IPA',
          description: 'Lata 473ml — Brew Dog Punk IPA',
          price: 18.00,
          image_url: null,
          is_active: true,
          sort_order: 3,
          created_at: new Date().toISOString(),
          modifiers: []
        },
        {
          id: 'item-limonada',
          category_id: 'cat-bebidas',
          name: 'Limonada Suíça',
          description: 'Com leite condensado e hortelã',
          price: 14.00,
          image_url: null,
          is_active: true,
          sort_order: 4,
          created_at: new Date().toISOString(),
          modifiers: []
        },
      ],
    },
    {
      id: 'cat-porcoes',
      name: 'Porções',
      sort_order: 2,
      restaurant_id: MOCK_RESTAURANT_ID,
      created_at: new Date().toISOString(),
      menu_items: [
        {
          id: 'item-batata',
          category_id: 'cat-porcoes',
          name: 'Batata Frita',
          description: 'Porção generosa com cheddar e bacon',
          price: 22.00,
          image_url: null,
          is_active: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
          modifiers: []
        },
        {
          id: 'item-onion',
          category_id: 'cat-porcoes',
          name: 'Onion Rings',
          description: '12 anéis de cebola empanados crocantes',
          price: 19.00,
          image_url: null,
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
          modifiers: []
        },
        {
          id: 'item-nuggets',
          category_id: 'cat-porcoes',
          name: 'Nuggets de Frango',
          description: '10 unidades com molho barbecue',
          price: 18.00,
          image_url: null,
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
          modifiers: []
        },
        {
          id: 'item-mandioca',
          category_id: 'cat-porcoes',
          name: 'Mandioca Frita',
          description: 'Com molho de pimenta',
          price: 16.00,
          image_url: null,
          is_active: true,
          sort_order: 3,
          created_at: new Date().toISOString(),
          modifiers: []
        },
      ],
    },
    {
      id: 'cat-sobremesas',
      name: 'Sobremesas',
      sort_order: 3,
      restaurant_id: MOCK_RESTAURANT_ID,
      created_at: new Date().toISOString(),
      menu_items: [
        {
          id: 'item-brownie',
          category_id: 'cat-sobremesas',
          name: 'Brownie com Sorvete',
          description: 'Brownie quente de chocolate belga com sorvete de creme',
          price: 19.90,
          image_url: null,
          is_active: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
          modifiers: [
            { id: 'mod-caramelo', menu_item_id: 'item-brownie', name: 'Calda de Caramelo', additional_price: 3.00, created_at: new Date().toISOString() },
            { id: 'mod-chantilly', menu_item_id: 'item-brownie', name: 'Chantilly', additional_price: 2.00, created_at: new Date().toISOString() },
          ]
        },
        {
          id: 'item-petit',
          category_id: 'cat-sobremesas',
          name: 'Petit Gâteau',
          description: 'Bolo quente de chocolate com interior cremoso e sorvete',
          price: 24.00,
          image_url: null,
          is_active: true,
          sort_order: 1,
          created_at: new Date().toISOString(),
          modifiers: []
        },
        {
          id: 'item-acai',
          category_id: 'cat-sobremesas',
          name: 'Açaí 500ml',
          description: 'Com granola, banana e leite condensado',
          price: 22.00,
          image_url: null,
          is_active: true,
          sort_order: 2,
          created_at: new Date().toISOString(),
          modifiers: []
        },
      ],
    },
  ],
}

export const MOCK_CATEGORIES = MOCK_MENU.categories.map(({ menu_items: _items, ...cat }) => cat)
