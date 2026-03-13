import { ReactNode } from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "destructive" | "accent";
type BadgeSize = "sm" | "md" | "lg";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  accent: "bg-accent/20 text-accent-foreground",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

export const Badge = ({
  children,
  variant = "default",
  size = "sm",
  className = ""
}: BadgeProps) => {
  return (
    <span
      className={`
        inline-flex items-center rounded-full font-semibold
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
