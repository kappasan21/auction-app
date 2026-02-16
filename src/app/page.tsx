import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuctionCard from "@/components/AuctionCard";
import styles from "./page.module.css";
import { getAuctions, getFeaturedAuction } from "@/lib/queries";
import { unstable_noStore as noStore } from "next/cache";
import { getLocale, t } from "@/lib/i18n";

type SearchParams = {
  query?: string;
  category?: string;
  status?: string;
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  noStore();
  const params = await searchParams;
  const selectedStatus =
    params.status === "pending" || params.status === "closed"
      ? params.status
      : "active";
  const locale = await getLocale();
  const auctions = await getAuctions({
    query: params.query,
    category: params.category,
    status: selectedStatus,
  });
  const featured = await getFeaturedAuction();
  const statusQuery = (status: "active" | "pending" | "closed") => {
    const query = new URLSearchParams({ status });
    if (params.query) {
      query.set("query", params.query);
    }
    if (params.category) {
      query.set("category", params.category);
    }
    return `/?${query.toString()}`;
  };

  return (
    <div className={styles.page}>
      <Header
        currentQuery={params.query}
        currentCategory={params.category}
        currentStatus={selectedStatus}
      />
      <main className={`container ${styles.main}`}>
        <section className={styles.hero}>
          <div>
            <p className="pill">{t(locale, "hero.badge")}</p>
            <h1>{t(locale, "hero.title")}</h1>
            <p className="muted">{t(locale, "hero.body")}</p>
          </div>
          <div className={styles.heroCard}>
            {featured ? (
              <a href={`/auctions/${featured.id}`} className={styles.heroLink}>
                <div className={styles.heroImage}>
                  {featured.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={featured.imageUrl} alt={featured.title} />
                  ) : (
                    <div className={styles.heroImageFallback}>No image</div>
                  )}
                </div>
                <div className={styles.heroInfo}>
                  <span className="muted">{t(locale, "featured.endingSoon")}</span>
                  <h2>{featured.title}</h2>
                  <p className="muted">
                    Current bid ${(featured.currentPrice / 100).toFixed(2)} ·
                    Ends {new Date(featured.endAt).toLocaleDateString()}
                  </p>
                </div>
              </a>
            ) : (
              <div>
                <span className="muted">{t(locale, "featured.endingSoon")}</span>
                <h2>{t(locale, "featured.fallbackTitle")}</h2>
                <p className="muted">{t(locale, "featured.fallbackBody")}</p>
              </div>
            )}
          </div>
        </section>

        <section className={styles.sectionHeader}>
          <div>
            <h2>
              {selectedStatus === "active"
                ? t(locale, "section.liveAuctions")
                : t(locale, `section.filters.${selectedStatus}`)}
            </h2>
            <p className="muted">{t(locale, "section.liveAuctionsHelp")}</p>
          </div>
          <div className={styles.filters}>
            <a href={statusQuery("active")}>{t(locale, "section.filters.active")}</a>
            <a href={statusQuery("pending")}>{t(locale, "section.filters.pending")}</a>
            <a href={statusQuery("closed")}>{t(locale, "section.filters.closed")}</a>
          </div>
        </section>

        {auctions.length === 0 ? (
          <div className={styles.empty}>
            <h3>No auctions yet</h3>
            <p className="muted">
              Create the first listing and kick off the bidding.
            </p>
          </div>
        ) : (
          <section className={styles.grid}>
            {auctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
