"use client"

import type React from "react"

import { signIn, useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation" // Import useSearchParams
import { useEffect, useState } from "react" // Import useState
import { Input } from "@/components/ui/input" // Import Input
import { Label } from "@/components/ui/label" // Import Label
import { Separator } from "@/components/ui/separator" // Import Separator

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams() // Get search params for error messages
  const error = searchParams.get("error") // Get the error query parameter

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null) // State for displaying login errors

  useEffect(() => {
    if (status === "authenticated") {
      // If authenticated, redirect to the dashboard
      router.push("/")
    }
  }, [session, status, router])

  // Handle credentials login submission
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null) // Clear previous errors

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Prevent automatic redirect, handle it manually
    })

    if (result?.error) {
      // Display a user-friendly error message
      if (result.error === "CredentialsSignin") {
        setLoginError("Invalid email or password. Please try again.")
      } else {
        setLoginError("An unexpected error occurred. Please try again.")
      }
      console.error("Credentials login error:", result.error)
    } else if (result?.ok) {
      // If login is successful, NextAuth will handle the session and the useEffect above will redirect
      // No explicit redirect needed here if `redirect: false` is used and useEffect handles it.
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to MAEKNIT Dashboard</CardTitle>
          <CardDescription>Please sign in to access the financial dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {/* Display general NextAuth errors */}
          {error && (
            <div className="text-red-600 font-medium">
              {error === "AccessDenied"
                ? "Access Denied: Your email is not authorized."
                : "An error occurred during login. Please try again."}
            </div>
          )}
          {/* Display credentials login specific errors */}
          {loginError && <div className="text-red-600 font-medium">{loginError}</div>}

          {status === "unauthenticated" && (
            <>
              {/* Google Login Button */}
              <Button
                variant="outline"
                className="bg-black text-white hover:bg-gray-800 hover:text-white w-full"
                onClick={() => signIn("google")}
              >
                Sign in with Google
              </Button>

              <Separator className="my-4" />

              {/* Credentials Login Form */}
              <form onSubmit={handleCredentialsLogin} className="w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Guest@maeknit.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="password123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Sign in with Credentials
                </Button>
              </form>
            </>
          )}
          {status === "authenticated" && (
            <div className="text-green-600 font-medium">You are signed in. Redirecting...</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
