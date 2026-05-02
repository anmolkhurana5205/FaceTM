import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getWalletByUserId } from "@/data/wallet";
import {
  WALLET_INITIAL_BALANCE,
  WALLET_MAX_TRANSFER,
  WALLET_MIN_TRANSFER,
  type SendCoinsPayload,
  type WalletActionResult,
} from "@/lib/types/wallet";

const D_MIN = new Prisma.Decimal(WALLET_MIN_TRANSFER);
const D_MAX = new Prisma.Decimal(WALLET_MAX_TRANSFER);
export const getOrCreateWallet = async (userId: string) => {
  const existing = await getWalletByUserId(userId);
  if (existing) return existing;

  return await db.wallet.create({
    data: {
      userId,
      balance: WALLET_INITIAL_BALANCE,
    },
  });
};

/**
 * @param senderId    - userId of the person sending
 * @param receiverId  - userId of the person receiving
 * @param amount      - decimal string, e.g. "50", "0.00000001", "1234.5"
 * @param description - optional memo
 */
export const transferCoins = async (
  senderId: string,
  receiverId: string,
  amount: string,
  description?: string,
): Promise<WalletActionResult<SendCoinsPayload>> => {
  if (senderId === receiverId) {
    return { success: false, error: "You cannot send coins to yourself." };
  }

  let amountDecimal: Prisma.Decimal;
  try {
    amountDecimal = new Prisma.Decimal(amount);
  } catch {
    return { success: false, error: "Invalid amount format." };
  }

  if (amountDecimal.lessThan(D_MIN)) {
    return {
      success: false,
      error: `Minimum transfer is ${WALLET_MIN_TRANSFER} coin.`,
    };
  }
  if (amountDecimal.greaterThan(D_MAX)) {
    return {
      success: false,
      error: `Maximum transfer is ${WALLET_MAX_TRANSFER} coins per transaction.`,
    };
  }

  const [senderWallet, receiverWallet] = await Promise.all([
    getOrCreateWallet(senderId),
    getOrCreateWallet(receiverId),
  ]);

  if (senderWallet.balance.lessThan(amountDecimal)) {
    return {
      success: false,
      error: `Insufficient balance. You have ${senderWallet.balance.toString()} coins.`,
    };
  }

  try {
    const [updatedSenderWallet, , sendTxn] = await db.$transaction([
      db.wallet.update({
        where: { id: senderWallet.id },
        data: { balance: { decrement: amountDecimal } },
      }),

      db.wallet.update({
        where: { id: receiverWallet.id },
        data: { balance: { increment: amountDecimal } },
      }),

      db.transaction.create({
        data: {
          walletId: senderWallet.id,
          senderId,
          receiverId,
          amount: amountDecimal,
          type: "SEND",
          description: description ?? null,
        },
      }),

      db.transaction.create({
        data: {
          walletId: receiverWallet.id,
          senderId,
          receiverId,
          amount: amountDecimal,
          type: "RECEIVE",
          description: description ?? null,
        },
      }),
    ]);

    const receiver = await db.user.findUnique({
      where: { id: receiverId },
      select: { name: true },
    });

    return {
      success: true,
      data: {
        transactionId: sendTxn.id,
        amount: amount, // original string — lossless
        newBalance: updatedSenderWallet.balance.toString(), // Decimal → string
        recipientName: receiver?.name ?? null,
      },
    };
  } catch (err) {
    console.error("[transferCoins] DB transaction failed:", err);
    return {
      success: false,
      error: "Transfer failed due to a server error. Please try again.",
    };
  }
};
