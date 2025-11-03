
"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import type { Expense } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "../ui/badge";
import { format } from "date-fns";

interface CategoryChartCardProps {
  expenses: Expense[];
}

const chartConfig = {
  total: {
    label: "Total",
  },
};

export function CategoryChartCard({ expenses }: CategoryChartCardProps) {
  const [otherExpenses, setOtherExpenses] = React.useState<Expense[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const { chartData, totalExpenses } = React.useMemo(() => {
    const categoryMap: Record<string, { total: number; items: Expense[] }> = {};
    let totalExpenses = 0;

    expenses.forEach((expense) => {
      const category = expense.category || "Uncategorized";
      if (!categoryMap[category]) {
        categoryMap[category] = { total: 0, items: [] };
      }
      categoryMap[category].total += expense.amount;
      categoryMap[category].items.push(expense);
      totalExpenses += expense.amount;
    });

    if (totalExpenses === 0) {
      return { chartData: [], totalExpenses: 0 };
    }

    const threshold = totalExpenses * 0.05;
    const mainCategories: { name: string; total: number }[] = [];
    const otherCategoryItems: Expense[] = [];
    let otherTotal = 0;

    Object.entries(categoryMap).forEach(([name, data]) => {
      if (data.total < threshold && name !== 'Repayment') { // Keep Repayment as a main category
        otherTotal += data.total;
        otherCategoryItems.push(...data.items);
      } else {
        mainCategories.push({ name, total: data.total });
      }
    });

    const sortedMain = mainCategories.sort((a, b) => b.total - a.total);
    
    if (otherTotal > 0) {
      sortedMain.push({ name: "Other", total: otherTotal });
    }

    setOtherExpenses(otherCategoryItems);

    return { chartData: sortedMain, totalExpenses };
  }, [expenses]);

  const handleBarClick = (data: any) => {
    if (data.name === "Other" && otherExpenses.length > 0) {
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Expense by Category</CardTitle>
          <CardDescription>
            Spending distribution for the current month
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2 pr-4 sm:pl-0">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={60}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    interval={0}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) =>
                          name === "Other"
                            ? [`₹${Number(value).toFixed(2)}`, "Other (Click to view)"]
                            : `₹${Number(value).toFixed(2)}`
                        }
                      />
                    }
                  />
                  <Bar dataKey="total" radius={4} onClick={handleBarClick}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(var(--chart-${(index % 8) + 1}))`}
                        className={entry.name === "Other" ? "cursor-pointer" : ""}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
              No expense data for this month.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Details for "Other" Category</DialogTitle>
            <DialogDescription>
              This includes all expense categories that are individually less
              than 5% of the total monthly expenses.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherExpenses.length > 0 ? (
                  otherExpenses
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((expense) => (
                      <TableRow 
                        key={expense.id}
                      >
                        <TableCell>
                          {format(new Date(expense.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={expense.category === 'Repayment' ? 'default' : 'secondary'}>{expense.category}</Badge>
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{expense.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No expenses found in this category.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
