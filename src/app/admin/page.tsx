import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "../forms.module.css";
import { getSessionUser } from "@/lib/auth";
import { getAuctions, updateAuctionStatus } from "@/lib/queries";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { getLocale, t } from "@/lib/i18n";

export default async function AdminPage() {
  noStore();
  const locale = await getLocale();
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  const auctions = await getAuctions({ status: "pending" });

  async function handleApprove(formData: FormData) {
    "use server";
    const sessionUser = await getSessionUser();
    if (!sessionUser?.isAdmin) {
      redirect("/admin");
    }
    const auctionId = String(formData.get("auctionId"));
    await updateAuctionStatus({ auctionId, status: "active" });
    redirect("/admin");
  }

  async function handleReject(formData: FormData) {
    "use server";
    const sessionUser = await getSessionUser();
    if (!sessionUser?.isAdmin) {
      redirect("/admin");
    }
    const auctionId = String(formData.get("auctionId"));
    await updateAuctionStatus({ auctionId, status: "rejected" });
    redirect("/admin");
  }

  return (
    <div>
      <Header />
      <main className={`container ${styles.shell}`}>
        <div className={styles.card}>
          <div>
            <h1>{t(locale, "admin.title")}</h1>
            <p className="muted">{t(locale, "admin.body")}</p>
          </div>
          {!user.isAdmin ? (
            <div className={styles.alert}>
              {t(locale, "admin.noAdmin")}
            </div>
          ) : null}
          {auctions.length === 0 ? (
            <p className="muted">{t(locale, "admin.noPending")}</p>
          ) : (
            auctions.map((auction) => (
              <div key={auction.id} className={styles.alert}>
                <strong>{auction.title}</strong>
                <p className="muted">{auction.description}</p>
                <div className={styles.actions}>
                  <form action={handleApprove}>
                    <input type="hidden" name="auctionId" value={auction.id} />
                    <button className={styles.primary} type="submit">
                      Approve
                    </button>
                  </form>
                  <form action={handleReject}>
                    <input type="hidden" name="auctionId" value={auction.id} />
                    <button className={styles.secondary} type="submit">
                      Reject
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
