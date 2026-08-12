import type { NextConfig } from "next";

const legacyWixRedirects = [
  { source: "/aerial", destination: "/portfolio" },
  { source: "/aussenaufnahmen", destination: "/portfolio" },
  { source: "/badezimmer", destination: "/portfolio" },
  { source: "/beispiel-seite-bilderkennung/:path*", destination: "/portfolio" },
  { source: "/blank", destination: "/" },
  { source: "/blank-3", destination: "/" },
  { source: "/blank-4", destination: "/" },
  { source: "/checkliste-f%C3%BCr-verk%C3%A4ufer", destination: "/blog" },
  { source: "/garten", destination: "/portfolio" },
  { source: "/hafencity", destination: "/portfolio" },
  { source: "/haus-und-garten", destination: "/portfolio" },
  { source: "/impressum-datenschutz", destination: "/impressum" },
  { source: "/indoor", destination: "/portfolio" },
  { source: "/kopie-von-kontakt", destination: "/kontakt" },
  { source: "/k%C3%BCche", destination: "/portfolio" },
  { source: "/leerer%C3%A4ume", destination: "/portfolio" },
  { source: "/online-buchung-terminplaner", destination: "/kontakt" },
  { source: "/outdoor", destination: "/portfolio" },
  { source: "/portfolio-1", destination: "/portfolio" },
  { source: "/portfolio-1/:path*", destination: "/portfolio" },
  { source: "/portfolio-collections/:path*", destination: "/portfolio" },
  { source: "/postprocessing", destination: "/buchung" },
  { source: "/preistabelle-und-leistung", destination: "/buchung" },
  { source: "/schlafzimmer", destination: "/portfolio" },
  { source: "/video-und-360", destination: "/buchung" },
  { source: "/virtual-staging", destination: "/buchung" },
  { source: "/wohnzimmer", destination: "/portfolio" },
] as const;

export const legacyVideoWorkbenchRedirects = [{
  source: "/video-workbench/:path*",
  destination: "/dashboard/video-studio/setup",
  permanent: false,
}];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...legacyWixRedirects.map((redirect) => ({
        ...redirect,
        permanent: true,
      })),
      ...legacyVideoWorkbenchRedirects,
    ];
  },
  serverExternalPackages: ["exiftool-vendored"],
  outputFileTracingIncludes: {
    "/api/results/*/ai-labeling": [
      "./node_modules/exiftool-vendored.pl/**/*",
      "./public/ai-labels/*.svg",
    ],
  },
  outputFileTracingExcludes: {
    "/api/results/*/ai-labeling": [
      "./*.md",
      "./docs/**/*",
      "./tests/**/*",
      "./test-results/**/*",
      "./src/**/*",
      "./public/demo/**/*",
      "./public/video-workbench/**/*",
      "./public/*.webp",
      "./node_modules/exiftool-vendored/dist/*.spec.js",
    ],
  },
};

export default nextConfig;
