"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { getUserByEmail } from "@/data/user";
import { signIn } from "@/auth";

export const enrollFace = async (descriptorJson: string) => {
  const user = await currentUser();
  if (!user?.id) return { error: "Unauthorized" };

  try {
    const parsed = JSON.parse(descriptorJson);
    if (!Array.isArray(parsed) || parsed.length !== 128) {
      return { error: "Invalid face data" };
    }
  } catch {
    return { error: "Invalid face data format" };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      faceDescriptor: descriptorJson,
      isFaceAuthEnabled: true,
    },
  });

  return { success: "Face enrolled successfully!" };
};

export const verifyFaceDescriptor = async (
  email: string,
  descriptorJson: string,
): Promise<{ success?: string; error?: string; match?: boolean }> => {
  const user = await getUserByEmail(email);

  if (!user) return { error: "User not found" };
  if (!user.isFaceAuthEnabled || !user.faceDescriptor) {
    return { error: "Face auth is not enabled for this account" };
  }
  if (!user.emailVerified) {
    return { error: "Please verify your email first" };
  }

  let incoming: number[];
  try {
    incoming = JSON.parse(descriptorJson);
    if (!Array.isArray(incoming) || incoming.length !== 128) {
      return { error: "Invalid face data" };
    }
  } catch {
    return { error: "Invalid face data" };
  }

  const stored = JSON.parse(user.faceDescriptor) as number[];

  let sum = 0;
  for (let i = 0; i < 128; i++) {
    sum += Math.pow(incoming[i] - stored[i], 2);
  }
  const distance = Math.sqrt(sum);

  const THRESHOLD = 0.55;
  if (distance > THRESHOLD) {
    return { error: "Face not recognized. Try again." };
  }

  return { match: true, success: "Face verified" };
};

export const disableFaceAuth = async () => {
  const user = await currentUser();
  if (!user?.id) return { error: "Unauthorized" };

  await db.user.update({
    where: { id: user.id },
    data: {
      faceDescriptor: null,
      isFaceAuthEnabled: false,
    },
  });

  return { success: "Face authentication disabled" };
};
