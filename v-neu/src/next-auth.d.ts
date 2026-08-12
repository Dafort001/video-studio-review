import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            isApproved: boolean;
            customerId: string | null;
            needsProfileUpdate: boolean;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        id: string;
        role: string;
        isApproved: boolean;
        customerId: string | null;
        phone?: string | null;
        street?: string | null;
        postalCode?: string | null;
        city?: string | null;
        country?: string | null;
        companyName?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        isApproved: boolean;
        customerId: string | null;
        needsProfileUpdate: boolean;
    }
}
