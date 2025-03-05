"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"
import { LoginForm } from "@/components/login-form"

interface SignupModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function SignupModal({ onClose, onSuccess }: SignupModalProps) {
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

  // Add entrance animation
  useEffect(() => {
    const overlay = overlayRef.current
    const modal = modalRef.current

    if (overlay && modal) {
      setTimeout(() => {
        overlay.classList.add("opacity-100")
        modal.classList.add("translate-y-0", "opacity-100")
      }, 10)
    }
  }, [])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 opacity-0 transition-opacity duration-300"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md translate-y-4 opacity-0 transition-all duration-300"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Create a new account</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <LoginForm isSignUp={true} onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  )
}

