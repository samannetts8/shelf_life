
"use client";

import { Logo } from "./components/logo";
import styles from "./page.module.css";
import LoginPage from "./login/page";

export default function Home() {
 
  return (

    <div className={styles.container}>
      <div className={styles.content}>
        <Logo className={styles.logo} />
        <h1 className={styles.title}>Shelf Life</h1>
        <p className={styles.subtitle}>Reduce food waste, save money</p>

        <p className={styles.footer}>
          Track your food expiration dates and get recipe suggestions to reduce
          waste
        </p>
      </div>

      <LoginPage />

    <div className={styles.page}>
    </div>
    </div>
  );
}
