"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)
    setError("")

    try {
      // Mock authentication - in real app would call API
      if (email === "admin@example.com" && password === "password123") {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        router.push("/dashboard")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return <LoginForm onLogin={handleLogin} isLoading={isLoading} error={error} />
}
