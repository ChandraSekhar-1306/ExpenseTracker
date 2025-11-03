"use client";

import type { OwedAmount } from "@/lib/types";
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
import { Trash2, CheckCircle } from "lucide-react";

interface OwedListProps {
  owedAmounts: OwedAmount[];
  onDelete: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
}

export function OwedList({ owedAmounts, onDelete, onMarkAsPaid }: OwedListProps) {
  const unpaidAmounts = owedAmounts.filter(item => !item.paid);

  if (unpaidAmounts.length === 0) {
    return <p className="text-muted-foreground text-center">You don't owe anyone anything. Great job!</p>;
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Person</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {unpaidAmounts.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
              <TableCell className="font-medium">{item.person}</TableCell>
              <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
              <TableCell className="text-right font-medium">₹{item.amount.toFixed(2)}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMarkAsPaid(item.id)}
                    aria-label="Mark as paid"
                  >
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    Paid
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(item.id)}
                    aria-label="Delete owed amount"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
