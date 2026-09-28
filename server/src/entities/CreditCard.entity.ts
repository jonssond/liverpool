import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Customer } from "./Customer.entity.js";

@Entity("credit_cards")
export class CreditCard {
  @PrimaryColumn({ type: "varchar", length: 100 })
  id: string;

  @Column({ type: "varchar", length: 30 })
  number: string;

  @Column({ type: "varchar", length: 150 })
  name: string;

  @Column({ type: "varchar", length: 50 })
  brand: string;

  @Column({ type: "varchar", length: 10, default: "999" })
  cvv: string;

  @ManyToOne(() => Customer, (customer) => customer.cards, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "customer_id" })
  customer: Customer;
}
