import { PrismaClient } from "../generated/client";

export const db: PrismaClient = new PrismaClient({
  log: ["query"],
});
