"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isApp =
        pathname?.startsWith("/dashboard") ||
        pathname?.startsWith("/auth") ||
        pathname?.startsWith("/editor");

    if (isApp) {
        return (
            <div className="flex-1 w-full flex flex-col">
                {children}
            </div>
        );
    }

    if (pathname !== "/") {
        return <>{children}</>;
    }

    return (
        <>
            <Header />
            <main className="flex-1 w-full flex flex-col pt-20">
                {children}
            </main>
            <Footer />
        </>
    );
}
