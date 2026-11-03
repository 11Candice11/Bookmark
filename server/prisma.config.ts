import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// The single .env lives in the repo root, one level above server/.
config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
