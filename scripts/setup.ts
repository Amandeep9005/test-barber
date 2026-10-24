import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: resolve(process.cwd(), ".env.local") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is missing. Add it to .env.local.");
  process.exit(1);
}

const sql = neon(databaseUrl);

function statements(filename: string): string[] {
  const raw = readFileSync(resolve(process.cwd(), filename), "utf8");
  return raw
    .split(";")
    .map((part) =>
      part
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter((part) => part.length > 0);
}

async function runFile(filename: string) {
  for (const statement of statements(filename)) {
    await sql.query(statement);
  }
  console.log(`Applied ${filename}`);
}

async function main() {
  await runFile("scripts/schema.sql");
  await runFile("scripts/seed.sql");
  console.log("Database is ready.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Database setup failed.";
  console.error(message.split("postgresql://")[0].trim() || "Database setup failed.");
  process.exit(1);
});
