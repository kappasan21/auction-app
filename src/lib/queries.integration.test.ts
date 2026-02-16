// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { createClient } from "@libsql/client";
import { randomUUID } from "crypto";
import { readFile } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import path from "node:path";

const dbFile = path.join(process.cwd(), "tmp", `test-${Date.now()}.db`);
const dbUrl = `file:${dbFile}`;

async function runMigrations(client: ReturnType<typeof createClient>) {
  const sql = await readFile(
    path.join(process.cwd(), "db", "migrations", "001_init.sql"),
    "utf8"
  );
  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await client.execute(statement);
  }
}

describe("auction queries (integration)", () => {
  beforeAll(async () => {
    mkdirSync(path.dirname(dbFile), { recursive: true });
    process.env.TURSO_DATABASE_URL = dbUrl;
    process.env.TURSO_AUTH_TOKEN = "";
    const client = createClient({ url: dbUrl });
    await runMigrations(client);
    await client.execute({
      sql: "INSERT INTO users (id, email, password_hash, is_admin, created_at) VALUES (?, ?, ?, ?, ?)",
      args: [
        "seller-1",
        "seller@example.com",
        "hashed",
        0,
        new Date().toISOString(),
      ],
    });
    await client.execute({
      sql: "INSERT INTO users (id, email, password_hash, is_admin, created_at) VALUES (?, ?, ?, ?, ?)",
      args: [
        "bidder-1",
        "bidder@example.com",
        "hashed",
        0,
        new Date().toISOString(),
      ],
    });
    await client.close();
  });

  it("creates an auction and places a bid", async () => {
    const {
      createAuction,
      getAuctionById,
      placeBid,
      getBidsForAuction,
      updateAuctionStatus,
    } = await import("./queries");

    const auctionId = await createAuction({
      sellerId: "seller-1",
      title: "Test Item",
      description: "Integration test item",
      category: "Electronics",
      startingPrice: 10000,
      imageUrl: "",
      startsAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 86400000).toISOString(),
    });

    await updateAuctionStatus({ auctionId, status: "active" });

    await placeBid({
      auctionId,
      bidderId: "bidder-1",
      amount: 12000,
    });

    const auction = await getAuctionById(auctionId);
    const bids = await getBidsForAuction(auctionId);

    expect(auction?.currentPrice).toBe(12000);
    expect(bids.length).toBe(1);
    expect(bids[0].amount).toBe(12000);
  });
});
