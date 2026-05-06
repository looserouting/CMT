/**
 * CMT - Consent Manager Tag :: Konfigurationsdatei
 * =================================================
 * Hier definiert der Entwickler alle Kategorien, Cookies und Skripte.
 * Jede Kategorie enthält einzelne Items, die der Benutzer
 * individuell an- oder abwählen kann.
 */
window.CMT_CONFIG = {
  /**
   * categories: Array von Kategorie-Objekten.
   * Jede Kategorie hat:
   *   - id:          Eindeutige Kennung (wird für localStorage verwendet)
   *   - name:        Anzeigename im Banner
   *   - description: Kurzbeschreibung (wird im Banner angezeigt)
   *   - required:    true = immer aktiv, nicht abwählbar (z.B. funktional)
   *   - items:       Array von Einzel-Diensten in dieser Kategorie
   *
   * Jedes Item hat:
   *   - id:          Eindeutige Kennung
   *   - name:        Anzeigename
   *   - description: Kurzbeschreibung
   *   - type:        "cookie" | "script" | "both"
   *   - cookies:     Array von Cookie-Namen, die gesetzt werden dürfen  (optional)
   *   - scripts:     Array von Script-Objekten { src?, inline?, async?, defer? } (optional)
   */
  categories: [
    {
      id: "functional",
      name: "Notwendig (Funktional)",
      description: "Erforderlich für die Grundfunktionen der Website. Können nicht deaktiviert werden.",
      required: true,
      items: [
        {
          id: "session-cookie",
          name: "Session-Cookie",
          description: "Wird für die Sitzungsverwaltung und grundlegende Sicherheit benötigt.",
          type: "cookie",
          cookies: ["PHPSESSID", "sessionid"],
          scripts: []
        },
        {
          id: "csrf-token",
          name: "CSRF-Token",
          description: "Schützt Formulare vor Cross-Site-Request-Forgery-Angriffen.",
          type: "cookie",
          cookies: ["csrftoken", "XSRF-TOKEN"],
          scripts: []
        }
      ]
    },
    {
      id: "analytics",
      name: "Analytics & Statistik",
      description: "Helfen uns zu verstehen, wie Besucher mit der Website interagieren.",
      required: false,
      items: [
        {
          id: "google-analytics",
          name: "Google Analytics",
          description: "Webanalyse-Dienst von Google. Erfasst Seitenaufrufe und Nutzerinteraktionen.",
          type: "script",
          cookies: ["_ga", "_gid", "_gat"],
          scripts: [
            { src: "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID", async: true },
            { inline: "window.dataLayer = window.dataLayer || []; function gtag(){window.dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'GA_MEASUREMENT_ID');" }
          ]
        },
        {
          id: "matomo",
          name: "Matomo (selbstgehostet)",
          description: "Open-Source-Webanalyse, auf eigenem Server betrieben.",
          type: "script",
          cookies: ["_pk_id", "_pk_ses", "_pk_ref"],
          scripts: [
            { src: "/matomo/matomo.js", async: true, defer: true },
            { inline: "var _paq = window._paq || []; _paq.push(['trackPageView']); _paq.push(['enableLinkTracking']);" }
          ]
        }
      ]
    },
    {
      id: "marketing",
      name: "Marketing & Tracking",
      description: "Werden verwendet, um personalisierte Werbung anzuzeigen und Kampagnen zu messen.",
      required: false,
      items: [
        {
          id: "facebook-pixel",
          name: "Facebook Pixel",
          description: "Tracking-Pixel von Meta für Werbekampagnen und Remarketing.",
          type: "script",
          cookies: ["_fbp", "fr"],
          scripts: [
            { src: "https://connect.facebook.net/en_US/fbevents.js", async: true },
            { inline: "fbq('init', 'PIXEL_ID'); fbq('track', 'PageView');" }
          ]
        },
        {
          id: "google-ads",
          name: "Google Ads Conversion",
          description: "Conversion-Tracking für Google Ads Kampagnen.",
          type: "script",
          cookies: ["_gcl_au", "_gcl_aw"],
          scripts: [
            { src: "https://www.googletagmanager.com/gtag/js?id=AW-CONVERSION_ID", async: true },
            { inline: "gtag('config', 'AW-CONVERSION_ID');" }
          ]
        },
        {
          id: "hubspot",
          name: "HubSpot Tracking",
          description: "Marketing-Automatisierung und Lead-Tracking von HubSpot.",
          type: "script",
          cookies: ["hubspotutk", "__hstc", "__hssc", "__hssrc"],
          scripts: [
            { src: "https://js.hs-scripts.com/HUBSPOT_ID.js", async: true, defer: true }
          ]
        }
      ]
    }
  ],

  /**
   * Einstellungen für das Banner (optional)
   */
  settings: {
    bannerTitle: "🍪 Cookie- & Datenschutzeinstellungen",
    bannerDescription: "Wir verwenden Cookies und Skripte, um unsere Website zu verbessern. Bitte wählen Sie, welche Dienste Sie erlauben möchten.",
    privacyUrl: "/datenschutz",
    privacyLabel: "Mehr erfahren",
    acceptAllLabel: "Alle akzeptieren",
    acceptSelectedLabel: "Auswahl speichern",
    rejectAllLabel: "Alle ablehnen",
    showSettingsButton: true,
    buttonPosition: "bottom-right" // "bottom-right" | "bottom-left"
  }
};