"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function CapacityPlanningTool() {
  // User Inputs for Scenario Parameters
  const [targetAnnualRevenue, setTargetAnnualRevenue] = useState<number | null>(1000000)
  const [numStaff, setNumStaff] = useState<number | null>(5)
  const [desiredWeeklySwatches, setDesiredWeeklySwatches] = useState<number | null>(20)
  const [desiredWeeklySamples, setDesiredWeeklySamples] = useState<number | null>(4)
  const [desiredWeeklyGrading, setDesiredWeeklyGrading] = useState<number | null>(2)
  const [avgGarmentPrice, setAvgGarmentPrice] = useState<number | null>(150)

  // Adjustable Parameters
  const [laborRatePerHour, setLaborRatePerHour] = useState<number | null>(30)
  const [workHoursPerWeekPerPerson, setWorkHoursPerWeekPerPerson] = useState<number | null>(40)
  const [swatchPrice, setSwatchPrice] = useState<number | null>(250)
  const [samplePrice, setSamplePrice] = useState<number | null>(2000)
  const [gradingPrice, setGradingPrice] = useState<number | null>(2500)

  // Service Time Details (in minutes) - Used for labor hour calculations, only knitting
  const [swatchKnittingMin, setSwatchKnittingMin] = useState<number | null>(25)
  const [sampleKnittingMin, setSampleKnittingMin] = useState<number | null>(100)
  const [gradingKnittingMin, setGradingKnittingMin] = useState<number | null>(450)

  // Number of Machines
  const [numE72StollMachines, setNumE72StollMachines] = useState<number | null>(3)
  const [numE35StollMachines, setNumE35StollMachines] = useState<number | null>(1)
  const [numE18SwgMachines, setNumE18SwgMachines] = useState<number | null>(1)

  // Capacity per Machine (Units per Day) - These are inputs for the *potential* daily units
  const [e72StollCapacityPerMachine, setE72StollCapacityPerMachine] = useState<number | null>(8)
  const [e35StollCapacityPerMachine, setE35StollCapacityPerMachine] = useState<number | null>(10)
  const [e18SwgCapacityPerMachine, setE18SwgCapacityPerMachine] = useState<number | null>(16)

  // NEW: Capacity per Machine (Hours per Day)
  const [e72StollHoursPerDay, setE72StollHoursPerDay] = useState<number | null>(8)
  const [e35StollHoursPerDay, setE35StollHoursPerDay] = useState<number | null>(8)
  const [e18SwgHoursPerDay, setE18SwgHoursPerDay] = useState<number | null>(8)

  // NEW: Internal constants for actual knitting times per PRODUCTION garment (from user input)
  const PROD_KNITTING_TIME_E72 = 60
  const PROD_KNITTING_TIME_E35 = 50
  const PROD_KNITTING_TIME_E18 = 30

  // Derived Actual Machine Capacity (Units per Day)
  const derivedE72StollActualCapacity = (numE72StollMachines ?? 0) * (e72StollCapacityPerMachine ?? 0)
  const derivedE35StollActualCapacity = (numE35StollMachines ?? 0) * (e35StollCapacityPerMachine ?? 0)
  const derivedE18SwgActualCapacity = (numE18SwgMachines ?? 0) * (e18SwgCapacityPerMachine ?? 0)

  // Development Mix
  const [developmentMix, setDevelopmentMix] = useState<string | null>("production-only")

  // Fixed total machine minutes per week as per user's statement
  const TOTAL_FIXED_MACHINE_MINUTES_WEEKLY = 12000

  // Effect to update desired development units when developmentMix changes
  useEffect(() => {
    if (developmentMix === "production-only") {
      setDesiredWeeklySwatches(0)
      setDesiredWeeklySamples(0)
      setDesiredWeeklyGrading(0)
    } else if (developmentMix === "development-only") {
      // Set desired development items to consume the full 12000 minutes proportionally
      // Based on user's "best dev case" example: 80 swatches (2000 min), 19 samples (1900 min), 18 grading (8100 min) = 12000 min
      setDesiredWeeklySwatches(80)
      setDesiredWeeklySamples(19)
      setDesiredWeeklyGrading(18)
    }
    // For "production-and-development", user inputs are kept as is.
  }, [developmentMix])

  const handleResetToDefaults = useCallback(() => {
    setTargetAnnualRevenue(1000000)
    setNumStaff(5)
    setDesiredWeeklySwatches(0) // Will be updated by useEffect based on developmentMix
    setDesiredWeeklySamples(0) // Will be updated by useEffect based on developmentMix
    setDesiredWeeklyGrading(0) // Will be updated by useEffect based on developmentMix
    setAvgGarmentPrice(150)

    setLaborRatePerHour(30)
    setWorkHoursPerWeekPerPerson(40)
    setSwatchPrice(250)
    setSamplePrice(2000)
    setGradingPrice(2500)

    setSwatchKnittingMin(25)
    setSampleKnittingMin(100)
    setGradingKnittingMin(450)

    setNumE72StollMachines(3)
    setNumE35StollMachines(1)
    setNumE18SwgMachines(1)

    setE72StollCapacityPerMachine(8)
    setE35StollCapacityPerMachine(10)
    setE18SwgCapacityPerMachine(16)

    setE72StollHoursPerDay(8) // Reset new hours per day
    setE35StollHoursPerDay(8)
    setE18SwgHoursPerDay(8)

    setDevelopmentMix("production-only") // This will trigger the useEffect to reset desiredWeeklyDev units
  }, [])

  const applyScenarioDefaults = useCallback((scenario: "production-only" | "dev-worst-case" | "dev-best-case") => {
    // Set base machine numbers and capacities first
    setNumE72StollMachines(3)
    setNumE35StollMachines(1)
    setNumE18SwgMachines(1)
    setE72StollCapacityPerMachine(8)
    setE35StollCapacityPerMachine(10)
    setE18SwgCapacityPerMachine(16)
    setE72StollHoursPerDay(8) // Set new hours per day
    setE35StollHoursPerDay(8)
    setE18SwgHoursPerDay(8)

    // Reset other parameters to defaults
    setTargetAnnualRevenue(1000000)
    setNumStaff(5)
    setLaborRatePerHour(30)
    setWorkHoursPerWeekPerPerson(40)
    setSwatchKnittingMin(25)
    setSampleKnittingMin(100)
    setGradingKnittingMin(450)

    if (scenario === "production-only") {
      setDevelopmentMix("production-only")
      setDesiredWeeklySwatches(0)
      setDesiredWeeklySamples(0)
      setDesiredWeeklyGrading(0)
      setSwatchPrice(100)
      setSamplePrice(2000)
      setGradingPrice(500)
      setAvgGarmentPrice(150)
    } else if (scenario === "dev-worst-case") {
      setDevelopmentMix("production-and-development")
      setDesiredWeeklySwatches(14)
      setDesiredWeeklySamples(6)
      setDesiredWeeklyGrading(4)
      setSwatchPrice(250)
      setSamplePrice(2000)
      setGradingPrice(2500)
      setAvgGarmentPrice(150) // Production is still active
    } else if (scenario === "dev-best-case") {
      setDevelopmentMix("development-only")
      setDesiredWeeklySwatches(80)
      setDesiredWeeklySamples(19)
      setDesiredWeeklyGrading(18)
      setSwatchPrice(250)
      setSamplePrice(2000)
      setGradingPrice(2500)
      setAvgGarmentPrice(0) // No production revenue in dev-only
    }
  }, [])

  const calculations = useMemo(() => {
    const currentNumStaff = numStaff ?? 5
    const currentAvgGarmentPrice = avgGarmentPrice ?? 150
    const currentLaborRatePerHour = laborRatePerHour ?? 30
    const currentWorkHoursPerWeekPerPerson = workHoursPerWeekPerPerson ?? 40

    // Total available labor hours per week (fixed to 1 shift)
    const totalAvailableLaborHoursPerWeek = currentNumStaff * currentWorkHoursPerWeekPerPerson
    const totalAvailableLaborHoursPerYear = totalAvailableLaborHoursPerWeek * 52

    // Calculate hours needed for desired development units (only knitting time)
    const knittingHoursPerSwatchCalc = (swatchKnittingMin ?? 0) / 60
    const knittingHoursPerSampleCalc = (sampleKnittingMin ?? 0) / 60
    const knittingHoursPerGradingCalc = (gradingKnittingMin ?? 0) / 60

    const totalDevelopmentKnittingHoursWeekly =
      (desiredWeeklySwatches ?? 0) * knittingHoursPerSwatchCalc +
      (desiredWeeklySamples ?? 0) * knittingHoursPerSampleCalc +
      (desiredWeeklyGrading ?? 0) * knittingHoursPerGradingCalc

    const totalDevelopmentMinutesWeekly = totalDevelopmentKnittingHoursWeekly * 60

    // Service pricing (using state variables)
    const currentSwatchPrice = swatchPrice ?? 0
    const currentSamplePrice = samplePrice ?? 0
    const currentGradingPrice = gradingPrice ?? 0

    let developmentRevenueWeekly =
      (desiredWeeklySwatches ?? 0) * currentSwatchPrice +
      (desiredWeeklySamples ?? 0) * currentSamplePrice +
      (desiredWeeklyGrading ?? 0) * currentGradingPrice

    if (developmentMix === "production-only") {
      developmentRevenueWeekly = 0
    }

    const developmentRevenueAnnual = developmentRevenueWeekly * 52

    // Remaining labor hours for production
    const remainingLaborHoursForProductionWeekly = totalAvailableLaborHoursPerWeek - totalDevelopmentKnittingHoursWeekly
    const remainingLaborHoursForProductionAnnual = remainingLaborHoursForProductionWeekly * 52

    // --- Machine Capacity Calculations based on Development Mix and User Inputs ---

    // Derived total machine minutes from user's machine configuration inputs
    const derivedTotalMachineMinutesFromInputsWeekly =
      ((numE72StollMachines ?? 0) * (e72StollHoursPerDay ?? 0) * 60 +
        (numE35StollMachines ?? 0) * (e35StollHoursPerDay ?? 0) * 60 +
        (numE18SwgMachines ?? 0) * (e18SwgHoursPerDay ?? 0) * 60) *
      5 // Multiply by 5 for weekly

    // Required machine minutes for desired development items
    const requiredDevMachineMinutesWeekly =
      (desiredWeeklySwatches ?? 0) * (swatchKnittingMin ?? 0) +
      (desiredWeeklySamples ?? 0) * (sampleKnittingMin ?? 0) +
      (desiredWeeklyGrading ?? 0) * (gradingKnittingMin ?? 0)

    // Remaining machine minutes for production, based on the FIXED total capacity
    const remainingProdMachineMinutesWeekly = Math.max(
      0,
      TOTAL_FIXED_MACHINE_MINUTES_WEEKLY - requiredDevMachineMinutesWeekly,
    )

    // Check for development over-allocation against the FIXED total capacity
    const isDevOverCapacity = requiredDevMachineMinutesWeekly > TOTAL_FIXED_MACHINE_MINUTES_WEEKLY

    // Calculate potential production minutes for each machine type if running only production
    const e72TotalProdMinutesPotentialWeekly =
      (numE72StollMachines ?? 0) * (e72StollCapacityPerMachine ?? 0) * PROD_KNITTING_TIME_E72 * 5
    const e35TotalProdMinutesPotentialWeekly =
      (numE35StollMachines ?? 0) * (e35StollCapacityPerMachine ?? 0) * PROD_KNITTING_TIME_E35 * 5
    const e18TotalProdMinutesPotentialWeekly =
      (numE18SwgMachines ?? 0) * (e18SwgCapacityPerMachine ?? 0) * PROD_KNITTING_TIME_E18 * 5

    const totalPotentialProdMinutesWeekly =
      e72TotalProdMinutesPotentialWeekly + e35TotalProdMinutesPotentialWeekly + e18TotalProdMinutesPotentialWeekly

    // Scale down production minutes if remaining time is less than potential
    const scalingFactor =
      totalPotentialProdMinutesWeekly > 0 ? remainingProdMachineMinutesWeekly / totalPotentialProdMinutesWeekly : 0

    const achievableE72ProdMinutesWeekly = e72TotalProdMinutesPotentialWeekly * scalingFactor
    const achievableE35ProdMinutesWeekly = e35TotalProdMinutesPotentialWeekly * scalingFactor
    const achievableE18ProdMinutesWeekly = e18TotalProdMinutesPotentialWeekly * scalingFactor

    // Convert achievable production minutes back to units per day for display
    const prodPayloadE72StollUnitsDisplay =
      PROD_KNITTING_TIME_E72 > 0 ? achievableE72ProdMinutesWeekly / PROD_KNITTING_TIME_E72 / 5 : 0
    const prodPayloadE35StollUnitsDisplay =
      PROD_KNITTING_TIME_E35 > 0 ? achievableE35ProdMinutesWeekly / PROD_KNITTING_TIME_E35 / 5 : 0
    const prodPayloadE18SwgUnitsDisplay =
      PROD_KNITTING_TIME_E18 > 0 ? achievableE18ProdMinutesWeekly / PROD_KNITTING_TIME_E18 / 5 : 0

    const totalDailyProdUnits =
      prodPayloadE72StollUnitsDisplay + prodPayloadE35StollUnitsDisplay + prodPayloadE18SwgUnitsDisplay

    const totalWeeklyProductionUnits = totalDailyProdUnits * 5
    const totalAnnualProductionUnits = totalDailyProdUnits * 5 * 52

    let productionRevenueAnnual = totalAnnualProductionUnits * currentAvgGarmentPrice

    if (developmentMix === "development-only") {
      productionRevenueAnnual = 0
    }
    const totalProjectedRevenue = productionRevenueAnnual + developmentRevenueAnnual

    // Calculate hours needed to reach target revenue
    let hoursToReachTargetRevenue = 0
    if (targetAnnualRevenue !== null && targetAnnualRevenue > developmentRevenueAnnual) {
      const remainingRevenueTarget = targetAnnualRevenue - developmentRevenueAnnual
      if (currentAvgGarmentPrice > 0 && totalDailyProdUnits > 0) {
        // Estimate average production time per garment based on current distribution
        const totalProdMinutesUsedWeekly =
          achievableE72ProdMinutesWeekly + achievableE35ProdMinutesWeekly + achievableE18ProdMinutesWeekly
        const avgProdTimePerGarment =
          totalWeeklyProductionUnits > 0 ? totalProdMinutesUsedWeekly / totalWeeklyProductionUnits : 0

        const requiredProductionUnits = remainingRevenueTarget / currentAvgGarmentPrice
        hoursToReachTargetRevenue =
          requiredProductionUnits * (avgProdTimePerGarment / 60) + totalDevelopmentKnittingHoursWeekly * 52
      }
    } else if (targetAnnualRevenue !== null && targetAnnualRevenue <= developmentRevenueAnnual) {
      hoursToReachTargetRevenue = totalDevelopmentKnittingHoursWeekly * 52 // Only development needed
    }

    // Determine if target revenue is achievable
    const isTargetAchievable = totalProjectedRevenue >= (targetAnnualRevenue ?? 0)
    const revenueGap = (targetAnnualRevenue ?? 0) - totalProjectedRevenue

    // Actual Development Capacity (Weekly Max if only that item is produced)
    const maxSwatchesIfOnlySwatches =
      (swatchKnittingMin ?? 0) > 0 ? TOTAL_FIXED_MACHINE_MINUTES_WEEKLY / (swatchKnittingMin ?? 1) : 0
    const maxSamplesIfOnlySamples =
      (sampleKnittingMin ?? 0) > 0 ? TOTAL_FIXED_MACHINE_MINUTES_WEEKLY / (sampleKnittingMin ?? 1) : 0
    const maxGradingIfOnlyGrading =
      (gradingKnittingMin ?? 0) > 0 ? TOTAL_FIXED_MACHINE_MINUTES_WEEKLY / (gradingKnittingMin ?? 1) : 0

    return {
      totalAvailableLaborHoursPerWeek,
      totalAvailableLaborHoursPerYear,
      totalDevelopmentHoursWeekly: totalDevelopmentKnittingHoursWeekly, // Renamed for clarity
      totalDevelopmentMinutesWeekly, // New
      developmentRevenueWeekly,
      developmentRevenueAnnual,
      remainingLaborHoursForProductionWeekly,
      remainingLaborHoursForProductionAnnual,
      achievableProductionUnitsAnnual: Math.floor(totalAnnualProductionUnits), // Use the newly calculated total annual production units
      productionRevenueAnnual,
      totalProjectedRevenue,
      isTargetAchievable,
      revenueGap,
      hoursToReachTargetRevenue,
      totalWeeklyProductionUnits,
      totalDailyProdUnits, // Added for total time calculation
      totalMonthlyProductionUnits: totalDailyProdUnits * (365 / 12),
      totalAnnualProductionUnits,
      currentLaborRatePerHour,
      isDevOverCapacity, // New warning flag
      prodPayloadE72StollUnitsDisplay,
      prodPayloadE35StollUnitsDisplay,
      prodPayloadE18SwgUnitsDisplay,
      totalMachineOperatingMinutesWeekly: TOTAL_FIXED_MACHINE_MINUTES_WEEKLY, // Use the fixed total
      derivedTotalMachineMinutesFromInputsWeekly, // New
      maxSwatchesIfOnlySwatches, // New
      maxSamplesIfOnlySamples, // New
      maxGradingIfOnlyGrading, // New
    }
  }, [
    targetAnnualRevenue,
    numStaff,
    desiredWeeklySwatches,
    desiredWeeklySamples,
    desiredWeeklyGrading,
    avgGarmentPrice,
    laborRatePerHour,
    workHoursPerWeekPerPerson,
    swatchKnittingMin,
    sampleKnittingMin,
    gradingKnittingMin,
    numE72StollMachines,
    numE35StollMachines,
    numE18SwgMachines,
    e72StollCapacityPerMachine,
    e35StollCapacityPerMachine,
    e18SwgCapacityPerMachine,
    e72StollHoursPerDay, // New dependency
    e35StollHoursPerDay, // New dependency
    e18SwgHoursPerDay, // New dependency
    developmentMix,
    swatchPrice,
    samplePrice,
    gradingPrice,
  ])

  const isProductionOnly = developmentMix === "production-only"
  const isDevelopmentOnly = developmentMix === "development-only"

  // Calculate individual development item totals for the table
  const swatchTotalMinutes = (desiredWeeklySwatches ?? 0) * (swatchKnittingMin ?? 0)
  const swatchTotalHours = swatchTotalMinutes / 60
  const sampleTotalMinutes = (desiredWeeklySamples ?? 0) * (sampleKnittingMin ?? 0)
  const sampleTotalHours = sampleTotalMinutes / 60
  const gradingTotalMinutes = (desiredWeeklyGrading ?? 0) * (gradingKnittingMin ?? 0)
  const gradingTotalHours = gradingTotalMinutes / 60

  // Calculate remaining machine time
  const remainingMachineMinutesWeekly = TOTAL_FIXED_MACHINE_MINUTES_WEEKLY - calculations.totalDevelopmentMinutesWeekly
  const remainingMachineHoursWeekly = remainingMachineMinutesWeekly / 60

  // Calculate total daily production time for each machine type
  const e72StollDailyTotalTime = calculations.prodPayloadE72StollUnitsDisplay * PROD_KNITTING_TIME_E72
  const e35StollDailyTotalTime = calculations.prodPayloadE35StollUnitsDisplay * PROD_KNITTING_TIME_E35
  const e18SwgDailyTotalTime = calculations.prodPayloadE18SwgUnitsDisplay * PROD_KNITTING_TIME_E18
  const totalDailyProductionTime = e72StollDailyTotalTime + e35StollDailyTotalTime + e18SwgDailyTotalTime
  const totalWeeklyProductionTime = totalDailyProductionTime * 5
  const totalAnnualProductionTime = totalWeeklyProductionTime * 52

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Capacity & Revenue Planning Tool</CardTitle>
          <CardDescription>Estimate production, staffing, and revenue based on your operational goals.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-revenue">Target Annual Revenue ($)</Label>
              <Input
                id="target-revenue"
                type="number"
                value={targetAnnualRevenue ?? ""}
                onChange={(e) =>
                  setTargetAnnualRevenue(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="num-staff">Number of Staff (Total)</Label>
              <Input
                id="num-staff"
                type="number"
                value={numStaff ?? ""}
                onChange={(e) => setNumStaff(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avg-garment-price">Avg Garment Price ($)</Label>
              <Input
                id="avg-garment-price"
                type="number"
                value={avgGarmentPrice ?? ""}
                onChange={(e) =>
                  setAvgGarmentPrice(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                }
                disabled={isDevelopmentOnly}
              />
            </div>
            <div className="space-y-2">
              <Label>Development Mix</Label>
              <Select
                value={developmentMix ?? ""}
                onValueChange={(value) => setDevelopmentMix(value === "" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production-only">Production Only</SelectItem>
                  <SelectItem value="development-only">Development Only</SelectItem>
                  <SelectItem value="production-and-development">Production and Development</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <h3 className="text-lg font-semibold mb-4">Desired Weekly Development Units</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weekly-swatches">Swatches</Label>
              <Input
                id="weekly-swatches"
                type="number"
                value={desiredWeeklySwatches ?? ""}
                onChange={(e) =>
                  setDesiredWeeklySwatches(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                }
                disabled={isProductionOnly || isDevelopmentOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekly-samples">Samples</Label>
              <Input
                id="weekly-samples"
                type="number"
                value={desiredWeeklySamples ?? ""}
                onChange={(e) =>
                  setDesiredWeeklySamples(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                }
                disabled={isProductionOnly || isDevelopmentOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekly-grading">Grading</Label>
              <Input
                id="weekly-grading"
                type="number"
                value={desiredWeeklyGrading ?? ""}
                onChange={(e) =>
                  setDesiredWeeklyGrading(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                }
                disabled={isProductionOnly || isDevelopmentOnly}
              />
            </div>
          </div>
          {calculations.isDevOverCapacity && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              Warning: Desired development work ({calculations.totalDevelopmentMinutesWeekly.toFixed(0)} minutes)
              exceeds total available machine capacity ({TOTAL_FIXED_MACHINE_MINUTES_WEEKLY} minutes). Production will
              be impacted.
            </div>
          )}

          <Separator />

          {/* Scenario Selection Buttons */}
          <h3 className="text-lg font-semibold mb-4">Load Scenarios</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => applyScenarioDefaults("production-only")}>Production Only</Button>
            <Button onClick={() => applyScenarioDefaults("dev-best-case")}>Development Only</Button>
            <Button onClick={() => applyScenarioDefaults("dev-worst-case")}>Dev Worst Case + Production </Button>
          </div>

          <Separator />

          {/* New Section for Adjustable Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Capacity Planning Settings</CardTitle>
              <CardDescription>Adjust the underlying rates and capacities for calculations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <h4 className="font-medium text-gray-700">General Labor Rates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="labor-rate-per-hour">Labor Rate ($/hour)</Label>
                  <Input
                    id="labor-rate-per-hour"
                    type="number"
                    step="0.01"
                    value={laborRatePerHour ?? ""}
                    onChange={(e) =>
                      setLaborRatePerHour(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work-hours-per-week-per-person">Work Hours/Week/Person</Label>
                  <Input
                    id="work-hours-per-week-per-person"
                    type="number"
                    value={workHoursPerWeekPerPerson ?? ""}
                    onChange={(e) =>
                      setWorkHoursPerWeekPerPerson(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <Separator />

              <h4 className="font-medium text-gray-700">Service Pricing ($)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="swatch-price">Swatch Price</Label>
                  <Input
                    id="swatch-price"
                    type="number"
                    step="0.01"
                    value={swatchPrice ?? ""}
                    onChange={(e) =>
                      setSwatchPrice(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sample-price">Sample Price</Label>
                  <Input
                    id="sample-price"
                    type="number"
                    step="0.01"
                    value={samplePrice ?? ""}
                    onChange={(e) =>
                      setSamplePrice(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grading-price">Grading Price</Label>
                  <Input
                    id="grading-price"
                    type="number"
                    step="0.01"
                    value={gradingPrice ?? ""}
                    onChange={(e) =>
                      setGradingPrice(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <Separator />

              <h4 className="font-medium text-gray-700">Number of Machines</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="num-e72-stoll-machines">E7.2 STOLL</Label>
                  <Input
                    id="num-e72-stoll-machines"
                    type="number"
                    value={numE72StollMachines ?? ""}
                    onChange={(e) =>
                      setNumE72StollMachines(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num-e35-stoll-machines">E3.5,2 STOLL</Label>
                  <Input
                    id="num-e35-stoll-machines"
                    type="number"
                    value={numE35StollMachines ?? ""}
                    onChange={(e) =>
                      setNumE35StollMachines(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="num-e18-swg-machines">E18 SWG</Label>
                  <Input
                    id="num-e18-swg-machines"
                    type="number"
                    value={numE18SwgMachines ?? ""}
                    onChange={(e) =>
                      setNumE18SwgMachines(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <Separator />

              <h4 className="font-medium text-gray-700">Capacity per Machine (Units per Day)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="e72-stoll-capacity-per-machine">E7.2 STOLL</Label>
                  <Input
                    id="e72-stoll-capacity-per-machine"
                    type="number"
                    value={e72StollCapacityPerMachine ?? ""}
                    onChange={(e) =>
                      setE72StollCapacityPerMachine(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e35-stoll-capacity-per-machine">E3.5,2 STOLL</Label>
                  <Input
                    id="e35-stoll-capacity-per-machine"
                    type="number"
                    value={e35StollCapacityPerMachine ?? ""}
                    onChange={(e) =>
                      setE35StollCapacityPerMachine(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e18-swg-capacity-per-machine">E18 SWG</Label>
                  <Input
                    id="e18-swg-capacity-per-machine"
                    type="number"
                    value={e18SwgCapacityPerMachine ?? ""}
                    onChange={(e) =>
                      setE18SwgCapacityPerMachine(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <Separator />

              <h4 className="font-medium text-gray-700">Capacity per Machine (Hours per Day)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="e72-stoll-hours-per-day">E7.2 STOLL</Label>
                  <Input
                    id="e72-stoll-hours-per-day"
                    type="number"
                    value={e72StollHoursPerDay ?? ""}
                    onChange={(e) =>
                      setE72StollHoursPerDay(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e35-stoll-hours-per-day">E3.5,2 STOLL</Label>
                  <Input
                    id="e35-stoll-hours-per-day"
                    type="number"
                    value={e35StollHoursPerDay ?? ""}
                    onChange={(e) =>
                      setE35StollHoursPerDay(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e18-swg-hours-per-day">E18 SWG</Label>
                  <Input
                    id="e18-swg-hours-per-day"
                    type="number"
                    value={e18SwgHoursPerDay ?? ""}
                    onChange={(e) =>
                      setE18SwgHoursPerDay(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={handleResetToDefaults}>
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* New Card for Total Machine Capacity */}
          <Card>
            <CardHeader>
              <CardTitle>Total Machine Capacity</CardTitle>
              <CardDescription>Overall machine time available based on configuration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Weekly Machine Minutes (from inputs):</span>
                <Badge variant="secondary">
                  {calculations.derivedTotalMachineMinutesFromInputsWeekly.toFixed(0)} minutes
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Daily Machine Hours (from inputs):</span>
                <Badge variant="secondary">
                  {(calculations.derivedTotalMachineMinutesFromInputsWeekly / 5 / 60).toFixed(1)} hours
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Weekly Machine Hours (from inputs):</span>
                <Badge variant="secondary">
                  {(calculations.derivedTotalMachineMinutesFromInputsWeekly / 60).toFixed(1)} hours
                </Badge>
              </div>
              {Math.abs(calculations.derivedTotalMachineMinutesFromInputsWeekly - TOTAL_FIXED_MACHINE_MINUTES_WEEKLY) >
                1 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                  Warning: Your individual machine settings (
                  {calculations.derivedTotalMachineMinutesFromInputsWeekly.toFixed(0)} minutes/week) do not sum up to
                  the assumed total machine capacity of {TOTAL_FIXED_MACHINE_MINUTES_WEEKLY} minutes/week. Calculations
                  for remaining production and development over-capacity are based on the assumed total.
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* New Card for Development Payload */}
          <Card>
            <CardHeader>
              <CardTitle>Development Payload Weekly</CardTitle>
              <CardDescription>Current setup for development items and their machine time usage.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Development Item</TableHead>
                    <TableHead className="text-right"># of item</TableHead>
                    <TableHead className="text-right">Time taken per unit (Minutes)</TableHead>
                    <TableHead className="text-right">Total time used (Minutes)</TableHead>
                    <TableHead className="text-right">Total time used (Hours)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Swatches</TableCell>
                    <TableCell className="flex justify-end">
                      <Input
                        type="number"
                        value={desiredWeeklySwatches ?? ""}
                        onChange={(e) =>
                          setDesiredWeeklySwatches(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                        }
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className="w-24 text-right">
                      <Input
                        type="number"
                        value={swatchKnittingMin ?? ""}
                        onChange={(e) =>
                          setSwatchKnittingMin(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                        }
                        className="w-24 text-right"
                        disabled={true}
                      />
                    </TableCell>
                    <TableCell className="text-right">{swatchTotalMinutes.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{swatchTotalHours.toFixed(1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Samples</TableCell>
                    <TableCell className="flex justify-end">
                      <Input
                        type="number"
                        value={desiredWeeklySamples ?? ""}
                        onChange={(e) =>
                          setDesiredWeeklySamples(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                        }
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className="w-24 text-right">
                      <Input
                        type="number"
                        value={sampleKnittingMin ?? ""}
                        onChange={(e) =>
                          setSampleKnittingMin(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                        }
                        disabled={true}
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">{sampleTotalMinutes.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{sampleTotalHours.toFixed(1)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Grading</TableCell>
                    <TableCell className="flex justify-end">
                      <Input
                        type="number"
                        value={desiredWeeklyGrading ?? ""}
                        onChange={(e) =>
                          setDesiredWeeklyGrading(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                        }
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className="w-24 text-right">
                      <Input
                        type="number"
                        value={gradingKnittingMin ?? ""}
                        onChange={(e) =>
                          setGradingKnittingMin(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                        }
                        disabled={true}
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">{gradingTotalMinutes.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{gradingTotalHours.toFixed(1)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-gray-50">
                    <TableCell>Total Development Time</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">
                      {calculations.totalDevelopmentMinutesWeekly.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">{calculations.totalDevelopmentHoursWeekly.toFixed(1)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-blue-50">
                    <TableCell>Remaining Machine Time</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">{remainingMachineMinutesWeekly.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{remainingMachineHoursWeekly.toFixed(1)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Separator />

          <h3 className="text-lg font-semibold mb-4">Calculated Capacity & Revenue</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="col-span-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Projected Annual Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${calculations.totalProjectedRevenue.toLocaleString()}
                </div>
                {targetAnnualRevenue !== null && (
                  <div
                    className={`text-sm mt-1 ${calculations.isTargetAchievable ? "text-green-500" : "text-red-500"}`}
                  >
                    {calculations.isTargetAchievable
                      ? `Target met! Surplus: $${Math.abs(calculations.revenueGap).toLocaleString()}`
                      : `Target shortfall: $${Math.abs(calculations.revenueGap).toLocaleString()}`}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Annual Development Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ${calculations.developmentRevenueAnnual.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Weekly: ${calculations.developmentRevenueWeekly.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Achievable Annual Production Units</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {calculations.achievableProductionUnitsAnnual.toLocaleString()} units
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Annual Production Revenue: ${calculations.productionRevenueAnnual.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Available Labor Hours (Annual)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">
                  {calculations.totalAvailableLaborHoursPerYear.toLocaleString()} hours
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Weekly: {calculations.totalAvailableLaborHoursPerWeek.toLocaleString()} hours
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Labor Hour Allocation (Weekly)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Weekly working hour total</TableCell>
                    <TableCell className="text-right">
                      {calculations.totalAvailableLaborHoursPerWeek.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">100%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Development (Total)</TableCell>
                    <TableCell className="text-right">{calculations.totalDevelopmentHoursWeekly.toFixed(1)}</TableCell>
                    <TableCell className="text-right">
                      {(
                        (calculations.totalDevelopmentHoursWeekly / calculations.totalAvailableLaborHoursPerWeek) *
                        100
                      ).toFixed(1)}
                      %
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Production (TOTAL)</TableCell>
                    <TableCell className="text-right">
                      {calculations.remainingLaborHoursForProductionWeekly.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      {(
                        (calculations.remainingLaborHoursForProductionWeekly /
                          calculations.totalAvailableLaborHoursPerWeek) *
                        100
                      ).toFixed(1)}
                      %
                    </TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-gray-50">
                    <TableCell>Remaining Time</TableCell>
                    <TableCell className="text-right">0.0</TableCell>
                    <TableCell className="text-right">0.0%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* New Card for Actual Development Capacity */}
          <Card>
            <CardHeader>
              <CardTitle>Actual Development Capacity (Weekly Max)</CardTitle>
              <CardDescription>
                Maximum achievable development units if all {TOTAL_FIXED_MACHINE_MINUTES_WEEKLY} weekly machine minutes
                were dedicated to a single type or a specific combo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Development Item</TableHead>
                    <TableHead className="text-right">Max Units/Week</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Swatches (if only swatches)</TableCell>
                    <TableCell className="text-right">{calculations.maxSwatchesIfOnlySwatches.toFixed(0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Samples (if only samples)</TableCell>
                    <TableCell className="text-right">{calculations.maxSamplesIfOnlySamples.toFixed(0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Grading (if only grading)</TableCell>
                    <TableCell className="text-right">{calculations.maxGradingIfOnlyGrading.toFixed(0)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-gray-50">
                    <TableCell>Combo (80 Swatches, 19 Samples, 18 Grading)</TableCell>
                    <TableCell className="text-right">80 Swatches, 19 Samples, 18 Grading</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Machine Capacity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700 mb-2">Actual Machine Capacity (Units per Day)</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Machine Type</TableHead>
                      <TableHead className="text-right">Units/Day</TableHead>
                      <TableHead className="text-right">Units/Week</TableHead>
                      <TableHead className="text-right">Units/Year</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>E7.2 STOLL</TableCell>
                      <TableCell className="text-right">{derivedE72StollActualCapacity}</TableCell>
                      <TableCell className="text-right">{(derivedE72StollActualCapacity * 5).toFixed(0)}</TableCell>
                      <TableCell className="text-right">
                        {(derivedE72StollActualCapacity * 5 * 52).toFixed(0)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>E3.5,2 STOLL</TableCell>
                      <TableCell className="text-right">{derivedE35StollActualCapacity}</TableCell>
                      <TableCell className="text-right">{(derivedE35StollActualCapacity * 5).toFixed(0)}</TableCell>
                      <TableCell className="text-right">
                        {(derivedE35StollActualCapacity * 5 * 52).toFixed(0)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>E18 SWG</TableCell>
                      <TableCell className="text-right">{derivedE18SwgActualCapacity}</TableCell>
                      <TableCell className="text-right">{(derivedE18SwgActualCapacity * 5).toFixed(0)}</TableCell>
                      <TableCell className="text-right">{(derivedE18SwgActualCapacity * 5 * 52).toFixed(0)}</TableCell>
                    </TableRow>
                    <TableRow className="font-bold bg-gray-50">
                      <TableCell>Total Actual</TableCell>
                      <TableCell className="text-right">
                        {derivedE72StollActualCapacity + derivedE35StollActualCapacity + derivedE18SwgActualCapacity}
                      </TableCell>
                      <TableCell className="text-right">
                        {(
                          (derivedE72StollActualCapacity +
                            derivedE35StollActualCapacity +
                            derivedE18SwgActualCapacity) *
                          5
                        ).toFixed(0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {(
                          (derivedE72StollActualCapacity +
                            derivedE35StollActualCapacity +
                            derivedE18SwgActualCapacity) *
                          5 *
                          52
                        ).toFixed(0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <Separator className="my-4" />

              <h4 className="font-medium text-gray-700 mb-2">
                {isProductionOnly ? "Production Payload (Daily)" : "Production Payload (Units/Day)"}
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Machine Type</TableHead>
                    <TableHead className="text-right">Units/Day</TableHead>
                    <TableHead className="text-right">Time per Unit (Minutes)</TableHead>
                    <TableHead className="text-right">Total Time (Minutes/Day)</TableHead>
                    <TableHead className="text-right">Units/Week</TableHead>
                    <TableHead className="text-right">Units/Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>E7.2 STOLL</TableCell>
                    <TableCell className="flex justify-end">
                      <Input
                        type="number"
                        value={calculations.prodPayloadE72StollUnitsDisplay.toFixed(1)}
                        disabled
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">{PROD_KNITTING_TIME_E72}</TableCell>
                    <TableCell className="text-right">{e72StollDailyTotalTime.toFixed(1)}</TableCell>
                    <TableCell className="text-right">
                      {(calculations.prodPayloadE72StollUnitsDisplay * 5).toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      {(calculations.prodPayloadE72StollUnitsDisplay * 5 * 52).toFixed(1)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>E3.5,2 STOLL</TableCell>
                    <TableCell className="flex justify-end">
                      <Input
                        type="number"
                        value={calculations.prodPayloadE35StollUnitsDisplay.toFixed(1)}
                        disabled
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">{PROD_KNITTING_TIME_E35}</TableCell>
                    <TableCell className="text-right">{e35StollDailyTotalTime.toFixed(1)}</TableCell>
                    <TableCell className="text-right">
                      {(calculations.prodPayloadE35StollUnitsDisplay * 5).toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      {(calculations.prodPayloadE35StollUnitsDisplay * 5 * 52).toFixed(1)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>E18 SWG</TableCell>
                    <TableCell className="flex justify-end">
                      <Input
                        type="number"
                        value={calculations.prodPayloadE18SwgUnitsDisplay.toFixed(1)}
                        disabled
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">{PROD_KNITTING_TIME_E18}</TableCell>
                    <TableCell className="text-right">{e18SwgDailyTotalTime.toFixed(1)}</TableCell>
                    <TableCell className="text-right">
                      {(calculations.prodPayloadE18SwgUnitsDisplay * 5).toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      {(calculations.prodPayloadE18SwgUnitsDisplay * 5 * 52).toFixed(1)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-gray-50">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">
                      {(
                        calculations.prodPayloadE72StollUnitsDisplay +
                        calculations.prodPayloadE35StollUnitsDisplay +
                        calculations.prodPayloadE18SwgUnitsDisplay
                      ).toFixed(1)}
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">{totalDailyProductionTime.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{calculations.totalWeeklyProductionUnits.toFixed(1)}</TableCell>
                    <TableCell className="text-right">
                      {calculations.totalAnnualProductionUnits.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-blue-50">
                    <TableCell>Total Time (Minutes/Day)</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">{totalDailyProductionTime.toFixed(1)}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-blue-50">
                    <TableCell>Total Time (Minutes/Week)</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">{totalWeeklyProductionTime.toFixed(1)}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-blue-50">
                    <TableCell>Total Time (Minutes/Year)</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">{totalAnnualProductionTime.toLocaleString()}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {targetAnnualRevenue !== null && (
            <Card>
              <CardHeader>
                <CardTitle>Hours to Reach Target Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {calculations.hoursToReachTargetRevenue.toLocaleString()} hours/year
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  This is the estimated total labor hours required annually to achieve your target revenue of $
                  {targetAnnualRevenue.toLocaleString()}, given your desired development mix and average garment price.
                </p>
                {!calculations.isTargetAchievable && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                    Warning: Your current setup (staff, shifts, development goals) may not be sufficient to reach this
                    target. Consider increasing staff, shifts, or adjusting development/production mix.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
