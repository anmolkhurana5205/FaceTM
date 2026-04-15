"use server";

import * as z from "zod";

import { db } from "@/lib/db";
import { SettingsSchema } from "@/schemas";
import { currentUser } from "@/lib/auth";
import { getUserById } from "@/data/user";

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const user = await currentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const dbUser = await getUserById(user.id!);
  if (!dbUser) {
    return { error: "Unauthorized!" };
  }

  const validatedFields = SettingsSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  await db.user.update({
    where: { id: dbUser.id },
    data: {
      ...validatedFields.data,
    },
  });

  return { success: "Settings Updated" };
};
