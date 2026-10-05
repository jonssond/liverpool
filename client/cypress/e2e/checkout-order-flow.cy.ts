function generateValidCPF(): string {
  const rnd = Math.floor(100000000 + Math.random() * 900000000).toString();
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(rnd[i]!, 10) * (10 - i);
  let d1 = 11 - (s % 11);
  if (d1 >= 10) d1 = 0;
  const b10 = rnd + d1;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(b10[i]!, 10) * (11 - i);
  let d2 = 11 - (s % 11);
  if (d2 >= 10) d2 = 0;
  return `${rnd}${d1}${d2}`;
}

const mockCustomer = {
  id: 'c1',
  name: 'Diogo Jonsson',
  email: 'diogo@example.com',
  cpf: '123.456.789-00',
  gender: 'Masculino',
  birthdate: '1990-01-01',
  phone: '(11) 99999-9999',
  active: true,
  addresses: [
    {
      id: 'a1',
      type: 'entrega',
      tipoResidencia: 'Apartamento',
      tipoLogradouro: 'Rua',
      logradouro: 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cep: '01310-100',
      cidade: 'São Paulo',
      estado: 'SP',
      pais: 'Brasil'
    }
  ],
  cards: [
    {
      id: 'card1',
      number: '**** **** **** 4321',
      name: 'DIOGO JONSSON',
      brand: 'Visa',
      cvv: '123'
    },
    {
      id: 'card2',
      number: '**** **** **** 8765',
      name: 'DIOGO JONSSON',
      brand: 'Mastercard',
      cvv: '456'
    }
  ]
};

const mockCoupons = [
  { id: 'cp1', code: 'LIVERPOOL10', value: 10, type: 'promocional', active: true },
  { id: 'cp2', code: 'VINYL20', value: 20, type: 'promocional', active: true },
  { id: 'cp3', code: 'TROCA_DIOGO_50', value: 50.00, type: 'troca', active: true },
  { id: 'cp4', code: 'TROCA_DIOGO_40', value: 40.00, type: 'troca', active: true },
  { id: 'cp5', code: 'TROCA_DIOGO_35', value: 35.00, type: 'troca', active: true },
  { id: 'cp6', code: 'TROCA_DIOGO_20', value: 20.00, type: 'troca', active: true },
  { id: 'cp7', code: 'TROCA_DIOGO_300', value: 300.00, type: 'troca', active: true }
];

describe('E-Commerce Flow & Checkout (RF0031-RF0038, RN0023-RN0036)', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/customers', {
      statusCode: 200,
      body: [mockCustomer]
    }).as('getCustomers');

    cy.intercept('GET', '/api/orders', {
      statusCode: 200,
      body: []
    }).as('getOrders');

    cy.intercept('GET', '/api/orders/coupons*', {
      statusCode: 200,
      body: mockCoupons
    }).as('getCoupons');

    cy.intercept('POST', '/api/orders', (req) => {
      req.reply((res) => {
        res.send({
          statusCode: 200,
          body: {
            order: {
              id: `PED-${Date.now()}`,
              customerId: req.body.customerId,
              customerName: 'Diogo Jonsson',
              items: req.body.items,
              subtotal: req.body.subtotal,
              freight: req.body.freight,
              discount: req.body.discount,
              total: req.body.total,
              status: 'EM PROCESSAMENTO',
              paymentDetails: 'Pago com Cartão',
              createdAt: new Date().toLocaleString('pt-BR')
            },
            generatedExchangeCoupon: null
          }
        });
      });
    }).as('createOrder');

    cy.visit('/');
  });

  describe('Shopping Cart Operations', () => {
    it('should add multiple items and adjust quantities (RF0031, RF0032, RN0031)', () => {
      cy.get('[data-cy="btn-buy-v1"]').click();
      cy.url().should('include', '/checkout');
      cy.get('[data-cy="cart-title"]').should('contain.text', 'Seu Carrinho de Compras');
      cy.get('[data-cy="cart-item-v1"]').should('be.visible');
      cy.get('[data-cy="qty-val-v1"]').should('contain.text', '1');

      cy.get('[data-cy="btn-increase-v1"]').click();
      cy.get('[data-cy="qty-val-v1"]').should('contain.text', '2');

      cy.contains('Discos').click();
      cy.url().should('eq', `${Cypress.config().baseUrl}/`);

      cy.get('a[href="/item/v2"]').first().click();
      cy.url().should('include', '/item/v2');

      cy.get('[data-cy="btn-increase-qty"]').click();
      cy.get('[data-cy="input-qty-value"]').should('contain.text', '2');
      cy.get('[data-cy="btn-add-to-cart"]').click();

      cy.url().should('include', '/checkout');
      cy.get('[data-cy="cart-item-v1"]').should('be.visible');
      cy.get('[data-cy="cart-item-v2"]').should('be.visible');
      cy.get('[data-cy="qty-val-v2"]').should('contain.text', '2');

      cy.get('[data-cy="btn-decrease-v2"]').click();
      cy.get('[data-cy="qty-val-v2"]').should('contain.text', '1');
    });
  });

  describe('Checkout with Saved Address & Card', () => {
    it('should complete purchase with existing address and card (RF0033, RF0035, RF0036, RF0038)', () => {
      cy.get('[data-cy="btn-buy-v3"]').click();
      cy.url().should('include', '/checkout');

      cy.get('[data-cy^="radio-addr-"]').first().check();
      cy.get('[data-cy^="chk-card-"]').first().check();
      cy.get('[data-cy="btn-finish-checkout"]').should('not.be.disabled').click();

      cy.wait('@createOrder', { timeout: 10000 });
      cy.url().should('include', '/my-orders');
      cy.get('[data-cy="orders-tbody"] tr').first().within(() => {
        cy.get('[data-cy="order-status"]').should('contain.text', 'EM PROCESSAMENTO');
      });
    });
  });

  describe('Checkout with New Address & Card', () => {
    it('should complete purchase with new address and card (RN0023, RN0024, RN0025, RF0035, RF0036)', () => {
      cy.get('[data-cy="btn-buy-v4"]').click();
      cy.url().should('include', '/checkout');

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

      cy.get('[data-cy="btn-toggle-new-card"]').click();
      cy.get('[data-cy="form-new-card"]').should('be.visible');

      cy.get('[data-cy="input-new-card-number"]').type('4111111111111111');
      cy.get('[data-cy="input-new-card-name"]').type('DIOGO JONSSON');
      cy.get('[data-cy="select-new-card-brand"]').select('Visa');
      cy.get('[data-cy="input-new-card-cvv"]').type('999');
      cy.get('[data-cy="chk-save-card-profile"]').should('be.checked');

      cy.get('[data-cy="btn-save-new-card"]').click();
      cy.get('[data-cy="btn-finish-checkout"]').should('not.be.disabled').click();

      cy.wait('@createOrder', { timeout: 10000 });
      cy.url().should('include', '/my-orders');
      cy.get('[data-cy="orders-tbody"] tr').first().within(() => {
        cy.get('[data-cy="order-status"]').should('contain.text', 'EM PROCESSAMENTO');
      });
    });
  });

  describe('Multi-Card Payment', () => {
    it('should enforce minimum card amount validation (RN0034)', () => {
      cy.get('[data-cy="btn-buy-v1"]').click();
      cy.url().should('include', '/checkout');

      cy.get('[data-cy^="radio-addr-"]').first().check();

      cy.scrollTo('bottom');
      cy.get('[data-cy^="chk-card-"]').first().check();
      cy.get('[data-cy^="chk-card-"]').eq(1).check();

      cy.get('[data-cy="input-card-amount-card1"]').clear().type('5.00');
      cy.get('[data-cy="input-card-amount-card2"]').clear().type('259.90');

      const alertStub = cy.stub();
      cy.on('window:alert', alertStub);

      cy.get('[data-cy="btn-finish-checkout"]').click().then(() => {
        expect(alertStub).to.be.calledWithMatch(/RN0034.*R\$ 10,00/);
      });

      cy.get('[data-cy="input-card-amount-card1"]').clear().type('100.00');
      cy.get('[data-cy="input-card-amount-card2"]').clear().type('164.90');

      cy.get('[data-cy="payment-status-ok"]').should('be.visible');
      cy.get('[data-cy="btn-finish-checkout"]').click();

      cy.wait('@createOrder', { timeout: 10000 });
      cy.url().should('include', '/my-orders');
      cy.get('[data-cy="orders-tbody"] tr').first().within(() => {
        cy.get('[data-cy="order-status"]').should('contain.text', 'EM PROCESSAMENTO');
      });
    });
  });

  describe('Coupon Handling', () => {
    it('should allow sub-minimum card payment with coupons (RN0035)', () => {
      cy.get('[data-cy="btn-buy-v6"]').click();
      cy.url().should('include', '/checkout');

      cy.get('[data-cy^="radio-addr-"]').first().check();

      cy.get('[data-cy="chk-coupon-TROCA_DIOGO_50"]').check();
      cy.get('[data-cy="chk-coupon-TROCA_DIOGO_40"]').check();
      cy.get('[data-cy="chk-coupon-TROCA_DIOGO_35"]').check();
      cy.get('[data-cy="chk-coupon-TROCA_DIOGO_20"]').check();
      cy.get('[data-cy="chk-coupon-VINYL20"]').check();

      cy.scrollTo('bottom');
      cy.get('[data-cy^="chk-card-"]').first().check();
      cy.get('[data-cy^="chk-card-"]').eq(1).check();

      cy.get('[data-cy="input-card-amount-card1"]').clear().type('25.00');
      cy.get('[data-cy="input-card-amount-card2"]').clear().type('4.90');

      cy.get('[data-cy="payment-status-ok"]').should('be.visible');
      cy.get('[data-cy="btn-finish-checkout"]').click();

      cy.wait('@createOrder', { timeout: 10000 });
      cy.url().should('include', '/my-orders');
      cy.get('[data-cy="orders-tbody"] tr').first().within(() => {
        cy.get('[data-cy="order-status"]').should('contain.text', 'EM PROCESSAMENTO');
      });
    });

    it('should generate exchange coupon when exceeding purchase value (RN0036)', () => {
      cy.get('[data-cy="btn-buy-v5"]').click();
      cy.url().should('include', '/checkout');

      cy.get('[data-cy^="radio-addr-"]').first().check();

      cy.get('[data-cy="chk-coupon-TROCA_DIOGO_300"]').check();

      cy.get('[data-cy="surplus-coupon-notice"]').should('be.visible');
      cy.get('[data-cy="remaining-to-pay"]').should('contain.text', 'R$ 0.00');

      cy.scrollTo('bottom');
      cy.get('[data-cy="chk-coupon-VINYL20"]').check();
      cy.get('[data-cy="coupon-error-banner"]', { timeout: 10000 }).should('be.visible').and('contain.text', 'RN0036');
      cy.get('[data-cy="btn-finish-checkout"]').should('be.disabled');

      cy.get('[data-cy="chk-coupon-VINYL20"]').uncheck();
      cy.get('[data-cy="coupon-error-banner"]').should('not.exist');

      cy.get('[data-cy="btn-finish-checkout"]').should('not.be.disabled').click();

      cy.wait('@createOrder', { timeout: 10000 });
      cy.url().should('include', '/my-orders');
      cy.get('[data-cy="orders-tbody"] tr').first().within(() => {
        cy.get('[data-cy="order-status"]').should('contain.text', 'EM PROCESSAMENTO');
      });
    });
  });

  describe('Admin Dashboard', () => {
    it('should display order with correct status in admin panel (RF0038)', () => {
      cy.visit('/admin');
      cy.get('h3').should('contain.text', 'Painel de Gerenciamento de Pedidos');
      cy.get('tbody tr').first().within(() => {
        cy.get('[data-cy="dashboard-order-status"]').should('contain.text', 'EM PROCESSAMENTO');
      });
    });
  });
});
