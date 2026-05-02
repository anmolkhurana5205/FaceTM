import { db } from "@/lib/db";
import type { TransactionType } from "@prisma/client";
import type { TransactionWithUsers } from "@/lib/types/wallet";

const WITH_USERS = {
  sender: { select: { id: true, name: true, email: true } },
  receiver: { select: { id: true, name: true, email: true } },
} as const;

export const getTransactionById = async (
  id: string,
): Promise<TransactionWithUsers | null> => {
  try {
    return await db.transaction.findUnique({
      where: { id },
      include: WITH_USERS,
    });
  } catch {
    return null;
  }
};

export const getRecentTransactions = async (
  walletId: string,
  limit = 5,
): Promise<TransactionWithUsers[]> => {
  try {
    return await db.transaction.findMany({
      where: { walletId },
      include: WITH_USERS,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
};

export const getPaginatedTransactions = async (
  walletId: string,
  page: number = 1,
  pageSize: number = 10,
  typeFilter?: TransactionType,
): Promise<{ transactions: TransactionWithUsers[]; total: number }> => {
  try {
    const where = {
      walletId,
      ...(typeFilter ? { type: typeFilter } : {}),
    };

    const [transactions, total] = await db.$transaction([
      db.transaction.findMany({
        where,
        include: WITH_USERS,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.transaction.count({ where }),
    ]);

    return { transactions, total };
  } catch {
    return { transactions: [], total: 0 };
  }
};

export const getTransactionStats = async (
  walletId: string,
): Promise<{
  totalSent: string;
  totalReceived: string;
  txnCount: number;
}> => {
  try {
    const [sentAgg, receivedAgg, txnCount] = await db.$transaction([
      db.transaction.aggregate({
        where: { walletId, type: "SEND" },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: { walletId, type: "RECEIVE" },
        _sum: { amount: true },
      }),
      db.transaction.count({ where: { walletId } }),
    ]);

    return {
      totalSent: sentAgg._sum.amount?.toString() ?? "0",
      totalReceived: receivedAgg._sum.amount?.toString() ?? "0",
      txnCount,
    };
  } catch {
    return { totalSent: "0", totalReceived: "0", txnCount: 0 };
  }
};
