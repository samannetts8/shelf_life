"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "./components/logo"
import { Button } from "./components/ui/button"
import { LoginModal } from "./components/login-modal"
import { SignupModal } from "./components/signup-modal"

export default function Home() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <Logo className="h-24 w-24 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-green-800 mb-2">FreshTrack</h1>
        <p className="text-green-600 text-lg mb-8">Reduce food waste, save money</p>

        <div className="space-y-4">
          <Button
            onClick={() => setShowLoginModal(true)}
            className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg"
          >
            Login
          </Button>

          <Button
            onClick={() => setShowSignupModal(true)}
            variant="outline"
            className="w-full border-green-600 text-green-600 hover:bg-green-50 py-6 text-lg"
          >
            Sign Up
          </Button>
        </div>

        <p className="text-sm text-gray-600 mt-8">
          Track your food expiration dates and get recipe suggestions to reduce waste
        </p>
      </div>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onSuccess={handleSuccess} />}

      {showSignupModal && <SignupModal onClose={() => setShowSignupModal(false)} onSuccess={handleSuccess} />}
    </div>
  )
}