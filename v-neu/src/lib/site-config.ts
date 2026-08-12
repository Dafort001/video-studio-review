export const siteConfig = {
  brandName: "PIX.IMMO",
  domainLabel: "pix.immo",
  tagline: "Immobilienfotografie, Exposé-Erstellung und Kundenportal",
  description:
    "PIX.IMMO verbindet hochwertige Immobilienfotografie mit einem kuratierten Kundenportal für Auswahl, Nachbearbeitung und Exposé-Erstellung.",
  loginLabel: "Freigeschalteter Kundenzugang",
  approvalLabel: "Freischaltung nach Prüfung",
  contactEmail: "mail@pix.immo",
  supportEmail: "support@pix.immo",
  phoneDisplay: "+49 172 430 7071",
  phoneHref: "tel:+491724307071",
  city: "Hamburg",
  customerDashboardPath: "/dashboard",
  adminDashboardPath: "/dashboard/admin",
  consultationPath: "/kontakt",
  bookingPath: "/dashboard/bookings",
  addressLines: ["Daniel Fortmann", "Kaiser-Wilhelm-Straße 47", "20355 Hamburg", "Deutschland"],
  publicNavigation: [
    { href: "/portfolio", label: "Portfolio" },
    { href: "/blog", label: "Blog" },
    { href: "/kontakt", label: "Kontakt & Buchung" },
    { href: "/auth/signin", label: "Login" },
  ],
} as const;

export type PublicNavigationItem = (typeof siteConfig.publicNavigation)[number];
