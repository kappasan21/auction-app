import Link from "next/link";
import styles from "./AuctionCard.module.css";

export type AuctionCardData = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  currentPrice: number;
  status: string;
  imageUrl: string | null;
  endAt: string;
};

export default function AuctionCard({ auction }: { auction: AuctionCardData }) {
  return (
    <Link href={`/auctions/${auction.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {auction.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={auction.imageUrl} alt={auction.title} />
        ) : (
          <div className={styles.placeholder}>No image</div>
        )}
        <span className={styles.status}>{auction.status}</span>
      </div>
      <div className={styles.content}>
        <div className={styles.meta}>
          <span>{auction.category ?? "General"}</span>
          <span>Ends {new Date(auction.endAt).toLocaleDateString()}</span>
        </div>
        <h3>{auction.title}</h3>
        <p className="muted">{auction.description}</p>
        <div className={styles.priceRow}>
          <span>Current bid</span>
          <strong>${(auction.currentPrice / 100).toFixed(2)}</strong>
        </div>
      </div>
    </Link>
  );
}
