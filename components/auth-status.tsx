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
      <div className="text-sm flex items-center justify-end gap-4 p-2">
        <span className="text-gray-700">
          Signed in as <strong>{session.user?.email}</strong>
        </span>
        <Button variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    )
  }

  return (
    <div className="text-sm flex items-center justify-end p-2">
      <Button
        variant="outline"
        className="bg-black text-white hover:bg-gray-800 hover:text-white"
        onClick={() => signIn("google")}
      >
        Sign in with Google
      </Button>
    </div>
  )
}
