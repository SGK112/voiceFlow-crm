import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-gray-50 text-gray-900 border-gray-200 dark:bg-white/5 dark:text-white dark:border-white/10",
        destructive:
          "border-red-200 text-red-900 bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:bg-red-500/10 [&>svg]:text-red-600 dark:[&>svg]:text-red-400",
        warning:
          "border-orange-200 text-orange-900 bg-orange-50 dark:border-orange-500/30 dark:text-orange-300 dark:bg-orange-500/10 [&>svg]:text-orange-600 dark:[&>svg]:text-orange-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
