import { PrismaClient } from "../generated/client.js";

export const db: PrismaClient = new PrismaClient({
  log: ["query"],
});
