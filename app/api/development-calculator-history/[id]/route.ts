import { neon } from "@neondatabase/serverless"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import type { ActualRowEntry } from "@/app/api/development-calculator-history/route"

const sql = neon(process.env.DATABASE_URL!)

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session || !AUTHORIZED_EMAILS.includes(session.user?.email || "")) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }
  try {
    const { id } = await params
    const body: {
      actualCost?: number | null
      actualRows?: ActualRowEntry[] | null
      notes?: string | null
      status?: string
    } = await request.json()
    const actualRowsJson = body.actualRows ? JSON.stringify(body.actualRows) : null
    await sql`
      UPDATE development_calculator_snapshots
      SET
        actual_cost = ${body.actualCost ?? null},
        actual_rows = ${actualRowsJson}::jsonb,
        notes       = ${body.notes ?? null},
        status      = COALESCE(${body.status ?? null}, status)
      WHERE id = ${id}
    `
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error updating snapshot:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to update snapshot" }), { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session || !AUTHORIZED_EMAILS.includes(session.user?.email || "")) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }
  try {
    const { id } = await params
    await sql`DELETE FROM development_calculator_snapshots WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting snapshot:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to delete snapshot" }), { status: 500 })
  }
}
