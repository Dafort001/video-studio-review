# PixImmo Video-Werkstatt – Übergabe zur Galerieprüfung

Stand: 2026-08-12 19:32, Europe/Berlin

## Auftrag des nächsten Tasks

Daniel geht als Nächstes die **Galerie, Schritt 2 der zentralen
Video-Werkstatt**, gemeinsam mit dem Agenten durch. Ausgangspunkt ist sein
realer Seeburg-Film nach der Logo-Platzierung. Zuerst die tatsächlich sichtbare
Galerieseite mit Daniel prüfen und seine konkreten Beobachtungen aufnehmen;
nicht vorsorglich eine neue Galerie, einen zweiten Editor oder einen
Providerweg entwerfen.

## Kurzer Einstieg

1. `/Volumes/drive 1/PIXCAPTURE/00_READ_FIRST_EVERY_SESSION.md`
2. `/Volumes/drive 1/PIXCAPTURE/CODEX_WORKING_MEMORY_DO_NOT_TOUCH/PIXIMMO_SESSION_CACHE.md`
3. diese Datei vollständig

Nur bei einer konkreten Detailfrage zusätzlich
`CODEX_WORKING_MEMORY_DO_NOT_TOUCH/PIXIMMO_MOTION_DEMO_AI_PLAN.md` lesen. Die
historischen Handovers müssen für die Galerierunde nicht erneut komplett
gelesen werden.

## Aktueller Produktweg

Es gibt genau eine zentrale Werkstatt mit fünf Schritten:

1. Logo
2. Galerie
3. Sortier-Timeline
4. Szenenbearbeitung
5. Vorschau & KI

Die Galerie ist die Auswahlstufe. Sie darf noch keine endgültige 9:16-, Crop-
oder Bewegungsentscheidung erzwingen. Das Endvideo ist 9:16; Arbeits- und
Referenzbilder davor dürfen jedes sinnvolle Format behalten, solange keine
Bildinformation unnötig verloren geht.

Für die gemeinsame Prüfung insbesondere klären:

- Ist unmittelbar verständlich, welche Bilder im Film sind und welche nicht?
- Sind Auswahl, Abwahl, Reihenfolgehinweis und nächster Schritt eindeutig?
- Bleiben vorhandene Takes und unveränderte Originalquellen nachvollziehbar?
- Ist klar, was ausschließlich in der Galerie geschieht und was erst in der
  Sortier-Timeline beziehungsweise Szenenbearbeitung folgt?
- Gibt es an der sichtbaren Seite konkrete Stellen, die Daniel anders haben
  möchte?

## Gerade behobener Übergang von Logo zu Galerie

Daniel konnte nach Platzierung und Speicherung des Logos nicht eindeutig zur
Galerie weitergehen. Der frühere Primärknopf hieß abhängig vom separaten
`logoEnabled`-Status missverständlich `Ohne Logo zur Galerie`, obwohl bereits
ein Logo ausgewählt und positioniert war.

PixImmo-Commit `ad01d6a` behebt das:

- Sekundär: `Nur speichern`
- Primär: `Speichern und weiter zur Galerie` mit Richtungspfeil
- Der Wechsel zu Schritt 2 erfolgt erst nach erfolgreichem Speichern.
- Die Formulierung `Ohne Logo zur Galerie` ist vollständig entfernt.

Betroffene Dateien:

- `projects/piximmo-web/src/app/dashboard/video-studio/workbench/[projectId]/SharedVideoStudioWorkbench.tsx`
- `projects/piximmo-web/tests/video-studio-workflow.test.ts`

Verifikation: 209/209 Unit-Tests, TypeScript, gezieltes ESLint, Diff-Check und
Production-Build sind grün. Der Build gibt die bekannten lokalen
Neon-/Dynamic-Rendering-Hinweise aus, endet aber erfolgreich mit Exit 0.

## Git- und Veröffentlichungsstand

- Repo: `/Volumes/drive 1/PIXCAPTURE/projects/piximmo-web`
- Branch: `codex/shared-workbench-unification-20260811`
- Vorheriger gepushter Stand: `c485fc7`
- Neuer lokaler Galerie-Weiter-Fix: `ad01d6a`
- `ad01d6a` ist bei dieser Übergabe **committed, aber nicht gepusht und nicht
  deployed**.
- Das PixImmo-Repo ist nach dem Commit sauber.
- Der rohe Workspace-Root-Status zeigt weiterhin nur Gitlink-Abweichungen der
  verschachtelten Repositories PixCapture, PixImmo und Voleur. Mit
  `--ignore-submodules=all` ist der Root vor dieser Dokumentationsnotiz sauber.
  Diese Gitlinks weder resetten noch kosmetisch committen.

Der Session Cache nennt den zuletzt sicher belegten Beta-/Direktdeployment-
Stand. Vor Push, Vercel-Deployment oder Aliasänderung den Ist-Stand neu
auflösen. Eine Aliasänderung ist kein Bestandteil der Galerierunde und muss
vollständig die Beta Deployment Safety Rule erfüllen.

## Kontext, der nicht verloren gehen darf

- Die 21 ehrlich per 2D-Renderer demonstrierbaren Bewegungen liegen als
  1,5-Sekunden-Clips vor; Tiefen-, Fokus- und generative Bewegungen dürfen
  nicht durch einen Crop vorgetäuscht werden.
- Für aufwendige Perspektivbewegungen gilt der geprüfte Denkweg
  `Qwen-Endperspektive -> Google-Interpolation -> vollständige Bewegung auf
  1,5 s beschleunigen`. `Crane-up` ist im geplanten Kostensystem `★★★`.
- Für Google ist **Gemini Omni Flash** der primäre neue Kandidat; Veo bleibt
  der Spezialweg, wenn ein verbindlicher letzter Frame benötigt wird. Kling
  3.0 und MiniMax Hailuo/H3 sind Vergleichskandidaten. Im Galerietask wird
  daraus nichts kostenpflichtig ausgelöst.
- Providerzugänge gehören dem gemeinsamen Shared Video Studio von PixCapture
  und PixImmo. Keine zusätzlichen Portal-API-Schlüssel oder parallelen
  Oberflächen anlegen.
- Daniel möchte eine zusammenhängende, verständliche Oberfläche und keine
  Ansammlung aus 45 voreilig festgelegten Einzelreglern. Sichtbare Fakten der
  aktuellen Seite sind maßgeblich; nicht behaupten, etwas gesehen oder getestet
  zu haben, wenn es nur angenommen wurde.

## Stopregeln für die Galerierunde

- Kein kostenpflichtiger Google-, Qwen-, Kling-, MiniMax- oder sonstiger
  Providerlauf ohne neuen konkreten Auftrag, sichtbare Parameter und
  Kostenrahmen.
- Kein Umbau der fünfstufigen Gesamtarchitektur, keine Legacy-Route und keine
  zweite Werkstatt.
- Keine Änderung an `pix.immo`, PixCapture, Wix, DNS oder dem Beta-Alias ohne
  ausdrücklichen Auftrag und vollständige Sicherheitsabnahme.
- Keine Originalbilder überschreiben oder unnötig auf 9:16 beschneiden.
- Daniels sichtbare Galeriebeobachtungen zuerst präzise wiedergeben; danach
  kleine, nachvollziehbare Änderungen implementieren und proportional prüfen.

## Konkreter erster Satz im neuen Task

`Ich habe die Übergabe gelesen. Der Logo-Schritt endet jetzt eindeutig mit
„Speichern und weiter zur Galerie“. Zeig mir bitte die Galerie so, wie sie vor
dir steht; wir gehen sie jetzt gemeinsam von oben nach unten durch.`
