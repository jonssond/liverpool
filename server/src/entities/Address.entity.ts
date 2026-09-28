import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Customer } from "./Customer.entity.js";

@Entity("addresses")
export class Address {
  @PrimaryColumn({ type: "varchar", length: 100 })
  id: string;

  @Column({ type: "varchar", length: 20 })
  type: "cobranca" | "entrega";

  @Column({ type: "varchar", length: 50, default: "Casa" })
  tipoResidencia: string;

  @Column({ type: "varchar", length: 50, default: "Rua" })
  tipoLogradouro: string;

  @Column({ type: "varchar", length: 255 })
  logradouro: string;

  @Column({ type: "varchar", length: 20 })
  numero: string;

  @Column({ type: "varchar", length: 100, default: "Centro" })
  bairro: string;

  @Column({ type: "varchar", length: 20 })
  cep: string;

  @Column({ type: "varchar", length: 100 })
  cidade: string;

  @Column({ type: "varchar", length: 50, default: "SP" })
  estado: string;

  @Column({ type: "varchar", length: 50, default: "Brasil" })
  pais: string;

  @ManyToOne(() => Customer, (customer) => customer.addresses, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "customer_id" })
  customer: Customer;
}
