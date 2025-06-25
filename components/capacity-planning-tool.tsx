"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export function CapacityPlanningTool() {
  // User Inputs for Scenario Parameters
  const [targetAnnualRevenue, setTargetAnnualRevenue] = useState<number | null>(100000000)
  const [numStaff, setNumStaff] = useState<number | null>(5)
  const [desiredWeeklySwatches, setDesiredWeeklySwatches] = useState<number | null>(20)
  const [desiredWeeklySamples, setDesiredWeeklySamples] = useState<number | null>(4)
  const [desiredWeeklyGrading, setDesiredWeeklyGrading] = useState<number | null>(2)
  const [avgGarmentPrice, setAvgGarmentPrice] = useState<number | null>(150)

  // Adjustable Parameters
  const [laborRatePerHour, setLaborRatePerHour] = useState<number | null>(30)
  const [workHoursPerWeekPerPerson, setWorkHoursPerWeekPerPerson] = useState<number | null>(40)
  const [swatchPrice, setSwatchPrice] = useState<number | null>(100)
  const [samplePrice, setSamplePrice] = useState<number | null>(2000)
  const [gradingPrice, setGradingPrice] = useState<number | null>(500)

  // Service Time Details (in minutes) - Used for labor hour calculations, only knitting
  const [swatchKnittingMin, setSwatchKnittingMin] = useState<number | null>(25)
  const [sampleKnittingMin, setSampleKnittingMin] = useState<number | null>(100)
  const [gradingKnittingMin, setGradingKnittingMin] = useState<number | null>(450)

  // Number of Machines
  const [numE72StollMachines, setNumE72StollMachines] = useState<number | null>(3)
  const [numE35StollMachines, setNumE35StollMachines] = useState<number | null>(1)
  const [numE18SwgMachines, setNumE18SwgMachines] = useState<number | null>(1)

  // NEW: Capacity per Machine (Units per Day)
  const [e72StollCapacityPerMachine, setE72StollCapacityPerMachine] = useState<number | null>(8)
  const [e35StollCapacityPerMachine, setE35StollCapacityPerMachine] = useState<number | null>(10)
  const [e18SwgCapacityPerMachine, setE18SwgCapacityPerMachine] = useState<number | null>(16)

  // Internal constants for actual knitting times per garment (from spreadsheet)
  const E72_STOLL_KNITTING_TIME_PER_GARMENT = 3
  const E35_STOLL_KNITTING_TIME_PER_GARMENT = 1
  const E18_SWG_KNITTING_TIME_PER_GARMENT = 1

  // Derived Actual Machine Capacity (Units per Day)
  const derivedE72StollActualCapacity = (numE72StollMachines ?? 0) * (e72StollCapacityPerMachine ?? 0)
  const derivedE35StollActualCapacity = (numE35StollMachines ?? 0) * (e35StollCapacityPerMachine ?? 0)
  const derivedE18SwgActualCapacity = (numE18SwgMachines ?? 0) * (e18SwgCapacityPerMachine ?? 0)

  // Existing states for Development Payload (Units per Day) per machine
  const [devPayloadE72StollUnits, setDevPayloadE72StollUnits] = useState<number | null>(0)
  const [devPayloadE35StollUnits, setDevPayloadE35StollUnits] = useState<number | null>(0)
  const [devPayloadE18SwgUnits, setDevPayloadE18SwgUnits] = useState<number | null>(0)

  // Existing states for Production Payload (Units per Day) per machine
  const [prodPayloadE72StollUnits, setProdPayloadE72StollUnits] = useState<number | null>(derivedE72StollActualCapacity)
  const [prodPayloadE35StollUnits, setProdPayloadE35StollUnits] = useState<number | null>(derivedE35StollActualCapacity)
  const [prodPayloadE18SwgUnits, setProdPayloadE18SwgUnits] = useState<number | null>(derivedE18SwgActualCapacity)

  // Development Mix
  const [developmentMix, setDevelopmentMix] = useState<string | null>("production-only")

  // Helper function to handle interdependent changes for development units
  const handleDevUnitsChange = useCallback(
    (machine: "e72" | "e35" | "e18", value: number | null) => {
      const newDevUnits = value ?? 0
      let actualCap = 0
      let setDev: (val: number | null) => void
      let setProd: (val: number | null) => void

      if (machine === "e72") {
        actualCap = derivedE72StollActualCapacity
        setDev = setDevPayloadE72StollUnits
        setProd = setProdPayloadE72StollUnits
      } else if (machine === "e35") {
        actualCap = derivedE35StollActualCapacity
        setDev = setDevPayloadE35StollUnits
        setProd = setProdPayloadE35StollUnits
      } else {
        actualCap = derivedE18SwgActualCapacity
        setDev = setDevPayloadE18SwgUnits
        setProd = setProdPayloadE18SwgUnits
      }

      const cappedDevUnits = Math.min(newDevUnits, actualCap)
      const newProdUnits = Math.max(0, actualCap - cappedDevUnits)

      setDev(cappedDevUnits)
      setProd(newProdUnits)
    },
    [derivedE72StollActualCapacity, derivedE35StollActualCapacity, derivedE18SwgActualCapacity],
  )

  // Helper function to handle interdependent changes for production units
  const handleProdUnitsChange = useCallback(
    (machine: "e72" | "e35" | "e18", value: number | null) => {
      const newProdUnits = value ?? 0
      let actualCap = 0
      let setDev: (val: number | null) => void
      let setProd: (val: number | null) => void

      if (machine === "e72") {
        actualCap = derivedE72StollActualCapacity
        setDev = setDevPayloadE72StollUnits
        setProd = setProdPayloadE72StollUnits
      } else if (machine === "e35") {
        actualCap = derivedE35StollActualCapacity
        setDev = setDevPayloadE35StollUnits
        setProd = setProdPayloadE35StollUnits
      } else {
        actualCap = derivedE18SwgActualCapacity
        setDev = setDevPayloadE18SwgUnits
        setProd = setProdPayloadE18SwgUnits
      }

      const cappedProdUnits = Math.min(newProdUnits, actualCap)
      const newDevUnits = Math.max(0, actualCap - cappedProdUnits)

      setProd(cappedProdUnits)
      setDev(newDevUnits)
    },
    [derivedE72StollActualCapacity, derivedE35StollActualCapacity, derivedE18SwgActualCapacity],
  )

  // Effect to update payload states when developmentMix changes or derived capacities change
  useEffect(() => {
    if (developmentMix === "production-only") {
      setDevPayloadE72StollUnits(0)
      setDevPayloadE35StollUnits(0)
      setDevPayloadE18SwgUnits(0)
      setProdPayloadE72StollUnits(derivedE72StollActualCapacity)
      setProdPayloadE35StollUnits(derivedE35StollActualCapacity)
      setProdPayloadE18SwgUnits(derivedE18SwgActualCapacity)
    } else if (developmentMix === "development-only") {
      setProdPayloadE72StollUnits(0)
      setProdPayloadE35StollUnits(0)
      setProdPayloadE18SwgUnits(0)
      setDevPayloadE72StollUnits(derivedE72StollActualCapacity)
      setDevPayloadE35StollUnits(derivedE35StollActualCapacity)
      setDevPayloadE18SwgUnits(derivedE18SwgActualCapacity)
    } else {
      // "production-and-development" - no automatic reset, user can adjust
    }
  }, [developmentMix, derivedE72StollActualCapacity, derivedE35StollActualCapacity, derivedE18SwgActualCapacity])

  const handleResetToDefaults = useCallback(() => {
    setTargetAnnualRevenue(100000)
    setNumStaff(5)
    setDesiredWeeklySwatches(20)
    setDesiredWeeklySamples(4)
    setDesiredWeeklyGrading(2)
    setAvgGarmentPrice(150)

    setLaborRatePerHour(30)
    setWorkHoursPerWeekPerPerson(40)
    setSwatchPrice(100)
    setSamplePrice(2000)
    setGradingPrice(500)

    setSwatchKnittingMin(25)
    setSampleKnittingMin(100)
    setGradingKnittingMin(450)

    setNumE72StollMachines(3)
    setNumE35StollMachines(1)
    setNumE18SwgMachines(1)

    // Reset Capacity per Machine to defaults
    setE72StollCapacityPerMachine(8)
    setE35StollCapacityPerMachine(10)
    setE18SwgCapacityPerMachine(16)

    // Reset development mix and corresponding payloads based on new derived capacities
    setDevelopmentMix("production-only")
    setDevPayloadE72StollUnits(0)
    setDevPayloadE35StollUnits(0)
    setDevPayloadE18SwgUnits(0)
    setProdPayloadE72StollUnits(derivedE72StollActualCapacity)
    setProdPayloadE35StollUnits(derivedE35StollActualCapacity)
    setProdPayloadE18SwgUnits(derivedE18SwgActualCapacity)
  }, [derivedE72StollActualCapacity, derivedE35StollActualCapacity, derivedE18SwgActualCapacity])

  const applyScenarioDefaults = useCallback(
    (scenario: "production-only" | "dev-worst-case" | "dev-best-case") => {
      // Set base machine numbers and capacities first, then reset to defaults
      // to ensure derived capacities are correct before setting payloads
      setNumE72StollMachines(3)
      setNumE35StollMachines(1)
      setNumE18SwgMachines(1)
      setE72StollCapacityPerMachine(8)
      setE35StollCapacityPerMachine(10)
      setE18SwgCapacityPerMachine(16)

      // Now call handleResetToDefaults to reset other parameters and payloads
      // This will use the newly set machine capacities to derive actual capacities
      handleResetToDefaults()

      if (scenario === "production-only") {
        setDevelopmentMix("production-only")
        setDesiredWeeklySwatches(0)
        setDesiredWeeklySamples(0)
        setDesiredWeeklyGrading(0)
        setSwatchPrice(100) // Default price
        setSamplePrice(2000) // Default price
        setGradingPrice(500) // Default price
        // Payloads are set by useEffect based on developmentMix
      } else if (scenario === "dev-worst-case") {
        setDevelopmentMix("production-and-development")
        setDesiredWeeklySwatches(14)
        setDesiredWeeklySamples(6)
        setDesiredWeeklyGrading(4)
        setSwatchPrice(250) // Spreadsheet price
        setSamplePrice(2000) // Spreadsheet price
        setGradingPrice(2500) // Spreadsheet price
        // Manually set payloads for this specific scenario
        setProdPayloadE72StollUnits(16)
        setProdPayloadE35StollUnits(2)
        setProdPayloadE18SwgUnits(3)
        setDevPayloadE72StollUnits(derivedE72StollActualCapacity - 16) // Derived from 24-16
        setDevPayloadE35StollUnits(derivedE35StollActualCapacity - 2) // Derived from 10-2
        setDevPayloadE18SwgUnits(derivedE18SwgActualCapacity - 3) // Derived from 16-3
      } else if (scenario === "dev-best-case") {
        setDevelopmentMix("development-only")
        setDesiredWeeklySwatches(80)
        setDesiredWeeklySamples(19)
        setDesiredWeeklyGrading(18)
        setSwatchPrice(250) // Spreadsheet price
        setSamplePrice(2000) // Spreadsheet price
        setGradingPrice(2500) // Spreadsheet price
        // Payloads are set by useEffect based on developmentMix
      }
    },
    [handleResetToDefaults, derivedE72StollActualCapacity, derivedE35StollActualCapacity, derivedE18SwgActualCapacity],
  )

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

    // Total development hours weekly now only includes knitting
    const totalDevelopmentHoursWeekly = totalDevelopmentKnittingHoursWeekly

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
    const remainingLaborHoursForProductionWeekly = totalAvailableLaborHoursPerWeek - totalDevelopmentHoursWeekly
    const remainingLaborHoursForProductionAnnual = remainingLaborHoursForProductionWeekly * 52

    // --- Machine Capacity Calculations based on Development Mix and User Inputs ---
    const totalDevUnitsDaily =
      (devPayloadE72StollUnits ?? 0) + (devPayloadE35StollUnits ?? 0) + (devPayloadE18SwgUnits ?? 0)
    const totalProdUnitsDaily =
      (prodPayloadE72StollUnits ?? 0) + (prodPayloadE35StollUnits ?? 0) + (prodPayloadE18SwgUnits ?? 0)

    const totalWeeklyProductionUnits = totalProdUnitsDaily * 5
    const totalMonthlyProductionUnits = totalProdUnitsDaily * (365 / 12)
    const totalAnnualProductionUnits = totalProdUnitsDaily * 5 * 52

    // Calculate production units achievable with remaining labor hours
    const avgKnittingTimePerGarment =
      (E72_STOLL_KNITTING_TIME_PER_GARMENT + E35_STOLL_KNITTING_TIME_PER_GARMENT + E18_SWG_KNITTING_TIME_PER_GARMENT) /
      3
    const avgProductionHoursPerGarment = avgKnittingTimePerGarment / 60 // Convert minutes to hours

    let achievableProductionUnitsAnnualByLabor = 0
    if (avgProductionHoursPerGarment > 0) {
      achievableProductionUnitsAnnualByLabor = remainingLaborHoursForProductionAnnual / avgProductionHoursPerGarment
    }

    // Final achievable production units is the minimum of machine capacity (from inputs) and labor capacity
    const achievableProductionUnitsAnnual = Math.min(totalAnnualProductionUnits, achievableProductionUnitsAnnualByLabor)

    let productionRevenueAnnual = achievableProductionUnitsAnnual * currentAvgGarmentPrice

    if (developmentMix === "development-only") {
      productionRevenueAnnual = 0
    }
    const totalProjectedRevenue = productionRevenueAnnual + developmentRevenueAnnual

    // Calculate hours needed to reach target revenue
    let hoursToReachTargetRevenue = 0
    if (targetAnnualRevenue !== null && targetAnnualRevenue > developmentRevenueAnnual) {
      const remainingRevenueTarget = targetAnnualRevenue - developmentRevenueAnnual
      if (currentAvgGarmentPrice > 0 && avgProductionHoursPerGarment > 0) {
        const requiredProductionUnits = remainingRevenueTarget / currentAvgGarmentPrice
        hoursToReachTargetRevenue =
          requiredProductionUnits * avgProductionHoursPerGarment + totalDevelopmentHoursWeekly * 52
      }
    } else if (targetAnnualRevenue !== null && targetAnnualRevenue <= developmentRevenueAnnual) {
      hoursToReachTargetRevenue = totalDevelopmentHoursWeekly * 52 // Only development needed
    }

    // Determine if target revenue is achievable
    const isTargetAchievable = totalProjectedRevenue >= (targetAnnualRevenue ?? 0)
    const revenueGap = (targetAnnualRevenue ?? 0) - totalProjectedRevenue

    // Check for over-capacity in "production-and-development" mix (units based)
    const e72StollCombinedUnits = (devPayloadE72StollUnits ?? 0) + (prodPayloadE72StollUnits ?? 0)
    const e35StollCombinedUnits = (devPayloadE35StollUnits ?? 0) + (prodPayloadE35StollUnits ?? 0)
    const e18SwgCombinedUnits = (devPayloadE18SwgUnits ?? 0) + (prodPayloadE18SwgUnits ?? 0)

    const e72StollOverCapacity = e72StollCombinedUnits > derivedE72StollActualCapacity
    const e35StollOverCapacity = e35StollCombinedUnits > derivedE35StollActualCapacity
    const e18SwgOverCapacity = e18SwgCombinedUnits > derivedE18SwgActualCapacity

    return {
      totalAvailableLaborHoursPerWeek,
      totalAvailableLaborHoursPerYear,
      totalDevelopmentHoursWeekly,
      totalDevelopmentKnittingHoursWeekly,
      developmentRevenueWeekly,
      developmentRevenueAnnual,
      remainingLaborHoursForProductionWeekly,
      remainingLaborHoursForProductionAnnual,
      achievableProductionUnitsAnnual: Math.floor(achievableProductionUnitsAnnual),
      productionRevenueAnnual,
      totalProjectedRevenue,
      isTargetAchievable,
      revenueGap,
      hoursToReachTargetRevenue,
      totalDevUnitsDaily,
      totalProdUnitsDaily,
      totalWeeklyProductionUnits,
      totalMonthlyProductionUnits,
      totalAnnualProductionUnits,
      currentLaborRatePerHour,
      e72StollOverCapacity,
      e35StollOverCapacity,
      e18SwgOverCapacity,
      devPayloadE72StollUnits,
      prodPayloadE72StollUnits,
      devPayloadE35StollUnits,
      prodPayloadE35StollUnits,
      devPayloadE18SwgUnits,
      prodPayloadE18SwgUnits,
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
    e72StollCapacityPerMachine, // New dependency
    e35StollCapacityPerMachine, // New dependency
    e18SwgCapacityPerMachine, // New dependency
    developmentMix,
    devPayloadE72StollUnits,
    devPayloadE35StollUnits,
    devPayloadE18SwgUnits,
    prodPayloadE72StollUnits,
    prodPayloadE35StollUnits,
    prodPayloadE18SwgUnits,
    swatchPrice,
    samplePrice,
    gradingPrice,
    derivedE72StollActualCapacity, // Derived dependency
    derivedE35StollActualCapacity, // Derived dependency
    derivedE18SwgActualCapacity, // Derived dependency
  ])

  const isProductionOnly = developmentMix === "production-only"
  const isDevelopmentOnly = developmentMix === "development-only"
  const isProdAndDev = developmentMix === "production-and-development"

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
                disabled={isProductionOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekly-samples">Development Service</Label>
              <Input
                id="weekly-samples"
                type="number"
                value={desiredWeeklySamples ?? ""}
                onChange={(e) =>
                  setDesiredWeeklySamples(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                }
                disabled={isProductionOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekly-grading">Grading Service</Label>
              <Input
                id="weekly-grading"
                type="number"
                value={desiredWeeklyGrading ?? ""}
                onChange={(e) =>
                  setDesiredWeeklyGrading(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                }
                disabled={isProductionOnly}
              />
            </div>
          </div>

          <Separator />

          {/* Scenario Selection Buttons */}
          <h3 className="text-lg font-semibold mb-4">Load Scenarios</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => applyScenarioDefaults("production-only")}>Production Only</Button>
            <Button onClick={() => applyScenarioDefaults("dev-worst-case")}>Dev Worst Case + Production </Button>
            <Button onClick={() => applyScenarioDefaults("dev-best-case")}>Development Only</Button>
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

              <h4 className="font-medium text-gray-700">Service Knitting Time (Minutes per Unit)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h5 className="font-medium">Swatch</h5>
                  <div className="space-y-2">
                    <Label htmlFor="swatch-knitting-min">Knitting</Label>
                    <Input
                      id="swatch-knitting-min"
                      type="number"
                      value={swatchKnittingMin ?? ""}
                      onChange={(e) =>
                        setSwatchKnittingMin(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="font-medium">Development Service</h5>
                  <div className="space-y-2">
                    <Label htmlFor="sample-knitting-min">Knitting</Label>
                    <Input
                      id="sample-knitting-min"
                      type="number"
                      value={sampleKnittingMin ?? ""}
                      onChange={(e) =>
                        setSampleKnittingMin(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="font-medium">Grading</h5>
                  <div className="space-y-2">
                    <Label htmlFor="grading-knitting-min">Knitting</Label>
                    <Input
                      id="grading-knitting-min"
                      type="number"
                      value={gradingKnittingMin ?? ""}
                      onChange={(e) =>
                        setGradingKnittingMin(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
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
                  <Label htmlFor="sample-price">Development Service Price</Label>
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
                  <Label htmlFor="grading-price">Grading Service Price</Label>
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

              <div className="flex justify-end">
                <Button variant="outline" onClick={handleResetToDefaults}>
                  Reset to Defaults
                </Button>
              </div>
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
                    <TableCell>Total Available</TableCell>
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
                  <TableRow className="font-bold bg-gray-50">
                    <TableCell>Remaining for Production</TableCell>
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

              <h4 className="font-medium text-gray-700 mb-2">Development Payload (Units/Day)</h4>
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
                    <TableCell className="flex justify-end">
                      <Input
                        type="number"
                        value={devPayloadE72StollUnits ?? ""}
                        onChange={(e) =>
                          handleDevUnitsChange(
                            "e72",
                            e.target.value === "" ? null : Number.parseInt(e.target.value) || 0,
                          )
                        }
                        disabled={isProductionOnly}
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">{((devPayloadE72StollUnits ?? 0) * 5).toFixed(0)}</TableCell>
                    <TableCell className="text-right">{((devPayloadE72StollUnits ?? 0) * 5 * 52).toFixed(0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>E3.5,2 STOLL</TableCell>
                    <TableCell className="flex justify-end">
                      <Input
                        type="number"
                        value={devPayloadE35StollUnits ?? ""}
                        onChange={(e) =>
                          handleDevUnitsChange(
                            "e35",
                            e.target.value === "" ? null : Number.parseInt(e.target.value) || 0,
                          )
                        }
                        disabled={isProductionOnly}
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">{((devPayloadE35StollUnits ?? 0) * 5).toFixed(0)}</TableCell>
                    <TableCell className="text-right">{((devPayloadE35StollUnits ?? 0) * 5 * 52).toFixed(0)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>E18 SWG</TableCell>
                    <TableCell className="flex justify-end">
                      <Input
                        type="number"
                        value={devPayloadE18SwgUnits ?? ""}
                        onChange={(e) =>
                          handleDevUnitsChange(
                            "e18",
                            e.target.value === "" ? null : Number.parseInt(e.target.value) || 0,
                          )
                        }
                        disabled={isProductionOnly}
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">{((devPayloadE18SwgUnits ?? 0) * 5).toFixed(0)}</TableCell>
                    <TableCell className="text-right">{((devPayloadE18SwgUnits ?? 0) * 5 * 52).toFixed(0)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-gray-50">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{calculations.totalDevUnitsDaily.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{(calculations.totalDevUnitsDaily * 5).toFixed(1)}</TableCell>
                    <TableCell className="text-right">
                      {(calculations.totalDevUnitsDaily * 5 * 52).toFixed(1)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              {isProdAndDev && (
                <div className="mt-4 space-y-2">
                  {calculations.e72StollOverCapacity && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                      Warning: E7.2 STOLL combined payload (
                      {(calculations.devPayloadE72StollUnits ?? 0) + (calculations.prodPayloadE72StollUnits ?? 0)}{" "}
                      units) exceeds Actual Capacity ({derivedE72StollActualCapacity} units).
                    </div>
                  )}
                  {calculations.e35StollOverCapacity && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                      Warning: E3.5,2 STOLL combined payload (
                      {(calculations.devPayloadE35StollUnits ?? 0) + (calculations.prodPayloadE35StollUnits ?? 0)}{" "}
                      units) exceeds Actual Capacity ({derivedE35StollActualCapacity} units).
                    </div>
                  )}
                  {calculations.e18SwgOverCapacity && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                      Warning: E18 SWG combined payload (
                      {(calculations.devPayloadE18SwgUnits ?? 0) + (calculations.prodPayloadE18SwgUnits ?? 0)} units)
                      exceeds Actual Capacity ({derivedE18SwgActualCapacity} units).
                    </div>
                  )}
                </div>
              )}

              <Separator className="my-4" />

              <h4 className="font-medium text-gray-700 mb-2">
                {isProductionOnly ? "Production Payload (Daily)" : "Production Payload (Units/Day)"}
              </h4>
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
                    <TableCell className="flex justify-end">
                      <Input
                        type="number"
                        value={prodPayloadE72StollUnits ?? ""}
                        onChange={(e) =>
                          handleProdUnitsChange(
                            "e72",
                            e.target.value === "" ? null : Number.parseInt(e.target.value) || 0,
                          )
                        }
                        disabled={isDevelopmentOnly}
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">{((prodPayloadE72StollUnits ?? 0) * 5).toFixed(0)}</TableCell>
                    <TableCell className="text-right">
                      {((prodPayloadE72StollUnits ?? 0) * 5 * 52).toFixed(0)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>E3.5,2 STOLL</TableCell>
                    <TableCell className="flex justify-end">
                      <Input
                        type="number"
                        value={prodPayloadE35StollUnits ?? ""}
                        onChange={(e) =>
                          handleProdUnitsChange(
                            "e35",
                            e.target.value === "" ? null : Number.parseInt(e.target.value) || 0,
                          )
                        }
                        disabled={isDevelopmentOnly}
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">{((prodPayloadE35StollUnits ?? 0) * 5).toFixed(0)}</TableCell>
                    <TableCell className="text-right">
                      {((prodPayloadE35StollUnits ?? 0) * 5 * 52).toFixed(0)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>E18 SWG</TableCell>
                    <TableCell className="flex justify-end">
                      <Input
                        type="number"
                        value={prodPayloadE18SwgUnits ?? ""}
                        onChange={(e) =>
                          handleProdUnitsChange(
                            "e18",
                            e.target.value === "" ? null : Number.parseInt(e.target.value) || 0,
                          )
                        }
                        disabled={isDevelopmentOnly}
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">{((prodPayloadE18SwgUnits ?? 0) * 5).toFixed(0)}</TableCell>
                    <TableCell className="text-right">{((prodPayloadE18SwgUnits ?? 0) * 5 * 52).toFixed(0)}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-gray-50">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{calculations.totalProdUnitsDaily.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{calculations.totalWeeklyProductionUnits.toFixed(1)}</TableCell>
                    <TableCell className="text-right">
                      {calculations.totalAnnualProductionUnits.toLocaleString()}
                    </TableCell>
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
