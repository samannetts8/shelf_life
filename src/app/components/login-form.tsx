"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "../hooks/use-auth"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Loader2, CheckCircle } from "lucide-react"

interface LoginFormProps {
  isSignUp: boolean
  onSuccess: () => void
}

export function LoginForm({ isSignUp, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { login, register, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    try {
      if (isSignUp) {
        await register(email, password)
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
        }, 1500)
      } else {
        await login(email, password)
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
        }, 1500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="bg-green-100 rounded-full p-3 mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-xl font-medium text-green-800 mb-2">
          {isSignUp ? "Account created!" : "Login successful!"}
        </h3>
        <p className="text-green-600">Redirecting you to the dashboard...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200 animate-pulse">{error}</div>
      )}

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isSignUp ? "Create Account" : "Sign In"}
      </Button>
    </form>
  )
}

