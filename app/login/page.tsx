"use client"

import { signIn } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      // Check if the authenticated user is authorized
      if (session?.user?.email === "mahimul@maeknit.io") {
        router.push("/") // Redirect to dashboard if authorized
      } else {
        // If authenticated but not authorized, show an error or redirect to a specific unauthorized page
        // For now, we'll just keep them on the login page with a message.
        // In a real app, you might want to sign them out or show a more explicit error.
      }
    }
  }, [session, status, router])

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
          <CardDescription>Please sign in with your Google account to access the financial dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === "unauthenticated" && (
            <Button
              variant="outline"
              className="bg-black text-white hover:bg-gray-800 hover:text-white"
              onClick={() => signIn("google")}
            >
              Sign in with Google
            </Button>
          )}
          {status === "authenticated" && session?.user?.email !== "mahimul@maeknit.io" && (
            <div className="text-red-600 font-medium">
              Access Denied: Your email ({session.user?.email}) is not authorized.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
