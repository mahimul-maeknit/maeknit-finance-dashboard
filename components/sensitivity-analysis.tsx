"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

interface SensitivityAnalysisProps {
  laborCostMultiplier: number
  setLaborCostMultiplier: (value: number) => void
  rentMultiplier: number
  setRentMultiplier: (value: number) => void
  materialCostMultiplier: number
  setMaterialCostMultiplier: (value: number) => void
  baseProfit: number
  currentProfit: number
}

export function SensitivityAnalysis({
  laborCostMultiplier,
  setLaborCostMultiplier,
  rentMultiplier,
  setRentMultiplier,
  materialCostMultiplier,
  setMaterialCostMultiplier,
  baseProfit,
  currentProfit,
}: SensitivityAnalysisProps) {
  const profitChange = currentProfit - baseProfit
  const profitChangePercent = baseProfit !== 0 ? (profitChange / baseProfit) * 100 : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cost Sensitivity Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Labor Cost Multiplier</Label>
                <Badge variant="outline">{(laborCostMultiplier * 100).toFixed(0)}%</Badge>
              </div>
              <Slider
                value={[laborCostMultiplier]}
                onValueChange={(value) => setLaborCostMultiplier(value[0])}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="text-sm text-gray-500">
                Monthly Impact: ${((laborCostMultiplier - 1) * 50684).toLocaleString()}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Rent Multiplier</Label>
                <Badge variant="outline">{(rentMultiplier * 100).toFixed(0)}%</Badge>
              </div>
              <Slider
                value={[rentMultiplier]}
                onValueChange={(value) => setRentMultiplier(value[0])}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="text-sm text-gray-500">
                Monthly Impact: ${((rentMultiplier - 1) * 7000).toLocaleString()}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Material Cost Multiplier</Label>
                <Badge variant="outline">{(materialCostMultiplier * 100).toFixed(0)}%</Badge>
              </div>
              <Slider
                value={[materialCostMultiplier]}
                onValueChange={(value) => setMaterialCostMultiplier(value[0])}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="text-sm text-gray-500">
                Monthly Impact: ${((materialCostMultiplier - 1) * 2000).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Profit Impact</span>
              <div className="text-right">
                <div className={`text-lg font-bold ${profitChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {profitChange >= 0 ? "+" : ""}${profitChange.toLocaleString()}
                </div>
                <div className={`text-sm ${profitChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {profitChangePercent >= 0 ? "+" : ""}
                  {profitChangePercent.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
