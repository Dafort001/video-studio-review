import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { getTempAdminSession } from "@/lib/temp-admin"
import { normalizeAuthEmail } from "@/lib/auth-security"
import {
    EMAIL_LOGIN_MAX_ATTEMPTS,
    emailLoginCodeMatches,
    encodeEmailLoginToken,
    parseEmailLoginToken,
} from "@/lib/email-login-code"

import { authConfig } from "./auth.config"

const nextAuth = NextAuth({
    ...authConfig,
    session: { strategy: "jwt" },
    providers: [
        // ── Provider 1: Password Login ──────────────────────────────
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const email = normalizeAuthEmail(credentials?.email);
                if (!email || !credentials?.password) {
                    return null;
                }
                
                try {
                    const user = await prisma.user.findUnique({
                        where: { email }
                    });

                    if (!user) {
                        return null;
                    }

                    if (user.role === "customer" && (user.isSuspended || user.isDeleted)) {
                        return null;
                    }

                    if (user.hashedPassword) {
                        const decodedPassword = decodeURIComponent(credentials.password as string);
                        const isPasswordValid = await bcrypt.compare(decodedPassword, user.hashedPassword);
                        if (!isPasswordValid) return null;
                    } else {
                        return null;
                    }

                    if (user.role === "customer" && !user.phoneVerified && !user.emailVerified) {
                        throw new Error("email_not_verified");
                    }

                    if (!user.isApproved && user.role !== "admin") {
                        throw new Error("pending_approval");
                    }

                    return user;
                } catch (error: unknown) {
                    // Re-throw known auth errors so the frontend can handle them
                    if (
                        error instanceof Error &&
                        (error.message === "email_not_verified" ||
                            error.message === "pending_approval")
                    ) {
                        throw error;
                    }
                    console.error("[Auth] Exception during authorize:", error);
                    return null;
                }
            }
        }),

        // ── Provider 2: Email Code Login (Resend) ───────────────────
        CredentialsProvider({
            id: "email-code",
            name: "E-Mail Code",
            credentials: {
                email: { label: "Email", type: "email" },
                code: { label: "Code", type: "text" }
            },
            async authorize(credentials) {
                const email = normalizeAuthEmail(credentials?.email);
                if (!email || !credentials?.code) {
                    return null;
                }
                const code = (credentials.code as string).trim();

                try {
                    // Look up the verification token
                    const tokenRecord = await prisma.verificationToken.findFirst({
                        where: {
                            identifier: `email-login:${email}`,
                        },
                    });

                    if (!tokenRecord) {
                        return null;
                    }

                    if (new Date() > tokenRecord.expires) {
                        await prisma.verificationToken.delete({
                            where: { identifier_token: { identifier: tokenRecord.identifier, token: tokenRecord.token } },
                        });
                        return null;
                    }

                    const tokenState = parseEmailLoginToken(tokenRecord.token);
                    if (!tokenState || !emailLoginCodeMatches(tokenState.codeHash, email, code)) {
                        const nextAttempts = (tokenState?.attempts ?? EMAIL_LOGIN_MAX_ATTEMPTS) + 1;
                        await prisma.verificationToken.delete({
                            where: { identifier_token: { identifier: tokenRecord.identifier, token: tokenRecord.token } },
                        });

                        if (tokenState && nextAttempts < EMAIL_LOGIN_MAX_ATTEMPTS) {
                            await prisma.verificationToken.create({
                                data: {
                                    identifier: tokenRecord.identifier,
                                    token: encodeEmailLoginToken(tokenState.codeHash, nextAttempts),
                                    expires: tokenRecord.expires,
                                },
                            });
                        }

                        return null;
                    }

                    // Code valid — find user
                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user) {
                        return null;
                    }

                    const canUseEmergencyLogin =
                        user.role === "admin" ||
                        (user.isApproved && !user.isSuspended && !user.isDeleted);
                    if (!canUseEmergencyLogin) {
                        return null;
                    }

                    // Clean up used token
                    await prisma.verificationToken.delete({
                        where: { identifier_token: { identifier: tokenRecord.identifier, token: tokenRecord.token } },
                    });

                    return user;
                } catch (error) {
                    console.error("[Auth:EmailCode] Exception:", error);
                    return null;
                }
            }
        }),
    ],
})

export const { handlers, signIn, signOut } = nextAuth

export async function auth() {
    const session = await nextAuth.auth()

    if (session?.user) {
        return session
    }

    const tempAdminSession = await getTempAdminSession()
    if (tempAdminSession) {
        return tempAdminSession
    }

    return session
}
