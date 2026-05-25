import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WalletBalanceCard } from "./_components/wallet-balance-card";
import { QuickActions } from "./_components/quick-actions";
import { RecentTransactions } from "./_components/recent-transactions";
import { StatsCard } from "./_components/stats-card";
import { ArrowUpRight, ArrowDownLeft, Activity, Users } from "lucide-react";
import type { RecentTransaction } from "./_components/recent-transactions";
import { getWalletDashboardData } from "@/actions/wallet";

const DashboardPage = async () => {
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  const result = await getWalletDashboardData();

  // Fallback values if data fetch fails
  const balance = result.success ? parseFloat(result.data.balance) : 0;
  const totalSent = result.success ? parseFloat(result.data.totalSent) : 0;
  const totalReceived = result.success
    ? parseFloat(result.data.totalReceived)
    : 0;
  const txnCount = result.success ? result.data.txnCount : 0;

  // Map TransactionWithUsers to RecentTransaction shape
  const recentTransactions: RecentTransaction[] = result.success
    ? result.data.recentTransactions.map((txn) => {
        const isSend = txn.type === "SEND";
        return {
          id: txn.id,
          type: txn.type as "SEND" | "RECEIVE",
          amount: parseFloat(txn.amount.toString()),
          counterpartyName: isSend
            ? (txn.receiver.name ?? txn.receiver.email ?? "Unknown")
            : (txn.sender.name ?? txn.sender.email ?? "Unknown"),
          createdAt: new Date(txn.createdAt),
        };
      })
    : [];

  const firstName = user.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Compute unique contacts from recent transactions
  const uniqueContacts = result.success
    ? new Set(
        result.data.recentTransactions.map((txn) =>
          txn.type === "SEND" ? txn.receiverId : txn.senderId,
        ),
      ).size
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <p className="text-white/30 text-sm">
          {greeting},&nbsp;
          <span className="text-white/60 font-medium">{firstName}</span>
        </p>
        <h1 className="text-white text-2xl font-bold mt-0.5 tracking-tight">
          Your Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <WalletBalanceCard
          balance={balance}
          changePercent={undefined}
          className="lg:col-span-1"
        />

        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          <StatsCard
            label="Total Sent"
            value={totalSent.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
            sub="coins sent"
            icon={ArrowUpRight}
            iconColor="text-red-400"
            iconBg="bg-red-500/10 border-red-500/20"
          />
          <StatsCard
            label="Total Received"
            value={totalReceived.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
            sub="coins received"
            icon={ArrowDownLeft}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10 border-emerald-500/20"
          />
          <StatsCard
            label="Transactions"
            value={txnCount}
            sub="all time"
            icon={Activity}
            iconColor="text-amber-400"
            iconBg="bg-amber-500/10 border-amber-500/20"
          />
          <StatsCard
            label="Contacts"
            value={uniqueContacts}
            sub="users interacted"
            icon={Users}
            iconColor="text-sky-400"
            iconBg="bg-sky-500/10 border-sky-500/20"
          />
        </div>
      </div>

      <section>
        <h2 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
          Quick Actions
        </h2>
        <QuickActions />
      </section>

      <section>
        <RecentTransactions transactions={recentTransactions} />
      </section>
    </div>
  );
};

export default DashboardPage;
