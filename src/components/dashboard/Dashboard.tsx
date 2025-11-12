
"use client";

import type { Expense, OwedAmount, RecurringExpense, Budget, OwedToMe } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { TotalExpensesCard } from "./TotalExpensesCard";
import { OwedSummaryCard } from "./OwedSummaryCard";
import { CategoryChartCard } from "./CategoryChartCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddExpenseForm } from "./AddExpenseForm";
import { ExpenseList } from "./ExpenseList";
import { AddOwedForm } from "./AddOwedForm";
import { OwedList } from "./OwedList";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth, useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection, doc, query, where, Timestamp, serverTimestamp, orderBy, writeBatch } from "firebase/firestore";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { Loader, List } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { ExpenseFilters, type Filters } from "@/components/expenses/ExpenseFilters";
import { startOfMonth, endOfMonth, addDays, addWeeks, addMonths, addYears, format } from "date-fns";
import { RepaymentDetailsDialog } from "./RepaymentDetailsDialog";
import { AddRecurringExpenseForm } from "./AddRecurringExpenseForm";
import { RecurringExpenseList } from "./RecurringExpenseList";
import { AddBudgetForm } from "./AddBudgetForm";
import { BudgetList } from "./BudgetList";
import { BudgetSummaryCard } from "./BudgetSummaryCard";
import { OwedToMeSummaryCard } from "./OwedToMeSummaryCard";
import { AddOwedToMeForm } from "./AddOwedToMeForm";
import { OwedToMeList } from "./OwedToMeList";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function Dashboard() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const [activeTab, setActiveTab] = useState('expenses');
  const isMobile = useIsMobile();

  const [selectedRepayment, setSelectedRepayment] = useState<Expense | null>(null);
  const [isRepaymentDialogOpen, setIsRepaymentDialogOpen] = useState(false);

  // This state is for the dashboard view specifically.
  const [dashboardFilters, setDashboardFilters] = useState<Filters>({
    dateRange: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    },
    searchTerm: '',
  });

  const processRecurringExpenses = useCallback(async (recurringExpenses: RecurringExpense[]) => {
    if (!user || !firestore) return;
    const today = new Date();
    const batch = writeBatch(firestore);
    let expensesAdded = 0;
  
    for (const re of recurringExpenses) {
      const nextDueDate = new Date(re.nextDueDate);
      if (nextDueDate <= today) {
        // Log the new expense
        const newExpense: Omit<Expense, "id"> = {
          userId: user.uid,
          amount: re.amount,
          category: re.category,
          description: re.description,
          date: new Date().toISOString(),
        };
        const expenseRef = doc(collection(firestore, "users", user.uid, "expenses"));
        batch.set(expenseRef, newExpense);
        expensesAdded++;
  
        // Calculate the next due date
        let newNextDueDate;
        switch (re.frequency) {
          case 'daily': newNextDueDate = addDays(nextDueDate, 1); break;
          case 'weekly': newNextDueDate = addWeeks(nextDueDate, 1); break;
          case 'monthly': newNextDueDate = addMonths(nextDueDate, 1); break;
          case 'yearly': newNextDueDate = addYears(nextDueDate, 1); break;
        }
  
        // Update the recurring expense's next due date
        const recurringExpenseRef = doc(firestore, "users", user.uid, "recurringExpenses", re.id);
        batch.update(recurringExpenseRef, { nextDueDate: newNextDueDate.toISOString() });
      }
    }
  
    if (expensesAdded > 0) {
      await batch.commit();
      toast({
        title: "Recurring Expenses Logged",
        description: `${expensesAdded} expense(s) were automatically added to your log.`,
      });
    }
  }, [user, firestore, toast]);

  useEffect(() => {
    if (!user && !isUserLoading) {
      initiateAnonymousSignIn(auth);
    }
    
    if (user && user.isAnonymous && !user.displayName) {
      const userRef = doc(firestore, 'users', user.uid);
      setDocumentNonBlocking(userRef, {
        uid: user.uid,
        name: 'Anonymous User',
        email: 'anonymous@example.com',
        createdAt: serverTimestamp(),
      }, { merge: true });
    }

  }, [user, isUserLoading, auth, firestore]);

  
  const expensesQuery = useMemoFirebase(() => {
    if (!user) return null;
    
    const queryConstraints = [];

    const fromDate = dashboardFilters.dateRange.from ? dashboardFilters.dateRange.from : undefined;
    const toDate = dashboardFilters.dateRange.to ? dashboardFilters.dateRange.to : undefined;

    if (fromDate) {
        queryConstraints.push(where("date", ">=", fromDate.toISOString()));
    }
    if (toDate) {
        queryConstraints.push(where("date", "<=", toDate.toISOString()));
    }
    
    queryConstraints.push(orderBy('date', 'desc'));

    return query(
      collection(firestore, "users", user.uid, "expenses"),
      ...queryConstraints
    );
  }, [firestore, user, dashboardFilters.dateRange]);
  
  const { data: expensesFromQuery, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);

  const expensesForCurrentMonth = useMemo(() => {
      if (!expensesFromQuery) return [];
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      return expensesFromQuery.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= monthStart && expenseDate <= monthEnd;
      });
  }, [expensesFromQuery]);

  // Client-side search filtering
  const filteredExpenses = useMemo(() => {
    if (!expensesFromQuery) return [];
    if (!dashboardFilters.searchTerm) return expensesFromQuery;

    const lowercasedTerm = dashboardFilters.searchTerm.toLowerCase();
    return expensesFromQuery.filter(expense =>
      expense.description.toLowerCase().includes(lowercasedTerm)
    );
  }, [expensesFromQuery, dashboardFilters.searchTerm]);


  const owedAmountsQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, "users", user.uid, "owedAmounts")) : null
  , [firestore, user]);
  const { data: owedAmounts, isLoading: owedAmountsLoading } = useCollection<OwedAmount>(owedAmountsQuery);

  const recurringExpensesQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, 'users', user.uid, 'recurringExpenses'), orderBy('nextDueDate', 'asc')) : null
  , [firestore, user]);
  const { data: recurringExpenses, isLoading: recurringExpensesLoading } = useCollection<RecurringExpense>(recurringExpensesQuery);

  const budgetsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const currentMonth = format(new Date(), 'yyyy-MM');
    return query(
      collection(firestore, 'users', user.uid, 'budgets'),
      where('month', '==', currentMonth)
    );
  }, [firestore, user]);
  const { data: budgets, isLoading: budgetsLoading } = useCollection<Budget>(budgetsQuery);

  const owedToMeQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, "users", user.uid, "owedToMe")) : null
  , [firestore, user]);
  const { data: owedToMe, isLoading: owedToMeLoading } = useCollection<OwedToMe>(owedToMeQuery);

  useEffect(() => {
    if (recurringExpenses) {
      processRecurringExpenses(recurringExpenses);
    }
  }, [recurringExpenses, processRecurringExpenses]);

  const handleAddExpense = (expense: Omit<Expense, "id" | "date" | "userId">) => {
    if (!user) return;
    const newExpense: Omit<Expense, "id"> = {
      ...expense,
      userId: user.uid,
      date: new Date().toISOString(),
    };
    addDocumentNonBlocking(collection(firestore, "users", user.uid, "expenses"), newExpense);
    toast({
      title: "Expense Added",
      description: `${expense.category}: ₹${expense.amount.toFixed(2)}`,
    });
  };

  const handleDeleteExpense = (id: string) => {
    if (!user) return;
    deleteDocumentNonBlocking(doc(firestore, "users", user.uid, "expenses", id));
    toast({
      title: "Expense Removed",
      variant: "destructive",
    });
  };

  const handleAddOwed = (owed: Omit<OwedAmount, "id" | "date" | "paid" | "userId">) => {
    if (!user) return;
    const newOwed: Omit<OwedAmount, "id"> = {
      ...owed,
      userId: user.uid,
      paid: false,
      date: new Date().toISOString(),
    };
    addDocumentNonBlocking(collection(firestore, "users", user.uid, "owedAmounts"), newOwed);
    toast({
      title: "Owed Amount Added",
      description: `You owe ${owed.person} ₹${owed.amount.toFixed(2)}`,
    });
  };

  const handleDeleteOwed = (id: string) => {
    if(!user) return;
    deleteDocumentNonBlocking(doc(firestore, "users", user.uid, "owedAmounts", id));
    toast({
      title: "Owed Amount Removed",
      variant: "destructive",
    });
  };

  const handleMarkAsPaid = (id: string) => {
    if (!user || !owedAmounts) return;
    const paidAmount = owedAmounts.find((o) => o.id === id);
    if (paidAmount) {
      const newExpense: Omit<Expense, "id"> = {
        userId: user.uid,
        category: "Repayment",
        amount: paidAmount.amount,
        description: `Paid back ${paidAmount.person}`,
        date: new Date().toISOString(),
        repaymentDetails: {
          person: paidAmount.person,
          originalDescription: paidAmount.description,
        },
      };
      addDocumentNonBlocking(collection(firestore, "users", user.uid, "expenses"), newExpense);
      deleteDocumentNonBlocking(doc(firestore, "users", user.uid, "owedAmounts", id));
      toast({
        title: "Payment Marked as Paid",
        description: `An expense of ₹${paidAmount.amount.toFixed(2)} has been logged.`,
      });
    }
  };

  const handleAddRecurringExpense = (recExpense: Omit<RecurringExpense, "id" | "userId" | "nextDueDate">) => {
    if (!user) return;
    const newRecExpense = {
      ...recExpense,
      userId: user.uid,
      nextDueDate: recExpense.startDate,
    };
    addDocumentNonBlocking(collection(firestore, "users", user.uid, "recurringExpenses"), newRecExpense);
    toast({
      title: "Recurring Expense Added",
      description: `${recExpense.description} will be logged ${recExpense.frequency}.`,
    });
  };

  const handleDeleteRecurringExpense = (id: string) => {
    if (!user) return;
    deleteDocumentNonBlocking(doc(firestore, "users", user.uid, "recurringExpenses", id));
    toast({
      title: "Recurring Expense Removed",
      variant: "destructive",
    });
  };

  const handleAddBudget = (budget: Omit<Budget, 'id' | 'userId'>) => {
    if (!user) return;
    const newBudget = { ...budget, userId: user.uid };
    addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'budgets'), newBudget);
    toast({
      title: 'Budget Set!',
      description: `Your new budget for ${budget.category || 'Overall'} has been set to ₹${budget.amount}.`,
    });
  };

  const handleDeleteBudget = (id: string) => {
    if (!user) return;
    deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'budgets', id));
    toast({
      title: 'Budget Removed',
      variant: 'destructive',
    });
  };

  const handleAddOwedToMe = (item: Omit<OwedToMe, "id" | "date" | "received" | "userId">) => {
    if (!user) return;
    const newItem: Omit<OwedToMe, "id"> = {
      ...item,
      userId: user.uid,
      received: false,
      date: new Date().toISOString(),
    };
    addDocumentNonBlocking(collection(firestore, "users", user.uid, "owedToMe"), newItem);
    toast({
      title: "Amount Owed to You Added",
      description: `${item.person} owes you ₹${item.amount.toFixed(2)}`,
    });
  };

  const handleDeleteOwedToMe = (id: string) => {
    if(!user) return;
    deleteDocumentNonBlocking(doc(firestore, "users", user.uid, "owedToMe", id));
    toast({
      title: "Owed Amount Removed",
      variant: "destructive",
    });
  };

  const handleMarkAsReceived = (id: string) => {
    if(!user) return;
    deleteDocumentNonBlocking(doc(firestore, "users", user.uid, "owedToMe", id));
    toast({
      title: "Marked as Received",
      description: `The amount has been cleared.`,
    });
  };

  const handleExpenseClick = (expense: Expense) => {
    if (expense.category === 'Repayment') {
      setSelectedRepayment(expense);
      setIsRepaymentDialogOpen(true);
    }
  };
  
  const isLoading = isUserLoading || expensesLoading || owedAmountsLoading || recurringExpensesLoading || budgetsLoading || owedToMeLoading;

  if (isLoading && !expensesFromQuery) { // Show loader only on initial load
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const overallBudget = budgets?.find(b => b.category === null);

  const TabSelector = () => {
    if (isMobile) {
      return (
        <div className="px-1">
            <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="bg-primary text-primary-foreground focus:ring-primary">
                    <SelectValue placeholder="Select a view" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="expenses">Expenses</SelectItem>
                    <SelectItem value="owed">Owed by You</SelectItem>
                    <SelectItem value="owedToMe">Owed to You</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                    <SelectItem value="budgets">Budgets</SelectItem>
                </SelectContent>
            </Select>
        </div>
      );
    }
    return (
        <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="owed">Owed by You</TabsTrigger>
            <TabsTrigger value="owedToMe">Owed to You</TabsTrigger>
            <TabsTrigger value="recurring">Recurring</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <TotalExpensesCard expenses={expensesForCurrentMonth || []} />
        <OwedSummaryCard owedAmounts={owedAmounts || []} />
        <OwedToMeSummaryCard owedToMeAmounts={owedToMe || []} />
        <BudgetSummaryCard budget={overallBudget} expenses={expensesForCurrentMonth || []} />
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
             <Tabs defaultValue="expenses" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
                <TabSelector />
                 <TabsContent value="expenses" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Log a New Expense</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AddExpenseForm onSubmit={handleAddExpense} />
                    </CardContent>
                  </Card>
                   <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Filters</CardTitle>
                       <Link href="/all-expenses">
                          <Button variant="outline" size="sm">
                            <List className="mr-2 h-4 w-4" />
                            View All
                          </Button>
                      </Link>
                    </CardHeader>
                    <CardContent>
                      <ExpenseFilters
                        onFilterChange={setDashboardFilters}
                        isLoading={isLoading}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Filtered Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {expensesLoading ? (
                         <div className="flex items-center justify-center h-40">
                           <List className="h-8 w-8 animate-spin text-primary" />
                         </div>
                      ) : (
                        <ExpenseList expenses={filteredExpenses || []} onDelete={handleDeleteExpense} onRowClick={handleExpenseClick} />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                 <TabsContent value="owed" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Track an Amount You Owe</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AddOwedForm onSubmit={handleAddOwed} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Currently Owed to Others</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <OwedList
                        owedAmounts={owedAmounts || []}
                        onDelete={handleDeleteOwed}
                        onMarkAsPaid={handleMarkAsPaid}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="owedToMe" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Track an Amount Owed to You</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AddOwedToMeForm onSubmit={handleAddOwedToMe} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Currently Owed to You</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <OwedToMeList
                        owedToMeAmounts={owedToMe || []}
                        onDelete={handleDeleteOwedToMe}
                        onMarkAsReceived={handleMarkAsReceived}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                 <TabsContent value="recurring" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Add a Recurring Expense</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AddRecurringExpenseForm onSubmit={handleAddRecurringExpense} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Recurring Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {recurringExpensesLoading ? (
                         <div className="flex items-center justify-center h-40">
                           <List className="h-8 w-8 animate-spin text-primary" />
                         </div>
                      ) : (
                        <RecurringExpenseList 
                          recurringExpenses={recurringExpenses || []} 
                          onDelete={handleDeleteRecurringExpense} 
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="budgets" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Set a New Budget</CardTitle>
                      <p className="text-sm text-muted-foreground pt-1">Set budgets for the current month: {format(new Date(), 'MMMM yyyy')}</p>
                    </CardHeader>
                    <CardContent>
                      <AddBudgetForm onSubmit={handleAddBudget} existingBudgets={budgets || []} />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>This Month's Budgets</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {budgetsLoading || expensesLoading ? (
                         <div className="flex items-center justify-center h-40">
                           <List className="h-8 w-8 animate-spin text-primary" />
                         </div>
                      ) : (
                        <BudgetList
                          budgets={budgets || []}
                          expenses={expensesForCurrentMonth || []}
                          onDelete={handleDeleteBudget}
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
        </div>
        <div className="lg:col-span-2">
            <CategoryChartCard expenses={expensesForCurrentMonth || []} />
        </div>
      </div>
       <RepaymentDetailsDialog
        expense={selectedRepayment}
        open={isRepaymentDialogOpen}
        onOpenChange={setIsRepaymentDialogOpen}
      />
    </div>
  );
}
