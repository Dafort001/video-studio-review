import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site-config";

export type WebsiteFieldKind =
  | "text"
  | "textarea"
  | "markdown"
  | "seo-title"
  | "seo-description";

export type WebsiteField = {
  key: string;
  label: string;
  kind: WebsiteFieldKind;
  section: string;
  defaultValue: string;
  help?: string;
};

export type WebsitePageDefinition = {
  key: string;
  label: string;
  path: string;
  description: string;
  fields: WebsiteField[];
};

const seoFields = (title: string, description: string): WebsiteField[] => [
  {
    key: "seoTitle",
    label: "SEO-Titel",
    kind: "seo-title",
    section: "Suchmaschinen",
    defaultValue: title,
    help: "Idealerweise 50–60 Zeichen.",
  },
  {
    key: "seoDescription",
    label: "SEO-Beschreibung",
    kind: "seo-description",
    section: "Suchmaschinen",
    defaultValue: description,
    help: "Idealerweise 140–160 Zeichen.",
  },
];

export const websitePageDefinitions = [
  {
    key: "sitewide",
    label: "Navigation & Footer",
    path: "/",
    description:
      "Seitenübergreifende Beschriftungen für Hauptnavigation, Footer und Rechtlinks.",
    fields: [
      {
        key: "navPortfolio",
        label: "Portfolio",
        kind: "text",
        section: "Navigation",
        defaultValue: "Portfolio",
      },
      {
        key: "navBlog",
        label: "Blog",
        kind: "text",
        section: "Navigation",
        defaultValue: "Blog",
      },
      {
        key: "navContact",
        label: "Kontakt & Buchung",
        kind: "text",
        section: "Navigation",
        defaultValue: "Kontakt & Buchung",
      },
      {
        key: "navLogin",
        label: "Login",
        kind: "text",
        section: "Navigation",
        defaultValue: "Login",
      },
      {
        key: "backLabel",
        label: "Zurück-Link auf Unterseiten",
        kind: "text",
        section: "Navigation",
        defaultValue: "Zur Startseite",
      },
      {
        key: "footerLinksTitle",
        label: "Linkspalte – Überschrift",
        kind: "text",
        section: "Footer",
        defaultValue: "Links",
      },
      {
        key: "footerLegalTitle",
        label: "Rechtsspalte – Überschrift",
        kind: "text",
        section: "Footer",
        defaultValue: "Legal",
      },
      {
        key: "footerTagline",
        label: "Beschreibung unter dem Logo",
        kind: "textarea",
        section: "Footer",
        defaultValue: siteConfig.tagline,
      },
      {
        key: "imprintLabel",
        label: "Impressum",
        kind: "text",
        section: "Footer",
        defaultValue: "Impressum",
      },
      {
        key: "privacyLabel",
        label: "Datenschutz",
        kind: "text",
        section: "Footer",
        defaultValue: "Datenschutz",
      },
      {
        key: "termsLabel",
        label: "AGB",
        kind: "text",
        section: "Footer",
        defaultValue: "AGB",
      },
      {
        key: "copyright",
        label: "Copyright-Zusatz",
        kind: "text",
        section: "Footer",
        defaultValue: "Alle Rechte vorbehalten.",
      },
    ],
  },
  {
    key: "about",
    label: "Über uns",
    path: "/about",
    description: "Einführung, Leistungsprinzipien und SEO-Angaben.",
    fields: [
      {
        key: "badge",
        label: "Kennzeichnung",
        kind: "text",
        section: "Einleitung",
        defaultValue: "Immobilienfotografie mit Portalstruktur",
      },
      {
        key: "heading",
        label: "Überschrift",
        kind: "textarea",
        section: "Einleitung",
        defaultValue: `${siteConfig.brandName} verbindet Produktion, Auswahl und Exposé-Vorbereitung.`,
      },
      {
        key: "intro",
        label: "Einleitungstext",
        kind: "textarea",
        section: "Einleitung",
        defaultValue:
          "Das Portal führt freigeschaltete Kunden durch Buchung, Bildauswahl, Freigabe, Download und die spätere Vorbereitung von Exposé-Daten.",
      },
      {
        key: "feature1Title",
        label: "Karte 1 – Titel",
        kind: "text",
        section: "Leistungsprinzipien",
        defaultValue: "Aufnahme und Datenbasis",
      },
      {
        key: "feature1Text",
        label: "Karte 1 – Text",
        kind: "textarea",
        section: "Leistungsprinzipien",
        defaultValue:
          "Objektbilder, mobile Uploads und Pipeline-Daten werden so organisiert, dass sie später nachvollziehbar weiterverarbeitet werden können.",
      },
      {
        key: "feature2Title",
        label: "Karte 2 – Titel",
        kind: "text",
        section: "Leistungsprinzipien",
        defaultValue: "Kundenportal statt Streuliste",
      },
      {
        key: "feature2Text",
        label: "Karte 2 – Text",
        kind: "textarea",
        section: "Leistungsprinzipien",
        defaultValue:
          "Jeder Kunde sieht nur freigeschaltete Projekte, Leistungen und Ergebnisse. Admin- und Kundenbereich bleiben getrennte Arbeitsräume.",
      },
      {
        key: "feature3Title",
        label: "Karte 3 – Titel",
        kind: "text",
        section: "Leistungsprinzipien",
        defaultValue: "Verantwortung beim Makler",
      },
      {
        key: "feature3Text",
        label: "Karte 3 – Text",
        kind: "textarea",
        section: "Leistungsprinzipien",
        defaultValue:
          "Bildtexte und Exposé-Pakete bereiten vor. Fakten, Reihenfolge und finale Aussagen müssen vom Makler prüfbar bleiben.",
      },
      ...seoFields(
        `Über uns | ${siteConfig.brandName}`,
        `Erfahren Sie mehr über ${siteConfig.brandName}, Immobilienfotografie und das Kundenportal.`,
      ),
    ],
  },
  {
    key: "contact",
    label: "Kontakt",
    path: "/kontakt",
    description: "Kontakt-Einstieg, Ablauf und SEO-Angaben.",
    fields: [
      {
        key: "availabilityBadge",
        label: "Terminseite – Kennzeichnung",
        kind: "text",
        section: "Öffentliche Terminübersicht",
        defaultValue: "Immobilienfotografie · Hamburg und Umland",
      },
      {
        key: "availabilityHeading",
        label: "Terminseite – Überschrift",
        kind: "textarea",
        section: "Öffentliche Terminübersicht",
        defaultValue: "Sehen Sie einfach nach, ob es zeitlich passt.",
      },
      {
        key: "availabilityIntro",
        label: "Terminseite – Einleitung",
        kind: "textarea",
        section: "Öffentliche Terminübersicht",
        defaultValue:
          "Ich bin seit 30 Jahren Fotograf und arbeite heute vor allem für Makler, Unternehmen und private Eigentümer im Großraum Hamburg, die ein Objekt verkaufen oder vermieten möchten. Ob ein Termin frei ist, sehen Sie direkt im Kalender – ohne Anmeldung und ohne Verpflichtung. Wenn Sie vorher lieber kurz sprechen möchten, melden Sie sich gern.",
      },
      {
        key: "badge",
        label: "Kennzeichnung",
        kind: "text",
        section: "Einleitung",
        defaultValue: "Persönliche Beratung",
      },
      {
        key: "heading",
        label: "Überschrift",
        kind: "textarea",
        section: "Einleitung",
        defaultValue: "Neue Kunden starten mit einem kurzen Gespräch.",
      },
      {
        key: "intro",
        label: "Einleitungstext",
        kind: "textarea",
        section: "Einleitung",
        defaultValue:
          "Schicken Sie uns Adresse, Objektart und den gewünschten Vermarktungszeitraum. Danach klären wir den passenden Leistungs- und Buchungsweg.",
      },
      {
        key: "step1",
        label: "Schritt 1",
        kind: "textarea",
        section: "Ablauf",
        defaultValue: "Sie schicken kurz Adresse, Objektart und den gewünschten Vermarktungszeitraum.",
      },
      {
        key: "step2",
        label: "Schritt 2",
        kind: "textarea",
        section: "Ablauf",
        defaultValue: "Wir klären Umfang, Zugang, Ansprechpartner und den passenden Produktionsweg.",
      },
      {
        key: "step3",
        label: "Schritt 3",
        kind: "textarea",
        section: "Ablauf",
        defaultValue: "Danach erfolgen Freischaltung, Terminierung und die weitere Arbeit im Kundenportal.",
      },
      {
        key: "customerHeading",
        label: "Kundenbox – Überschrift",
        kind: "text",
        section: "Kundenbox",
        defaultValue: "Bereits Kunde?",
      },
      {
        key: "customerText",
        label: "Kundenbox – Text",
        kind: "textarea",
        section: "Kundenbox",
        defaultValue:
          "Dann können Sie direkt in Ihr freigeschaltetes Kundenkonto wechseln und dort Leistungen, Preise, Projekte und Freigaben verwalten.",
      },
      ...seoFields(
        `Immobilienfotograf Hamburg – Termine | ${siteConfig.brandName}`,
        `Freie Termine für professionelle Immobilienfotografie in Hamburg prüfen, 15 Minuten vormerken und nach dem Login verbindlich buchen.`,
      ),
    ],
  },
  {
    key: "booking",
    label: "Buchung & Preise",
    path: "/buchung",
    description: "Öffentlicher Einstieg in die Buchung. Leistungen und Preise selbst bleiben im Kundenablauf.",
    fields: [
      {
        key: "badge",
        label: "Kennzeichnung",
        kind: "text",
        section: "Einleitung",
        defaultValue: "Buchung mit Preisübersicht",
      },
      {
        key: "heading",
        label: "Überschrift",
        kind: "textarea",
        section: "Einleitung",
        defaultValue: "Leistungen auswählen, Preise sehen und den passenden Termin anfragen.",
      },
      {
        key: "intro",
        label: "Einleitungstext",
        kind: "textarea",
        section: "Einleitung",
        defaultValue:
          "Im Kundenportal stehen Leistungsauswahl, Preisübersicht und Terminierung in einem gemeinsamen Ablauf. So bleiben Objektkontext, Ansprechpartner und Folgeprozesse zusammen.",
      },
      {
        key: "card1Title",
        label: "Karte 1 – Titel",
        kind: "text",
        section: "Buchungsablauf",
        defaultValue: "Leistungen und Preise",
      },
      {
        key: "card1Text",
        label: "Karte 1 – Text",
        kind: "textarea",
        section: "Buchungsablauf",
        defaultValue:
          "Sie sehen den Preis direkt bei der jeweiligen Leistung und erhalten vor dem Absenden eine gemeinsame Übersicht.",
      },
      {
        key: "card2Title",
        label: "Karte 2 – Titel",
        kind: "text",
        section: "Buchungsablauf",
        defaultValue: "Termin mit Objektlogik",
      },
      {
        key: "card2Text",
        label: "Karte 2 – Text",
        kind: "textarea",
        section: "Buchungsablauf",
        defaultValue:
          "Adresse, Objektart, Lichtfenster, Reisezeit und besondere Hinweise werden gemeinsam mit dem Termin erfasst.",
      },
      {
        key: "card3Title",
        label: "Karte 3 – Titel",
        kind: "text",
        section: "Buchungsablauf",
        defaultValue: "Ein verbindlicher Überblick",
      },
      {
        key: "card3Text",
        label: "Karte 3 – Text",
        kind: "textarea",
        section: "Buchungsablauf",
        defaultValue:
          "Die gewählten Leistungen und die voraussichtlichen Kosten bleiben bis zur Buchungsanfrage nachvollziehbar.",
      },
      {
        key: "ctaHeading",
        label: "Abschluss – Überschrift",
        kind: "text",
        section: "Abschluss",
        defaultValue: "Neu hier oder bereits freigeschaltet?",
      },
      {
        key: "ctaText",
        label: "Abschluss – Text",
        kind: "textarea",
        section: "Abschluss",
        defaultValue:
          "Neukunden starten über Kontakt und Freischaltung. Bestehende Kunden können direkt zum Login und dort Leistungen, Preise und Buchungsoptionen sehen.",
      },
      ...seoFields(
        `Buchung und Preise | ${siteConfig.brandName}`,
        `Leistungen auswählen, Preise überblicken und Immobilienfotografie bei ${siteConfig.brandName} buchen.`,
      ),
    ],
  },
  {
    key: "blog",
    label: "Blog",
    path: "/blog",
    description: "Einleitung des Blogs und SEO-Angaben. Beiträge werden weiterhin im Blog-Editor gepflegt.",
    fields: [
      {
        key: "badge",
        label: "Kennzeichnung",
        kind: "text",
        section: "Einleitung",
        defaultValue: "Journal",
      },
      {
        key: "heading",
        label: "Überschrift",
        kind: "text",
        section: "Einleitung",
        defaultValue: "Blog",
      },
      {
        key: "intro",
        label: "Einleitungstext",
        kind: "textarea",
        section: "Einleitung",
        defaultValue: "Notizen zu Vorbereitung, Vermarktung und dem Kundenportal hinter PIX.IMMO.",
      },
      ...seoFields(
        `Blog | ${siteConfig.brandName}`,
        `Praxiswissen zu Immobilienfotografie, Vorbereitung, Vermarktung und dem ${siteConfig.brandName} Kundenportal.`,
      ),
    ],
  },
  {
    key: "portfolio",
    label: "Portfolio",
    path: "/portfolio",
    description: "Einleitung, Leistungsüberblick und SEO-Angaben. Medien werden in der Mediathek gepflegt.",
    fields: [
      {
        key: "badge",
        label: "Kennzeichnung",
        kind: "text",
        section: "Einleitung",
        defaultValue: "Portfolio · Immobilienfotografie Hamburg",
      },
      {
        key: "heading",
        label: "Überschrift",
        kind: "textarea",
        section: "Einleitung",
        defaultValue: "Licht, Proportion, Atmosphäre.",
      },
      {
        key: "intro",
        label: "Einleitungstext",
        kind: "textarea",
        section: "Einleitung",
        defaultValue:
          "Ich fotografiere Immobilien – vom Innenraum über die Architektur bis zum Detail, das ein Haus unverwechselbar macht. Ergänzend Video, Luftaufnahmen und virtuelle Rundgänge für Verkauf und Vermietung.",
      },
      ...seoFields(
        `Immobilienfotografie Hamburg – Portfolio | ${siteConfig.brandName}`,
        `Portfolio für Immobilienfotografie in Hamburg: Innenräume, Architektur, Video, Drohne und virtuelle Objektpräsentationen für Verkauf und Vermietung.`,
      ),
    ],
  },
  {
    key: "support",
    label: "Support",
    path: "/support",
    description: "Support-Einstieg, Antwortzeit und benötigte Angaben.",
    fields: [
      {
        key: "badge",
        label: "Kennzeichnung",
        kind: "text",
        section: "Einleitung",
        defaultValue: `${siteConfig.brandName} Support`,
      },
      {
        key: "heading",
        label: "Überschrift",
        kind: "textarea",
        section: "Einleitung",
        defaultValue: "Wir helfen Ihnen weiter, wenn im Portal oder in der App etwas hakt.",
      },
      {
        key: "intro",
        label: "Einleitungstext",
        kind: "textarea",
        section: "Einleitung",
        defaultValue:
          "Wenn Sie Fragen zu PIX.IMMO haben, Hilfe beim Upload benötigen oder einen Fehler melden möchten, können Sie uns direkt schreiben.",
      },
      {
        key: "responseTime",
        label: "Antwortzeit",
        kind: "textarea",
        section: "Support-Angaben",
        defaultValue: "Wir bemühen uns, Support-Anfragen werktags innerhalb von 1 bis 2 Werktagen zu beantworten.",
      },
      {
        key: "helpTitle",
        label: "Hilfeblock – Überschrift",
        kind: "text",
        section: "Support-Angaben",
        defaultValue: "So können wir am schnellsten helfen",
      },
      {
        key: "helpText",
        label: "Hilfeblock – Text",
        kind: "textarea",
        section: "Support-Angaben",
        defaultValue:
          "Bitte senden Sie nach Möglichkeit gleich Ihr Gerätemodell, die Betriebssystemversion, die App-Version und eine kurze Fehlerbeschreibung mit. Screenshots und der ungefähre Zeitpunkt helfen bei der Prüfung.",
      },
      ...seoFields(
        `Support | ${siteConfig.brandName}`,
        `Hilfe und Support für das ${siteConfig.brandName} Kundenportal, Uploads und die mobile App.`,
      ),
    ],
  },
  {
    key: "imprint",
    label: "Impressum",
    path: "/impressum",
    description: "Rechtstext. Änderungen sollten vor Veröffentlichung rechtlich geprüft werden.",
    fields: [
      {
        key: "heading",
        label: "Seitentitel",
        kind: "text",
        section: "Impressum",
        defaultValue: "Impressum",
      },
      {
        key: "responsibleTitle",
        label: "Anbieter – Überschrift",
        kind: "text",
        section: "Impressum",
        defaultValue: "Verantwortlich gemäß § 5 DDG und § 18 Abs. 2 MStV",
      },
      {
        key: "responsibleBody",
        label: "Anbieter – Inhalt",
        kind: "textarea",
        section: "Impressum",
        defaultValue:
          "Daniel Fortmann\nKaiser-Wilhelm-Straße 47\n20355 Hamburg\nDeutschland\n\nE-Mail: mail@pix.immo\nUSt-IdNr.: DE117975393",
      },
      {
        key: "disputeTitle",
        label: "Streitbeilegung – Überschrift",
        kind: "text",
        section: "Weitere Angaben",
        defaultValue: "Streitbeilegung",
      },
      {
        key: "disputeBody",
        label: "Streitbeilegung – Inhalt",
        kind: "textarea",
        section: "Weitere Angaben",
        defaultValue:
          "Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.\n\nPlattform der EU-Kommission zur Online-Streitbeilegung (OS): https://ec.europa.eu/consumers/odr/",
      },
      {
        key: "tdmTitle",
        label: "TDM-Vorbehalt – Überschrift",
        kind: "text",
        section: "Weitere Angaben",
        defaultValue: "Vorbehalt gemäß § 44b UrhG – Text- und Data-Mining (TDM)",
      },
      {
        key: "tdmBody",
        label: "TDM-Vorbehalt – Inhalt",
        kind: "textarea",
        section: "Weitere Angaben",
        defaultValue:
          "PIX.IMMO, vertreten durch Daniel Fortmann, behält sich die Nutzung sämtlicher Inhalte dieser Website zum Zweck des kommerziellen Text- und Data-Minings im Sinne von § 44b UrhG ausdrücklich vor.\n\nFür Nutzungslizenzen kontaktieren Sie uns bitte unter mail@pix.immo.\n\nEnglish translation: PIX.IMMO, represented by Daniel Fortmann, expressly reserves the right to use all content on this website for the purpose of commercial text and data mining within the meaning of Section 44b of the German Copyright Act (UrhG). For usage licenses, please contact mail@pix.immo.",
      },
      {
        key: "liabilityTitle",
        label: "Haftung – Überschrift",
        kind: "text",
        section: "Weitere Angaben",
        defaultValue: "Haftungsausschluss",
      },
      {
        key: "liabilityBody",
        label: "Haftung – Inhalt",
        kind: "textarea",
        section: "Weitere Angaben",
        defaultValue:
          "Haftung für Inhalte: Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.\n\nHaftung für Links: Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.",
      },
      ...seoFields(
        `Impressum | ${siteConfig.brandName}`,
        `Impressum und Anbieterkennzeichnung von ${siteConfig.brandName}.`,
      ),
    ],
  },
  {
    key: "terms",
    label: "AGB",
    path: "/agb",
    description: "Allgemeine Geschäftsbedingungen. Änderungen sollten rechtlich geprüft werden.",
    fields: [
      {
        key: "heading",
        label: "Seitentitel",
        kind: "text",
        section: "Einleitung",
        defaultValue: "Allgemeine Geschäftsbedingungen",
      },
      {
        key: "intro",
        label: "Einleitung",
        kind: "textarea",
        section: "Einleitung",
        defaultValue: "Allgemeine Geschäftsbedingungen für die Nutzung des PIX.IMMO Kundenportals.",
      },
      ...legalSection(
        "section1",
        "§ 1 Geltungsbereich und Anbieter",
        "(1) Diese Allgemeinen Geschäftsbedingungen regeln die Nutzung des PIX.IMMO Kundenportals durch registrierte oder sich registrierende Kunden der Plattform pix.immo.\n\n(2) Anbieter und Verantwortlicher im Sinne dieser AGB ist\nDaniel Fortmann – pix.immo,\nvertreten durch den Inhaber,\nE-Mail: mail@pix.immo,\nAnschrift: Kaiser-Wilhelm-Straße 47, 20355 Hamburg.\n\n(3) Die App richtet sich ausschließlich an natürliche oder juristische Personen, die im Rahmen der Immobilienfotografie, -vermarktung oder -dokumentation Leistungen von pix.immo in Anspruch nehmen oder dies beabsichtigen.",
      ),
      ...legalSection(
        "section2",
        "§ 2 Vertragsgegenstand",
        "(1) Gegenstand dieser Nutzungsbedingungen ist die Bereitstellung einer technischen Anwendung, mit der der Nutzer Bild- und ggf. Videodateien (nachfolgend „Inhalte“) im Zusammenhang mit bestehenden oder zukünftigen Aufträgen an pix.immo hochladen kann.\n\n(2) Die App dient ausschließlich der Datenübermittlung und -verwaltung. Über die App können keine automatisierten Buchungen oder Vertragsabschlüsse im rechtlichen Sinne vorgenommen werden; diese erfolgen gesondert.\n\n(3) Die Nutzung der App für Fotografen setzt eine vorherige Registrierung oder Authentifizierung voraus, Kunden nutzen Zugangslinks.",
      ),
      ...legalSection(
        "section3",
        "§ 3 Nutzerpflichten und Verantwortlichkeit für Inhalte",
        "(1) Der Nutzer ist verpflichtet, nur solche Inhalte hochzuladen, für deren Nutzung und Weitergabe er über die erforderlichen Rechte verfügt.\n\n(2) Der Nutzer verpflichtet sich, keine rechtswidrigen, diskriminierenden, urheberrechtsverletzenden oder ungewollten personenbezogenen Inhalte hochzuladen.\n\n(3) Der Nutzer stellt den Anbieter von sämtlichen Ansprüchen Dritter frei, die aus einer Verletzung dieser Pflichten resultieren.\n\n(4) Die Übermittlung personenbezogener Daten Dritter (z. B. Personenabbildungen) ist nur zulässig, soweit diese zuvor wirksam in die Verarbeitung eingewilligt haben oder ein berechtigtes Interesse i. S. d. Art. 6 Abs. 1 lit. f DSGVO besteht.",
      ),
      ...legalSection(
        "section4",
        "§ 4 Technische Bereitstellung und Verfügbarkeit",
        "(1) Der Anbieter betreibt die App in Zusammenarbeit mit technischen Dienstleistern, die Infrastruktur-, Speicher- und Sicherheitsleistungen bereitstellen.\n\n(2) Es besteht kein Anspruch auf eine ununterbrochene oder fehlerfreie Verfügbarkeit der App. Wartungsarbeiten, Sicherheits-Updates und externe Netzwerkbedingungen können die Nutzung zeitweise einschränken.\n\n(3) Der Anbieter behält sich das Recht vor, die App jederzeit zu ändern, einzuschränken oder einzustellen, sofern dies dem Nutzer zumutbar ist oder berechtigte Interessen des Anbieters dies erfordern.",
      ),
      ...legalSection(
        "section5",
        "§ 5 Datenschutz",
        "(1) Die Verarbeitung personenbezogener Daten erfolgt im Einklang mit der Datenschutzerklärung von PIX.IMMO, die unter /datenschutz abrufbar ist.\n\n(2) Die übermittelten Inhalte werden auf Servern externer Partner gespeichert und verarbeitet. Dabei werden teilweise anonymisierte Dateibezeichnungen verwendet, um Rückschlüsse auf Personen oder Adressen zu vermeiden.\n\n(3) Die Datenverarbeitung erfolgt ausschließlich zur Auftragserfüllung, Qualitätssicherung und Nachbearbeitung der hochgeladenen Medien. Eine Weitergabe an Dritte erfolgt nicht, sofern keine gesetzliche Verpflichtung besteht.\n\n(4) Der Nutzer kann die Löschung seiner Inhalte jederzeit nach Abschluss eines Auftrags verlangen, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.",
      ),
      ...legalSection(
        "section6",
        "§ 6 Haftung und Gewährleistung",
        "(1) Der Anbieter haftet uneingeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit, die auf einer vorsätzlichen oder grob fahrlässigen Pflichtverletzung beruhen.\n\n(2) Im Übrigen ist die Haftung auf Vorsatz und grobe Fahrlässigkeit beschränkt. Eine Haftung für mittelbare oder Folgeschäden, insbesondere Datenverluste oder Nutzungsausfälle, wird ausgeschlossen, soweit gesetzlich zulässig.\n\n(3) Der Anbieter übernimmt keine Gewähr für die dauerhafte Verfügbarkeit oder Fehlerfreiheit der App oder für die Eignung der App für bestimmte Zwecke außerhalb der vorgesehenen Nutzung.",
      ),
      ...legalSection(
        "section7",
        "§ 7 Schlussbestimmungen",
        "(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.\n\n(2) Sollten einzelne Bestimmungen dieser AGB unwirksam oder undurchführbar sein, bleibt die Gültigkeit der übrigen Bestimmungen hiervon unberührt.\n\n(3) Gerichtsstand ist Hamburg, soweit gesetzlich zulässig.",
      ),
      {
        key: "version",
        label: "Stand",
        kind: "text",
        section: "Abschluss",
        defaultValue: "Stand: November 2025",
      },
      ...seoFields(
        `AGB | ${siteConfig.brandName}`,
        `Allgemeine Geschäftsbedingungen für das ${siteConfig.brandName} Kundenportal.`,
      ),
    ],
  },
  {
    key: "privacy",
    label: "Datenschutz",
    path: "/datenschutz",
    description: "Datenschutzerklärung. Änderungen sollten rechtlich geprüft werden.",
    fields: [
      {
        key: "heading",
        label: "Seitentitel",
        kind: "text",
        section: "Einleitung",
        defaultValue: "Datenschutzerklärung",
      },
      ...legalSection(
        "section1",
        "1. Verantwortlicher",
        "Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:\n\nDaniel Fortmann – pix.immo\nE-Mail: mail@pix.immo\nKaiser-Wilhelm-Straße 47, 20355 Hamburg",
      ),
      ...legalSection(
        "section2",
        "2. Zweck des Angebots",
        "PIX.IMMO dient der Präsentation von Immobilienfotografie, der Terminvorbereitung sowie der sicheren Übermittlung und Verwaltung von Bild- und Videodateien im Zusammenhang mit Aufträgen oder geplanten Aufträgen.\n\nEine Nutzung zu Werbe- oder Social-Media-Trackingzwecken findet nicht statt. Eine optionale Reichweitenmessung der öffentlichen Website mit Google Analytics 4 erfolgt nur nach ausdrücklicher Einwilligung und bleibt davon getrennt.",
      ),
      ...legalSection(
        "section3",
        "3. Arten der verarbeiteten Daten",
        "Im Rahmen der Nutzung werden folgende Datenarten verarbeitet:\n\nGerätedaten (Modell, Betriebssystemversion, App-Version)\nLogin- und Kontoinformationen (E-Mail, Kunden-ID)\nHochgeladene Medieninhalte (Fotos, Videos)\nTechnische Metadaten (Dateiname, Dateigröße, Upload-Zeitpunkt)\nFehler- und Protokolldaten zur App-Stabilität",
      ),
      ...legalSection(
        "section4",
        "4. Rechtsgrundlagen",
        "Die Datenverarbeitung erfolgt auf Grundlage von\n\nArt. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung oder vorvertragliche Maßnahmen),\nArt. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherer und effizienter Datenübermittlung),\nsowie ggf. Art. 6 Abs. 1 lit. a DSGVO (Einwilligung, z. B. bei freiwilligen Uploads ohne bestehenden Vertrag).",
      ),
      ...legalSection(
        "section5",
        "5. Speicherung und technische Dienstleister",
        "Die Daten werden über gesicherte Verbindungen auf Servern der Cloudflare Inc., 101 Townsend Street, San Francisco, CA 94107, USA verarbeitet und gespeichert.\n\nCloudflare bietet Dienste im Bereich CDN, Edge-Computing und Datenspeicherung (R2).\n\nDie Speicherung erfolgt mit anonymisierten Dateinamen (z. B. wohnzimmer_01.jpg), um Rückschlüsse auf Personen oder Adressen zu vermeiden.\n\nMit Cloudflare besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO.",
      ),
      ...legalSection(
        "storage",
        "Cookies und ähnliche Speichertechniken",
        "PIX.IMMO verwendet technisch notwendige Cookies sowie lokalen Browser-Speicher. Auth.js setzt im Login- und Portalbereich Sicherheits-, Weiterleitungs- und Sitzungscookies. Das Cookie piximmo_booking_hold reserviert einen ausdrücklich gewählten Termin für 15 Minuten. Das Cookie piximmo_beta_admin ermöglicht den gesonderten Beta-Adminzugang für höchstens 12 Stunden. sidebar_state speichert die Portalnavigation für bis zu sieben Tage. piximmo_privacy_consent speichert die gewählte Datenschutz-Einstellung im lokalen Browser-Speicher, bis sie geändert wird oder eine neue Einwilligungsversion erforderlich ist. Temporärer Sitzungs- oder lokaler Speicher hält nur angeforderte Galeriehinweise und wiederaufnehmbare Admin-Uploads vor.\n\nDiese notwendigen Speicherungen stützen sich auf § 25 Abs. 2 Nr. 2 TDDDG. Soweit dabei personenbezogene Daten verarbeitet werden, erfolgt dies insbesondere nach Art. 6 Abs. 1 lit. b oder lit. f DSGVO.\n\nSofern Google Analytics 4 auf dieser Website aktiviert ist, wird es erst nach einer ausdrücklichen Einwilligung geladen. Anbieter ist Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Erfasst werden insbesondere der aufgerufene Seitenpfad ohne URL-Abfrageparameter, Seitentitel, Zeitpunkt, Referrer sowie technische Browser- und Geräteangaben. Es werden keine PIX.IMMO-Konto-, Buchungs-, Galerie- oder Auftragskennungen an Google Analytics übergeben. Google-Signale und Werbepersonalisierung sind deaktiviert.\n\nGoogle Analytics setzt nach Einwilligung regelmäßig die Cookies _ga und _ga_<Mess-ID> mit einer Regellaufzeit von bis zu zwei Jahren. Google verarbeitet IP-Adressen aus der EU nach eigener Angabe nur zur groben Standortableitung und verwirft sie vor der Protokollierung. Eine Verarbeitung durch Google-Unternehmen in Drittländern kann nicht vollständig ausgeschlossen werden.\n\nRechtsgrundlage ist ausschließlich die Einwilligung gemäß § 25 Abs. 1 TDDDG und Art. 6 Abs. 1 lit. a DSGVO. Sie kann jederzeit über „Cookie-Einstellungen“ im Footer mit Wirkung für die Zukunft widerrufen werden. Ohne Einwilligung wird kein Google-Analytics-Skript geladen und es werden keine Analytics-Daten an Google gesendet.\n\nFür die vorübergehende direkte Terminbuchung kann auf der Kontaktseite der externe Dienst TidyCal eingebunden werden. Anbieter ist Sumo Group Inc. (d/b/a TidyCal), USA. Der Terminplaner wird nicht automatisch geladen. Erst nach einem ausdrücklichen Klick auf „Terminplaner laden“ wird eine Verbindung zu tidycal.com hergestellt. Dabei können insbesondere IP-Adresse, technische Geräteangaben sowie die von Ihnen im Buchungsformular eingegebenen Kontakt- und Termindaten verarbeitet und in die verbundene Kalenderumgebung übernommen werden. Eine Verarbeitung in den USA kann nicht ausgeschlossen werden. Rechtsgrundlage für das Laden ist Ihre Einwilligung gemäß § 25 Abs. 1 TDDDG und Art. 6 Abs. 1 lit. a DSGVO; für die anschließend von Ihnen angeforderte Terminbearbeitung gilt Art. 6 Abs. 1 lit. b DSGVO. Ohne Ihren Klick wird keine Verbindung zu TidyCal aufgebaut.",
      ),
      ...legalSection(
        "section6",
        "6. Speicherdauer",
        "Die hochgeladenen Inhalte werden für die Dauer der Auftragsabwicklung gespeichert und anschließend gelöscht oder anonymisiert, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.\n\nFehler- und Logdaten werden regelmäßig nach 30 Tagen gelöscht.",
      ),
      ...legalSection(
        "section7",
        "7. Rechte betroffener Personen",
        "Nutzer haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO) sowie Widerspruch gegen die Verarbeitung (Art. 21 DSGVO).\n\nAnfragen können per E-Mail an mail@pix.immo gestellt werden.",
      ),
      ...legalSection(
        "section8",
        "8. Datensicherheit",
        "Die Web-App verwendet HTTPS-Verbindungen mit TLS-Verschlüsselung.\n\nDaten werden während der Übertragung verschlüsselt und durch Zugriffskontrollen geschützt.\n\nDer Zugriff auf Inhalte ist nur für autorisierte Mitarbeiter von pix.immo möglich.",
      ),
      ...legalSection(
        "section9",
        "9. Änderungen dieser Datenschutzerklärung",
        "Diese Datenschutzerklärung kann aufgrund technischer, organisatorischer oder rechtlicher Entwicklungen angepasst werden.\n\nDie jeweils aktuelle Fassung ist in der App und auf der Website pix.immo abrufbar.",
      ),
      ...legalSection(
        "section10",
        "10. Geltendes Recht",
        "Es gilt das Recht der Bundesrepublik Deutschland.\n\nGerichtsstand ist Hamburg, soweit gesetzlich zulässig.",
      ),
      {
        key: "version",
        label: "Stand",
        kind: "text",
        section: "Abschluss",
        defaultValue: "Stand: 2. August 2026",
      },
      ...seoFields(
        `Datenschutz | ${siteConfig.brandName}`,
        `Datenschutzerklärung für Website, Kundenportal und Dienste von ${siteConfig.brandName}.`,
      ),
    ],
  },
] as const satisfies readonly WebsitePageDefinition[];

export type WebsitePageKey = (typeof websitePageDefinitions)[number]["key"];
export type WebsiteContentValues = Record<string, string>;

const STORAGE_PREFIX = "website:piximmo:";
const FIELD_PREFIX = "field:";

export function getWebsitePageDefinition(pageKey: string) {
  return websitePageDefinitions.find((page) => page.key === pageKey) ?? null;
}

export async function getWebsiteContent(pageKey: WebsitePageKey): Promise<WebsiteContentValues> {
  const definition = getWebsitePageDefinition(pageKey);
  if (!definition) return {};

  const defaults = Object.fromEntries(definition.fields.map((field) => [field.key, field.defaultValue]));

  try {
    const entries = await prisma.marketingContent.findMany({
      where: {
        page: `${STORAGE_PREFIX}${pageKey}`,
        type: { startsWith: FIELD_PREFIX },
        isActive: true,
      },
      select: { type: true, url: true },
    });

    for (const entry of entries) {
      const key = entry.type.slice(FIELD_PREFIX.length);
      if (key in defaults) defaults[key] = entry.url;
    }
  } catch (error) {
    console.error(`[website-content] Could not load ${pageKey}:`, error);
  }

  return defaults;
}

export async function getWebsiteMetadata(pageKey: WebsitePageKey): Promise<Metadata> {
  const definition = getWebsitePageDefinition(pageKey);
  const content = await getWebsiteContent(pageKey);
  const title = content.seoTitle || definition?.label || siteConfig.brandName;
  const description = content.seoDescription || siteConfig.description;
  const canonical = definition?.path || "/";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "de_DE",
      siteName: siteConfig.brandName,
      title,
      description,
      url: canonical,
    },
  };
}

export function websiteContentStorage(pageKey: string, fieldKey: string) {
  return {
    page: `${STORAGE_PREFIX}${pageKey}`,
    type: `${FIELD_PREFIX}${fieldKey}`,
  };
}

function legalSection(key: string, title: string, body: string): WebsiteField[] {
  return [
    {
      key: `${key}Title`,
      label: `${title} – Überschrift`,
      kind: "text",
      section: title,
      defaultValue: title,
    },
    {
      key: `${key}Body`,
      label: `${title} – Inhalt`,
      kind: "textarea",
      section: title,
      defaultValue: body,
    },
  ];
}
