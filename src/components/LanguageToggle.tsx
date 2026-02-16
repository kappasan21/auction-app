"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import styles from "./Layout.module.css";

export default function LanguageToggle({ locale }: { locale: "en" | "ja" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLocale = (next: "en" | "ja") => {
    startTransition(async () => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      router.refresh();
    });
  };

  return (
    <div className={styles.langToggle}>
      <button
        type="button"
        className={locale === "en" ? styles.langActive : styles.langBtn}
        onClick={() => setLocale("en")}
        disabled={isPending}
      >
        EN
      </button>
      <button
        type="button"
        className={locale === "ja" ? styles.langActive : styles.langBtn}
        onClick={() => setLocale("ja")}
        disabled={isPending}
      >
        JP
      </button>
    </div>
  );
}
