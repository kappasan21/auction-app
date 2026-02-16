import dotenv from "dotenv";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto";

dotenv.config({ path: ".env.local" });

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl) {
  throw new Error("TURSO_DATABASE_URL is not set");
}

const db = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

type CategorySeed = {
  category: string;
  titles: string[];
  commonsCategory: string;
};

const categories: CategorySeed[] = [
  {
    category: "Collectibles",
    commonsCategory: "Category:Collecting",
    titles: [
      "Vintage Enamel Pin Set",
      "Signed Vinyl Record Lot",
      "Limited Edition Comic Bundle",
      "Collector's Dice Tray",
    ],
  },
  {
    category: "Design",
    commonsCategory: "Category:Industrial_design",
    titles: [
      "Studio Desk Lamp, 1960",
      "Modernist Ceramic Pitcher",
      "Minimalist Wall Clock",
      "Bentwood Lounge Chair",
    ],
  },
  {
    category: "Tech",
    commonsCategory: "Category:Technology",
    titles: [
      "Compact Robotics Kit",
      "Modular IoT Sensor Pack",
      "Precision Smart Caliper",
      "Prototyping Breadboard Set",
    ],
  },
  {
    category: "Art",
    commonsCategory: "Category:Art",
    titles: [
      "Contemporary Canvas Study",
      "Abstract Textile Panel",
      "Monochrome Ink Series",
      "Mixed Media Wall Relief",
    ],
  },
  {
    category: "Home",
    commonsCategory: "Category:Home_appliances",
    titles: [
      "Mid-century Tea Kettle",
      "Glass Carafe Set",
      "Compact Espresso Machine",
      "Sculpted Table Fan",
    ],
  },
  {
    category: "Hobby",
    commonsCategory: "Category:Hobbies",
    titles: [
      "Model Building Starter Kit",
      "Precision Hobby Tool Set",
      "Collector's Display Case",
      "Weekend Craft Bundle",
    ],
  },
  {
    category: "Electronics",
    commonsCategory: "Category:Electronic_devices",
    titles: [
      "Vintage Hi-Fi Receiver",
      "Portable Analog Synthesizer",
      "Compact Studio Monitor Pair",
      "Retro Cassette Deck",
    ],
  },
  {
    category: "Car Parts",
    commonsCategory: "Category:Automobile_parts",
    titles: [
      "Performance Brake Calipers",
      "Carbon Fiber Spoiler",
      "Classic Steering Wheel",
    ],
  },
  {
    category: "RC Cars",
    commonsCategory: "Category:Radio_controlled_model_cars",
    titles: [
      "All-Terrain RC Buggy",
      "Vintage RC Rally Car",
      "Brushless Drift RC Kit",
    ],
  },
];

async function fetchCommonsImages(
  commonsCategory: string,
  count: number
): Promise<string[]> {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("generator", "categorymembers");
  url.searchParams.set("gcmtitle", commonsCategory);
  url.searchParams.set("gcmtype", "file");
  url.searchParams.set("gcmlimit", "50");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch images for ${commonsCategory}`);
  }
  const data = (await response.json()) as {
    query?: {
      pages?: Record<
        string,
        {
          imageinfo?: Array<{ url: string }>;
        }
      >;
    };
  };

  const urls =
    data.query?.pages &&
    Object.values(data.query.pages)
      .flatMap((page) => page.imageinfo ?? [])
      .map((info) => info.url)
      .filter((link) =>
        [".jpg", ".jpeg", ".png", ".webp"].some((ext) =>
          link.toLowerCase().includes(ext)
        )
      );

  if (!urls || urls.length === 0) {
    throw new Error(`No image URLs found for ${commonsCategory}`);
  }
  return urls.slice(0, count);
}

function cents(min: number, max: number) {
  return Math.floor((Math.random() * (max - min) + min) * 100);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

async function ensureSeedUser() {
  const existing = await db.execute(
    "SELECT id FROM users ORDER BY created_at ASC LIMIT 1"
  );
  if (existing.rows.length) {
    return String(existing.rows[0].id);
  }
  const id = randomUUID();
  const password = await bcrypt.hash("Password123!", 10);
  await db.execute({
    sql: "INSERT INTO users (id, email, password_hash, is_admin, created_at) VALUES (?, ?, ?, ?, ?)",
    args: [id, "seed@auctionhouse.dev", password, 1, new Date().toISOString()],
  });
  return id;
}

async function ensureBidderUser() {
  const existing = await db.execute(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    ["bidder@auctionhouse.dev"]
  );
  if (existing.rows.length) {
    return String(existing.rows[0].id);
  }
  const id = randomUUID();
  const password = await bcrypt.hash("Password123!", 10);
  await db.execute({
    sql: "INSERT INTO users (id, email, password_hash, is_admin, created_at) VALUES (?, ?, ?, ?, ?)",
    args: [id, "bidder@auctionhouse.dev", password, 0, new Date().toISOString()],
  });
  return id;
}

async function seed() {
  if (process.env.RESEED === "1") {
    await db.execute("DELETE FROM bids");
    await db.execute("DELETE FROM auctions");
  } else {
    const existing = await db.execute("SELECT COUNT(*) as count FROM auctions");
    if (Number(existing.rows[0]?.count ?? 0) >= 30) {
      console.log("Already have 30+ auctions, skipping seed.");
      return;
    }
  }

  const sellerId = await ensureSeedUser();
  const bidderId = await ensureBidderUser();

  const imagesByCategory = new Map<string, string[]>();
  for (const category of categories) {
    const images = await fetchCommonsImages(
      category.commonsCategory,
      category.titles.length
    );
    imagesByCategory.set(category.category, images);
  }

  const now = new Date();
  const auctions: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    startingPrice: number;
    currentPrice: number;
    status: "active" | "pending" | "closed";
    imageUrl: string;
    startsAt: string;
    endAt: string;
  }> = [];

  categories.forEach((category, index) => {
    const images = imagesByCategory.get(category.category) ?? [];
    category.titles.forEach((title, titleIndex) => {
      const price = cents(25, 520);
      const bump = cents(5, 160);
      const status =
        auctions.length < 22
          ? "active"
          : auctions.length < 26
            ? "pending"
            : "closed";
      const startsAt =
        status === "closed"
          ? addDays(now, -7).toISOString()
          : addDays(now, -1).toISOString();
      const endAt =
        status === "closed"
          ? addDays(now, -1).toISOString()
          : status === "pending"
            ? addDays(now, 7).toISOString()
            : addDays(now, 3 + ((index + titleIndex) % 4)).toISOString();

      auctions.push({
        id: randomUUID(),
        title,
        description: `Curated ${category.category.toLowerCase()} piece with verified condition and provenance.`,
        category: category.category,
        startingPrice: price,
        currentPrice: price + bump,
        status,
        imageUrl: images[titleIndex % images.length],
        startsAt,
        endAt,
      });
    });
  });

  for (const auction of auctions) {
    await db.execute({
      sql: `INSERT INTO auctions
            (id, seller_id, title, description, category, starting_price, current_price, status, image_url, starts_at, end_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        auction.id,
        sellerId,
        auction.title,
        auction.description,
        auction.category,
        auction.startingPrice,
        auction.currentPrice,
        auction.status,
        auction.imageUrl,
        auction.startsAt,
        auction.endAt,
        new Date().toISOString(),
      ],
    });
  }

  for (const auction of auctions.slice(0, 12)) {
    const bidCount = 2 + Math.floor(Math.random() * 4);
    let amount = auction.startingPrice;
    for (let i = 0; i < bidCount; i += 1) {
      amount += cents(5, 80);
      await db.execute({
        sql: `INSERT INTO bids (id, auction_id, bidder_id, amount, created_at)
              VALUES (?, ?, ?, ?, ?)`,
        args: [
          randomUUID(),
          auction.id,
          bidderId,
          amount,
          new Date(Date.now() - i * 3600_000).toISOString(),
        ],
      });
      await db.execute({
        sql: "UPDATE auctions SET current_price = ? WHERE id = ?",
        args: [amount, auction.id],
      });
    }
  }

  console.log(`Seeded ${auctions.length} auctions.`);
}

seed().finally(() => db.close());
