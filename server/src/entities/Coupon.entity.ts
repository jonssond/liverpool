import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("coupons")
export class Coupon {
  @PrimaryColumn({ type: "varchar", length: 100 })
  id: string;

  @Column({ type: "varchar", length: 100, unique: true })
  code: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  value: number;

  @Column({ type: "varchar", length: 30 })
  type: "promocional" | "troca";

  @Column({ type: "boolean", default: true })
  active: boolean;

  @Column({ type: "varchar", length: 100, nullable: true })
  customerId?: string | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;
}
