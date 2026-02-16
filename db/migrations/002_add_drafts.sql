PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS auction_drafts (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  starting_price INTEGER NOT NULL,
  image_url TEXT,
  starts_at TEXT NOT NULL,
  end_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_drafts_seller ON auction_drafts(seller_id);
