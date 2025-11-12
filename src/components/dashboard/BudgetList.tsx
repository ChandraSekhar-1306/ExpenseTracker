"use client";

import type { Budget, Expense } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface BudgetListProps {
  budgets: Budget[];
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export function BudgetList({ budgets, expenses, onDelete }: BudgetListProps) {

  if (budgets.length === 0) {
    return <p className="text-muted-foreground text-center">No budgets set for this month. Add one above to start tracking!</p>;
  }

  const getSpentAmount = (category: string | null) => {
    if (category === null) { // Overall budget
      return expenses.reduce((acc, exp) => acc + exp.amount, 0);
    }
    return expenses
      .filter(exp => exp.category === category)
      .reduce((acc, exp) => acc + exp.amount, 0);
  };
  
  const getProgressColor = (value: number) => {
    if (value > 100) return "bg-destructive";
    if (value > 75) return "bg-yellow-500";
    return "bg-primary";
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead className="w-[40%]">Progress</TableHead>
            <TableHead className="text-right">Remaining</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgets.map((budget) => {
            const spent = getSpentAmount(budget.category);
            const remaining = budget.amount - spent;
            const progress = (spent / budget.amount) * 100;

            return (
              <TableRow key={budget.id}>
                <TableCell className="font-medium">{budget.category || "Overall Budget"}</TableCell>
                <TableCell>
                   <Progress value={progress} indicatorClassName={getProgressColor(progress)} />
                   <div className="text-xs text-muted-foreground mt-1">
                     ₹{spent.toFixed(2)} of ₹{budget.amount.toFixed(2)}
                   </div>
                </TableCell>
                <TableCell className={`text-right font-medium ${remaining < 0 ? 'text-destructive' : 'text-green-600'}`}>
                    ₹{remaining.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(budget.id)}
                    aria-label="Delete budget"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
