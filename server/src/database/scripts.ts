import "reflect-metadata";
import { AppDataSource } from "./data-source.js";
import { Customer } from "../entities/Customer.entity.js";
import { Coupon } from "../entities/Coupon.entity.js";

const command = process.argv[2];

// Generates a checksum-valid CPF at runtime so no real-looking CPF literal
// lives in source control (fake data for this demo app's seed customers).
function generateMockCPF(seedDigits: string): string {
  const base = seedDigits.padEnd(9, "0").slice(0, 9).split("").map(Number);
  const calcDigit = (digits: number[]) => {
    let sum = 0;
    let weight = digits.length + 1;
    for (const d of digits) {
      sum += d * weight;
      weight--;
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  const d1 = calcDigit(base);
  const d2 = calcDigit([...base, d1]);
  const digits = [...base, d1, d2];
  return `${digits.slice(0, 3).join("")}.${digits.slice(3, 6).join("")}.${digits.slice(6, 9).join("")}-${digits.slice(9, 11).join("")}`;
}

async function dropDatabase() {
  try {
    console.log("Initializing database connection...");
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log("Dropping database...");
    await AppDataSource.dropDatabase();
    console.log("Database dropped successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error dropping database:", error);
    process.exit(1);
  }
}

async function seedDatabase() {
  try {
    console.log("Initializing database connection...");
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    console.log("Seeding default customers and coupons...");

    const customerRepo = AppDataSource.getRepository(Customer);

    const customer1 = customerRepo.create({
      id: "c1",
      name: "Diogo Jonsson",
      email: "diogo@example.com",
      cpf: generateMockCPF("123456789"),
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
      email: "john.doe@example.com",
      cpf: generateMockCPF("987654321"),
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
    console.log("✓ Default customers seeded successfully");

    const couponRepo = AppDataSource.getRepository(Coupon);
    const coupons = [
      couponRepo.create({
        id: "cp1",
        code: "LIVERPOOL10",
        value: 10.0,
        type: "promocional",
        active: true,
      }),
      couponRepo.create({
        id: "cp2",
        code: "VINYL20",
        value: 20.0,
        type: "promocional",
        active: true,
      }),
      couponRepo.create({
        id: "cp3",
        code: "TROCA_DIOGO_50",
        value: 50.0,
        type: "troca",
        active: true,
        customerId: "c1",
      }),
      couponRepo.create({
        id: "cp4",
        code: "TROCA_DIOGO_40",
        value: 40.0,
        type: "troca",
        active: true,
        customerId: "c1",
      }),
      couponRepo.create({
        id: "cp5",
        code: "TROCA_DIOGO_20",
        value: 20.0,
        type: "troca",
        active: true,
        customerId: "c1",
      }),
      couponRepo.create({
        id: "cp6",
        code: "TROCA_DIOGO_35",
        value: 35.0,
        type: "troca",
        active: true,
        customerId: "c1",
      }),
      couponRepo.create({
        id: "cp7",
        code: "TROCA_DIOGO_300",
        value: 300.0,
        type: "troca",
        active: true,
        customerId: "c1",
      }),
    ];
    await couponRepo.save(coupons);
    console.log("✓ Default coupons seeded successfully");

    console.log("\n✓ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

async function run() {
  switch (command) {
    case "drop":
      await dropDatabase();
      break;
    case "seed":
      await seedDatabase();
      break;
    case "reset":
      await dropDatabase();
      await seedDatabase();
      break;
    default:
      console.log("Usage: npm run db <command>");
      console.log("Commands:");
      console.log("  npm run db:drop     - Drop the database");
      console.log("  npm run db:seed     - Seed default users and coupons");
      console.log("  npm run db:reset    - Drop and seed the database");
      process.exit(0);
  }
}

run();
