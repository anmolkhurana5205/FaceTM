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
        if (credentials?.faceVerified === "true" && credentials?.email) {
          const user = await getUserByEmail(credentials.email as string);
          if (user && user.isFaceAuthEnabled && user.emailVerified) {
            return user; // grant session
          }
          return null;
        }
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const user = await getUserByEmail(email);

          if (!user || !user.password) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
