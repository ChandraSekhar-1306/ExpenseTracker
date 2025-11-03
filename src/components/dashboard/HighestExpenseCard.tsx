
"use client";

import type { Expense } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, ShoppingCart } from "lucide-react";
import { Badge } from "../ui/badge";
import { format } from "date-fns";

interface HighestExpenseCardProps {
  expense: Expense | null;
}

export function HighestExpenseCard({ expense }: HighestExpenseCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Highest Single Expense</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        {expense ? (
          <div>
            <div className="text-2xl font-medium">₹{expense.amount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground truncate" title={expense.description}>
              {expense.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
               <Badge variant="secondary">{expense.category}</Badge>
               <span className="text-xs text-muted-foreground">{format(new Date(expense.date), 'dd/MM/yyyy')}</span>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
             <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No expenses logged.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
