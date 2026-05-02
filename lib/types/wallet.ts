import type {
  Wallet,
  Transaction,
  TransactionType,
  User,
} from ".prisma/client";

export type { Wallet, Transaction, TransactionType };

export type TransactionWithUsers = Transaction & {
  sender: Pick<User, "id" | "name" | "email">;
  receiver: Pick<User, "id" | "name" | "email">;
};

export type WalletWithUser = Wallet & {
  user: Pick<User, "id" | "name" | "email">;
};

export type WalletActionResult<T = undefined> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

export type WalletBalancePayload = {
  balance: string;
  walletId: string;
};

export type SendCoinsPayload = {
  newBalance: string; // sender's balance after transfer
  transactionId: string; // the SEND-type transaction record id
  amount: string;
  recipientName: string | null;
};

export type GetTransactionsPayload = {
  transactions: TransactionWithUsers[];
  total: number; // total count for pagination
  page: number;
  pageSize: number;
};

export type DashboardDataPayload = {
  walletId: string;
  balance: string; // Prisma.Decimal → string
  totalSent: string; // aggregated Decimal → string
  totalReceived: string; // aggregated Decimal → string
  txnCount: number; // plain count — number is fine
  recentTransactions: TransactionWithUsers[];
};

export const WALLET_INITIAL_BALANCE = "1000" as const;
export const WALLET_MAX_TRANSFER = "10000" as const;
export const WALLET_MIN_TRANSFER = "0.00000001" as const;
export const COIN_DECIMALS = 8 as const;
