Chatgpt's Vorschlag mit dem getComputedStyle ist ein guter Ansatz
Komplett neue Funktion für Outlines, damit alles über die Klasse gesteuert werden kann, eventuell sogar mehrere Farben
Ansatz:
    Funktion für die Outline nimmt Array an Farben als Strings an
    Durch diesen Array loopen und dadurch den css String bauen
    Css String einfügen und hoffen dass mein Browser nicht 4 Dimensional wird

### Sonstige Todos
- Den CSS Code DRINGEND in mehrere Dateien einteilen, vielleicht sogar für jedes Objekt einzeln
    - Ein barebones CSS für meine zukünftige Webseite anfertigen
        - Folge davon: Noch mehr auf JS Seite
    - Wiederverwendbarkeit! Vielleicht einzelne Skripte und Stylesheets öffentlich auf dem Server speichern
- Den Js Code etwas sortieren und DRINGEND kommentieren
    - Comm muss auf jeden Fall aufgespalten werden
        - Teile aus Comm gehören in UI Updates
    - Jeder Datei ihren job überlassen und Dateien wie UI Updates in Sektionen aufteilen
- Gesetzte Normen im Js Code einhalten → einfacher damit zu arbeiten
- Modularität der Funktionen ausbauen, aktuell ist es gut aber da geht noch mehr
- Mehr Styles auf die Js Seite holen, damit die Seite "lebendiger" wirkt
- Anders "branding" sehr irrelevant aber es ist kein reines AI Memory mehr
- Lebendiger Text → Alle Attribute die für den Effekt gesetzt werden müssen in JS moven
    - erhöhte Modularität
- Nach Python call(s) die Ergebnisse automatisch nochmal an die KI senden und diese Antwort in gleicher Nachricht ausgeben

### Fazit:
Ich muss wohl oder übel in Obsidian ein Wiki darüber schreiben
Das wird anstrengend aber gute Dokumentation ist unfassbar Nützlich
Ich weiß ja teilweise jetzt schon nicht mehr, wie meine Sachen funktionieren

### Neuer Scheiß:
- User Account system
- Eigene Scripting Sprache
    - Modulares Backend System mit nodes
- Backfeeding
    - Funktioniert teilweise, bisschen debugging braucht es noch
- Dafür sorgen dass ein neues Textfeld erstellt wird wenn ein pyout generiert wurde
- pyouts verschiedenen antwortstreams zuordnen
    - vielleicht ein pyout objekt an eine filler methode senden um diese zu assoziieren
    - Außerdem werden Nachrichten von der Datenbank noch nicht gescheit geladen

Konkrete Aufgaben:
- [ ] Pyout überarbeiten, so dass Antwort streams fest zugeordnet sind
	- [ ] Dokumentation über die Message Klasse erstellen
- [ ] sendAction zu einer Funktion mit Rückgabewert machen und gesamte backend response zusammenführen -> konsistenz
- [ ] Word queue für das frontend um skipping zu vermeiden wenn die KI zu schnell ist