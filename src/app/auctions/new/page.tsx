import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "../../forms.module.css";
import { auctionSchema } from "@/lib/validation";
import { createAuctionDraft } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { getLocale, t } from "@/lib/i18n";

export default async function NewAuctionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  noStore();
  const locale = await getLocale();
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  const params = await searchParams;
  const fieldErrors = params.error
    ? (() => {
        try {
          return JSON.parse(decodeURIComponent(params.error)) as Record<
            string,
            string[]
          >;
        } catch {
          return null;
        }
      })()
    : null;

  async function handleCreate(formData: FormData) {
    "use server";
    const data = Object.fromEntries(formData.entries());
    const parsed = auctionSchema.safeParse({
      title: data.title,
      description: data.description,
      category: data.category,
      startingPrice: Number(data.startingPrice) * 100,
      startsAt: data.startsAt,
      endAt: data.endAt,
    });
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      redirect(`/auctions/new?error=${encodeURIComponent(JSON.stringify(errors))}`);
    }

    let imageUrl: string | undefined;
    const file = formData.get("imageFile");
    if (file instanceof File && file.size > 0) {
      const allowed = [".jpg", ".jpeg", ".png", ".webp"];
      const ext = path.extname(file.name).toLowerCase();
      if (!allowed.includes(ext)) {
        const errors = { imageFile: ["Unsupported image type."] };
        redirect(
          `/auctions/new?error=${encodeURIComponent(JSON.stringify(errors))}`
        );
      }
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });
      const filename = `${crypto.randomUUID()}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(uploadsDir, filename), buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const draftId = await createAuctionDraft({
      sellerId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      startingPrice: parsed.data.startingPrice,
      imageUrl,
      startsAt: parsed.data.startsAt,
      endAt: parsed.data.endAt,
    });
    redirect(`/auctions/new/confirm?draft=${draftId}`);
  }

  return (
    <div>
      <Header />
      <main className={`container ${styles.shell}`}>
        <div className={styles.card}>
          <div>
            <h1>{t(locale, "auction.new.title")}</h1>
            <p className="muted">{t(locale, "auction.new.body")}</p>
          </div>
          {params.error ? (
            <div className={styles.alert}>Please fix the errors below.</div>
          ) : null}
          <form action={handleCreate} className={styles.form}>
            <div className={styles.row}>
              <label>{t(locale, "label.title")}</label>
              <input name="title" required />
              {fieldErrors?.title?.[0] ? (
                <span className={styles.fieldError}>{fieldErrors.title[0]}</span>
              ) : null}
            </div>
            <div className={styles.row}>
              <label>{t(locale, "label.description")}</label>
              <textarea name="description" rows={5} required />
              {fieldErrors?.description?.[0] ? (
                <span className={styles.fieldError}>
                  {fieldErrors.description[0]}
                </span>
              ) : null}
            </div>
            <div className={styles.row}>
              <label>{t(locale, "label.category")}</label>
              <select name="category" defaultValue="">
                <option value="">Select a category</option>
                <option value="Collectibles">Collectibles</option>
                <option value="Design">Design</option>
                <option value="Tech">Tech</option>
                <option value="Art">Art</option>
                <option value="Home">Home</option>
                <option value="Hobby">Hobby</option>
                <option value="Electronics">Electronics</option>
                <option value="Car Parts">Car Parts</option>
                <option value="RC Cars">RC Cars</option>
              </select>
              {fieldErrors?.category?.[0] ? (
                <span className={styles.fieldError}>
                  {fieldErrors.category[0]}
                </span>
              ) : null}
            </div>
            <div className={styles.row}>
              <label>{t(locale, "label.startingPrice")}</label>
              <input name="startingPrice" type="number" min="1" required />
              {fieldErrors?.startingPrice?.[0] ? (
                <span className={styles.fieldError}>
                  {fieldErrors.startingPrice[0]}
                </span>
              ) : null}
            </div>
            <div className={styles.row}>
              <label>{t(locale, "label.imageFile")}</label>
              <input name="imageFile" type="file" accept="image/*" />
              {fieldErrors?.imageFile?.[0] ? (
                <span className={styles.fieldError}>
                  {fieldErrors.imageFile[0]}
                </span>
              ) : null}
            </div>
            <div className={styles.row}>
              <label>{t(locale, "label.startsAt")}</label>
              <input name="startsAt" type="datetime-local" required />
              {fieldErrors?.startsAt?.[0] ? (
                <span className={styles.fieldError}>
                  {fieldErrors.startsAt[0]}
                </span>
              ) : null}
            </div>
            <div className={styles.row}>
              <label>{t(locale, "label.endsAt")}</label>
              <input name="endAt" type="datetime-local" required />
              {fieldErrors?.endAt?.[0] ? (
                <span className={styles.fieldError}>{fieldErrors.endAt[0]}</span>
              ) : null}
            </div>
            <div className={styles.actions}>
              <button type="submit" className={styles.primary}>
                {t(locale, "auction.new.submit")}
              </button>
              <a href="/" className={styles.secondary}>
                {t(locale, "auction.new.cancel")}
              </a>
            </div>
          </form>
          <p className={styles.note}>
            {t(locale, "auction.new.imageNote")}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
