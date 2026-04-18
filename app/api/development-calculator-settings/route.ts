import { neon } from "@neondatabase/serverless"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export type DevelopmentSavableSettings = {
  employees: {
    id: string
    name: string
    laborRate: number
  }[]
  workCenters: {
    id: string
    name: string
    electricityCost: number
    depreciationCost: number
  }[]
  rows: {
    id: string
    operationName: string
    employeeId: string
    workCenterId: string
    timeMinutes: number
    iterations: number
  }[]
  materialCost: number
  marginPercent: number
  shippingCost: number
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
export async function GET(_request: Request) {
  const session = await getServerSession()

  if (!session || !AUTHORIZED_EMAILS.includes(session.user?.email || "")) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const result = await sql`
      SELECT data
      FROM app_settings
      WHERE id = 'development_calculator_settings'
    `
    const settings =
      result.length > 0
        ? (result[0] as { data: DevelopmentSavableSettings }).data
        : null
    return NextResponse.json(settings || {})
  } catch (error) {
    console.error("Error fetching MAEKNIT Calculator settings:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch MAEKNIT Calculator settings" }),
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession()

  if (!session || !AUTHORIZED_EMAILS.includes(session.user?.email || "")) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const settings: DevelopmentSavableSettings = await request.json()
    await sql`
      INSERT INTO app_settings (id, data)
      VALUES ('development_calculator_settings', ${JSON.stringify(settings)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
    `
    return new NextResponse(
      JSON.stringify({ message: "MAEKNIT Calculator settings saved successfully" }),
      { status: 200 }
    )
  } catch (error) {
    console.error("Error saving MAEKNIT Calculator settings:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to save MAEKNIT Calculator settings" }),
      { status: 500 }
    )
  }
}
