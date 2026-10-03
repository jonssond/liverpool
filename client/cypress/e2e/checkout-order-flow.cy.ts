describe('E-Commerce Flow & Checkout (RF0031-RF0038, RN0023-RN0036)', () => {
  beforeEach(() => {
    // Intercept backend calls
    cy.intercept('GET', '/api/customers').as('getCustomers');
    cy.intercept('GET', '/api/orders').as('getOrders');
    cy.intercept('GET', '/api/orders/coupons*').as('getCoupons');
    cy.intercept('POST', '/api/orders').as('createOrder');

    cy.visit('/');
  });

  it('1. Inclusão de mais de um livro no carrinho e alteração da quantidade de itens (RF0031, RF0032, RN0031)', () => {
    // Adiciona o primeiro vinil a partir do catálogo
    cy.get('[data-cy="btn-buy-v1"]').click();
    cy.url().should('include', '/checkout');

    cy.get('[data-cy="cart-title"]').should('contain.text', 'Seu Carrinho de Compras');
    cy.get('[data-cy="cart-item-v1"]').should('be.visible');
    cy.get('[data-cy="qty-val-v1"]').should('contain.text', '1');

    // Aumenta quantidade no carrinho
    cy.get('[data-cy="btn-increase-v1"]').click();
    cy.get('[data-cy="qty-val-v1"]').should('contain.text', '2');

    // Volta ao catálogo e entra na página de detalhes de outro disco
    cy.contains('Discos').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);

    cy.get('a[href="/item/v2"]').first().click();
    cy.url().should('include', '/item/v2');

    // Na página de detalhes, ajusta a quantidade inicial antes de adicionar (RF0032)
    cy.get('[data-cy="btn-increase-qty"]').click();
    cy.get('[data-cy="input-qty-value"]').should('contain.text', '2');
    cy.get('[data-cy="btn-add-to-cart"]').click();

    // Deve estar no checkout com 2 produtos diferentes e quantidades corretas
    cy.url().should('include', '/checkout');
    cy.get('[data-cy="cart-item-v1"]').should('be.visible');
    cy.get('[data-cy="cart-item-v2"]').should('be.visible');
    cy.get('[data-cy="qty-val-v2"]').should('contain.text', '2');

    // Altera novamente a quantidade do segundo item no carrinho
    cy.get('[data-cy="btn-decrease-v2"]').click();
    cy.get('[data-cy="qty-val-v2"]').should('contain.text', '1');
  });

  it('2. Compra com endereço e cartão previamente cadastrados (RF0033, RF0035, RF0036, RF0038)', () => {
    cy.get('[data-cy="btn-buy-v3"]').click();
    cy.url().should('include', '/checkout');

    // Seleciona o endereço existente
    cy.get('[data-cy^="radio-addr-"]').first().check();

    // Seleciona o cartão existente e preenche o valor total
    cy.get('[data-cy^="chk-card-"]').first().check();

    // Finaliza compra
    cy.get('[data-cy="btn-finish-checkout"]').should('not.be.disabled').click();

    // Redirecionado para meus pedidos com status EM PROCESSAMENTO
    cy.url().should('include', '/my-orders');
    cy.get('[data-cy="orders-tbody"] tr').first().within(() => {
      cy.get('[data-cy="order-status"]').should('contain.text', 'Em Processamento');
    });
  });

  it('3. Compra com novo endereço e novo cartão cadastrados e incorporados ao perfil (RN0023, RN0024, RN0025, RF0035, RF0036)', () => {
    cy.get('[data-cy="btn-buy-v4"]').click();
    cy.url().should('include', '/checkout');

    // 1. Cadastra novo endereço com incorporação
    cy.get('[data-cy="btn-toggle-new-address"]').click();
    cy.get('[data-cy="form-new-address"]').should('be.visible');

    cy.get('[data-cy="input-new-addr-residence"]').type('Casa de Campo');
    cy.get('[data-cy="input-new-addr-street-type"]').clear().type('Avenida');
    cy.get('[data-cy="input-new-addr-street"]').type('Avenida dos Vinis');
    cy.get('[data-cy="input-new-addr-number"]').type('789');
    cy.get('[data-cy="input-new-addr-cep"]').type('13010000');
    cy.get('[data-cy="input-new-addr-bairro"]').clear().type('Jardim Harmonia');
    cy.get('[data-cy="input-new-addr-city"]').type('Campinas');
    cy.get('[data-cy="input-new-addr-state"]').clear().type('SP');

    cy.get('[data-cy="chk-save-addr-profile"]').should('be.checked');

    // 2. Cadastra novo cartão de crédito com incorporação
    cy.get('[data-cy="btn-toggle-new-card"]').click();
    cy.get('[data-cy="form-new-card"]').should('be.visible');

    cy.get('[data-cy="input-new-card-number"]').type('4111111111111111');
    cy.get('[data-cy="input-new-card-name"]').type('DIOGO JONSSON');
    cy.get('[data-cy="select-new-card-brand"]').select('Visa');
    cy.get('[data-cy="input-new-card-cvv"]').type('999');
    cy.get('[data-cy="chk-save-card-profile"]').should('be.checked');

    cy.get('[data-cy="btn-save-new-card"]').click();

    // 3. Finaliza a compra
    cy.get('[data-cy="btn-finish-checkout"]').should('not.be.disabled').click();

    cy.url().should('include', '/my-orders');
    cy.get('[data-cy="orders-tbody"] tr').first().within(() => {
      cy.get('[data-cy="order-status"]').should('contain.text', 'Em Processamento');
    });
  });

  it('4. Pagamento com mais de um cartão de crédito respeitando valor mínimo de R$ 10,00 (RN0034)', () => {
    cy.get('[data-cy="btn-buy-v1"]').click(); // R$ 249.90 + frete R$ 15.00 = R$ 264.90
    cy.url().should('include', '/checkout');

    cy.get('[data-cy^="radio-addr-"]').first().check();

    // Seleciona card1 e card2
    cy.get('[data-cy="chk-card-card1"]').check();
    cy.get('[data-cy="chk-card-card2"]').check();

    // Testa validação: valor inferior a R$ 10,00 sem cupons
    cy.get('[data-cy="input-card-amount-card1"]').clear().type('5.00');
    cy.get('[data-cy="input-card-amount-card2"]').clear().type('259.90');

    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    cy.get('[data-cy="btn-finish-checkout"]').click().then(() => {
      expect(alertStub).to.be.calledWithMatch(/RN0034.*R\$ 10,00/);
    });

    // Agora preenche valores válidos (>= R$ 10,00 em cada)
    cy.get('[data-cy="input-card-amount-card1"]').clear().type('100.00');
    cy.get('[data-cy="input-card-amount-card2"]').clear().type('164.90');

    cy.get('[data-cy="payment-status-ok"]').should('be.visible');
    cy.get('[data-cy="btn-finish-checkout"]').click();

    cy.url().should('include', '/my-orders');
    cy.get('[data-cy="orders-tbody"] tr').first().within(() => {
      cy.get('[data-cy="order-status"]').should('contain.text', 'Em Processamento');
    });
  });

  it('5. Pagamento com cartão de crédito e cupons, com valor menor que R$ 10,00 no cartão (RN0035)', () => {
    // Exemplo do DRS: Compra onde cupons cobrem quase tudo e resta valor < R$ 10,00 para o cartão
    // Vamos comprar v6 (R$ 179.90 + 15 frete = R$ 194.90) e aplicar cupom de troca de R$ 190.00 ou cupom promocional + troca
    cy.get('[data-cy="btn-buy-v6"]').click(); // R$ 179.90 + 15 = R$ 194.90
    cy.url().should('include', '/checkout');

    cy.get('[data-cy^="radio-addr-"]').first().check();

    // Aplica cupom de troca de R$ 50 + R$ 40 + R$ 35 + R$ 20 + VINYL20 + LIVERPOOL10...
    // Com RN0035, cupom cobre parte e no cartão paga menos de 10 reais, ex: R$ 4.90
    cy.get('[data-cy="chk-coupon-TROCA_DIOGO_50"]').check();
    cy.get('[data-cy="chk-coupon-TROCA_DIOGO_40"]').check();
    cy.get('[data-cy="chk-coupon-TROCA_DIOGO_35"]').check();
    cy.get('[data-cy="chk-coupon-TROCA_DIOGO_20"]').check();
    cy.get('[data-cy="chk-coupon-VINYL20"]').check();
    // Total em cupons: 50+40+35+20+20 = 165. Restante = 194.90 - 165 = 29.90.
    // Vamos usar card1 com R$ 25.00 e card2 com R$ 4.90 (< R$ 10,00 permitido pois está combinado com cupons!)
    cy.get('[data-cy="chk-card-card1"]').check();
    cy.get('[data-cy="chk-card-card2"]').check();

    cy.get('[data-cy="input-card-amount-card1"]').clear().type('25.00');
    cy.get('[data-cy="input-card-amount-card2"]').clear().type('4.90');

    cy.get('[data-cy="payment-status-ok"]').should('be.visible');

    // Não deve lançar erro de R$ 10,00
    cy.get('[data-cy="btn-finish-checkout"]').click();

    cy.url().should('include', '/my-orders');
    cy.get('[data-cy="orders-tbody"] tr').first().within(() => {
      cy.get('[data-cy="order-status"]').should('contain.text', 'Em Processamento');
    });
  });

  it('6. Uso de cupons cujo valor supere o da compra, com emissão de cupom de troca para a diferença (RN0036)', () => {
    // Compra v5: R$ 189.90 + frete R$ 15.00 = R$ 204.90
    cy.get('[data-cy="btn-buy-v5"]').click();
    cy.url().should('include', '/checkout');

    cy.get('[data-cy^="radio-addr-"]').first().check();

    // Seleciona cupom de troca de R$ 300,00 (TROCA_DIOGO_300)
    cy.get('[data-cy="chk-coupon-TROCA_DIOGO_300"]').check();

    // Verifica aviso de geração de cupom de troca com a diferença
    cy.get('[data-cy="surplus-coupon-notice"]').should('be.visible');
    cy.get('[data-cy="remaining-to-pay"]').should('contain.text', 'R$ 0.00');

    // Tentar adicionar outro cupom desnecessário deve ser bloqueado pela regra RN0036
    cy.get('[data-cy="chk-coupon-VINYL20"]').check();
    cy.get('[data-cy="coupon-error-banner"]').should('be.visible').and('contain.text', 'RN0036');
    cy.get('[data-cy="btn-finish-checkout"]').should('be.disabled');

    // Desmarca o cupom desnecessário
    cy.get('[data-cy="chk-coupon-VINYL20"]').uncheck();
    cy.get('[data-cy="coupon-error-banner"]').should('not.exist');

    // Finaliza compra superada por cupom
    cy.get('[data-cy="btn-finish-checkout"]').should('not.be.disabled').click();

    // Pedido criado e registrado com status EM PROCESSAMENTO
    cy.url().should('include', '/my-orders');
    cy.get('[data-cy="orders-tbody"] tr').first().within(() => {
      cy.get('[data-cy="order-status"]').should('contain.text', 'Em Processamento');
    });
  });

  it('7. O pedido finalizado é registrado com status EM PROCESSAMENTO no Admin (RF0038)', () => {
    cy.visit('/admin');
    cy.get('h3').should('contain.text', 'Painel de Gerenciamento de Pedidos');
    cy.get('tbody tr').first().within(() => {
      cy.get('td').contains('EM PROCESSAMENTO').should('be.visible');
    });
  });
});
