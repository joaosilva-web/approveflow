import React from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type CardVariant = "default" | "glass" | "elevated" | "outlined";
type CardPadding = "none" | "sm" | "md" | "lg" | "xl";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  /** Renders an outer glow or gradient highlight ring */
  glow?: boolean;
}

// ─── Variant & padding maps ───────────────────────────────────────────────────

const variantClasses: Record<CardVariant, string> = {
  default: "bg-[#0d0d1e] border border-white/[0.06] rounded-2xl",
  glass: "glass rounded-2xl",
  elevated:
    "bg-[#111122] border border-white/[0.08] rounded-2xl shadow-xl shadow-black/30",
  outlined: "bg-transparent border border-white/10 rounded-2xl",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
}

function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base font-semibold text-white/90 leading-snug",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-white/50 leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center pt-4 mt-4 border-t border-white/[0.06]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

function Card({
  variant = "default",
  padding = "md",
  glow = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        glow && "glow-brand",
        "transition-colors duration-200",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export { Card };
export type { CardProps, CardVariant, CardPadding };
