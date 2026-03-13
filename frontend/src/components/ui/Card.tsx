import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  bordered?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
};

export const Card = ({
  children,
  className = "",
  hoverable = false,
  bordered = true,
  padding = "md"
}: CardProps) => {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  return (
    <div
      className={`
        bg-card rounded-2xl shadow-card
        ${bordered ? "border border-border" : ""}
        ${paddingClasses[padding]}
        ${hoverable ? "transition-all hover:shadow-elevated hover:-translate-y-0.5" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

type StatsCardProps = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
};

export const StatsCard = ({ title, value, icon, trend, className = "" }: StatsCardProps) => {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p
              className={`mt-1 text-sm font-medium ${
                trend.positive ? "text-success" : "text-destructive"
              }`}
            >
              {trend.positive ? "+" : "-"}{Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
};

export const SectionHeader = ({ title, description, action, icon }: SectionHeaderProps) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon && <div className="text-primary">{icon}</div>}
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default Card;
