
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Tag } from "lucide-react";
import { Badge } from "../ui/badge";

interface TopCategoryCardProps {
  category: { name: string; amount: number } | null;
}

export function TopCategoryCard({ category }: TopCategoryCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Top Spending Category</CardTitle>
        <PieChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        {category && category.amount > 0 ? (
          <div>
            <Badge variant="default" className="text-base rounded-md">
                {category.name}
            </Badge>
            <div className="text-2xl font-medium mt-2">₹{category.amount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              spent in this category
            </p>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
             <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No spending yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
