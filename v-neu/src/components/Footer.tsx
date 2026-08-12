"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { useWebsiteContent } from "@/components/website/WebsiteContentProvider";
import { PrivacySettingsLink } from "@/components/privacy/PrivacyConsent";

export function Footer() {
    const content = useWebsiteContent();
    return (
        <footer className="w-full bg-[#f8f9fa] py-16 px-6 md:px-12 flex justify-center font-sans mt-auto border-t border-gray-100">
            <div className="w-full max-w-[1000px]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-[13px] text-[#5c6574]">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-2">
                            <span className="font-bold text-gray-900 text-[14px]">{siteConfig.brandName}</span>
                            <span>{content.footerTagline}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <span className="font-bold text-gray-900 text-[14px] mb-1">{content.footerLinksTitle}</span>
                        <Link href="/portfolio" className="hover:text-gray-900 transition-colors">{content.navPortfolio}</Link>
                        <Link href="/blog" className="hover:text-gray-900 transition-colors">{content.navBlog}</Link>
                        <Link href="/kontakt" className="hover:text-gray-900 transition-colors">{content.navContact}</Link>
                        <Link href="/auth/signin" className="hover:text-gray-900 transition-colors">{content.navLogin}</Link>
                    </div>

                    <div className="flex flex-col gap-3">
                        <span className="font-bold text-gray-900 text-[14px] mb-1">{content.footerLegalTitle}</span>
                        <Link href="/impressum" className="hover:text-gray-900 transition-colors">{content.imprintLabel}</Link>
                        <Link href="/datenschutz" className="hover:text-gray-900 transition-colors">{content.privacyLabel}</Link>
                        <PrivacySettingsLink className="text-left hover:text-gray-900 transition-colors" />
                        <Link href="/agb" className="hover:text-gray-900 transition-colors">{content.termsLabel}</Link>
                    </div>
                </div>

                <div className="w-full h-[1px] bg-gray-200 mt-16 mb-6"></div>

                <div className="text-[11px] text-gray-400">
                    © 2026 {siteConfig.brandName}. {content.copyright}
                </div>
            </div>
        </footer>
    );
}
