"use client";

import { useState } from "react";
import { Plus, Settings } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Mobile-layout.module.css";
import type { FoodItemType } from "../types/food-item";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  const [foodItems, setFoodItems] = useState<FoodItemType[]>([]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className="text-xl font-bold">ShelfLife</h1>
        <Link href="/add-item" className={styles.addButton}>
          <Plus className="h-5 w-5" />
        </Link>
      </header>

      {/* Main content */}
      <main className={styles.main}>{children}</main>

      {/* Navigation */}
      <nav className={styles.nav}>
        <Link
          href="/dashboard"
          className={`${styles.navLink} ${styles.navLinkActive}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span>Home</span>
        </Link>
        <Link
          href="/recipes"
          className={`${styles.navLink} ${styles.navLinkInactive}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span>Recipes</span>
        </Link>
        <Link href="/settings" className={styles.navLink}>
          <Settings size={24} />
          <span>Settings</span>
        </Link>
      </nav>
    </div>
  );
}
