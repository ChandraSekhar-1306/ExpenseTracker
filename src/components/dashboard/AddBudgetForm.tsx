
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { format } from "date-fns";
import type { Budget } from "@/lib/types";

const formSchema = z.object({
  category: z.string().optional(),
  amount: z.coerce.number().positive("Budget amount must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddBudgetFormProps {
  onSubmit: (data: Omit<Budget, "id" | "userId">) => void;
  existingBudgets: Budget[];
}

export function AddBudgetForm({ onSubmit, existingBudgets }: AddBudgetFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      amount: 0,
    },
  });
  
  const getCategoryPlaceholder = () => {
    const hasOverallBudget = existingBudgets.some(b => b.category === null);
    if (hasOverallBudget) {
      return "e.g., Groceries (Overall budget set)";
    }
    return "e.g., Groceries (or leave blank for Overall)";
  };

  const handleSubmit = (data: FormValues) => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    onSubmit({
      category: data.category === "" ? null : data.category,
      amount: data.amount,
      month: currentMonth,
    });
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder={getCategoryPlaceholder()} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                    <Input type="number" step="0.01" placeholder="e.g., 500.00" className="pl-7" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Set Budget
        </Button>
      </form>
    </Form>
  );
}
