# CMT – Consent Manager Tag

Ein datenschutzkonformer, granularer Consent-Manager für Websites. CMT generiert dynamisch ein Cookie-Banner und verwaltet die Einwilligung des Benutzers für einzelne Dienste – nicht nur pauschal pro Kategorie.

- **Keine Abhängigkeiten** – reines Vanilla-JavaScript
- **Granulare Zustimmung** – Benutzer können einzelne Cookies/Skripte pro Kategorie an- oder abwählen
- **Dynamisches Banner** – alles wird aus `cmt-config.js` generiert, kein HTML nötig
- **DSGVO-konform** – Consent wird in `localStorage` gespeichert und vor dem Laden von Skripten geprüft
- **MIT-lizenziert**

---

## Schnellstart

1. **`cmt-config.js`** und **`cmt.js`** in das Projekt kopieren.
2. Beide Dateien im `<head>` der Website einbinden – **`cmt-config.js` muss VOR `cmt.js` geladen werden**:

```html
<script src="cmt-config.js"></script>
<script src="cmt.js"></script>
```

3. Die `cmt-config.js` an die eigenen Dienste anpassen (siehe unten).
4. Fertig. Beim ersten Seitenaufruf erscheint das Banner automatisch.

> Eine vollständige Demo findet sich in [`demo.html`](demo.html).

---

## Einrichtung der `cmt-config.js`

Die gesamte Konfiguration erfolgt im globalen Objekt `window.CMT_CONFIG`. Die Datei ist bereits mit ausführlichen Beispielen vorausgefüllt und muss nur noch auf die eigene Website angepasst werden.

### Grundstruktur

```javascript
window.CMT_CONFIG = {
  categories: [ … ],
  settings: { … }
};
```

---

### 1. Kategorien (`categories`)

Jede Kategorie repräsentiert eine Gruppe von Diensten (z.B. Analytics, Marketing). Der Benutzer kann ganze Kategorien oder einzelne Dienste darin an- bzw. abwählen.

```javascript
{
  id: "analytics",           // Eindeutige ID (wird in localStorage verwendet)
  name: "Analytics & Statistik",  // Anzeigename im Banner
  description: "Helfen uns zu verstehen, wie Besucher …",  // Kurzbeschreibung
  required: false,           // true = immer aktiv, nicht abwählbar
  items: [ … ]              // Einzelne Dienste in dieser Kategorie
}
```

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `id` | `string` | Eindeutige Kennung der Kategorie (z.B. `"analytics"`, `"marketing"`) |
| `name` | `string` | Anzeigename im Banner |
| `description` | `string` | Kurzbeschreibung, wird unter dem Namen angezeigt |
| `required` | `boolean` | `true` = zwingend erforderlich, kann vom Benutzer nicht deaktiviert werden |
| `items` | `array` | Liste der Einzeldienste (siehe unten) |

---

### 2. Einzeldienste (`items`)

Jeder Dienst innerhalb einer Kategorie kann entweder ein Cookie, ein Skript oder beides sein.

```javascript
{
  id: "google-analytics",
  name: "Google Analytics",
  description: "Webanalyse-Dienst von Google. Erfasst Seitenaufrufe und Nutzerinteraktionen.",
  type: "script",            // "cookie" | "script" | "both"
  cookies: ["_ga", "_gid", "_gat"],
  scripts: [
    { src: "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID", async: true },
    { inline: "window.dataLayer = window.dataLayer || []; function gtag(){…}" }
  ]
}
```

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `id` | `string` | Eindeutige Kennung des Dienstes |
| `name` | `string` | Anzeigename im Banner |
| `description` | `string` | Kurzbeschreibung |
| `type` | `"cookie"` / `"script"` / `"both"` | Art des Dienstes |
| `cookies` | `string[]` | **Optional.** Liste der Cookie-Namen, die gesetzt bzw. bei Ablehnung gelöscht werden |
| `scripts` | `object[]` | **Optional.** Liste der auszuführenden Skripte |

#### Script-Objekte

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `src` | `string` | **Optional.** URL des externen Skripts |
| `inline` | `string` | **Optional.** Inline-JavaScript-Code |
| `async` | `boolean` | **Optional.** Lädt das Skript asynchron |
| `defer` | `boolean` | **Optional.** Lädt das Skript mit `defer` |

Ein Script-Objekt kann entweder `src` (extern) ODER `inline` (direkter Code) enthalten – oder beides in getrennten Einträgen. Beispiel für Google Analytics:

```javascript
scripts: [
  { src: "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX", async: true },
  { inline: "window.dataLayer = window.dataLayer || []; function gtag(){window.dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-XXXXXXXXXX');" }
]
```

---

### 3. Banner-Einstellungen (`settings`)

Alle Einstellungen sind optional. Fehlende Werte werden durch sinnvolle Defaults ersetzt.

```javascript
settings: {
  bannerTitle: "🍪 Cookie- & Datenschutzeinstellungen",
  bannerDescription: "Wir verwenden Cookies und Skripte, um unsere Website zu verbessern.",
  privacyUrl: "/datenschutz",
  privacyLabel: "Mehr erfahren",
  acceptAllLabel: "Alle akzeptieren",
  acceptSelectedLabel: "Auswahl speichern",
  rejectAllLabel: "Alle ablehnen",
  showSettingsButton: true,
  buttonPosition: "bottom-right"   // "bottom-right" | "bottom-left"
}
```

| Feld | Typ | Standard | Beschreibung |
|------|-----|----------|-------------|
| `bannerTitle` | `string` | `"🍪 Cookie-Einstellungen"` | Überschrift des Banners |
| `bannerDescription` | `string` | `"Bitte wählen Sie Ihre Präferenzen."` | Einleitungstext |
| `privacyUrl` | `string` | `"/datenschutz"` | Link zur Datenschutzerklärung |
| `privacyLabel` | `string` | `"Mehr erfahren"` | Linktext für die Datenschutzerklärung |
| `acceptAllLabel` | `string` | `"Alle akzeptieren"` | Text des „Alle akzeptieren"-Buttons |
| `acceptSelectedLabel` | `string` | `"Auswahl speichern"` | Text des „Auswahl speichern"-Buttons |
| `rejectAllLabel` | `string` | `"Alle ablehnen"` | Text des „Alle ablehnen"-Buttons |
| `showSettingsButton` | `boolean` | `true` | Zeigt einen schwebenden 🍪-Button zum erneuten Öffnen des Banners |
| `buttonPosition` | `"bottom-right"` / `"bottom-left"` | `"bottom-right"` | Position des Einstellungs-Buttons |

---

## Funktionsweise

### Ablauf

1. **Erster Seitenaufruf:** CMT prüft, ob bereits ein Consent in `localStorage` gespeichert ist.
2. **Kein Consent vorhanden:** Das Banner wird eingeblendet. Der Benutzer kann:
   - **Alle akzeptieren** – alle Kategorien & Dienste werden aktiviert
   - **Auswahl speichern** – nur die ausgewählten Dienste werden aktiviert
   - **Alle ablehnen** – nur zwingend erforderliche Kategorien (`required: true`) bleiben aktiv
3. **Consent gespeichert:** Das Banner erscheint nicht mehr. Erlaubte Skripte werden geladen, abgelehnte Cookies werden gelöscht.
4. **Nachträgliche Änderung:** Über den 🍪-Einstellungs-Button (falls aktiviert) kann der Benutzer seine Auswahl jederzeit ändern.

### Speicherort

Der Consent wird unter dem Schlüssel `cmt_consent` im `localStorage` des Browsers abgelegt. Zum Zurücksetzen (z.B. zum Testen) kann dieser Eintrag gelöscht werden:

```javascript
localStorage.removeItem('cmt_consent');
```

---

## Vollständiges Beispiel

```javascript
window.CMT_CONFIG = {
  categories: [
    {
      id: "functional",
      name: "Notwendig (Funktional)",
      description: "Erforderlich für die Grundfunktionen der Website.",
      required: true,
      items: [
        {
          id: "session",
          name: "Session-Cookie",
          description: "Sitzungsverwaltung.",
          type: "cookie",
          cookies: ["PHPSESSID"]
        }
      ]
    },
    {
      id: "analytics",
      name: "Analytics",
      description: "Anonyme Nutzungsstatistiken.",
      required: false,
      items: [
        {
          id: "matomo",
          name: "Matomo",
          description: "Selbstgehostete Webanalyse.",
          type: "script",
          cookies: ["_pk_id", "_pk_ses"],
          scripts: [
            { src: "/matomo/matomo.js", async: true, defer: true },
            { inline: "var _paq = window._paq || []; _paq.push(['trackPageView']);" }
          ]
        }
      ]
    }
  ],
  settings: {
    bannerTitle: "🍪 Cookie-Einstellungen",
    privacyUrl: "/datenschutz",
    buttonPosition: "bottom-left"
  }
};
```

---

## Projektstruktur

| Datei | Beschreibung |
|-------|-------------|
| `cmt-config.js` | **Konfigurationsdatei** – hier werden alle Kategorien, Dienste, Cookies und Skripte definiert |
| `cmt.js` | **Core-Engine** – generiert das Banner dynamisch, verwaltet Consent und führt Skripte aus |
| `demo.html` | Demo-Seite zur Veranschaulichung und zum Testen |
| `consentbanner.html` | Veralteter Platzhalter (Banner wird jetzt komplett von cmt.js generiert) |
| `LICENSE` | MIT-Lizenz |

> **Wichtig:** `cmt-config.js` muss VOR `cmt.js` im HTML geladen werden, da `cmt.js` auf das globale `window.CMT_CONFIG`-Objekt zugreift.

---

## Lizenz

MIT – siehe [`LICENSE`](LICENSE).