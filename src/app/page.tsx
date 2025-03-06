"use client";

import { Logo } from "./components/logo";
import styles from "./page.module.css";
import LoginPage from "./login/page";
import Image from "next/image";
import "animate.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.images}>
        <Image
          src="/steak.png"
          alt="Steak"
          width={225}
          height={150}
          priority
          className={`animate__animated ${styles.images}`}
          onMouseEnter={(e) => {
            e.currentTarget.classList.add("animate__jello");
          }}
          onMouseLeave={(e) => {
            e.currentTarget.classList.remove("animate__jello");
          }}
        />
        <Image
          src="/broccoli.png"
          alt="Broccoli"
          width={150}
          height={150}
          priority
          className={`animate__animated ${styles.images}`}
          onMouseEnter={(e) => {
            e.currentTarget.classList.add("animate__jello");
          }}
          onMouseLeave={(e) => {
            e.currentTarget.classList.remove("animate__jello");
          }}
        />
        <Image
          src="/egg.png"
          alt="Egg"
          width={150}
          height={150}
          priority
          className={`animate__animated ${styles.images}`}
          onMouseEnter={(e) => {
            e.currentTarget.classList.add("animate__jello");
          }}
          onMouseLeave={(e) => {
            e.currentTarget.classList.remove("animate__jello");
          }}
        />
        <Image
          src="/watermelon.png"
          alt="Watermelon"
          width={150}
          height={150}
          priority
          className={`animate__animated ${styles.images}`}
          onMouseEnter={(e) => {
            e.currentTarget.classList.add("animate__jello");
          }}
          onMouseLeave={(e) => {
            e.currentTarget.classList.remove("animate__jello");
          }}
        />
      </div>
      <div className={styles.content}>
        <Logo className={styles.logo} />
        <h1 className={styles.title}>ShelfLife</h1>
        <p className={styles.subtitle}>Waste less, taste more!</p>

        <p className={styles.footer}>
          Track your food expiration dates and get recipe suggestions to reduce
          waste
        </p>
      </div>

      <LoginPage />

      <div className={styles.page}></div>
    </div>
  );
}
