"use server";

import * as z from "zod";
import { currentUser } from "@/lib/auth";
import { getUserByEmail } from "@/data/user";
import { getOrCreateWallet, transferCoins } from "@/lib/wallet";
import {
  getRecentTransactions,
  getTransactionStats,
  getPaginatedTransactions,
} from "@/data/transaction";
import { SendCoinsSchema } from "@/schemas/index";
import type {
  WalletActionResult,
  WalletBalancePayload,
  SendCoinsPayload,
  GetTransactionsPayload,
  DashboardDataPayload,
} from "@/lib/types/wallet";
import type { TransactionType } from "@prisma/client";

export const getWalletBalance = async (): Promise<
  WalletActionResult<WalletBalancePayload>
> => {
  const user = await currentUser();
  if (!user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const wallet = await getOrCreateWallet(user.id);
    return {
      success: true,
      data: {
        walletId: wallet.id,
        balance: wallet.balance.toString(),
      },
    };
  } catch {
    return { success: false, error: "Could not retrieve wallet balance." };
  }
};

export const sendCoins = async (
  values: z.infer<typeof SendCoinsSchema>,
): Promise<WalletActionResult<SendCoinsPayload>> => {
  const user = await currentUser();
  if (!user?.id || !user?.email) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const validated = SendCoinsSchema.safeParse(values);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message ?? "Invalid input.";
    return { success: false, error: firstError };
  }

  const { recipientEmail, amount, description } = validated.data;

  if (recipientEmail.toLowerCase() === user.email.toLowerCase()) {
    return { success: false, error: "You cannot send coins to yourself." };
  }

  const recipient = await getUserByEmail(recipientEmail);
  if (!recipient) {
    return {
      success: false,
      error: "No account found with that email address.",
    };
  }

  return await transferCoins(user.id, recipient.id, amount, description);
};

export const getWalletDashboardData = async (): Promise<
  WalletActionResult<DashboardDataPayload>
> => {
  const user = await currentUser();
  if (!user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const wallet = await getOrCreateWallet(user.id);

    const [stats, recentTransactions] = await Promise.all([
      getTransactionStats(wallet.id),
      getRecentTransactions(wallet.id, 5),
    ]);

    return {
      success: true,
      data: {
        walletId: wallet.id,
        balance: wallet.balance.toString(),
        totalSent: stats.totalSent,
        totalReceived: stats.totalReceived,
        txnCount: stats.txnCount,
        recentTransactions,
      },
    };
  } catch {
    return { success: false, error: "Could not load dashboard data." };
  }
};

export const getWalletTransactions = async (
  page: number = 1,
  pageSize: number = 10,
  typeFilter?: TransactionType,
): Promise<WalletActionResult<GetTransactionsPayload>> => {
  const user = await currentUser();
  if (!user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const wallet = await getOrCreateWallet(user.id);
    const { transactions, total } = await getPaginatedTransactions(
      wallet.id,
      page,
      pageSize,
      typeFilter,
    );

    return {
      success: true,
      data: { transactions, total, page, pageSize },
    };
  } catch {
    return { success: false, error: "Could not load transactions." };
  }
};
