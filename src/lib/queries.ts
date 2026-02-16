import { db } from "./db";
import { randomUUID } from "crypto";

export async function getAuctions({
  query,
  category,
  status,
}: {
  query?: string;
  category?: string;
  status?: string;
}) {
  const where: string[] = [];
  const args: Array<string> = [];

  if (query) {
    where.push("(title LIKE ? OR description LIKE ?)");
    args.push(`%${query}%`, `%${query}%`);
  }
  if (category) {
    where.push("category = ?");
    args.push(category);
  }
  if (status) {
    where.push("status = ?");
    args.push(status);
  }

  const sql = `
    SELECT id, title, description, category, current_price, status, image_url, end_at
    FROM auctions
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY datetime(end_at) ASC
    LIMIT 50
  `;

  const result = await db.execute({ sql, args });
  return result.rows.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    category: row.category ? String(row.category) : null,
    currentPrice: Number(row.current_price),
    status: String(row.status),
    imageUrl: row.image_url ? String(row.image_url) : null,
    endAt: String(row.end_at),
  }));
}

export async function getFeaturedAuction() {
  const preferred = await db.execute({
    sql: `SELECT id, title, description, category, current_price, status, image_url, end_at
          FROM auctions
          WHERE title = ? AND status = 'active'
          LIMIT 1`,
    args: ["Studio Desk Lamp, 1960"],
  });
  const row = preferred.rows[0];
  if (row) {
    return {
      id: String(row.id),
      title: String(row.title),
      description: String(row.description),
      category: row.category ? String(row.category) : null,
      currentPrice: Number(row.current_price),
      status: String(row.status),
      imageUrl: row.image_url ? String(row.image_url) : null,
      endAt: String(row.end_at),
    };
  }

  const fallback = await db.execute({
    sql: `SELECT id, title, description, category, current_price, status, image_url, end_at
          FROM auctions
          WHERE status = 'active'
          ORDER BY datetime(end_at) ASC
          LIMIT 1`,
  });
  const fallbackRow = fallback.rows[0];
  if (!fallbackRow) return null;
  return {
    id: String(fallbackRow.id),
    title: String(fallbackRow.title),
    description: String(fallbackRow.description),
    category: fallbackRow.category ? String(fallbackRow.category) : null,
    currentPrice: Number(fallbackRow.current_price),
    status: String(fallbackRow.status),
    imageUrl: fallbackRow.image_url ? String(fallbackRow.image_url) : null,
    endAt: String(fallbackRow.end_at),
  };
}

export async function getAuctionById(id: string) {
  const result = await db.execute({
    sql: `SELECT auctions.*, users.email as seller_email
          FROM auctions
          JOIN users ON users.id = auctions.seller_id
          WHERE auctions.id = ?`,
    args: [id],
  });
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    sellerId: String(row.seller_id),
    sellerEmail: String(row.seller_email),
    title: String(row.title),
    description: String(row.description),
    category: row.category ? String(row.category) : null,
    startingPrice: Number(row.starting_price),
    currentPrice: Number(row.current_price),
    status: String(row.status),
    imageUrl: row.image_url ? String(row.image_url) : null,
    startsAt: String(row.starts_at),
    endAt: String(row.end_at),
    createdAt: String(row.created_at),
  };
}

export async function getBidsForAuction(auctionId: string) {
  const result = await db.execute({
    sql: `SELECT bids.*, users.email as bidder_email
          FROM bids
          JOIN users ON users.id = bids.bidder_id
          WHERE bids.auction_id = ?
          ORDER BY datetime(bids.created_at) DESC`,
    args: [auctionId],
  });
  return result.rows.map((row) => ({
    id: String(row.id),
    auctionId: String(row.auction_id),
    bidderEmail: String(row.bidder_email),
    amount: Number(row.amount),
    createdAt: String(row.created_at),
  }));
}

export async function createAuction({
  sellerId,
  title,
  description,
  category,
  startingPrice,
  imageUrl,
  startsAt,
  endAt,
}: {
  sellerId: string;
  title: string;
  description: string;
  category?: string;
  startingPrice: number;
  imageUrl?: string;
  startsAt: string;
  endAt: string;
}) {
  const id = randomUUID();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO auctions
          (id, seller_id, title, description, category, starting_price, current_price, status, image_url, starts_at, end_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
    args: [
      id,
      sellerId,
      title,
      description,
      category ?? null,
      startingPrice,
      startingPrice,
      imageUrl ?? null,
      startsAt,
      endAt,
      now,
    ],
  });
  return id;
}

export async function createAuctionDraft({
  sellerId,
  title,
  description,
  category,
  startingPrice,
  imageUrl,
  startsAt,
  endAt,
}: {
  sellerId: string;
  title: string;
  description: string;
  category?: string;
  startingPrice: number;
  imageUrl?: string;
  startsAt: string;
  endAt: string;
}) {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO auction_drafts
          (id, seller_id, title, description, category, starting_price, image_url, starts_at, end_at, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      sellerId,
      title,
      description,
      category ?? null,
      startingPrice,
      imageUrl ?? null,
      startsAt,
      endAt,
      new Date().toISOString(),
    ],
  });
  return id;
}

export async function getAuctionDraft(id: string, sellerId: string) {
  const result = await db.execute({
    sql: `SELECT * FROM auction_drafts WHERE id = ? AND seller_id = ?`,
    args: [id, sellerId],
  });
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    sellerId: String(row.seller_id),
    title: String(row.title),
    description: String(row.description),
    category: row.category ? String(row.category) : null,
    startingPrice: Number(row.starting_price),
    imageUrl: row.image_url ? String(row.image_url) : null,
    startsAt: String(row.starts_at),
    endAt: String(row.end_at),
    createdAt: String(row.created_at),
  };
}

export async function deleteAuctionDraft(id: string, sellerId: string) {
  await db.execute({
    sql: "DELETE FROM auction_drafts WHERE id = ? AND seller_id = ?",
    args: [id, sellerId],
  });
}

export async function placeBid({
  auctionId,
  bidderId,
  amount,
}: {
  auctionId: string;
  bidderId: string;
  amount: number;
}) {
  const auction = await getAuctionById(auctionId);
  if (!auction) {
    throw new Error("Auction not found");
  }
  if (auction.status !== "active") {
    throw new Error("Auction is not active");
  }
  if (amount <= auction.currentPrice) {
    throw new Error("Bid must be higher than current price");
  }

  const bidId = randomUUID();
  await db.execute({
    sql: `INSERT INTO bids (id, auction_id, bidder_id, amount, created_at)
          VALUES (?, ?, ?, ?, ?)`,
    args: [bidId, auctionId, bidderId, amount, new Date().toISOString()],
  });
  await db.execute({
    sql: "UPDATE auctions SET current_price = ? WHERE id = ?",
    args: [amount, auctionId],
  });
}

export async function updateAuctionStatus({
  auctionId,
  status,
}: {
  auctionId: string;
  status: "active" | "closed" | "rejected";
}) {
  await db.execute({
    sql: "UPDATE auctions SET status = ? WHERE id = ?",
    args: [status, auctionId],
  });
}
