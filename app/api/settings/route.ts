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
  shifts: number
  avgGarmentPrice: number
  developmentMix: string
  swatchesPerWeek: number
  samplesPerWeek: number
  gradingPerWeek: number
}

// GET handler to fetch settings
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  const session = await getServerSession()

  // Authorization check
  if (!session || session.user?.email !== "mahimul@maeknit.io") {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const result = await sql`SELECT data FROM app_settings WHERE id = 'maeknit_dashboard_settings'`
    const settings = result.length > 0 ? (result[0] as { data: SavableSettings }).data : null
    return NextResponse.json(settings || {}) // Return empty object if no settings found
  } catch (error) {
    console.error("Error fetching settings from Neon:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to fetch settings" }), { status: 500 })
  }
}

// POST handler to save settings
export async function POST(request: Request) {
  const session = await getServerSession()

  // Authorization check
  if (!session || session.user?.email !== "mahimul@maeknit.io") {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const settings: SavableSettings = await request.json()
    // Upsert operation: insert if not exists, update if exists
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
