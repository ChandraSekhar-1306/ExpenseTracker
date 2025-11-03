
'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { startOfMonth, endOfMonth, getYear, getMonth, differenceInDays } from 'date-fns';
import type { Expense } from '@/lib/types';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthPicker } from '@/components/expenses/MonthPicker';
import { TotalExpensesCard } from '@/components/dashboard/TotalExpensesCard';
import { CategoryChartCard } from '@/components/dashboard/CategoryChartCard';
import { ExpenseList } from '@/components/dashboard/ExpenseList';
import { useToast } from '@/hooks/use-toast';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { HighestExpenseCard } from '@/components/dashboard/HighestExpenseCard';
import { TopCategoryCard } from '@/components/dashboard/TopCategoryCard';
import { AverageDailySpendCard } from '@/components/dashboard/AverageDailySpendCard';
import { RepaymentDetailsDialog } from '@/components/dashboard/RepaymentDetailsDialog';

export default function MonthlyReportPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<{ month: number; year: number }>({
    month: getMonth(new Date()),
    year: getYear(new Date()),
  });

  const [selectedRepayment, setSelectedRepayment] = useState<Expense | null>(null);
  const [isRepaymentDialogOpen, setIsRepaymentDialogOpen] = useState(false);

  const monthlyExpensesQuery = useMemoFirebase(() => {
    if (!user) return null;

    const date = new Date(selectedDate.year, selectedDate.month);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    return query(
      collection(firestore, 'users', user.uid, 'expenses'),
      where('date', '>=', monthStart.toISOString()),
      where('date', '<=', monthEnd.toISOString())
    );
  }, [firestore, user, selectedDate]);

  const { data: expenses, isLoading: expensesLoading } = useCollection<Expense>(monthlyExpensesQuery);

  const handleDeleteExpense = (id: string) => {
    if (!user) return;
    deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'expenses', id));
    toast({
      title: 'Expense Removed',
      variant: 'destructive',
    });
  };

  const handleExpenseClick = (expense: Expense) => {
    if (expense.category === 'Repayment') {
      setSelectedRepayment(expense);
      setIsRepaymentDialogOpen(true);
    }
  };
  
  const isLoading = isUserLoading || expensesLoading;

  const monthName = new Date(selectedDate.year, selectedDate.month).toLocaleString('default', { month: 'long' });
  const year = selectedDate.year;

  const reportMetrics = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return {
        highestExpense: null,
        topCategory: null,
        averageDailySpend: 0,
      };
    }

    // Highest Expense
    const highestExpense = expenses.reduce((max, exp) => exp.amount > max.amount ? exp : max, expenses[0]);

    // Top Category
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });
    
    let topCategory = { name: 'N/A', amount: 0 };
    if (Object.keys(categoryTotals).length > 0) {
      topCategory = Object.entries(categoryTotals).reduce((top, current) => 
        current[1] > top.amount ? { name: current[0], amount: current[1] } : top, 
        { name: Object.keys(categoryTotals)[0], amount: Object.values(categoryTotals)[0] }
      );
    }
    

    // Average Daily Spend
    const date = new Date(selectedDate.year, selectedDate.month);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
    const totalSpend = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const averageDailySpend = totalSpend / daysInMonth;


    return {
      highestExpense,
      topCategory,
      averageDailySpend,
    };
  }, [expenses, selectedDate]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/50">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="space-y-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Monthly Expense Report</h1>
              <p className="text-muted-foreground mt-1">
                Review your spending habits for any given month.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>
                  {isLoading ? <Skeleton className="h-8 w-48" /> : `Report for ${monthName} ${year}`}
                </CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">Select a month and year to generate a report.</p>
              </div>
              <MonthPicker onDateChange={setSelectedDate} />
            </CardHeader>
          </Card>
          
          {isLoading ? (
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-40 rounded-lg" />
                    <Skeleton className="h-40 rounded-lg" />
                    <Skeleton className="h-40 rounded-lg" />
                    <Skeleton className="h-40 rounded-lg" />
                </div>
                <div className="grid gap-6 md:grid-cols-5">
                    <Skeleton className="h-96 rounded-lg md:col-span-3" />
                    <Skeleton className="h-96 rounded-lg md:col-span-2" />
                </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <TotalExpensesCard expenses={expenses || []} />
                <HighestExpenseCard expense={reportMetrics.highestExpense} />
                <TopCategoryCard category={reportMetrics.topCategory} />
                <AverageDailySpendCard amount={reportMetrics.averageDailySpend} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                        <CardTitle>Transactions for {monthName} {year}</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <ExpenseList expenses={expenses || []} onDelete={handleDeleteExpense} onRowClick={handleExpenseClick} />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                 <CategoryChartCard expenses={expenses || []} />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
      <RepaymentDetailsDialog
        expense={selectedRepayment}
        open={isRepaymentDialogOpen}
        onOpenChange={setIsRepaymentDialogOpen}
      />
    </div>
  );
}
