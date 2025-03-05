
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "./components/logo";
import { Button } from "./components/ui/button";
import { LoginModal } from "./components/login-modal";
import { SignupModal } from "./components/signup-modal";

import SupabaseTestPage from "./supatest";
import styles from "./page.module.css";
import LoginPage from "./login/page";

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/dashboard");
  };

  return (

    <div className={styles.container}>
      <div className={styles.content}>
        <Logo className={styles.logo} />
        <h1 className={styles.title}>FreshTrack</h1>
        <p className={styles.subtitle}>Reduce food waste, save money</p>

        <div className={styles.buttonContainer}>
          <Button
            onClick={() => setShowLoginModal(true)}
            className={styles.loginButton}
          >
            Login
          </Button>

          <Button
            onClick={() => setShowSignupModal(true)}
            variant="outline"
            className={styles.signupButton}
          >
            Sign Up
          </Button>

          {/* Include SupabaseTestPage if needed */}
          <SupabaseTestPage />
        </div>

        <p className={styles.footer}>
          Track your food expiration dates and get recipe suggestions to reduce
          waste
        </p>
      </div>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showSignupModal && (
        <SignupModal
          onClose={() => setShowSignupModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    <div className={styles.page}>
      <SupabaseTestPage />
      <LoginPage />
    </div>
  );
}
