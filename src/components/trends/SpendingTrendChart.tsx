
'use client';

import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { Expense } from '@/lib/types';
import { useMemo } from 'react';
import { format, subMonths, getMonth, getYear, startOfMonth } from 'date-fns';

interface SpendingTrendChartProps {
  expenses: Expense[];
}

const chartConfig = {
  total: {
    label: 'Total Spending',
    color: 'hsl(var(--primary))',
  },
};

export function SpendingTrendChart({ expenses }: SpendingTrendChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const months = Array.from({ length: 12 }, (_, i) => subMonths(today, i)).reverse();

    const data = months.map(monthDate => {
      const year = getYear(monthDate);
      const month = getMonth(monthDate);
      const monthLabel = format(monthDate, 'MMM yy');

      const total = expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return getYear(expenseDate) === year && getMonth(expenseDate) === month;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

      return { month: monthLabel, total: total };
    });

    return data;
  }, [expenses]);

  const totalSpending = useMemo(() => {
    return chartData.reduce((acc, item) => acc + item.total, 0);
  }, [chartData]);
  
  const averageSpending = totalSpending / chartData.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>12-Month Spending Trend</CardTitle>
        <CardDescription>
          An overview of your spending habits over the last year.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `₹${Number(value) / 1000}k`}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent 
                indicator="dot"
                formatter={(value) => `₹${Number(value).toFixed(2)}`}
              />}
            />
            <Area
              dataKey="total"
              type="natural"
              fill="url(#colorTotal)"
              stroke="var(--color-total)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Your average monthly spending over the past year was approximately ₹{averageSpending.toFixed(2)}.
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Keep tracking to see how your habits change over time.
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

