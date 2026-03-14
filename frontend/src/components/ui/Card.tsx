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
    sm: "p-3",
    md: "p-5",
    lg: "p-7"
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
    <Card className={`group flex flex-col min-h-[100px] border border-gray-200 shadow-none rounded-xl bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#EDCF07] hover:bg-[#EDCF07]/10 ${className}`} padding="none">
      <div className="p-4 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between">
          {icon && (
            <div className="rounded-lg border border-gray-100 p-2 bg-white flex items-center justify-center transition-colors group-hover:border-[#EDCF07]/50 group-hover:bg-[#EDCF07]/20">
              {icon}
            </div>
          )}
          <div className="text-2xl font-bold leading-none text-gray-900 mt-1">{value}</div>
        </div>
        <div className="mt-4">
          <p className="text-xs text-gray-500">{title}</p>
          {trend && (
            <p
              className={`mt-1 text-[10px] font-medium ${
                trend.positive ? "text-success" : "text-destructive"
              }`}
            >
              {trend.positive ? "+" : "-"}{Math.abs(trend.value)}%
            </p>
          )}
        </div>
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
          <h2 className="text-lg font-medium text-foreground tracking-tight">{title}</h2>
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
