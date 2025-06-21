import { neon } from "@neondatabase/serverless"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

// Initialize Neon SQL client
const sql = neon(process.env.DATABASE_URL!)

// Define a type for the settings object
type SavableSettings = {
  teamLabor: number
  rent: number
  electricity: number
  water: number
  materialCost: number
  overhead: number
  waterRate: number
  electricityRate: number
  laborRate: number
  swatchPrice: number
  samplePrice: number
  gradingPrice: number
  e72StollCapacity: number
  e35StollCapacity: number
  e18SwgCapacity: number
  e72StollTime: number
  e35StollTime: number
  e18SwgTime: number
}

const ALLOWED_EMAILS = ["mahimul@maeknit.io", "mallory@maeknit.io", "elias@maeknit.io", "tech@maeknit.io", "intel@maeknit.io"]

// GET handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  const session = await getServerSession()

  if (!session || !ALLOWED_EMAILS.includes(session.user?.email || "")) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const result = await sql`SELECT data FROM app_settings WHERE id = 'maeknit_dashboard_settings'`
    const settings = result.length > 0 ? (result[0] as { data: SavableSettings }).data : null
    return NextResponse.json(settings || {})
  } catch (error) {
    console.error("Error fetching settings from Neon:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to fetch settings" }), { status: 500 })
  }
}

// POST handler
export async function POST(request: Request) {
  const session = await getServerSession()

  if (!session || !ALLOWED_EMAILS.includes(session.user?.email || "")) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const settings: SavableSettings = await request.json()
    await sql`
      INSERT INTO app_settings (id, data)
      VALUES ('maeknit_dashboard_settings', ${JSON.stringify(settings)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
    `
    return new NextResponse(JSON.stringify({ message: "Settings saved successfully" }), { status: 200 })
  } catch (error) {
    console.error("Error saving settings to Neon:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to save settings" }), { status: 500 })
  }
}
