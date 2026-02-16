import dotenv from "dotenv";
import { createClient } from "@libsql/client";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

dotenv.config({ path: ".env.local" });

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl) {
  throw new Error("TURSO_DATABASE_URL is not set");
}

const client = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

const migrationsDir = path.join(process.cwd(), "db", "migrations");

async function ensureMigrationsTable() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS __migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);
}

async function getAppliedMigrations() {
  const result = await client.execute("SELECT id FROM __migrations ORDER BY id");
  return new Set(result.rows.map((row) => String(row.id)));
}

async function applyMigration(id: string, sql: string) {
  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await client.execute(statement);
  }
  await client.execute({
    sql: "INSERT INTO __migrations (id, applied_at) VALUES (?, ?)",
    args: [id, new Date().toISOString()],
  });
  console.log(`Applied ${id}`);
}

async function run() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }
    const sql = await readFile(path.join(migrationsDir, file), "utf8");
    await applyMigration(file, sql);
  }

  console.log("Migrations complete");
}

run().finally(() => client.close());
