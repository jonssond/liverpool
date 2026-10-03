import { Repository } from "typeorm";
import { Coupon } from "../entities/Coupon.entity.js";

export class CouponRepository {
  constructor(private readonly ormRepo: Repository<Coupon>) {}

  async findAll(): Promise<Coupon[]> {
    return this.ormRepo.find();
  }

  async findByCode(code: string): Promise<Coupon | null> {
    return this.ormRepo.findOne({
      where: { code },
    });
  }

  async findActiveByCustomerId(customerId?: string): Promise<Coupon[]> {
    const qb = this.ormRepo.createQueryBuilder("c").where("c.active = :active", { active: true });
    if (customerId) {
      qb.andWhere("(c.customerId = :customerId OR c.customerId IS NULL)", { customerId });
    }
    return qb.getMany();
  }

  async create(couponData: Partial<Coupon>): Promise<Coupon> {
    const coupon = this.ormRepo.create(couponData);
    return this.ormRepo.save(coupon);
  }

  async save(coupon: Coupon): Promise<Coupon> {
    return this.ormRepo.save(coupon);
  }
}
