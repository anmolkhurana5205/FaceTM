"use server";

import * as z from "zod";

import { RegisterSchema } from "@/schemas";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { WALLET_INITIAL_BALANCE } from "@/lib/types/wallet";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid fields!",
    };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return {
      error: "Email already in use!",
    };
  }

  let newUser;
  try {
    newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    throw error;
  }
  try {
    await db.wallet.create({
      data: {
        userId: newUser.id,
        balance: WALLET_INITIAL_BALANCE, // 1000 coins
      },
    });
  } catch (walletError) {
    console.error(
      `[register] Failed to create wallet for user ${newUser.id}:`,
      walletError,
    );
  }

  const verificationToken = await generateVerificationToken(email);

  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return {
    success: "Confirmation Email Sent!",
  };
};
