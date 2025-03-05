"use client";

import type React from "react";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import styles from "./signup-modal.module.css";

interface SignupModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function SignupModal({ onClose, onSuccess }: SignupModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Prevent scrolling of the background
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Add entrance animation
  useEffect(() => {
    const overlay = overlayRef.current;
    const modal = modalRef.current;

    if (overlay && modal) {
      setTimeout(() => {
        overlay.classList.add(styles.visible);
        modal.classList.add(styles.visible);
      }, 10);
    }
  }, []);

  return (
    <div
      ref={overlayRef}
      className={`${styles.overlay}`}
      onClick={handleOverlayClick}
    >
      <div ref={modalRef} className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create a new account</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X className={styles.icon} />
          </button>
        </div>
        <div className={styles.content}>
          <LoginForm isSignUp={true} onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  );
}
