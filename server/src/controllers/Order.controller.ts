import { Request, Response } from "express";
import { OrderService } from "../services/Order.service.js";
import { CouponRepository } from "../repositories/Coupon.repository.js";

export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly couponRepo: CouponRepository
  ) {}

  async findAll(req: Request, res: Response): Promise<void> {
    try {
      const orders = await this.orderService.findAll();
      res.status(200).json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Erro ao buscar pedidos." });
    }
  }

  async findByCustomerId(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const orders = await this.orderService.findByCustomerId(customerId as string);
      res.status(200).json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Erro ao buscar pedidos do cliente." });
    }
  }

  async findById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderService.findById(id as string);
      res.status(200).json(order);
    } catch (error: any) {
      res.status(404).json({ error: error.message || "Pedido não encontrado." });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.orderService.create(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Erro ao finalizar pedido." });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await this.orderService.updateStatus(id as string, status);
      res.status(200).json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Erro ao atualizar status do pedido." });
    }
  }

  async calculateFreight(req: Request, res: Response): Promise<void> {
    try {
      const { state, totalItemsCount } = req.query;
      const freight = this.orderService.calculateFreight(
        String(state || "SP"),
        Number(totalItemsCount || 1)
      );
      res.status(200).json({ freight });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Erro ao calcular frete." });
    }
  }

  async listCoupons(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.query;
      const coupons = await this.couponRepo.findActiveByCustomerId(
        customerId ? String(customerId) : undefined
      );
      res.status(200).json(coupons);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Erro ao listar cupons." });
    }
  }
}
