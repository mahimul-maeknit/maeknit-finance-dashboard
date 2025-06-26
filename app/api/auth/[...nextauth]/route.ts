// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials" // Import CredentialsProvider

const AUTHORIZED_EMAILS = [
  "mahimul@maeknit.io",
  "mallory@maeknit.io",
  "elias@maeknit.io",
  "tech@maeknit.io",
  "intel@maeknit.io",
  "mattb@maeknit.io",
  "matt.blodgett@praxisvcge.com",
  "naeem@maeknit.io",
  "kadri@maeknit.io",
  "financial_access@maeknit.io",
  "daleT@maeknit.io",
  "brendan@maeknit.io", 
]

// Define a hardcoded guest user for demonstration purposes
// In a real application, these would be stored securely (e.g., hashed in a database)
const GUEST_EMAIL = "financial_access@maeknit.io"
const GUEST_PASSWORD = "FinanceMaeknit(@2025"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Guest@maeknit.io" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // This is where you would typically query your database to validate credentials
        // For this example, we're using hardcoded values
        if (credentials?.email === GUEST_EMAIL && credentials?.password === GUEST_PASSWORD) {
          // If credentials are valid, return a user object
          return { id: "guest-user", name: "Guest User", email: GUEST_EMAIL }
        }
        // If credentials are invalid, return null
        return null
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async signIn({ user, account, profile }) {
      // If signing in with Google, apply the email authorization check
      if (account?.provider === "google") {
        if (user?.email && AUTHORIZED_EMAILS.includes(user.email)) {
          return true
        }
        // If Google user is not authorized, deny sign-in
        return false
      }
      // For Credentials provider, the authorization is handled in the `authorize` function above.
      // If `authorize` returns a user, it means credentials were valid.
      return true
    },
    // You might want to add a session callback to include custom user data in the session
    // async session({ session, token, user }) {
    //   // Example: Add a custom role to the session
    //   if (user?.email === GUEST_EMAIL) {
    //     session.user.role = "guest";
    //   } else if (user?.email && AUTHORIZED_EMAILS.includes(user.email)) {
    //     session.user.role = "admin";
    //   }
    //   return session;
    // },
  },
  pages: {
    signIn: "/login", // Ensure this points to your custom login page
  },
})

export { handler as GET, handler as POST }
