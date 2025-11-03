
"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
    React.ElementRef<typeof Check>,
    React.ComponentPropsWithoutRef<typeof Check>
>(({ className, ...props }, ref) => (
    <Check
        ref={ref}
        className={cn(
            "h-4 w-4",
            className
        )}
        {...props}
    />
))
Checkbox.displayName = "Check"

export { Checkbox }
