import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";

export default {
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        // we don't want user with the face verification to go through 2FA so we check for the face verification before the 2FA check.
        // Agar faceVerified == true aaya hai credentials mein, toh normal password skip karo
        if (credentials?.faceVerified === "true" && credentials?.email) {
          const user = await getUserByEmail(credentials.email as string);

          // 3 conditions: user exist kare, face auth enable ho, aur email verified ho
          // Teeno sach hain tabhi session grant karo — security ke liye zaruri hai
          if (user && user.isFaceAuthEnabled && user.emailVerified) {
            return user;
          }
          return null;
        }
        // Normal credentials flow: zod se validate karo pehle
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await getUserByEmail(email);

          // Agar user ka password hi nahi (matlab wo Google/GitHub se registered hai)
          // toh credentials login allow mat karo — warna security hole ban jayega
          if (!user || !user.password) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
