"use client";

import type { RecurringExpense } from "@/lib/types";
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

interface RecurringExpenseListProps {
  recurringExpenses: RecurringExpense[];
  onDelete: (id: string) => void;
}

export function RecurringExpenseList({ recurringExpenses, onDelete }: RecurringExpenseListProps) {

  if (recurringExpenses.length === 0) {
    return <p className="text-muted-foreground text-center">No recurring expenses set up yet.</p>;
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Next Due</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recurringExpenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium max-w-[200px] truncate">{expense.description}</TableCell>
              <TableCell>
                <Badge variant='secondary'>
                  {expense.category}
                </Badge>
              </TableCell>
              <TableCell className="capitalize">{expense.frequency}</TableCell>
              <TableCell>{format(new Date(expense.nextDueDate), 'dd/MM/yyyy')}</TableCell>
              <TableCell className="text-right font-medium">₹{expense.amount.toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(expense.id)}
                  aria-label="Delete recurring expense"
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

    