import { Router } from "express";
import { AppDataSource } from "../database/data-source.js";
import { Order } from "../entities/Order.entity.js";
import { Coupon } from "../entities/Coupon.entity.js";
import { Customer } from "../entities/Customer.entity.js";
import { OrderRepository } from "../repositories/Order.repository.js";
import { CouponRepository } from "../repositories/Coupon.repository.js";
import { CustomerRepository } from "../repositories/Customer.repository.js";
import { OrderService } from "../services/Order.service.js";
import { OrderController } from "../controllers/Order.controller.js";

const orderRouter = Router();

function getOrderController(): OrderController {
  const orderRepo = new OrderRepository(AppDataSource.getRepository(Order));
  const couponRepo = new CouponRepository(AppDataSource.getRepository(Coupon));
  const customerRepo = new CustomerRepository(AppDataSource.getRepository(Customer));
  const orderService = new OrderService(orderRepo, couponRepo, customerRepo);
  return new OrderController(orderService, couponRepo);
}

orderRouter.get("/", (req, res) => getOrderController().findAll(req, res));
orderRouter.get("/freight", (req, res) => getOrderController().calculateFreight(req, res));
orderRouter.get("/coupons", (req, res) => getOrderController().listCoupons(req, res));
orderRouter.get("/customer/:customerId", (req, res) => getOrderController().findByCustomerId(req, res));
orderRouter.get("/:id", (req, res) => getOrderController().findById(req, res));
orderRouter.post("/", (req, res) => getOrderController().create(req, res));
orderRouter.patch("/:id/status", (req, res) => getOrderController().updateStatus(req, res));

export { orderRouter };
