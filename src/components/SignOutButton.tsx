"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import styles from "./Layout.module.css";

export default function SignOutButton({
  label,
  loadingLabel,
}: {
  label: string;
  loadingLabel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await fetch("/logout", { method: "GET" });
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      className={styles.ghostBtn}
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? loadingLabel : label}
    </button>
  );
}
