"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function MachineROICalculator() {
  const [machineCost, setMachineCost] = useState(100000)
  const [additionalCapacity, setAdditionalCapacity] = useState(10)
  const [avgGarmentPrice, setAvgGarmentPrice] = useState(150)
  const [operatingCostPerMonth, setOperatingCostPerMonth] = useState(5000)

  const annualRevenue = additionalCapacity * 365 * avgGarmentPrice
  const annualOperatingCost = operatingCostPerMonth * 12
  const annualProfit = annualRevenue - annualOperatingCost
  const paybackPeriod = annualProfit > 0 ? machineCost / annualProfit : Number.POSITIVE_INFINITY // Handle division by zero
  const roi = annualProfit > 0 ? (annualProfit / machineCost) * 100 : 0 // Handle division by zero

  return (
    <Card>
      <CardHeader>
        <CardTitle>Machine ROI Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="machine-cost">Machine Cost ($)</Label>
            <Input
              id="machine-cost"
              type="number"
              value={machineCost}
              onChange={(e) => setMachineCost(Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-capacity">Additional Daily Capacity</Label>
            <Input
              id="additional-capacity"
              type="number"
              value={additionalCapacity}
              onChange={(e) => setAdditionalCapacity(Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="garment-price">Avg Garment Price ($)</Label>
            <Input
              id="garment-price"
              type="number"
              value={avgGarmentPrice}
              onChange={(e) => setAvgGarmentPrice(Number.parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="operating-cost">Monthly Operating Cost ($)</Label>
            <Input
              id="operating-cost"
              type="number"
              value={operatingCostPerMonth}
              onChange={(e) => setOperatingCostPerMonth(Number.parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <div className="text-sm text-blue-600 font-medium">Annual Revenue</div>
            <div className="text-xl font-bold text-blue-800">${annualRevenue.toLocaleString()}</div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg text-center">
            <div className="text-sm text-green-600 font-medium">Annual Profit</div>
            <div className="text-xl font-bold text-green-800">${annualProfit.toLocaleString()}</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <div className="text-sm text-purple-600 font-medium">Payback Period</div>
            <div className="text-xl font-bold text-purple-800">
              {paybackPeriod === Number.POSITIVE_INFINITY ? "N/A" : `${paybackPeriod.toFixed(1)} years`}
            </div>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg text-center">
            <div className="text-sm text-orange-600 font-medium">ROI</div>
            <div className="text-xl font-bold text-orange-800">{roi.toFixed(1)}%</div>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Investment Analysis</h4>
          <div className="space-y-1 text-sm">
            <div>
              • Break-even time:{" "}
              {paybackPeriod === Number.POSITIVE_INFINITY ? "N/A" : `${paybackPeriod.toFixed(1)} years`}
            </div>
            <div>• 5-year total profit: ${(annualProfit * 5 - machineCost).toLocaleString()}</div>
            <div>• Monthly profit contribution: ${(annualProfit / 12).toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
