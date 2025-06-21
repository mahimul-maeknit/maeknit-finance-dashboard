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
import { Button } from "@/components/ui/button"

// Define a type for the savable settings
type SavableSettings = {
  teamLabor: number | null
  rent: number | null
  electricity: number | null
  water: number | null
  materialCost: number | null
  overhead: number | null
  waterRate: number | null
  electricityRate: number | null
  laborRate: number | null
  swatchPrice: number | null
  samplePrice: number | null
  gradingPrice: number | null
  e72StollCapacity: number | null
  e35StollCapacity: number | null
  e18SwgCapacity: number | null
  e72StollTime: number | null
  e35StollTime: number | null
  e18SwgTime: number | null
  shifts: number | null
  avgGarmentPrice: number | null
  developmentMix: string | null
  swatchesPerWeek: number | null
  samplesPerWeek: number | null
  gradingPerWeek: number | null
}

// Declare MACHINE_CAPACITY variable
const MACHINE_CAPACITY = {
  "E72 Stoll": { dailyCapacity: 16, timePerGarment: 3 },
  "E35 Stoll": { dailyCapacity: 10, timePerGarment: 1 },
  "E18 SWG": { dailyCapacity: 16, timePerGarment: 1 },
}

export default function FinanceDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const AUTHORIZED_EMAILS = [
    "mahimul@maeknit.io",
    "mallory@maeknit.io",
    "elias@maeknit.io",
    "tech@maeknit.io",
    "intel@maeknit.io",
    "matt@maeknit.io",
  ]

  // Editable expense fields
  const [teamLabor, setTeamLabor] = useState<number | null>(50684)
  const [rent, setRent] = useState<number | null>(7000)
  const [electricity, setElectricity] = useState<number | null>(450)
  const [water, setWater] = useState<number | null>(431)
  const [materialCost, setMaterialCost] = useState<number | null>(2000)
  const [overhead, setOverhead] = useState<number | null>(4240)

  // Editable utility rates
  const [waterRate, setWaterRate] = useState<number | null>(1.69)
  const [electricityRate, setElectricityRate] = useState<number | null>(0.32)
  const [laborRate, setLaborRate] = useState<number | null>(30)

  // Editable service pricing
  const [swatchPrice, setSwatchPrice] = useState<number | null>(250)
  const [samplePrice, setSamplePrice] = useState<number | null>(2000)
  const [gradingPrice, setGradingPrice] = useState<number | null>(2500)

  // Editable machine capacities
  const [e72StollCapacity, setE72StollCapacity] = useState<number | null>(16)
  const [e35StollCapacity, setE35StollCapacity] = useState<number | null>(10)
  const [e18SwgCapacity, setE18SwgCapacity] = useState<number | null>(16)

  // Editable time requirements
  const [e72StollTime, setE72StollTime] = useState<number | null>(3)
  const [e35StollTime, setE35StollTime] = useState<number | null>(1)
  const [e18SwgTime, setE18SwgTime] = useState<number | null>(1)

  const [shifts, setShifts] = useState<number | null>(1)
  const [avgGarmentPrice, setAvgGarmentPrice] = useState<number | null>(150)
  const [developmentMix, setDevelopmentMix] = useState<string | null>("worst")
  const [swatchesPerWeek, setSwatchesPerWeek] = useState<number | null>(14)
  const [samplesPerWeek, setSamplesPerWeek] = useState<number | null>(4)
  const [gradingPerWeek, setGradingPerWeek] = useState<number | null>(2)

  const [laborCostMultiplier, setLaborCostMultiplier] = useState(1)
  const [rentMultiplier, setRentMultiplier] = useState(1)
  const [materialCostMultiplier, setMaterialCostMultiplier] = useState(1)
  const [isSaving, setIsSaving] = useState(false)

  const calculations = useMemo(() => {
    // Define BASE_EXPENSES and SERVICE_PRICING inside useMemo
    // so they are re-calculated when their dependencies change.
    const BASE_EXPENSES = {
      teamLabor: teamLabor ?? 0,
      rent: rent ?? 0,
      electricity: electricity ?? 0,
      water: water ?? 0,
      materialCost: materialCost ?? 0,
      overhead: overhead ?? 0,
    }

    const SERVICE_PRICING = {
      swatch: { cost: 75.88, price: swatchPrice ?? 0, profit: (swatchPrice ?? 0) - 75.88 },
      sample: { cost: 327.02, price: samplePrice ?? 0, profit: (samplePrice ?? 0) - 327.02 },
      grading: { cost: 1201.34, price: gradingPrice ?? 0, profit: (gradingPrice ?? 0) - 1201.34 },
    }

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

    let dailyProductionCapacity = 0
    const currentShifts = shifts ?? 1 // Default to 1 if null
    const currentDevelopmentMix = developmentMix ?? "worst" // Default if null

    if (currentShifts === 1) {
      dailyProductionCapacity = currentDevelopmentMix === "production-only" ? 42 : 16
    } else if (currentShifts === 2) {
      dailyProductionCapacity = 58
    }

    const annualProductionCapacity = dailyProductionCapacity * 365
    const productionRevenue = annualProductionCapacity * (avgGarmentPrice ?? 0)

    const annualSwatches = (swatchesPerWeek ?? 0) * 52
    const annualSamples = (samplesPerWeek ?? 0) * 52
    const annualGrading = (gradingPerWeek ?? 0) * 52

    const developmentRevenue =
      annualSwatches * SERVICE_PRICING.swatch.price +
      annualSamples * SERVICE_PRICING.sample.price +
      annualGrading * SERVICE_PRICING.grading.price

    const totalRevenue = productionRevenue + developmentRevenue
    const profit = totalRevenue - annualExpenses
    const profitMargin = totalRevenue !== 0 ? (profit / totalRevenue) * 100 : 0

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
      BASE_EXPENSES, // Include BASE_EXPENSES in the returned object if needed elsewhere
      SERVICE_PRICING, // Include SERVICE_PRICING in the returned object if needed elsewhere
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
    teamLabor, // Dependency for BASE_EXPENSES
    rent, // Dependency for BASE_EXPENSES
    electricity, // Dependency for BASE_EXPENSES
    water, // Dependency for BASE_EXPENSES
    materialCost, // Dependency for BASE_EXPENSES
    overhead, // Dependency for BASE_EXPENSES
    swatchPrice, // Dependency for SERVICE_PRICING
    samplePrice, // Dependency for SERVICE_PRICING
    gradingPrice, // Dependency for SERVICE_PRICING
    e72StollCapacity,
    e35StollCapacity,
    e18SwgCapacity,
  ])

  // Destructure BASE_EXPENSES and SERVICE_PRICING from calculations
  const { BASE_EXPENSES, SERVICE_PRICING } = calculations

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
    setIsSaving(true)
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
      shifts,
      avgGarmentPrice,
      developmentMix,
      swatchesPerWeek,
      samplesPerWeek,
      gradingPerWeek,
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
      console.error("Error Saving Settings", errorMessage)
    } finally {
      setIsSaving(false)
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
            // Use nullish coalescing (??) to provide default if fetched value is null/undefined
            setTeamLabor(fetchedSettings.teamLabor ?? 50684)
            setRent(fetchedSettings.rent ?? 7000)
            setElectricity(fetchedSettings.electricity ?? 450)
            setWater(fetchedSettings.water ?? 431)
            setMaterialCost(fetchedSettings.materialCost ?? 2000)
            setOverhead(fetchedSettings.overhead ?? 4240)
            setWaterRate(fetchedSettings.waterRate ?? 1.69)
            setElectricityRate(fetchedSettings.electricityRate ?? 0.32)
            setLaborRate(fetchedSettings.laborRate ?? 30)
            setSwatchPrice(fetchedSettings.swatchPrice ?? 250)
            setSamplePrice(fetchedSettings.samplePrice ?? 2000)
            setGradingPrice(fetchedSettings.gradingPrice ?? 2500)
            setE72StollCapacity(fetchedSettings.e72StollCapacity ?? 16)
            setE35StollCapacity(fetchedSettings.e35StollCapacity ?? 10)
            setE18SwgCapacity(fetchedSettings.e18SwgCapacity ?? 16)
            setE72StollTime(fetchedSettings.e72StollTime ?? 3)
            setE35StollTime(fetchedSettings.e35StollTime ?? 1)
            setE18SwgTime(fetchedSettings.e18SwgTime ?? 1)
            setShifts(fetchedSettings.shifts ?? 1)
            setAvgGarmentPrice(fetchedSettings.avgGarmentPrice ?? 150)
            setDevelopmentMix(fetchedSettings.developmentMix ?? "worst")
            setSwatchesPerWeek(fetchedSettings.swatchesPerWeek ?? 14)
            setSamplesPerWeek(fetchedSettings.samplesPerWeek ?? 4)
            setGradingPerWeek(fetchedSettings.gradingPerWeek ?? 2)
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
    return null // Or a simple message, as the redirect will happen
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:px-8 mx-auto space-y-6">
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
                  <Select
                    value={shifts?.toString() ?? ""}
                    onValueChange={(value) => setShifts(value === "" ? null : Number.parseInt(value))}
                  >
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
                    value={avgGarmentPrice ?? ""}
                    onChange={(e) =>
                      setAvgGarmentPrice(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="swatches">Swatches/Week</Label>
                  <Input
                    id="swatches"
                    type="number"
                    value={swatchesPerWeek ?? ""}
                    onChange={(e) =>
                      setSwatchesPerWeek(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="samples">Samples/Week</Label>
                  <Input
                    id="samples"
                    type="number"
                    value={samplesPerWeek ?? ""}
                    onChange={(e) =>
                      setSamplesPerWeek(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grading">Grading/Week</Label>
                  <Input
                    id="grading"
                    type="number"
                    value={gradingPerWeek ?? ""}
                    onChange={(e) =>
                      setGradingPerWeek(e.target.value === "" ? null : Number.parseInt(e.target.value) || 0)
                    }
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
                      <SelectItem value="worst">With Development (Conservative)</SelectItem>
                      <SelectItem value="best">With Development (Optimistic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              {/* Add the quick save button here */}
              <div className="px-6 pb-4 flex justify-end">
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
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
                    {shifts} shift{shifts !== null && shifts > 1 ? "s" : ""}
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
                      {Math.ceil(calculations.annualExpenses / (avgGarmentPrice ?? 1)).toLocaleString()}
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
