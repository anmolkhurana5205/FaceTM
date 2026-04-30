import { Wallet } from "lucide-react";

const WalletPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
        <Wallet className="w-6 h-6 text-violet-400" />
      </div>
      <h2 className="text-white/80 text-xl font-semibold">Wallet</h2>
      <p className="text-white/30 text-sm mt-1.5 max-w-xs">
        Full wallet system coming in Phase 2 — coin balance, sending &
        receiving.
      </p>
    </div>
  );
};

export default WalletPage;
