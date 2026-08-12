# Video-Studio: Sollkonzept und verbindliche Arbeitsreihenfolge

Stand: 10. August 2026  
Status: Diskussionsgrundlage – noch keine Freigabe zur weiteren Umsetzung

## 1. Ziel dieses Dokuments

Dieses Dokument beschreibt den vollständigen Ablauf des Video-Studios, bevor weitere Oberflächen gebaut oder weitere Deployments erstellt werden. Es trennt bewusst:

1. die Handlung des Users,
2. die unmittelbar sichtbare Reaktion der Oberfläche,
3. die Aktion des Systems im Hintergrund,
4. das Ergebnis, das anschließend weiterbearbeitet werden kann.

Der wichtigste Grundsatz lautet:

> Der User darf zu keinem Zeitpunkt eine Auswahl „abschicken“ müssen, um erst danach zu erfahren, wie seine Auswahl in der Timeline aussieht.

Galerie, Auswahl und Timeline gehören deshalb zu einer gemeinsamen Werkbank. Jede Entscheidung muss sofort sichtbar und korrigierbar sein.

## 2. Produktgrenze

Die Video-Werkstatt soll von zwei Portalen verwendet werden können:

- PixImmo
- PixCapture

Beide Portale greifen auf dieselbe fachliche Video-Engine und dasselbe Werkstattprinzip zu. Trotzdem bleiben Kunden, Projekte, Bilder, Berechtigungen und erzeugte Videos strikt nach Portal und Kunde getrennt.

Die Portale können unterschiedliche Eingangsqualitäten und Bildgrößen liefern. Deshalb dürfen Bewegung, Zoom und 9:16-Ausschnitt nicht pauschal identisch behandelt werden.

Nicht Bestandteil des ersten durchgehenden Ablaufs sind automatisch ausgeführte kostenpflichtige Generierungen wie Qwen Image Edit, Fake-Drone-Shots oder animiertes Wasser. Solche Möglichkeiten können vorgeschlagen werden, werden aber nur nach einer ausdrücklichen Entscheidung des Users erzeugt.

## 3. Grundaufbau der Werkbank

Die Werkbank besteht nicht aus mehreren voneinander getrennten Überraschungsseiten. Sie besteht aus einer durchgehenden Arbeitsansicht mit drei gleichzeitig verständlichen Bereichen.

### Bereich A: Projekt und Vorgaben

Dieser Bereich zeigt:

- Projektname und Jobnummer,
- Portalherkunft PixImmo oder PixCapture,
- Anzahl der verfügbaren Bilder,
- gewünschtes Format, zunächst 9:16,
- gewünschte ungefähre Videolänge, zum Beispiel 30 oder 45 Sekunden,
- aktuellen Speicherstatus,
- aktuellen Preview-Status.

### Bereich B: Galerie und Taxonomie

Dieser Bereich zeigt alle Bilder des gewählten Projekts als echte Vorschaubilder. Jedes Bild zeigt mindestens:

- Raum- oder Motivbezeichnung,
- Taxonomie, zum Beispiel Außenansicht, Wohnzimmer, Küche, Detail,
- Bildformat und verfügbare Pixelgröße,
- gegebenenfalls einen Qualitätshinweis,
- seinen Auswahlzustand,
- seine aktuelle Position im Film, falls es bereits ausgewählt ist.

Filter nach Außen, Innen, Detail und Raumbezeichnung dürfen nur die Ansicht filtern. Sie verändern niemals unbemerkt die Auswahl.

### Bereich C: Immer sichtbare Timeline

Sobald das erste Bild ausgewählt wird, erscheint es sofort als Clip in der Timeline. Die Timeline bleibt während der weiteren Bildauswahl sichtbar.

Die Timeline zeigt:

- eine horizontale Zeitachse,
- echte Bildvorschauen in den Clips,
- die Reihenfolge von links nach rechts,
- eine sichtbare Startmarkierung am ersten Clip,
- eine sichtbare Endmarkierung am letzten Clip,
- die Dauer jedes Clips,
- die daraus resultierende Gesamtdauer,
- die Differenz zur gewünschten Videolänge,
- später den vorgeschlagenen Bewegungstyp je Clip.

Die Breite eines Clips entspricht seiner Dauer. Ein Clip mit drei Sekunden ist dreimal so breit wie ein Clip mit einer Sekunde.

## 4. Verbindlicher User-Ablauf

## Schritt 1: Projekt öffnen

### User-Aktion

Der User öffnet im PixImmo- oder PixCapture-Portal ein konkretes Projekt und wählt „Video erstellen“ beziehungsweise „In der Video-Werkstatt öffnen“.

### Sofort sichtbare Reaktion

Die Werkbank öffnet genau dieses Projekt. Der User sieht alle verfügbaren Bilder. Es werden keine Demo-Motive, Bilder anderer Jobs oder Bilder anderer Kunden gezeigt.

### Systemaktion

Das System lädt:

- Portal- und Kundenkennung,
- Projektkennung,
- freigegebene Bild-Assets,
- Taxonomie und Beschreibungen,
- technische Bilddaten,
- einen eventuell vorhandenen Video-Entwurf.

### Ergebnis

Der User befindet sich in einer eindeutigen, isolierten Projektwerkbank. Ist bereits ein Entwurf vorhanden, wird exakt dieser weitergeführt.

## Schritt 2: Videolänge als Ziel setzen

### User-Aktion

Der User wählt zum Beispiel 30 oder 45 Sekunden. Später kann auch eine freie Zielzeit möglich sein.

### Sofort sichtbare Reaktion

Die Timeline zeigt die gewählte Zielzeit. Zusätzlich wird eine unverbindliche Empfehlung für die Anzahl der Bilder angezeigt.

Beispiel:

- 30 Sekunden: ungefähr 10 bis 15 Bilder,
- 45 Sekunden: ungefähr 15 bis 22 Bilder.

### Systemaktion

Das System setzt nur ein Planungsziel. Es wählt nicht automatisch Bilder aus und entfernt keine Bilder.

### Ergebnis

Der User kennt den zeitlichen Rahmen, bleibt aber frei in seiner Auswahl.

## Schritt 3: Bilder auswählen

### User-Aktion

Der User klickt ein Bild in der Galerie an.

### Sofort sichtbare Reaktion

Das Bild wird ohne Seitenwechsel sofort:

- als ausgewählt markiert,
- mit seiner laufenden Position versehen,
- am Ende der sichtbaren Timeline eingefügt,
- mit einer vorläufigen Dauer dargestellt.

Beim erneuten Anklicken wird das Bild aus der Timeline entfernt. Die verbleibenden Clips rücken sichtbar zusammen.

### Systemaktion

Die Auswahl wird zunächst als Entwurf gespeichert. Dafür ist kein Knopf nötig, der erst eine neue Ansicht freischaltet. Eine kleine Statusanzeige zeigt „Wird gespeichert“, „Gespeichert“ oder einen konkreten Fehler.

### Ergebnis

Der User sieht während der Auswahl jederzeit, wie viele Bilder bereits im Film liegen, wie die Reihenfolge aussieht und welche ungefähre Dauer daraus entsteht.

## Schritt 4: Startbild, Endbild und Reihenfolge festlegen

### User-Aktion

Der User zieht Clips innerhalb der Timeline an eine andere Position. Alternativ kann er ein Bild ausdrücklich als Start oder Ende setzen.

### Sofort sichtbare Reaktion

Die Timeline ordnet sich unmittelbar neu. Positionsnummern, Startmarkierung, Endmarkierung und Zeitangaben werden sofort aktualisiert.

### Systemaktion

Das System aktualisiert den Entwurf und speichert die neue Reihenfolge. Es erzeugt noch kein Video.

### Ergebnis

Die Geschichte besitzt eine vom User festgelegte Reihenfolge. Der User muss nicht raten, wie die Sortierung später aussehen wird.

## Schritt 5: Dauer und Rhythmus bestimmen

### User-Aktion

Der User kann pro Clip eine Dauer von beispielsweise einer, zwei oder drei Sekunden wählen. Eine spätere feinere Eingabe kann ergänzt werden.

### Sofort sichtbare Reaktion

Der Clip wird auf der Zeitachse entsprechend breiter oder schmaler. Alle nachfolgenden Zeitmarken sowie die Gesamtdauer ändern sich sofort.

Die Oberfläche zeigt verständlich:

- aktuelle Gesamtdauer,
- Zielzeit,
- noch freie Zeit oder Überschreitung,
- durchschnittliche Dauer je Motiv.

### Systemaktion

Das System speichert die Dauer im Szenenentwurf. Es bewertet außerdem, ob die gewählte Dauer für die später geplante Bewegung technisch plausibel ist.

### Ergebnis

Vor jeder Analyse steht bereits ein sichtbarer, vom User bestimmter Rohschnitt aus Bildern und Zeiten.

## Schritt 6: Automatische Analyse und Bewegungsvorschläge

### User-Aktion

Der User startet die Analyse oder aktiviert sie für den vorhandenen Entwurf.

### Systemaktion

Das System untersucht pro Bild mindestens:

- Taxonomie und Motivbeschreibung,
- Bildformat und Pixelgröße,
- mögliche 9:16-Ausschnitte,
- Hauptmotiv und wichtige Bildelemente,
- freie Flächen und Schnittreserven,
- Schärfe- und Qualitätsreserven,
- Position des Bildes innerhalb der Geschichte,
- Dauer des Clips,
- Bewegung der vorherigen und folgenden Szene.

Danach schlägt es passende Bewegungen vor, zum Beispiel:

- ruhiges Stehen,
- Zoom-in beziehungsweise sanftes Näherkommen,
- Zoom-out beziehungsweise Öffnen,
- Ken Burns von links nach rechts,
- Ken Burns von rechts nach links,
- Bewegung von unten nach oben,
- Bewegung von oben nach unten,
- zurückhaltende Detailbewegung.

### Sofort sichtbare Reaktion

Jeder Vorschlag erscheint direkt am betreffenden Timeline-Clip. Er wird ausdrücklich als Vorschlag bezeichnet und enthält eine kurze Begründung.

Beispiel:

> Vorschlag: sanft öffnen. Begründung: Außenansicht am Filmbeginn mit ausreichender Auflösungsreserve und zentralem Gebäude.

### Ergebnis

Der User kann jeden Vorschlag übernehmen, verändern oder auf „ruhig“ setzen. Kein Vorschlag wird heimlich verbindlich.

## Schritt 7: 9:16-Ausschnitt und Bewegung visuell prüfen

### User-Aktion

Der User klickt einen Clip in der Timeline an.

### Sofort sichtbare Reaktion

Ein Szeneneditor öffnet sich, ohne den Zusammenhang der Timeline zu verlieren. Er zeigt das echte Bild im 9:16-Rahmen und eine abspielbare Vorschau der vorgeschlagenen Bewegung.

Der User kann:

- Start- und Endausschnitt sehen,
- den Ausschnitt verschieben,
- Zoomstärke reduzieren,
- Bewegung ändern,
- Dauer ändern,
- Bewegung deaktivieren,
- Text für diese Szene ergänzen.

### Systemaktion

Das System prüft jede Änderung gegen die verfügbare Bildauflösung. Bewegungen, die zu stark vergrößern oder wichtige Bildteile abschneiden, werden markiert oder begrenzt.

PixCapture- und PixImmo-Bilder können unterschiedliche Grenzwerte erhalten, weil ihre gelieferten Pixelgrößen unterschiedlich sein können.

### Ergebnis

Der User beurteilt nicht nur eine Bezeichnung wie „Zoom-in“, sondern sieht den tatsächlichen späteren Bildausschnitt und Bewegungsverlauf.

## Schritt 8: Text pro Szene

### User-Aktion

Der User aktiviert Text für eine Szene und gibt Inhalt, Position und einen typografischen Stil vor.

### Sofort sichtbare Reaktion

Der Text erscheint direkt in der Szenenvorschau. Er wird innerhalb der 9:16-Sicherheitsbereiche dargestellt.

### Systemaktion

Das System speichert:

- Textinhalt,
- Typografie-Voreinstellung,
- Position,
- Ein- und Ausblendverhalten,
- Kontrast- und Lesbarkeitsprüfung.

### Ergebnis

Die bewährte Textmöglichkeit der bisherigen PixImmo-Werkstatt bleibt erhalten, wird aber in den gemeinsamen Szenenablauf integriert.

## Schritt 9: Erweiterte KI- und Spezialbewegungen anbieten

### Systemaktion

Erst wenn die normale Bildbewegung und der 9:16-Ausschnitt feststehen, kann das System besondere Möglichkeiten erkennen und anbieten:

- Text hinter einer Wand oder einem Gebäude hervorkommen lassen,
- fließendes Wasser animieren,
- vorbeifahrende oder verwischte Fahrzeuge,
- Perspektivwechsel,
- Kreisfahrt,
- Fake-Drone-Shot,
- selektive Bewegung einzelner Bildelemente.

### Sofort sichtbare Reaktion

Der Vorschlag wird separat gekennzeichnet und zeigt vor der Ausführung:

- was verändert würde,
- welches Modell oder welcher Verarbeitungsweg vorgesehen ist,
- erwartete Kosten,
- erwartete Bearbeitungszeit,
- mögliche Qualitätsrisiken.

### User-Aktion

Der User entscheidet ausdrücklich, ob diese Variante erzeugt werden soll.

### Ergebnis

Normale Timeline-Arbeit bleibt schnell und kalkulierbar. Kostenpflichtige oder generative Spezialeffekte sind bewusste Einzelentscheidungen.

## Schritt 10: Zusammengestellte Preview erzeugen

### User-Aktion

Der User wählt „Preview erstellen“.

### Systemaktion

Das System friert eine versionierte Kopie des aktuellen Entwurfs ein und rendert daraus eine Preview mit:

- gewählter Bildreihenfolge,
- festgelegten Dauern,
- bestätigten Bewegungen,
- Texten,
- Übergängen,
- gewähltem Seitenverhältnis.

### Sofort sichtbare Reaktion

Der Auftrag zeigt einen nachvollziehbaren Status:

- vorbereitet,
- wartet,
- wird gerendert,
- fertig,
- fehlgeschlagen mit konkretem Grund.

Die Seite wartet nicht blind. Eine fertige Preview wird automatisch oder über einen klaren Aktualisieren-Mechanismus angezeigt.

### Ergebnis

Der User sieht erstmals den gesamten Ablauf als Video, ohne seinen editierbaren Entwurf zu verlieren.

## Schritt 11: Preview korrigieren

### User-Aktion

Der User springt aus der Preview zu einer Szene oder Zeitposition zurück.

### Sofort sichtbare Reaktion

Die zugehörige Szene wird in der Timeline markiert. Der User kann Reihenfolge, Dauer, Bewegung, Text oder Ausschnitt korrigieren.

### Systemaktion

Die Änderung erzeugt eine neue Entwurfsversion. Die alte Preview bleibt als Vergleich erhalten, bis eine neue Preview fertig ist.

### Ergebnis

Korrekturen sind gezielt möglich. Es muss nicht wieder bei der Bildauswahl begonnen werden.

## Schritt 12: Finales Video erzeugen und ausgeben

### User-Aktion

Nach Freigabe der Preview startet der User den finalen Export.

### Systemaktion

Das System rendert die freigegebene Version in den vorgesehenen Qualitätsstufen und speichert das Ergebnis beim korrekten Portal, Kunden und Projekt.

### Ergebnis

Das fertige Video kann angezeigt, heruntergeladen oder für die vorgesehenen Social-Media-Ausgaben weiterverarbeitet werden.

## 5. Datenzustände des Entwurfs

Ein Video-Projekt sollte verständliche Zustände besitzen:

1. **Noch nicht begonnen** – keine Bilder ausgewählt.
2. **Entwurf** – Auswahl, Reihenfolge oder Dauer wird bearbeitet.
3. **Analyse vorhanden** – Bewegungsvorschläge liegen vor.
4. **Szenen geprüft** – Ausschnitte und Bewegungen wurden bestätigt oder angepasst.
5. **Preview wird erstellt** – eine versionierte Entwurfsfassung wird gerendert.
6. **Preview verfügbar** – vollständige Vorschau kann beurteilt werden.
7. **Korrektur** – Entwurf wurde nach einer Preview verändert.
8. **Freigegeben** – eine konkrete Version ist für den finalen Export bestätigt.
9. **Final wird gerendert**.
10. **Final verfügbar**.
11. **Fehlgeschlagen** – mit wiederholbarer Aktion und konkreter Fehlermeldung.

## 6. Speicherprinzip

Die Werkbank benötigt kein „Absenden, um die nächste Darstellung zu sehen“.

Vorgeschlagenes Prinzip:

- Jede Änderung wird sofort lokal sichtbar.
- Auswahl, Reihenfolge und Dauer werden kurz verzögert als Entwurf gespeichert.
- Der Speicherstatus ist sichtbar.
- Bei einem Speicherfehler bleibt der lokale Stand erhalten und wird klar markiert.
- Preview und finaler Export arbeiten immer mit einer ausdrücklich versionierten Fassung.
- Ein Preview-Start ist kein gewöhnliches Speichern, sondern ein bewusster Verarbeitungsschritt.

Damit werden unmittelbares Arbeiten und reproduzierbare Renderstände miteinander verbunden.

## 7. Taxonomie

Die vorhandene Taxonomie muss durchgehend übernommen werden. Sie ist nicht nur ein Filteretikett, sondern Grundlage für Analyse und Vorschläge.

Mindestens zu unterscheiden sind:

- Außenansicht,
- Innenraum,
- Detail,
- konkrete Raumbezeichnung,
- Übersichtsaufnahme oder Nahaufnahme,
- Hauptmotiv und Nebenmotiv,
- unsichere oder nicht klassifizierte Aufnahme.

Taxonomie wird verwendet für:

- Gruppierung in der Galerie,
- verständliche Clipbezeichnung,
- Bewegungsvorschläge,
- Dramaturgiehinweise,
- Erkennung ungewollter Wiederholungen,
- Vorschläge für Start- und Endmotive.

Ein Vorschlag darf die Taxonomie nutzen, sie aber nicht als unumstößliche Wahrheit behandeln. Der User entscheidet.

## 8. Technische Qualitätsregeln für Bewegung und Ausschnitt

Vor jedem Bewegungs- oder Zoomvorschlag sind mindestens zu prüfen:

- Eingangsauflösung,
- notwendiger 9:16-Ausschnitt,
- verbleibende Pixel nach dem Zuschnitt,
- zusätzliche Vergrößerung durch die Bewegung,
- Schärfereserve,
- Position wichtiger Motivteile,
- Gefahr abgeschnittener Gebäudekanten, Möbel oder Personen,
- Tonwert- oder Qualitätswarnungen aus dem vorhandenen Quality Management.

Ein Vorschlag erhält eine von drei Bewertungen:

- **sicher** – ausreichende technische Reserve,
- **eingeschränkt** – nur geringe Bewegung zulässig,
- **ungeeignet** – besser ruhiges Bild oder anderer Ausschnitt.

Das System soll Varianten erzeugen, nicht überall denselben mittigen 9:16-Ausschnitt verwenden. Unterschiedliche Start- und Endausschnitte müssen dennoch motivisch und technisch sinnvoll bleiben.

## 9. Portal- und Kundentrennung

Jede Serveraktion benötigt mindestens:

- Portalkennung,
- Kundenkennung,
- Projektkennung,
- Benutzerberechtigung,
- Asset-Kennung,
- Entwurfs- oder Versionskennung.

Der Server darf niemals nur anhand einer frei übergebenen Bild-URL arbeiten. Er muss prüfen, ob das Bild zum geöffneten Projekt, Kunden und Portal gehört.

PixImmo und PixCapture dürfen dieselbe Werkstattlogik verwenden, aber keine gemeinsamen ungefilterten Projektlisten oder Asset-Suchen besitzen.

## 10. Vorgeschlagene Umsetzungsreihenfolge

Weitere Umsetzung sollte nicht wieder als Folge vieler kleiner Deployments erfolgen. Vorgeschlagen ist diese Reihenfolge:

### Phase 1: Ablauf und Oberfläche festlegen

1. Dieses Sollkonzept gemeinsam korrigieren.
2. Einen einzigen verbindlichen Bildschirmaufbau festlegen.
3. Festlegen, welche Informationen Galerie und Timeline gleichzeitig zeigen.
4. Festlegen, wie Autosave und Versionsstatus sichtbar werden.
5. Erst danach Freigabe zur Umsetzung.

**Abnahmepunkt 1:** Der Ablauf ist in Text und gegebenenfalls einem statischen Wireframe verständlich. Noch kein Deployment notwendig.

### Phase 2: Galerie und sichtbare Entwurfs-Timeline

1. Projekt mit echten Bildern öffnen.
2. Taxonomie sichtbar übernehmen.
3. Anklicken fügt Bild sofort in die sichtbare Timeline ein.
4. Entfernen wirkt sofort.
5. Drag-and-drop ändert Reihenfolge sofort.
6. Start und Ende sind sichtbar.
7. Dauer ändert Clipbreite und Gesamtdauer sofort.
8. Entwurf wird gespeichert und nach Neuladen identisch wiederhergestellt.

**Abnahmepunkt 2:** Daniel kann mit Seeburg die Bildgeschichte vollständig zusammenstellen, ohne eine versteckte Folgeseite oder einen Renderjob zu benötigen.

### Phase 3: Szeneneditor und normale Bewegungen

1. 9:16-Ausschnitt anzeigen.
2. Start- und Endausschnitt einer Bewegung anzeigen.
3. Normale Bewegungen vorschlagen.
4. Begründung und Qualitätsbewertung anzeigen.
5. Bewegung, Dauer und Ausschnitt manuell ändern.
6. Text pro Szene integrieren.

**Abnahmepunkt 3:** Jede Szene kann visuell beurteilt werden, bevor eine Gesamtpreview erzeugt wird.

### Phase 4: Gesamtpreview

1. Entwurf versionieren.
2. Preview-Render starten.
3. Status zuverlässig aktualisieren.
4. Preview abspielen.
5. Von der Preview zur betroffenen Szene zurückspringen.
6. Neue Version nach Korrektur rendern.

**Abnahmepunkt 4:** Ein vollständiger Seeburg-Testfilm kann erstellt und gezielt korrigiert werden.

### Phase 5: Erweiterte KI-Funktionen

1. Geeignete Motive erkennen.
2. Spezialeffekt mit Begründung, Kosten und Risiko anbieten.
3. Einzelne Variante ausdrücklich beauftragen.
4. Ergebnis vor Übernahme vergleichen.
5. Erst nach Freigabe in die Timeline übernehmen.

**Abnahmepunkt 5:** Spezialeffekte erweitern einen funktionierenden Grundschnitt, ersetzen ihn aber nicht.

### Phase 6: PixCapture-Anbindung

1. Dasselbe Werkstattmodell verwenden.
2. PixCapture-Projekt- und Kundenisolation prüfen.
3. Auflösungsregeln für PixCapture-Bilder separat kalibrieren.
4. Einen vollständigen PixCapture-Testjob durchführen.

**Abnahmepunkt 6:** Beide Portale greifen auf dieselben Werkstattfunktionen zu, ohne Vermischung von Kunden oder Projekten.

## 11. Test- und Deployment-Regel für die weitere Arbeit

Für die nächsten Schritte sollte gelten:

1. Kleine Zwischenänderungen werden lokal mit echten oder repräsentativen Projektdaten geprüft.
2. Vor einem Deployment wird ein kompletter Abnahmepunkt fertiggestellt.
3. Pro Abnahmepunkt gibt es höchstens einen vorgesehenen Test-Deploy und anschließend, falls bestanden, einen Beta-Stand.
4. Beta wird nur umgestellt, wenn der direkte Teststand die vereinbarten Prüfungen bestanden hat.
5. Ein neuer Beta-Link wird erst genannt, wenn die für Daniel sichtbare Funktion wirklich erreichbar ist.
6. Für Seeburg werden keine redaktionellen Entscheidungen stillschweigend gespeichert.
7. Bei einer fachlichen Unklarheit wird nicht weitergebaut, sondern das konkrete Verhalten zuerst im Sollkonzept ergänzt.

## 12. Entscheidungen, die vor der nächsten Umsetzung bestätigt werden müssen

Folgende Punkte sind bewusst noch als Entscheidung offen:

1. Soll die Zielzeit nur 30/45 Sekunden oder frei wählbar sein?
2. Welche Standarddauer erhält ein neu ausgewähltes Bild: eine, zwei oder drei Sekunden?
3. Soll das System eine automatische Vorauswahl anbieten, oder ausschließlich Empfehlungen neben der manuellen Auswahl?
4. Soll Autosave jede Änderung speichern, oder soll zusätzlich ein sichtbarer „Entwurf sichern“-Knopf bestehen?
5. Welche Übergänge sind im ersten Grundumfang erlaubt?
6. Welche Textstile aus der bisherigen PixImmo-Werkstatt werden verbindlich übernommen?
7. Welche minimale Ausgabeauflösung ist je Portal für 9:16 und Zoom verbindlich?
8. Ab wann gilt eine Szene als „geprüft“?
9. Welche Musik- und Tonfunktionen gehören in den ersten vollständigen Ablauf?
10. Welche Spezialeffekte sollen zuerst angebunden werden und welche bleiben zunächst nur als Hinweis sichtbar?

## 13. Erwartetes Endergebnis

Wenn dieser Ablauf umgesetzt ist, kann ein User:

1. ein konkretes Projekt öffnen,
2. echte Bilder mit Taxonomie sehen,
3. Bilder auswählen und gleichzeitig in der Timeline sehen,
4. Start, Ende, Reihenfolge und Dauer festlegen,
5. begründete Bewegungsvorschläge erhalten,
6. jeden 9:16-Ausschnitt und jede Bewegung vorab prüfen,
7. Texte ergänzen,
8. optionale Spezialeffekte bewusst beauftragen,
9. eine vollständige Preview erzeugen,
10. gezielt korrigieren,
11. eine freigegebene Fassung final ausgeben,
12. denselben Ablauf getrennt in PixImmo und PixCapture verwenden.

Der zentrale Unterschied zum bisherigen Versuch ist: Der User arbeitet von Beginn an am sichtbaren Filmablauf. Es gibt keinen Schritt mehr, bei dem eine blinde Auswahl bestätigt werden muss, um erst anschließend das eigentliche Ergebnis sehen zu dürfen.
