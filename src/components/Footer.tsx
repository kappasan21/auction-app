import Link from "next/link";
import styles from "./Layout.module.css";
import { getLocale, t } from "@/lib/i18n";

export default async function Footer() {
  const locale = await getLocale();
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerInner}`}>
        <div>
          <h3>Auction House</h3>
          <p className="muted">
            {t(locale, "footer.tagline")}
          </p>
        </div>
        <div className={styles.footerLinks}>
          <div>
            <h4>{t(locale, "footer.marketplace")}</h4>
            <Link href="/">{t(locale, "footer.browse")}</Link>
            <Link href="/auctions/new">{t(locale, "footer.sell")}</Link>
            <Link href="/admin">{t(locale, "footer.admin")}</Link>
          </div>
          <div>
            <h4>{t(locale, "footer.account")}</h4>
            <Link href="/login">{t(locale, "actions.signIn")}</Link>
            <Link href="/register">{t(locale, "auth.createAccount")}</Link>
          </div>
          <div>
            <h4>{t(locale, "footer.support")}</h4>
            <span className="muted">support@auctionhouse.dev</span>
            <span className="muted">+1 (555) 236-1130</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
