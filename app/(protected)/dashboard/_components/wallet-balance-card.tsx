import { Wallet, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type WalletBalanceCardProps = {
  balance: number;
  changePercent?: number; // optional trend vs last period
  className?: string;
};

export const WalletBalanceCard = ({
  balance,
  changePercent,
  className,
}: WalletBalanceCardProps) => {
  const isPositive = changePercent !== undefined && changePercent >= 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-linear-to-br from-violet-600/20 via-indigo-600/10 to-transparent",
        "border border-violet-500/20",
        className,
      )}
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-white/50 text-sm font-medium">
            Coin Balance
          </span>
        </div>

        {changePercent !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
              isPositive
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/15 text-red-400 border border-red-500/20",
            )}
          >
            <TrendingUp
              className={cn("w-3 h-3", !isPositive && "rotate-180")}
            />
            {Math.abs(changePercent)}%
          </div>
        )}
      </div>

      <div className="relative">
        <div className="flex items-baseline gap-2">
          <span className="text-white/30 text-lg font-light">⬡</span>
          <span className="text-white text-4xl font-bold tracking-tight tabular-nums">
            {balance.toLocaleString()}
          </span>
          <span className="text-white/30 text-sm font-medium">coins</span>
        </div>

        <p className="text-white/30 text-xs mt-2">
          ≈ ${(balance * 0.01).toFixed(2)} USD equivalent
        </p>
      </div>
    </div>
  );
};
