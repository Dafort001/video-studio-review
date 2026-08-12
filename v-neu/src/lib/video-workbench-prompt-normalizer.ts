export type VideoPromptNormalizeInput = {
  projectId?: string;
  customerPromptDe?: string;
  customerMaterialDe?: string;
  preferredSpokenLineDe?: string;
};

export type VideoPromptNormalizeResult = {
  version: "video_prompt_pipeline_v1";
  customerPromptDe: string;
  customerMaterialDe: string;
  semanticPromptDe: string;
  spokenLineDe: string;
  veoPromptEn: string;
  negativePromptEn: string;
  warnings: string[];
  provider: "gemini" | "local_fallback";
  model: string | null;
};

function cleanGermanPrompt(value: string | null | undefined) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\bpräsente\b/gi, "Presenter")
    .replace(/\bpraesente\b/gi, "Presenter")
    .replace(/\bPräsenter\b/g, "Presenter")
    .replace(/\bPraesenter\b/g, "Presenter")
    .trim();
}

export function extractGermanSpokenLine(value: string | null | undefined, fallback = "Immobilienvideo mit Persoenlichkeit.") {
  const source = String(value || "");
  const quoted = source.match(/[\"“]([^\"”]{3,90})[\"”]/);
  if (quoted) return quoted[1].trim();
  const says = source.match(/(?:sagt|sage|sprechen|spricht|satz|text)\s*[:\-]\s*([^.\n!?]+[.!?]?)/i);
  if (says) return says[1].trim();
  return fallback;
}

function semanticNotesForGermanPrompt(value: string) {
  const notes: string[] = [];
  if (/(makler|maklerin|presenter|person|gesicht|portrait|porträt)/i.test(value)) {
    notes.push("Person als Immobilien-Presenter verstehen; Identitaet, Gesicht, Outfit und Koerpermassstab stabil halten.");
  }
  if (/(sprech|sprich|sagt|sagen|lippen|stimme|satz|text)/i.test(value)) {
    notes.push("Deutsche Sprechzeile getrennt erfassen; Lippenbewegung subtil synchronisieren, keine uebertriebene Mimik.");
  }
  if (/(fassade|haus|gebaeude|gebäude|fenster|tuer|tür|strasse|straße|auto|baum|bäume|baeume)/i.test(value)) {
    notes.push("Immobilie source-faithful halten; Fassade, Fenster, Tueren, Strasse, Autos, Baeume und Perspektive nicht neu erfinden.");
  }
  if (/(zoom|pan|kamera|fahrt|bewegung|links|rechts|rein|raus|gehen|läuft|laeuft|laufen)/i.test(value)) {
    notes.push("Kamera/Bewegung realistisch halten; keine Perspektivspruenge, kein unkontrollierter Zoom.");
  }
  if (/(logo|schrift|untertitel|wasserzeichen|caption)/i.test(value)) {
    notes.push("Keine generierten Texte, Untertitel, Logos oder Wasserzeichen im Veo-Video; Overlays kommen spaeter separat.");
  }
  return notes.length ? notes : [
    "Noch keine klare Video-Semantik erkannt; Person, Bewegung, Sprechzeile und unveraenderliche Bildbereiche genauer beschreiben.",
  ];
}

export function createLocalPromptNormalization(input: VideoPromptNormalizeInput): VideoPromptNormalizeResult {
  const customerPromptDe = cleanGermanPrompt(input.customerPromptDe);
  const customerMaterialDe = cleanGermanPrompt(input.customerMaterialDe);
  const spokenLineDe = extractGermanSpokenLine(customerPromptDe, input.preferredSpokenLineDe || "Immobilienvideo mit Persoenlichkeit.");
  const semanticNotes = semanticNotesForGermanPrompt(`${customerPromptDe} ${customerMaterialDe}`);
  const warnings = customerPromptDe ? [] : ["Kundenprompt fehlt."];
  const semanticPromptDe = [
    "Kundenabsicht, bereinigt:",
    customerPromptDe || "Noch kein Kundenprompt eingetragen.",
    "",
    "Referenzmaterial / Person:",
    customerMaterialDe || "Noch keine Personen-/Materialreferenz eingetragen.",
    "",
    "Sprechzeile Deutsch:",
    `"${spokenLineDe}"`,
    "",
    "Semantik-Korrekturen:",
    ...semanticNotes.map((note) => `- ${note}`),
  ].join("\n");

  return {
    version: "video_prompt_pipeline_v1",
    customerPromptDe,
    customerMaterialDe,
    semanticPromptDe,
    spokenLineDe,
    veoPromptEn: createVeoPromptEn(spokenLineDe),
    negativePromptEn: createNegativePromptEn(),
    warnings,
    provider: "local_fallback",
    model: null,
  };
}

export function createVeoPromptEn(spokenLineDe: string) {
  return `Create a realistic 4-second vertical 9:16 real estate opening video from the provided first frame.

This prompt was created from a German customer brief through a semantic normalization step. Use the normalized meaning, not a literal word-by-word translation.

Camera and background: keep the real property background as stable and source-faithful as possible. Preserve the building facade, windows, doors, parked cars, street, curb, trees, shadows, perspective, colors, and architectural details. The camera may perform only a gentle smooth pan or hold that matches the selected motion settings. Do not invent a different house or street.

Presenter: if a presenter/person reference is provided, keep the same person, face, outfit, body scale, and lighting. The person should behave like a professional real estate presenter, with natural posture, grounded feet, plausible contact shadow, and a confident friendly expression.

Speech and lips: if speech is requested, the presenter speaks this exact short German sentence in a natural female German voice. Her lips and face should move subtly in sync with the sentence, without exaggerated acting.
Presenter says: "${spokenLineDe}"

No generated text, subtitles, captions, logo, watermark, or graphic overlay. Text and branding will be added later as separate layers.`;
}

export function createNegativePromptEn() {
  return "background change, changed house, different building, new facade, altered windows, altered doors, new roof, different street, different parked cars, moved cars, changed tree layout, warped architecture, melting facade, bending windows, perspective change, uncontrolled zoom, dolly, slow motion, frozen pose, face morphing, changing identity, deformed face, blurry face, distorted eyes, bad teeth, bad hands, extra fingers, broken legs, floating feet, sliding feet, changing body scale, doll-like proportions, extra people, generated text, subtitles, captions, logo, watermark, cartoon style, fashion runway, dancing, exaggerated mouth movement, wrong language";
}
