import {
  BadgeEuro,
  CalendarDays,
  HelpCircle,
  Home,
  Images,
  Receipt,
  ShieldCheck,
  Wand2,
} from "lucide-react";

import type { NavGroup } from "./types";

export function getPiximmoCustomerNavGroups(adminPreview: boolean): NavGroup[] {
  return [
    {
      items: [
        {
          title: "Übersicht",
          url: adminPreview ? "/dashboard?view=customer-preview" : "/dashboard",
          icon: Home,
        },
        { title: "Aufträge & Bilder", url: "/dashboard/galleries", icon: Images },
      ],
    },
    {
      label: "Auftrag & Leistungen",
      items: [
        { title: "Fototermin buchen", url: "/dashboard/bookings", icon: CalendarDays },
        { title: "Leistungen", url: "/dashboard/services", icon: Wand2 },
        { title: "Preise & Zusatzleistungen", url: "/dashboard/pricing", icon: BadgeEuro },
      ],
    },
    {
      label: "Konto & Hilfe",
      items: [
        { title: "Profil & Sicherheit", url: "/dashboard/profile", icon: ShieldCheck },
        { title: "Abrechnung", url: "/dashboard/billing", icon: Receipt },
        { title: "Hilfe", url: "/dashboard/help", icon: HelpCircle },
      ],
    },
  ];
}
