# Next Steps v0.1

## Empfohlene Reihenfolge

### 1. Produktentscheidung treffen

Entscheiden, welche Variante zuerst real getestet wird:

```text
serious_broker_website
fast_social_teaser
premium_calm
avatar_hook
sold_success_clip
```

Empfehlung fuer den ersten echten Test: `serious_broker_website` oder
`premium_calm`, weil beide QW und Avatar deaktiviert lassen.

### 2. Echtes Bildset definieren

Ein kleines, bewusst kontrolliertes Bildset auswaehlen:

- 8 bis 12 Bilder fuer normale Shot-Plan-Tests.
- 20 bis 30 Bilder fuer die Qwen-Testmatrix, falls Qwen wirklich getestet
  werden soll.
- Keine unklaren Kundenbildrechte in Repo-Historie schreiben.

### 3. Lokales Modul mit echten Motif Inputs testen

Aus realen oder kuratierten Bilddaten `MotifInput[]` bauen:

```text
id
sourceImageId
motifClass
properties
preferredTakeType
```

Dann lokal pruefen:

```text
buildVideoVariants()
validateShotSequence()
```

### 4. Quality Gates priorisieren

Zuerst maschinell umsetzen:

- opening strength,
- repeated motifs,
- repeated take types,
- QW review flag,
- avatar/provider warning.

Manuell lassen, bis echte Render-/Bilddaten existieren:

- Textlesbarkeit,
- echte Qwen-Artefakte,
- Property Dominance im finalen Bild,
- CTA-Kollisionen.

### 5. Integration erst nach Produktentscheidung

Erst nach Daniel-Freigabe entscheiden, ob die erste Integration in:

- PixImmo Web,
- PixCapture Backend,
- Swift App,
- oder separater Worker/Modal-Bruecke landet.

Keine Integration starten, solange nicht klar ist, welches Produkt zuerst
sichtbar werden soll.

## Nicht als naechstes tun

- Keine Qwen-API direkt anschliessen.
- Keine Avatar-/HeyGen-Provider anschliessen.
- Keine Webseite bauen, bevor das Produktziel klar ist.
- Keine Render-Integration bauen, bevor echte Shot Plans fachlich akzeptiert
  sind.
- Keine alten Objektvideo-A-J-Dokumente wieder zur Produktwahrheit machen.

## Minimaler naechster technischer Test

Ein kleiner Node-Test oder Script kann spaeter:

1. 10 echte Motif Inputs laden,
2. alle fuenf Varianten bauen,
3. Shot Plans als JSON ausgeben,
4. Daniel die Sequenzen fachlich pruefen lassen.

Das ist der niedrigste sinnvolle Schritt vor Render- oder Providerarbeit.

