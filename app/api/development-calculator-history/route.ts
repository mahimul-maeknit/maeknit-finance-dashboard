import { neon } from "@neondatabase/serverless"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import type { DevelopmentSavableSettings } from "@/app/api/development-calculator-settings/route"

const sql = neon(process.env.DATABASE_URL!)

export type ActualRowEntry = {
  rowId: string
  actualTimeMinutes: number
  actualIterations: number
}

export type CalculationSnapshot = {
  id: string
  name: string
  savedAt: string
  snapshot: DevelopmentSavableSettings
  summary: {
    estimatedCost: number
    trueCost: number
    totalBase: number
    sellingPrice: number
    finalPrice: number
    overrunRatio: number
  }
  actualCost: number | null
  actualRows: ActualRowEntry[] | null
  notes: string | null
  status: "quoted" | "finalized" | "archived"
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
      SELECT id, name, saved_at, snapshot, summary, actual_cost, actual_rows, notes, status
      FROM development_calculator_snapshots
      ORDER BY saved_at DESC
    `
    const snapshots: CalculationSnapshot[] = result.map(row => ({
      id: row.id as string,
      name: row.name as string,
      savedAt: (row.saved_at as Date).toISOString(),
      snapshot: row.snapshot as DevelopmentSavableSettings,
      summary: row.summary as CalculationSnapshot["summary"],
      actualCost: row.actual_cost as number | null,
      actualRows: row.actual_rows as ActualRowEntry[] | null,
      notes: row.notes as string | null,
      status: row.status as CalculationSnapshot["status"],
    }))
    return NextResponse.json(snapshots)
  } catch (error) {
    console.error("Error fetching snapshots:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to fetch snapshots" }), { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session || !AUTHORIZED_EMAILS.includes(session.user?.email || "")) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }
  try {
    const body: {
      name: string
      snapshot: DevelopmentSavableSettings
      summary: CalculationSnapshot["summary"]
    } = await request.json()
    const id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    await sql`
      INSERT INTO development_calculator_snapshots (id, name, snapshot, summary)
      VALUES (${id}, ${body.name}, ${JSON.stringify(body.snapshot)}::jsonb, ${JSON.stringify(body.summary)}::jsonb)
    `
    return NextResponse.json({ id })
  } catch (error) {
    console.error("Error saving snapshot:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to save snapshot" }), { status: 500 })
  }
}
