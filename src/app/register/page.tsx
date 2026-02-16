import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "../forms.module.css";
import { registerSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { createSession, getSessionUser, hashPassword } from "@/lib/auth";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { randomUUID } from "crypto";
import { getLocale, t } from "@/lib/i18n";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  noStore();
  const locale = await getLocale();
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    redirect("/");
  }
  const params = await searchParams;

  async function handleRegister(formData: FormData) {
    "use server";
    const data = Object.fromEntries(formData.entries());
    const parsed = registerSchema.safeParse({
      email: data.email,
      password: data.password,
    });
    if (!parsed.success) {
      redirect("/register?error=Invalid%20details");
    }
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [parsed.data.email],
    });
    if (existing.rows.length) {
      redirect("/register?error=Email%20already%20exists");
    }
    const count = await db.execute("SELECT COUNT(*) as count FROM users");
    const isAdmin = Number(count.rows[0]?.count ?? 0) === 0 ? 1 : 0;
    const userId = randomUUID();
    await db.execute({
      sql: "INSERT INTO users (id, email, password_hash, is_admin, created_at) VALUES (?, ?, ?, ?, ?)",
      args: [
        userId,
        parsed.data.email,
        await hashPassword(parsed.data.password),
        isAdmin,
        new Date().toISOString(),
      ],
    });
    await createSession(userId);
    redirect("/");
  }

  return (
    <div>
      <Header />
      <main className={`container ${styles.shell}`}>
        <div className={styles.card}>
          <div>
            <h1>{t(locale, "auth.createAccount")}</h1>
            <p className="muted">{t(locale, "auth.createAccountBody")}</p>
          </div>
          {params.error ? (
            <div className={styles.alert}>{params.error}</div>
          ) : null}
          <form action={handleRegister} className={styles.form}>
            <div className={styles.row}>
              <label>{t(locale, "label.email")}</label>
              <input name="email" type="email" required />
            </div>
            <div className={styles.row}>
              <label>{t(locale, "label.password")}</label>
              <input name="password" type="password" required />
            </div>
            <p className={styles.note}>
              {t(locale, "auth.passwordNote")}
            </p>
            <div className={styles.actions}>
              <button type="submit" className={styles.primary}>
                {t(locale, "auth.createCta")}
              </button>
              <a href="/login" className={styles.secondary}>
                {t(locale, "auth.alreadyHave")}
              </a>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
