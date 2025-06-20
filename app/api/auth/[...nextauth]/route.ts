// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const allowedEmails = [
  "mahimul@maeknit.io",
  "mallory@maeknit.io",
  "elias@maeknit.io",
]

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
      if (user?.email && allowedEmails.includes(user.email)) {
        return true
      }
      return false // Deny sign-in
    },
  },
})

export { handler as GET, handler as POST }
