import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryColumn({ type: "varchar", length: 100 })
  id: string;

  @Column({ type: "varchar", length: 50 })
  operation: "INSERT" | "UPDATE" | "DELETE";

  @Column({ type: "varchar", length: 100 })
  entityName: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  entityId: string | null;

  @Column({ type: "varchar", length: 100, default: "system-or-admin" })
  responsibleUser: string;

  @Column({ type: "jsonb", nullable: true })
  previousData: any;

  @Column({ type: "jsonb", nullable: true })
  newData: any;

  @CreateDateColumn({ type: "timestamp" })
  timestamp: Date;
}
