
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface AverageDailySpendCardProps {
  amount: number;
}

export function AverageDailySpendCard({ amount }: AverageDailySpendCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Average Daily Spend</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-medium">₹{amount.toFixed(2)}</div>
        <p className="text-xs text-muted-foreground">
            average spent per day this month
        </p>
      </CardContent>
    </Card>
  );
}
