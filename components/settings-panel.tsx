"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface SettingsPanelProps {
  // Expenses
  teamLabor: number
  setTeamLabor: (value: number) => void
  rent: number
  setRent: (value: number) => void
  electricity: number
  setElectricity: (value: number) => void
  water: number
  setWater: (value: number) => void
  materialCost: number
  setMaterialCost: (value: number) => void
  overhead: number
  setOverhead: (value: number) => void

  // Utility rates
  waterRate: number
  setWaterRate: (value: number) => void
  electricityRate: number
  setElectricityRate: (value: number) => void
  laborRate: number
  setLaborRate: (value: number) => void

  // Service pricing
  swatchPrice: number
  setSwatchPrice: (value: number) => void
  samplePrice: number
  setSamplePrice: (value: number) => void
  gradingPrice: number
  setGradingPrice: (value: number) => void

  // Machine capacities
  e72StollCapacity: number
  setE72StollCapacity: (value: number) => void
  e35StollCapacity: number
  setE35StollCapacity: (value: number) => void
  e18SwgCapacity: number
  setE18SwgCapacity: (value: number) => void

  // Time requirements
  e72StollTime: number
  setE72StollTime: (value: number) => void
  e35StollTime: number
  setE35StollTime: (value: number) => void
  e18SwgTime: number
  setE18SwgTime: (value: number) => void
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
}: SettingsPanelProps) {
  const totalMonthlyExpenses = teamLabor + rent + electricity + water + materialCost + overhead

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
              value={teamLabor}
              onChange={(e) => setTeamLabor(Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rent">Rent ($)</Label>
            <Input
              id="rent"
              type="number"
              value={rent}
              onChange={(e) => setRent(Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="electricity">Electricity ($)</Label>
            <Input
              id="electricity"
              type="number"
              value={electricity}
              onChange={(e) => setElectricity(Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="water">Water ($)</Label>
            <Input
              id="water"
              type="number"
              value={water}
              onChange={(e) => setWater(Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="material-cost">Material Cost ($)</Label>
            <Input
              id="material-cost"
              type="number"
              value={materialCost}
              onChange={(e) => setMaterialCost(Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overhead">T&E + G&A ($)</Label>
            <Input
              id="overhead"
              type="number"
              value={overhead}
              onChange={(e) => setOverhead(Number.parseInt(e.target.value) || 0)}
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
              value={waterRate}
              onChange={(e) => setWaterRate(Number.parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="electricity-rate">Electricity Rate ($/kWh)</Label>
            <Input
              id="electricity-rate"
              type="number"
              step="0.01"
              value={electricityRate}
              onChange={(e) => setElectricityRate(Number.parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="labor-rate">Labor Rate ($/hour)</Label>
            <Input
              id="labor-rate"
              type="number"
              value={laborRate}
              onChange={(e) => setLaborRate(Number.parseInt(e.target.value) || 0)}
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
              value={swatchPrice}
              onChange={(e) => setSwatchPrice(Number.parseInt(e.target.value) || 0)}
            />
            <div className="text-xs text-gray-500">
              Profit: ${(swatchPrice - 75.88).toFixed(2)} ({(((swatchPrice - 75.88) / swatchPrice) * 100).toFixed(1)}%)
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sample-price">Sample Price ($)</Label>
            <Input
              id="sample-price"
              type="number"
              value={samplePrice}
              onChange={(e) => setSamplePrice(Number.parseInt(e.target.value) || 0)}
            />
            <div className="text-xs text-gray-500">
              Profit: ${(samplePrice - 327.02).toFixed(2)} ({(((samplePrice - 327.02) / samplePrice) * 100).toFixed(1)}
              %)
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grading-price">Grading Price ($)</Label>
            <Input
              id="grading-price"
              type="number"
              value={gradingPrice}
              onChange={(e) => setGradingPrice(Number.parseInt(e.target.value) || 0)}
            />
            <div className="text-xs text-gray-500">
              Profit: ${(gradingPrice - 1201.34).toFixed(2)} (
              {(((gradingPrice - 1201.34) / gradingPrice) * 100).toFixed(1)}%)
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
                  value={e72StollCapacity}
                  onChange={(e) => setE72StollCapacity(Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e72-time">Time per Garment (min)</Label>
                <Input
                  id="e72-time"
                  type="number"
                  value={e72StollTime}
                  onChange={(e) => setE72StollTime(Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="text-xs text-gray-500">Annual: {(e72StollCapacity * 365).toLocaleString()} garments</div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">E3.5,2 STOLL</h4>
              <div className="space-y-2">
                <Label htmlFor="e35-capacity">Daily Capacity</Label>
                <Input
                  id="e35-capacity"
                  type="number"
                  value={e35StollCapacity}
                  onChange={(e) => setE35StollCapacity(Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e35-time">Time per Garment (min)</Label>
                <Input
                  id="e35-time"
                  type="number"
                  value={e35StollTime}
                  onChange={(e) => setE35StollTime(Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="text-xs text-gray-500">Annual: {(e35StollCapacity * 365).toLocaleString()} garments</div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">E18 SWG</h4>
              <div className="space-y-2">
                <Label htmlFor="e18-capacity">Daily Capacity</Label>
                <Input
                  id="e18-capacity"
                  type="number"
                  value={e18SwgCapacity}
                  onChange={(e) => setE18SwgCapacity(Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e18-time">Time per Garment (min)</Label>
                <Input
                  id="e18-time"
                  type="number"
                  value={e18SwgTime}
                  onChange={(e) => setE18SwgTime(Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="text-xs text-gray-500">Annual: {(e18SwgCapacity * 365).toLocaleString()} garments</div>
            </div>
          </div>

          <Separator />

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-2">Total Machine Capacity</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Daily Total:</span>{" "}
                <span className="font-bold">{e72StollCapacity + e35StollCapacity + e18SwgCapacity} garments</span>
              </div>
              <div>
                <span className="text-blue-600">Annual Total:</span>{" "}
                <span className="font-bold">
                  {((e72StollCapacity + e35StollCapacity + e18SwgCapacity) * 365).toLocaleString()} garments
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
