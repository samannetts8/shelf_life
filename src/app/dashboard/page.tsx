"use client"

import {useEffect} from "react"
import {useRouter} from "next/navigation"
import {Fridge} from "../components/fridge"
import {MobileLayout} from "../components/mobile-layout"
import {useAuth} from "../hooks/use-auth"

export default function Dashboard() {
  const {user, isLoading} = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <MobileLayout>
      <Fridge />
    </MobileLayout>
  )
}
