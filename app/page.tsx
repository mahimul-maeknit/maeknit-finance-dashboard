"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { SensitivityAnalysis } from "@/components/sensitivity-analysis"
import { CashFlowProjection } from "@/components/cash-flow-projection"
import { MachineROICalculator } from "@/components/machine-roi-calculator"
import { SettingsPanel } from "@/components/settings-panel"
import AuthStatus from "@/components/auth-status"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

// Define a type for the savable settings
type SavableSettings = {
  teamLabor: number
  rent: number
  electricity: number
  water: number
  materialCost: number
  overhead: number
  waterRate: number
  electricityRate: number
  laborRate: number
  swatchPrice: number
  samplePrice: number
  gradingPrice: number
  e72StollCapacity: number
  e35StollCapacity: number
  e18SwgCapacity: number
  e72StollTime: number
  e35StollTime: number
  e18SwgTime: number
}

export default function FinanceDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Editable expense fields
  const [teamLabor, setTeamLabor] = useState(50684)
  const [rent, setRent] = useState(7000)
  const [electricity, setElectricity] = useState(450)
  const [water, setWater] = useState(431)
  const [materialCost, setMaterialCost] = useState(2000)
  const [overhead, setOverhead] = useState(4240)

  // Editable utility rates
  const [waterRate, setWaterRate] = useState(1.69)
  const [electricityRate, setElectricityRate] = useState(0.32)
  const [laborRate, setLaborRate] = useState(30)

  // Editable service pricing
  const [swatchPrice, setSwatchPrice] = useState(250)
  const [samplePrice, setSamplePrice] = useState(2000)
  const [gradingPrice, setGradingPrice] = useState(2500)

  // Editable machine capacities
  const [e72StollCapacity, setE72StollCapacity] = useState(16)
  const [e35StollCapacity, setE35StollCapacity] = useState(10)
  const [e18SwgCapacity, setE18SwgCapacity] = useState(16)

  // Editable time requirements
  const [e72StollTime, setE72StollTime] = useState(3)
  const [e35StollTime, setE35StollTime] = useState(1)
  const [e18SwgTime, setE18SwgTime] = useState(1)

  const [shifts, setShifts] = useState(1)
  const [avgGarmentPrice, setAvgGarmentPrice] = useState(150)
  const [developmentMix, setDevelopmentMix] = useState("worst")
  const [swatchesPerWeek, setSwatchesPerWeek] = useState(14)
  const [samplesPerWeek, setSamplesPerWeek] = useState(4)
  const [gradingPerWeek, setGradingPerWeek] = useState(2)

  const [laborCostMultiplier, setLaborCostMultiplier] = useState(1)
  const [rentMultiplier, setRentMultiplier] = useState(1)
  const [materialCostMultiplier, setMaterialCostMultiplier] = useState(1)

  const BASE_EXPENSES = {
    teamLabor: teamLabor,
    rent: rent,
    electricity: electricity,
    water: water,
    materialCost: materialCost,
    overhead: overhead,
  }

  const MACHINE_CAPACITY = {
    "E7.2 STOLL": { timePerGarment: e72StollTime, dailyCapacity: e72StollCapacity },
    "E3.5,2 STOLL": { timePerGarment: e35StollTime, dailyCapacity: e35StollCapacity },
    "E18 SWG": { timePerGarment: e18SwgTime, dailyCapacity: e18SwgCapacity },
  }

  const SERVICE_PRICING = {
    swatch: { cost: 75.88, price: swatchPrice, profit: swatchPrice - 75.88 },
    sample: { cost: 327.02, price: samplePrice, profit: samplePrice - 327.02 },
    grading: { cost: 1201.34, price: gradingPrice, profit: gradingPrice - 1201.34 },
  }

  const AUTHORIZED_EMAILS = ["mahimul@maeknit.io", "mallory@maeknit.io", "elias@maeknit.io", "tech@maeknit.io", "intel@maeknit.io"]

  const calculations = useMemo(() => {
    // Apply cost multipliers to base expenses
    const adjustedExpenses = {
      teamLabor: BASE_EXPENSES.teamLabor * laborCostMultiplier,
      rent: BASE_EXPENSES.rent * rentMultiplier,
      electricity: BASE_EXPENSES.electricity,
      water: BASE_EXPENSES.water,
      materialCost: BASE_EXPENSES.materialCost * materialCostMultiplier,
      overhead: BASE_EXPENSES.overhead,
    }

    const monthlyExpenses = Object.values(adjustedExpenses).reduce((sum, expense) => sum + expense, 0)
    const annualExpenses = monthlyExpenses * 12

    // Rest of the existing calculation logic remains the same...
    let dailyProductionCapacity = 0
    if (shifts === 1) {
      dailyProductionCapacity = developmentMix === "production-only" ? 42 : 16
    } else if (shifts === 2) {
      dailyProductionCapacity = 58
    }

    const annualProductionCapacity = dailyProductionCapacity * 365
    const productionRevenue = annualProductionCapacity * avgGarmentPrice

    const annualSwatches = swatchesPerWeek * 52
    const annualSamples = samplesPerWeek * 52
    const annualGrading = gradingPerWeek * 52

    const developmentRevenue =
      annualSwatches * SERVICE_PRICING.swatch.price +
      annualSamples * SERVICE_PRICING.sample.price +
      annualGrading * SERVICE_PRICING.grading.price

    const totalRevenue = productionRevenue + developmentRevenue
    const profit = totalRevenue - annualExpenses
    const profitMargin = (profit / totalRevenue) * 100

    return {
      monthlyExpenses,
      annualExpenses,
      adjustedExpenses,
      dailyProductionCapacity,
      annualProductionCapacity,
      productionRevenue,
      developmentRevenue,
      totalRevenue,
      profit,
      profitMargin,
      annualSwatches,
      annualSamples,
      annualGrading,
    }
  }, [
    shifts,
    avgGarmentPrice,
    developmentMix,
    swatchesPerWeek,
    samplesPerWeek,
    gradingPerWeek,
    laborCostMultiplier,
    rentMultiplier,
    materialCostMultiplier,
    teamLabor,
    rent,
    electricity,
    water,
    materialCost,
    overhead,
    swatchPrice,
    samplePrice,
    gradingPrice,
    e72StollCapacity,
    e35StollCapacity,
    e18SwgCapacity,
  ])

  const expenseBreakdown = [
    { name: "Team Labor", value: BASE_EXPENSES.teamLabor, color: "#8884d8" },
    { name: "Rent", value: BASE_EXPENSES.rent, color: "#82ca9d" },
    { name: "Electricity", value: BASE_EXPENSES.electricity, color: "#ffc658" },
    { name: "Water", value: BASE_EXPENSES.water, color: "#ff7300" },
    { name: "Materials", value: BASE_EXPENSES.materialCost, color: "#00ff00" },
    { name: "Overhead", value: BASE_EXPENSES.overhead, color: "#ff0000" },
  ]

  const revenueBreakdown = [
    { name: "Production", value: calculations.productionRevenue, color: "#8884d8" },
    { name: "Development", value: calculations.developmentRevenue, color: "#82ca9d" },
  ]

  const scenarioComparison = [
    {
      scenario: "1 Shift - Worst Case",
      revenue: 1497672,
      expenses: 777655,
      profit: 720017,
    },
    {
      scenario: "1 Shift - Best Case",
      revenue: 2400672,
      expenses: 777655,
      profit: 1623017,
    },
    {
      scenario: "2 Shifts - Worst Case",
      revenue: 3145032,
      expenses: 818208,
      profit: 2326824,
    },
    {
      scenario: "2 Shifts - Best Case",
      revenue: 4048032,
      expenses: 818208,
      profit: 3229824,
    },
    {
      scenario: "Current Scenario",
      revenue: calculations.totalRevenue,
      expenses: calculations.annualExpenses,
      profit: calculations.profit,
    },
  ]

  // Function to save settings to the database
  const handleSaveSettings = async () => {
    const settingsToSave: SavableSettings = {
      teamLabor,
      rent,
      electricity,
      water,
      materialCost,
      overhead,
      waterRate,
      electricityRate,
      laborRate,
      swatchPrice,
      samplePrice,
      gradingPrice,
      e72StollCapacity,
      e35StollCapacity,
      e18SwgCapacity,
      e72StollTime,
      e35StollTime,
      e18SwgTime,
    }

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settingsToSave),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save settings")
      }

      console.log("Settings Saved!", "Your financial dashboard settings have been successfully updated.")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(
        "Error Saving Settings",
        error.message || "There was an issue saving your settings. Please try again.",
      )
    }
  }

  // Fetch settings on component mount if authorized
  useEffect(() => {
    const fetchSettings = async () => {
      if (status === "authenticated" && AUTHORIZED_EMAILS.includes(session?.user?.email || "")) {
        try {
          const response = await fetch("/api/settings")
          if (!response.ok) {
            throw new Error("Failed to fetch settings")
          }
          const fetchedSettings: SavableSettings = await response.json()

          // Update state with fetched settings if they exist
          if (Object.keys(fetchedSettings).length > 0) {
            // Check if fetchedSettings is not empty
            setTeamLabor(fetchedSettings.teamLabor)
            setRent(fetchedSettings.rent)
            setElectricity(fetchedSettings.electricity)
            setWater(fetchedSettings.water)
            setMaterialCost(fetchedSettings.materialCost)
            setOverhead(fetchedSettings.overhead)
            setWaterRate(fetchedSettings.waterRate)
            setElectricityRate(fetchedSettings.electricityRate)
            setLaborRate(fetchedSettings.laborRate)
            setSwatchPrice(fetchedSettings.swatchPrice)
            setSamplePrice(fetchedSettings.samplePrice)
            setGradingPrice(fetchedSettings.gradingPrice)
            setE72StollCapacity(fetchedSettings.e72StollCapacity)
            setE35StollCapacity(fetchedSettings.e35StollCapacity)
            setE18SwgCapacity(fetchedSettings.e18SwgCapacity)
            setE72StollTime(fetchedSettings.e72StollTime)
            setE35StollTime(fetchedSettings.e35StollTime)
            setE18SwgTime(fetchedSettings.e18SwgTime)
            console.log("Settings Loaded!", "Previous settings have been loaded.")
          }
        } catch (error) {
          console.error("Error fetching settings:", error)
          console.error("Error Loading Settings", "Could not load previous settings. Using default values.")
        }
      }
    }
    fetchSettings()
  }, [session, status])

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (status === "loading") return // Do nothing while loading session

    if (status === "unauthenticated" || !AUTHORIZED_EMAILS.includes(session?.user?.email || "")) {
      router.push("/login")
    }
  }, [session, status, router])

  // Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading dashboard...</p>
      </div>
    )
  }

  // If authenticated but not authorized, the useEffect above will redirect.
  // This ensures the dashboard content is only rendered for authorized users.
  if (status === "unauthenticated" || !AUTHORIZED_EMAILS.includes(session?.user?.email || "")) {
    return null
  }
  

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <AuthStatus />
      <div className="max-w-full px-4 sm:px-6 lg:px-8 mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">NY Manufacturing Financial Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Interactive Financial Modeling for MAEKNIT</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex flex-wrap justify-center w-full gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Input Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Scenario Parameters</CardTitle>
                <CardDescription>Adjust these parameters to see real-time financial projections</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shifts">Number of Shifts</Label>
                  <Select value={shifts.toString()} onValueChange={(value) => setShifts(Number.parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Shift</SelectItem>
                      <SelectItem value="2">2 Shifts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Avg Garment Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={avgGarmentPrice}
                    onChange={(e) => setAvgGarmentPrice(Number.parseInt(e.target.value) || 150)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="swatches">Swatches/Week</Label>
                  <Input
                    id="swatches"
                    type="number"
                    value={swatchesPerWeek}
                    onChange={(e) => setSwatchesPerWeek(Number.parseInt(e.target.value) || 14)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="samples">Samples/Week</Label>
                  <Input
                    id="samples"
                    type="number"
                    value={samplesPerWeek}
                    onChange={(e) => setSamplesPerWeek(Number.parseInt(e.target.value) || 4)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grading">Grading/Week</Label>
                  <Input
                    id="grading"
                    type="number"
                    value={gradingPerWeek}
                    onChange={(e) => setGradingPerWeek(Number.parseInt(e.target.value) || 2)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Development Mix</Label>
                  <Select value={developmentMix} onValueChange={setDevelopmentMix}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production-only">Production Only</SelectItem>
                      <SelectItem value="worst">With Development (Conservative)</SelectItem>
                      <SelectItem value="best">With Development (Optimistic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Annual Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${calculations.totalRevenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Production: ${calculations.productionRevenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Development: ${calculations.developmentRevenue.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Annual Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">${calculations.annualExpenses.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Monthly: ${calculations.monthlyExpenses.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Annual Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${calculations.profit > 0 ? "text-green-600" : "text-red-600"}`}>
                    ${calculations.profit.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Margin: {calculations.profitMargin.toFixed(1)}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Production Capacity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {calculations.annualProductionCapacity.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Daily: {calculations.dailyProductionCapacity} garments
                  </div>
                  <div className="text-xs text-gray-500">
                    {shifts} shift{shifts > 1 ? "s" : ""}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue vs Expenses Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: "Revenue", value: calculations.totalRevenue, fill: "#10b981" },
                      { name: "Expenses", value: calculations.annualExpenses, fill: "#ef4444" },
                      { name: "Profit", value: calculations.profit, fill: "#3b82f6" },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scenario Comparison</CardTitle>
                <CardDescription>Compare different operational scenarios</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={scenarioComparison} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenario" angle={-45} textAnchor="end" height={80} interval={0} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                    <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Development Services Annual Volume</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Swatches</span>
                    <Badge variant="secondary">{calculations.annualSwatches} units</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Samples</span>
                    <Badge variant="secondary">{calculations.annualSamples} units</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Grading</span>
                    <Badge variant="secondary">{calculations.annualGrading} units</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Profitability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Swatch Margin</span>
                      <span className="font-medium">
                        {((SERVICE_PRICING.swatch.profit / SERVICE_PRICING.swatch.price) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sample Margin</span>
                      <span className="font-medium">
                        {((SERVICE_PRICING.sample.profit / SERVICE_PRICING.sample.price) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Grading Margin</span>
                      <span className="font-medium">
                        {((SERVICE_PRICING.grading.profit / SERVICE_PRICING.grading.price) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenueBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {revenueBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(BASE_EXPENSES).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b">
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <div className="text-right">
                        <div className="font-bold">${value.toLocaleString()}/month</div>
                        <div className="text-sm text-gray-500">${(value * 12).toLocaleString()}/year</div>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center py-2 font-bold text-lg">
                    <span>Total</span>
                    <div className="text-right">
                      <div>${calculations.monthlyExpenses.toLocaleString()}/month</div>
                      <div className="text-sm">${calculations.annualExpenses.toLocaleString()}/year</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Machine Capacity Planning</CardTitle>
                <CardDescription>Current machine utilization and capacity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(MACHINE_CAPACITY).map(([machine, data]) => (
                    <div key={machine} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{machine}</h4>
                        <Badge>{data.dailyCapacity} garments/day</Badge>
                      </div>
                      <div className="text-sm text-gray-600">Time per garment: {data.timePerGarment} minutes</div>
                      <div className="text-sm text-gray-600">
                        Annual capacity: {(data.dailyCapacity * 365).toLocaleString()} garments
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Break-even Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Break-even Revenue</div>
                    <div className="text-2xl font-bold text-blue-800">
                      ${calculations.annualExpenses.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Break-even Units (Production)</div>
                    <div className="text-2xl font-bold text-green-800">
                      {Math.ceil(calculations.annualExpenses / avgGarmentPrice).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Safety Margin</div>
                    <div className="text-2xl font-bold text-purple-800">
                      {(
                        ((calculations.totalRevenue - calculations.annualExpenses) / calculations.totalRevenue) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sensitivity" className="space-y-6">
            <SensitivityAnalysis
              laborCostMultiplier={laborCostMultiplier}
              setLaborCostMultiplier={setLaborCostMultiplier}
              rentMultiplier={rentMultiplier}
              setRentMultiplier={setRentMultiplier}
              materialCostMultiplier={materialCostMultiplier}
              setMaterialCostMultiplier={setMaterialCostMultiplier}
              baseProfit={
                calculations.totalRevenue -
                (BASE_EXPENSES.teamLabor +
                  BASE_EXPENSES.rent +
                  BASE_EXPENSES.electricity +
                  BASE_EXPENSES.water +
                  BASE_EXPENSES.materialCost +
                  BASE_EXPENSES.overhead) *
                  12
              }
              currentProfit={calculations.profit}
            />

            <MachineROICalculator />
          </TabsContent>

          <TabsContent value="cashflow" className="space-y-6">
            <CashFlowProjection
              monthlyRevenue={calculations.totalRevenue / 12}
              monthlyExpenses={calculations.monthlyExpenses}
            />
          </TabsContent>
          <TabsContent value="settings" className="space-y-6">
            <SettingsPanel
              teamLabor={teamLabor}
              setTeamLabor={setTeamLabor}
              rent={rent}
              setRent={setRent}
              electricity={electricity}
              setElectricity={setElectricity}
              water={water}
              setWater={setWater}
              materialCost={materialCost}
              setMaterialCost={setMaterialCost}
              overhead={overhead}
              setOverhead={setOverhead}
              waterRate={waterRate}
              setWaterRate={setWaterRate}
              electricityRate={electricityRate}
              setElectricityRate={setElectricityRate}
              laborRate={laborRate}
              setLaborRate={setLaborRate}
              swatchPrice={swatchPrice}
              setSwatchPrice={setSwatchPrice}
              samplePrice={samplePrice}
              setSamplePrice={setSamplePrice}
              gradingPrice={gradingPrice}
              setGradingPrice={setGradingPrice}
              e72StollCapacity={e72StollCapacity}
              setE72StollCapacity={setE72StollCapacity}
              e35StollCapacity={e35StollCapacity}
              setE35StollCapacity={setE35StollCapacity}
              e18SwgCapacity={e18SwgCapacity}
              setE18SwgCapacity={setE18SwgCapacity}
              e72StollTime={e72StollTime}
              setE72StollTime={setE72StollTime}
              e35StollTime={e35StollTime}
              setE35StollTime={setE35StollTime}
              e18SwgTime={e18SwgTime}
              setE18SwgTime={setE18SwgTime}
              onSave={handleSaveSettings} // Pass the save function
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
