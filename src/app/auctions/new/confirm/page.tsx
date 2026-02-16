import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "../../../forms.module.css";
import { getSessionUser } from "@/lib/auth";
import {
  createAuction,
  deleteAuctionDraft,
  getAuctionDraft,
} from "@/lib/queries";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { getLocale, t } from "@/lib/i18n";

export default async function ConfirmAuctionPage({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string }>;
}) {
  noStore();
  const locale = await getLocale();
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  const params = await searchParams;
  const draftId = params.draft;
  if (!draftId) {
    redirect("/auctions/new");
  }
  const draft = await getAuctionDraft(draftId, user.id);
  if (!draft) {
    redirect("/auctions/new?error=Draft%20not%20found");
  }

  async function handleSubmit() {
    "use server";
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      redirect("/login");
    }
    const currentDraft = await getAuctionDraft(draftId, sessionUser.id);
    if (!currentDraft) {
      redirect("/auctions/new?error=Draft%20not%20found");
    }
    await createAuction({
      sellerId: sessionUser.id,
      title: currentDraft.title,
      description: currentDraft.description,
      category: currentDraft.category ?? undefined,
      startingPrice: currentDraft.startingPrice,
      imageUrl: currentDraft.imageUrl ?? undefined,
      startsAt: currentDraft.startsAt,
      endAt: currentDraft.endAt,
    });
    await deleteAuctionDraft(draftId, sessionUser.id);
    redirect("/?status=pending");
  }

  async function handleCancel() {
    "use server";
    const sessionUser = await getSessionUser();
    if (sessionUser) {
      await deleteAuctionDraft(draftId, sessionUser.id);
    }
    redirect("/auctions/new");
  }

  return (
    <div>
      <Header />
      <main className={`container ${styles.shell}`}>
        <div className={styles.card}>
          <div>
            <h1>{t(locale, "auction.confirm.title")}</h1>
            <p className="muted">{t(locale, "auction.confirm.body")}</p>
          </div>

          {draft.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.imageUrl} alt={draft.title} />
          ) : null}

          <div className={styles.row}>
            <label>{t(locale, "label.title")}</label>
            <div>{draft.title}</div>
          </div>
          <div className={styles.row}>
            <label>{t(locale, "label.description")}</label>
            <div>{draft.description}</div>
          </div>
          <div className={styles.row}>
            <label>{t(locale, "label.category")}</label>
            <div>{draft.category ?? "General"}</div>
          </div>
          <div className={styles.row}>
            <label>{t(locale, "label.startingPrice")}</label>
            <div>${(draft.startingPrice / 100).toFixed(2)}</div>
          </div>
          <div className={styles.row}>
            <label>{t(locale, "label.startsAt")}</label>
            <div>{new Date(draft.startsAt).toLocaleString()}</div>
          </div>
          <div className={styles.row}>
            <label>{t(locale, "label.endsAt")}</label>
            <div>{new Date(draft.endAt).toLocaleString()}</div>
          </div>

          <div className={styles.actions}>
            <form action={handleSubmit}>
              <button className={styles.primary} type="submit">
                {t(locale, "auction.confirm.submit")}
              </button>
            </form>
            <form action={handleCancel}>
              <button className={styles.secondary} type="submit">
                {t(locale, "auction.confirm.cancel")}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
