import * as z from "zod";
import { WALLET_MAX_TRANSFER, WALLET_MIN_TRANSFER } from "@/lib/types/wallet";

export const SettingsSchema = z.object({
  name: z.optional(z.string()),
  isTwoFactorEnabled: z.optional(z.boolean()),
  role: z.enum(["ADMIN", "USER"]),
});
export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "password is required",
  }),
  code: z.optional(z.string()),
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email is required",
  }),
  password: z.string().min(6, {
    message: "Minimum 6 characters required",
  }),
  name: z.string().min(1, {
    message: "Name is required",
  }),
});

export const SendCoinsSchema = z.object({
  recipientEmail: z
    .string()
    .email({ message: "Please enter a valid email address." }),

  amount: z
    .string()
    .min(1, { message: "Amount is required." })
    .refine((val) => /^\d+(\.\d{1,8})?$/.test(val) && parseFloat(val) > 0, {
      message: "Enter a valid amount (up to 8 decimal places).",
    })
    .refine((val) => parseFloat(val) >= parseFloat(WALLET_MIN_TRANSFER), {
      message: `Minimum transfer is ${WALLET_MIN_TRANSFER} coins.`,
    })
    .refine((val) => parseFloat(val) <= parseFloat(WALLET_MAX_TRANSFER), {
      message: `Maximum transfer is ${WALLET_MAX_TRANSFER} coins.`,
    }),

  description: z
    .string()
    .max(120, { message: "Note must be 120 characters or fewer." })
    .optional(),
});

export type SendCoinsInput = z.infer<typeof SendCoinsSchema>;
