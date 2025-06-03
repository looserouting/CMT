<script>
  const consentKey = "userConsent";

  function hasConsent() {
    return localStorage.getItem(consentKey);
  }

  function saveConsent(value) {
    localStorage.setItem(consentKey, value);
  }

  function startTracking() {
    console.log("Tracking gestartet...");
    // Beispiel: Google Analytics o.ä. dynamisch laden
    const script = document.createElement("script");
    script.src = "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID";
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  }

  function showBanner() {
    document.getElementById("consent-banner").style.display = "block";
  }

  function hideBanner() {
    document.getElementById("consent-banner").style.display = "none";
  }

  function askForConsentIfNeeded() {
    const consent = hasConsent();
    if (!consent) {
      showBanner();
    } else if (consent === "accepted") {
      startTracking();
    }
  }

  document.getElementById("accept-btn").addEventListener("click", () => {
    saveConsent("accepted");
    hideBanner();
    startTracking();
  });

  document.getElementById("reject-btn").addEventListener("click", () => {
    saveConsent("rejected");
    hideBanner();
  });

  document.getElementById("consent-settings-btn").addEventListener("click", () => {
    showBanner();
  });

  window.onload = askForConsentIfNeeded;
</script>
