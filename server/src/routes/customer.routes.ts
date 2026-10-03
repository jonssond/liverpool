import { Router, Request, Response, NextFunction } from "express";
import { AppDataSource } from "../database/data-source.js";
import { Customer } from "../entities/Customer.entity.js";
import { CustomerRepository } from "../repositories/Customer.repository.js";
import { CustomerService } from "../services/Customer.service.js";
import { CustomerController } from "../controllers/Customer.controller.js";

const customerRouter = Router();

// Lazy resolver to ensure AppDataSource is initialized before accessing repository
function getCustomerController(): CustomerController {
  const ormRepo = AppDataSource.getRepository(Customer);
  const customerRepository = new CustomerRepository(ormRepo);
  const customerService = new CustomerService(customerRepository);
  return new CustomerController(customerService);
}

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_TOKEN || "admin-secret-token";

  if (
    authHeader === adminSecret ||
    authHeader === `Bearer ${adminSecret}` ||
    req.headers["x-admin-token"] === adminSecret
  ) {
    return next();
  }

  return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
};

customerRouter.get("/", isAdmin, (req, res) =>
  getCustomerController().findAll(req, res)
);
customerRouter.get("/:id", isAdmin, (req, res) =>
  getCustomerController().findById(req, res)
);
customerRouter.post("/", isAdmin, (req, res) =>
  getCustomerController().create(req, res)
);
customerRouter.put("/:id", isAdmin, (req, res) =>
  getCustomerController().update(req, res)
);
customerRouter.patch("/:id/status", isAdmin, (req, res) =>
  getCustomerController().updateStatus(req, res)
);
customerRouter.post("/:id/addresses", (req, res) =>
  getCustomerController().addAddress(req, res)
);
customerRouter.post("/:id/cards", (req, res) =>
  getCustomerController().addCard(req, res)
);
customerRouter.delete("/:id", isAdmin, (req, res) =>
  getCustomerController().delete(req, res)
);

export { customerRouter };
