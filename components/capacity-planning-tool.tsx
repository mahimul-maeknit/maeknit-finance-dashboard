"use client"

import { useState, useMemo } from "react"
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
  const [targetAnnualRevenue, setTargetAnnualRevenue] = useState<number | null>(100000)
  const [numStaff, setNumStaff] = useState<number | null>(5) // Based on current NY Lab staff in Excel
  const [numShifts, setNumShifts] = useState<"1" | "2">("1")
  const [desiredWeeklySwatches, setDesiredWeeklySwatches] = useState<number | null>(20)
  const [desiredWeeklySamples, setDesiredWeeklySamples] = useState<number | null>(4)
  const [desiredWeeklyGrading, setDesiredWeeklyGrading] = useState<number | null>(2)
  const [avgGarmentPrice, setAvgGarmentPrice] = useState<number | null>(150) // From previous settings

  // Adjustable Parameters (formerly hardcoded constants)
  const [laborRatePerHour, setLaborRatePerHour] = useState<number | null>(30)
  const [workHoursPerWeekPerPerson, setWorkHoursPerWeekPerPerson] = useState<number | null>(40)

  // Service Time Details (in minutes)
  const [swatchProgrammingMin, setSwatchProgrammingMin] = useState<number | null>(30)
  const [swatchKnittingMin, setSwatchKnittingMin] = useState<number | null>(25)
  const [swatchLinkingMin, setSwatchLinkingMin] = useState<number | null>(0)

  const [sampleProgrammingMin, setSampleProgrammingMin] = useState<number | null>(180)
  const [sampleKnittingMin, setSampleKnittingMin] = useState<number | null>(100)
  const [sampleLinkingMin, setSampleLinkingMin] = useState<number | null>(60)

  const [gradingProgrammingMin, setGradingProgrammingMin] = useState<number | null>(600)
  const [gradingKnittingMin, setGradingKnittingMin] = useState<number | null>(450)
  const [gradingLinkingMin, setGradingLinkingMin] = useState<number | null>(300)

  // Machine Knitting Times (in minutes per garment)
  const [e72StollKnittingTime, setE72StollKnittingTime] = useState<number | null>(90)
  const [e35StollKnittingTime, setE35StollKnittingTime] = useState<number | null>(50)
  const [e18SwgKnittingTime, setE18SwgKnittingTime] = useState<number | null>(30)

  // Daily Capacities (units per day)
  const [e72Stoll1ShiftProdOnlyCapacity, setE72Stoll1ShiftProdOnlyCapacity] = useState<number | null>(16)
  const [e35Stoll1ShiftProdOnlyCapacity, setE35Stoll1ShiftProdOnlyCapacity] = useState<number | null>(10)
  const [e18Swg1ShiftProdOnlyCapacity, setE18Swg1ShiftProdOnlyCapacity] = useState<number | null>(16)

  const [e72Stoll1ShiftWithDevCapacity, setE72Stoll1ShiftWithDevCapacity] = useState<number | null>(20)
  const [e35Stoll1ShiftWithDevCapacity, setE35Stoll1ShiftWithDevCapacity] = useState<number | null>(8)
  const [e18Swg1ShiftWithDevCapacity, setE18Swg1ShiftWithDevCapacity] = useState<number | null>(10)

  const [e72Stoll2ShiftsCapacity, setE72Stoll2ShiftsCapacity] = useState<number | null>(27)
  const [e35Stoll2ShiftsCapacity, setE35Stoll2ShiftsCapacity] = useState<number | null>(12)
  const [e18Swg2ShiftsCapacity, setE18Swg2ShiftsCapacity] = useState<number | null>(19)

  const handleResetToDefaults = () => {
    setLaborRatePerHour(30)
    setWorkHoursPerWeekPerPerson(40)

    setSwatchProgrammingMin(30)
    setSwatchKnittingMin(25)
    setSwatchLinkingMin(0)

    setSampleProgrammingMin(180)
    setSampleKnittingMin(100)
    setSampleLinkingMin(60)

    setGradingProgrammingMin(600)
    setGradingKnittingMin(450)
    setGradingLinkingMin(300)

    setE72StollKnittingTime(90)
    setE35StollKnittingTime(50)
    setE18SwgKnittingTime(30)

    setE72Stoll1ShiftProdOnlyCapacity(16)
    setE35Stoll1ShiftProdOnlyCapacity(10)
    setE18Swg1ShiftProdOnlyCapacity(16)

    setE72Stoll1ShiftWithDevCapacity(20)
    setE35Stoll1ShiftWithDevCapacity(8)
    setE18Swg1ShiftWithDevCapacity(10)

    setE72Stoll2ShiftsCapacity(27)
    setE35Stoll2ShiftsCapacity(12)
    setE18Swg2ShiftsCapacity(19)
  }

  const calculations = useMemo(() => {
    const currentNumStaff = numStaff ?? 5
    const currentNumShifts = Number.parseInt(numShifts)
    const currentAvgGarmentPrice = avgGarmentPrice ?? 150
    const currentLaborRatePerHour = laborRatePerHour ?? 30
    const currentWorkHoursPerWeekPerPerson = workHoursPerWeekPerPerson ?? 40

    // Total available labor hours per week
    const totalAvailableLaborHoursPerWeek = currentNumStaff * currentWorkHoursPerWeekPerPerson * currentNumShifts
    const totalAvailableLaborHoursPerYear = totalAvailableLaborHoursPerWeek * 52

    // Calculate hours needed for desired development units
    const programmingHoursPerSwatchCalc = (swatchProgrammingMin ?? 0) / 60
    const knittingHoursPerSwatchCalc = (swatchKnittingMin ?? 0) / 60
    const linkingHoursPerSwatchCalc = (swatchLinkingMin ?? 0) / 60

    const programmingHoursPerSampleCalc = (sampleProgrammingMin ?? 0) / 60
    const knittingHoursPerSampleCalc = (sampleKnittingMin ?? 0) / 60
    const linkingHoursPerSampleCalc = (sampleLinkingMin ?? 0) / 60

    const programmingHoursPerGradingCalc = (gradingProgrammingMin ?? 0) / 60
    const knittingHoursPerGradingCalc = (gradingKnittingMin ?? 0) / 60
    const linkingHoursPerGradingCalc = (gradingLinkingMin ?? 0) / 60

    const totalDevelopmentProgrammingHoursWeekly =
      (desiredWeeklySwatches ?? 0) * programmingHoursPerSwatchCalc +
      (desiredWeeklySamples ?? 0) * programmingHoursPerSampleCalc +
      (desiredWeeklyGrading ?? 0) * programmingHoursPerGradingCalc

    const totalDevelopmentKnittingHoursWeekly =
      (desiredWeeklySwatches ?? 0) * knittingHoursPerSwatchCalc +
      (desiredWeeklySamples ?? 0) * knittingHoursPerSampleCalc +
      (desiredWeeklyGrading ?? 0) * knittingHoursPerGradingCalc

    const totalDevelopmentLinkingHoursWeekly =
      (desiredWeeklySwatches ?? 0) * linkingHoursPerSwatchCalc +
      (desiredWeeklySamples ?? 0) * linkingHoursPerSampleCalc +
      (desiredWeeklyGrading ?? 0) * linkingHoursPerGradingCalc

    const totalDevelopmentHoursWeekly =
      totalDevelopmentProgrammingHoursWeekly + totalDevelopmentKnittingHoursWeekly + totalDevelopmentLinkingHoursWeekly

    // Service pricing (using fixed prices for now, could be linked to main settings later)
    const swatchPrice = 250
    const samplePrice = 2000
    const gradingPrice = 2500

    const developmentRevenueWeekly =
      (desiredWeeklySwatches ?? 0) * swatchPrice +
      (desiredWeeklySamples ?? 0) * samplePrice +
      (desiredWeeklyGrading ?? 0) * gradingPrice

    const developmentRevenueAnnual = developmentRevenueWeekly * 52

    // Remaining labor hours for production
    const remainingLaborHoursForProductionWeekly = totalAvailableLaborHoursPerWeek - totalDevelopmentHoursWeekly
    const remainingLaborHoursForProductionAnnual = remainingLaborHoursForProductionWeekly * 52

    // Determine effective daily machine capacity based on shifts and development mix
    let effectiveDailyMachineCapacity: { [key: string]: number }
    if (currentNumShifts === 1) {
      // Assuming "with development" is the default for 1 shift if development units are > 0
      effectiveDailyMachineCapacity =
        totalDevelopmentHoursWeekly > 0
          ? {
              "E7.2 STOLL": e72Stoll1ShiftWithDevCapacity ?? 0,
              "E3.5,2 STOLL": e35Stoll1ShiftWithDevCapacity ?? 0,
              "E18 SWG": e18Swg1ShiftWithDevCapacity ?? 0,
            }
          : {
              "E7.2 STOLL": e72Stoll1ShiftProdOnlyCapacity ?? 0,
              "E3.5,2 STOLL": e35Stoll1ShiftProdOnlyCapacity ?? 0,
              "E18 SWG": e18Swg1ShiftProdOnlyCapacity ?? 0,
            }
    } else {
      // 2 shifts
      effectiveDailyMachineCapacity = {
        "E7.2 STOLL": e72Stoll2ShiftsCapacity ?? 0,
        "E3.5,2 STOLL": e35Stoll2ShiftsCapacity ?? 0,
        "E18 SWG": e18Swg2ShiftsCapacity ?? 0,
      }
    }

    const totalDailyMachineCapacity = Object.values(effectiveDailyMachineCapacity).reduce(
      (sum, capacity) => sum + capacity,
      0,
    )
    const totalAnnualMachineCapacity = totalDailyMachineCapacity * 365

    // Calculate production units achievable with remaining labor hours
    // Average knitting time per garment (simplified average across machines)
    const avgKnittingTimePerGarment =
      ((e72StollKnittingTime ?? 0) + (e35StollKnittingTime ?? 0) + (e18SwgKnittingTime ?? 0)) / 3
    const avgProductionHoursPerGarment = avgKnittingTimePerGarment / 60 // Convert minutes to hours

    let achievableProductionUnitsAnnual = 0
    if (avgProductionHoursPerGarment > 0) {
      achievableProductionUnitsAnnual = remainingLaborHoursForProductionAnnual / avgProductionHoursPerGarment
    }

    // Cap production units by machine capacity if it's a bottleneck
    achievableProductionUnitsAnnual = Math.min(achievableProductionUnitsAnnual, totalAnnualMachineCapacity)

    const productionRevenueAnnual = achievableProductionUnitsAnnual * currentAvgGarmentPrice
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

    return {
      totalAvailableLaborHoursPerWeek,
      totalAvailableLaborHoursPerYear,
      totalDevelopmentHoursWeekly,
      totalDevelopmentKnittingHoursWeekly,
      totalDevelopmentLinkingHoursWeekly,
      totalDevelopmentProgrammingHoursWeekly,
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
      totalAnnualMachineCapacity,
      effectiveDailyMachineCapacity,
      currentLaborRatePerHour,
    }
  }, [
    targetAnnualRevenue,
    numStaff,
    numShifts,
    desiredWeeklySwatches,
    desiredWeeklySamples,
    desiredWeeklyGrading,
    avgGarmentPrice,
    laborRatePerHour,
    workHoursPerWeekPerPerson,
    swatchProgrammingMin,
    swatchKnittingMin,
    swatchLinkingMin,
    sampleProgrammingMin,
    sampleKnittingMin,
    sampleLinkingMin,
    gradingProgrammingMin,
    gradingKnittingMin,
    gradingLinkingMin,
    e72StollKnittingTime,
    e35StollKnittingTime,
    e18SwgKnittingTime,
    e72Stoll1ShiftProdOnlyCapacity,
    e35Stoll1ShiftProdOnlyCapacity,
    e18Swg1ShiftProdOnlyCapacity,
    e72Stoll1ShiftWithDevCapacity,
    e35Stoll1ShiftWithDevCapacity,
    e18Swg1ShiftWithDevCapacity,
    e72Stoll2ShiftsCapacity,
    e35Stoll2ShiftsCapacity,
    e18Swg2ShiftsCapacity,
  ])

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
              <Label htmlFor="num-shifts">Number of Shifts</Label>
              <Select value={numShifts} onValueChange={(value: "1" | "2") => setNumShifts(value)}>
                <SelectTrigger id="num-shifts">
                  <SelectValue placeholder="Select shifts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Shift</SelectItem>
                  <SelectItem value="2">2 Shifts</SelectItem>
                </SelectContent>
              </Select>
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
              />
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekly-grading">Grading Sets</Label>
              <Input
                id="weekly-grading"
                type="number"
                value={desiredWeeklyGrading ?? ""}
                onChange={(e) =>
                  setDesiredWeeklyGrading(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                }
              />
            </div>
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

              <h4 className="font-medium text-gray-700">Service Time Details (Minutes per Unit)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h5 className="font-medium">Swatch</h5>
                  <div className="space-y-2">
                    <Label htmlFor="swatch-programming-min">Programming</Label>
                    <Input
                      id="swatch-programming-min"
                      type="number"
                      value={swatchProgrammingMin ?? ""}
                      onChange={(e) =>
                        setSwatchProgrammingMin(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
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
                  <div className="space-y-2">
                    <Label htmlFor="swatch-linking-min">Linking</Label>
                    <Input
                      id="swatch-linking-min"
                      type="number"
                      value={swatchLinkingMin ?? ""}
                      onChange={(e) =>
                        setSwatchLinkingMin(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="font-medium">Sample</h5>
                  <div className="space-y-2">
                    <Label htmlFor="sample-programming-min">Programming</Label>
                    <Input
                      id="sample-programming-min"
                      type="number"
                      value={sampleProgrammingMin ?? ""}
                      onChange={(e) =>
                        setSampleProgrammingMin(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
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
                  <div className="space-y-2">
                    <Label htmlFor="sample-linking-min">Linking</Label>
                    <Input
                      id="sample-linking-min"
                      type="number"
                      value={sampleLinkingMin ?? ""}
                      onChange={(e) =>
                        setSampleLinkingMin(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="font-medium">Grading</h5>
                  <div className="space-y-2">
                    <Label htmlFor="grading-programming-min">Programming</Label>
                    <Input
                      id="grading-programming-min"
                      type="number"
                      value={gradingProgrammingMin ?? ""}
                      onChange={(e) =>
                        setGradingProgrammingMin(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
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
                  <div className="space-y-2">
                    <Label htmlFor="grading-linking-min">Linking</Label>
                    <Input
                      id="grading-linking-min"
                      type="number"
                      value={gradingLinkingMin ?? ""}
                      onChange={(e) =>
                        setGradingLinkingMin(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <h4 className="font-medium text-gray-700">Machine Knitting Times (Minutes per Garment)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="e72-stoll-knitting-time">E7.2 STOLL</Label>
                  <Input
                    id="e72-stoll-knitting-time"
                    type="number"
                    value={e72StollKnittingTime ?? ""}
                    onChange={(e) =>
                      setE72StollKnittingTime(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e35-stoll-knitting-time">E3.5,2 STOLL</Label>
                  <Input
                    id="e35-stoll-knitting-time"
                    type="number"
                    value={e35StollKnittingTime ?? ""}
                    onChange={(e) =>
                      setE35StollKnittingTime(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e18-swg-knitting-time">E18 SWG</Label>
                  <Input
                    id="e18-swg-knitting-time"
                    type="number"
                    value={e18SwgKnittingTime ?? ""}
                    onChange={(e) =>
                      setE18SwgKnittingTime(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <Separator />

              <h4 className="font-medium text-gray-700">Daily Machine Capacities (Units per Day)</h4>
              <div className="space-y-4">
                <h5 className="font-medium">1 Shift - Production Only</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="e72-stoll-1shift-prod-only">E7.2 STOLL</Label>
                    <Input
                      id="e72-stoll-1shift-prod-only"
                      type="number"
                      value={e72Stoll1ShiftProdOnlyCapacity ?? ""}
                      onChange={(e) =>
                        setE72Stoll1ShiftProdOnlyCapacity(
                          e.target.value === "" ? null : Number.parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="e35-stoll-1shift-prod-only">E3.5,2 STOLL</Label>
                    <Input
                      id="e35-stoll-1shift-prod-only"
                      type="number"
                      value={e35Stoll1ShiftProdOnlyCapacity ?? ""}
                      onChange={(e) =>
                        setE35Stoll1ShiftProdOnlyCapacity(
                          e.target.value === "" ? null : Number.parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="e18-swg-1shift-prod-only">E18 SWG</Label>
                    <Input
                      id="e18-swg-1shift-prod-only"
                      type="number"
                      value={e18Swg1ShiftProdOnlyCapacity ?? ""}
                      onChange={(e) =>
                        setE18Swg1ShiftProdOnlyCapacity(
                          e.target.value === "" ? null : Number.parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium">1 Shift - With Development</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="e72-stoll-1shift-dev">E7.2 STOLL</Label>
                    <Input
                      id="e72-stoll-1shift-dev"
                      type="number"
                      value={e72Stoll1ShiftWithDevCapacity ?? ""}
                      onChange={(e) =>
                        setE72Stoll1ShiftWithDevCapacity(
                          e.target.value === "" ? null : Number.parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="e35-stoll-1shift-dev">E3.5,2 STOLL</Label>
                    <Input
                      id="e35-stoll-1shift-dev"
                      type="number"
                      value={e35Stoll1ShiftWithDevCapacity ?? ""}
                      onChange={(e) =>
                        setE35Stoll1ShiftWithDevCapacity(
                          e.target.value === "" ? null : Number.parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="e18-swg-1shift-dev">E18 SWG</Label>
                    <Input
                      id="e18-swg-1shift-dev"
                      type="number"
                      value={e18Swg1ShiftWithDevCapacity ?? ""}
                      onChange={(e) =>
                        setE18Swg1ShiftWithDevCapacity(
                          e.target.value === "" ? null : Number.parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium">2 Shifts - All Production</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="e72-stoll-2shifts">E7.2 STOLL</Label>
                    <Input
                      id="e72-stoll-2shifts"
                      type="number"
                      value={e72Stoll2ShiftsCapacity ?? ""}
                      onChange={(e) =>
                        setE72Stoll2ShiftsCapacity(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="e35-stoll-2shifts">E3.5,2 STOLL</Label>
                    <Input
                      id="e35-stoll-2shifts"
                      type="number"
                      value={e35Stoll2ShiftsCapacity ?? ""}
                      onChange={(e) =>
                        setE35Stoll2ShiftsCapacity(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="e18-swg-2shifts">E18 SWG</Label>
                    <Input
                      id="e18-swg-2shifts"
                      type="number"
                      value={e18Swg2ShiftsCapacity ?? ""}
                      onChange={(e) =>
                        setE18Swg2ShiftsCapacity(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
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
                  <TableRow>
                    <TableCell className="pl-8">Programming</TableCell>
                    <TableCell className="text-right">
                      {calculations.totalDevelopmentProgrammingHoursWeekly.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Knitting (Dev)</TableCell>
                    <TableCell className="text-right">
                      {calculations.totalDevelopmentKnittingHoursWeekly.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="pl-8">Linking (Dev)</TableCell>
                    <TableCell className="text-right">
                      {calculations.totalDevelopmentLinkingHoursWeekly.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right"></TableCell>
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
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Annual Machine Capacity:</span>
                  <Badge variant="secondary">{calculations.totalAnnualMachineCapacity.toLocaleString()} garments</Badge>
                </div>
                <p className="text-sm text-gray-500">
                  This is the theoretical maximum based on machine knitting times and selected shifts.
                </p>
              </div>
              <Separator className="my-4" />
              <h4 className="font-medium text-gray-700 mb-2">Daily Machine Capacity (Selected Shift)</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Machine Type</TableHead>
                    <TableHead className="text-right">Daily Units</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(calculations.effectiveDailyMachineCapacity).map(([machine, capacity]) => (
                    <TableRow key={machine}>
                      <TableCell>{machine}</TableCell>
                      <TableCell className="text-right">{capacity}</TableCell>
                    </TableRow>
                  ))}
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
