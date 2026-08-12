# Video Motion / FFmpeg Core Demo Handover - 2026-07-02

## Kurzfassung

Daniel hat die breite Galerie-/Klassifizierungsrichtung heute gestoppt. Die
tragfaehige Richtung ist jetzt: aus wenigen guten Immobilienbildern eine kleine
Bewegungsbibliothek beweisen, die spaeter auf passende Motive gemappt wird.

Der heutige belastbare Stand:

- FFmpeg/PIL kann robuste 9:16-Bewegungen aus Standbildern liefern:
  Pan links/rechts, Push-in, Push-out, kurze Hooks.
- 60fps ist Pflicht fuer Review am Computermonitor.
- 5s-Clips sind als Hero-/Proof-Shots brauchbar, aber als Dauerstandard zu
  traege.
- 1.2-2.5s ist laut Referenzmatrix der bessere Bereich fuer Social-Hooks und
  kurze visuelle Impulse.
- Qwen/WAN bleiben wichtig, aber fuer heute bewusst nicht weiter genutzt:
  die aktuelle Baseline ist FFmpeg-only.

## Wichtigste Produktentscheidung

Nicht weiter versuchen, 20k-25k Bilder abstrakt in immer feinere
Bewegungsklassen zu sortieren. Das erzeugt Arbeit, aber noch kein brauchbares
Produkt.

Besser:

1. 10-20 konkrete Bewegungsbeispiele als Demo-Bibliothek bauen.
2. Fuer jede Bewegung festhalten:
   - welches Motiv funktioniert,
   - welche Perspektive noetig ist,
   - welche Dauer sinnvoll ist,
   - ob FFmpeg reicht oder Qwen/WAN gebraucht wird.
3. Danach in der Datenbank nur noch aehnliche geeignete Motive suchen.

## Daniel-Regeln aus dem Tag

Diese Punkte bitte ernst nehmen; sie sind keine Nebensaetze:

- Nicht kritiklos zustimmen. Wenn ein Ansatz falsch oder zu teuer ist, direkt
  sagen.
- Keine Galerie mehr als Selbstzweck bauen. Eine UI muss eine konkrete
  Entscheidung erleichtern.
- Keine mehrfach fast identischen Motive nebeneinander auswaehlen.
- Keine 360-Panoramen oder 2:1-Formate fuer diese Tests. Zulaessig sind 3:2
  und 4:3, wenn nicht explizit anders gewuenscht.
- `Unklar` war nicht Teil der Originalnamen. Es ist ein Pipeline-/Rename-Artefakt.
  Zukuenftige sichtbare Namen, Listen und Exporte duerfen `Unklar` nicht mehr
  als semantische Bezeichnung verwenden. Aktuelle Provenienzpfade duerfen es
  noch enthalten, weil die Dateien derzeit so liegen.
- Bilder sollen nicht einfach willkuerlich beschnitten werden. Der urspruengliche
  Bildwert muss erhalten bleiben; Crop/Bewegung muss einen Hero Point oder
  erkennbaren Bildgrund respektieren.

## Verworfen oder nur noch historisch

Die Review-Galerie-Richtung ist fuer den Moment nicht zielfuehrend:

- grosse Bildkarten mit Ja/Nein/Qwen/KB/PX/Static usw. fuehrten zu falscher
  Arbeit am falschen Problem,
- Duplikate und falsche Motivauswahl haben Vertrauen gekostet,
- der 9:16-Crop-Editor ohne sinnvollen Hero-Point war zu fummelig und produktiv
  nicht hilfreich.

Bitte nicht daran weiteroptimieren, ausser Daniel fordert genau diese UI wieder
an.

## Perspektivische Grundregel

Der bisherige praktische Kanon:

- Zentralperspektive / Raumachse:
  - gut fuer Push-in, Push-out, Zoom/Vertigo-nahe Tests,
  - spaeter potentiell Qwen/WAN-faehig fuer staerkere Bewegungen.
- Schraege oder parallele Wand-/Raumsichten:
  - eher Pan/Slide links-rechts oder rechts-links,
  - Push/Parallax kann schnell seltsam wirken, wenn der Raumwinkel nicht stimmt.
- Klare Vordergrund-/Hintergrund-Trennung:
  - spaeter Kandidat fuer Layer/Text/Reveals, z.B. Kuechenblock, Haus vor
    Landschaft, Blick durch Tueren.

## Referenzmatrix

Daniel lieferte diese Excel-Datei als Schnitt-/Video-Referenz:

```text
/Users/danielfortmann/Library/Group Containers/group.com.apple.notes/Accounts/B83450EE-3B89-4555-B312-FAAFE417B982/Media/67A5119D-35A2-4953-A614-A6D387A2F37C/1_801C45D9-C751-4BC2-BD70-9D9E6A5B9E29/pixcapture_immobilienvideo_referenzmatrix_top100.xlsx
```

Gelesene Blaetter:

- `00 Dashboard`
- `01 Top100`
- `02 Top25 PixCapture`
- `03 Aggregat`
- `04 Schnittklassen`
- `05 Motion_Staging`
- `06 Quellen`
- `07 Templatequellen`

Relevante Ableitung:

- Social/Shorts: meist 15-30s, 8-18 visuelle Impulse.
- Typischer kurzer Shot: ca. 0.7-2.0s; fuer Standbilder besser 1.2-2.2s.
- 45-60s Listing: ca. 15-24 Bilder, 2.0-3.5s bzw. 2.4-3.2s lesbare Shots.
- Haeufiges Muster:
  `Hook -> Hero-Raum/View -> Wohnbereich -> Kueche -> Master -> Outdoor/CTA`.
- Bestes Still-to-Video-Motion-Set:
  Push-in, Slide, Pan, Tilt, Parallax, Static Hold, Text Reveal.

Konsequenz:

- 5s ist nicht Standard fuer einen ganzen Film.
- 5s ist Hero-/Proof-Dauer.
- 2s ist Hook-/Rhythmusdauer.
- 0.5-0.7s funktioniert nur fuer sofort lesbare Micro-Cuts.

## Akzeptierte Kernbilder

Vier Motive wurden als gute Startbasis akzeptiert:

```text
/Volumes/8TB_ele/Warnholz/20250916/T16/20250916-142951000-Unklar-DSF6955.jpg
/Volumes/8TB_ele/Mandellas/20250326_mand/Mandella/mand_2/20250326-111051000-Unklar-DSF1986-2.jpg
/Volumes/8TB_ele/Haferkamp/20250813_Gr/T16/20250813-140743000-Unklar-DSF2184.jpg
/Volumes/8TB_ele/Mandellas/20250326_mand/T16/20250326-110648000-Unklar-DSF1966.jpg
```

Bewegungen:

- `kb_pan_left_to_right`
- `kb_pan_right_to_left`
- `kb_push_in`
- `kb_push_out`

## Haupt-Artefakte

Arbeitsordner:

```text
analysis/video_motion_empirical_basis_v2_2026-07-02/motion_demo_tests_v1/core_motion_proofset_v1
```

Exportordner fuer Daniel:

```text
exports/video_motion_core_demo_2026-07-02
```

Wichtigste Dateien:

```text
analysis/video_motion_empirical_basis_v2_2026-07-02/motion_demo_tests_v1/core_motion_proofset_v1/CORE_MOTION_REFERENCE_SET_V1.md
analysis/video_motion_empirical_basis_v2_2026-07-02/motion_demo_tests_v1/core_motion_proofset_v1/CORE_MOTION_START_TARGET_SPEC_V1.md
analysis/video_motion_empirical_basis_v2_2026-07-02/motion_demo_tests_v1/core_motion_proofset_v1/CORE_MOTION_START_TARGET_SPEC_V1.json
analysis/video_motion_empirical_basis_v2_2026-07-02/motion_demo_tests_v1/core_motion_proofset_v1/CORE_EFFECTS_FEASIBILITY_V1.md
analysis/video_motion_empirical_basis_v2_2026-07-02/motion_demo_tests_v1/core_motion_proofset_v1/render_core_motion_demo_v1.py
analysis/video_motion_empirical_basis_v2_2026-07-02/motion_demo_tests_v1/core_motion_proofset_v1/render_ffmpeg_timing_variants_v1.py
analysis/video_motion_empirical_basis_v2_2026-07-02/motion_demo_tests_v1/core_motion_proofset_v1/render_ffmpeg_short_hooks_v1.py
```

## Geraenderte / erzeugte Videos

Vollvideo:

```text
analysis/video_motion_empirical_basis_v2_2026-07-02/motion_demo_tests_v1/core_motion_proofset_v1/core_motion_demo_9x16_4x5s_60fps_v1.mp4
exports/video_motion_core_demo_2026-07-02/videos/core_motion_demo_9x16_4x5s_60fps_v1.mp4
```

Geprueft:

- 1080x1920
- 60fps
- 1200 Frames
- 20s

Einzelclips:

```text
exports/video_motion_core_demo_2026-07-02/videos/individual_clips_60fps/
```

Enthaelt:

- `kb_pan_left_to_right_living_dining_5s_60fps.mp4`
- `kb_pan_right_to_left_living_dining_5s_60fps.mp4`
- `kb_push_in_kitchen_dining_5s_60fps.mp4`
- `kb_push_out_living_kitchen_5s_60fps.mp4`

Timing-Varianten:

```text
exports/video_motion_core_demo_2026-07-02/ffmpeg_timing_variants_v1/
```

Varianten:

- `ease_in_out_target_hold`
- `ease_in_slow_to_fast`
- `ease_out_fast_to_slow`
- `hold_move_hold`

Alle Clips:

- 1080x1920
- 60fps
- 300 Frames
- 5s

## 2-Sekunden-Hooks

Neu aus der Referenzmatrix abgeleitet:

```text
exports/video_motion_core_demo_2026-07-02/ffmpeg_short_hooks_v1/
```

Review-HTML:

```text
exports/video_motion_core_demo_2026-07-02/ffmpeg_short_hooks_v1/index.html
```

Clips:

- `hook_micro_tour_4x05_same_home_2s_60fps.mp4`
- `hook_triplet_living_kitchen_bath_2s_60fps.mp4`
- `hook_speed_ramp_push_living_2s_60fps.mp4`
- `hook_feature_pop_kitchen_2s_60fps.mp4`
- `hook_doorway_reveal_stair_2s_60fps.mp4`
- `hook_window_to_garden_match_2s_60fps.mp4`

Geprueft:

- alle 1080x1920
- alle 60fps
- alle 120 Frames
- alle exakt 2.000s

## Nachtrag: Evening Showreel v1

Nach diesem Handover wurde aus derselben Warnholz-Wohnung ein erster kompletter
9:16-Showreel gebaut:

```text
exports/video_motion_core_demo_2026-07-02/evening_showreel_v1/
```

Direktes Review:

```text
exports/video_motion_core_demo_2026-07-02/evening_showreel_v1/index.html
```

Video:

```text
exports/video_motion_core_demo_2026-07-02/evening_showreel_v1/warnholz_evening_showreel_9x16_36s_60fps_v1.mp4
```

Technisch geprueft:

- 1080x1920
- 60fps
- 2154 Frames
- 35.9s

Struktur:

- 2s Micro-Hook,
- 2-4s Raumshots,
- harte Schnitte,
- dezente Textoverlays,
- Garten/Aussenabschluss,
- FFmpeg/PIL-only, keine Qwen/WAN-generierten Pixel.

Render-Script:

```text
analysis/video_motion_empirical_basis_v2_2026-07-02/motion_demo_tests_v1/core_motion_proofset_v1/render_evening_showreel_v1.py
```

## Same-Property Material

Fuer die Warnholz-Wohnung wurde ein kleiner Objektpool gebaut:

```text
analysis/video_motion_empirical_basis_v2_2026-07-02/motion_demo_tests_v1/core_motion_proofset_v1/same_property_warnholz_20250916/
exports/video_motion_core_demo_2026-07-02/same_property/
```

Dateien:

- `same_property_qwen_contact_sheet.jpg`
- `same_property_qwen_inventory.csv`

Diese Liste ist besser als die frueheren Zufallsgalerien, weil sie eine
zusammenhaengende Wohnung zeigt: Wohnen, Kueche, Bad, Flur, Schlafzimmer,
Kinderzimmer, Buero, Terrasse/Garten, Aussen.

## Technische Befehle

FFmpeg/PIL-Render:

```bash
python3 analysis/video_motion_empirical_basis_v2_2026-07-02/motion_demo_tests_v1/core_motion_proofset_v1/render_core_motion_demo_v1.py
python3 analysis/video_motion_empirical_basis_v2_2026-07-02/motion_demo_tests_v1/core_motion_proofset_v1/render_ffmpeg_timing_variants_v1.py
python3 analysis/video_motion_empirical_basis_v2_2026-07-02/motion_demo_tests_v1/core_motion_proofset_v1/render_ffmpeg_short_hooks_v1.py
```

Pruefung mit `ffprobe` wurde fuer die finalen 2s-Hooks und 5s-Clips gemacht.

## Naechster sinnvoller Schritt

Nicht wieder bei der kompletten Datenbank anfangen.

Sinnvoller naechster Schritt:

1. Daniel schaut die 2s-Hooks in
   `exports/video_motion_core_demo_2026-07-02/ffmpeg_short_hooks_v1/index.html`
   an.
2. Danach Clips in drei Gruppen sortieren:
   - Hook taugt,
   - nur Zwischenschnitt,
   - verwerfen.
3. Dann einen ersten 30-45s Beispielablauf aus derselben Wohnung bauen:
   - 2s Hook,
   - 2-3s Wohn-/Kuechen-/Bad-/Garten-Shots,
   - maximal ein 5s Hero-Shot,
   - harte Schnitte als Default,
   - nur sparsame Whip/Zoom/Light-Impulse.
4. Erst danach Qwen/WAN fuer staerkere Hooks oder Keyframe-Zwischenbilder
   wieder aufnehmen.

## Nicht vergessen

Die naechste Demo sollte einzelne Videos auf einer Webseite zeigen, nicht ein
zusammengeklebtes langes Video. Daniel will schnell jede Bewegung einzeln
kontrollieren koennen.

## Dirty-State / Git-Hygiene am Ende dieses Handovers

Gepruefter Befehl:

```bash
git status --short
```

Endstand nach Erstellung dieses Handovers:

```text
 M docs/HANDOVERS/README.md
 M docs/HANDOVERS/VOLEUR_MODAL_CURRENT_STATE.md
 m projects/piximmo-web
?? analysis/
?? docs/HANDOVERS/VIDEO_MOTION_FFMPEG_CORE_DEMO_HANDOVER_2026-07-02.md
?? docs/HANDOVERS/VOLEUR_LIVING_ROOM_VISUAL_STRUCTURE_HANDOVER_2026-07-01.md
?? tools/
```

Klassifizierung:

- `docs/HANDOVERS/README.md`: war bereits dirty; enthaelt einen additiven
  Pointer auf den Wohnzimmer-Visual-Structure-Handover. In diesem Turn wurde
  zusaetzlich ein Pointer auf dieses FFmpeg-Core-Demo-Handover ergaenzt.
- `docs/HANDOVERS/VOLEUR_MODAL_CURRENT_STATE.md`: unrelated existing dirty
  state, nicht inhaltlich geprueft.
- `projects/piximmo-web`: nested repo dirty state, nicht Teil der heutigen
  FFmpeg-Demo-Arbeit.
- `analysis/`: enthaelt die heutigen Motion-Analyse-/Demo-Artefakte und
  vermutlich weitere ungetrackte Analysearbeit. Nicht pauschal committen, weil
  dort viele Media-Dateien liegen.
- `docs/HANDOVERS/VIDEO_MOTION_FFMPEG_CORE_DEMO_HANDOVER_2026-07-02.md`:
  neue offizielle Uebergabe dieses Turns.
- `docs/HANDOVERS/VOLEUR_LIVING_ROOM_VISUAL_STRUCTURE_HANDOVER_2026-07-01.md`:
  existiert als untracked Handover-Datei aus dem Kontext vor heute.
- `tools/`: untracked, nicht in dieser Abschlusspruefung geoeffnet.

Kein Commit wurde erstellt. Grund: Die heutigen Artefakte enthalten grosse
Video-/Analyseausgaben, und der Arbeitsbaum hatte bereits unrelated dirty
state. Vor einem Commit sollte Daniel entscheiden, ob die Media-Exports in Git
oder nur auf dem Drive bleiben sollen.
