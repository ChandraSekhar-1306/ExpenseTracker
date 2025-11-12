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

export interface OwedToMe {
  id:string;
  person: string;
  amount: number;
  description: string;
  date: string;
  received: boolean;
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

export interface Budget {
  id: string;
  category: string | null; // null for overall budget
  amount: number;
  month: string; // e.g., "2024-07"
  userId: string;
}
    
