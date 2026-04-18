"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button" // Import Button component

export default function AuthStatus() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="text-sm text-gray-500">Loading...</div>
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground hidden sm:block">{session.user?.email}</span>
        <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600 h-8 px-3" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-8 text-xs"
      onClick={() => signIn("google")}
    >
      Sign in
    </Button>
  )
}
