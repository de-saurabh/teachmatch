import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  // Migrate CLI connection — runtime queries use the pg adapter
  // configured on PrismaClient instead, see src/config/db.ts.
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
