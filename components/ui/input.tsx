import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-14 w-full min-w-0 rounded-lg border border-neutral-80 bg-input-background px-4 py-2 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-neutral-900 focus-visible:border-primary focus-visible:border-2 focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-38 aria-invalid:border-negative-2 aria-invalid:ring-0 md:text-base",
        className
      )}
      {...props}
    />
  )
}

export { Input }
