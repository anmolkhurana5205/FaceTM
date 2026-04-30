import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export const StatsCard = ({
  label,
  value,
  sub,
  icon: Icon,
  iconColor = "text-violet-400",
  iconBg = "bg-violet-500/10 border-violet-500/20",
  className,
}: StatsCardProps) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/5 bg-white/2 p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-white/40 text-xs font-medium mb-1.5">{label}</p>
          <p className="text-white text-xl font-bold tracking-tight tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {sub && <p className="text-white/25 text-[11px] mt-1">{sub}</p>}
        </div>

        <div
          className={cn(
            "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0",
            iconBg,
          )}
        >
          <Icon className={cn("w-4 h-4", iconColor)} />
        </div>
      </div>
    </div>
  );
};
