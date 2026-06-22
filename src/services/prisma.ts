import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getEnv } from "./env";

let client: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (client) return client;

  const url = getEnv("DATABASE_URL");
  if (!url) {
    throw new Error("DATABASE_URL não encontrada. Verifique o arquivo .env");
  }

  const adapter = new PrismaPg(url);
  client = new PrismaClient({ adapter });
  return client;
}
