
'use client';

import { Expense } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpenseList } from '@/components/dashboard/ExpenseList';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { List, Home } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { ExpenseFilters, type Filters } from '@/components/expenses/ExpenseFilters';
import { format } from 'date-fns';


export default function AllExpensesPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [filters, setFilters] = useState<Filters>({
    dateRange: { from: undefined, to: undefined },
    searchTerm: '',
  });

  const allExpensesQuery = useMemoFirebase(() => {
    if (!user) return null;

    const queryConstraints = [];

    // Date range filter
    if (filters.dateRange.from) {
      const fromDate = new Date(filters.dateRange.from);
      fromDate.setHours(0,0,0,0);
      queryConstraints.push(where('date', '>=', fromDate.toISOString()));
    }
    if (filters.dateRange.to) {
      const toDate = new Date(filters.dateRange.to);
      toDate.setHours(23, 59, 59, 999); // Include the whole end day
      queryConstraints.push(where('date', '<=', toDate.toISOString()));
    }
    
    // Search term filter - Firestore does not support text search on parts of a string.
    // This will be handled client-side.
    
    queryConstraints.push(orderBy('date', 'desc'));

    const finalQuery = query(collection(firestore, 'users', user.uid, 'expenses'), ...queryConstraints);
    return finalQuery;
  }, [firestore, user, filters.dateRange]);

  const { data: allExpenses, isLoading: expensesLoading } = useCollection<Expense>(allExpensesQuery);
  
  const filteredExpenses = useMemo(() => {
    if (!allExpenses) return [];
    if (!filters.searchTerm) return allExpenses;

    const lowercasedTerm = filters.searchTerm.toLowerCase();
    return allExpenses.filter(expense =>
      expense.description.toLowerCase().includes(lowercasedTerm)
    );
  }, [allExpenses, filters.searchTerm]);


  const handleDeleteExpense = (id: string) => {
    if (!user) return;
    deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'expenses', id));
    toast({
      title: 'Expense Removed',
      variant: 'destructive',
    });
  };

  const isLoading = isUserLoading || expensesLoading;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/50">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">All Expenses</h1>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseFilters 
                onFilterChange={setFilters}
                isLoading={isLoading}
                defaultToAllTime={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Expense History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                 <div className="flex items-center justify-center h-40">
                   <List className="h-8 w-8 animate-spin text-primary" />
                 </div>
              ) : (
                <ExpenseList expenses={filteredExpenses || []} onDelete={handleDeleteExpense} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
