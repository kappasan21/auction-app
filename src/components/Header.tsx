import Link from "next/link";
import styles from "./Layout.module.css";
import { getSessionUser } from "@/lib/auth";
import { unstable_noStore as noStore } from "next/cache";
import SignOutButton from "./SignOutButton";
import LanguageToggle from "./LanguageToggle";
import { getLocale, t } from "@/lib/i18n";

type HeaderProps = {
  currentQuery?: string;
  currentCategory?: string;
  currentStatus?: string;
};

export default async function Header({
  currentQuery,
  currentCategory,
  currentStatus,
}: HeaderProps) {
  noStore();
  const user = await getSessionUser();
  const locale = await getLocale();
  const selectedStatus =
    currentStatus === "pending" || currentStatus === "closed"
      ? currentStatus
      : "active";
  const statusFilters = [
    { value: "active", label: t(locale, "section.filters.active") },
    { value: "pending", label: t(locale, "section.filters.pending") },
    { value: "closed", label: t(locale, "section.filters.closed") },
  ];
  const categoryHref = (category: string) =>
    `/?${new URLSearchParams({ category, status: selectedStatus }).toString()}`;

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            Auction House
          </Link>
          <div className={styles.statusTabs}>
            {statusFilters.map((statusFilter) => (
              <Link
                key={statusFilter.value}
                href={`/?status=${statusFilter.value}`}
                className={
                  selectedStatus === statusFilter.value
                    ? styles.statusTabActive
                    : styles.statusTab
                }
              >
                {statusFilter.label}
              </Link>
            ))}
          </div>
        </div>

        <form action="/" className={styles.search}>
          <input type="hidden" name="status" value={selectedStatus} />
          {currentCategory ? (
            <input type="hidden" name="category" value={currentCategory} />
          ) : null}
          <input
            name="query"
            defaultValue={currentQuery ?? ""}
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
            <Link href={categoryHref("Collectibles")}>
              {t(locale, "nav.collectibles")}
            </Link>
            <Link href={categoryHref("Design")}>{t(locale, "nav.design")}</Link>
            <Link href={categoryHref("Tech")}>{t(locale, "nav.tech")}</Link>
            <Link href={categoryHref("Art")}>{t(locale, "nav.art")}</Link>
            <Link href={categoryHref("Home")}>{t(locale, "nav.home")}</Link>
            <Link href={categoryHref("Hobby")}>{t(locale, "nav.hobby")}</Link>
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
