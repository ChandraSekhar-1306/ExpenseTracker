'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { getYear, getMonth } from 'date-fns';
import { SlidersHorizontal } from 'lucide-react';

interface MonthPickerProps {
  onDateChange: (date: { month: number; year: number }) => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Generate years from current year down to 5 years ago
const currentYear = getYear(new Date());
const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

export function MonthPicker({ onDateChange }: MonthPickerProps) {
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>(getMonth(new Date()).toString());

  const handleApply = () => {
    onDateChange({
      month: parseInt(selectedMonth, 10),
      year: parseInt(selectedYear, 10),
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month, index) => (
            <SelectItem key={month} value={index.toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedYear} onValueChange={setSelectedYear}>
        <SelectTrigger className="w-full sm:w-[120px]">
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleApply} className="w-full sm:w-auto">
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Generate Report
      </Button>
    </div>
  );
}
