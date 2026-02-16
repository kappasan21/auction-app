import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "../forms.module.css";
import { loginSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { createSession, getSessionUser, verifyPassword } from "@/lib/auth";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { getLocale, t } from "@/lib/i18n";

export default async function LoginPage({
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

  async function handleLogin(formData: FormData) {
    "use server";
    const data = Object.fromEntries(formData.entries());
    const parsed = loginSchema.safeParse({
      email: data.email,
      password: data.password,
    });
    if (!parsed.success) {
      redirect("/login?error=Invalid%20credentials");
    }
    const result = await db.execute({
      sql: "SELECT id, password_hash FROM users WHERE email = ?",
      args: [parsed.data.email],
    });
    const row = result.rows[0];
    if (!row) {
      redirect("/login?error=Invalid%20credentials");
    }
    const ok = await verifyPassword(
      parsed.data.password,
      String(row.password_hash)
    );
    if (!ok) {
      redirect("/login?error=Invalid%20credentials");
    }
    await createSession(String(row.id));
    redirect("/");
  }

  return (
    <div>
      <Header />
      <main className={`container ${styles.shell}`}>
        <div className={styles.card}>
          <div>
            <h1>{t(locale, "auth.welcome")}</h1>
            <p className="muted">{t(locale, "auth.welcomeBody")}</p>
          </div>
          {params.error ? (
            <div className={styles.alert}>{params.error}</div>
          ) : null}
          <form action={handleLogin} className={styles.form}>
            <div className={styles.row}>
              <label>{t(locale, "label.email")}</label>
              <input name="email" type="email" required />
            </div>
            <div className={styles.row}>
              <label>{t(locale, "label.password")}</label>
              <input name="password" type="password" required />
            </div>
            <div className={styles.actions}>
              <button type="submit" className={styles.primary}>
                {t(locale, "auth.signInCta")}
              </button>
              <a href="/register" className={styles.secondary}>
                {t(locale, "auth.createAccount")}
              </a>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
