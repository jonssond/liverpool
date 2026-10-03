import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("orders")
export class Order {
  @PrimaryColumn({ type: "varchar", length: 100 })
  id: string;

  @Column({ type: "varchar", length: 100 })
  customerId: string;

  @Column({ type: "varchar", length: 150 })
  customerName: string;

  @Column({ type: "jsonb" })
  items: Array<{
    vinylId: string;
    title: string;
    artist: string;
    coverUrl?: string;
    price: number;
    quantity: number;
  }>;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  freight: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total: number;

  @Column({ type: "varchar", length: 50, default: "EM PROCESSAMENTO" })
  status:
    | "EM PROCESSAMENTO"
    | "APROVADA"
    | "REPROVADA"
    | "EM TRANSPORTE"
    | "ENTREGUE"
    | "CANCELADO";

  @Column({ type: "text" })
  paymentDetails: string;

  @Column({ type: "jsonb", nullable: true })
  deliveryAddress: any;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
