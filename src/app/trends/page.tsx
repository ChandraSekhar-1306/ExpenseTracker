
'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Expense } from '@/lib/types';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, Loader } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SpendingTrendChart } from '@/components/trends/SpendingTrendChart';
import { MonthlyComparisonCard } from '@/components/trends/MonthlyComparisonCard';

export default function TrendsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const allExpensesQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'users', user.uid, 'expenses'), orderBy('date', 'desc'));
  }, [firestore, user]);

  const { data: allExpenses, isLoading: expensesLoading } = useCollection<Expense>(allExpensesQuery);
  
  const isLoading = isUserLoading || expensesLoading;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/50">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="space-y-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Trends & Insights</h1>
              <p className="text-muted-foreground mt-1">
                Analyze your spending habits over time.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/monthly-report">
                  View Monthly Report
                </Link>
              </Button>
              <Button asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <Skeleton className="h-40 rounded-lg" />
                <Skeleton className="h-40 rounded-lg" />
                <Skeleton className="h-40 rounded-lg" />
              </div>
              <Skeleton className="h-96 rounded-lg" />
            </div>
          ) : allExpenses && allExpenses.length > 0 ? (
            <div className="space-y-6">
               <MonthlyComparisonCard expenses={allExpenses} />
               <SpendingTrendChart expenses={allExpenses} />
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center text-center h-[50vh] bg-card rounded-lg border border-dashed">
                <h2 className="text-xl font-semibold">No Expense Data Found</h2>
                <p className="mt-2 text-muted-foreground">
                  Start adding expenses on the dashboard to see your financial trends here.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/">Go to Dashboard</Link>
                </Button>
              </div>
          )}

        </div>
      </main>
    </div>
  );
}
