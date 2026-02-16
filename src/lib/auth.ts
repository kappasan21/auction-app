import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";
import { randomUUID } from "crypto";

const SESSION_COOKIE = "auction_session";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const id = randomUUID();
  const now = new Date();
  const expires = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);
  await db.execute({
    sql: "INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
    args: [id, userId, now.toISOString(), expires.toISOString()],
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await db.execute({
      sql: "DELETE FROM sessions WHERE id = ?",
      args: [sessionId],
    });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const result = await db.execute({
    sql: `SELECT users.id, users.email, users.is_admin
          FROM sessions
          JOIN users ON users.id = sessions.user_id
          WHERE sessions.id = ? AND sessions.expires_at > ?`,
    args: [sessionId, new Date().toISOString()],
  });
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: String(row.id),
    email: String(row.email),
    isAdmin: Number(row.is_admin) === 1,
  };
}
