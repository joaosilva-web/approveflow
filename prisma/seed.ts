/**
 * Prisma seed — inserts the billing plan rows.
 * Safe to run multiple times (upserts).
 *
 * Usage:  npm run db:seed
 */

import path from "node:path";
import { config as loadDotenv } from "dotenv";
// Load .env.local so DATABASE_URL is available outside Next.js
loadDotenv({ path: path.join(__dirname, "..", ".env.local") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: pool });

async function main() {
  const plans = [
    {
      code: "free",
      name: "Free",
      priceBrl: 0,
      interval: "monthly",
      maxProjects: 3,
      active: true,
    },
    {
      code: "pro",
      name: "Pro",
      priceBrl: 29.9,
      interval: "monthly",
      maxProjects: null,
      active: true,
    },
    {
      code: "studio",
      name: "Studio",
      priceBrl: 59.9,
      interval: "monthly",
      maxProjects: null,
      active: true,
    },
    {
      code: "test",
      name: "Test (R$1,00)",
      priceBrl: 1.0,
      interval: "monthly",
      maxProjects: null,
      active: true,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        priceBrl: plan.priceBrl,
        maxProjects: plan.maxProjects,
        active: plan.active,
      },
      create: plan,
    });
    console.log(`✓ Plan upserted: ${plan.code}`);
  }

  console.log("\n✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
