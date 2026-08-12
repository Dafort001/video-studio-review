"use client";

import Script from "next/script";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "piximmo_privacy_consent";
const OPEN_SETTINGS_EVENT = "piximmo:open-privacy-settings";
const ESSENTIAL_VERSION = "essential-v1";
const ANALYTICS_VERSION = "analytics-v1";

type StoredConsent = {
  version: string;
  analytics: boolean;
  decidedAt: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function PrivacyConsent({ measurementId }: { measurementId?: string }) {
  const pathname = usePathname();
  const validMeasurementId = useMemo(
    () => (/^G-[A-Z0-9]+$/i.test(measurementId ?? "") ? measurementId : undefined),
    [measurementId],
  );
  const consentVersion = validMeasurementId ? ANALYTICS_VERSION : ESSENTIAL_VERSION;
  const analyticsRouteAllowed = isPublicAnalyticsPath(pathname);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = readStoredConsent();
      if (stored?.version === consentVersion) {
        setAnalyticsAllowed(Boolean(validMeasurementId && stored.analytics));
      } else {
        setVisible(true);
      }
      setReady(true);
    });

    const openSettings = () => setVisible(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, openSettings);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(OPEN_SETTINGS_EVENT, openSettings);
    };
  }, [consentVersion, validMeasurementId]);

  useEffect(() => {
    if (visible) panelRef.current?.focus();
  }, [visible]);

  useEffect(() => {
    if (ready && analyticsAllowed) updateGoogleConsent(analyticsRouteAllowed);
  }, [analyticsAllowed, analyticsRouteAllowed, ready]);

  const saveConsent = (allowAnalytics: boolean) => {
    const analytics = Boolean(validMeasurementId && allowAnalytics);
    const consent: StoredConsent = {
      version: consentVersion,
      analytics,
      decidedAt: new Date().toISOString(),
    };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      // The decision still applies to the current page when storage is unavailable.
    }

    updateGoogleConsent(analytics && analyticsRouteAllowed);
    if (!analytics) clearGoogleAnalyticsCookies();
    setAnalyticsAllowed(analytics);
    setVisible(false);
  };

  if (!ready) return null;

  return (
    <>
      {validMeasurementId && analyticsAllowed && analyticsRouteAllowed && (
        <GoogleAnalytics measurementId={validMeasurementId} />
      )}

      {visible && (
        <aside
          ref={panelRef}
          tabIndex={-1}
          role="region"
          aria-label="Datenschutz-Einstellungen"
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-2xl border border-[#d8d2c8] bg-[#fffdf9] p-5 text-[#25231f] shadow-[0_20px_70px_rgba(52,45,35,0.24)] outline-none sm:p-6"
        >
          <h2 className="text-lg font-bold">Cookies & Datenschutz</h2>
          <p className="mt-2 text-sm leading-6 text-[#666057]">
            {validMeasurementId
              ? "Notwendige Speicherungen sichern Login, Terminreservierung und Ihre Einstellungen. Mit Ihrer Einwilligung hilft uns Google Analytics zusätzlich zu verstehen, welche öffentlichen Seiten hilfreich sind. Statistik bleibt bis zu Ihrer Auswahl ausgeschaltet."
              : "Wir verwenden derzeit nur Speicherungen, die für Login, Terminreservierung, Sicherheit und angeforderte Abläufe notwendig sind. Analyse- oder Marketing-Cookies setzen wir nicht ein."}
          </p>

          <div className="mt-4 grid gap-2 text-xs text-[#666057] sm:grid-cols-2">
            <div className="rounded-xl border border-[#ded8cf] bg-white px-3 py-2.5">
              <strong className="block text-[#25231f]">Notwendig · immer aktiv</strong>
              Login, Sicherheit und Terminreservierung
            </div>
            {validMeasurementId && (
              <div className="rounded-xl border border-[#ded8cf] bg-white px-3 py-2.5">
                <strong className="block text-[#25231f]">Statistik · optional</strong>
                Google Analytics 4
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link className="text-sm font-medium underline underline-offset-4" href="/datenschutz">
              Datenschutzerklärung
            </Link>
            <div className="grid gap-2 sm:grid-flow-col">
              {validMeasurementId ? (
                <>
                  <button
                    type="button"
                    onClick={() => saveConsent(false)}
                    className="min-h-11 rounded-xl border border-[#25231f] bg-[#25231f] px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-85"
                  >
                    Nur notwendige
                  </button>
                  <button
                    type="button"
                    onClick={() => saveConsent(true)}
                    className="min-h-11 rounded-xl border border-[#25231f] bg-[#25231f] px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-85"
                  >
                    Alle akzeptieren
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => saveConsent(false)}
                  className="min-h-11 rounded-xl border border-[#25231f] bg-[#25231f] px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-85"
                >
                  Verstanden
                </button>
              )}
            </div>
          </div>
        </aside>
      )}
    </>
  );
}

export function PrivacySettingsLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT))}
    >
      Cookie-Einstellungen
    </button>
  );
}

function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    window.gtag?.("event", "page_view", {
      page_location: `${window.location.origin}${pathname}`,
      page_path: pathname,
      page_title: document.title,
    });
  }, [measurementId, pathname]);

  const initialization = `
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
window.gtag('consent', 'default', {
  analytics_storage: 'granted',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});
window.gtag('js', new Date());
window.gtag('config', ${JSON.stringify(measurementId)}, {
  send_page_view: false,
  allow_google_signals: false,
  allow_ad_personalization_signals: false
});
`;

  return (
    <>
      <Script id="piximmo-ga-consent" strategy="afterInteractive">
        {initialization}
      </Script>
      <Script
        id="piximmo-ga4"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
      />
    </>
  );
}

function readStoredConsent(): StoredConsent | null {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<StoredConsent> | null;
    if (!parsed || typeof parsed.version !== "string" || typeof parsed.analytics !== "boolean") return null;
    return {
      version: parsed.version,
      analytics: parsed.analytics,
      decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : "",
    };
  } catch {
    return null;
  }
}

function updateGoogleConsent(granted: boolean) {
  window.gtag?.("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

function clearGoogleAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((entry) => entry.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_"));
  const hostParts = window.location.hostname.split(".");
  const domains = new Set<string | undefined>([undefined, window.location.hostname]);
  for (let index = 0; index <= hostParts.length - 2; index += 1) {
    domains.add(`.${hostParts.slice(index).join(".")}`);
  }

  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ""}`;
    }
  }
}

function isPublicAnalyticsPath(pathname: string) {
  return pathname === "/"
    || pathname === "/about"
    || pathname === "/beratung"
    || pathname === "/blog"
    || pathname.startsWith("/blog/")
    || pathname === "/buchung"
    || pathname === "/datenschutz"
    || pathname === "/impressum"
    || pathname === "/kontakt"
    || pathname === "/portfolio"
    || pathname === "/preise"
    || pathname === "/support";
}
