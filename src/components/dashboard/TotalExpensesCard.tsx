
"use client";

import type { Expense } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee } from "lucide-react";

interface TotalExpensesCardProps {
  expenses: Expense[];
}

export function TotalExpensesCard({ expenses }: TotalExpensesCardProps) {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-medium">Total Expenses</CardTitle>
        <IndianRupee className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-medium">₹{total.toFixed(2)}</div>
        <p className="text-xs text-muted-foreground">{expenses.length} transactions this month</p>
      </CardContent>
    </Card>
  );
}
