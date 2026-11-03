import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { z } from "zod";

// The single .env lives in the repo root, three levels above this file.
config({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(4000),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  EMAIL_FROM: z.string().min(1),
  CLIENT_ORIGIN: z.url(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
  console.error(`Invalid environment variables (check the repo-root .env):\n${problems}`);
  process.exit(1);
}

export const env = parsed.data;
