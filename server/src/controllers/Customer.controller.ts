import { Request, Response } from "express";
import { CustomerService } from "../services/Customer.service.js";

export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const customers = await this.customerService.findAll();
      res.status(200).json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Erro ao buscar clientes." });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await this.customerService.findById(id as string);
      res.status(200).json(customer);
    } catch (error: any) {
      res.status(404).json({ error: error.message || "Cliente não encontrado." });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const customer = await this.customerService.create(req.body);
      res.status(201).json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Erro ao criar cliente." });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await this.customerService.update(id as string, req.body);
      res.status(200).json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Erro ao atualizar cliente." });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { active, reason } = req.body;
      const customer = await this.customerService.updateStatus(id as string, active, reason);
      res.status(200).json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Erro ao alterar status do cliente." });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.customerService.delete(id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Erro ao excluir cliente." });
    }
  }
}
