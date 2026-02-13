import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-blue-100 text-blue-800 border-blue-200",
  destructive: "bg-red-100 text-red-800 border-red-200",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };