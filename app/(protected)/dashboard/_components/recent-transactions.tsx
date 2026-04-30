import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type TransactionType = "SEND" | "RECEIVE";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface RecentTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  counterpartyName: string; // who sent to / received from
  createdAt: Date;
  status?: TransactionStatus;
}

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
  className?: string;
}

const formatDate = (date: Date): string => {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const RecentTransactions = ({
  transactions,
  className,
}: RecentTransactionsProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/5 bg-white/2 overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h2 className="text-white/80 font-semibold text-sm">
          Recent Transactions
        </h2>
        <Link
          href="/dashboard/transactions"
          className="flex items-center gap-1 text-violet-400 text-xs font-medium hover:text-violet-300 transition-colors"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
            <ArrowUpRight className="w-5 h-5 text-white/20" />
          </div>
          <p className="text-white/30 text-sm">No transactions yet</p>
          <p className="text-white/20 text-xs mt-1">
            Your recent activity will appear here
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-white/3">
          {transactions.map((txn) => {
            const isSend = txn.type === "SEND";

            return (
              <li
                key={txn.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors"
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                    isSend
                      ? "bg-red-500/10 border border-red-500/20"
                      : "bg-emerald-500/10 border border-emerald-500/20",
                  )}
                >
                  {isSend ? (
                    <ArrowUpRight className="w-4 h-4 text-red-400" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">
                    {isSend
                      ? `To ${txn.counterpartyName}`
                      : `From ${txn.counterpartyName}`}
                  </p>
                  <p className="text-white/30 text-xs mt-0.5">
                    {formatDate(txn.createdAt)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      isSend ? "text-red-400" : "text-emerald-400",
                    )}
                  >
                    {isSend ? "−" : "+"}
                    {txn.amount.toLocaleString()}
                  </p>
                  <p className="text-white/20 text-[10px] mt-0.5">coins</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
