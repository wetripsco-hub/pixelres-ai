import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-cyan-500/30 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/50",
        secondary:
          "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700",
        destructive:
          "border-red-500/30 bg-red-950/40 text-red-300 hover:bg-red-900/50",
        outline: "border-slate-700 text-slate-300",
        glow: "border-cyan-500/50 bg-cyan-500/10 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]",
        violet: "border-violet-500/40 bg-violet-950/50 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
