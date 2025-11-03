
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Expense } from "@/lib/types";
import { format } from "date-fns";

interface RepaymentDetailsDialogProps {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RepaymentDetailsDialog({ expense, open, onOpenChange }: RepaymentDetailsDialogProps) {
  if (!expense || expense.category !== 'Repayment' || !expense.repaymentDetails) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Repayment Details</DialogTitle>
          <DialogDescription>
            This expense was logged automatically after you marked an owed amount as paid.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Paid To</span>
            <p className="font-semibold">{expense.repaymentDetails.person}</p>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Original Reason</span>
            <p className="font-semibold">{expense.repaymentDetails.originalDescription}</p>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Amount</span>
            <p className="font-semibold">₹{expense.amount.toFixed(2)}</p>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Date Paid</span>
            <p className="font-semibold">{format(new Date(expense.date), 'dd/MM/yyyy p')}</p>
          </div>
           <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Category</span>
             <div><Badge variant="default">{expense.category}</Badge></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
