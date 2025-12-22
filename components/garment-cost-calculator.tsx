"use client"

import type React from "react"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { Info } from "lucide-react"

export type GarmentSavableSettings = {
  // Facility Settings
  monthlyRent: number | null
  totalMachines: number | null
  workingHoursPerMonth: number | null

  // Machine-specific settings
  knittingMachineCount: number | null
  linkingMachineCount: number | null
  washingMachineCount: number | null

  knittingDepreciationPerHour: number | null
  linkingDepreciationPerHour: number | null
  washingDepreciationPerHour: number | null
  steamingDepreciationPerHour: number | null

  // Electricity rates (per hour)
  knittingElectricityCost: number | null
  linkingElectricityCost: number | null
  washingElectricityCost: number | null
  steamingElectricityCost: number | null

  // Labor rates (per hour)
  knittingLaborRate: number | null
  linkingLaborRate: number | null
  washingLaborRate: number | null
  qcHandFinishLaborRate: number | null
  programmingLaborRate: number | null
  consultationLaborRate: number | null
  cadLaborRate: number | null
  renderingLaborRate: number | null

  // Standard times (in minutes)
  standardKnittingTime: number | null
  standardLinkingTime: number | null
  standardWashingTime: number | null
  standardQCTime: number | null
  standardProgrammingTime: number | null
  standardConsultationTime: number | null
  standardCadTime: number | null
  standardRenderingTime: number | null

  // Material costs
  yarnCostPerKg: number | null
  standardGarmentWeightGrams: number | null

  // Margin
  marginPercent: number | null
  surchargePercent: number | null
}

const INITIAL_SETTINGS = {
  monthlyRent: 7000,
  totalMachines: 10,
  workingHoursPerMonth: 160, // 8 hours × 20 working days

  knittingMachineCount: 4,
  linkingMachineCount: 3,
  washingMachineCount: 2,

  knittingDepreciationPerHour: 5,
  linkingDepreciationPerHour: 4,
  washingDepreciationPerHour: 6,
  steamingDepreciationPerHour: 3,

  knittingElectricityCost: 0.74, // $0.74 per hour per the spreadsheet
  linkingElectricityCost: 0.48,
  washingElectricityCost: 2.56,
  steamingElectricityCost: 0.7,

  knittingLaborRate: 30,
  linkingLaborRate: 30,
  washingLaborRate: 30,
  qcHandFinishLaborRate: 30,
  programmingLaborRate: 40,
  consultationLaborRate: 40,
  cadLaborRate: 50,
  renderingLaborRate: 50,

  standardKnittingTime: 90, // minutes
  standardLinkingTime: 60,
  standardWashingTime: 30,
  standardQCTime: 20,
  standardProgrammingTime: 15, // minutes
  standardConsultationTime: 30, // minutes
  standardCadTime: 45, // minutes
  standardRenderingTime: 60, // minutes

  yarnCostPerKg: 25,
  standardGarmentWeightGrams: 600,

  marginPercent: 50,
  surchargePercent: 0,
}

export function GarmentCostCalculator() {
  const { data: session, status } = useSession()

  // Facility Settings
  const [monthlyRent, setMonthlyRent] = useState<number | null>(INITIAL_SETTINGS.monthlyRent)
  const [totalMachines, setTotalMachines] = useState<number | null>(INITIAL_SETTINGS.totalMachines)
  const [workingHoursPerMonth, setWorkingHoursPerMonth] = useState<number | null>(INITIAL_SETTINGS.workingHoursPerMonth)

  // Machine counts
  const [knittingMachineCount, setKnittingMachineCount] = useState<number | null>(INITIAL_SETTINGS.knittingMachineCount)
  const [linkingMachineCount, setLinkingMachineCount] = useState<number | null>(INITIAL_SETTINGS.linkingMachineCount)
  const [washingMachineCount, setWashingMachineCount] = useState<number | null>(INITIAL_SETTINGS.washingMachineCount)

  const [knittingDepreciationPerHour, setKnittingDepreciationPerHour] = useState<number | null>(
    INITIAL_SETTINGS.knittingDepreciationPerHour,
  )
  const [linkingDepreciationPerHour, setLinkingDepreciationPerHour] = useState<number | null>(
    INITIAL_SETTINGS.linkingDepreciationPerHour,
  )
  const [washingDepreciationPerHour, setWashingDepreciationPerHour] = useState<number | null>(
    INITIAL_SETTINGS.washingDepreciationPerHour,
  )
  const [steamingDepreciationPerHour, setSteamingDepreciationPerHour] = useState<number | null>(
    INITIAL_SETTINGS.steamingDepreciationPerHour,
  )

  // Electricity costs
  const [knittingElectricityCost, setKnittingElectricityCost] = useState<number | null>(
    INITIAL_SETTINGS.knittingElectricityCost,
  )
  const [linkingElectricityCost, setLinkingElectricityCost] = useState<number | null>(
    INITIAL_SETTINGS.linkingElectricityCost,
  )
  const [washingElectricityCost, setWashingElectricityCost] = useState<number | null>(
    INITIAL_SETTINGS.washingElectricityCost,
  )
  const [steamingElectricityCost, setSteamingElectricityCost] = useState<number | null>(
    INITIAL_SETTINGS.steamingElectricityCost,
  )

  // Labor rates
  const [knittingLaborRate, setKnittingLaborRate] = useState<number | null>(INITIAL_SETTINGS.knittingLaborRate)
  const [linkingLaborRate, setLinkingLaborRate] = useState<number | null>(INITIAL_SETTINGS.linkingLaborRate)
  const [washingLaborRate, setWashingLaborRate] = useState<number | null>(INITIAL_SETTINGS.washingLaborRate)
  const [qcHandFinishLaborRate, setQcHandFinishLaborRate] = useState<number | null>(
    INITIAL_SETTINGS.qcHandFinishLaborRate,
  )
  const [programmingLaborRate, setProgrammingLaborRate] = useState<number | null>(INITIAL_SETTINGS.programmingLaborRate)
  const [consultationLaborRate, setConsultationLaborRate] = useState<number | null>(
    INITIAL_SETTINGS.consultationLaborRate,
  )
  const [cadLaborRate, setCadLaborRate] = useState<number | null>(INITIAL_SETTINGS.cadLaborRate)
  const [renderingLaborRate, setRenderingLaborRate] = useState<number | null>(INITIAL_SETTINGS.renderingLaborRate)

  // Standard times
  const [standardKnittingTime, setStandardKnittingTime] = useState<number | null>(INITIAL_SETTINGS.standardKnittingTime)
  const [standardLinkingTime, setStandardLinkingTime] = useState<number | null>(INITIAL_SETTINGS.standardLinkingTime)
  const [standardWashingTime, setStandardWashingTime] = useState<number | null>(INITIAL_SETTINGS.standardWashingTime)
  const [standardQCTime, setStandardQCTime] = useState<number | null>(INITIAL_SETTINGS.standardQCTime)
  const [standardProgrammingTime, setStandardProgrammingTime] = useState<number | null>(
    INITIAL_SETTINGS.standardProgrammingTime,
  )
  const [standardConsultationTime, setStandardConsultationTime] = useState<number | null>(
    INITIAL_SETTINGS.standardConsultationTime,
  )
  // Added state for standard CAD and 3D Rendering times
  const [standardCadTime, setStandardCadTime] = useState<number | null>(INITIAL_SETTINGS.standardCadTime)
  const [standardRenderingTime, setStandardRenderingTime] = useState<number | null>(
    INITIAL_SETTINGS.standardRenderingTime,
  )

  // Material costs
  const [yarnCostPerKg, setYarnCostPerKg] = useState<number | null>(INITIAL_SETTINGS.yarnCostPerKg)
  const [standardGarmentWeightGrams, setStandardGarmentWeightGrams] = useState<number | null>(
    INITIAL_SETTINGS.standardGarmentWeightGrams,
  )

  // Margin
  const [marginPercent, setMarginPercent] = useState<number | null>(INITIAL_SETTINGS.marginPercent)
  const [surchargePercent, setSurchargePercent] = useState<number | null>(INITIAL_SETTINGS.surchargePercent)

  // Custom inputs for specific garment
  const [customKnittingTime, setCustomKnittingTime] = useState<number | null>(null)
  const [customLinkingTime, setCustomLinkingTime] = useState<number | null>(null)
  const [customWashingTime, setCustomWashingTime] = useState<number | null>(null)
  const [customQCTime, setCustomQCTime] = useState<number | null>(null)
  const [customProgrammingTime, setCustomProgrammingTime] = useState<number | null>(null)
  const [customConsultationTime, setCustomConsultationTime] = useState<number | null>(null)
  // Added custom times for CAD and 3D Rendering
  const [customCadTime, setCustomCadTime] = useState<number | null>(null)
  const [customRenderingTime, setCustomRenderingTime] = useState<number | null>(null)
  const [customYarnCost, setCustomYarnCost] = useState<number | null>(null)
  const [customGarmentWeight, setCustomGarmentWeight] = useState<number | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur()
  }

  const calculations = useMemo(() => {
    // Use custom values or defaults
    const knittingTimeMin = customKnittingTime ?? standardKnittingTime ?? 0
    const linkingTimeMin = customLinkingTime ?? standardLinkingTime ?? 0
    const washingTimeMin = customWashingTime ?? standardWashingTime ?? 0
    const qcTimeMin = customQCTime ?? standardQCTime ?? 0
    const programmingTimeMin = customProgrammingTime ?? standardProgrammingTime ?? 0
    const consultationTimeMin = customConsultationTime ?? standardConsultationTime ?? 0
    // Added custom times for CAD and 3D Rendering to calculations
    const cadTimeMin = customCadTime ?? standardCadTime ?? 0
    const renderingTimeMin = customRenderingTime ?? standardRenderingTime ?? 0
    const yarnCost = customYarnCost ?? yarnCostPerKg ?? 0
    const garmentWeightGrams = customGarmentWeight ?? standardGarmentWeightGrams ?? 0

    // Convert to hours
    const knittingTimeHr = knittingTimeMin / 60
    const linkingTimeHr = linkingTimeMin / 60
    const washingTimeHr = washingTimeMin / 60
    const qcTimeHr = qcTimeMin / 60
    const programmingTimeHr = programmingTimeMin / 60
    const consultationTimeHr = consultationTimeMin / 60
    // Convert CAD and 3D Rendering times to hours
    const cadTimeHr = cadTimeMin / 60
    const renderingTimeHr = renderingTimeMin / 60

    // Calculate rent per machine per hour
    const rentPerHour = (monthlyRent ?? 0) / (workingHoursPerMonth ?? 1)
    const rentPerKnittingMachine = (knittingMachineCount ?? 0) > 0 ? rentPerHour / (knittingMachineCount ?? 1) : 0
    const rentPerLinkingMachine = (linkingMachineCount ?? 0) > 0 ? rentPerHour / (linkingMachineCount ?? 1) : 0
    const rentPerWashingMachine = (washingMachineCount ?? 0) > 0 ? rentPerHour / (washingMachineCount ?? 1) : 0

    // KNITTING COST = (Labor × time) + (time × electricity) + (time × depreciation) + (time × rent)
    const knittingLabor = knittingTimeHr * (knittingLaborRate ?? 0)
    const knittingElectricity = knittingTimeHr * (knittingElectricityCost ?? 0)
    const knittingDepreciation = knittingTimeHr * (knittingDepreciationPerHour ?? 0)
    const knittingRent = knittingTimeHr * rentPerKnittingMachine
    const knittingTotalCost = knittingLabor + knittingElectricity + knittingDepreciation + knittingRent

    // LINKING COST
    const linkingLabor = linkingTimeHr * (linkingLaborRate ?? 0)
    const linkingElectricity = linkingTimeHr * (linkingElectricityCost ?? 0)
    const linkingDepreciation = linkingTimeHr * (linkingDepreciationPerHour ?? 0)
    const linkingRent = linkingTimeHr * rentPerLinkingMachine
    const linkingTotalCost = linkingLabor + linkingElectricity + linkingDepreciation + linkingRent

    // WASHING/STEAMING COST
    const washingLabor = washingTimeHr * (washingLaborRate ?? 0)
    const washingElectricity = washingTimeHr * (washingElectricityCost ?? 0)
    const washingDepreciation = washingTimeHr * (washingDepreciationPerHour ?? 0)
    const washingRent = washingTimeHr * rentPerWashingMachine
    const steamingElectricity = washingTimeHr * (steamingElectricityCost ?? 0) // Steaming happens after washing
    const steamingDepreciation = washingTimeHr * (steamingDepreciationPerHour ?? 0)
    const washingTotalCost =
      washingLabor + washingElectricity + washingDepreciation + washingRent + steamingElectricity + steamingDepreciation

    // QC + HAND FINISH COST (no machine, just labor)
    const qcLabor = qcTimeHr * (qcHandFinishLaborRate ?? 0)
    const qcTotalCost = qcLabor

    const programmingLabor = programmingTimeHr * (programmingLaborRate ?? 0)
    const programmingTotalCost = programmingLabor

    const consultationLabor = consultationTimeHr * (consultationLaborRate ?? 0)
    const consultationTotalCost = consultationLabor

    // Added CAD and 3D Rendering costs
    const cadLabor = cadTimeHr * (cadLaborRate ?? 0)
    const cadTotalCost = cadLabor

    const renderingLabor = renderingTimeHr * (renderingLaborRate ?? 0)
    const renderingTotalCost = renderingLabor

    // MATERIAL COST (Yarn)
    const materialCost = (garmentWeightGrams / 1000) * yarnCost

    // TOTAL COST
    const totalCost =
      knittingTotalCost +
      linkingTotalCost +
      washingTotalCost +
      qcTotalCost +
      programmingTotalCost +
      consultationTotalCost +
      cadTotalCost + // Include CAD cost
      renderingTotalCost + // Include Rendering cost
      materialCost

    // MARGIN & PRICE
    const marginDecimal = (marginPercent ?? 0) / 100
    const sellingPrice = marginDecimal < 1 ? totalCost / (1 - marginDecimal) : totalCost
    const marginAmount = sellingPrice - totalCost

    const surchargeDecimal = (surchargePercent ?? 0) / 100
    const surchargeAmount = sellingPrice * surchargeDecimal
    const finalPrice = sellingPrice + surchargeAmount

    return {
      knitting: {
        labor: knittingLabor,
        electricity: knittingElectricity,
        depreciation: knittingDepreciation,
        rent: knittingRent,
        total: knittingTotalCost,
        timeHr: knittingTimeHr,
      },
      linking: {
        labor: linkingLabor,
        electricity: linkingElectricity,
        depreciation: linkingDepreciation,
        rent: linkingRent,
        total: linkingTotalCost,
        timeHr: linkingTimeHr,
      },
      washing: {
        labor: washingLabor,
        electricity: washingElectricity,
        steamingElectricity: steamingElectricity,
        depreciation: washingDepreciation,
        steamingDepreciation: steamingDepreciation,
        rent: washingRent,
        total: washingTotalCost,
        timeHr: washingTimeHr,
      },
      qc: {
        labor: qcLabor,
        total: qcTotalCost,
        timeHr: qcTimeHr,
      },
      programming: {
        labor: programmingLabor,
        total: programmingTotalCost,
        timeHr: programmingTimeHr,
      },
      consultation: {
        labor: consultationLabor,
        total: consultationTotalCost,
        timeHr: consultationTimeHr,
      },
      // Add CAD and 3D Rendering to the calculations object
      cad: {
        labor: cadLabor,
        total: cadTotalCost,
        timeHr: cadTimeHr,
      },
      rendering: {
        labor: renderingLabor,
        total: renderingTotalCost,
        timeHr: renderingTimeHr,
      },
      material: {
        yarn: materialCost,
        total: materialCost,
      },
      totalCost,
      marginAmount,
      sellingPrice,
      surchargeAmount,
      finalPrice,
      rentPerHour,
    }
  }, [
    customKnittingTime,
    customLinkingTime,
    customWashingTime,
    customQCTime,
    customProgrammingTime,
    customConsultationTime,
    // Add custom CAD and 3D Rendering times to dependencies
    customCadTime,
    customRenderingTime,
    customYarnCost,
    customGarmentWeight,
    standardKnittingTime,
    standardLinkingTime,
    standardWashingTime,
    standardQCTime,
    standardProgrammingTime,
    standardConsultationTime,
    // Add standard CAD and 3D Rendering times to dependencies
    standardCadTime,
    standardRenderingTime,
    yarnCostPerKg,
    standardGarmentWeightGrams,
    monthlyRent,
    workingHoursPerMonth,
    knittingMachineCount,
    linkingMachineCount,
    washingMachineCount,
    knittingDepreciationPerHour,
    linkingDepreciationPerHour,
    washingDepreciationPerHour,
    steamingDepreciationPerHour,
    knittingElectricityCost,
    linkingElectricityCost,
    washingElectricityCost,
    steamingElectricityCost,
    knittingLaborRate,
    linkingLaborRate,
    washingLaborRate,
    qcHandFinishLaborRate,
    programmingLaborRate,
    consultationLaborRate,
    // Add CAD and 3D Rendering labor rates to dependencies
    cadLaborRate,
    renderingLaborRate,
    marginPercent,
    surchargePercent,
  ])

  const handleResetToDefaults = () => {
    setMonthlyRent(INITIAL_SETTINGS.monthlyRent)
    setTotalMachines(INITIAL_SETTINGS.totalMachines)
    setWorkingHoursPerMonth(INITIAL_SETTINGS.workingHoursPerMonth)
    setKnittingMachineCount(INITIAL_SETTINGS.knittingMachineCount)
    setLinkingMachineCount(INITIAL_SETTINGS.linkingMachineCount)
    setWashingMachineCount(INITIAL_SETTINGS.washingMachineCount)
    setKnittingDepreciationPerHour(INITIAL_SETTINGS.knittingDepreciationPerHour)
    setLinkingDepreciationPerHour(INITIAL_SETTINGS.linkingDepreciationPerHour)
    setWashingDepreciationPerHour(INITIAL_SETTINGS.washingDepreciationPerHour)
    setSteamingDepreciationPerHour(INITIAL_SETTINGS.steamingDepreciationPerHour)
    setKnittingElectricityCost(INITIAL_SETTINGS.knittingElectricityCost)
    setLinkingElectricityCost(INITIAL_SETTINGS.linkingElectricityCost)
    setWashingElectricityCost(INITIAL_SETTINGS.washingElectricityCost)
    setSteamingElectricityCost(INITIAL_SETTINGS.steamingElectricityCost)
    setKnittingLaborRate(INITIAL_SETTINGS.knittingLaborRate)
    setLinkingLaborRate(INITIAL_SETTINGS.linkingLaborRate)
    setWashingLaborRate(INITIAL_SETTINGS.washingLaborRate)
    setQcHandFinishLaborRate(INITIAL_SETTINGS.qcHandFinishLaborRate)
    setProgrammingLaborRate(INITIAL_SETTINGS.programmingLaborRate)
    setConsultationLaborRate(INITIAL_SETTINGS.consultationLaborRate)
    // Reset CAD and 3D Rendering labor rates to defaults
    setCadLaborRate(INITIAL_SETTINGS.cadLaborRate)
    setRenderingLaborRate(INITIAL_SETTINGS.renderingLaborRate)
    setStandardKnittingTime(INITIAL_SETTINGS.standardKnittingTime)
    setStandardLinkingTime(INITIAL_SETTINGS.standardLinkingTime)
    setStandardWashingTime(INITIAL_SETTINGS.standardWashingTime)
    setStandardQCTime(INITIAL_SETTINGS.standardQCTime)
    setStandardProgrammingTime(INITIAL_SETTINGS.standardProgrammingTime)
    setStandardConsultationTime(INITIAL_SETTINGS.standardConsultationTime)
    // Reset standard CAD and 3D Rendering times to defaults
    setStandardCadTime(INITIAL_SETTINGS.standardCadTime)
    setStandardRenderingTime(INITIAL_SETTINGS.standardRenderingTime)
    setYarnCostPerKg(INITIAL_SETTINGS.yarnCostPerKg)
    setStandardGarmentWeightGrams(INITIAL_SETTINGS.standardGarmentWeightGrams)
    setMarginPercent(INITIAL_SETTINGS.marginPercent)
    setSurchargePercent(INITIAL_SETTINGS.surchargePercent)
    setCustomKnittingTime(null)
    setCustomLinkingTime(null)
    setCustomWashingTime(null)
    setCustomQCTime(null)
    setCustomProgrammingTime(null)
    setCustomConsultationTime(null)
    // Reset custom CAD and 3D Rendering times to null
    setCustomCadTime(null)
    setCustomRenderingTime(null)
    setCustomYarnCost(null)
    setCustomGarmentWeight(null)
  }

  const autoSaveSettings = useCallback(async () => {
    if (status !== "authenticated") return

    const settingsToSave: GarmentSavableSettings = {
      monthlyRent,
      totalMachines,
      workingHoursPerMonth,
      knittingMachineCount,
      linkingMachineCount,
      washingMachineCount,
      knittingDepreciationPerHour,
      linkingDepreciationPerHour,
      washingDepreciationPerHour,
      steamingDepreciationPerHour,
      knittingElectricityCost,
      linkingElectricityCost,
      washingElectricityCost,
      steamingElectricityCost,
      knittingLaborRate,
      linkingLaborRate,
      washingLaborRate,
      qcHandFinishLaborRate,
      programmingLaborRate,
      consultationLaborRate,
      // Include CAD and 3D Rendering labor rates in settings to save
      cadLaborRate,
      renderingLaborRate,
      standardKnittingTime,
      standardLinkingTime,
      standardWashingTime,
      standardQCTime,
      standardProgrammingTime,
      standardConsultationTime,
      // Include standard CAD and 3D Rendering times in settings to save
      standardCadTime,
      standardRenderingTime,
      yarnCostPerKg,
      standardGarmentWeightGrams,
      marginPercent,
      surchargePercent,
    }

    try {
      setAutoSaveStatus("saving")
      const response = await fetch("/api/garment-calculator-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settingsToSave),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to auto-save settings")
      }

      setAutoSaveStatus("saved")
      setTimeout(() => setAutoSaveStatus("idle"), 2000)
    } catch (error: unknown) {
      console.error("Error auto-saving settings:", error)
      setAutoSaveStatus("idle")
    }
  }, [
    monthlyRent,
    totalMachines,
    workingHoursPerMonth,
    knittingMachineCount,
    linkingMachineCount,
    washingMachineCount,
    knittingDepreciationPerHour,
    linkingDepreciationPerHour,
    washingDepreciationPerHour,
    steamingDepreciationPerHour,
    knittingElectricityCost,
    linkingElectricityCost,
    washingElectricityCost,
    steamingElectricityCost,
    knittingLaborRate,
    linkingLaborRate,
    washingLaborRate,
    qcHandFinishLaborRate,
    programmingLaborRate,
    consultationLaborRate,
    // Include CAD and 3D Rendering labor rates in dependencies
    cadLaborRate,
    renderingLaborRate,
    standardKnittingTime,
    standardLinkingTime,
    standardWashingTime,
    standardQCTime,
    standardProgrammingTime,
    standardConsultationTime,
    // Include standard CAD and 3D Rendering times in dependencies
    standardCadTime,
    standardRenderingTime,
    yarnCostPerKg,
    standardGarmentWeightGrams,
    marginPercent,
    surchargePercent,
    status,
  ])

  useEffect(() => {
    if (isLoading) return // Don't auto-save during initial load

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveSettings()
    }, 1000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [autoSaveSettings, isLoading])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    const settingsToSave: GarmentSavableSettings = {
      monthlyRent,
      totalMachines,
      workingHoursPerMonth,
      knittingMachineCount,
      linkingMachineCount,
      washingMachineCount,
      knittingDepreciationPerHour,
      linkingDepreciationPerHour,
      washingDepreciationPerHour,
      steamingDepreciationPerHour,
      knittingElectricityCost,
      linkingElectricityCost,
      washingElectricityCost,
      steamingElectricityCost,
      knittingLaborRate,
      linkingLaborRate,
      washingLaborRate,
      qcHandFinishLaborRate,
      programmingLaborRate,
      consultationLaborRate,
      // Include CAD and 3D Rendering labor rates in settings to save
      cadLaborRate,
      renderingLaborRate,
      standardKnittingTime,
      standardLinkingTime,
      standardWashingTime,
      standardQCTime,
      standardProgrammingTime,
      standardConsultationTime,
      // Include standard CAD and 3D Rendering times in settings to save
      standardCadTime,
      standardRenderingTime,
      yarnCostPerKg,
      standardGarmentWeightGrams,
      marginPercent,
      surchargePercent,
    }

    try {
      const response = await fetch("/api/garment-calculator-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settingsToSave),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save garment calculator settings")
      }

      console.log("Settings saved successfully")
      setAutoSaveStatus("saved")
      setTimeout(() => setAutoSaveStatus("idle"), 2000)
    } catch (error: unknown) {
      console.error("Error saving settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const fetchSettings = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/garment-calculator-settings")
          if (response.ok) {
            const fetchedSettings: GarmentSavableSettings = await response.json()
            if (Object.keys(fetchedSettings).length > 0) {
              setMonthlyRent(fetchedSettings.monthlyRent ?? INITIAL_SETTINGS.monthlyRent)
              setTotalMachines(fetchedSettings.totalMachines ?? INITIAL_SETTINGS.totalMachines)
              setWorkingHoursPerMonth(fetchedSettings.workingHoursPerMonth ?? INITIAL_SETTINGS.workingHoursPerMonth)
              setKnittingMachineCount(fetchedSettings.knittingMachineCount ?? INITIAL_SETTINGS.knittingMachineCount)
              setLinkingMachineCount(fetchedSettings.linkingMachineCount ?? INITIAL_SETTINGS.linkingMachineCount)
              setWashingMachineCount(fetchedSettings.washingMachineCount ?? INITIAL_SETTINGS.washingMachineCount)
              setKnittingDepreciationPerHour(
                fetchedSettings.knittingDepreciationPerHour ?? INITIAL_SETTINGS.knittingDepreciationPerHour,
              )
              setLinkingDepreciationPerHour(
                fetchedSettings.linkingDepreciationPerHour ?? INITIAL_SETTINGS.linkingDepreciationPerHour,
              )
              setWashingDepreciationPerHour(
                fetchedSettings.washingDepreciationPerHour ?? INITIAL_SETTINGS.washingDepreciationPerHour,
              )
              setSteamingDepreciationPerHour(
                fetchedSettings.steamingDepreciationPerHour ?? INITIAL_SETTINGS.steamingDepreciationPerHour,
              )
              setKnittingElectricityCost(
                fetchedSettings.knittingElectricityCost ?? INITIAL_SETTINGS.knittingElectricityCost,
              )
              setLinkingElectricityCost(
                fetchedSettings.linkingElectricityCost ?? INITIAL_SETTINGS.linkingElectricityCost,
              )
              setWashingElectricityCost(
                fetchedSettings.washingElectricityCost ?? INITIAL_SETTINGS.washingElectricityCost,
              )
              setSteamingElectricityCost(
                fetchedSettings.steamingElectricityCost ?? INITIAL_SETTINGS.steamingElectricityCost,
              )
              setKnittingLaborRate(fetchedSettings.knittingLaborRate ?? INITIAL_SETTINGS.knittingLaborRate)
              setLinkingLaborRate(fetchedSettings.linkingLaborRate ?? INITIAL_SETTINGS.linkingLaborRate)
              setWashingLaborRate(fetchedSettings.washingLaborRate ?? INITIAL_SETTINGS.washingLaborRate)
              setQcHandFinishLaborRate(fetchedSettings.qcHandFinishLaborRate ?? INITIAL_SETTINGS.qcHandFinishLaborRate)
              setProgrammingLaborRate(fetchedSettings.programmingLaborRate ?? INITIAL_SETTINGS.programmingLaborRate)
              setConsultationLaborRate(fetchedSettings.consultationLaborRate ?? INITIAL_SETTINGS.consultationLaborRate)
              // Fetch and set CAD and 3D Rendering labor rates
              setCadLaborRate(fetchedSettings.cadLaborRate ?? INITIAL_SETTINGS.cadLaborRate)
              setRenderingLaborRate(fetchedSettings.renderingLaborRate ?? INITIAL_SETTINGS.renderingLaborRate)
              setStandardKnittingTime(fetchedSettings.standardKnittingTime ?? INITIAL_SETTINGS.standardKnittingTime)
              setStandardLinkingTime(fetchedSettings.standardLinkingTime ?? INITIAL_SETTINGS.standardLinkingTime)
              setStandardWashingTime(fetchedSettings.standardWashingTime ?? INITIAL_SETTINGS.standardWashingTime)
              setStandardQCTime(fetchedSettings.standardQCTime ?? INITIAL_SETTINGS.standardQCTime)
              setStandardProgrammingTime(
                fetchedSettings.standardProgrammingTime ?? INITIAL_SETTINGS.standardProgrammingTime,
              )
              setStandardConsultationTime(
                fetchedSettings.standardConsultationTime ?? INITIAL_SETTINGS.standardConsultationTime,
              )
              // Fetch and set standard CAD and 3D Rendering times
              setStandardCadTime(fetchedSettings.standardCadTime ?? INITIAL_SETTINGS.standardCadTime)
              setStandardRenderingTime(fetchedSettings.standardRenderingTime ?? INITIAL_SETTINGS.standardRenderingTime)
              setYarnCostPerKg(fetchedSettings.yarnCostPerKg ?? INITIAL_SETTINGS.yarnCostPerKg)
              setStandardGarmentWeightGrams(
                fetchedSettings.standardGarmentWeightGrams ?? INITIAL_SETTINGS.standardGarmentWeightGrams,
              )
              setMarginPercent(fetchedSettings.marginPercent ?? INITIAL_SETTINGS.marginPercent)
              setSurchargePercent(fetchedSettings.surchargePercent ?? INITIAL_SETTINGS.surchargePercent)
            }
          }
        } catch (error: unknown) {
          console.error("Error fetching settings:", error)
        } finally {
          setIsLoading(false)
        }
      } else if (status !== "loading") {
        setIsLoading(false)
      }
    }

    if (status !== "loading") {
      fetchSettings()
    }
  }, [session, status])

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading calculator settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Garment Cost Calculator</CardTitle>
              <CardDescription>
                Calculate comprehensive garment costs including labor, electricity, depreciation, and rent allocation
              </CardDescription>
            </div>
            {autoSaveStatus !== "idle" && (
              <div className="text-sm text-muted-foreground">
                {autoSaveStatus === "saving" && "Saving..."}
                {autoSaveStatus === "saved" && "✓ Auto-saved"}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Facility Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Facility Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Monthly Rent ($)</Label>
                <Input
                  type="number"
                  value={monthlyRent ?? ""}
                  onChange={(e) => setMonthlyRent(e.target.value === "" ? null : Number.parseFloat(e.target.value))}
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Working Hours/Month</Label>
                <Input
                  type="number"
                  value={workingHoursPerMonth ?? ""}
                  onChange={(e) =>
                    setWorkingHoursPerMonth(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Rent Per Hour</Label>
                <Input type="text" value={`$${calculations.rentPerHour.toFixed(2)}`} disabled className="bg-muted" />
              </div>
            </CardContent>
          </Card>

          {/* Machine Settings & Depreciation */}
          <Card>
            <CardHeader>
              <CardTitle>Machine Settings & Depreciation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Knitting Machines</Label>
                  <Input
                    type="number"
                    value={knittingMachineCount ?? ""}
                    onChange={(e) =>
                      setKnittingMachineCount(e.target.value === "" ? null : Number.parseInt(e.target.value))
                    }
                    onWheel={handleWheel}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Linking Machines</Label>
                  <Input
                    type="number"
                    value={linkingMachineCount ?? ""}
                    onChange={(e) =>
                      setLinkingMachineCount(e.target.value === "" ? null : Number.parseInt(e.target.value))
                    }
                    onWheel={handleWheel}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Washing Machines</Label>
                  <Input
                    type="number"
                    value={washingMachineCount ?? ""}
                    onChange={(e) =>
                      setWashingMachineCount(e.target.value === "" ? null : Number.parseInt(e.target.value))
                    }
                    onWheel={handleWheel}
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-base font-semibold">Depreciation per Machine ($/hour)</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-normal">Knitting</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={knittingDepreciationPerHour ?? ""}
                      onChange={(e) =>
                        setKnittingDepreciationPerHour(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                      }
                      onWheel={handleWheel}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-normal">Linking</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={linkingDepreciationPerHour ?? ""}
                      onChange={(e) =>
                        setLinkingDepreciationPerHour(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                      }
                      onWheel={handleWheel}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-normal">Washing</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={washingDepreciationPerHour ?? ""}
                      onChange={(e) =>
                        setWashingDepreciationPerHour(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                      }
                      onWheel={handleWheel}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-normal">Steaming</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={steamingDepreciationPerHour ?? ""}
                      onChange={(e) =>
                        setSteamingDepreciationPerHour(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                      }
                      onWheel={handleWheel}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Electricity Costs */}
          <Card>
            <CardHeader>
              <CardTitle>Electricity Costs ($/hour)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Knitting</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={knittingElectricityCost ?? ""}
                  onChange={(e) =>
                    setKnittingElectricityCost(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Linking</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={linkingElectricityCost ?? ""}
                  onChange={(e) =>
                    setLinkingElectricityCost(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Washing</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={washingElectricityCost ?? ""}
                  onChange={(e) =>
                    setWashingElectricityCost(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Steaming</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={steamingElectricityCost ?? ""}
                  onChange={(e) =>
                    setSteamingElectricityCost(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
            </CardContent>
          </Card>

          {/* Labor Rates */}
          <Card>
            <CardHeader>
              <CardTitle>Labor Rates ($/hour)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Knitting</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={knittingLaborRate ?? ""}
                  onChange={(e) =>
                    setKnittingLaborRate(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Linking</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={linkingLaborRate ?? ""}
                  onChange={(e) =>
                    setLinkingLaborRate(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Washing</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={washingLaborRate ?? ""}
                  onChange={(e) =>
                    setWashingLaborRate(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>QC + Hand Finish</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={qcHandFinishLaborRate ?? ""}
                  onChange={(e) =>
                    setQcHandFinishLaborRate(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Programming</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={programmingLaborRate ?? ""}
                  onChange={(e) =>
                    setProgrammingLaborRate(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Consultation</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={consultationLaborRate ?? ""}
                  onChange={(e) =>
                    setConsultationLaborRate(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              {/* Added input for CAD Labor Rate */}
              <div className="space-y-2">
                <Label>CAD</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={cadLaborRate ?? ""}
                  onChange={(e) => setCadLaborRate(e.target.value === "" ? null : Number.parseFloat(e.target.value))}
                  onWheel={handleWheel}
                />
              </div>
              {/* Added input for 3D Rendering Labor Rate */}
              <div className="space-y-2">
                <Label>3D Rendering</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={renderingLaborRate ?? ""}
                  onChange={(e) =>
                    setRenderingLaborRate(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
            </CardContent>
          </Card>

          {/* Standard Times & Materials */}
          <Separator />

          {/* Custom Garment Inputs */}
          <Card>
            <CardHeader>
              <CardTitle>Garment Inputs</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label>Knitting Time (min)</Label>
                <Input
                  type="number"
                  value={customKnittingTime ?? ""}
                  placeholder={standardKnittingTime?.toString()}
                  onChange={(e) =>
                    setCustomKnittingTime(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Linking Time (min)</Label>
                <Input
                  type="number"
                  value={customLinkingTime ?? ""}
                  placeholder={standardLinkingTime?.toString()}
                  onChange={(e) =>
                    setCustomLinkingTime(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Washing Time (min)</Label>
                <Input
                  type="number"
                  value={customWashingTime ?? ""}
                  placeholder={standardWashingTime?.toString()}
                  onChange={(e) =>
                    setCustomWashingTime(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>QC Time (min)</Label>
                <Input
                  type="number"
                  value={customQCTime ?? ""}
                  placeholder={standardQCTime?.toString()}
                  onChange={(e) => setCustomQCTime(e.target.value === "" ? null : Number.parseFloat(e.target.value))}
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Programming Time (min)</Label>
                <Input
                  type="number"
                  value={customProgrammingTime ?? ""}
                  placeholder={standardProgrammingTime?.toString()}
                  onChange={(e) =>
                    setCustomProgrammingTime(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Consultation Time (min)</Label>
                <Input
                  type="number"
                  value={customConsultationTime ?? ""}
                  placeholder={standardConsultationTime?.toString()}
                  onChange={(e) =>
                    setCustomConsultationTime(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              {/* Added input for Custom CAD Time */}
              <div className="space-y-2">
                <Label>CAD Time (min)</Label>
                <Input
                  type="number"
                  value={customCadTime ?? ""}
                  placeholder={standardCadTime?.toString()}
                  onChange={(e) => setCustomCadTime(e.target.value === "" ? null : Number.parseFloat(e.target.value))}
                  onWheel={handleWheel}
                />
              </div>
              {/* Added input for Custom 3D Rendering Time */}
              <div className="space-y-2">
                <Label>3D Rendering Time (min)</Label>
                <Input
                  type="number"
                  value={customRenderingTime ?? ""}
                  placeholder={standardRenderingTime?.toString()}
                  onChange={(e) =>
                    setCustomRenderingTime(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Yarn Cost ($/kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={customYarnCost ?? ""}
                  placeholder={yarnCostPerKg?.toString()}
                  onChange={(e) => setCustomYarnCost(e.target.value === "" ? null : Number.parseFloat(e.target.value))}
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Weight (grams)</Label>
                <Input
                  type="number"
                  value={customGarmentWeight ?? ""}
                  placeholder={standardGarmentWeightGrams?.toString()}
                  onChange={(e) =>
                    setCustomGarmentWeight(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Margin (%)</Label>
                <Input
                  type="number"
                  step="1"
                  value={marginPercent ?? ""}
                  onChange={(e) => setMarginPercent(e.target.value === "" ? null : Number.parseFloat(e.target.value))}
                  onWheel={handleWheel}
                />
              </div>
              <div className="space-y-2">
                <Label>Surcharge (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={surchargePercent ?? ""}
                  onChange={(e) =>
                    setSurchargePercent(e.target.value === "" ? null : Number.parseFloat(e.target.value))
                  }
                  onWheel={handleWheel}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleResetToDefaults}>
              Reset to Defaults
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>

          <Separator />

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive Cost Breakdown</CardTitle>
              <CardDescription>Detailed breakdown showing formula application for each process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator className="my-6" />

              {/* Quick Reference Table */}
              <div className="text-sm text-muted-foreground mb-2">Quick Reference Table:</div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Process</TableHead>
                    <TableHead className="text-right">Labor</TableHead>
                    <TableHead className="text-right">Electricity</TableHead>
                    <TableHead className="text-right">Depreciation</TableHead>
                    <TableHead className="text-right">Rent</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Knitting ({calculations.knitting.timeHr.toFixed(2)}h)</TableCell>
                    <TableCell className="text-right">${calculations.knitting.labor.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${calculations.knitting.electricity.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${calculations.knitting.depreciation.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${calculations.knitting.rent.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold">${calculations.knitting.total.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Linking ({calculations.linking.timeHr.toFixed(2)}h)</TableCell>
                    <TableCell className="text-right">${calculations.linking.labor.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${calculations.linking.electricity.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${calculations.linking.depreciation.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${calculations.linking.rent.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold">${calculations.linking.total.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Washing/Steaming ({calculations.washing.timeHr.toFixed(2)}h)
                    </TableCell>
                    <TableCell className="text-right">${calculations.washing.labor.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      ${(calculations.washing.electricity + calculations.washing.steamingElectricity).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${(calculations.washing.depreciation + calculations.washing.steamingDepreciation).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">${calculations.washing.rent.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold">${calculations.washing.total.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      QC + Hand Finish ({calculations.qc.timeHr.toFixed(2)}h)
                    </TableCell>
                    <TableCell className="text-right">${calculations.qc.labor.toFixed(2)}</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right font-bold">${calculations.qc.total.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Programming ({calculations.programming.timeHr.toFixed(2)}h)
                    </TableCell>
                    <TableCell className="text-right">${calculations.programming.labor.toFixed(2)}</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right font-bold">${calculations.programming.total.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Consultation ({calculations.consultation.timeHr.toFixed(2)}h)
                    </TableCell>
                    <TableCell className="text-right">${calculations.consultation.labor.toFixed(2)}</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right font-bold">
                      ${calculations.consultation.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  {/* Added CAD and 3D Rendering rows to the table */}
                  <TableRow>
                    <TableCell className="font-medium">CAD ({calculations.cad.timeHr.toFixed(2)}h)</TableCell>
                    <TableCell className="text-right">${calculations.cad.labor.toFixed(2)}</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right font-bold">${calculations.cad.total.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      3D Rendering ({calculations.rendering.timeHr.toFixed(2)}h)
                    </TableCell>
                    <TableCell className="text-right">${calculations.rendering.labor.toFixed(2)}</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right font-bold">${calculations.rendering.total.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Materials (Yarn)</TableCell>
                    <TableCell className="text-right" colSpan={4}>
                      -
                    </TableCell>
                    <TableCell className="text-right font-bold">${calculations.material.yarn.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">TOTAL COST</TableCell>
                    <TableCell colSpan={4}></TableCell>
                    <TableCell className="text-right font-bold text-lg">${calculations.totalCost.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{marginPercent}% Margin</TableCell>
                    <TableCell colSpan={4}></TableCell>
                    <TableCell className="text-right">${calculations.marginAmount.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/10">
                    <TableCell className="font-bold text-lg">SELLING PRICE</TableCell>
                    <TableCell colSpan={4}></TableCell>
                    <TableCell className="text-right font-bold text-xl text-primary">
                      ${calculations.sellingPrice.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">{surchargePercent}% Surcharge</TableCell>
                    <TableCell colSpan={4}></TableCell>
                    <TableCell className="text-right">${calculations.surchargeAmount.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/20">
                    <TableCell className="font-bold text-lg">FINAL PRICE (with surcharge)</TableCell>
                    <TableCell colSpan={4}></TableCell>
                    <TableCell className="text-right font-bold text-xl text-primary">
                      ${calculations.finalPrice.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      {/* Knitting Cost Formula */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
        <h4 className="font-semibold mb-2">Knitting Cost Calculation:</h4>
        <div className="text-sm font-mono space-y-1 text-muted-foreground">
          <div>
            Labor: ${knittingLaborRate ?? 0}/hr × {calculations.knitting.timeHr.toFixed(2)}hr = $
            {calculations.knitting.labor.toFixed(2)}
          </div>
          <div>
            Electricity: ${knittingElectricityCost ?? 0}/hr × {calculations.knitting.timeHr.toFixed(2)}hr = $
            {calculations.knitting.electricity.toFixed(2)}
          </div>
          <div>
            Depreciation: ${knittingDepreciationPerHour ?? 0}/hr × {calculations.knitting.timeHr.toFixed(2)}hr = $
            {calculations.knitting.depreciation.toFixed(2)}
          </div>
          <div>
            Rent: ${calculations.rentPerHour.toFixed(2)}/hr ÷ {knittingMachineCount ?? 1} machines ×{" "}
            {calculations.knitting.timeHr.toFixed(2)}hr = ${calculations.knitting.rent.toFixed(2)}
          </div>
          <Separator className="my-2" />
          <div className="font-bold text-foreground">Total: ${calculations.knitting.total.toFixed(2)}</div>
        </div>
      </div>

      {/* Linking Cost Formula */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
        <h4 className="font-semibold mb-2">Linking Cost Calculation:</h4>
        <div className="text-sm font-mono space-y-1 text-muted-foreground">
          <div>
            Labor: ${linkingLaborRate ?? 0}/hr × {calculations.linking.timeHr.toFixed(2)}hr = $
            {calculations.linking.labor.toFixed(2)}
          </div>
          <div>
            Electricity: ${linkingElectricityCost ?? 0}/hr × {calculations.linking.timeHr.toFixed(2)}hr = $
            {calculations.linking.electricity.toFixed(2)}
          </div>
          <div>
            Depreciation: ${linkingDepreciationPerHour ?? 0}/hr × {calculations.linking.timeHr.toFixed(2)}hr = $
            {calculations.linking.depreciation.toFixed(2)}
          </div>
          <div>
            Rent: ${calculations.rentPerHour.toFixed(2)}/hr ÷ {linkingMachineCount ?? 1} machines ×{" "}
            {calculations.linking.timeHr.toFixed(2)}hr = ${calculations.linking.rent.toFixed(2)}
          </div>
          <Separator className="my-2" />
          <div className="font-bold text-foreground">Total: ${calculations.linking.total.toFixed(2)}</div>
        </div>
      </div>

      {/* Washing/Steaming Cost Formula */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
        <h4 className="font-semibold mb-2">Washing/Steaming Cost Calculation:</h4>
        <div className="text-sm font-mono space-y-1 text-muted-foreground">
          <div>
            Labor: ${washingLaborRate ?? 0}/hr × {calculations.washing.timeHr.toFixed(2)}hr = $
            {calculations.washing.labor.toFixed(2)}
          </div>
          <div>
            Washing Electricity: ${washingElectricityCost ?? 0}/hr × {calculations.washing.timeHr.toFixed(2)}hr = $
            {calculations.washing.electricity.toFixed(2)}
          </div>
          <div>
            Steaming Electricity: ${steamingElectricityCost ?? 0}/hr × {calculations.washing.timeHr.toFixed(2)}
            hr = ${calculations.washing.steamingElectricity.toFixed(2)}
          </div>
          <div>
            Washing Depreciation: ${washingDepreciationPerHour ?? 0}/hr × {calculations.washing.timeHr.toFixed(2)}hr = $
            {calculations.washing.depreciation.toFixed(2)}
          </div>
          <div>
            Steaming Depreciation: ${steamingDepreciationPerHour ?? 0}/hr × {calculations.washing.timeHr.toFixed(2)}hr =
            ${calculations.washing.steamingDepreciation.toFixed(2)}
          </div>
          <div>
            Rent: ${calculations.rentPerHour.toFixed(2)}/hr ÷ {washingMachineCount ?? 1} machines ×{" "}
            {calculations.washing.timeHr.toFixed(2)}hr = ${calculations.washing.rent.toFixed(2)}
          </div>
          <Separator className="my-2" />
          <div className="font-bold text-foreground">Total: ${calculations.washing.total.toFixed(2)}</div>
        </div>
      </div>

      {/* QC Cost Formula */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
        <h4 className="font-semibold mb-2">QC + Hand Finish Cost Calculation:</h4>
        <div className="text-sm font-mono space-y-1 text-muted-foreground">
          <div>
            Labor: ${qcHandFinishLaborRate ?? 0}/hr × {calculations.qc.timeHr.toFixed(2)}hr = $
            {calculations.qc.labor.toFixed(2)}
          </div>
          <div className="text-xs italic">(No machine costs - labor only)</div>
          <Separator className="my-2" />
          <div className="font-bold text-foreground">Total: ${calculations.qc.total.toFixed(2)}</div>
        </div>
      </div>

      {/* QC Cost Formula */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
        <h4 className="font-semibold mb-2">Programming Cost Calculation:</h4>
        <div className="text-sm font-mono space-y-1 text-muted-foreground">
          <div>
            Labor: ${programmingLaborRate ?? 0}/hr × {calculations.programming.timeHr.toFixed(2)}hr = $
            {calculations.programming.labor.toFixed(2)}
          </div>
          <div className="text-xs italic">(No machine costs - labor only)</div>
          <Separator className="my-2" />
          <div className="font-bold text-foreground">Total: ${calculations.programming.total.toFixed(2)}</div>
        </div>
      </div>

      {/* QC Cost Formula */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
        <h4 className="font-semibold mb-2">Consultation Cost Calculation:</h4>
        <div className="text-sm font-mono space-y-1 text-muted-foreground">
          <div>
            Labor: ${consultationLaborRate ?? 0}/hr × {calculations.consultation.timeHr.toFixed(2)}hr = $
            {calculations.consultation.labor.toFixed(2)}
          </div>
          <div className="text-xs italic">(No machine costs - labor only)</div>
          <Separator className="my-2" />
          <div className="font-bold text-foreground">Total: ${calculations.consultation.total.toFixed(2)}</div>
        </div>
      </div>

      {/* Added CAD Cost Formula */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
        <h4 className="font-semibold mb-2">CAD Cost Calculation:</h4>
        <div className="text-sm font-mono space-y-1 text-muted-foreground">
          <div>
            Labor: ${cadLaborRate ?? 0}/hr × {calculations.cad.timeHr.toFixed(2)}hr = $
            {calculations.cad.labor.toFixed(2)}
          </div>
          <div className="text-xs italic">(No machine costs - labor only)</div>
          <Separator className="my-2" />
          <div className="font-bold text-foreground">Total: ${calculations.cad.total.toFixed(2)}</div>
        </div>
      </div>

      {/* Added 3D Rendering Cost Formula */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
        <h4 className="font-semibold mb-2">3D Rendering Cost Calculation:</h4>
        <div className="text-sm font-mono space-y-1 text-muted-foreground">
          <div>
            Labor: ${renderingLaborRate ?? 0}/hr × {calculations.rendering.timeHr.toFixed(2)}hr = $
            {calculations.rendering.labor.toFixed(2)}
          </div>
          <div className="text-xs italic">(No machine costs - labor only)</div>
          <Separator className="my-2" />
          <div className="font-bold text-foreground">Total: ${calculations.rendering.total.toFixed(2)}</div>
        </div>
      </div>

      {/* Material Cost Formula */}
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
        <h4 className="font-semibold mb-2">Material Cost Calculation:</h4>
        <div className="text-sm font-mono space-y-1 text-muted-foreground">
          <div>
            Yarn: {((customGarmentWeight ?? standardGarmentWeightGrams ?? 0) / 1000).toFixed(3)}kg × $
            {yarnCostPerKg ?? 0}/kg = ${calculations.material.yarn.toFixed(2)}
          </div>
          <Separator className="my-2" />
          <div className="font-bold text-foreground">Total: ${calculations.material.total.toFixed(2)}</div>
        </div>
      </div>

      {/* Final Pricing Calculation */}
      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border-2 border-green-200 dark:border-green-800">
        <h4 className="font-semibold mb-2 text-green-900 dark:text-green-100">Final Pricing Calculation:</h4>
        <div className="text-sm font-mono space-y-1 text-muted-foreground">
          <div>
            Total Cost: ${calculations.knitting.total.toFixed(2)} + ${calculations.linking.total.toFixed(2)} + $
            {calculations.washing.total.toFixed(2)} + ${calculations.qc.total.toFixed(2)} + $
            {calculations.programming.total.toFixed(2)} + ${calculations.consultation.total.toFixed(2)}
            {/* Added CAD and 3D Rendering costs to Total Cost */}+ ${calculations.cad.total.toFixed(2)} + $
            {calculations.rendering.total.toFixed(2)} + ${calculations.material.total.toFixed(2)} = $
            {calculations.totalCost.toFixed(2)}
          </div>
          <div>
            Margin: ${calculations.totalCost.toFixed(2)} ÷ (1 - {(marginPercent ?? 0) / 100}) - $
            {calculations.totalCost.toFixed(2)} = ${calculations.marginAmount.toFixed(2)}
          </div>
          <Separator className="my-2" />
          <div className="font-bold text-xl text-green-700 dark:text-green-300">
            Selling Price: ${calculations.sellingPrice.toFixed(2)}
          </div>
        </div>
      </div>
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Info className="h-5 w-5" />
            Cost Calculation Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="font-mono bg-white dark:bg-slate-950 p-3 rounded border">
            <div className="font-semibold mb-2">Per Process Cost:</div>
            <div className="text-blue-600 dark:text-blue-400">
              (Labor Rate × Time) + (Time × Electricity) + (Time × Depreciation) + (Time × Rent Allocation)
            </div>
          </div>
          <div className="font-mono bg-white dark:bg-slate-950 p-3 rounded border">
            <div className="font-semibold mb-2">Rent Allocation:</div>
            <div className="text-blue-600 dark:text-blue-400">
              Rent Per Hour = Monthly Rent ÷ Working Hours/Month
              <br />
              Rent Per Machine = Rent Per Hour ÷ Number of Machines
            </div>
          </div>
          <div className="font-mono bg-white dark:bg-slate-950 p-3 rounded border">
            <div className="font-semibold mb-2">Total Cost & Pricing:</div>
            <div className="text-blue-600 dark:text-blue-400">
              Total Cost = Knitting + Linking + Washing/Steaming + QC/Hand Finish + Programming + Consultation + CAD +
              3D Rendering + Materials
              <br />
              Selling Price = Total Cost ÷ (1 - Margin%)
              <br />
              Final Price = Selling Price + Surcharge
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
