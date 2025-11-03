
"use client";

import type { OwedAmount } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface OwedSummaryCardProps {
  owedAmounts: OwedAmount[];
}

export function OwedSummaryCard({ owedAmounts }: OwedSummaryCardProps) {
  const unpaidAmounts = owedAmounts.filter(item => !item.paid);
  const total = unpaidAmounts.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-medium">Total Owed to Others</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">₹{total.toFixed(2)}</div>
        <p className="text-xs text-muted-foreground">{unpaidAmounts.length} pending payments</p>
      </CardContent>
    </Card>
  );
}
