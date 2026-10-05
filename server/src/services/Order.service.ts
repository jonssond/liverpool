import crypto from "crypto";
import { OrderRepository } from "../repositories/Order.repository.js";
import { CouponRepository } from "../repositories/Coupon.repository.js";
import { CustomerRepository } from "../repositories/Customer.repository.js";
import { Order } from "../entities/Order.entity.js";
import { Coupon } from "../entities/Coupon.entity.js";
import { logTransaction } from "../utils/auditLogger.js";

export interface CreateOrderDTO {
  customerId: string;
  items: Array<{
    vinylId: string;
    title: string;
    artist: string;
    coverUrl?: string;
    price: number;
    quantity: number;
  }>;
  deliveryAddress: any;
  saveAddressToProfile?: boolean;
  cards: Array<{
    id?: string;
    number: string;
    name: string;
    brand: string;
    cvv?: string;
    amount: number;
  }>;
  saveCardToProfile?: boolean;
  couponCodes?: string[];
}

export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly couponRepo: CouponRepository,
    private readonly customerRepo: CustomerRepository
  ) {}

  async findAll(): Promise<Order[]> {
    return this.orderRepo.findAll();
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    return this.orderRepo.findByCustomerId(customerId);
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new Error("Pedido não encontrado.");
    return order;
  }

  // RF0034: Cálculo do frete transparente
  // Critério adotado: Base estadual (SP: R$ 15,00, Sudeste: R$ 20,00, Outros: R$ 30,00) + R$ 2,50 por disco adicional além do 1º
  calculateFreight(state: string, totalItemsCount: number): number {
    const uf = (state || "SP").toUpperCase().trim();
    let baseFreight = 30.0;
    if (uf === "SP") baseFreight = 15.0;
    else if (["RJ", "MG", "ES"].includes(uf)) baseFreight = 20.0;
    else if (["PR", "SC", "RS"].includes(uf)) baseFreight = 25.0;

    const extraItems = Math.max(0, totalItemsCount - 1);
    return baseFreight + extraItems * 2.5;
  }

  async create(dto: CreateOrderDTO): Promise<{ order: Order; generatedExchangeCoupon?: Coupon }> {
    if (!dto.customerId) throw new Error("Cliente não informado.");
    const customer = await this.customerRepo.findById(dto.customerId);
    if (!customer) throw new Error("Cliente não encontrado.");

    if (!dto.items || dto.items.length === 0) {
      throw new Error("O carrinho não pode estar vazio para finalizar a compra.");
    }

    if (!dto.deliveryAddress) {
      throw new Error("Endereço de entrega é obrigatório.");
    }

    // RF0035 / RN0023: Se optar por salvar endereço no perfil
    if (dto.saveAddressToProfile && dto.deliveryAddress) {
      const addr = dto.deliveryAddress;
      const alreadyHas = customer.addresses?.some(
        (a) =>
          a.cep.replace(/\D/g, "") === addr.cep.replace(/\D/g, "") &&
          a.numero.trim() === addr.numero.trim()
      );
      if (!alreadyHas) {
        customer.addresses.push({
          id: crypto.randomUUID(),
          type: "entrega",
          tipoResidencia: addr.tipoResidencia || "Apartamento",
          tipoLogradouro: addr.tipoLogradouro || "Rua",
          logradouro: addr.logradouro,
          numero: addr.numero,
          bairro: addr.bairro || "Centro",
          cep: addr.cep,
          cidade: addr.cidade,
          estado: addr.estado || "SP",
          pais: addr.pais || "Brasil",
        } as any);
        await this.customerRepo.save(customer);
        await logTransaction({
          operation: "INSERT",
          entityName: "Address",
          responsibleUser: customer.email,
          newData: { customerId: customer.id, ...addr },
        });
      }
    }

    // RF0036 / RN0024 / RN0025: Se optar por salvar cartão no perfil
    if (dto.saveCardToProfile && dto.cards && dto.cards.length > 0) {
      for (const c of dto.cards) {
        if (!c.id) {
          const clean = c.number.replace(/\D/g, "");
          const masked = `**** **** **** ${clean.slice(-4)}`;
          customer.cards.push({
            id: crypto.randomUUID(),
            number: masked,
            name: c.name.trim().toUpperCase(),
            brand: c.brand || "Visa",
            cvv: c.cvv || "999",
          } as any);
          await this.customerRepo.save(customer);
          await logTransaction({
            operation: "INSERT",
            entityName: "CreditCard",
            responsibleUser: customer.email,
            newData: { customerId: customer.id, brand: c.brand, number: masked },
          });
        }
      }
    }

    // Totais dos itens
    const subtotal = dto.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItemsCount = dto.items.reduce((sum, item) => sum + item.quantity, 0);
    const freight = this.calculateFreight(dto.deliveryAddress.estado, totalItemsCount);
    const orderCost = subtotal + freight;

    // Regras de Cupons (RN0033, RN0035, RN0036)
    const usedCoupons: Coupon[] = [];
    let promoCount = 0;
    if (dto.couponCodes && dto.couponCodes.length > 0) {
      for (const code of dto.couponCodes) {
        const found = await this.couponRepo.findByCode(code.trim().toUpperCase());
        if (!found || !found.active) {
          throw new Error(`Cupom inválido ou inativo: ${code}`);
        }
        if (found.type === "promocional") {
          promoCount++;
          // RN0033: apenas um cupom promocional por compra
          if (promoCount > 1) {
            throw new Error("RN0033: Apenas um cupom promocional pode ser utilizado por compra.");
          }
        }
        usedCoupons.push(found);
      }
    }

    // RN0036: O sistema não deve possibilitar o uso de cupons que supere a compra desnecessariamente.
    // Exemplo do DRS: Compra R$ 50, cupons 20, 40, 35 -> se 40+20=60 já cobre os 50, o de 35 é desnecessário.
    let sumCoupons = 0;
    const necessaryCoupons: Coupon[] = [];
    for (const c of usedCoupons) {
      if (sumCoupons >= orderCost) {
        throw new Error(
          `RN0036: O cupom ${c.code} é desnecessário, pois os cupons anteriores já cobrem integralmente o valor da compra (R$ ${orderCost.toFixed(2)}).`
        );
      }
      sumCoupons += Number(c.value);
      necessaryCoupons.push(c);
    }

    let discount = 0;
    let generatedExchangeCoupon: Coupon | undefined = undefined;

    if (sumCoupons > orderCost) {
      discount = orderCost; // Desconto máximo é o valor da compra
      const surplus = sumCoupons - orderCost;
      // RN0036: Geração de cupom de troca quando o valor dos cupons superar a compra
      const newCouponCode = `TROCA-${Date.now().toString().slice(-6)}`;
      generatedExchangeCoupon = await this.couponRepo.create({
        id: crypto.randomUUID(),
        code: newCouponCode,
        value: parseFloat(surplus.toFixed(2)),
        type: "troca",
        active: true,
        customerId: customer.id,
      });
      await logTransaction({
        operation: "INSERT",
        entityName: "Coupon",
        entityId: generatedExchangeCoupon.id,
        newData: { code: newCouponCode, value: surplus, type: "troca", customerId: customer.id },
      });
    } else {
      discount = sumCoupons;
    }

    const remainingToPay = parseFloat((orderCost - discount).toFixed(2));

    // Validação de pagamento por Cartão (RN0034, RN0035)
    let totalCardsPaid = 0;
    const cardDescriptions: string[] = [];

    if (remainingToPay > 0) {
      if (!dto.cards || dto.cards.length === 0) {
        throw new Error(`Resta R$ ${remainingToPay.toFixed(2)} a pagar. Selecione ou informe um cartão de crédito.`);
      }

      for (const card of dto.cards) {
        const amt = parseFloat(Number(card.amount).toFixed(2));
        if (amt <= 0) throw new Error("O valor informado no cartão deve ser positivo.");

        // RN0034 e RN0035:
        // RN0034: Pagamento com mais de um cartão de crédito, com valor mínimo de R$ 10,00 por cartão.
        // RN0035: Ao combinar cupons e cartões, considerar sempre o valor máximo dos cupons; apenas nesse caso, é permitido um valor inferior a R$ 10,00 no cartão.
        const isCombiningWithCoupons = discount > 0;
        if (!isCombiningWithCoupons && amt < 10.0) {
          throw new Error("RN0034: O valor mínimo para ser pago com cada cartão de crédito deve ser R$ 10,00.");
        }

        totalCardsPaid += amt;
        cardDescriptions.push(`${card.brand} (R$ ${amt.toFixed(2)})`);
      }

      totalCardsPaid = parseFloat(totalCardsPaid.toFixed(2));
      if (Math.abs(totalCardsPaid - remainingToPay) > 0.05) {
        throw new Error(
          `O total nos cartões (R$ ${totalCardsPaid.toFixed(2)}) não confere com o restante a pagar (R$ ${remainingToPay.toFixed(2)}).`
        );
      }
    } else {
      if (dto.cards && dto.cards.length > 0) {
        const hasCardWithAmount = dto.cards.some((c) => Number(c.amount) > 0);
        if (hasCardWithAmount) {
          throw new Error("A compra já foi quitada integralmente por cupons. Remova os pagamentos com cartão.");
        }
      }
    }

    // Inativa os cupons usados
    for (const c of necessaryCoupons) {
      c.active = false;
      await this.couponRepo.save(c);
      await logTransaction({
        operation: "UPDATE",
        entityName: "Coupon",
        entityId: c.id,
        newData: { code: c.code, active: false },
      });
    }

    // Monta texto de pagamento
    const paymentParts: string[] = [];
    if (necessaryCoupons.length > 0) {
      paymentParts.push(`Cupons: ${necessaryCoupons.map((c) => `${c.code} (R$ ${Number(c.value).toFixed(2)})`).join(", ")}`);
    }
    if (cardDescriptions.length > 0) {
      paymentParts.push(`Cartões: ${cardDescriptions.join(" + ")}`);
    }

    // RF0038: Finalizar compra com status inicial obrigatório "EM PROCESSAMENTO"
    const orderCount = (await this.orderRepo.findAll()).length;
    const orderId = `PED-${String(orderCount + 1).padStart(3, "0")}`;

    const order = await this.orderRepo.create({
      id: orderId,
      customerId: customer.id,
      customerName: customer.name,
      items: dto.items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      freight: parseFloat(freight.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      total: parseFloat(orderCost.toFixed(2)),
      status: "EM PROCESSAMENTO",
      paymentDetails: paymentParts.join(" | ") || "Pago com cupons",
      deliveryAddress: dto.deliveryAddress,
    });

    await logTransaction({
      operation: "INSERT",
      entityName: "Order",
      entityId: order.id,
      responsibleUser: customer.email,
      newData: {
        id: order.id,
        status: order.status,
        total: order.total,
        customerId: order.customerId,
        itemsCount: dto.items.length,
      },
    });

    return { order, generatedExchangeCoupon };
  }

  async updateStatus(id: string, newStatus: Order["status"]): Promise<Order> {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new Error("Pedido não encontrado.");

    const prev = order.status;
    order.status = newStatus;
    const saved = await this.orderRepo.save(order);

    await logTransaction({
      operation: "UPDATE",
      entityName: "OrderStatus",
      entityId: order.id,
      previousData: { status: prev },
      newData: { status: newStatus },
    });

    return saved;
  }
}
