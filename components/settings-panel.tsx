"use client"

import { useState } from "react" // Import useState for loading state
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button" // Import Button

interface SettingsPanelProps {
  // Expenses
  teamLabor: number | null
  setTeamLabor: (value: number | null) => void
  rent: number | null
  setRent: (value: number | null) => void
  electricity: number | null
  setElectricity: (value: number | null) => void
  water: number | null
  setWater: (value: number | null) => void
  materialCost: number | null
  setMaterialCost: (value: number | null) => void
  overhead: number | null
  setOverhead: (value: number | null) => void

  // Utility rates
  waterRate: number | null
  setWaterRate: (value: number | null) => void
  electricityRate: number | null
  setElectricityRate: (value: number | null) => void
  laborRate: number | null
  setLaborRate: (value: number | null) => void

  // Service pricing
  swatchPrice: number | null
  setSwatchPrice: (value: number | null) => void
  samplePrice: number | null
  setSamplePrice: (value: number | null) => void
  gradingPrice: number | null
  setGradingPrice: (value: number | null) => void

  // Machine capacities
  e72StollCapacity: number | null
  setE72StollCapacity: (value: number | null) => void
  e35StollCapacity: number | null
  setE35StollCapacity: (value: number | null) => void
  e18SwgCapacity: number | null
  setE18SwgCapacity: (value: number | null) => void

  // Time requirements
  e72StollTime: number | null
  setE72StollTime: (value: number | null) => void
  e35StollTime: number | null
  setE35StollTime: (value: number | null) => void
  e18SwgTime: number | null
  setE18SwgTime: (value: number | null) => void

  // New prop for saving settings
  onSave: () => Promise<void>
}

export function SettingsPanel({
  teamLabor,
  setTeamLabor,
  rent,
  setRent,
  electricity,
  setElectricity,
  water,
  setWater,
  materialCost,
  setMaterialCost,
  overhead,
  setOverhead,
  waterRate,
  setWaterRate,
  electricityRate,
  setElectricityRate,
  laborRate,
  setLaborRate,
  swatchPrice,
  setSwatchPrice,
  samplePrice,
  setSamplePrice,
  gradingPrice,
  setGradingPrice,
  e72StollCapacity,
  setE72StollCapacity,
  e35StollCapacity,
  setE35StollCapacity,
  e18SwgCapacity,
  setE18SwgCapacity,
  e72StollTime,
  setE72StollTime,
  e35StollTime,
  setE35StollTime,
  e18SwgTime,
  setE18SwgTime,
  onSave, // Destructure the new prop
}: SettingsPanelProps) {
  const [isSaving, setIsSaving] = useState(false) // State for saving loading
  const totalMonthlyExpenses =
    (teamLabor ?? 0) + (rent ?? 0) + (electricity ?? 0) + (water ?? 0) + (materialCost ?? 0) + (overhead ?? 0)

  const handleSaveClick = async () => {
    setIsSaving(true)
    await onSave()
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      {/* Monthly Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Monthly Expenses
            <Badge variant="outline">${totalMonthlyExpenses.toLocaleString()}/month</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="team-labor">Team Labor ($)</Label>
            <Input
              id="team-labor"
              type="number"
              value={teamLabor ?? ""}
              onChange={(e) => setTeamLabor(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rent">Rent ($)</Label>
            <Input
              id="rent"
              type="number"
              value={rent ?? ""}
              onChange={(e) => setRent(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="electricity">Electricity ($)</Label>
            <Input
              id="electricity"
              type="number"
              value={electricity ?? ""}
              onChange={(e) => setElectricity(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="water">Water ($)</Label>
            <Input
              id="water"
              type="number"
              value={water ?? ""}
              onChange={(e) => setWater(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="material-cost">Material Cost ($)</Label>
            <Input
              id="material-cost"
              type="number"
              value={materialCost ?? ""}
              onChange={(e) => setMaterialCost(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overhead">T&E + G&A ($)</Label>
            <Input
              id="overhead"
              type="number"
              value={overhead ?? ""}
              onChange={(e) => setOverhead(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Utility Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Utility Rates</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="water-rate">Water + Sewer Rate ($/gallon)</Label>
            <Input
              id="water-rate"
              type="number"
              step="0.01"
              value={waterRate ?? ""}
              onChange={(e) => setWaterRate(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="electricity-rate">Electricity Rate ($/kWh)</Label>
            <Input
              id="electricity-rate"
              type="number"
              step="0.01"
              value={electricityRate ?? ""}
              onChange={(e) =>
                setElectricityRate(e.target.value === "" ? null : Number.parseFloat(e.target.value) || 0)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="labor-rate">Labor Rate ($/hour)</Label>
            <Input
              id="labor-rate"
              type="number"
              value={laborRate ?? ""}
              onChange={(e) => setLaborRate(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Service Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="swatch-price">Swatch Price ($)</Label>
            <Input
              id="swatch-price"
              type="number"
              value={swatchPrice ?? ""}
              onChange={(e) => setSwatchPrice(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)}
            />
            <div className="text-xs text-gray-500">
              Profit: ${(swatchPrice !== null ? swatchPrice - 75.88 : -75.88).toFixed(2)} (
              {(((swatchPrice !== null ? swatchPrice - 75.88 : -75.88) / (swatchPrice || 1)) * 100).toFixed(1)}%)
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sample-price">Sample Price ($)</Label>
            <Input
              id="sample-price"
              type="number"
              value={samplePrice ?? ""}
              onChange={(e) => setSamplePrice(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)}
            />
            <div className="text-xs text-gray-500">
              Profit: ${(samplePrice !== null ? samplePrice - 327.02 : -327.02).toFixed(2)} (
              {(((samplePrice !== null ? samplePrice - 327.02 : -327.02) / (samplePrice || 1)) * 100).toFixed(1)}
              %)
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grading-price">Grading Price ($)</Label>
            <Input
              id="grading-price"
              type="number"
              value={gradingPrice ?? ""}
              onChange={(e) => setGradingPrice(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)}
            />
            <div className="text-xs text-gray-500">
              Profit: ${(gradingPrice !== null ? gradingPrice - 1201.34 : -1201.34).toFixed(2)} (
              {(((gradingPrice !== null ? gradingPrice - 1201.34 : -1201.34) / (gradingPrice || 1)) * 100).toFixed(1)}%)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Machine Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Machine Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">E7.2 STOLL</h4>
              <div className="space-y-2">
                <Label htmlFor="e72-capacity">Daily Capacity</Label>
                <Input
                  id="e72-capacity"
                  type="number"
                  value={e72StollCapacity ?? ""}
                  onChange={(e) =>
                    setE72StollCapacity(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e72-time">Time per Garment (min)</Label>
                <Input
                  id="e72-time"
                  type="number"
                  value={e72StollTime ?? ""}
                  onChange={(e) => setE72StollTime(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="text-xs text-gray-500">
                Annual: {((e72StollCapacity ?? 0) * 365).toLocaleString()} garments
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">E3.5,2 STOLL</h4>
              <div className="space-y-2">
                <Label htmlFor="e35-capacity">Daily Capacity</Label>
                <Input
                  id="e35-capacity"
                  type="number"
                  value={e35StollCapacity ?? ""}
                  onChange={(e) =>
                    setE35StollCapacity(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e35-time">Time per Garment (min)</Label>
                <Input
                  id="e35-time"
                  type="number"
                  value={e35StollTime ?? ""}
                  onChange={(e) => setE35StollTime(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="text-xs text-gray-500">
                Annual: {((e35StollCapacity ?? 0) * 365).toLocaleString()} garments
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">E18 SWG</h4>
              <div className="space-y-2">
                <Label htmlFor="e18-capacity">Daily Capacity</Label>
                <Input
                  id="e18-capacity"
                  type="number"
                  value={e18SwgCapacity ?? ""}
                  onChange={(e) =>
                    setE18SwgCapacity(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e18-time">Time per Garment (min)</Label>
                <Input
                  id="e18-time"
                  type="number"
                  value={e18SwgTime ?? ""}
                  onChange={(e) => setE18SwgTime(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="text-xs text-gray-500">
                Annual: {((e18SwgCapacity ?? 0) * 365).toLocaleString()} garments
              </div>
            </div>
          </div>

          <Separator />

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-2">Total Machine Capacity</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Daily Total:</span>{" "}
                <span className="font-bold">
                  {(e72StollCapacity ?? 0) + (e35StollCapacity ?? 0) + (e18SwgCapacity ?? 0)} garments
                </span>
              </div>
              <div>
                <span className="text-blue-600">Annual Total:</span>{" "}
                <span className="font-bold">
                  {(((e72StollCapacity ?? 0) + (e35StollCapacity ?? 0) + (e18SwgCapacity ?? 0)) * 365).toLocaleString()}{" "}
                  garments
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveClick} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
