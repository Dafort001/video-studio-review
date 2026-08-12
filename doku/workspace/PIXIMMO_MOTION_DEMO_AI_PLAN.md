# PixImmo Bewegungsdemos – KI-Produktionsplan

Stand: 2026-08-12, Europe/Berlin

## Ziel

- 91 Bewegungen erhalten je einen klar erkennbaren 1,5-Sekunden-Democlip.
- Verbindlich ist nur das fertige Demovideo in 9:16 innerhalb von Daniels
  PNG-Rahmen. Eingaben und Zwischenbilder dürfen 2:3, quadratisch, 9:16 oder
  anders formatiert sein. Pro Arbeitsschritt wird das Format gewählt, das die
  benötigten Bildinformationen am besten erhält und ein nutzbares Ergebnis für
  den nächsten Schritt liefert; kein Zwischenformat wird zur globalen Regel.
- Demos erklären genau eine Bewegung; sie sind kein zusammenhängender Film.
- Keine Credits ausgeben, bevor Modell, Kontingent und der erste Pilot sichtbar
  geprüft sind.

## Bestand und Produktionsmenge

- 21 ehrliche 2D-Demos sind fertig und verdrahtet.
- 4 weitere Demos sollen lokal ergänzt werden: `WHIP_PAN_LEFT`,
  `WHIP_PAN_RIGHT`, `CAMERA_BREATH`, `HANDHELD_SUBTLE`.
- 66 Katalogplätze benötigen Tiefen-, Fokus- oder generative Bildinformation.
- Durch zeitliches Umkehren geeigneter Masterclips reichen voraussichtlich 45
  erfolgreiche KI-Mastergenerationen für diese 66 Plätze.
- Minimalmenge der fertigen Bibliothek: 91 × 1,5 s = 136,5 s, aber ausschließlich
  als getrennte Mikrodemos.

## Modellentscheidung

### Kurskorrektur nach erstem Flow-Pilot

- Der erste 10-Credit-Veo-Lite-Clip war kein belastbarer `TRUCK_LEFT`-Nachweis:
  Er wirkte im Wesentlichen wie ein Ken-Burns-/Pan-Move aus einem Einzelbild
  und ließ zusätzlich die Glastür generativ öffnen.
- Künftig darf Veo die Kameraposition nicht allein aus einem Bewegungswort
  erraten. Für räumliche Moves werden zuerst ein kontrollierter Startframe und
  ein geometrisch veränderter Endframe beziehungsweise eine Kamerabahn erzeugt.
- Google Flow/Veo `Frames to Video: First + last` dient anschließend nur zur
  zeitlichen Interpolation und zur Schließung kleiner Verdeckungslücken. Der
  reale Versuch lieferte 8 Sekunden; der brauchbare Weg ist, den vollständigen
  Clip auf 1,5 Sekunden zu beschleunigen und nicht willkürlich 1,5 Sekunden
  herauszuschneiden.
- Kleine echte Perspektivbewegungen sollen aus der vorhandenen kommerziell
  nutzbaren `DA3METRIC-LARGE`-Tiefenkarte selbst gerendert werden: Pixel in 3D
  rückprojizieren, Zielkamera transformieren, neu projizieren und kleine
  Disocclusion-Lücken kantenbewusst füllen.
- DA3-Giant/Nested könnte 3D-Gaussians und neue Ansichten direkt erzeugen, die
  veröffentlichten Gewichte sind jedoch `CC BY-NC 4.0` und deshalb keine
  Produktionsgrundlage für PixImmo. Stable Virtual Camera ist aus demselben
  Grund nur ein Forschungsvergleich, nicht das Produktmodell.
- Große Ansichtswechsel aus nur einem Foto (`90°`, `180°`, Durchgang hinter
  verdeckte Bereiche, Vogelperspektive) bleiben zwangsläufig generativ und
  müssen in der UI als synthetische Perspektive kenntlich sein. Ein einzelnes
  Foto enthält die verdeckte Geometrie nicht.

### Daniels bevorzugter Perspektiv-Edit-Workflow

- Primärweg für Demos, bei denen die neue Perspektive aus bereits sichtbarer
  Szeneninformation plausibel ableitbar ist: Original als Startframe, Qwen
  Image Edit erzeugt gezielt die zweite Kameraperspektive, anschließend
  interpoliert Google/Veo zwischen beiden unterschiedlichen Frames.
- Beispiel `CRANE_UP`: Ausgangsbild beibehalten; Qwen setzt die Kamera höher
  und richtet sie leicht nach unten. Dadurch werden mehr Fußboden und die
  Oberseiten sichtbarer Gegenstände gezeigt, während Fenster, Wände, Stuhl,
  Materialien und Licht inhaltlich konsistent bleiben.
- Dieser Weg wurde am 2026-07-01 bereits erfolgreich bewiesen:
  `fal-ai/qwen-image-edit-2511-multiple-angles`, damals mit
  `horizontal_angle=0`, `vertical_angle=30`, `zoom=0`, `seed=2243`.
  Der bestehende Runner liegt unter
  `analysis/living_room/visual_structure/run_fal_qwen_image_edit_multiple_angles.py`;
  die Fal-Zugangsdaten sind über `pix_secrets`/macOS Keychain eingerichtet.
- Für den aktuellen Perspektivtest erhält Qwen die informationsreichste
  verfügbare Ausgangsfassung. Der Endframe darf jedes für den nächsten
  Videodienst brauchbare Format haben. Falls ein Start-/Endframe-Dienst gleiche
  Abmessungen verlangt, werden beide dafür passend vorbereitet, ohne unnötig
  sichtbare Information zu verwerfen. Keine zweimalige Verwendung desselben
  Bildes als vermeintlicher Start- und Endzustand.
- Vor Veo muss Daniel den Qwen-Endframe sehen und freigeben. Erst danach gehen
  Original und freigegebener Endframe als `First + last` an Flow.

### Geplanter technischer Pilot ohne weitere Flow-Credits

1. Informationsreichste verfügbare Motivfassung durch den vorhandenen
   DA3Metric-Worker schicken; das Zwischenformat ist nicht fest vorgegeben.
2. `TRUCK_LEFT/RIGHT`, `DOLLY_IN/OUT` und `CRANE_UP/DOWN` als je 45 kontrollierte
   Frames bei 30 fps aus Tiefe + selbst definierter Kameramatrix rendern.
3. Prüfkriterium: Vordergrund und Hintergrund müssen unterschiedlich schnell
   wandern; reine affine Bildverschiebung ist `CROP_NOT_CAMERA`.
4. Erst wenn der lokale/Modal-Render sichtbare Parallaxe und stabile Architektur
   zeigt, optional Start- und Endframe einmal mit Veo First+Last glätten.
5. Für den Produktionscode ist der gemeinsame External-Modal/Voleur-Worker der
   logische Ort; PixImmo konsumiert nur Motion-ID, Preview und fertigen Clip.

Erst fünf identische Pilotaufgaben vergleichen:

1. `TRUCK_LEFT`
2. `DOLLY_IN`
3. `CRANE_UP`
4. `ORBIT_LEFT`
5. `RACK_FOCUS_NEAR_TO_FAR`

Gemini Omni Flash ist der primäre Google-Kandidat und wird zuerst geprüft.
Google selbst empfiehlt Omni als Standardmodell für neue Videogenerierung wegen
Kohärenz, Multi-Input-Reasoning, Konsistenz, faktischer Genauigkeit und
konversationeller Nachbearbeitung. Veo 3.1 bleibt der Spezialweg, wenn ein
verbindlicher letzter Frame, Interpolation oder Szenenverlängerung benötigt
wird. Kling und MiniMax sind danach Vergleichs-/Fallback-Kandidaten, nicht der
Ausgangspunkt. Prompts werden für den jeweiligen Modellweg formuliert und mit
demselben Prüfblatt bewertet.

Aktueller Credit-Korridor laut Google:

- Veo 3.1 Lite, 4 s: 10 Credits. 45 Erfolge = 450 Credits; bei zwei Versuchen
  je Master = 900 Credits beziehungsweise 18 Tage à 50 Gratis-Credits.
- Gemini Omni Flash, 4 s: 15 Credits. 45 Erfolge = 675 Credits. Ein Kontingent
  von 1.000 Credits erlaubt 66 Generationen: 45 Master plus 21 Wiederholungen.
- Omni-Video-Editing zu 40 Credits und regional eingeschränkte Upload-Edits
  werden für diese Bibliothek nicht eingeplant.
- Vor einem Kauf Preis und tatsächliches Kontingent direkt im angemeldeten
  Konto prüfen; keine automatische Aufladung aktivieren.

## Master- und Ableitungsmatrix

### Tiefenbewegungen: 15 Master für 26 Demos

| Master | daraus zusätzlich ableitbar |
|---|---|
| TRUCK_LEFT | TRUCK_RIGHT rückwärts |
| PEDESTAL_UP | PEDESTAL_DOWN rückwärts |
| DOLLY_IN | DOLLY_OUT rückwärts |
| DOLLY_DIAGONAL_LEFT | – |
| DOLLY_DIAGONAL_RIGHT | – |
| CRANE_UP | CRANE_DOWN rückwärts |
| JIB_IN | JIB_OUT rückwärts |
| ARC_LEFT | ARC_RIGHT rückwärts |
| ORBIT_LEFT | ORBIT_RIGHT rückwärts |
| PARALLAX_LEFT | PARALLAX_RIGHT rückwärts |
| PARALLAX_UP | PARALLAX_DOWN rückwärts |
| FOREGROUND_REVEAL_LEFT | – |
| FOREGROUND_REVEAL_RIGHT | – |
| PUSH_THROUGH | PULL_BACK_REVEAL rückwärts |
| DOLLY_ZOOM_IN | DOLLY_ZOOM_OUT rückwärts |

Rückwärtsableitungen nur übernehmen, wenn Richtung und Benennung im fertigen
1,5-Sekunden-Ausschnitt fachlich wirklich stimmen.

### Fokus: 4 Master für 5 Demos

| Master | daraus zusätzlich ableitbar |
|---|---|
| RACK_FOCUS_NEAR_TO_FAR | RACK_FOCUS_FAR_TO_NEAR rückwärts |
| SUBJECT_LOCK | – |
| BACKGROUND_DRIFT | – |
| FOREGROUND_DRIFT | – |

### Generativ: 26 Master für 35 Demos

| Master | daraus zusätzlich ableitbar |
|---|---|
| VIEW_YAW_LEFT | VIEW_YAW_RIGHT rückwärts |
| VIEW_PITCH_UP | VIEW_PITCH_DOWN rückwärts |
| HIGH_ANGLE_VIEW | – |
| LOW_ANGLE_VIEW | – |
| BIRD_EYE_VIEW | – |
| TOP_DOWN_VIEW | – |
| WORM_EYE_VIEW | – |
| ORBIT_GENERATIVE_LEFT | ORBIT_GENERATIVE_RIGHT rückwärts |
| SIDE_VIEW_45 | – |
| SIDE_VIEW_90 | – |
| REAR_VIEW_180 | – |
| CAMERA_POSITION_LEFT | CAMERA_POSITION_RIGHT rückwärts |
| CAMERA_POSITION_FORWARD | CAMERA_POSITION_BACKWARD rückwärts |
| CAMERA_POSITION_HIGHER | CAMERA_POSITION_LOWER rückwärts |
| CORNER_TO_CORNER | – |
| GENERATIVE_DOLLY_IN | GENERATIVE_DOLLY_OUT rückwärts |
| GENERATIVE_WALK_IN | – |
| GENERATIVE_WALK_THROUGH | – |
| GENERATIVE_CRANE_UP | GENERATIVE_CRANE_DOWN rückwärts |
| OUTPAINT_LEFT | – |
| OUTPAINT_RIGHT | – |
| OUTPAINT_UP | – |
| OUTPAINT_DOWN | – |
| OUTPAINT_ALL | – |
| GENERATIVE_ZOOM_OUT | – |
| EXTENDED_PAN_LEFT | EXTENDED_PAN_RIGHT rückwärts |

## Kanonischer Promptkern

Prompts auf Englisch ausführen:

> Use the supplied real-estate image as the exact first frame and as an
> immutable scene reference. Create one continuous **[DURATION]** photorealistic
> camera movement: **[MOTION]**. Preserve the exact architecture, room layout,
> furniture, windows, doors, materials, colors, lighting and identity of every
> visible object. Do not add, remove, replace, reshape or move objects. No
> people, no text, no cuts, no transitions and no change of time of day. Use a
> smooth stabilized cinematic ease-in-out. Perform only the requested movement,
> once, in one direction, without returning or looping. Keep an uninterrupted,
> clearly readable middle section of at least 1.5 seconds. Preserve all image
> information needed for the final 9:16 composition; intermediate framing may
> use any suitable aspect ratio.

Bewegungssatz `[MOTION]` ersetzt ausschließlich die markierte Stelle. Beispiele:

- TRUCK_LEFT: `The physical camera translates horizontally to the left while
  maintaining its viewing direction, producing natural foreground-background
  parallax; this is not a pan and not a crop.`
- DOLLY_IN: `The physical camera moves slowly straight forward into the room;
  perspective and parallax change naturally; this is not a digital zoom.`
- CRANE_UP: `The physical camera rises vertically while keeping a stable level
  viewing direction; this is not a tilt and not a crop.`
- ORBIT_LEFT: `The physical camera travels on a short arc around the room's
  central subject toward the left while keeping that subject framed.`
- RACK_FOCUS_NEAR_TO_FAR: `The camera stays completely locked. Focus shifts
  smoothly from the nearest visible object to the far wall; no camera movement
  and no geometry change.`

Outpainting erhält einen eigenen Kern: Der sichtbare Ausgangsbereich bleibt
pixel- und geometrienah; nur der angeforderte Rand wird plausibel erweitert.
Eine Erweiterung darf nicht als dokumentarisch echte Objektinformation
dargestellt werden.

## Abnahme pro Generation

Nur `PASS`, wenn alle Punkte erfüllt sind:

1. Exakt eine Bewegung, richtige Richtung, kein Rücklauf und kein Schnitt.
2. Wände, Fenster, Türen, Möbel und Proportionen bleiben stabil.
3. Keine neu erfundenen oder verschwundenen Objekte.
4. Mindestens 1,5 s ohne Anlaufartefakt oder Endverformung nutzbar.
5. 9:16-Ausschnitt entspricht Daniels Rahmen; Hauptmotiv bleibt lesbar.
6. Rückwärtsableitung nur bei fachlich korrektem Gegenmove.

Fehlercodes für gezielte Wiederholung: `WRONG_DIRECTION`, `CROP_NOT_CAMERA`,
`GEOMETRY_DRIFT`, `OBJECT_MUTATION`, `EXTRA_MOTION`, `NO_CLEAN_1_5S`,
`FRAME_MISMATCH`.

## Ablauf der nächsten Tage

1. Daniel meldet Flow einmal persönlich an; keine Passwort- oder 2FA-Übergabe.
2. Kontostand, verfügbare Modelle und sichtbare Kosten im Konto prüfen.
3. Fünferpilot zuerst mit Gemini Omni Flash durchführen, herunterladen und den
   vollständigen Clip auf 1,5 s beschleunigen.
4. Nur für Aufgaben, die einen verbindlichen Qwen-Endframe benötigen, denselben
   Bildinhalt zusätzlich mit Veo 3.1 First+Last prüfen. Omni akzeptiert
   Bildreferenzen, unterstützt in der aktuellen API aber keine echte
   Start-/Endframe-Interpolation.
5. Erst nach dem Omni-/Veo-Google-Pilot Kling 3.0 und MiniMax H3 bei den noch
   unzureichenden Aufgaben als Vergleich testen.
6. Eine sichtbare Entscheidung pro Bewegungsart treffen; nicht zwingend ein
   einziges Serienmodell für alle Verfahren festschreiben.
7. Pro Tag eine zusammengehörige Bewegungsfamilie generieren; Resultate sofort
   mit Prompt, Modell, Credits und Fehlercode protokollieren.
8. Erst bestandene Clips in die Katalog-URLs übernehmen; Platzhalter bleiben bei
   fehlenden oder unehrlichen Ergebnissen sichtbar.

## Provider-Audit 2026-08-12: MiniMax und Kling

### Tatsächlicher Anbindungsstand im gemeinsamen Videostudio

- Der Shared-Code besitzt bereits eine providerneutrale Capability-Registry
  mit getrennten Fähigkeiten für Perspektivwechsel, Start-/Endframe-
  Übergänge, Referenzszenen, Videoverlängerung und Clip-Prüfung.
- Erzeugte Videoclips können serverseitig geprüft, als vorbereitete Assets
  übernommen und vom bestehenden Renderer verarbeitet werden.
- Produktiv angeschlossen sind aber noch keine generativen Video-Provider:
  weder Google/Veo noch MiniMax/Hailuo/H3 noch Kling besitzen derzeit einen
  Studio-Worker-Adapter.
- Google/Flow wurde manuell in der Weboberfläche erprobt. Das ist noch keine
  automatisierbare API-Anbindung.
- Qwen Multiple Angles ist als erprobter Fal-Einzelrunner vorhanden; Qwen
  Image Layered besitzt zusätzlich eine begrenzte Lab-Bridge. Beides ist noch
  kein allgemeiner Produktionsadapter der gemeinsamen Werkstatt.
- Nächster technischer Schritt ist deshalb ein kleiner reproduzierbarer
  **Gemini-Omni-Testadapter** mit einheitlichem Ein-/Ausgabemanifest. Erst nach
  dem Google-Pilot werden bei Bedarf Kling-/MiniMax-Testadapter ergänzt. Die in
  einem gemeinsamen Pilot bestandenen Modelle werden als dauerhafte Worker-
  Routen registriert; die sichtbare UI bleibt fähigkeits- statt
  providernamenzentriert.

### Google Gemini Omni Flash – vorrangiger Kandidat

- Aktuelles Preview-Modell: `gemini-omni-flash-preview`; Videoausgabe 3-10 s,
  720p, 24 fps, Text-/Bild-/Videoeingabe und konversationelle Folge-Edits.
- Google dokumentiert Omni ausdrücklich als Standardwahl für neue
  Videogenerierung. Veo 3.1 ist der Spezialweg für letzten Frame,
  Verlängerung und alte Pipelines.
- API-Preis rund 0,10 USD pro Ausgabesekunde; ein 3-s-Pilot kostet damit rund
  0,30 USD. Flow besitzt daneben das tägliche kostenlose Creditkontingent.
- Harte aktuelle Grenze: Omni unterstützt in der API keine Videoverlängerung
  und keine echte Interpolation zwischen erstem und letztem Frame. Ein
  Qwen-Perspektivbild kann als zusätzliche Referenz dienen, ist aber kein
  garantiertes Endbild. Dafür bleibt Veo 3.1 First+Last erforderlich.
- Deshalb zuerst Omni allein und mit Bildreferenzen testen; erst bei einem
  konkret festgestellten Defizit Kling oder MiniMax danebenstellen.

### MiniMax Hailuo 2.3

- Offizielle API: Text-to-Video und Image-to-Video mit einem Startbild;
  768p für 6 oder 10 Sekunden, 1080p für 6 Sekunden, 24 fps.
- 15 dokumentierte Kamerabefehle umfassen Truck, Pan, Push/Pull, Pedestal,
  Tilt, Zoom, Shake, Tracking und Static. Das ist Bewegungssteuerung, aber
  keine Garantie unveränderter Raumgeometrie.
- Pay-as-you-go: 2.3 Fast kostet 0,19 USD für 768p/6 s beziehungsweise
  0,33 USD für 1080p/6 s; reguläres 2.3 kostet 0,28/0,49 USD.
- Harte Einschränkung für Daniels Qwen-Weg: Der dokumentierte Start- plus
  Endframe-Endpunkt akzeptiert nicht Hailuo 2.3, sondern nur Hailuo-02.
- Hailuo 2.3 steht inzwischen unter den Legacy-Modellen. Vor einer neuen
  Integration muss deshalb auch MiniMax H3 geprüft werden: multimodale
  Eingaben inklusive Start/Ende und Referenzen, 4-15 s, 768p/2K,
  0,08 USD/s in 768p.

### Kling Video 3.0 / 3.0 Omni

- Offiziell vorhanden: Text-to-Video, Image-to-Video sowie Start- und
  Endframe-to-Video; flexible Dauer von 3 bis 15 Sekunden.
- Für die 1,5-s-Demos ist 3 s besonders passend: vollständig generieren und
  auf 1,5 s mit Faktor 2 beschleunigen.
- Single-Shot und Audio aus sind für Bewegungsdemos Pflicht. Multi-Shot,
  natives Audio und Dialog sind eher für längere Immobilienfilme relevant.
- Elementreferenzen können Gegenstände oder Szenenmerkmale über mehrere
  Perspektiven stabilisieren; dies ist ein Kandidat zum Fixieren von Sessel,
  Kamin oder Kücheninsel, aber noch kein Beweis für unveränderte
  Gesamtarchitektur.
- 3.0 Omni akzeptiert mehrere Bilder/Elemente und optional ein Referenzvideo;
  damit ist es funktional der deutlich passendere Kandidat für den
  Qwen-Start/Ende-Workflow und später für Storyboards.
- Oberflächenpreis ohne Audio: 6 Credits/s in 720p und 8 Credits/s in 1080p.
  Bei 3 s sind das 18 beziehungsweise 24 Credits. API-Preis und
  Produktzugang müssen vor Integration separat im Open-Platform-Konto
  verifiziert werden; UI-Credits sind nicht automatisch der API-Vertrag.

### Vorläufige Einordnung

- Hailuo 2.3 Fast: Ein-Stern-Kandidat für billige Startbild-Piloten, wenn
  Geometrie nicht aus einem zweiten Frame festgelegt werden muss.
- Kling 3.0: Zwei-Sterne-Kandidat für kurze, kontrollierte Start-/Endframe-
  Bewegungen. Qwen-Kosten kommen bei Perspektivänderung hinzu.
- Kling 3.0 Omni: Drei-Sterne-Kandidat für mehrere Referenzen, Elemente,
  Video-Referenzen oder längere Storyboards; für eine einfache 1,5-s-Demo
  meist unnötig.
- Keine Provideraufnahme ohne denselben kontrollierten Bildinhalt, sichtbare
  Geometrieprüfung und getrennte Klärung von API-Zugang und Kosten. Das
  Zwischenformat darf sich nach den Fähigkeiten des jeweiligen Schritts
  richten; abgenommen wird das daraus herstellbare 9:16-Endergebnis.

## Stopregeln

- Kein Kauf, Abo, Auto-Reload oder Modellwechsel ohne Daniels sichtbare
  Entscheidung.
- Keine Generation nur zum Aufbrauchen verfallender Credits.
- Keine geometrisch fehlerhafte Demo als „ungefähr ausreichend“ einbauen.
- Originalmotiv und Rahmenreferenz niemals überschreiben.
