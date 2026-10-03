import crypto from "crypto";
import bcrypt from "bcryptjs";
import { CustomerRepository } from "../repositories/Customer.repository.js";
import { Customer } from "../entities/Customer.entity.js";
import { Address } from "../entities/Address.entity.js";
import { CreditCard } from "../entities/CreditCard.entity.js";
import {
  validateCPF,
  validateCreditCard,
  validatePhone,
  validateStrongPassword,
} from "../utils/validators.js";
import { logTransaction } from "../utils/auditLogger.js";

export interface CreateCustomerDTO {
  name: string;
  email: string;
  cpf: string;
  gender: string;
  birthdate: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
  addresses: Array<{
    type: "cobranca" | "entrega";
    tipoResidencia?: string;
    tipoLogradouro?: string;
    logradouro: string;
    numero: string;
    bairro?: string;
    cep: string;
    cidade: string;
    estado?: string;
    pais?: string;
  }>;
  cards?: Array<{
    number: string;
    name: string;
    brand: string;
    cvv?: string;
  }>;
}

export interface UpdateCustomerDTO {
  name?: string;
  email?: string;
  cpf?: string;
  gender?: string;
  birthdate?: string;
  phone?: string;
  addresses?: Array<{
    id?: string;
    type: "cobranca" | "entrega";
    tipoResidencia?: string;
    tipoLogradouro?: string;
    logradouro: string;
    numero: string;
    bairro?: string;
    cep: string;
    cidade: string;
    estado?: string;
    pais?: string;
  }>;
  cards?: Array<{
    id?: string;
    number: string;
    name: string;
    brand: string;
    cvv?: string;
  }>;
}

export class CustomerService {
  constructor(private readonly customerRepo: CustomerRepository) {}

  async findAll(): Promise<Customer[]> {
    return this.customerRepo.findAll();
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.customerRepo.findById(id);
    if (!customer) {
      throw new Error("Cliente não encontrado.");
    }
    return customer;
  }

  async create(dto: CreateCustomerDTO): Promise<Customer> {
    if (!dto.name?.trim()) throw new Error("Nome é obrigatório.");
    if (!dto.email?.trim()) throw new Error("E-mail é obrigatório.");
    if (!dto.cpf?.trim()) throw new Error("CPF é obrigatório.");
    if (!dto.birthdate?.trim()) throw new Error("Data de nascimento é obrigatória.");
    if (!dto.phone?.trim()) throw new Error("Telefone é obrigatório.");

    if (!validateCPF(dto.cpf)) {
      throw new Error("CPF inválido. Verifique os dígitos informados.");
    }

    if (!validatePhone(dto.phone)) {
      throw new Error("Telefone inválido. Formato esperado: (XX) XXXXX-XXXX.");
    }

    let hashedPassword: string | undefined = undefined;
    if (dto.password) {
      if (dto.password !== dto.confirmPassword) {
        throw new Error("A confirmação de senha não coincide com a senha informada.");
      }
      if (!validateStrongPassword(dto.password)) {
        throw new Error(
          "A senha deve conter ao menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números/caracteres especiais."
        );
      }
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    const existingEmail = await this.customerRepo.findByEmail(dto.email.trim());
    if (existingEmail) {
      throw new Error("Já existe um cliente cadastrado com este e-mail.");
    }

    const existingCpf = await this.customerRepo.findByCpf(dto.cpf.trim());
    if (existingCpf) {
      throw new Error("Já existe um cliente cadastrado com este CPF.");
    }

    if (!dto.addresses || dto.addresses.length < 2) {
      throw new Error(
        "É obrigatório cadastrar ao menos um endereço de entrega e um de cobrança."
      );
    }
    const hasDelivery = dto.addresses.some((a) => a.type === "entrega");
    const hasBilling = dto.addresses.some((a) => a.type === "cobranca");
    if (!hasDelivery || !hasBilling) {
      throw new Error(
        "O cliente deve possuir ao menos um endereço de entrega e um endereço de cobrança."
      );
    }

    for (const addr of dto.addresses) {
      if (!addr.logradouro?.trim() || !addr.numero?.trim() || !addr.cep?.trim() || !addr.cidade?.trim()) {
        throw new Error("Preencha todos os campos obrigatórios dos endereços (Logradouro, Número, CEP, Cidade).");
      }
    }

    if (dto.cards && dto.cards.length > 0) {
      for (const card of dto.cards) {
        if (!validateCreditCard(card.number)) {
          throw new Error("Número de cartão de crédito inválido (algoritmo de Luhn).");
        }
      }
    }

    const customer = new Customer();
    customer.id = crypto.randomUUID();
    customer.name = dto.name.trim();
    customer.email = dto.email.trim().toLowerCase();
    customer.cpf = dto.cpf.trim();
    customer.gender = dto.gender || "Masculino";
    customer.birthdate = dto.birthdate;
    customer.phone = dto.phone.trim();
    customer.active = true;
    if (hashedPassword) customer.password = hashedPassword;

    customer.addresses = dto.addresses.map((a) => {
      const addr = new Address();
      addr.id = crypto.randomUUID();
      addr.type = a.type;
      addr.tipoResidencia = a.tipoResidencia || "Casa";
      addr.tipoLogradouro = a.tipoLogradouro || "Rua";
      addr.logradouro = a.logradouro.trim();
      addr.numero = a.numero.trim();
      addr.bairro = a.bairro?.trim() || "Centro";
      addr.cep = a.cep.trim();
      addr.cidade = a.cidade.trim();
      addr.estado = a.estado?.trim() || "SP";
      addr.pais = a.pais?.trim() || "Brasil";
      return addr;
    });

    if (dto.cards && dto.cards.length > 0) {
      customer.cards = dto.cards.map((c) => {
        const card = new CreditCard();
        card.id = crypto.randomUUID();
        const cleanNumber = c.number.replace(/\D/g, "");
        const masked = `**** **** **** ${cleanNumber.slice(-4)}`;
        card.number = masked;
        card.name = c.name.trim().toUpperCase();
        card.brand = c.brand || "Visa";
        card.cvv = c.cvv?.trim() || "999";
        return card;
      });
    } else {
      customer.cards = [];
    }

    const saved = await this.customerRepo.create(customer);
    await logTransaction({
      operation: "INSERT",
      entityName: "Customer",
      entityId: saved.id,
      newData: { id: saved.id, name: saved.name, email: saved.email, cpf: saved.cpf },
    });
    return saved;
  }

  async update(id: string, dto: UpdateCustomerDTO): Promise<Customer> {
    const customer = await this.customerRepo.findById(id);
    if (!customer) {
      throw new Error("Cliente não encontrado.");
    }

    if (dto.name !== undefined) customer.name = dto.name.trim();
    if (dto.gender !== undefined) customer.gender = dto.gender;
    if (dto.birthdate !== undefined) customer.birthdate = dto.birthdate;

    if (dto.email !== undefined && dto.email.trim().toLowerCase() !== customer.email.toLowerCase()) {
      const existing = await this.customerRepo.findByEmail(dto.email.trim());
      if (existing && existing.id !== customer.id) {
        throw new Error("Este e-mail já está sendo utilizado por outro cliente.");
      }
      customer.email = dto.email.trim().toLowerCase();
    }

    if (dto.cpf !== undefined && dto.cpf.trim() !== customer.cpf) {
      if (!validateCPF(dto.cpf)) {
        throw new Error("CPF inválido. Verifique os dígitos informados.");
      }
      const existing = await this.customerRepo.findByCpf(dto.cpf.trim());
      if (existing && existing.id !== customer.id) {
        throw new Error("Este CPF já está cadastrado para outro cliente.");
      }
      customer.cpf = dto.cpf.trim();
    }

    if (dto.phone !== undefined) {
      if (!validatePhone(dto.phone)) {
        throw new Error("Telefone inválido. Formato esperado: (XX) XXXXX-XXXX.");
      }
      customer.phone = dto.phone.trim();
    }

    if (dto.addresses && dto.addresses.length > 0) {
      customer.addresses = dto.addresses.map((a) => {
        const addr = new Address();
        if (a.id) addr.id = a.id;
        addr.type = a.type;
        addr.tipoResidencia = a.tipoResidencia || "Casa";
        addr.tipoLogradouro = a.tipoLogradouro || "Rua";
        addr.logradouro = a.logradouro.trim();
        addr.numero = a.numero.trim();
        addr.bairro = a.bairro?.trim() || "Centro";
        addr.cep = a.cep.trim();
        addr.cidade = a.cidade.trim();
        addr.estado = a.estado?.trim() || "SP";
        addr.pais = a.pais?.trim() || "Brasil";
        return addr;
      });
    }

    if (dto.cards && dto.cards.length > 0) {
      customer.cards = dto.cards.map((c) => {
        const card = new CreditCard();
        if (c.id) card.id = c.id;
        if (c.number.includes("*")) {
          card.number = c.number;
        } else {
          if (!validateCreditCard(c.number)) {
            throw new Error("Número de cartão de crédito inválido.");
          }
          const clean = c.number.replace(/\D/g, "");
          card.number = `**** **** **** ${clean.slice(-4)}`;
        }
        card.name = c.name.trim().toUpperCase();
        card.brand = c.brand || "Visa";
        card.cvv = c.cvv?.trim() || "999";
        return card;
      });
    }

    const previousData = { name: customer.name, email: customer.email, cpf: customer.cpf };
    const saved = await this.customerRepo.save(customer);
    await logTransaction({
      operation: "UPDATE",
      entityName: "Customer",
      entityId: saved.id,
      previousData,
      newData: { id: saved.id, name: saved.name, email: saved.email, cpf: saved.cpf },
    });
    return saved;
  }

  async addAddress(customerId: string, addressData: any): Promise<Customer> {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) throw new Error("Cliente não encontrado.");

    if (!addressData.logradouro?.trim() || !addressData.numero?.trim() || !addressData.cep?.trim() || !addressData.cidade?.trim()) {
      throw new Error("Composição de endereço inválida (RN0023). Preencha Logradouro, Número, Bairro, CEP e Cidade.");
    }

    const addr = new Address();
    addr.id = crypto.randomUUID();
    addr.type = addressData.type || "entrega";
    addr.tipoResidencia = addressData.tipoResidencia || "Apartamento";
    addr.tipoLogradouro = addressData.tipoLogradouro || "Rua";
    addr.logradouro = addressData.logradouro.trim();
    addr.numero = addressData.numero.trim();
    addr.bairro = addressData.bairro?.trim() || "Centro";
    addr.cep = addressData.cep.trim();
    addr.cidade = addressData.cidade.trim();
    addr.estado = addressData.estado?.trim() || "SP";
    addr.pais = addressData.pais?.trim() || "Brasil";

    customer.addresses = [...(customer.addresses || []), addr];
    const saved = await this.customerRepo.save(customer);
    await logTransaction({
      operation: "INSERT",
      entityName: "Address",
      entityId: addr.id,
      responsibleUser: customer.email,
      newData: { customerId: customer.id, ...addr },
    });
    return saved;
  }

  async addCard(customerId: string, cardData: any): Promise<Customer> {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) throw new Error("Cliente não encontrado.");

    if (!cardData.number || !cardData.name) {
      throw new Error("Dados de cartão incompletos (RN0024).");
    }

    const card = new CreditCard();
    card.id = crypto.randomUUID();
    const clean = cardData.number.replace(/\D/g, "");
    card.number = `**** **** **** ${clean.slice(-4)}`;
    card.name = cardData.name.trim().toUpperCase();
    card.brand = cardData.brand || "Visa";
    card.cvv = cardData.cvv?.trim() || "999";

    customer.cards = [...(customer.cards || []), card];
    const saved = await this.customerRepo.save(customer);
    await logTransaction({
      operation: "INSERT",
      entityName: "CreditCard",
      entityId: card.id,
      responsibleUser: customer.email,
      newData: { customerId: customer.id, id: card.id, brand: card.brand, number: card.number },
    });
    return saved;
  }

  async updateStatus(id: string, active: boolean, reason?: string): Promise<Customer> {
    const customer = await this.customerRepo.findById(id);
    if (!customer) {
      throw new Error("Cliente não encontrado.");
    }

    if (!active && (!reason || !reason.trim())) {
      throw new Error("É obrigatório informar o motivo para a inativação do cliente.");
    }

    const prevStatus = customer.active;
    customer.active = active;
    if (!active) {
      customer.deactivateReason = reason?.trim() || null;
    } else {
      customer.deactivateReason = null;
    }

    const saved = await this.customerRepo.save(customer);
    await logTransaction({
      operation: "UPDATE",
      entityName: "CustomerStatus",
      entityId: saved.id,
      previousData: { active: prevStatus },
      newData: { active: saved.active, deactivateReason: saved.deactivateReason },
    });
    return saved;
  }

  async delete(id: string): Promise<void> {
    const customer = await this.customerRepo.findById(id);
    if (!customer) {
      throw new Error("Cliente não encontrado.");
    }
    await this.customerRepo.delete(id);
    await logTransaction({
      operation: "DELETE",
      entityName: "Customer",
      entityId: id,
      previousData: { id: customer.id, name: customer.name, email: customer.email },
    });
  }
}
