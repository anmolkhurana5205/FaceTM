"use client";

import { useState, useEffect, useTransition } from "react";
import {
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getWalletTransactions } from "@/actions/wallet";
import type { TransactionWithUsers } from "@/lib/types/wallet";
import type { TransactionType } from "@prisma/client";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<TransactionWithUsers[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<TransactionType | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    startTransition(async () => {
      setLoading(true);
      const result = await getWalletTransactions(page, PAGE_SIZE, typeFilter);
      if (result.success) {
        setTransactions(result.data.transactions);
        setTotal(result.data.total);
      }
      setLoading(false);
    });
  }, [page, typeFilter]);

  const handleFilterChange = (filter: TransactionType | undefined) => {
    setTypeFilter(filter);
    setPage(1);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">
            Transactions
          </h1>
          <p className="text-white/30 text-sm mt-1">
            {total > 0
              ? `${total} transaction${total !== 1 ? "s" : ""}`
              : "No transactions yet"}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-white/5 rounded-lg p-1 border border-white/5">
          <button
            onClick={() => handleFilterChange(undefined)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              typeFilter === undefined
                ? "bg-white/10 text-white/90"
                : "text-white/40 hover:text-white/60",
            )}
          >
            <Filter className="w-3 h-3" />
            All
          </button>
          <button
            onClick={() => handleFilterChange("SEND")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              typeFilter === "SEND"
                ? "bg-red-500/20 text-red-400"
                : "text-white/40 hover:text-white/60",
            )}
          >
            <ArrowUpRight className="w-3 h-3" />
            Sent
          </button>
          <button
            onClick={() => handleFilterChange("RECEIVE")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              typeFilter === "RECEIVE"
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-white/40 hover:text-white/60",
            )}
          >
            <ArrowDownLeft className="w-3 h-3" />
            Received
          </button>
        </div>
      </div>

      {/* Transaction list */}
      <div className="rounded-2xl border border-white/5 bg-white/2 overflow-hidden">
        {loading || isPending ? (
          <div className="space-y-0 divide-y divide-white/3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-4 animate-pulse"
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                  <div className="h-2 bg-white/5 rounded w-1/4" />
                </div>
                <div className="h-4 bg-white/5 rounded w-16" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
              <ArrowLeftRight className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-white/50 text-sm font-medium">
              No transactions found
            </p>
            <p className="text-white/20 text-xs mt-1.5">
              {typeFilter
                ? `No ${typeFilter.toLowerCase()} transactions yet`
                : "Your transaction history will appear here"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/3">
            {transactions.map((txn) => {
              const isSend = txn.type === "SEND";
              const counterparty = isSend ? txn.receiver : txn.sender;
              const amount = parseFloat(txn.amount.toString());

              return (
                <li
                  key={txn.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors"
                >
                  {/* Icon */}
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

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-medium truncate">
                      {isSend
                        ? `To ${counterparty.name ?? counterparty.email}`
                        : `From ${counterparty.name ?? counterparty.email}`}
                    </p>
                    {txn.description && (
                      <p className="text-white/30 text-xs mt-0.5 truncate">
                        {txn.description}
                      </p>
                    )}
                    <p className="text-white/20 text-xs mt-0.5">
                      {formatDate(txn.createdAt)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        isSend ? "text-red-400" : "text-emerald-400",
                      )}
                    >
                      {isSend ? "−" : "+"}
                      {amount % 1 === 0
                        ? amount.toLocaleString()
                        : amount.toLocaleString(undefined, {
                            maximumFractionDigits: 8,
                          })}
                    </p>
                    <p className="text-white/20 text-[10px] mt-0.5">coins</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-white/30 text-xs">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={page <= 1 || isPending}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-white/40 hover:text-white/80 hover:bg-white/5 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    disabled={isPending}
                    className={cn(
                      "w-7 h-7 rounded-md text-xs font-medium transition-all",
                      page === pageNum
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        : "text-white/30 hover:text-white/60 hover:bg-white/5",
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              disabled={page >= totalPages || isPending}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="text-white/40 hover:text-white/80 hover:bg-white/5 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
