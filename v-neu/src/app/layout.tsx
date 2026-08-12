import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { siteConfig } from "@/lib/site-config";
import { getWebsiteContent } from "@/lib/website-content";
import { WebsiteContentProvider } from "@/components/website/WebsiteContentProvider";
import { PrivacyConsent } from "@/components/privacy/PrivacyConsent";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const structuredData = {
    "@context": "https://schema.org",
    "@type": ["ProfessionalService", "LocalBusiness"],
    name: siteConfig.brandName,
    url: "https://pix.immo",
    email: siteConfig.contactEmail,
    telephone: siteConfig.phoneDisplay,
    address: {
        "@type": "PostalAddress",
        streetAddress: "Kaiser-Wilhelm-Straße 47",
        postalCode: "20355",
        addressLocality: "Hamburg",
        addressCountry: "DE",
    },
    areaServed: {
        "@type": "City",
        name: "Hamburg",
    },
};

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://pix.immo"),
    title: {
        default: `${siteConfig.brandName} | Immobilienfotografie in Hamburg`,
        template: `%s`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.brandName,
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        locale: "de_DE",
        siteName: siteConfig.brandName,
        title: `${siteConfig.brandName} | Immobilienfotografie in Hamburg`,
        description: siteConfig.description,
        url: "/",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="de" className="h-full antialiased">
            <body className={`${inter.variable} flex flex-col min-h-screen font-sans relative`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
                <WebsiteContentProvider content={await getWebsiteContent("sitewide")}>
                    <LayoutWrapper>
                        {children}
                    </LayoutWrapper>
                    <PrivacyConsent measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
                </WebsiteContentProvider>
            </body>
        </html>
    );
}
