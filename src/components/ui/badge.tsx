import * as React from "react";

import { cn } from "@/src/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  destructive: "border-transparent bg-destructive text-destructive-foreground",
  outline: "text-foreground"
};

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: BadgeVariant }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
