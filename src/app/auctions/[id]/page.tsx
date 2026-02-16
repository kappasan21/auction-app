import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "../auction.module.css";
import { getAuctionById, getBidsForAuction, placeBid } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";
import { bidSchema } from "@/lib/validation";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { getLocale, t } from "@/lib/i18n";

export default async function AuctionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  noStore();
  const locale = await getLocale();
  const { id } = await params;
  const auction = await getAuctionById(id);
  if (!auction) {
    redirect("/");
  }
  const bids = await getBidsForAuction(id);
  const user = await getSessionUser();
  const sp = await searchParams;

  async function handleBid(formData: FormData) {
    "use server";
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      redirect("/login");
    }
    const data = Object.fromEntries(formData.entries());
    const parsed = bidSchema.safeParse({
      amount: Number(data.amount) * 100,
    });
    if (!parsed.success) {
      redirect(`/auctions/${id}?error=Invalid%20bid`);
    }
    try {
      await placeBid({
        auctionId: id,
        bidderId: sessionUser.id,
        amount: parsed.data.amount,
      });
      redirect(`/auctions/${id}`);
    } catch (error) {
      redirect(`/auctions/${id}?error=${encodeURIComponent(String(error))}`);
    }
  }

  return (
    <div>
      <Header />
      <main className={`container ${styles.layout}`}>
        <section className={styles.hero}>
          <div className={styles.image}>
            {auction.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={auction.imageUrl} alt={auction.title} />
            ) : (
              <div className={styles.bidCard}>No image provided.</div>
            )}
          </div>
          <div className={styles.summary}>
            <span className="pill">{auction.status}</span>
            <h1>{auction.title}</h1>
            <p className="muted">{auction.description}</p>
            <div className={styles.stats}>
              <span>Seller: {auction.sellerEmail}</span>
              <span>Category: {auction.category ?? "General"}</span>
              <span>
                Current bid: ${(auction.currentPrice / 100).toFixed(2)}
              </span>
              <span>Ends: {new Date(auction.endAt).toLocaleString()}</span>
            </div>
            <div className={styles.bidCard}>
              <h3>{t(locale, "auction.detail.placeBid")}</h3>
              {!user ? (
                <p className="muted">
                  <a href="/login">{t(locale, "actions.signIn")}</a>{" "}
                  {t(locale, "auction.detail.signInToBid")}
                </p>
              ) : (
                <form action={handleBid} className={styles.bidForm}>
                  <input name="amount" type="number" min="1" required />
                  <button type="submit">Submit bid</button>
                </form>
              )}
              {sp.error ? <p className="muted">{sp.error}</p> : null}
            </div>
          </div>
        </section>

        <section className={styles.details}>
          <div>
            <h2>{t(locale, "auction.detail.bidHistory")}</h2>
            <p className="muted">{t(locale, "auction.detail.bidHistoryHelp")}</p>
          </div>
          <div className={styles.bids}>
            {bids.length === 0 ? (
              <p className="muted">{t(locale, "auction.detail.noBids")}</p>
            ) : (
              bids.map((bid) => (
                <div key={bid.id} className={styles.bidRow}>
                  <span>{bid.bidderEmail}</span>
                  <span>${(bid.amount / 100).toFixed(2)}</span>
                  <span>{new Date(bid.createdAt).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
