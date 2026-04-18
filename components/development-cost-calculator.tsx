"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import type { DevelopmentSavableSettings } from "@/app/api/development-calculator-settings/route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Settings2, Calculator, RefreshCw, ChevronDown, ChevronUp, Clock, BookmarkPlus } from "lucide-react"
import type { CalculationSnapshot, ActualRowEntry } from "@/app/api/development-calculator-history/route"

// ── Types ──────────────────────────────────────────────────────────────────────

type Employee = {
  id: string
  name: string
  laborRate: number // $/hr
}

type WorkCenter = {
  id: string
  name: string
  electricityCost: number  // $/hr
  depreciationCost: number // $/hr
}

type OperationRow = {
  id: string
  operationName: string
  employeeId: string
  workCenterId: string
  timeMinutes: number
  // How many times this operation is repeated (rework, iterations, samples)
  iterations: number
}

// ── Static defaults ────────────────────────────────────────────────────────────

const OPERATION_OPTIONS = [
  "Whole CAD", "Panel CAD", "Program", "Knit", "Loose Ends",
  "Link", "Steam", "Wash", "Dry", "QC", "Hand Finish",
  "3D Rendering", "Documentation", "Consultation",
]

const DEFAULT_EMPLOYEES: Employee[] = [
  { id: "emp-1", name: "Paige King",   laborRate: 50 },
  { id: "emp-2", name: "Kadri Sen",    laborRate: 40 },
  { id: "emp-3", name: "Sevan Altan",  laborRate: 30 },
]

const DEFAULT_WORK_CENTERS: WorkCenter[] = [
  { id: "wc-1", name: "Design",            electricityCost: 0,    depreciationCost: 0    },
  { id: "wc-2", name: "Finishing Table",   electricityCost: 0.10, depreciationCost: 0.50 },
  { id: "wc-3", name: "Steam Table",       electricityCost: 0.70, depreciationCost: 0.30 },
  { id: "wc-4", name: "CMS 530 3.5.2",    electricityCost: 0.74, depreciationCost: 2.58 },
  { id: "wc-5", name: "18gg Comnplett",   electricityCost: 0.48, depreciationCost: 2.58 },
  { id: "wc-6", name: "Electrolux Washer",electricityCost: 2.56, depreciationCost: 1.50 },
  { id: "wc-7", name: "Electrolux Dryer", electricityCost: 3.00, depreciationCost: 1.50 },
  { id: "wc-8", name: "M1",               electricityCost: 0.10, depreciationCost: 0.20 },
]

// ── Preset workflows ──────────────────────────────────────────────────────────
// Operations are matched to work centers by name at load time, so custom
// work centers added in Settings are also picked up correctly.

type PresetOp = { operationName: string; workCenterName: string }

const PRESETS: { label: string; ops: PresetOp[] }[] = [
  {
    label: "Development Sample",
    ops: [
      { operationName: "Whole CAD",      workCenterName: "Design"            },
      { operationName: "Panel CAD",      workCenterName: "Design"            },
      { operationName: "Program",        workCenterName: "M1"                },
      { operationName: "Knit",           workCenterName: "CMS 530 3.5.2"    },
      { operationName: "Loose Ends",     workCenterName: "Finishing Table"   },
      { operationName: "Steam",          workCenterName: "Steam Table"       },
      { operationName: "Link",           workCenterName: "18gg Comnplett"   },
      { operationName: "Loose Ends",     workCenterName: "Finishing Table"   },
      { operationName: "Wash",           workCenterName: "Electrolux Washer" },
      { operationName: "Dry",            workCenterName: "Electrolux Dryer"  },
      { operationName: "Steam",          workCenterName: "Steam Table"       },
      { operationName: "Documentation",  workCenterName: "Finishing Table"   },
    ],
  },
  {
    label: "Swatch",
    ops: [
      { operationName: "Program",        workCenterName: "M1"                },
      { operationName: "Knit",           workCenterName: "CMS 530 3.5.2"    },
      { operationName: "Loose Ends",     workCenterName: "Finishing Table"   },
      { operationName: "Steam",          workCenterName: "Steam Table"       },
      { operationName: "Documentation",  workCenterName: "Finishing Table"   },
    ],
  },
  {
    label: "Grading",
    ops: [
      { operationName: "Whole CAD",      workCenterName: "Design"            },
      { operationName: "Panel CAD",      workCenterName: "Design"            },
      { operationName: "Program",        workCenterName: "M1"                },
      { operationName: "Knit",           workCenterName: "CMS 530 3.5.2"    },
      { operationName: "Loose Ends",     workCenterName: "Finishing Table"   },
      { operationName: "Link",           workCenterName: "18gg Comnplett"   },
      { operationName: "Loose Ends",     workCenterName: "Finishing Table"   },
      { operationName: "Wash",           workCenterName: "Electrolux Washer" },
      { operationName: "Dry",            workCenterName: "Electrolux Dryer"  },
      { operationName: "Documentation",  workCenterName: "Finishing Table"   },
    ],
  },
]

const makeRow = (): OperationRow => ({
  id: Math.random().toString(36).slice(2),
  operationName: "",
  employeeId: "",
  workCenterId: "",
  timeMinutes: 0,
  iterations: 1,
})

// ── Component ─────────────────────────────────────────────────────────────────

export function DevelopmentCostCalculator() {
  const { data: session, status } = useSession()

  // Settings
  const [employees, setEmployees]     = useState<Employee[]>(DEFAULT_EMPLOYEES)
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>(DEFAULT_WORK_CENTERS)

  // Calculator
  const [rows, setRows]               = useState<OperationRow[]>([makeRow()])
  const [materialCost, setMaterialCost]   = useState(0)
  const [marginPercent, setMarginPercent] = useState(60)
  const [shippingCost, setShippingCost]   = useState(0)

  // View + persistence state
  const [view, setView]                     = useState<"calculator" | "settings" | "history">("calculator")
  const [isLoading, setIsLoading]           = useState(true)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const autoSaveTimerRef                    = useRef<NodeJS.Timeout | null>(null)

  // History
  const [snapshots, setSnapshots]               = useState<CalculationSnapshot[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [expandedId, setExpandedId]             = useState<string | null>(null)
  const [showSaveBar, setShowSaveBar]           = useState(false)
  const [saveName, setSaveName]                 = useState("")
  const [saveConfirm, setSaveConfirm]           = useState(false)
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false)
  const [localNotes, setLocalNotes]             = useState<Record<string, string>>({})
  // rowId → { timeMinutes, iterations } per snapshot
  const [localActualRows, setLocalActualRows]   = useState<Record<string, Record<string, { timeMinutes: number; iterations: number }>>>({})

  // ── Persistence helpers ───────────────────────────────────────────────────

  const buildPayload = useCallback((): DevelopmentSavableSettings => ({
    employees,
    workCenters,
    rows,
    materialCost,
    marginPercent,
    shippingCost,
  }), [employees, workCenters, rows, materialCost, marginPercent, shippingCost])

  const autoSave = useCallback(async () => {
    if (status !== "authenticated") return
    try {
      setAutoSaveStatus("saving")
      const res = await fetch("/api/development-calculator-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      })
      if (!res.ok) throw new Error("Save failed")
      setAutoSaveStatus("saved")
      setTimeout(() => setAutoSaveStatus("idle"), 2000)
    } catch {
      setAutoSaveStatus("idle")
    }
  }, [buildPayload, status])

  // Debounced auto-save on every state change (skip during initial load)
  useEffect(() => {
    if (isLoading) return
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(autoSave, 1000)
    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current) }
  }, [autoSave, isLoading])

  // Load on mount once authenticated
  useEffect(() => {
    if (status !== "authenticated") {
      if (status !== "loading") setIsLoading(false)
      return
    }
    const load = async () => {
      try {
        const res = await fetch("/api/development-calculator-settings")
        if (!res.ok) return
        const data: DevelopmentSavableSettings = await res.json()
        if (!data || !Object.keys(data).length) return
        if (data.employees?.length)   setEmployees(data.employees)
        if (data.workCenters?.length) setWorkCenters(data.workCenters)
        if (data.rows?.length)        setRows(data.rows)
        if (data.materialCost  != null) setMaterialCost(data.materialCost)
        if (data.marginPercent != null) setMarginPercent(data.marginPercent)
        if (data.shippingCost  != null) setShippingCost(data.shippingCost)
      } catch (err) {
        console.error("Failed to load MAEKNIT Calculator settings", err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [status, session])

  // ── Per-row calculations ───────────────────────────────────────────────────

  const rowCosts = useMemo(() =>
    rows.map(row => {
      const emp = employees.find(e => e.id === row.employeeId)
      const wc  = workCenters.find(w => w.id === row.workCenterId)
      const timeHr    = row.timeMinutes / 60
      const laborCost   = timeHr * (emp?.laborRate ?? 0)
      const machineCost = timeHr * ((wc?.electricityCost ?? 0) + (wc?.depreciationCost ?? 0))
      const unitCost    = laborCost + machineCost
      return { laborCost, machineCost, unitCost, total: unitCost * row.iterations }
    }),
  [rows, employees, workCenters])

  // ── Summary ───────────────────────────────────────────────────────────────

  const summary = useMemo(() => {
    const estimatedCost = rowCosts.reduce((s, r) => s + r.unitCost, 0)  // 1× each
    const trueCost      = rowCosts.reduce((s, r) => s + r.total, 0)     // with iterations
    const totalBase     = trueCost + materialCost
    const clampedMargin = Math.min(Math.max(marginPercent, 0), 99.9)
    const sellingPrice  = totalBase / (1 - clampedMargin / 100)
    const finalPrice    = sellingPrice + shippingCost
    const overrunRatio  = estimatedCost > 0 ? trueCost / estimatedCost : 1
    return { estimatedCost, trueCost, totalBase, sellingPrice, finalPrice, overrunRatio }
  }, [rowCosts, materialCost, marginPercent, shippingCost])

  // ── Row handlers ──────────────────────────────────────────────────────────

  const updateRow = (id: string, field: keyof OperationRow, value: string | number) =>
    setRows(rs => rs.map(r => r.id === id ? { ...r, [field]: value } : r))

  const removeRow = (id: string) =>
    setRows(rs => rs.filter(r => r.id !== id))

  const loadPreset = (preset: { label: string; ops: PresetOp[] }) => {
    const newRows = preset.ops.map(op => {
      const wc = workCenters.find(w => w.name === op.workCenterName)
      return {
        id: Math.random().toString(36).slice(2),
        operationName: op.operationName,
        employeeId: "",
        workCenterId: wc?.id ?? "",
        timeMinutes: 0,
        iterations: 1,
      }
    })
    setRows(newRows)
  }

  // ── Employee handlers ─────────────────────────────────────────────────────

  const addEmployee = () =>
    setEmployees(e => [...e, { id: Math.random().toString(36).slice(2), name: "", laborRate: 30 }])

  const updateEmployee = (id: string, field: keyof Employee, value: string | number) =>
    setEmployees(e => e.map(emp => emp.id === id ? { ...emp, [field]: value } : emp))

  const removeEmployee = (id: string) =>
    setEmployees(e => e.filter(emp => emp.id !== id))

  // ── Work center handlers ──────────────────────────────────────────────────

  const addWorkCenter = () =>
    setWorkCenters(wc => [...wc, { id: Math.random().toString(36).slice(2), name: "", electricityCost: 0, depreciationCost: 0 }])

  const updateWorkCenter = (id: string, field: keyof WorkCenter, value: string | number) =>
    setWorkCenters(wc => wc.map(w => w.id === id ? { ...w, [field]: value } : w))

  const removeWorkCenter = (id: string) =>
    setWorkCenters(wc => wc.filter(w => w.id !== id))

  // ── History helpers ───────────────────────────────────────────────────────

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    try {
      const res = await fetch("/api/development-calculator-history")
      if (!res.ok) return
      const data: CalculationSnapshot[] = await res.json()
      setSnapshots(data)
      const notes: Record<string, string> = {}
      data.forEach(s => {
        notes[s.id] = s.notes ?? ""
      })
      const actualRowsMap: Record<string, Record<string, { timeMinutes: number; iterations: number }>> = {}
      data.forEach(s => {
        const rowMap: Record<string, { timeMinutes: number; iterations: number }> = {}
        s.snapshot.rows.forEach(row => {
          const existing = s.actualRows?.find(ar => ar.rowId === row.id)
          rowMap[row.id] = existing
            ? { timeMinutes: existing.actualTimeMinutes, iterations: existing.actualIterations }
            : { timeMinutes: 0, iterations: row.iterations }
        })
        actualRowsMap[s.id] = rowMap
      })
      setLocalNotes(notes)
      setLocalActualRows(actualRowsMap)
    } catch (err) {
      console.error("Failed to load history", err)
    } finally {
      setIsLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    if (view === "history" && status === "authenticated") loadHistory()
  }, [view, status, loadHistory])

  const saveSnapshot = async () => {
    if (!saveName.trim() || isSavingSnapshot) return
    setIsSavingSnapshot(true)
    try {
      await fetch("/api/development-calculator-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: saveName.trim(), snapshot: buildPayload(), summary }),
      })
      setSaveName("")
      setSaveConfirm(false)
      setShowSaveBar(false)
      setView("history")
    } finally {
      setIsSavingSnapshot(false)
    }
  }

  const updateSnapshotValidation = async (id: string) => {
    const snap = snapshots.find(s => s.id === id)
    if (!snap) return
    const rowMap = localActualRows[id] || {}
    const notes = localNotes[id] || null
    const actualRowEntries: ActualRowEntry[] = snap.snapshot.rows.map(row => ({
      rowId: row.id,
      actualTimeMinutes: rowMap[row.id]?.timeMinutes ?? 0,
      actualIterations: rowMap[row.id]?.iterations ?? row.iterations,
    }))
    const totalActualCost = snap.snapshot.rows.reduce((sum, row) => {
      const wc = snap.snapshot.workCenters.find(w => w.id === row.workCenterId)
      const emp = snap.snapshot.employees.find(e => e.id === row.employeeId)
      const rate = (emp?.laborRate ?? 0) + (wc?.electricityCost ?? 0) + (wc?.depreciationCost ?? 0)
      const actual = rowMap[row.id]
      if (!actual?.timeMinutes) return sum
      return sum + (actual.timeMinutes / 60) * rate * (actual.iterations ?? row.iterations)
    }, 0)
    await fetch(`/api/development-calculator-history/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actualCost: totalActualCost || null, notes, actualRows: actualRowEntries }),
    })
    setSnapshots(ss => ss.map(s =>
      s.id === id ? { ...s, actualCost: totalActualCost || null, notes, actualRows: actualRowEntries } : s
    ))
  }

  const finalizeSnapshot = async (id: string) => {
    await fetch(`/api/development-calculator-history/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "finalized" }),
    })
    setSnapshots(ss => ss.map(s => s.id === id ? { ...s, status: "finalized" } : s))
  }

  const deleteSnapshot = async (id: string) => {
    await fetch(`/api/development-calculator-history/${id}`, { method: "DELETE" })
    setSnapshots(ss => ss.filter(s => s.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="text-sm">Loading calculator settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 [&_input]:h-8 [&_input]:text-xs [&_label]:text-xs [&_label]:text-muted-foreground">

      {/* Header + view toggle */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold leading-tight">MAEKNIT Calculator</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Operation-level costing with iteration tracking
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {autoSaveStatus !== "idle" && (
              <span className="text-xs text-muted-foreground">
                {autoSaveStatus === "saving" ? "Saving..." : "✓ Saved"}
              </span>
            )}
            {view === "calculator" && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => setShowSaveBar(s => !s)}
              >
                <BookmarkPlus className="h-3.5 w-3.5 mr-1.5" />
                Add Quote
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-muted-foreground hover:text-red-600"
                onClick={() => {
                  setEmployees(DEFAULT_EMPLOYEES)
                  setWorkCenters(DEFAULT_WORK_CENTERS)
                  setMaterialCost(0)
                  setMarginPercent(60)
                  setShippingCost(0)
                  const devSample = PRESETS.find(p => p.label === "Development Sample")
                  if (devSample) {
                    setRows(devSample.ops.map(op => {
                      const wc = DEFAULT_WORK_CENTERS.find(w => w.name === op.workCenterName)
                      return {
                        id: Math.random().toString(36).slice(2),
                        operationName: op.operationName,
                        employeeId: "",
                        workCenterId: wc?.id ?? "",
                        timeMinutes: 0,
                        iterations: 1,
                      }
                    }))
                  }
                }}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Reset
              </Button>
              <Button
                size="sm"
                variant={view === "calculator" ? "default" : "outline"}
                onClick={() => setView("calculator")}
              >
                <Calculator className="h-3.5 w-3.5 mr-1.5" />
                Calculator
              </Button>
              <Button
                size="sm"
                variant={view === "settings" ? "default" : "outline"}
                onClick={() => setView("settings")}
              >
                <Settings2 className="h-3.5 w-3.5 mr-1.5" />
                Settings
              </Button>
              <Button
                size="sm"
                variant={view === "history" ? "default" : "outline"}
                onClick={() => setView("history")}
              >
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                History
              </Button>
            </div>
          </div>
        </div>

        {/* Add quote bar — step 1: name + template, step 2: confirm */}
        {showSaveBar && view === "calculator" && (
          <div className="rounded-lg border bg-emerald-50/50 px-3 py-2.5 space-y-2">
            {!saveConfirm ? (
              <div className="flex items-center gap-2">
                <BookmarkPlus className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <Select
                  onValueChange={val => {
                    const preset = PRESETS.find(p => p.label === val)
                    if (preset) loadPreset(preset)
                  }}
                >
                  <SelectTrigger className="h-8 text-xs w-44 shrink-0">
                    <SelectValue placeholder="Pick template…" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESETS.map(p => (
                      <SelectItem key={p.label} value={p.label} className="text-xs">{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="h-8 text-xs flex-1"
                  placeholder="Quote name (e.g. Crew Neck Sweater SS25)"
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && saveName.trim()) setSaveConfirm(true)
                    if (e.key === "Escape") { setShowSaveBar(false); setSaveName("") }
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  className="h-8 text-xs px-3 shrink-0"
                  onClick={() => setSaveConfirm(true)}
                  disabled={!saveName.trim()}
                >
                  Next
                </Button>
                <Button
                  size="sm" variant="ghost"
                  className="h-8 text-xs px-2 shrink-0"
                  onClick={() => { setShowSaveBar(false); setSaveName(""); setSaveConfirm(false) }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <BookmarkPlus className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <p className="text-xs flex-1">
                  Save quote <strong>&ldquo;{saveName}&rdquo;</strong>? This will appear in History.
                </p>
                <Button
                  size="sm"
                  className="h-8 text-xs px-3 shrink-0"
                  onClick={saveSnapshot}
                  disabled={isSavingSnapshot}
                >
                  {isSavingSnapshot ? "Saving..." : "Confirm Save"}
                </Button>
                <Button
                  size="sm" variant="ghost"
                  className="h-8 text-xs px-2 shrink-0"
                  onClick={() => setSaveConfirm(false)}
                >
                  Back
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── SETTINGS VIEW ─────────────────────────────────────────────────── */}

      {view === "settings" && (
        <div className="space-y-4">

          {/* Employees */}
          <Card className="shadow-sm">
            <CardHeader className="px-4 py-3 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Employees &amp; Labor Rates
              </CardTitle>
              <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={addEmployee}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs w-36">Labor Rate ($/hr)</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map(emp => (
                    <TableRow key={emp.id}>
                      <TableCell className="py-1.5">
                        <Input
                          value={emp.name}
                          placeholder="Employee name"
                          onChange={e => updateEmployee(emp.id, "name", e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="py-1.5">
                        <Input
                          type="number"
                          step="0.5"
                          value={emp.laborRate}
                          onChange={e => updateEmployee(emp.id, "laborRate", parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell className="py-1.5">
                        <Button
                          size="sm" variant="ghost"
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                          onClick={() => removeEmployee(emp.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Work Centers */}
          <Card className="shadow-sm">
            <CardHeader className="px-4 py-3 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Work Centers
              </CardTitle>
              <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={addWorkCenter}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs w-36">Electricity ($/hr)</TableHead>
                    <TableHead className="text-xs w-36">Depreciation ($/hr)</TableHead>
                    <TableHead className="text-xs text-right w-24">Total ($/hr)</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workCenters.map(wc => (
                    <TableRow key={wc.id}>
                      <TableCell className="py-1.5">
                        <Input
                          value={wc.name}
                          placeholder="Work center name"
                          onChange={e => updateWorkCenter(wc.id, "name", e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="py-1.5">
                        <Input
                          type="number" step="0.01"
                          value={wc.electricityCost}
                          onChange={e => updateWorkCenter(wc.id, "electricityCost", parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell className="py-1.5">
                        <Input
                          type="number" step="0.01"
                          value={wc.depreciationCost}
                          onChange={e => updateWorkCenter(wc.id, "depreciationCost", parseFloat(e.target.value) || 0)}
                        />
                      </TableCell>
                      <TableCell className="py-1.5 text-right font-mono text-xs">
                        ${(wc.electricityCost + wc.depreciationCost).toFixed(2)}
                      </TableCell>
                      <TableCell className="py-1.5">
                        <Button
                          size="sm" variant="ghost"
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                          onClick={() => removeWorkCenter(wc.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </div>
      )}

      {/* ── CALCULATOR VIEW ───────────────────────────────────────────────── */}

      {view === "calculator" && (
        <div className="space-y-4">

          {/* Summary strip — Est vs True cost */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="relative overflow-hidden shadow-sm">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-400 rounded-l-lg" />
              <CardContent className="py-3 pl-4 pr-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mb-1">
                  Est. Cost (1× each)
                </p>
                <p className="text-lg font-bold leading-tight">${summary.estimatedCost.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden shadow-sm">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-lg" />
              <CardContent className="py-3 pl-4 pr-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mb-1">
                  True Cost (w/ iters)
                </p>
                <p className="text-lg font-bold text-amber-600 leading-tight">${summary.trueCost.toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground">
                  {summary.overrunRatio.toFixed(2)}× overrun
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden shadow-sm">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />
              <CardContent className="py-3 pl-4 pr-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mb-1">
                  Selling Price ({marginPercent}% margin)
                </p>
                <p className="text-lg font-bold text-blue-600 leading-tight">${summary.sellingPrice.toFixed(2)}</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden shadow-sm">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-lg" />
              <CardContent className="py-3 pl-4 pr-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none mb-1">
                  Final Price (+ ship)
                </p>
                <p className="text-lg font-bold text-emerald-600 leading-tight">${summary.finalPrice.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Operations table */}
          <Card className="shadow-sm">
            <CardHeader className="px-4 py-3 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Operations
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <Select onValueChange={val => { const p = PRESETS.find(p => p.label === val); if (p) loadPreset(p) }}>
                  <SelectTrigger className="h-7 text-xs w-40">
                    <SelectValue placeholder="Load template…" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESETS.map(p => (
                      <SelectItem key={p.label} value={p.label} className="text-xs">{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="w-px h-4 bg-border" />
                <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => setRows(r => [...r, makeRow()])}>
                  <Plus className="h-3 w-3 mr-1" /> Add Row
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs min-w-[140px]">Operation</TableHead>
                    <TableHead className="text-xs min-w-[140px]">Assigned Person</TableHead>
                    <TableHead className="text-xs min-w-[155px]">Work Center</TableHead>
                    <TableHead className="text-xs w-24">Time (min)</TableHead>
                    <TableHead className="text-xs w-20">Iters</TableHead>
                    <TableHead className="text-xs text-right w-28">Unit Cost</TableHead>
                    <TableHead className="text-xs text-right w-28">Total</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => {
                    const cost = rowCosts[i]
                    const hasIter = row.iterations > 1
                    return (
                      <TableRow key={row.id} className="align-middle">

                        {/* Operation */}
                        <TableCell className="py-1.5">
                          <Select
                            value={row.operationName}
                            onValueChange={v => updateRow(row.id, "operationName", v)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="Select…" />
                            </SelectTrigger>
                            <SelectContent>
                              {OPERATION_OPTIONS.map(op => (
                                <SelectItem key={op} value={op} className="text-xs">{op}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {/* Person */}
                        <TableCell className="py-1.5">
                          <Select
                            value={row.employeeId}
                            onValueChange={v => updateRow(row.id, "employeeId", v)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="Person…" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.filter(e => e.name).map(emp => (
                                <SelectItem key={emp.id} value={emp.id} className="text-xs">
                                  {emp.name}
                                  <span className="ml-1 text-muted-foreground">(${emp.laborRate}/hr)</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {/* Work center */}
                        <TableCell className="py-1.5">
                          <Select
                            value={row.workCenterId}
                            onValueChange={v => updateRow(row.id, "workCenterId", v)}
                          >
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue placeholder="Work center…" />
                            </SelectTrigger>
                            <SelectContent>
                              {workCenters.filter(w => w.name).map(wc => (
                                <SelectItem key={wc.id} value={wc.id} className="text-xs">
                                  {wc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {/* Time */}
                        <TableCell className="py-1.5">
                          <Input
                            type="number" min={0}
                            value={row.timeMinutes || ""}
                            placeholder="0"
                            onChange={e => updateRow(row.id, "timeMinutes", parseFloat(e.target.value) || 0)}
                          />
                        </TableCell>

                        {/* Iterations */}
                        <TableCell className="py-1.5">
                          <Input
                            type="number" min={1}
                            value={row.iterations}
                            onChange={e => updateRow(row.id, "iterations", Math.max(1, parseInt(e.target.value) || 1))}
                            className={hasIter ? "border-amber-300 focus-visible:ring-amber-400" : ""}
                          />
                        </TableCell>

                        {/* Unit cost */}
                        <TableCell className="py-1.5 text-right">
                          <span className="text-xs font-mono">${cost.unitCost.toFixed(2)}</span>
                          {row.employeeId && row.workCenterId && row.timeMinutes > 0 && (
                            <div className="text-[10px] text-muted-foreground leading-none mt-0.5">
                              L ${cost.laborCost.toFixed(2)} + M ${cost.machineCost.toFixed(2)}
                            </div>
                          )}
                        </TableCell>

                        {/* Total with iterations */}
                        <TableCell className="py-1.5 text-right">
                          <span className={`text-xs font-mono font-semibold ${hasIter ? "text-amber-600" : ""}`}>
                            ${cost.total.toFixed(2)}
                          </span>
                          {hasIter && (
                            <div className="flex items-center justify-end gap-0.5 text-[10px] text-amber-500 mt-0.5">
                              <RefreshCw className="h-2.5 w-2.5" />
                              {row.iterations}×
                            </div>
                          )}
                        </TableCell>

                        {/* Delete */}
                        <TableCell className="py-1.5">
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                            onClick={() => removeRow(row.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}

                  {/* Totals footer row */}
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={5} className="py-2 text-xs font-semibold">
                      Totals
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs font-mono text-muted-foreground">
                      ${summary.estimatedCost.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs font-mono font-semibold text-amber-600">
                      ${summary.trueCost.toFixed(2)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Material / Margin / Shipping */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="shadow-sm border-violet-200">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-violet-100 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-violet-600">$</span>
                  </div>
                  <Label className="text-xs font-medium text-foreground">Material Cost</Label>
                </div>
                <Input
                  type="number" placeholder="0"
                  value={materialCost || ""}
                  onChange={e => setMaterialCost(parseFloat(e.target.value) || 0)}
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm border-emerald-200">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-emerald-100 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-emerald-600">%</span>
                  </div>
                  <Label className="text-xs font-medium text-foreground">Margin (%)</Label>
                </div>
                <Input
                  type="number" min={0} max={99}
                  value={marginPercent}
                  onChange={e => setMarginPercent(parseFloat(e.target.value) || 0)}
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm border-sky-200">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-sky-100 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-sky-600">$</span>
                  </div>
                  <Label className="text-xs font-medium text-foreground">Shipping Cost</Label>
                </div>
                <Input
                  type="number" placeholder="0"
                  value={shippingCost || ""}
                  onChange={e => setShippingCost(parseFloat(e.target.value) || 0)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Final summary bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
              <span>
                True cost{" "}
                <strong className="text-foreground font-mono">${summary.trueCost.toFixed(2)}</strong>
              </span>
              <span>
                + Material{" "}
                <strong className="text-foreground font-mono">${materialCost.toFixed(2)}</strong>
              </span>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <span>
                Margin{" "}
                <strong className="text-foreground font-mono">
                  ${(summary.sellingPrice - summary.totalBase).toFixed(2)}
                </strong>
              </span>
              <span>
                + Shipping{" "}
                <strong className="text-foreground font-mono">${shippingCost.toFixed(2)}</strong>
              </span>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold">${summary.finalPrice.toFixed(2)}</p>
            </div>
          </div>

        </div>
      )}
      {/* ── HISTORY VIEW ──────────────────────────────────────────────────── */}

      {view === "history" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {snapshots.length} saved {snapshots.length === 1 ? "quote" : "quotes"}
          </p>

          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-3" />
              <span className="text-sm">Loading history...</span>
            </div>
          ) : snapshots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No saved quotes yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Use <strong>Save Quote</strong> in the Calculator view to save a calculation
              </p>
            </div>
          ) : (
            snapshots.map(snap => {
              const isExpanded = expandedId === snap.id

              return (
                <Card
                  key={snap.id}
                  className={`shadow-sm transition-all ${snap.status === "finalized" ? "border-emerald-200 bg-emerald-50/20" : ""}`}
                >
                  {/* Collapsed row — always visible */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-lg"
                    onClick={() => setExpandedId(isExpanded ? null : snap.id)}
                  >
                    <div className={`h-2 w-2 rounded-full shrink-0 ${snap.status === "finalized" ? "bg-emerald-500" : "bg-blue-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{snap.name}</span>
                        {snap.status === "finalized" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium shrink-0">
                            Finalized
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        {new Date(snap.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        {snap.actualCost != null ? (
                          <span className={`font-medium ${
                            Math.abs(((snap.actualCost - snap.summary.trueCost) / snap.summary.trueCost) * 100) <= 10
                              ? "text-emerald-600"
                              : Math.abs(((snap.actualCost - snap.summary.trueCost) / snap.summary.trueCost) * 100) <= 25
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}>
                            · {(((snap.actualCost - snap.summary.trueCost) / snap.summary.trueCost) * 100) > 0 ? "+" : ""}
                            {(((snap.actualCost - snap.summary.trueCost) / snap.summary.trueCost) * 100).toFixed(1)}% actual
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">· awaiting actual cost</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-right shrink-0">
                      <div className="hidden sm:block">
                        <p className="text-[10px] text-muted-foreground">Est. Cost</p>
                        <p className="text-xs font-mono">${snap.summary.estimatedCost.toFixed(2)}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-[10px] text-muted-foreground">True Cost</p>
                        <p className="text-xs font-mono text-amber-600">${snap.summary.trueCost.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Quoted</p>
                        <p className="text-xs font-mono font-semibold text-blue-600">${snap.summary.finalPrice.toFixed(2)}</p>
                      </div>
                      {isExpanded
                        ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      }
                    </div>
                  </div>

                  {/* Expanded — Estimated vs Actual comparison */}
                  {isExpanded && (() => {
                    const rowMap = localActualRows[snap.id] || {}
                    let totalEstCost = 0
                    let totalActCost = 0
                    let hasAnyActual = false

                    const rowData = snap.snapshot.rows.map(row => {
                      const wc  = snap.snapshot.workCenters.find(w => w.id === row.workCenterId)
                      const emp = snap.snapshot.employees.find(e => e.id === row.employeeId)
                      const rate = (emp?.laborRate ?? 0) + (wc?.electricityCost ?? 0) + (wc?.depreciationCost ?? 0)
                      const estCost = (row.timeMinutes / 60) * rate * row.iterations
                      const actual  = rowMap[row.id]
                      const actTime   = actual?.timeMinutes ?? 0
                      const actIters  = actual?.iterations ?? row.iterations
                      const actCost   = (actTime / 60) * rate * actIters
                      const hasActual = actTime > 0
                      totalEstCost += estCost
                      if (hasActual) { totalActCost += actCost; hasAnyActual = true }
                      const delta = estCost > 0 && hasActual ? ((actCost - estCost) / estCost) * 100 : null
                      const dc    = delta == null ? "" : Math.abs(delta) <= 10 ? "text-emerald-600" : Math.abs(delta) <= 25 ? "text-amber-600" : "text-red-600"
                      return { row, wc, estCost, actTime, actIters, actCost, hasActual, delta, dc }
                    })

                    const totalDelta = totalEstCost > 0 && hasAnyActual
                      ? ((totalActCost - totalEstCost) / totalEstCost) * 100 : null
                    const totalDc   = totalDelta == null ? "" : Math.abs(totalDelta) <= 10 ? "text-emerald-600" : Math.abs(totalDelta) <= 25 ? "text-amber-600" : "text-red-600"

                    return (
                      <>
                        <Separator />
                        <div className="px-4 py-3 space-y-3">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="border-0">
                                  <TableHead colSpan={2} />
                                  <TableHead colSpan={2} className="text-[10px] text-center text-muted-foreground bg-muted/40 border-l border-r">Estimated</TableHead>
                                  <TableHead colSpan={3} className="text-[10px] text-center text-blue-600 bg-blue-50/60">Actual</TableHead>
                                  <TableHead />
                                </TableRow>
                                <TableRow>
                                  <TableHead className="text-xs">Operation</TableHead>
                                  <TableHead className="text-xs">Work Center</TableHead>
                                  <TableHead className="text-xs text-right border-l">Time</TableHead>
                                  <TableHead className="text-xs text-right border-r">Cost</TableHead>
                                  <TableHead className="text-xs w-20">Time</TableHead>
                                  <TableHead className="text-xs w-16">Iters</TableHead>
                                  <TableHead className="text-xs text-right">Cost</TableHead>
                                  <TableHead className="text-xs text-right w-14">Δ%</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {rowData.map(({ row, wc, estCost, actTime, actIters, actCost, hasActual, delta, dc }) => (
                                  <TableRow key={row.id}>
                                    <TableCell className="py-1 text-xs">{row.operationName || "—"}</TableCell>
                                    <TableCell className="py-1 text-xs text-muted-foreground">{wc?.name || "—"}</TableCell>
                                    <TableCell className="py-1 text-xs text-right font-mono border-l">{row.timeMinutes}</TableCell>
                                    <TableCell className="py-1 text-xs text-right font-mono border-r">${estCost.toFixed(2)}</TableCell>
                                    <TableCell className="py-1">
                                      <Input
                                        type="number" min={0}
                                        className="!h-6 text-xs"
                                        value={actTime || ""}
                                        placeholder="0"
                                        onChange={e => setLocalActualRows(prev => ({
                                          ...prev,
                                          [snap.id]: { ...prev[snap.id], [row.id]: { timeMinutes: parseFloat(e.target.value) || 0, iterations: actIters } }
                                        }))}
                                      />
                                    </TableCell>
                                    <TableCell className="py-1">
                                      <Input
                                        type="number" min={1}
                                        className="!h-6 text-xs"
                                        value={actIters}
                                        onChange={e => setLocalActualRows(prev => ({
                                          ...prev,
                                          [snap.id]: { ...prev[snap.id], [row.id]: { timeMinutes: actTime, iterations: Math.max(1, parseInt(e.target.value) || 1) } }
                                        }))}
                                      />
                                    </TableCell>
                                    <TableCell className="py-1 text-xs text-right font-mono">
                                      {hasActual ? `$${actCost.toFixed(2)}` : "—"}
                                    </TableCell>
                                    <TableCell className={`py-1 text-xs text-right font-mono font-semibold ${dc}`}>
                                      {delta != null ? `${delta > 0 ? "+" : ""}${delta.toFixed(0)}%` : "—"}
                                    </TableCell>
                                  </TableRow>
                                ))}
                                <TableRow className="bg-muted/30 border-t-2">
                                  <TableCell colSpan={2} className="py-2 text-xs font-semibold">Total</TableCell>
                                  <TableCell colSpan={2} className="py-2 text-xs text-right font-mono font-semibold border-l border-r">
                                    ${totalEstCost.toFixed(2)}
                                  </TableCell>
                                  <TableCell colSpan={2} />
                                  <TableCell className="py-2 text-xs text-right font-mono font-semibold">
                                    {hasAnyActual ? `$${totalActCost.toFixed(2)}` : "—"}
                                  </TableCell>
                                  <TableCell className={`py-2 text-xs text-right font-mono font-semibold ${totalDc}`}>
                                    {totalDelta != null ? `${totalDelta > 0 ? "+" : ""}${totalDelta.toFixed(0)}%` : "—"}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>

                          <div className="flex items-center gap-2">
                            <Input
                              className="h-8 text-xs flex-1"
                              placeholder="Notes..."
                              value={localNotes[snap.id] ?? ""}
                              onChange={e => setLocalNotes(n => ({ ...n, [snap.id]: e.target.value }))}
                            />
                            <Button size="sm" className="h-8 text-xs px-3 shrink-0" onClick={() => updateSnapshotValidation(snap.id)}>
                              Save Actual
                            </Button>
                            {snap.status !== "finalized" && snap.actualCost != null && (
                              <Button
                                size="sm" variant="outline"
                                className="h-8 text-xs px-3 shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => finalizeSnapshot(snap.id)}
                              >
                                Finalize
                              </Button>
                            )}
                            <Button
                              size="sm" variant="ghost"
                              className="h-8 w-8 p-0 shrink-0 text-red-400 hover:text-red-600"
                              onClick={() => deleteSnapshot(snap.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </Card>
              )
            })
          )}
        </div>
      )}

    </div>
  )
}
