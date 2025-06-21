import { neon } from "@neondatabase/serverless"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

// Initialize Neon SQL client
const sql = neon(process.env.DATABASE_URL!)

// Define a type for the settings object
type SavableSettings = {
  teamLabor: number | null
  rent: number | null
  electricity: number | null
  water: number | null
  materialCost: number | null
  overhead: number | null
  waterRate: number | null
  electricityRate: number | null
  laborRate: number | null
  swatchPrice: number | null
  samplePrice: number | null
  gradingPrice: number | null
  e72StollCapacity: number | null
  e35StollCapacity: number | null
  e18SwgCapacity: number | null
  e72StollTime: number | null
  e35StollTime: number | null
  e18SwgTime: number | null
  shifts: number | null
  avgGarmentPrice: number | null
  developmentMix: string | null
  swatchesPerWeek: number | null
  samplesPerWeek: number | null
  gradingPerWeek: number | null
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
