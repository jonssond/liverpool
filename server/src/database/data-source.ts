import "reflect-metadata";
import { DataSource } from "typeorm";
import { Customer } from "../entities/Customer.entity.js";
import { Address } from "../entities/Address.entity.js";
import { CreditCard } from "../entities/CreditCard.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "liverpool",
  synchronize: true,
  logging: false,
  entities: [Customer, Address, CreditCard],
  migrations: [],
  subscribers: [],
});

export async function initializeDatabase() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log("Banco de dados PostgreSQL conectado com sucesso!");
    await seedInitialData();
  }
}

async function seedInitialData() {
  const customerRepo = AppDataSource.getRepository(Customer);
  const count = await customerRepo.count();
  if (count === 0) {
    console.log("Seeding initial customers...");
    const customer1 = customerRepo.create({
      id: "c1",
      name: "Diogo Jonsson",
      email: "diogo@discos.com",
      cpf: "123.456.789-09",
      gender: "Masculino",
      birthdate: "1998-05-15",
      phone: "Celular (11) 98765-4321",
      active: true,
      addresses: [
        {
          id: "a1",
          type: "entrega",
          tipoResidencia: "Apartamento",
          tipoLogradouro: "Avenida",
          logradouro: "Paulista",
          numero: "1000",
          bairro: "Bela Vista",
          cep: "01310-100",
          cidade: "São Paulo",
          estado: "SP",
          pais: "Brasil",
        },
        {
          id: "a2",
          type: "cobranca",
          tipoResidencia: "Casa",
          tipoLogradouro: "Rua",
          logradouro: "Augusta",
          numero: "250",
          bairro: "Consolação",
          cep: "01305-000",
          cidade: "São Paulo",
          estado: "SP",
          pais: "Brasil",
        },
      ],
      cards: [
        {
          id: "card1",
          number: "**** **** **** 4321",
          name: "DIOGO JONSSON",
          brand: "Visa",
          cvv: "123",
        },
        {
          id: "card2",
          number: "**** **** **** 8765",
          name: "DIOGO JONSSON",
          brand: "Mastercard",
          cvv: "456",
        },
      ],
    });

    const customer2 = customerRepo.create({
      id: "c2",
      name: "John Doe",
      email: "john.doe@discos.com",
      cpf: "987.654.321-00",
      gender: "Masculino",
      birthdate: "1995-10-22",
      phone: "Celular (21) 99888-7766",
      active: true,
      addresses: [
        {
          id: "a3",
          type: "entrega",
          tipoResidencia: "Apartamento",
          tipoLogradouro: "Rua",
          logradouro: "Copacabana",
          numero: "450",
          bairro: "Copacabana",
          cep: "22020-001",
          cidade: "Rio de Janeiro",
          estado: "RJ",
          pais: "Brasil",
        },
        {
          id: "a4",
          type: "cobranca",
          tipoResidencia: "Apartamento",
          tipoLogradouro: "Rua",
          logradouro: "Copacabana",
          numero: "450",
          bairro: "Copacabana",
          cep: "22020-001",
          cidade: "Rio de Janeiro",
          estado: "RJ",
          pais: "Brasil",
        },
      ],
      cards: [
        {
          id: "card3",
          number: "**** **** **** 9911",
          name: "JOHN DOE",
          brand: "Elo",
          cvv: "789",
        },
      ],
    });

    await customerRepo.save([customer1, customer2]);
    console.log("Initial customers seeded successfully.");
  }
}
