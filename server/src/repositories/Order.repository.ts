import { Repository } from "typeorm";
import { Order } from "../entities/Order.entity.js";

export class OrderRepository {
  constructor(private readonly ormRepo: Repository<Order>) {}

  async findAll(): Promise<Order[]> {
    return this.ormRepo.find({
      order: { createdAt: "DESC" },
    });
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    return this.ormRepo.find({
      where: { customerId },
      order: { createdAt: "DESC" },
    });
  }

  async findById(id: string): Promise<Order | null> {
    return this.ormRepo.findOne({
      where: { id },
    });
  }

  async create(orderData: Partial<Order>): Promise<Order> {
    const order = this.ormRepo.create(orderData);
    return this.ormRepo.save(order);
  }

  async save(order: Order): Promise<Order> {
    return this.ormRepo.save(order);
  }
}
