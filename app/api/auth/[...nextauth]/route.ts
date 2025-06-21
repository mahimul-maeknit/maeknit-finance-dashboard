// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const AUTHORIZED_EMAILS = ["mahimul@maeknit.io", "mallory@maeknit.io", "elias@maeknit.io", "tech@maeknit.io", "intel@maeknit.io", "matt@maeknit.io", "matt.blodgett@praxisvcge.com"]

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      // Allow sign-in only for approved emails
      if (user?.email && AUTHORIZED_EMAILS.includes(user.email)) {
        return true
      }
      return false // Deny sign-in
    },
  },
})

export { handler as GET, handler as POST }
