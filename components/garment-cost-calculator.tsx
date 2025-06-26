"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button" // Import Button
import { useSession } from "next-auth/react" // Import useSession

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
  

// Define garment types and their base metrics
const GARMENT_TYPES = {
  "4x1 top": { machineTime: 90, linkingTime: 60, yarnCostPerKg: 25, garmentWeightGrams: 600 },
  boucle: { machineTime: 110, linkingTime: 60, yarnCostPerKg: 38, garmentWeightGrams: 600 },
  "cable crewneck": { machineTime: 60, linkingTime: 60, yarnCostPerKg: 25, garmentWeightGrams: 600 },
  "vintage cardigan": { machineTime: 110, linkingTime: 90, yarnCostPerKg: 25, garmentWeightGrams: 460 },
} as const // Use 'as const' for type safety

// Define initial fixed rates for USA (MAEKNIT)
const INITIAL_USA_FIXED_RATES = {
  knittingCostPerHour: 0.52,
  linkingCostPerHour: 0.55,
  qcHandFinishPerHour: 4,
  washingSteamingPerHour: 5.5,
  laborRatePerHour: 30, // "1 hour 30" from spreadsheet
}

// Define initial fixed rates for Turkey (ACN)
const INITIAL_ACN_FIXED_RATES = {
  knittingCostPerHour: 0.1,
  linkingCostPerHour: 0.22,
  qcHandFinishPerHour: 2,
  washingSteamingPerHour: 2.5,
  dhlShipCost: 5,
  maeknitTariffPercent: 0.15, // Estimated 15% tariff
}

export function GarmentCostCalculator() {
  const { data: session, status } = useSession()
  
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

  const [selectedGarment, setSelectedGarment] = useState<keyof typeof GARMENT_TYPES>("4x1 top")
  const [customMachineTime, setCustomMachineTime] = useState<number | null>(null)
  const [customLinkingTime, setCustomLinkingTime] = useState<number | null>(null)
  const [customYarnCostPerKg, setCustomYarnCostPerKg] = useState<number | null>(null)
  const [customGarmentWeightGrams, setCustomGarmentWeightGrams] = useState<number | null>(null)

  // State for margin percentages
  const [usaMarginInput, setUsaMarginInput] = useState<number | null>(50) // Default to 50% as per spreadsheet
  const [acnFactoryMarginInput, setAcnFactoryMarginInput] = useState<number | null>(30) // Default to 30%
  const [maeknitAcnMarginInput, setMaeknitAcnMarginInput] = useState<number | null>(33) // Default to 33% as per spreadsheet

  // State for USA fixed rates
  const [usaKnittingCostPerHour, setUsaKnittingCostPerHour] = useState<number | null>(
    INITIAL_USA_FIXED_RATES.knittingCostPerHour,
  )
  const [usaLinkingCostPerHour, setUsaLinkingCostPerHour] = useState<number | null>(
    INITIAL_USA_FIXED_RATES.linkingCostPerHour,
  )
  const [usaQCHandFinishPerHour, setUsaQCHandFinishPerHour] = useState<number | null>(
    INITIAL_USA_FIXED_RATES.qcHandFinishPerHour,
  )
  const [usaWashingSteamingPerHour, setUsaWashingSteamingPerHour] = useState<number | null>(
    INITIAL_USA_FIXED_RATES.washingSteamingPerHour,
  )
  const [usaLaborRatePerHour, setUsaLaborRatePerHour] = useState<number | null>(
    INITIAL_USA_FIXED_RATES.laborRatePerHour,
  )

  // State for ACN fixed rates
  const [acnKnittingCostPerHour, setAcnKnittingCostPerHour] = useState<number | null>(
    INITIAL_ACN_FIXED_RATES.knittingCostPerHour,
  )
  const [acnLinkingCostPerHour, setAcnLinkingCostPerHour] = useState<number | null>(
    INITIAL_ACN_FIXED_RATES.linkingCostPerHour,
  )
  const [acnQCHandFinishPerHour, setAcnQCHandFinishPerHour] = useState<number | null>(
    INITIAL_ACN_FIXED_RATES.qcHandFinishPerHour,
  )
  const [acnWashingSteamingPerHour, setAcnWashingSteamingPerHour] = useState<number | null>(
    INITIAL_ACN_FIXED_RATES.washingSteamingPerHour,
  )
  const [acnDHLShipCost, setAcnDHLShipCost] = useState<number | null>(INITIAL_ACN_FIXED_RATES.dhlShipCost)
  const [acnMaeknitTariffPercent, setAcnMaeknitTariffPercent] = useState<number | null>(
    INITIAL_ACN_FIXED_RATES.maeknitTariffPercent,
  )

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // New loading state

  const currentGarment = GARMENT_TYPES[selectedGarment]

  // Function to reset all settings to their initial default values
  const handleResetToDefaults = () => {
    setUsaMarginInput(50)
    setAcnFactoryMarginInput(30)
    setMaeknitAcnMarginInput(33)
    setUsaKnittingCostPerHour(INITIAL_USA_FIXED_RATES.knittingCostPerHour)
    setUsaLinkingCostPerHour(INITIAL_USA_FIXED_RATES.linkingCostPerHour)
    setUsaQCHandFinishPerHour(INITIAL_USA_FIXED_RATES.qcHandFinishPerHour)
    setUsaWashingSteamingPerHour(INITIAL_USA_FIXED_RATES.washingSteamingPerHour)
    setUsaLaborRatePerHour(INITIAL_USA_FIXED_RATES.laborRatePerHour)
    setAcnKnittingCostPerHour(INITIAL_ACN_FIXED_RATES.knittingCostPerHour)
    setAcnLinkingCostPerHour(INITIAL_ACN_FIXED_RATES.linkingCostPerHour)
    setAcnQCHandFinishPerHour(INITIAL_ACN_FIXED_RATES.qcHandFinishPerHour)
    setAcnWashingSteamingPerHour(INITIAL_ACN_FIXED_RATES.washingSteamingPerHour)
    setAcnDHLShipCost(INITIAL_ACN_FIXED_RATES.dhlShipCost)
    setAcnMaeknitTariffPercent(INITIAL_ACN_FIXED_RATES.maeknitTariffPercent)
    setCustomMachineTime(null)
    setCustomLinkingTime(null)
    setCustomYarnCostPerKg(null)
    setCustomGarmentWeightGrams(null)
    console.log("Garment Cost Calculator settings reset to defaults.")
  }

  // Function to save settings to the database
  const handleSaveSettings = async () => {
    setIsSaving(true)
    const settingsToSave: GarmentSavableSettings = {
      usaMarginInput,
      acnFactoryMarginInput,
      maeknitAcnMarginInput,
      usaKnittingCostPerHour,
      usaLinkingCostPerHour,
      usaQCHandFinishPerHour,
      usaWashingSteamingPerHour,
      usaLaborRatePerHour,
      acnKnittingCostPerHour,
      acnLinkingCostPerHour,
      acnQCHandFinishPerHour,
      acnWashingSteamingPerHour,
      acnDHLShipCost,
      acnMaeknitTariffPercent,
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

      console.log("Garment Cost Calculator Settings Saved!", "Your settings have been successfully updated.")
    } catch (error: unknown) {
      let errorMessage = "There was an issue saving your settings. Please try again."
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (
        typeof error === "object" &&
        error !== null &&
        "error" in error &&
        typeof (error as { error: string }).error === "string"
      ) {
        errorMessage = (error as { error: string }).error
      }
      console.error("Error Saving Garment Cost Calculator Settings", errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  // Fetch settings on component mount if authorized
  useEffect(() => {
    const fetchSettings = async () => {
      if (status === "authenticated" && AUTHORIZED_EMAILS.includes(session?.user?.email || "")) {
        try {
          const response = await fetch("/api/garment-calculator-settings")
          if (!response.ok) {
            throw new Error("Failed to fetch garment calculator settings")
          }
          const fetchedSettings: GarmentSavableSettings = await response.json()

          // Update state with fetched settings if they exist
          if (Object.keys(fetchedSettings).length > 0) {
            setUsaMarginInput(fetchedSettings.usaMarginInput ?? 50)
            setAcnFactoryMarginInput(fetchedSettings.acnFactoryMarginInput ?? 30)
            setMaeknitAcnMarginInput(fetchedSettings.maeknitAcnMarginInput ?? 33)
            setUsaKnittingCostPerHour(
              fetchedSettings.usaKnittingCostPerHour ?? INITIAL_USA_FIXED_RATES.knittingCostPerHour,
            )
            setUsaLinkingCostPerHour(
              fetchedSettings.usaLinkingCostPerHour ?? INITIAL_USA_FIXED_RATES.linkingCostPerHour,
            )
            setUsaQCHandFinishPerHour(
              fetchedSettings.usaQCHandFinishPerHour ?? INITIAL_USA_FIXED_RATES.qcHandFinishPerHour,
            )
            setUsaWashingSteamingPerHour(
              fetchedSettings.usaWashingSteamingPerHour ?? INITIAL_USA_FIXED_RATES.washingSteamingPerHour,
            )
            setUsaLaborRatePerHour(fetchedSettings.usaLaborRatePerHour ?? INITIAL_USA_FIXED_RATES.laborRatePerHour)
            setAcnKnittingCostPerHour(
              fetchedSettings.acnKnittingCostPerHour ?? INITIAL_ACN_FIXED_RATES.knittingCostPerHour,
            )
            setAcnLinkingCostPerHour(
              fetchedSettings.acnLinkingCostPerHour ?? INITIAL_ACN_FIXED_RATES.linkingCostPerHour,
            )
            setAcnQCHandFinishPerHour(
              fetchedSettings.acnQCHandFinishPerHour ?? INITIAL_ACN_FIXED_RATES.qcHandFinishPerHour,
            )
            setAcnWashingSteamingPerHour(
              fetchedSettings.acnWashingSteamingPerHour ?? INITIAL_ACN_FIXED_RATES.washingSteamingPerHour,
            )
            setAcnDHLShipCost(fetchedSettings.acnDHLShipCost ?? INITIAL_ACN_FIXED_RATES.dhlShipCost)
            setAcnMaeknitTariffPercent(
              fetchedSettings.acnMaeknitTariffPercent ?? INITIAL_ACN_FIXED_RATES.maeknitTariffPercent,
            )
            console.log("Garment Cost Calculator Settings Loaded!", "Previous settings have been loaded.")
          }
        } catch (error) {
          console.error("Error fetching garment calculator settings:", error)
          console.error(
            "Error Loading Garment Cost Calculator Settings",
            "Could not load previous settings. Using default values.",
          )
        } finally {
          setIsLoading(false)
        }
      } else if (status !== "loading") {
        setIsLoading(false) // If not authenticated or authorized, stop loading and use defaults
      }
    }
    fetchSettings()
  }, [session, status])

  // UseMemo to calculate costs based on selected garment and custom inputs
  const calculations = useMemo(() => {
    const machineTime = customMachineTime ?? currentGarment.machineTime
    const linkingTime = customLinkingTime ?? currentGarment.linkingTime
    const yarnCostPerKg = customYarnCostPerKg ?? currentGarment.yarnCostPerKg
    const garmentWeightGrams = customGarmentWeightGrams ?? currentGarment.garmentWeightGrams
    const garmentWeightKg = garmentWeightGrams / 1000

    // Convert margin inputs to decimal percentages
    const usaMarginPercent = (usaMarginInput ?? 0) / 100
    const acnFactoryMarginPercent = (acnFactoryMarginInput ?? 0) / 100
    const maeknitAcnMarginPercent = (maeknitAcnMarginInput ?? 0) / 100

    // Use current state values for fixed rates, defaulting to 0 if null
    const usaRates = {
      knittingCostPerHour: usaKnittingCostPerHour ?? 0,
      linkingCostPerHour: usaLinkingCostPerHour ?? 0,
      qcHandFinishPerHour: usaQCHandFinishPerHour ?? 0,
      washingSteamingPerHour: usaWashingSteamingPerHour ?? 0,
      laborRatePerHour: usaLaborRatePerHour ?? 0,
    }

    const acnRates = {
      knittingCostPerHour: acnKnittingCostPerHour ?? 0,
      linkingCostPerHour: acnLinkingCostPerHour ?? 0,
      qcHandFinishPerHour: acnQCHandFinishPerHour ?? 0,
      washingSteamingPerHour: acnWashingSteamingPerHour ?? 0,
      dhlShipCost: acnDHLShipCost ?? 0,
      maeknitTariffPercent: acnMaeknitTariffPercent ?? 0,
    }

    // --- MAEKNIT (USA) Calculations ---
    const usaYarnCost = yarnCostPerKg * garmentWeightKg
    const usaMachineTimeCost = (machineTime / 60) * usaRates.knittingCostPerHour * usaRates.laborRatePerHour
    const usaLinkingTimeCost = (linkingTime / 60) * usaRates.linkingCostPerHour * usaRates.laborRatePerHour
    const usaWashingCost = usaRates.washingSteamingPerHour
    const usaQCHandFinishCost = usaRates.qcHandFinishPerHour

    const usaTotalCost = usaYarnCost + usaMachineTimeCost + usaLinkingTimeCost + usaWashingCost + usaQCHandFinishCost

    // Calculate USA Total Price using the provided formula: Selling Price = Cost / (1 - Margin)
    const usaTotalPrice = usaMarginPercent < 1 ? usaTotalCost / (1 - usaMarginPercent) : usaTotalCost // Avoid division by zero or negative
    const usaMargin = usaTotalPrice - usaTotalCost

    // --- ACN (Turkey) Calculations ---
    const acnMachineTimeCost = machineTime * acnRates.knittingCostPerHour
    const acnLinkingTimeCost = linkingTime * acnRates.linkingCostPerHour
    const acnYarnCost = yarnCostPerKg * garmentWeightKg // Yarn cost is the same regardless of factory
    const acnWashingCost = acnRates.washingSteamingPerHour
    const acnQCHandFinishCost = acnRates.qcHandFinishPerHour

    const acnDirectCost = acnMachineTimeCost + acnLinkingTimeCost + acnYarnCost + acnWashingCost + acnQCHandFinishCost

    // Calculate ACN Total Price Before DHL using the provided formula
    const acnTotalPriceBeforeDHL =
      acnFactoryMarginPercent < 1 ? acnDirectCost / (1 - acnFactoryMarginPercent) : acnDirectCost
    const acnMargin = acnTotalPriceBeforeDHL - acnDirectCost

    const acnTotalPriceWithDHL = acnTotalPriceBeforeDHL + acnRates.dhlShipCost

    const maeknitCostFromACN = acnTotalPriceWithDHL
    const maeknitTariff = maeknitCostFromACN * acnRates.maeknitTariffPercent
    const maeknitCostAfterTariff = maeknitCostFromACN + maeknitTariff

    // Calculate MAEKNIT Total Price from ACN using the provided formula
    const maeknitTotalPriceFromACN =
      maeknitAcnMarginPercent < 1 ? maeknitCostAfterTariff / (1 - maeknitAcnMarginPercent) : maeknitCostAfterTariff
    const maeknitMarginFromACN = maeknitTotalPriceFromACN - maeknitCostAfterTariff

    return {
      usa: {
        yarnCost: usaYarnCost,
        machineTimeCost: usaMachineTimeCost,
        linkingTimeCost: usaLinkingTimeCost,
        washingCost: usaWashingCost,
        qcHandFinishCost: usaQCHandFinishCost,
        totalCost: usaTotalCost,
        margin: usaMargin,
        totalPrice: usaTotalPrice,
        // Calculate margin percentage based on total price
        marginPercent: usaTotalPrice !== 0 ? (usaMargin / usaTotalPrice) * 100 : 0,
      },
      acn: {
        machineTimeCost: acnMachineTimeCost,
        linkingTimeCost: acnLinkingTimeCost,
        yarnCost: acnYarnCost,
        washingCost: acnWashingCost,
        qcHandFinishCost: acnQCHandFinishCost,
        directCost: acnDirectCost,
        margin: acnMargin,
        totalPriceBeforeDHL: acnTotalPriceBeforeDHL,
        totalPriceWithDHL: acnTotalPriceWithDHL,
        maeknitCostFromACN: maeknitCostFromACN,
        maeknitTariff: maeknitTariff,
        maeknitCostAfterTariff: maeknitCostAfterTariff,
        maeknitMarginFromACN: maeknitMarginFromACN,
        maeknitTotalPriceFromACN: maeknitTotalPriceFromACN,
        // Calculate margin percentages based on total prices
        acnFactoryMarginPercent: acnTotalPriceBeforeDHL !== 0 ? (acnMargin / acnTotalPriceBeforeDHL) * 100 : 0,
        maeknitAcnMarginPercent:
          maeknitTotalPriceFromACN !== 0 ? (maeknitMarginFromACN / maeknitTotalPriceFromACN) * 100 : 0,
      },
      currentInputs: {
        machineTime,
        linkingTime,
        yarnCostPerKg,
        garmentWeightGrams,
      },
      usaRates, // Include usaRates in the returned object
      acnRates, // Include acnRates in the returned object
    }
  }, [
    selectedGarment,
    customMachineTime,
    customLinkingTime,
    customYarnCostPerKg,
    customGarmentWeightGrams,
    currentGarment,
    usaMarginInput,
    acnFactoryMarginInput,
    maeknitAcnMarginInput,
    usaKnittingCostPerHour,
    usaLinkingCostPerHour,
    usaQCHandFinishPerHour,
    usaWashingSteamingPerHour,
    usaLaborRatePerHour,
    acnKnittingCostPerHour,
    acnLinkingCostPerHour,
    acnQCHandFinishPerHour,
    acnWashingSteamingPerHour,
    acnDHLShipCost,
    acnMaeknitTariffPercent,
  ])

  // Destructure usaRates and acnRates from calculations
  const { acnRates } = calculations

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading garment calculator settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Garment Cost Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="garment-type">Select Garment Type</Label>
              <Select
                value={selectedGarment}
                onValueChange={(value: keyof typeof GARMENT_TYPES) => {
                  setSelectedGarment(value)
                  // Clear custom inputs when changing garment type
                  setCustomMachineTime(null)
                  setCustomLinkingTime(null)
                  setCustomYarnCostPerKg(null)
                  setCustomGarmentWeightGrams(null)
                }}
              >
                <SelectTrigger id="garment-type">
                  <SelectValue placeholder="Select a garment type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(GARMENT_TYPES).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <h3 className="text-lg font-semibold mb-4">Custom Garment Inputs (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custom-machine-time">Machine Time (min)</Label>
              <Input
                id="custom-machine-time"
                type="number"
                value={customMachineTime ?? ""}
                placeholder={currentGarment.machineTime.toString()}
                onChange={(e) =>
                  setCustomMachineTime(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-linking-time">Linking Time (min)</Label>
              <Input
                id="custom-linking-time"
                type="number"
                value={customLinkingTime ?? ""}
                placeholder={currentGarment.linkingTime.toString()}
                onChange={(e) =>
                  setCustomLinkingTime(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-yarn-cost">Yarn Cost Per KG ($)</Label>
              <Input
                id="custom-yarn-cost"
                type="number"
                step="0.01"
                value={customYarnCostPerKg ?? ""}
                placeholder={currentGarment.yarnCostPerKg.toString()}
                onChange={(e) =>
                  setCustomYarnCostPerKg(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-garment-weight">Garment Weight (grams)</Label>
              <Input
                id="custom-garment-weight"
                type="number"
                value={customGarmentWeightGrams ?? ""}
                placeholder={currentGarment.garmentWeightGrams.toString()}
                onChange={(e) =>
                  setCustomGarmentWeightGrams(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>

          <Separator />

          {/* Margin Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Margin Settings (%)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usa-margin">MAEKNIT (USA) Margin</Label>
                <Input
                  id="usa-margin"
                  type="number"
                  step="1"
                  value={usaMarginInput ?? ""}
                  onChange={(e) =>
                    setUsaMarginInput(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acn-factory-margin">ACN Factory Margin</Label>
                <Input
                  id="acn-factory-margin"
                  type="number"
                  step="1"
                  value={acnFactoryMarginInput ?? ""}
                  onChange={(e) =>
                    setAcnFactoryMarginInput(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maeknit-acn-margin">MAEKNIT Margin (from ACN)</Label>
                <Input
                  id="maeknit-acn-margin"
                  type="number"
                  step="1"
                  value={maeknitAcnMarginInput ?? ""}
                  onChange={(e) =>
                    setMaeknitAcnMarginInput(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Fixed Rates Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Fixed Rates Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <h4 className="font-medium text-gray-700">MAEKNIT (USA) Rates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usa-knitting-cost">Knitting Cost ($/hr)</Label>
                  <Input
                    id="usa-knitting-cost"
                    type="number"
                    step="0.01"
                    value={usaKnittingCostPerHour ?? ""}
                    onChange={(e) =>
                      setUsaKnittingCostPerHour(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usa-linking-cost">Linking Cost ($/hr)</Label>
                  <Input
                    id="usa-linking-cost"
                    type="number"
                    step="0.01"
                    value={usaLinkingCostPerHour ?? ""}
                    onChange={(e) =>
                      setUsaLinkingCostPerHour(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usa-qc-cost">QC Hand Finish ($/hr)</Label>
                  <Input
                    id="usa-qc-cost"
                    type="number"
                    step="0.01"
                    value={usaQCHandFinishPerHour ?? ""}
                    onChange={(e) =>
                      setUsaQCHandFinishPerHour(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usa-washing-cost">Washing/Steaming ($/hr)</Label>
                  <Input
                    id="usa-washing-cost"
                    type="number"
                    step="0.01"
                    value={usaWashingSteamingPerHour ?? ""}
                    onChange={(e) =>
                      setUsaWashingSteamingPerHour(
                        e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usa-labor-rate">Labor Rate ($/hr)</Label>
                  <Input
                    id="usa-labor-rate"
                    type="number"
                    step="0.01"
                    value={usaLaborRatePerHour ?? ""}
                    onChange={(e) =>
                      setUsaLaborRatePerHour(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
              </div>

              <Separator />

              <h4 className="font-medium text-gray-700">ACN (Turkey) Rates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="acn-knitting-cost">Knitting Cost ($/min)</Label>
                  <Input
                    id="acn-knitting-cost"
                    type="number"
                    step="0.01"
                    value={acnKnittingCostPerHour ?? ""}
                    onChange={(e) =>
                      setAcnKnittingCostPerHour(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acn-linking-cost">Linking Cost ($/min)</Label>
                  <Input
                    id="acn-linking-cost"
                    type="number"
                    step="0.01"
                    value={acnLinkingCostPerHour ?? ""}
                    onChange={(e) =>
                      setAcnLinkingCostPerHour(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acn-qc-cost">QC Hand Finish ($/hr)</Label>
                  <Input
                    id="acn-qc-cost"
                    type="number"
                    step="0.01"
                    value={acnQCHandFinishPerHour ?? ""}
                    onChange={(e) =>
                      setAcnQCHandFinishPerHour(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acn-washing-cost">Washing/Steaming ($/hr)</Label>
                  <Input
                    id="acn-washing-cost"
                    type="number"
                    step="0.01"
                    value={acnWashingSteamingPerHour ?? ""}
                    onChange={(e) =>
                      setAcnWashingSteamingPerHour(
                        e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acn-dhl-ship-cost">DHL Shipping ($)</Label>
                  <Input
                    id="acn-dhl-ship-cost"
                    type="number"
                    step="0.01"
                    value={acnDHLShipCost ?? ""}
                    onChange={(e) =>
                      setAcnDHLShipCost(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acn-tariff-percent">MAEKNIT Tariff (%)</Label>
                  <Input
                    id="acn-tariff-percent"
                    type="number"
                    step="0.01"
                    value={(acnMaeknitTariffPercent ?? "") === "" ? "" : (acnMaeknitTariffPercent ?? 0) * 100}
                    onChange={(e) =>
                      setAcnMaeknitTariffPercent(
                        e.target.value === "" ? null : Number.parseFloat(e.target.value) / 100 || 0,
                      )
                    }
                  />
                </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* MAEKNIT (USA) Costs */}
            <Card>
              <CardHeader>
                <CardTitle>MAEKNIT (USA) Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cost Item</TableHead>
                      <TableHead className="text-right">Amount ($)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Yarn Cost</TableCell>
                      <TableCell className="text-right">${calculations.usa.yarnCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Machine Time Cost</TableCell>
                      <TableCell className="text-right">${calculations.usa.machineTimeCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Linking Time Cost</TableCell>
                      <TableCell className="text-right">${calculations.usa.linkingTimeCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Washing/Steaming</TableCell>
                      <TableCell className="text-right">${calculations.usa.washingCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>QC + Hand Finish</TableCell>
                      <TableCell className="text-right">${calculations.usa.qcHandFinishCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow className="font-bold bg-gray-50">
                      <TableCell>Total Cost</TableCell>
                      <TableCell className="text-right">${calculations.usa.totalCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{calculations.usa.marginPercent.toFixed(0)}% Margin</TableCell>
                      <TableCell className="text-right">${calculations.usa.margin.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow className="font-bold bg-blue-50">
                      <TableCell>Total Price (USA)</TableCell>
                      <TableCell className="text-right text-lg">${calculations.usa.totalPrice.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* ACN (Turkey) Costs */}
            <Card>
              <CardHeader>
                <CardTitle>ACN (Turkey) Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cost Item</TableHead>
                      <TableHead className="text-right">Amount ($)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Machine Time Cost</TableCell>
                      <TableCell className="text-right">${calculations.acn.machineTimeCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Linking Time Cost</TableCell>
                      <TableCell className="text-right">${calculations.acn.linkingTimeCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Yarn Cost</TableCell>
                      <TableCell className="text-right">${calculations.acn.yarnCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Washing/Steaming</TableCell>
                      <TableCell className="text-right">${calculations.acn.washingCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>QC + Hand Finish</TableCell>
                      <TableCell className="text-right">${calculations.acn.qcHandFinishCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow className="font-bold bg-gray-50">
                      <TableCell>ACN Direct Cost</TableCell>
                      <TableCell className="text-right">${calculations.acn.directCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{calculations.acn.acnFactoryMarginPercent.toFixed(0)}% ACN Margin</TableCell>
                      <TableCell className="text-right">${calculations.acn.margin.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>DHL Shipping</TableCell>
                      <TableCell className="text-right">${acnRates.dhlShipCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow className="font-bold bg-gray-50">
                      <TableCell>MAEKNIT Cost (from ACN)</TableCell>
                      <TableCell className="text-right">${calculations.acn.maeknitCostFromACN.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{(acnRates.maeknitTariffPercent * 100).toFixed(0)}% Tariff</TableCell>
                      <TableCell className="text-right">${calculations.acn.maeknitTariff.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow className="font-bold bg-gray-50">
                      <TableCell>MAEKNIT Cost (After Tariff)</TableCell>
                      <TableCell className="text-right">
                        ${calculations.acn.maeknitCostAfterTariff.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{calculations.acn.maeknitAcnMarginPercent.toFixed(0)}% MAEKNIT Margin</TableCell>
                      <TableCell className="text-right">${calculations.acn.maeknitMarginFromACN.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow className="font-bold bg-blue-50">
                      <TableCell>Total Price (ACN)</TableCell>
                      <TableCell className="text-right text-lg">
                        ${calculations.acn.maeknitTotalPriceFromACN.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
