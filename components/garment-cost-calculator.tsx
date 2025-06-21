"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Define garment types and their base metrics
const GARMENT_TYPES = {
  "4x1 top": { machineTime: 90, linkingTime: 60, yarnCostPerKg: 25, garmentWeightGrams: 600 },
  boucle: { machineTime: 110, linkingTime: 60, yarnCostPerKg: 38, garmentWeightGrams: 600 },
  "cable crewneck": { machineTime: 60, linkingTime: 60, yarnCostPerKg: 25, garmentWeightGrams: 600 },
  "vintage cardigan": { machineTime: 110, linkingTime: 90, yarnCostPerKg: 25, garmentWeightGrams: 460 },
} as const // Use 'as const' for type safety

// Define fixed rates for USA (MAEKNIT)
const USA_RATES = {
  knittingCostPerHour: 0.52,
  linkingCostPerHour: 0.55,
  qcHandFinishPerHour: 4,
  washingSteamingPerHour: 5.5,
  laborRatePerHour: 30, // "1 hour 30" from spreadsheet
  marginPercent: 0.6, // 60% margin
}

// Define fixed rates for Turkey (ACN)
const ACN_RATES = {
  knittingCostPerHour: 0.1,
  linkingCostPerHour: 0.22,
  qcHandFinishPerHour: 2,
  washingSteamingPerHour: 2.5,
  acnMarginPercent: 0.3, // 30% ACN margin
  dhlShipCost: 5,
  maeknitTariffPercent: 0.15, // Estimated 15% tariff
  maeknitMarginPercent: 0.6, // 60% MAEKNIT margin
}

export function GarmentCostCalculator() {
  const [selectedGarment, setSelectedGarment] = useState<keyof typeof GARMENT_TYPES>("4x1 top")
  const [customMachineTime, setCustomMachineTime] = useState<number | null>(null)
  const [customLinkingTime, setCustomLinkingTime] = useState<number | null>(null)
  const [customYarnCostPerKg, setCustomYarnCostPerKg] = useState<number | null>(null)
  const [customGarmentWeightGrams, setCustomGarmentWeightGrams] = useState<number | null>(null)

  const currentGarment = GARMENT_TYPES[selectedGarment]

  // UseMemo to calculate costs based on selected garment and custom inputs
  const calculations = useMemo(() => {
    const machineTime = customMachineTime ?? currentGarment.machineTime
    const linkingTime = customLinkingTime ?? currentGarment.linkingTime
    const yarnCostPerKg = customYarnCostPerKg ?? currentGarment.yarnCostPerKg
    const garmentWeightGrams = customGarmentWeightGrams ?? currentGarment.garmentWeightGrams
    const garmentWeightKg = garmentWeightGrams / 1000

    // --- MAEKNIT (USA) Calculations ---
    const usaYarnCost = yarnCostPerKg * garmentWeightKg
    const usaMachineTimeCost = (machineTime / 60) * USA_RATES.knittingCostPerHour * USA_RATES.laborRatePerHour
    const usaLinkingTimeCost = (linkingTime / 60) * USA_RATES.linkingCostPerHour * USA_RATES.laborRatePerHour
    const usaWashingCost = USA_RATES.washingSteamingPerHour
    const usaQCHandFinishCost = USA_RATES.qcHandFinishPerHour

    const usaTotalCost = usaYarnCost + usaMachineTimeCost + usaLinkingTimeCost + usaWashingCost + usaQCHandFinishCost
    const usaMargin = usaTotalCost * USA_RATES.marginPercent
    const usaTotalPrice = usaTotalCost + usaMargin

    // --- ACN (Turkey) Calculations ---
    const acnMachineTimeCost = machineTime * ACN_RATES.knittingCostPerHour
    const acnLinkingTimeCost = linkingTime * ACN_RATES.linkingCostPerHour
    const acnYarnCost = yarnCostPerKg * garmentWeightKg // Yarn cost is the same regardless of factory
    const acnWashingCost = ACN_RATES.washingSteamingPerHour
    const acnQCHandFinishCost = ACN_RATES.qcHandFinishPerHour

    const acnDirectCost = acnMachineTimeCost + acnLinkingTimeCost + acnYarnCost + acnWashingCost + acnQCHandFinishCost
    const acnMargin = acnDirectCost * ACN_RATES.acnMarginPercent
    const acnTotalPriceBeforeDHL = acnDirectCost + acnMargin
    const acnTotalPriceWithDHL = acnTotalPriceBeforeDHL + ACN_RATES.dhlShipCost

    const maeknitCostFromACN = acnTotalPriceWithDHL
    const maeknitTariff = maeknitCostFromACN * ACN_RATES.maeknitTariffPercent
    const maeknitCostAfterTariff = maeknitCostFromACN + maeknitTariff
    const maeknitMarginFromACN = maeknitCostAfterTariff * ACN_RATES.maeknitMarginPercent
    const maeknitTotalPriceFromACN = maeknitCostAfterTariff + maeknitMarginFromACN

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
      },
      currentInputs: {
        machineTime,
        linkingTime,
        yarnCostPerKg,
        garmentWeightGrams,
      },
    }
  }, [
    selectedGarment,
    customMachineTime,
    customLinkingTime,
    customYarnCostPerKg,
    customGarmentWeightGrams,
    currentGarment,
  ])

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
                      <TableCell>60% Margin</TableCell>
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
                      <TableCell>30% ACN Margin</TableCell>
                      <TableCell className="text-right">${calculations.acn.margin.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>DHL Shipping</TableCell>
                      <TableCell className="text-right">${ACN_RATES.dhlShipCost.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow className="font-bold bg-gray-50">
                      <TableCell>MAEKNIT Cost (from ACN)</TableCell>
                      <TableCell className="text-right">${calculations.acn.maeknitCostFromACN.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>15% Tariff</TableCell>
                      <TableCell className="text-right">${calculations.acn.maeknitTariff.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow className="font-bold bg-gray-50">
                      <TableCell>MAEKNIT Cost (After Tariff)</TableCell>
                      <TableCell className="text-right">
                        ${calculations.acn.maeknitCostAfterTariff.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>60% MAEKNIT Margin</TableCell>
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
