
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Minus, TrendingUp } from 'lucide-react';
import type { Expense } from '@/lib/types';
import { useMemo } from 'react';
import { getMonth, getYear, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface MonthlyComparisonCardProps {
  expenses: Expense[];
}

export function MonthlyComparisonCard({ expenses }: MonthlyComparisonCardProps) {
  const { currentMonthTotal, previousMonthTotal, percentageChange } = useMemo(() => {
    const today = new Date();
    const currentMonthStart = startOfMonth(today);
    const currentMonthEnd = endOfMonth(today);

    const lastMonthDate = subMonths(today, 1);
    const previousMonthStart = startOfMonth(lastMonthDate);
    const previousMonthEnd = endOfMonth(lastMonthDate);

    const currentMonthTotal = expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= currentMonthStart && expenseDate <= currentMonthEnd;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const previousMonthTotal = expenses
      .filter(e => {
        const expenseDate = new Date(e.date);
        return expenseDate >= previousMonthStart && expenseDate <= previousMonthEnd;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    let percentageChange: number | null = null;
    if (previousMonthTotal > 0) {
      percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    } else if (currentMonthTotal > 0) {
      percentageChange = 100; // From 0 to something is a 100% increase
    }

    return { currentMonthTotal, previousMonthTotal, percentageChange };
  }, [expenses]);

  const isIncrease = percentageChange !== null && percentageChange > 0;
  const isDecrease = percentageChange !== null && percentageChange < 0;
  const isSame = percentageChange !== null && percentageChange === 0;

  const getIcon = () => {
    if (isIncrease) return <ArrowUp className="h-5 w-5 text-red-500" />;
    if (isDecrease) return <ArrowDown className="h-5 w-5 text-green-500" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const getChangeColor = () => {
    if (isIncrease) return 'text-red-500';
    if (isDecrease) return 'text-green-500';
    return 'text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
           <TrendingUp className="h-6 w-6" />
           Month-over-Month
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1 p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">This Month's Spending</p>
          <p className="text-3xl font-bold">₹{currentMonthTotal.toFixed(2)}</p>
        </div>
        <div className="flex flex-col gap-1 p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Last Month's Spending</p>
          <p className="text-3xl font-bold">₹{previousMonthTotal.toFixed(2)}</p>
        </div>
         <div className="flex flex-col gap-1 p-4 bg-secondary/50 rounded-lg">
           <p className="text-sm text-muted-foreground">Change from Last Month</p>
           <div className="flex items-center gap-2">
             {getIcon()}
             <p className={`text-3xl font-bold ${getChangeColor()}`}>
               {percentageChange !== null ? `${Math.abs(percentageChange).toFixed(1)}%` : 'N/A'}
             </p>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}

