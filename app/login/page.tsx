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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Brand mark */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2.5 mb-1">
            <div className="h-7 w-[3px] rounded-full bg-foreground" />
            <span className="text-2xl font-semibold tracking-tight">MAEKNIT NY</span>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Manufacturing Dashboard</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Sign in</CardTitle>
            <CardDescription className="text-xs">Access your financial dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600 border border-red-100">
                {error === "AccessDenied"
                  ? "Your email is not authorized to access this dashboard."
                  : "An error occurred during login. Please try again."}
              </div>
            )}
            {loginError && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600 border border-red-100">
                {loginError}
              </div>
            )}

            {status === "unauthenticated" && (
              <>
                <Button
                  variant="outline"
                  className="w-full bg-foreground text-background hover:bg-foreground/90 hover:text-background"
                  onClick={() => signIn("google")}
                >
                  Continue with Google
                </Button>

                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                    or
                  </span>
                </div>

                <form onSubmit={handleCredentialsLogin} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@maeknit.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Sign in
                  </Button>
                </form>
              </>
            )}

            {status === "authenticated" && (
              <div className="flex items-center gap-2 text-xs text-emerald-600">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Signed in — redirecting...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
