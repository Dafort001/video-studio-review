"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useWebsiteContent } from "@/components/website/WebsiteContentProvider";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const content = useWebsiteContent();
    const navigation = [
        { href: "/portfolio", label: content.navPortfolio },
        { href: "/blog", label: content.navBlog },
        { href: "/kontakt", label: content.navContact },
        { href: "/auth/signin", label: content.navLogin },
    ];

    return (
        <header className="absolute top-0 left-0 w-full px-6 py-6 md:px-8 md:py-8 flex items-center justify-between bg-transparent z-50">
            <div className="flex flex-col items-start">
                <Link href="/">
                    <Logo size="sm" showText={true} className="[&_span]:text-[20px] [&_span]:font-semibold [&_span]:text-[#4A5568]" />
                </Link>
                <h1 className="mt-0.5 whitespace-nowrap text-[11px] font-normal leading-tight tracking-[0.01em] text-[#5c6574]">
                    Immobilienfotografie in Hamburg
                </h1>
            </div>

            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[#4A5568] hover:opacity-70 transition-opacity"
                aria-label="Menu"
            >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile/Compact Menu (Dropdown) */}
            {isMenuOpen && (
                <div className="absolute top-20 right-6 md:right-8 bg-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-xl border border-gray-100 py-6 min-w-[220px] flex flex-col items-center animate-in fade-in slide-in-from-top-4">
                    {navigation.map((item) => (
                        <Link key={item.href} href={item.href} className="w-full text-center py-3" onClick={() => setIsMenuOpen(false)}>
                            <span className="text-[15px] text-black font-medium hover:text-gray-500 transition-colors">{item.label}</span>
                        </Link>
                    ))}

                    <div className="w-2/3 h-[1px] bg-gray-200 my-4"></div>

                    <Link href="/impressum" className="w-full text-center py-2" onClick={() => setIsMenuOpen(false)}>
                        <span className="text-[13px] text-gray-500 hover:text-black transition-colors">{content.imprintLabel}</span>
                    </Link>
                    <Link href="/datenschutz" className="w-full text-center py-2" onClick={() => setIsMenuOpen(false)}>
                        <span className="text-[13px] text-gray-500 hover:text-black transition-colors">{content.privacyLabel}</span>
                    </Link>
                    <Link href="/agb" className="w-full text-center py-2" onClick={() => setIsMenuOpen(false)}>
                        <span className="text-[13px] text-gray-500 hover:text-black transition-colors">{content.termsLabel}</span>
                    </Link>
                </div>
            )}
        </header>
    );
}
