
"use client";

import { useState, useEffect, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, X, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth } from "date-fns";

export interface Filters {
  dateRange: DateRange;
  searchTerm: string;
}

interface ExpenseFiltersProps {
  onFilterChange: (filters: Filters) => void;
  isLoading: boolean;
  defaultToAllTime?: boolean;
}

export function ExpenseFilters({ onFilterChange, isLoading, defaultToAllTime = false }: ExpenseFiltersProps) {
  const defaultDateRange = useMemo(() => {
    if (defaultToAllTime) {
      return { from: undefined, to: undefined };
    }
    const now = new Date();
    return {
      from: startOfMonth(now),
      to: endOfMonth(now),
    };
  }, [defaultToAllTime]);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    const filters: Filters = {
      dateRange: dateRange || { from: undefined, to: undefined },
      searchTerm: searchTerm,
    };
    onFilterChange(filters);
  }, [dateRange, searchTerm, onFilterChange]);
  
  const clearFilters = () => {
    setDateRange(defaultToAllTime ? { from: undefined, to: undefined } : { from: startOfMonth(new Date()), to: endOfMonth(new Date()) });
    setSearchTerm("");
  };

  const hasActiveFilters = useMemo(() => {
    // If default is all time, any date selection is an active filter.
    if (defaultToAllTime) {
      return !!dateRange?.from || !!dateRange?.to || searchTerm !== "";
    }
    // If default is a month, check against that default.
    const fromDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
    const defaultFromDate = defaultDateRange.from ? format(defaultDateRange.from, 'yyyy-MM-dd') : null;
    const toDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null;
    const defaultToDate = defaultDateRange.to ? format(defaultDateRange.to, 'yyyy-MM-dd') : null;

    return (
      (fromDate && fromDate !== defaultFromDate) ||
      (toDate && toDate !== defaultToDate) ||
      searchTerm !== ""
    );
  }, [dateRange, searchTerm, defaultDateRange, defaultToAllTime]);


  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Search Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        
        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className="w-full justify-start text-left font-normal"
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {hasActiveFilters && (
        <Button onClick={clearFilters} variant="ghost" size="sm" className="text-muted-foreground">
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  );
}
