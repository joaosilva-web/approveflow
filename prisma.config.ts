import path from "node:path";
import { defineConfig } from "prisma/config";
import { config as loadDotenv } from "dotenv";

// Prisma CLI only auto-loads .env; load .env.local explicitly for Next.js compat
loadDotenv({ path: path.join(import.meta.dirname, ".env.local") });

// Prisma 7 config — connection URL moved out of schema.prisma
// DATABASE_URL  : used by Prisma Client and prisma migrate
// DIRECT_URL    : direct (non-pooled) connection for prisma migrate
export default defineConfig({
  schema: path.join(import.meta.dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
