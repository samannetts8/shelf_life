"use client"
import type React from "react"
import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import styles from "./login-modal.module.css"

interface LoginModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  // Prevent scrolling of the background
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  return (
    <div 
      ref={overlayRef} 
      className={styles.overlay} 
      onClick={handleOverlayClick}
    >
      <div ref={modalRef} className={styles.modal}>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Close modal"
        >
          <X className={styles.closeIcon} />
        </button>
        <LoginForm 
          isSignUp={false} 
          onSuccess={onSuccess} 
        />
      </div>
    </div>
  )
}