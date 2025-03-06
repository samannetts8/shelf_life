"use client";

import { Logo } from "./components/logo";
import styles from "./page.module.css";
import LoginPage from "./login/page";
import Image from "next/image";
import "animate.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div
        className={`animate__animated animate__fadeInRight animate__delay-3s ${styles.images}`}
      >
        <div className={styles.scrollParent}>
          <div className={styles.scrollElementPrimary}>
            <Image
              src="/steak.png"
              alt="Steak"
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
        </div>
      </div>
      <div className={styles.content}>
        <Logo
          className={`animate__animated animate__backInDown animate__delay-2s ${styles.logo}`}
        />
        <h1
          className={`animate__animated animate__backInLeft animate__delay-1s ${styles.title}`}
        >
          ShelfLife
        </h1>
        <p
          className={`animate__animated animate__backInRight animate__delay-1s ${styles.subtitle}`}
        >
          Waste less, taste more!
        </p>

        <p
          className={`animate__animated animate__backInUp animate__delay-2s ${styles.footer}`}
        >
          Track your food expiration dates and get recipe suggestions to reduce
          waste.
        </p>
      </div>
      <div className="animate__animated animate__bounceIn animate__delay-3s">
        <LoginPage />
      </div>
      <div className={styles.page}></div>
    </div>
  );
}
