import { neon } from "@neondatabase/serverless"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export type GarmentSavableSettings = {
  monthlyRent: number | null
  totalMachines: number | null
  workingHoursPerMonth: number | null
  knittingMachineCount: number | null
  linkingMachineCount: number | null
  washingMachineCount: number | null
  knittingDepreciationPerHour: number | null
  linkingDepreciationPerHour: number | null
  washingDepreciationPerHour: number | null
  steamingDepreciationPerHour: number | null
  knittingElectricityCost: number | null
  linkingElectricityCost: number | null
  washingElectricityCost: number | null
  steamingElectricityCost: number | null
  knittingLaborRate: number | null
  linkingLaborRate: number | null
  washingLaborRate: number | null
  qcHandFinishLaborRate: number | null
  standardKnittingTime: number | null
  standardLinkingTime: number | null
  standardWashingTime: number | null
  standardQCTime: number | null
  yarnCostPerKg: number | null
  standardGarmentWeightGrams: number | null
  marginPercent: number | null
}

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  const session = await getServerSession()

  if (!session || !AUTHORIZED_EMAILS.includes(session.user?.email || "")) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const result = await sql`
      SELECT data 
      FROM app_settings 
      WHERE id = 'garment_calculator_settings'
    `
    const settings = result.length > 0 ? (result[0] as { data: GarmentSavableSettings }).data : null
    return NextResponse.json(settings || {})
  } catch (error) {
    console.error("Error fetching garment calculator settings from Neon:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to fetch garment calculator settings" }), { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession()

  if (!session || !AUTHORIZED_EMAILS.includes(session.user?.email || "")) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const settings: GarmentSavableSettings = await request.json()
    await sql`
      INSERT INTO app_settings (id, data)
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
