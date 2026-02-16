import Link from "next/link";
import styles from "./Layout.module.css";
import { getSessionUser } from "@/lib/auth";
import { unstable_noStore as noStore } from "next/cache";
import SignOutButton from "./SignOutButton";
import LanguageToggle from "./LanguageToggle";
import { getLocale, t } from "@/lib/i18n";

export default async function Header() {
  noStore();
  const user = await getSessionUser();
  const locale = await getLocale();
  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            Auction House
          </Link>
          <span className="pill">{t(locale, "section.liveAuctions")}</span>
        </div>

        <form action="/" className={styles.search}>
          <input
            name="query"
            placeholder={t(locale, "search.placeholder")}
          />
          <button type="submit">{t(locale, "actions.search")}</button>
        </form>

        <div className={styles.actions}>
          <Link href="/auctions/new" className={styles.primaryBtn}>
            {t(locale, "actions.createAuction")}
          </Link>
          {user ? (
            <SignOutButton
              label={t(locale, "actions.signOut")}
              loadingLabel={t(locale, "actions.signingOut")}
            />
          ) : (
            <Link href="/login" className={styles.ghostBtn}>
              {t(locale, "actions.signIn")}
            </Link>
          )}
        </div>
      </div>
      <div className={styles.navStrip}>
        <div className={`container ${styles.navInner}`}>
          <div className={styles.navLinks}>
            <Link href="/?category=Collectibles">
              {t(locale, "nav.collectibles")}
            </Link>
            <Link href="/?category=Design">{t(locale, "nav.design")}</Link>
            <Link href="/?category=Tech">{t(locale, "nav.tech")}</Link>
            <Link href="/?category=Art">{t(locale, "nav.art")}</Link>
            <Link href="/?category=Home">{t(locale, "nav.home")}</Link>
            <Link href="/?category=Hobby">{t(locale, "nav.hobby")}</Link>
          </div>
          <div className={styles.navUser}>
            <LanguageToggle locale={locale} />
            <span>
              {user
                ? `${t(locale, "nav.user.signedInAs")} ${user.email}`
                : t(locale, "nav.user.guest")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
