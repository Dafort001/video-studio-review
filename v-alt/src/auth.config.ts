import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: '/auth/signin',
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id as string;
                token.role = user.role as string;
                token.isApproved = user.isApproved as boolean;
                token.customerId = user.customerId as string | null;
                // Check if user is missing required onboarding fields
                token.needsProfileUpdate = !user.name || !user.email || !user.phone || !user.street || !user.postalCode || !user.city;
            }
            if (trigger === "update" && session) {
                token.needsProfileUpdate = (session as { needsProfileUpdate?: boolean }).needsProfileUpdate;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.isApproved = token.isApproved as boolean;
                session.user.customerId = (token.customerId as string | null) || null;
                session.user.needsProfileUpdate = token.needsProfileUpdate as boolean;
            }
            return session;
        }
    },
    providers: [], // Populated in auth.ts
} satisfies NextAuthConfig;
