/**
 * CMT - Consent Manager Tag :: Core Engine
 * ==========================================
 * Liest die cmt-config.js aus und generiert das Banner dynamisch.
 * Erlaubt granulare Zustimmung je Einzel-Item innerhalb jeder Kategorie.
 */
(function () {
  "use strict";

  const CONSENT_KEY = "cmt_consent";
  const CONFIG = window.CMT_CONFIG;

  if (!CONFIG || !CONFIG.categories) {
    console.warn("[CMT] Keine gültige CMT_CONFIG gefunden. Banner wird nicht angezeigt.");
    return;
  }

  // ---- State ----

  /** Liefert gespeicherte Consent-Daten */
  function getConsent() {
    try {
      return JSON.parse(localStorage.getItem(CONSENT_KEY)) || null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(consent) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  }

  function hasSavedConsent() {
    return localStorage.getItem(CONSENT_KEY) !== null;
  }

  /**
   * Baut ein Standard-Consent-Objekt aus der Config.
   * { categoryId: { itemId: true/false, … }, … }
   */
  function buildDefaultConsent(allAccepted) {
    var consent = {};
    CONFIG.categories.forEach(function (cat) {
      consent[cat.id] = {};
      cat.items.forEach(function (item) {
        consent[cat.id][item.id] = cat.required ? true : allAccepted;
      });
    });
    return consent;
  }

  // ---- Script & Cookie Execution ----

  /** Führt ein einzelnes Script-Element aus (src oder inline) */
  function injectScript(scriptDef) {
    var s = document.createElement("script");
    if (scriptDef.src) {
      s.src = scriptDef.src;
    }
    if (scriptDef.async) s.async = true;
    if (scriptDef.defer) s.defer = true;
    if (scriptDef.inline) {
      s.textContent = scriptDef.inline;
    }
    document.head.appendChild(s);
  }

  /** Setzt ein Cookie (wird nur neu gesetzt, nicht gelöscht) */
  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + d.toUTCString();
    }
    document.cookie = name + "=" + (value || "1") + expires + "; path=/; SameSite=Lax";
  }

  /** Löscht ein Cookie */
  function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax";
  }

  /** Wendet die Consent-Entscheidung an: erlaubte Items laden, abgelehnte Cookies löschen */
  function applyConsent(consent) {
    CONFIG.categories.forEach(function (cat) {
      cat.items.forEach(function (item) {
        var allowed = consent[cat.id] && consent[cat.id][item.id];

        if (allowed) {
          // Scripts laden
          if (item.scripts && item.scripts.length) {
            item.scripts.forEach(function (s) {
              injectScript(s);
            });
          }
          // Cookies sind ggf. schon durch Scripts gesetzt; hier nur Platzhalter
          if (item.type === "cookie" || item.type === "both") {
            console.log("[CMT] Cookie(s) erlaubt: " + item.id + " – " + (item.cookies || []).join(", "));
          }
        } else {
          // Abgelehnt: zugehörige Cookies löschen
          if (item.cookies && item.cookies.length) {
            item.cookies.forEach(function (c) {
              deleteCookie(c);
            });
          }
        }
      });
    });
    console.log("[CMT] Consent angewendet.", consent);
  }

  // ---- Banner UI (dynamisch generiert) ----

  var bannerEl = null;
  var categoryCheckboxes = {};    // { catId: HTMLInputElement }
  var itemCheckboxes = {};        // { catId: { itemId: HTMLInputElement } }

  /** Erzeugt das komplette Banner-Element und hängt es ins DOM ein */
  function createBanner() {
    if (bannerEl) return;

    var settings = CONFIG.settings || {};
    var title = settings.bannerTitle || "🍪 Cookie-Einstellungen";
    var desc = settings.bannerDescription || "Bitte wählen Sie Ihre Präferenzen.";
    var privacyUrl = settings.privacyUrl || "/datenschutz";
    var privacyLabel = settings.privacyLabel || "Mehr erfahren";
    var acceptAllLabel = settings.acceptAllLabel || "Alle akzeptieren";
    var acceptSelectedLabel = settings.acceptSelectedLabel || "Auswahl speichern";
    var rejectAllLabel = settings.rejectAllLabel || "Alle ablehnen";

    // --- Container ---
    bannerEl = document.createElement("div");
    bannerEl.id = "cmt-banner";
    bannerEl.style.cssText =
      "position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #ccc;" +
      "padding:1.5em;display:none;z-index:1000;font-family:Arial,sans-serif;" +
      "box-shadow:0 -2px 10px rgba(0,0,0,0.1);max-height:80vh;overflow-y:auto;";

    // --- Titel ---
    var h3 = document.createElement("h3");
    h3.style.cssText = "margin:0 0 0.5em;font-size:1.1em;";
    h3.textContent = title;
    bannerEl.appendChild(h3);

    // --- Beschreibung ---
    var p = document.createElement("p");
    p.style.cssText = "margin:0 0 1em;font-size:0.9em;color:#555;";
    p.innerHTML = desc + ' <a href="' + privacyUrl + '" target="_blank">' + privacyLabel + "</a>";
    bannerEl.appendChild(p);

    // --- Kategorien-Container ---
    var catContainer = document.createElement("div");
    catContainer.style.cssText = "margin-bottom:1em;";

    CONFIG.categories.forEach(function (cat) {
      categoryCheckboxes[cat.id] = null; // wird unten gesetzt
      itemCheckboxes[cat.id] = {};

      // Kategorie-Wrapper
      var catDiv = document.createElement("div");
      catDiv.style.cssText = "border:1px solid #e0e0e0;border-radius:6px;margin-bottom:0.6em;overflow:hidden;";

      // ---- Kategorie-Header (checkbox + Name + Toggle-Pfeil) ----
      var header = document.createElement("div");
      header.style.cssText =
        "display:flex;align-items:center;padding:0.65em 0.75em;cursor:pointer;" +
        "background:#fafafa;user-select:none;";

      // Checkbox
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.id = "cmt-cat-" + cat.id;
      cb.style.cssText = "margin-right:0.75em;flex-shrink:0;";
      cb.checked = true; // default für "Alle akzeptieren"
      if (cat.required) {
        cb.checked = true;
        cb.disabled = true;
      }
      categoryCheckboxes[cat.id] = cb;

      cb.addEventListener("change", function () {
        syncCategoryItems(cat, cb.checked);
      });

      // Label-Bereich
      var labelDiv = document.createElement("div");
      labelDiv.style.cssText = "flex:1;";

      var strong = document.createElement("strong");
      strong.style.cssText = "font-size:0.9em;";
      strong.textContent = cat.name;
      labelDiv.appendChild(strong);

      var span = document.createElement("span");
      span.style.cssText = "display:block;font-size:0.8em;color:#888;";
      span.textContent = cat.description;
      labelDiv.appendChild(span);

      // Pfeil (toggle items visibility)
      var arrow = document.createElement("span");
      arrow.style.cssText =
        "margin-left:0.5em;font-size:0.8em;color:#888;transition:transform 0.2s;flex-shrink:0;";
      arrow.textContent = "▼";
      arrow.id = "cmt-arrow-" + cat.id;

      header.appendChild(cb);
      header.appendChild(labelDiv);
      header.appendChild(arrow);

      // ---- Item-Liste (ausklappbar) ----
      var itemList = document.createElement("div");
      itemList.id = "cmt-items-" + cat.id;
      itemList.style.cssText = "display:none;border-top:1px solid #e0e0e0;padding:0;";

      cat.items.forEach(function (item) {
        var itemLabel = document.createElement("label");
        itemLabel.style.cssText =
          "display:flex;align-items:flex-start;padding:0.6em 0.75em 0.6em 2.5em;" +
          "border-bottom:1px solid #f0f0f0;cursor:pointer;";

        var itemCb = document.createElement("input");
        itemCb.type = "checkbox";
        itemCb.id = "cmt-item-" + cat.id + "-" + item.id;
        itemCb.style.cssText = "margin-right:0.75em;margin-top:0.15em;flex-shrink:0;";
        itemCb.checked = true;
        if (cat.required) {
          itemCb.checked = true;
          itemCb.disabled = true;
        }
        itemCheckboxes[cat.id][item.id] = itemCb;

        itemCb.addEventListener("change", function () {
          syncCategoryFromItems(cat);
        });

        var itemText = document.createElement("div");
        var itemStrong = document.createElement("strong");
        itemStrong.style.cssText = "font-size:0.85em;";
        itemStrong.textContent = item.name;
        itemText.appendChild(itemStrong);

        var itemDesc = document.createElement("span");
        itemDesc.style.cssText = "display:block;font-size:0.75em;color:#999;";
        itemDesc.textContent = item.description + " (" + item.type + ")";
        itemText.appendChild(itemDesc);

        itemLabel.appendChild(itemCb);
        itemLabel.appendChild(itemText);
        itemList.appendChild(itemLabel);
      });

      itemList.lastChild && (itemList.lastChild.style.borderBottom = "none");

      // ---- Klick auf Header togglet Item-Liste ----
      header.addEventListener("click", function (e) {
        // Nicht toggeln, wenn direkt auf die Checkbox geklickt wurde
        if (e.target.tagName === "INPUT") return;
        var visible = itemList.style.display !== "none";
        itemList.style.display = visible ? "none" : "block";
        arrow.style.transform = visible ? "rotate(0deg)" : "rotate(180deg)";
        arrow.textContent = visible ? "▼" : "▲";
      });

      catDiv.appendChild(header);
      catDiv.appendChild(itemList);
      catContainer.appendChild(catDiv);
    });

    bannerEl.appendChild(catContainer);

    // --- Buttons ---
    var btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;gap:0.5em;flex-wrap:wrap;";

    var acceptAllBtn = document.createElement("button");
    acceptAllBtn.id = "cmt-accept-all";
    acceptAllBtn.textContent = acceptAllLabel;
    acceptAllBtn.style.cssText =
      "padding:0.6em 1.2em;background:#4CAF50;color:#fff;border:none;" +
      "border-radius:4px;cursor:pointer;font-size:0.9em;";
    acceptAllBtn.addEventListener("click", handleAcceptAll);
    btnRow.appendChild(acceptAllBtn);

    var acceptSelectedBtn = document.createElement("button");
    acceptSelectedBtn.id = "cmt-accept-selected";
    acceptSelectedBtn.textContent = acceptSelectedLabel;
    acceptSelectedBtn.style.cssText =
      "padding:0.6em 1.2em;background:#2196F3;color:#fff;border:none;" +
      "border-radius:4px;cursor:pointer;font-size:0.9em;";
    acceptSelectedBtn.addEventListener("click", handleAcceptSelected);
    btnRow.appendChild(acceptSelectedBtn);

    var rejectAllBtn = document.createElement("button");
    rejectAllBtn.id = "cmt-reject-all";
    rejectAllBtn.textContent = rejectAllLabel;
    rejectAllBtn.style.cssText =
      "padding:0.6em 1.2em;background:#f44336;color:#fff;border:none;" +
      "border-radius:4px;cursor:pointer;font-size:0.9em;";
    rejectAllBtn.addEventListener("click", handleRejectAll);
    btnRow.appendChild(rejectAllBtn);

    bannerEl.appendChild(btnRow);

    document.body.appendChild(bannerEl);
  }

  /** Setzt alle Items einer Kategorie auf checked/unchecked */
  function syncCategoryItems(cat, checked) {
    Object.keys(itemCheckboxes[cat.id]).forEach(function (itemId) {
      var itemCb = itemCheckboxes[cat.id][itemId];
      if (!itemCb.disabled) {
        itemCb.checked = checked;
      }
    });
  }

  /** Wenn alle Items einer Kategorie checked sind, checke die Kat-CB; sonst unchecke */
  function syncCategoryFromItems(cat) {
    var allChecked = Object.keys(itemCheckboxes[cat.id]).every(function (itemId) {
      return itemCheckboxes[cat.id][itemId].checked;
    });
    var someChecked = Object.keys(itemCheckboxes[cat.id]).some(function (itemId) {
      return itemCheckboxes[cat.id][itemId].checked;
    });
    if (categoryCheckboxes[cat.id] && !categoryCheckboxes[cat.id].disabled) {
      categoryCheckboxes[cat.id].checked = allChecked;
      categoryCheckboxes[cat.id].indeterminate = !allChecked && someChecked;
    }
  }

  /** Liest den aktuellen Checkbox-Zustand aus und baut ein Consent-Objekt */
  function readCheckboxes() {
    var consent = {};
    CONFIG.categories.forEach(function (cat) {
      consent[cat.id] = {};
      cat.items.forEach(function (item) {
        var cb = itemCheckboxes[cat.id] && itemCheckboxes[cat.id][item.id];
        consent[cat.id][item.id] = cb ? cb.checked : cat.required;
      });
    });
    return consent;
  }

  /** Setzt die Checkboxen basierend auf einem Consent-Objekt */
  function setCheckboxes(consent) {
    CONFIG.categories.forEach(function (cat) {
      cat.items.forEach(function (item) {
        var cb = itemCheckboxes[cat.id] && itemCheckboxes[cat.id][item.id];
        if (cb && !cb.disabled) {
          cb.checked = !!(consent[cat.id] && consent[cat.id][item.id]);
        }
      });
      syncCategoryFromItems(cat);
    });
  }

  // ---- Button Handler ----

  function handleAcceptAll() {
    var c = buildDefaultConsent(true);
    saveConsent(c);
    hideBanner();
    applyConsent(c);
  }

  function handleAcceptSelected() {
    var c = readCheckboxes();
    saveConsent(c);
    hideBanner();
    applyConsent(c);
  }

  function handleRejectAll() {
    var c = buildDefaultConsent(false);
    saveConsent(c);
    hideBanner();
    applyConsent(c);
  }

  // ---- Banner Show / Hide ----

  function showBanner() {
    if (!bannerEl) createBanner();
    if (bannerEl) {
      // Restore checkboxes from saved state
      var saved = getConsent();
      if (saved) {
        setCheckboxes(saved);
      } else {
        // Default: alles an (außer required=false?)
        setCheckboxes(buildDefaultConsent(true));
      }
      bannerEl.style.display = "block";
    }
  }

  function hideBanner() {
    if (bannerEl) bannerEl.style.display = "none";
  }

  // ---- Settings-Button (floating) ----

  function createSettingsButton() {
    var settings = CONFIG.settings || {};
    if (settings.showSettingsButton === false) return;

    var btn = document.createElement("button");
    btn.id = "cmt-settings-btn";
    btn.title = "Cookie-Einstellungen";
    btn.textContent = "🍪";
    var pos = settings.buttonPosition || "bottom-right";
    btn.style.cssText =
      "position:fixed;bottom:1em;" + (pos === "bottom-left" ? "left:1em;" : "right:1em;") +
      "padding:0.5em 0.8em;background:#333;color:#fff;border:none;" +
      "border-radius:50%;cursor:pointer;font-size:1.2em;z-index:999;";
    btn.addEventListener("click", function () {
      showBanner();
    });
    document.body.appendChild(btn);
  }

  // ---- Startup ----

  function init() {
    createBanner();
    createSettingsButton();

    if (!hasSavedConsent()) {
      showBanner();
    } else {
      applyConsent(getConsent());
    }
  }

  // Warten, bis der DOM bereit ist
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();