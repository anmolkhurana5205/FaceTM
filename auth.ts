import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "./auth.config";
import { db } from "./lib/db";
import { getUserById } from "./data/user";
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation";
import { UserRole } from "@prisma/client";
import { getAccountByUserId } from "./data/account";

// WHY extend kiya? — NextAuth ke default User mein sirf name, email, image hota hai
// Humein role, 2FA status, face auth status bhi session mein chahiye
// Agar extend nahi karte toh TypeScript error aata, aur session mein ye fields accessible nahi hote
export type ExtendedUser = DefaultSession["user"] & {
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean; // ye isliye ki OAuth users ko password change page nahi dikhana
  isFaceAuthEnabled: boolean;
};

// Yahan NextAuth ke Session interface ko override kiya — ab session.user ExtendedUser type ka hoga
declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

// JWT mein bhi role add kiya — kyunki JWT callback mein token.role use karna hai
declare module "@auth/core/jwt" {
  interface JWT {
    role?: UserRole;
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  events: {
    // Jab Google/GitHub se account link hota hai, email automatically verified consider karo
    // Kyunki OAuth providers already email verify karke bhejte hain
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },

  callbacks: {
    async signIn({ user, account, credentials }) {
      // OAuth users (Google/GitHub) ke liye email verification check skip karo
      if (account?.provider !== "credentials") return true;

      const existingUser = await getUserById(user.id!);

      // Email verify nahi ki toh login mat karne do — simple security rule
      if (!existingUser?.emailVerified) return false;

      // Face auth se aya hai toh 2FA check skip karo — face hi verification hai
      const isFaceAuth =
        (credentials as Record<string, unknown>)?.faceVerified === "true";
      if (isFaceAuth) return true;

      // 2FA enabled hai toh check karo DB mein confirmation exist karti hai ya nahi
      // Confirmation tab create hoti hai jab user sahi OTP enter karta hai (login.ts mein)
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id,
        );
        if (!twoFactorConfirmation) return false;

        // One-time use: confirmation delete karo taaki same session dobara use na ho
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true;
    },

    // session callback: JWT token se data session mein copy karo
    // WHY? — Client side pe session.user se data access karte hain, JWT directly accessible nahi hota browser mein
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub; // token.sub = user ka unique ID hota hai JWT mein
      }
      if (token.role && session.user) {
        session.user.role = token.role;
      }
      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
        session.user.isFaceAuthEnabled = token.isFaceAuthEnabled as boolean;
        session.user.name = token.name;
        session.user.email = token.email!;
        session.user.isOAuth = token.isOAuth as boolean;
      }
      return session;
    },

    // jwt callback: har request pe token refresh hota hai
    // WHY DB se read karte hain? — Agar user ne role change kiya toh fresh data chahiye
    // Trade-off: har request pe DB hit hota hai but data always fresh rehta hai
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;

      // isOAuth isliye store kiya — settings page mein password fields sirf non-OAuth users ko dikhane hain
      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOAuth = !!existingAccount;

      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      token.isFaceAuthEnabled = existingUser.isFaceAuthEnabled;

      return token;
    },
  },

  adapter: PrismaAdapter(db),
  // WHY JWT strategy? — Database sessions ke bajaye JWT use karo
  // Benefit: stateless hai, har request pe session DB query nahi lagti (sirf JWT decode hota hai)
  // But humne jwt callback mein DB read kiya — ye intentional hai fresh data ke liye
  session: { strategy: "jwt" },
  ...authConfig,
});
