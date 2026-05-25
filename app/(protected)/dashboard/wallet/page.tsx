"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { SendCoinsSchema } from "@/schemas/index";
import { sendCoins, getWalletBalance } from "@/actions/wallet";
import { WalletBalanceCard } from "../_components/wallet-balance-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Send, Wallet } from "lucide-react";
import { useSearchParams } from "next/navigation";

const WalletPage = () => {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");

  const [balance, setBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [showSendForm, setShowSendForm] = useState(action === "send");
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SendCoinsSchema>>({
    resolver: zodResolver(SendCoinsSchema),
    defaultValues: {
      recipientEmail: "",
      amount: "",
      description: "",
    },
  });

  useEffect(() => {
    getWalletBalance().then((res) => {
      if (res.success) {
        setBalance(parseFloat(res.data.balance));
      }
      setLoadingBalance(false);
    });
  }, []);

  const onSubmit = (values: z.infer<typeof SendCoinsSchema>) => {
    setError(undefined);
    setSuccess(undefined);

    startTransition(async () => {
      const result = await sendCoins(values);
      if (!result.success) {
        setError(result.error);
      } else {
        setSuccess(
          `Successfully sent ${result.data.amount} coins to ${result.data.recipientName ?? values.recipientEmail}!`,
        );
        setBalance(parseFloat(result.data.newBalance));
        form.reset();
        setShowSendForm(false);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-white text-2xl font-bold tracking-tight">Wallet</h1>
        <p className="text-white/30 text-sm mt-1">
          Manage your coins and send payments
        </p>
      </div>

      {loadingBalance ? (
        <div className="rounded-2xl border border-white/5 bg-white/2 p-6 animate-pulse h-36" />
      ) : (
        <WalletBalanceCard balance={balance} changePercent={undefined} />
      )}

      {/* Action buttons */}
      {!showSendForm && (
        <div className="flex gap-3">
          <Button
            onClick={() => setShowSendForm(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white border-0"
          >
            <Send className="w-4 h-4" />
            Send Coins
          </Button>
        </div>
      )}

      {/* Send Coins Form */}
      {showSendForm && (
        <div className="rounded-2xl border border-white/10 bg-white/3 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                <Send className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h2 className="text-white/90 font-semibold text-sm">
                  Send Coins
                </h2>
                <p className="text-white/30 text-xs">
                  Transfer coins to another user
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowSendForm(false);
                setError(undefined);
                setSuccess(undefined);
                form.reset();
              }}
              className="text-white/30 hover:text-white/60 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="recipientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/60 text-xs font-medium uppercase tracking-wider">
                      Recipient Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="recipient@example.com"
                        type="email"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/60 text-xs font-medium uppercase tracking-wider">
                      Amount (coins)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="0.00"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
                      />
                    </FormControl>
                    <p className="text-white/20 text-xs mt-1">
                      Available: {balance.toLocaleString()} coins
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/60 text-xs font-medium uppercase tracking-wider">
                      Note{" "}
                      <span className="text-white/20 normal-case font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="What's this for?"
                        maxLength={120}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:border-violet-500/50 focus-visible:ring-violet-500/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormError message={error} />
              <FormSuccess message={success} />

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white border-0 font-medium"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Coins
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {/* Success message outside form */}
      {!showSendForm && success && <FormSuccess message={success} />}

      {/* Info card */}
      <div className="rounded-xl border border-white/5 bg-white/2 p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Wallet className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-white/60 text-sm font-medium">
              About your wallet
            </p>
            <p className="text-white/30 text-xs mt-1 leading-relaxed">
              Coins can be transferred instantly to any registered user. Minimum
              transfer is 0.00000001 coins, maximum is 10,000 coins per
              transaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
