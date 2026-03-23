"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-38 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground font-medium hover:bg-primary/90 active:bg-primary/80 shadow-sm",
        outline:
          "border-primary text-primary bg-transparent hover:bg-primary/5 active:bg-primary/10 font-medium",
        secondary:
          "bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 active:bg-secondary/70",
        ghost:
          "border-border text-foreground bg-transparent hover:bg-neutral-20 active:bg-neutral-30 font-medium",
        destructive:
          "bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 active:bg-destructive/80 shadow-sm",
        link: "text-primary underline-offset-4 hover:underline font-medium",
        text: "text-primary bg-transparent hover:bg-primary/5 active:bg-primary/10 font-medium",
      },
      size: {
        default: "h-11 gap-2 px-6 text-sm",
        xs: "h-8 gap-1 px-3 text-xs rounded-md",
        sm: "h-10 gap-1.5 px-4 text-sm",
        lg: "h-14 gap-2 px-8 text-base",
        icon: "size-11",
        "icon-xs": "size-8 rounded-md",
        "icon-sm": "size-10",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
