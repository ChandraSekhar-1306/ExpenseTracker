
"use client";

import type { OwedToMe } from "@/lib/types";
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

interface OwedToMeListProps {
  owedToMeAmounts: OwedToMe[];
  onDelete: (id: string) => void;
  onMarkAsReceived: (id: string) => void;
}

export function OwedToMeList({ owedToMeAmounts, onDelete, onMarkAsReceived }: OwedToMeListProps) {
  const unreceivedAmounts = owedToMeAmounts.filter(item => !item.received);

  if (unreceivedAmounts.length === 0) {
    return <p className="text-muted-foreground text-center">Nobody owes you anything. All settled up!</p>;
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Person</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-center w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {unreceivedAmounts.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.person}</TableCell>
              <TableCell className="max-w-[150px] sm:max-w-xs truncate whitespace-normal">{item.description}</TableCell>
              <TableCell className="text-right font-medium">₹{item.amount.toFixed(2)}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMarkAsReceived(item.id)}
                    aria-label="Mark as received"
                    className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Received
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
