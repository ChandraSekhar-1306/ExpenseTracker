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
import { Textarea } from "@/components/ui/textarea";
import { UserPlus } from "lucide-react";

const formSchema = z.object({
  person: z.string().min(1, "Person's name is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddOwedToMeFormProps {
  onSubmit: (data: FormValues) => void;
}

export function AddOwedToMeForm({ onSubmit }: AddOwedToMeFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      person: "",
      amount: 0,
      description: "",
    },
  });

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="person"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Person</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Jane Smith" {...field} />
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
                <FormLabel>Amount</FormLabel>
                <FormControl>
                   <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                    <Input type="number" step="0.01" placeholder="e.g., 100.00" className="pl-7" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., For concert tickets" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
          <UserPlus className="mr-2 h-4 w-4" /> Add Amount Owed to You
        </Button>
      </form>
    </Form>
  );
}
