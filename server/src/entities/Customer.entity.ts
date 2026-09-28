import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Address } from "./Address.entity.js";
import { CreditCard } from "./CreditCard.entity.js";

@Entity("customers")
export class Customer {
  @PrimaryColumn({ type: "varchar", length: 100 })
  id: string;

  @Column({ type: "varchar", length: 150 })
  name: string;

  @Column({ type: "varchar", length: 150, unique: true })
  email: string;

  @Column({ type: "varchar", length: 20, unique: true })
  cpf: string;

  @Column({ type: "varchar", length: 30, default: "Masculino" })
  gender: string;

  @Column({ type: "varchar", length: 20 })
  birthdate: string;

  @Column({ type: "varchar", length: 40 })
  phone: string;

  @Column({ type: "varchar", length: 255, nullable: true, select: false })
  password?: string;

  @Column({ type: "boolean", default: true })
  active: boolean;

  @Column({ type: "text", nullable: true })
  deactivateReason?: string | null;

  @OneToMany(() => Address, (address) => address.customer, {
    cascade: true,
    eager: false,
  })
  addresses: Address[];

  @OneToMany(() => CreditCard, (card) => card.customer, {
    cascade: true,
    eager: false,
  })
  cards: CreditCard[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
