# Recognition Review UI v0.1

## Zweck

Session 3 bereitet eine rudimentaere interne Review-Oberflaeche als Viewmodel
und Serverlogik vor. Sie ist keine finale Kunden-UI und keine Public Route.

## Dashboard

`internal/motion-lab/client/RecognitionDashboard.ts` formatiert Objektstatus
fuer eine interne Uebersicht.

Statuswerte:

```text
imported
recognized
needs_review
ready_for_planning
```

Das Dashboard zeigt:

- Root-Pfad
- Objektliste
- Status pro Objekt
- Anzahl Bilder
- Anzahl Bilder mit Review-Bedarf
- Anzahl nutzbare Bilder
- Warnungen

## Objekt-Review

`internal/motion-lab/client/ObjectRecognitionReview.ts` formatiert pro Objekt
ein Bild-Grid mit:

- Thumbnail-Pfad
- Dateiname
- `detected_room_type`
- `confirmed_room_type`
- Confidence
- `needs_manual_review`
- `composition_tags`
- `object_tags`
- `light_tags`
- `video_role_tags`
- `motion_risk_tags`
- Scores
- Summary

## Manuelle Korrektur

`internal/motion-lab/server/recognitionReview.ts` kann Korrekturen auf eine
Recognition-Datei anwenden.

Erlaubte Korrekturen:

- `confirmed_room_type` aendern
- `usable_for_video` true/false setzen
- `needs_manual_review` true/false setzen
- Tags ergaenzen oder entfernen
- `notes` schreiben

Wenn ein Bild geaendert wird, setzt die Logik:

```json
{
  "manual_override": true
}
```

## Speicherpfad

Korrekturen werden zurueckgeschrieben nach:

```text
work/{object_id}/analysis/image_recognition.json
```

## Planungsregel

Spaetere Shotplans duerfen nur `confirmed_room_type` verwenden.

Nicht erlaubt:

```text
detected_room_type blind fuer Planung verwenden
```

## Grenzen

Session 3 baut nicht:

- keine echte Web-App
- keine Public UI
- keine API-Route
- keine externe Recognition-API
- keinen Shotplan
- keine Videoerstellung
