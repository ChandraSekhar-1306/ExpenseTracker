
"use client";

import type { Budget, Expense } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

interface BudgetSummaryCardProps {
  budget: Budget | undefined;
  expenses: Expense[];
}

export function BudgetSummaryCard({ budget, expenses }: BudgetSummaryCardProps) {
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const getProgressColor = (value: number) => {
    if (value > 100) return "bg-destructive";
    if (value > 75) return "bg-yellow-500";
    return "bg-primary";
  }

  if (!budget) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Budget</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Not Set</div>
          <p className="text-xs text-muted-foreground">
            Set an overall budget in the Budgets tab.
          </p>
        </CardContent>
      </Card>
    );
  }

  const progress = (totalSpent / budget.amount) * 100;
  const remaining = budget.amount - totalSpent;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Overall Budget</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
            ₹{remaining.toFixed(2)}
            <span className="text-sm font-medium text-muted-foreground"> / ₹{budget.amount.toFixed(2)} left</span>
        </div>
        <Progress value={progress} className="mt-2 h-2" indicatorClassName={getProgressColor(progress)} />
      </CardContent>
    </Card>
  );
}
