import { ArrowLeftRight } from "lucide-react";

const TransactionsPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
        <ArrowLeftRight className="w-6 h-6 text-amber-400" />
      </div>
      <h2 className="text-white/80 text-xl font-semibold">Transactions</h2>
      <p className="text-white/30 text-sm mt-1.5 max-w-xs">
        Paginated history with sent / received filters
      </p>
    </div>
  );
};

export default TransactionsPage;
