"use client";

import type { OwedToMe } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark } from "lucide-react";

interface OwedToMeSummaryCardProps {
  owedToMeAmounts: OwedToMe[];
}

export function OwedToMeSummaryCard({ owedToMeAmounts }: OwedToMeSummaryCardProps) {
  const unreceivedAmounts = owedToMeAmounts.filter(item => !item.received);
  const total = unreceivedAmounts.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Owed To You</CardTitle>
        <Landmark className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600">₹{total.toFixed(2)}</div>
        <p className="text-xs text-muted-foreground">{unreceivedAmounts.length} pending payments from others</p>
      </CardContent>
    </Card>
  );
}
