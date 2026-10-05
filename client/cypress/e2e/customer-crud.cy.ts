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

const testRunTimestamp = Date.now();
const testCustomerName = 'Albert Einstein';
const testCustomerEmail = `albert.${testRunTimestamp}@example.com`;
const testCustomerCpf = generateValidCPF();

let createdCustomers: any[] = [];

describe('Customer CRUD - Painel de Clientes', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/customers', (req) => {
      req.reply((res) => {
        res.send({
          statusCode: 200,
          body: createdCustomers
        });
      });
    }).as('getCustomers');

    cy.intercept('POST', '/api/customers', (req) => {
      req.reply((res) => {
        const newCustomer = {
          ...req.body,
          id: `c-${Date.now()}`,
          active: true,
          addresses: req.body.addresses || [],
          cards: req.body.cards || []
        };
        createdCustomers.push(newCustomer);
        res.send({
          statusCode: 200,
          body: newCustomer
        });
      });
    }).as('createCustomer');

    cy.intercept('PUT', '/api/customers/*', (req) => {
      const customerId = req.url.split('/').pop();
      req.reply((res) => {
        const existingCustomer = createdCustomers.find(c => c.id === customerId);
        const updatedCustomer = {
          ...existingCustomer,
          ...req.body,
          id: customerId,
          active: existingCustomer?.active !== false
        };
        const idx = createdCustomers.findIndex(c => c.id === customerId);
        if (idx >= 0) {
          createdCustomers[idx] = updatedCustomer;
        }
        res.send({
          statusCode: 200,
          body: updatedCustomer
        });
      });
    }).as('updateCustomer');

    cy.intercept('PATCH', '/api/customers/*/status', (req) => {
      const customerId = req.url.split('/').slice(-2)[0];
      req.reply((res) => {
        const statusData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const existingCustomer = createdCustomers.find(c => c.id === customerId);
        const updatedCustomer = {
          ...existingCustomer,
          ...statusData,
          id: customerId
        };
        const idx = createdCustomers.findIndex(c => c.id === customerId);
        if (idx >= 0) {
          createdCustomers[idx] = updatedCustomer;
        }
        res.send({
          statusCode: 200,
          body: updatedCustomer
        });
      });
    }).as('updateCustomerStatus');

    cy.visit('/admin/customers');
  });

  describe('Table Display', () => {
    it('should display correct table headers and structure', () => {
      cy.get('[data-cy="page-title"]').should('contain.text', 'Painel de Clientes');
      cy.get('[data-cy="customers-table"]').should('be.visible');

      cy.get('[data-cy="customers-table"] thead th').should('have.length', 6);
      cy.get('[data-cy="customers-table"] thead').contains('Nome');
      cy.get('[data-cy="customers-table"] thead').contains('CPF');
      cy.get('[data-cy="customers-table"] thead').contains('E-mail');
      cy.get('[data-cy="customers-table"] thead').contains('Telefone');
      cy.get('[data-cy="customers-table"] thead').contains('Status');
      cy.get('[data-cy="customers-table"] thead').contains('Ações');
    });
  });

  describe('Input Masking', () => {
    it('should apply masks to CPF, phone, CEP, and card number in real-time', () => {
      cy.get('[data-cy="btn-new-customer"]').click();
      cy.get('[data-cy="input-cpf"]').should('be.visible');

      cy.get('[data-cy="input-cpf"]').type('12345678900');
      cy.get('[data-cy="input-cpf"]').should('have.value', '123.456.789-00');

      cy.get('[data-cy="input-phone"]').type('11987654321');
      cy.get('[data-cy="input-phone"]').should('have.value', '(11) 98765-4321');

      cy.get('[data-cy="input-deliv-cep"]').type('01310100');
      cy.get('[data-cy="input-deliv-cep"]').should('have.value', '01310-100');

      cy.get('[data-cy="input-card-number"]').type('4111111111111111');
      cy.get('[data-cy="input-card-number"]').should('have.value', '4111 1111 1111 1111');

      cy.get('[data-cy="select-card-brand"]').should('have.value', 'Visa');
    });
  });

  describe('Input Validation', () => {
    it('should validate CPF, phone, and card number formats', () => {
      cy.get('[data-cy="btn-new-customer"]').click();
      cy.get('[data-cy="input-cpf"]').should('be.visible');

      cy.get('[data-cy="input-cpf"]').type('11111111111').blur();
      cy.get('[data-cy="input-cpf-error"]').should('be.visible').and('contain.text', 'CPF inválido');

      cy.get('[data-cy="input-phone"]').type('119999').blur();
      cy.get('[data-cy="input-phone-error"]').should('be.visible');

      cy.get('[data-cy="input-card-number"]').type('4111111111111112').blur();
      cy.get('[data-cy="input-card-number-error"]').should('be.visible').and('contain.text', 'Luhn');

      cy.get('[data-cy="input-password"]').type('123');
      cy.get('[data-cy="input-confirm-password"]').type('456');
      cy.get('[data-cy="btn-submit-customer"]').click();

      cy.get('[data-cy="input-password-error"]').should('exist');
      cy.get('[data-cy="input-confirm-password-error"]').should('exist').and('contain.text', 'não coincidem');
    });
  });

  describe('Customer Creation', () => {
    it('should create new customer and show success modal', () => {
      const alertSpy = cy.spy();
      cy.on('window:alert', alertSpy);

      cy.get('[data-cy="btn-new-customer"]').click();
      cy.get('[data-cy="input-name"]').should('be.visible');

      cy.get('[data-cy="input-name"]').type(testCustomerName);
      cy.get('[data-cy="input-email"]').type(testCustomerEmail);
      cy.get('[data-cy="input-cpf"]').type(testCustomerCpf);
      cy.get('[data-cy="select-gender"]').select('Feminino');
      cy.get('[data-cy="input-birthdate"]').type('1994-06-20');
      cy.get('[data-cy="input-phone"]').type('11987654321');
      cy.get('[data-cy="input-password"]').type('Liverpool#2026');
      cy.get('[data-cy="input-confirm-password"]').type('Liverpool#2026');

      cy.get('[data-cy="input-deliv-street"]').type('Rua das Flores');
      cy.get('[data-cy="input-deliv-num"]').type('123');
      cy.get('[data-cy="input-deliv-cep"]').type('01310100');
      cy.get('[data-cy="input-deliv-city"]').type('São Paulo');

      cy.get('[data-cy="input-bill-street"]').type('Avenida Brasil');
      cy.get('[data-cy="input-bill-num"]').type('456');
      cy.get('[data-cy="input-bill-cep"]').type('01305000');
      cy.get('[data-cy="input-bill-city"]').type('São Paulo');

      cy.get('[data-cy="input-card-number"]').type('4111111111111111');
      cy.get('[data-cy="input-card-name"]').type('ALBERT EINSTEIN');
      cy.get('[data-cy="input-card-cvv"]').clear().type('321');

      cy.get('[data-cy="btn-submit-customer"]').click();

      cy.wait('@createCustomer');
      cy.get('[data-cy="success-modal"]').should('be.visible');
      cy.get('[data-cy="success-modal-title"]').should('contain.text', 'Cadastro Concluído');
      cy.get('[data-cy="success-modal-message"]').should('contain.text', `${testCustomerName} cadastrado com sucesso`);

      expect(alertSpy).to.not.be.called;

      cy.get('[data-cy="success-modal-close-btn"]').click();
      cy.get('[data-cy="success-modal"]').should('not.exist');

      cy.get('[data-cy="customers-tbody"]').contains(testCustomerName).should('be.visible');
    });
  });

  describe('Customer Update', () => {
    it('should update customer data and show success modal', () => {
      cy.get('[data-cy="customers-tbody"]').contains(testCustomerName).parents('tr').within(() => {
        cy.contains('Alterar').click();
      });

      cy.get('[data-cy="edit-input-name"]').should('be.visible');

      cy.get('[data-cy="edit-input-name"]').clear().type(`${testCustomerName} Atualizado`);
      cy.get('[data-cy="edit-input-deliv-street"]').clear().type('Rua das Flores Renovada');

      cy.get('[data-cy="btn-save-edit-customer"]').click();

      cy.wait('@updateCustomer');
      cy.get('[data-cy="success-modal"]').should('be.visible');
      cy.get('[data-cy="success-modal-title"]').should('contain.text', 'Cliente Atualizado');
      cy.get('[data-cy="success-modal-close-btn"]').click();
      cy.get('[data-cy="success-modal"]').should('not.exist');

      cy.get('[data-cy="customers-tbody"]').contains(`${testCustomerName} Atualizado`).should('be.visible');
    });
  });

  describe('Customer Deactivation', () => {
    it('should deactivate customer with required justification', () => {
      cy.get('[data-cy="customers-tbody"]').contains(`${testCustomerName} Atualizado`).parents('tr').within(() => {
        cy.contains('Inativar').click();
      });

      cy.get('[data-cy="deactivate-modal-content"]').should('be.visible');

      cy.get('[data-cy="btn-confirm-deactivate"]').click();
      cy.get('[data-cy="deactivate-error"]').should('be.visible').and('contain.text', 'justificativa');

      cy.get('[data-cy="textarea-deactivate-reason"]').type('Solicitação expressa do cliente por encerramento de conta');
      cy.get('[data-cy="btn-confirm-deactivate"]').click();

      cy.wait('@updateCustomerStatus');
      cy.get('[data-cy="success-modal"]').should('be.visible');
      cy.get('[data-cy="success-modal-title"]').should('contain.text', 'Cliente Inativado');
      cy.get('[data-cy="success-modal-close-btn"]').click();

      cy.get('[data-cy="customers-tbody"]').contains(`${testCustomerName} Atualizado`).parents('tr').within(() => {
        cy.get('[data-cy="customer-status"]').should('contain.text', 'Inativo');
        cy.contains('Reativar').should('be.visible');
      });
    });
  });

  describe('Customer Reactivation', () => {
    it('should reactivate inactive customer and show success modal', () => {
      cy.get('[data-cy="customers-tbody"]').contains(`${testCustomerName} Atualizado`).parents('tr').within(() => {
        cy.contains('Reativar').click();
      });

      cy.wait('@updateCustomerStatus');
      cy.get('[data-cy="success-modal"]').should('be.visible');
      cy.get('[data-cy="success-modal-title"]').should('contain.text', 'Cliente Reativado');
      cy.get('[data-cy="success-modal-close-btn"]').click();

      cy.get('[data-cy="customers-tbody"]').contains(`${testCustomerName} Atualizado`).parents('tr').within(() => {
        cy.get('[data-cy="customer-status"]').should('contain.text', 'Ativo');
        cy.contains('Inativar').should('be.visible');
      });
    });
  });
});
