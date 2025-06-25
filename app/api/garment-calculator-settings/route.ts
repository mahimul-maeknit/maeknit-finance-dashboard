import { neon } from "@neondatabase/serverless"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
// Initialize Neon SQL client
const sql = neon(process.env.DATABASE_URL!)

export type GarmentSavableSettings = {
    usaMarginInput: number | null
    acnFactoryMarginInput: number | null
    maeknitAcnMarginInput: number | null
    usaKnittingCostPerHour: number | null
    usaLinkingCostPerHour: number | null
    usaQCHandFinishPerHour: number | null
    usaWashingSteamingPerHour: number | null
    usaLaborRatePerHour: number | null
    acnKnittingCostPerHour: number | null
    acnLinkingCostPerHour: number | null
    acnQCHandFinishPerHour: number | null
    acnWashingSteamingPerHour: number | null
    acnDHLShipCost: number | null
    acnMaeknitTariffPercent: number | null
  }
  

const AUTHORIZED_EMAILS = ["mahimul@maeknit.io", "mallory@maeknit.io", "elias@maeknit.io", "tech@maeknit.io", "intel@maeknit.io", "mattb@maeknit.io", "matt.blodgett@praxisvcge.com",
  "naeem@maeknit.io", "kadri@maeknit.io", "financial_access@maeknit.io"]

// GET handler to fetch settings
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  const session = await getServerSession()

  // Authorization check
  if (!session || !AUTHORIZED_EMAILS.includes(session.user?.email || "")) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const result = await sql`SELECT data FROM garment_calculator_settings WHERE id = 'garment_calculator_settings'`
    const settings = result.length > 0 ? (result[0] as { data: GarmentSavableSettings }).data : null
    return NextResponse.json(settings || {}) // Return empty object if no settings found
  } catch (error) {
    console.error("Error fetching garment calculator settings from Neon:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to fetch garment calculator settings" }), { status: 500 })
  }
}

// POST handler to save settings
export async function POST(request: Request) {
  const session = await getServerSession()

  // Authorization check
  if (!session || !AUTHORIZED_EMAILS.includes(session.user?.email || "")) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const settings: GarmentSavableSettings = await request.json()
    // Upsert operation: insert if not exists, update if exists
    await sql`
      INSERT INTO garment_calculator_settings (id, data)
      VALUES ('garment_calculator_settings', ${JSON.stringify(settings)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
    `
    return new NextResponse(JSON.stringify({ message: "Garment calculator settings saved successfully" }), {
      status: 200,
    })
  } catch (error) {
    console.error("Error saving garment calculator settings to Neon:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to save garment calculator settings" }), { status: 500 })
  }
}
