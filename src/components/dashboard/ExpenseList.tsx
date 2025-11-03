
"use client";

import { useState } from "react";
import type { Expense } from "@/lib/types";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";


interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onRowClick?: (expense: Expense) => void;
}

export function ExpenseList({ expenses, onDelete, onRowClick }: ExpenseListProps) {

  if (expenses.length === 0) {
    return <p className="text-muted-foreground text-center">No expenses logged yet. Add one above!</p>;
  }

  const handleRowClick = (expense: Expense) => {
    if (onRowClick && expense.category === 'Repayment') {
      onRowClick(expense);
    }
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow 
              key={expense.id}
              onClick={() => handleRowClick(expense)}
              className={cn(
                expense.category === 'Repayment' && 'cursor-pointer hover:bg-muted/50'
              )}
            >
              <TableCell>{format(new Date(expense.date), 'dd/MM/yyyy')}</TableCell>
              <TableCell>
                <Badge variant={expense.category === 'Repayment' ? 'default' : 'secondary'}>
                  {expense.category}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate">{expense.description}</TableCell>
              <TableCell className="text-right font-medium">₹{expense.amount.toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click from firing
                    onDelete(expense.id)
                  }}
                  aria-label="Delete expense"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
