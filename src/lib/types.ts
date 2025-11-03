export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  userId: string;
  repaymentDetails?: {
    person: string;
    originalDescription: string;
  };
}

export interface OwedAmount {
  id:string;
  person: string;
  amount: number;
  description: string;
  date: string;
  paid: boolean;
  userId: string;
}

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringExpense {
  id: string;
  category: string;
  amount: number;
  description: string;
  frequency: Frequency;
  startDate: string;
  nextDueDate: string;
  userId: string;
}

    