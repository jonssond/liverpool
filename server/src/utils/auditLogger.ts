import crypto from "crypto";
import { AppDataSource } from "../database/data-source.js";
import { AuditLog } from "../entities/AuditLog.entity.js";

export async function logTransaction(params: {
  operation: "INSERT" | "UPDATE" | "DELETE";
  entityName: string;
  entityId?: string | null;
  responsibleUser?: string;
  previousData?: any;
  newData?: any;
}) {
  try {
    if (!AppDataSource.isInitialized) return;
    const logRepo = AppDataSource.getRepository(AuditLog);
    const log = logRepo.create({
      id: crypto.randomUUID(),
      operation: params.operation,
      entityName: params.entityName,
      entityId: params.entityId || null,
      responsibleUser: params.responsibleUser || "admin@liverpool.com",
      previousData: params.previousData ? JSON.parse(JSON.stringify(params.previousData)) : null,
      newData: params.newData ? JSON.parse(JSON.stringify(params.newData)) : null,
      timestamp: new Date(),
    });
    await logRepo.save(log);
  } catch (error) {
    console.error("RNF0012: Erro ao registrar log de transação:", error);
  }
}
