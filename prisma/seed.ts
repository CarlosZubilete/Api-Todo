// This only execute onces in production.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const db = new PrismaClient();

async function main() {
  const adminEmail: string = process.env.ADMIN_EMAIL!;
  const adminPass: string = process.env.ADMIN_PASS!;

  const hash = await bcrypt.hash(adminPass, 10);

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
