"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface CashFlowProjectionProps {
  monthlyRevenue: number
  monthlyExpenses: number
  seasonalityFactor?: number[]
}

export function CashFlowProjection({
  monthlyRevenue,
  monthlyExpenses,
  seasonalityFactor = [0.8, 0.9, 1.1, 1.2, 1.3, 1.1, 0.9, 0.8, 1.0, 1.2, 1.4, 1.2],
}: CashFlowProjectionProps) {
  const cashFlowData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    let cumulativeCash = 0

    return months.map((month, index) => {
      const seasonalRevenue = monthlyRevenue * seasonalityFactor[index]
      const monthlyProfit = seasonalRevenue - monthlyExpenses
      cumulativeCash += monthlyProfit

      return {
        month,
        revenue: seasonalRevenue,
        expenses: monthlyExpenses,
        profit: monthlyProfit,
        cumulativeCash,
      }
    })
  }, [monthlyRevenue, monthlyExpenses, seasonalityFactor])

  const totalAnnualRevenue = cashFlowData.reduce((sum, month) => sum + month.revenue, 0)
  const totalAnnualExpenses = cashFlowData.reduce((sum, month) => sum + month.expenses, 0)
  const finalCashPosition = cashFlowData[cashFlowData.length - 1].cumulativeCash

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Annual Revenue (Seasonal)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalAnnualRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Annual Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalAnnualExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Year-End Cash Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${finalCashPosition >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${finalCashPosition.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Cash Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
              <Line type="monotone" dataKey="cumulativeCash" stroke="#3b82f6" strokeWidth={3} name="Cumulative Cash" />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Monthly Profit" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, ""]} />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
