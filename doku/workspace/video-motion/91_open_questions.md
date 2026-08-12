# Open Questions v0.1

## Produktfragen

- Welche Varianten sollen spaeter echte Kundenoptionen werden?
- Soll `Social Clip` weiterhin der sichtbare Produktname bleiben, waehrend
  technische Routen intern anders heissen?
- Welche Varianten gehoeren zuerst zu Pix.immo, und welche erst spaeter zu
  PixCapture Backend oder Swift?
- Braucht `sold_success_clip` eine harte Produktdatenfreigabe, bevor die
  Variante ueberhaupt sichtbar wird?
- Soll `avatar_hook` ein eigenes Produkt werden oder nur eine Option fuer
  Agent-Branding?

## Bild- und Testfragen

- Welche 20 bis 30 echten Beispielbilder sollen fuer die Qwen-Testmatrix
  genutzt werden?
- Wo werden diese Testbilder versioniert, ohne echte Kundenbilder unnoetig in
  Repo-Historie zu schreiben?
- Welche Bildsets decken bewusst schwierige Risiken ab: Fenster, Glas, Spiegel,
  Treppen, schmale Raeume, Fassaden, Ausblicke?
- Wer bewertet Qwen-Outputs visuell, bevor Presets von `draft` nach `test`
  wechseln duerfen?

## Technische Fragen

- Soll das lokale TypeScript-Modul spaeter im PixImmo-Web, PixCapture-Backend
  oder in einem separaten Worker leben?
- Braucht das Modul eine eigene Package-/Build-Konfiguration im Workspace-Root,
  oder soll es erst in ein konkretes Produktrepo verschoben werden?
- Welche Datenstruktur liefert spaeter echte Motivklassen, Eigenschaften,
  Scores und Bild-IDs an `buildShotPlan()`?
- Welche Quality Gates werden maschinell pruefbar, und welche bleiben manuelle
  Review?

## Qwen- und Providerfragen

- Welcher Qwen-/Image-Edit-Provider wird ueberhaupt getestet?
- Welche Kosten entstehen pro Testmatrix-Durchlauf?
- Welche Outputs duerfen gespeichert werden?
- Welche Datenschutz- oder Kundenbildregeln gelten fuer Provider-Tests?
- Ab welchem Ergebnis darf `qwen_enabled` ausserhalb lokaler Planung aktiv
  werden?

## Render- und Integrationsfragen

- Soll die erste Render-Integration weiterhin die bestehende PixImmo
  Social-Clip/Modal-Bruecke nutzen?
- Welche Felder braucht ein spaeterer Render-Job aus dem Draft Shot Plan?
- Wie werden Text, Transitions, Avatar-Hinweise und CTA in Render-Parameter
  uebersetzt?
- Welche Teile muessen im UI sichtbar/editierbar sein, bevor automatisch
  gerendert wird?

