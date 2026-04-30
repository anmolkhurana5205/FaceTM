import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WalletBalanceCard } from "./_components/wallet-balance-card";
import { QuickActions } from "./_components/quick-actions";
import { RecentTransactions } from "./_components/recent-transactions";
import { StatsCard } from "./_components/stats-card";
import { ArrowUpRight, ArrowDownLeft, Activity, Users } from "lucide-react";
import type { RecentTransaction } from "./_components/recent-transactions";

const MOCK_BALANCE = 1_000;

const MOCK_TRANSACTIONS: RecentTransaction[] = [
  {
    id: "1",
    type: "RECEIVE",
    amount: 250,
    counterpartyName: "Alice",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
];

const MOCK_STATS = {
  totalSent: 0,
  totalReceived: 0,
  txnCount: 0,
  contacts: 0,
};

const DashboardPage = async () => {
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  const firstName = user.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

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
          balance={MOCK_BALANCE}
          changePercent={undefined}
          className="lg:col-span-1"
        />

        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          <StatsCard
            label="Total Sent"
            value={MOCK_STATS.totalSent}
            sub="coins sent"
            icon={ArrowUpRight}
            iconColor="text-red-400"
            iconBg="bg-red-500/10 border-red-500/20"
          />
          <StatsCard
            label="Total Received"
            value={MOCK_STATS.totalReceived}
            sub="coins received"
            icon={ArrowDownLeft}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10 border-emerald-500/20"
          />
          <StatsCard
            label="Transactions"
            value={MOCK_STATS.txnCount}
            sub="all time"
            icon={Activity}
            iconColor="text-amber-400"
            iconBg="bg-amber-500/10 border-amber-500/20"
          />
          <StatsCard
            label="Contacts"
            value={MOCK_STATS.contacts}
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
        <RecentTransactions transactions={MOCK_TRANSACTIONS} />
      </section>
    </div>
  );
};

export default DashboardPage;
