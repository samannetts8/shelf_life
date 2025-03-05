import Link from "next/link";
import { Plus } from "lucide-react";
import styles from "./empty-state.module.css";

export function EmptyState() {
  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={styles.icon}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h2 className={styles.title}>Your fridge is empty</h2>
      <p className={styles.description}>
        Start tracking your food items to reduce waste and save money.
      </p>
      <Link href="/add-item" className={styles.button}>
        <Plus className={styles.buttonIcon} />
        Add your first item
      </Link>
    </div>
  );
}
