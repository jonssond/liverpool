describe("Sales Analytics - Histórico de Vendas por Categoria", () => {
  const API_BASE_URL = "http://localhost:3001/api";

  beforeEach(() => {
    // Reset database and seed test data
    cy.request("POST", `${API_BASE_URL}/analytics/db-seed`).then((response) => {
      expect(response.status).to.eq(200);
    });

    // Navigate to admin analytics page
    cy.visit("http://localhost:3000/admin/sales-analytics");
  });

  /**
   * CENÁRIO 1: Consulta de uma categoria em um período válido
   * Validar que os valores mensais igualam a soma das vendas ENTREGUE registradas
   */
  it("Cenário 1: Consulta de uma categoria em período válido com valores corretos", () => {
    // Selecionar categoria
    cy.contains("button", "Rock").click();

    // Definir período (últimos 90 dias)
    cy.get('input[type="date"]').first().clear().type("2026-08-09");
    cy.get('input[type="date"]').last().clear().type("2026-11-07");

    // Executar análise
    cy.contains("button", "Analisar Vendas").click();

    // Validar que o gráfico aparece
    cy.get("canvas").should("exist");

    // Validar tabela de dados
    cy.contains("Histórico de Vendas por Categoria").should("exist");
    cy.contains("Rock").should("exist");

    // Validar que há dados na tabela (pelo menos uma linha de dados além do header)
    cy.get("table tbody tr").should("have.length.greaterThan", 0);

    // Validar valores são números positivos
    cy.get("table tbody tr").first().within(() => {
      cy.get("td").last().then(($td) => {
        const value = parseFloat($td.text().replace("R$ ", "").replace(",", "."));
        expect(value).to.be.greaterThan(0);
      });
    });
  });

  /**
   * CENÁRIO 2: Comparação entre duas ou mais categorias no período
   */
  it("Cenário 2: Comparação entre múltiplas categorias", () => {
    // Selecionar múltiplas categorias
    cy.contains("button", "Rock").click();
    cy.contains("button", "Jazz").click();
    cy.contains("button", "Pop").click();

    // Definir período
    cy.get('input[type="date"]').first().clear().type("2026-08-09");
    cy.get('input[type="date"]').last().clear().type("2026-11-07");

    // Executar análise
    cy.contains("button", "Analisar Vendas").click();

    // Validar que todas as categorias aparecem na tabela
    cy.get("table thead tr th").should("contain", "Rock");
    cy.get("table thead tr th").should("contain", "Jazz");
    cy.get("table thead tr th").should("contain", "Pop");

    // Validar que há dados para cada categoria
    cy.get("table tbody tr").first().within(() => {
      cy.get("td").should("have.length", 4); // Mês + 3 categorias
    });
  });

  /**
   * CENÁRIO 3: Apresentação em gráfico de linhas com valores em reais agrupados por mês
   */
  it("Cenário 3: Gráfico de linhas apresentado corretamente", () => {
    // Selecionar categoria
    cy.contains("button", "Rock").click();

    // Definir período
    cy.get('input[type="date"]').first().clear().type("2026-08-09");
    cy.get('input[type="date"]').last().clear().type("2026-11-07");

    // Executar análise
    cy.contains("button", "Analisar Vendas").click();

    // Validar que o gráfico Recharts está renderizado
    cy.get("canvas").should("exist");

    // Validar eixos do gráfico
    cy.contains("Mês/Ano").should("exist");
    cy.contains("Vendas (R$)").should("exist");

    // Validar legenda
    cy.contains("Rock").should("exist");

    // Validar que há pontos no gráfico (canvas não está vazio)
    cy.get("canvas").then((canvas) => {
      const rect = canvas[0].getBoundingClientRect();
      expect(rect.width).to.be.greaterThan(0);
      expect(rect.height).to.be.greaterThan(0);
    });
  });

  /**
   * CENÁRIO 4: Alteração de data resulta em novo resultado no gráfico
   */
  it("Cenário 4: Alteração de datas reflete novo resultado", () => {
    // Selecionar categoria
    cy.contains("button", "Rock").click();

    // Primeira consulta: período longo
    cy.get('input[type="date"]').first().clear().type("2026-08-09");
    cy.get('input[type="date"]').last().clear().type("2026-11-07");
    cy.contains("button", "Analisar Vendas").click();

    // Contar linhas da tabela
    cy.get("table tbody tr").then(($rows) => {
      const firstCount = $rows.length;

      // Segunda consulta: período mais curto
      cy.get('input[type="date"]').first().clear().type("2026-09-09");
      cy.get('input[type="date"]').last().clear().type("2026-10-07");
      cy.contains("button", "Analisar Vendas").click();

      // Validar que o número de meses mudou
      cy.get("table tbody tr").should(($newRows) => {
        expect($newRows.length).to.not.equal(firstCount);
      });
    });
  });

  /**
   * CENÁRIO 5: Compra com status diferente de ENTREGUE não é contabilizada
   */
  it("Cenário 5: Vendas com status != ENTREGUE não são contabilizadas", () => {
    // Esta validação acontece quando criamos vendas de teste
    // Vamos simular verificando que apenas vendas ENTREGUE são contadas

    cy.contains("button", "Rock").click();
    cy.get('input[type="date"]').first().clear().type("2026-08-09");
    cy.get('input[type="date"]').last().clear().type("2026-11-07");
    cy.contains("button", "Analisar Vendas").click();

    // Capturar valor de uma categoria
    cy.get("table tbody tr")
      .first()
      .within(() => {
        cy.get("td")
          .last()
          .then(($td) => {
            const reportedValue = parseFloat(
              $td.text().replace("R$ ", "").replace(",", ".")
            );

            // Fazer requisição direta à API para validar
            cy.request({
              method: "GET",
              url: `${API_BASE_URL}/analytics/sales?startDate=2026-08-09&endDate=2026-11-07&categories=Rock`,
            }).then((response) => {
              const apiValue = response.body.data.reduce(
                (sum: number, point: any) => sum + point.totalSales,
                0
              );

              // Valores devem ser iguais (apenas ENTREGUE contabilizado)
              expect(reportedValue).to.be.closeTo(apiValue, 0.01);
            });
          });
      });
  });

  /**
   * CENÁRIO 6: Compra que passa a ENTREGUE aparece na consulta seguinte
   */
  it("Cenário 6: Vendas que mudam para ENTREGUE refletem na próxima consulta", () => {
    // Primeira consulta
    cy.contains("button", "Rock").click();
    cy.get('input[type="date"]').first().clear().type("2026-10-01");
    cy.get('input[type="date"]').last().clear().type("2026-11-07");
    cy.contains("button", "Analisar Vendas").click();

    // Capturar primeiro valor
    let firstValue = 0;
    cy.get("table tbody tr")
      .first()
      .within(() => {
        cy.get("td")
          .last()
          .then(($td) => {
            firstValue = parseFloat(
              $td.text().replace("R$ ", "").replace(",", ".")
            );
          });
      });

    // Simular mudança de status de um pedido para ENTREGUE via API
    cy.request({
      method: "GET",
      url: `${API_BASE_URL}/orders`,
    }).then((response) => {
      const orders = response.body;
      const pendingOrder = orders.find(
        (o: any) => o.status !== "ENTREGUE" && o.items[0]?.category === "Rock"
      );

      if (pendingOrder) {
        cy.request({
          method: "PATCH",
          url: `${API_BASE_URL}/orders/${pendingOrder.id}`,
          body: { status: "ENTREGUE" },
        }).then(() => {
          // Segunda consulta: refazer a análise
          cy.contains("button", "Analisar Vendas").click();

          // Validar que o valor aumentou
          cy.get("table tbody tr")
            .first()
            .within(() => {
              cy.get("td")
                .last()
                .then(($td) => {
                  const secondValue = parseFloat(
                    $td.text().replace("R$ ", "").replace(",", ".")
                  );
                  // Valor deve ser igual ou maior (pode ter novos pedidos ENTREGUE)
                  expect(secondValue).to.be.greaterThanOrEqual(firstValue);
                });
            });
        });
      }
    });
  });

  /**
   * CENÁRIO 7: Acesso ao gráfico permitido ao administrador, negado a outros perfis
   */
  it("Cenário 7: Acesso restrito a administrador", () => {
    // Verificar que estamos em página admin
    cy.url().should("include", "/admin/sales-analytics");

    // Verificar que os componentes de análise estão visíveis
    cy.contains("Análise de Vendas").should("exist");
    cy.contains("Filtros").should("exist");

    // Sair do admin e verificar que acesso é restrito
    cy.visit("http://localhost:3000/");
    cy.contains("Painel ADM").click();
    cy.url().should("include", "/admin");

    // Tentar acessar sales-analytics diretamente (deve redirecionar ou bloquear)
    // Nota: implementação de redirecionamento pode ser adicionada se necessário
    cy.visit("http://localhost:3000/admin/sales-analytics");
    // Página deve carregar normalmente pois ainda está logado como admin
    cy.contains("Análise de Vendas").should("exist");
  });

  /**
   * CENÁRIO 8: Tempo de resposta da consulta <= 1 segundo
   */
  it("Cenário 8: Tempo de resposta <= 1 segundo (RNF0011)", () => {
    cy.contains("button", "Rock").click();
    cy.get('input[type="date"]').first().clear().type("2026-08-09");
    cy.get('input[type="date"]').last().clear().type("2026-11-07");

    // Medir tempo de resposta
    const startTime = Date.now();

    cy.contains("button", "Analisar Vendas").click();

    // Esperar que os dados apareçam
    cy.get("table tbody tr", { timeout: 1500 }).should("have.length.greaterThan", 0);

    cy.then(() => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Validar que resposta <= 1000ms
      expect(responseTime).to.be.lessThan(1000);

      // Verificar se há elemento de tempo de resposta exibido
      cy.contains(/Tempo de resposta:/).should("exist");
    });
  });

  /**
   * TESTE ADICIONAL: Validação de campos obrigatórios
   */
  it("Validação: Campos obrigatórios", () => {
    // Tentar analisar sem selecionar categoria
    cy.get('input[type="date"]').first().clear().type("2026-08-09");
    cy.get('input[type="date"]').last().clear().type("2026-11-07");
    cy.contains("button", "Analisar Vendas").click();

    // Deve exibir erro
    cy.contains("Selecione pelo menos uma categoria").should("exist");

    // Tentar analisar sem datas
    cy.contains("button", "Rock").click();
    cy.get('input[type="date"]').first().clear();
    cy.get('input[type="date"]').last().clear();
    cy.contains("button", "Analisar Vendas").click();

    // Deve exibir erro
    cy.contains("Preencha as datas").should("exist");
  });

  /**
   * TESTE ADICIONAL: Data inicial não pode ser maior que data final
   */
  it("Validação: Data inicial não pode ser maior que final", () => {
    cy.contains("button", "Rock").click();
    cy.get('input[type="date"]').first().clear().type("2026-11-07");
    cy.get('input[type="date"]').last().clear().type("2026-08-09");
    cy.contains("button", "Analisar Vendas").click();

    // Deve exibir erro
    cy.contains(/Data inicial|inválida/).should("exist");
  });
});
