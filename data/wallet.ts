import { db } from "@/lib/db";
import type { Wallet } from "@prisma/client";

export const getWalletById = async (id: string): Promise<Wallet | null> => {
  try {
    return await db.wallet.findUnique({ where: { id } });
  } catch {
    return null;
  }
};

export const getWalletByUserId = async (
  userId: string,
): Promise<Wallet | null> => {
  try {
    return await db.wallet.findUnique({ where: { userId } });
  } catch {
    return null;
  }
};

export const getWalletWithUser = async (userId: string) => {
  try {
    return await db.wallet.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  } catch {
    return null;
  }
};

export const createWallet = async (
  userId: string,
  balance: string,
): Promise<Wallet | null> => {
  try {
    return await db.wallet.create({
      data: { userId, balance },
    });
  } catch {
    return null;
  }
};
