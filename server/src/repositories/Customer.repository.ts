import { Repository } from "typeorm";
import { Customer } from "../entities/Customer.entity.js";

export class CustomerRepository {
  constructor(private readonly ormRepo: Repository<Customer>) {}

  async findAll(): Promise<Customer[]> {
    return this.ormRepo.find({
      relations: ["addresses", "cards"],
      order: { createdAt: "DESC" },
    });
  }

  async findById(id: string): Promise<Customer | null> {
    return this.ormRepo.findOne({
      where: { id },
      relations: ["addresses", "cards"],
    });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.ormRepo.findOne({
      where: { email },
    });
  }

  async findByCpf(cpf: string): Promise<Customer | null> {
    return this.ormRepo.findOne({
      where: { cpf },
    });
  }

  async create(customerData: Partial<Customer>): Promise<Customer> {
    const customer = this.ormRepo.create(customerData);
    return this.ormRepo.save(customer);
  }

  async save(customer: Customer): Promise<Customer> {
    return this.ormRepo.save(customer);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.ormRepo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
