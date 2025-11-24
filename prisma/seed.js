// This only execute onces in production.
//import { PrismaClient } from "@prisma/client";
//import bcrypt from "bcrypt";

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const db = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASS;

  const hash = bcrypt.hashSync(adminPass, 10);

  await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      password: hash,
      role: "ADMIN",
    },
  });

  console.log("Admin ready");
}

main()
  .catch(console.error)
  .finally(async () => await db.$disconnect());
