// Truckkoo — language toggle, scroll reveal, WhatsApp quote form

// ===== Google Analytics 4 =====================================================
// Paste your Measurement ID below (looks like "G-ABC123XYZ").
// Get it at analytics.google.com → Admin → Data streams → your web stream.
// Until a real ID is set here, tracking is silently disabled (no errors).
var GA_MEASUREMENT_ID = "G-XSYBWP2WL4";
var CONSENT_KEY = "truckkoo-consent"; // stored value: "granted" | "denied"

function gaEnabled() {
  return GA_MEASUREMENT_ID && GA_MEASUREMENT_ID.indexOf("G-XXXX") !== 0;
}
function storedConsent() {
  try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
}

(function () {
  if (!gaEnabled()) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };

  // Consent Mode v2 — deny everything by default until the visitor decides.
  // (If they accepted on a previous visit, start granted.)
  var granted = storedConsent() === "granted";
  gtag("consent", "default", {
    ad_storage: granted ? "granted" : "denied",
    ad_user_data: granted ? "granted" : "denied",
    ad_personalization: granted ? "granted" : "denied",
    analytics_storage: granted ? "granted" : "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500
  });
  gtag("set", "ads_data_redaction", !granted);
  gtag("set", "url_passthrough", true);

  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;
  document.head.appendChild(s);
})();

// Cookie-consent banner (injected on every page; shown until a choice is made).
(function () {
  if (!gaEnabled()) return;
  var prev = storedConsent();
  if (prev === "granted" || prev === "denied") return; // already chosen

  function apply(choice) {
    try { localStorage.setItem(CONSENT_KEY, choice); } catch (e) {}
    var v = choice === "granted" ? "granted" : "denied";
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        ad_storage: v, ad_user_data: v, ad_personalization: v, analytics_storage: v
      });
      window.gtag("set", "ads_data_redaction", choice !== "granted");
    }
    window.dispatchEvent(new Event("truckkoo:consent")); // let other UI proceed
  }

  function build() {
    var bar = document.createElement("div");
    bar.className = "cookie";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Cookie consent");
    bar.innerHTML =
      '<div class="cookie-inner">' +
        '<p class="cookie-text">' +
          '<span class="en">We use cookies and Google Analytics to measure traffic and improve our service. ' +
            'You can accept or decline. See our <a href="privacy.html">Privacy Policy</a>.</span>' +
          '<span class="ar">نستخدم ملفات تعريف الارتباط وتحليلات جوجل لقياس الزيارات وتحسين خدمتنا. ' +
            'يمكنك القبول أو الرفض. اطّلع على <a href="privacy.html">سياسة الخصوصية</a>.</span>' +
        '</p>' +
        '<div class="cookie-actions">' +
          '<button type="button" class="cookie-btn cookie-decline" id="cookieDecline">' +
            '<span class="en">Decline</span><span class="ar">رفض</span></button>' +
          '<button type="button" class="cookie-btn cookie-accept" id="cookieAccept">' +
            '<span class="en">Accept</span><span class="ar">قبول</span></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(bar);
    requestAnimationFrame(function () { bar.classList.add("show"); });

    function close(choice) {
      apply(choice);
      bar.classList.remove("show");
      setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 360);
    }
    bar.querySelector("#cookieAccept").addEventListener("click", function () { close("granted"); });
    bar.querySelector("#cookieDecline").addEventListener("click", function () { close("denied"); });
  }

  if (document.body) build();
  else document.addEventListener("DOMContentLoaded", build);
})();
// =============================================================================

(function () {
  var html = document.documentElement;
  var WA_NUMBER = "96875172824";

  // Cities and towns along our corridors. Suggestions only —
  // the inputs accept any free-typed location.
  var CITIES = [
    // Muscat governorate
    ["Muscat", "مسقط"], ["Muttrah", "مطرح"], ["Seeb", "السيب"],
    ["Bawshar", "بوشر"], ["Al Amerat", "العامرات"], ["Qurayyat", "قريات"],
    // Batinah coast (Muscat - Sohar corridor)
    ["Barka", "بركاء"], ["Al Musanaah", "المصنعة"], ["Suwaiq", "السويق"],
    ["Al Khaburah", "الخابورة"], ["Saham", "صحم"], ["Sohar", "صحار"],
    ["Liwa", "لوى"], ["Shinas", "شناص"], ["Rustaq", "الرستاق"],
    // Interior and Dhahirah
    ["Nizwa", "نزوى"], ["Bahla", "بهلاء"], ["Samail", "سمائل"],
    ["Bidbid", "بدبد"], ["Izki", "إزكي"], ["Adam", "أدم"],
    ["Ibri", "عبري"], ["Buraimi", "البريمي"],
    // Sharqiyah
    ["Sur", "صور"], ["Ibra", "إبراء"], ["Sinaw", "سناو"],
    ["Al Mudhaibi", "المضيبي"], ["Al Kamil Wal Wafi", "الكامل والوافي"],
    // Wusta and Dhofar (Salalah corridor)
    ["Haima", "هيماء"], ["Duqm", "الدقم"], ["Thumrait", "ثمريت"],
    ["Salalah", "صلالة"], ["Taqah", "طاقة"], ["Mirbat", "مرباط"],
    // Musandam
    ["Khasab", "خصب"],
    // UAE
    ["Dubai", "دبي"], ["Jebel Ali", "جبل علي"], ["Abu Dhabi", "أبوظبي"],
    ["Sharjah", "الشارقة"], ["Ajman", "عجمان"], ["Al Ain", "العين"],
    ["Ras Al Khaimah", "رأس الخيمة"], ["Fujairah", "الفجيرة"],
    // Saudi Arabia
    ["Riyadh", "الرياض"], ["Dammam", "الدمام"], ["Jeddah", "جدة"]
  ];

  function populateCities(lang) {
    var dl = document.getElementById("cityList");
    if (!dl) return;
    dl.innerHTML = "";
    CITIES.forEach(function (city) {
      var opt = document.createElement("option");
      opt.value = lang === "ar" ? city[1] : city[0];
      // Show the other language as a hint so both scripts are searchable
      opt.label = lang === "ar" ? city[0] : city[1];
      dl.appendChild(opt);
    });
  }

  function localizeForm(lang) {
    populateCities(lang);
    document.querySelectorAll("[data-ph-en]").forEach(function (el) {
      el.placeholder = lang === "ar" ? el.getAttribute("data-ph-ar") : el.getAttribute("data-ph-en");
    });
    document.querySelectorAll("option[data-en]").forEach(function (opt) {
      opt.textContent = lang === "ar" ? opt.getAttribute("data-ar") : opt.getAttribute("data-en");
    });
  }

  function setLang(lang) {
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
    localizeForm(lang);
    try { localStorage.setItem("truckkoo-lang", lang); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem("truckkoo-lang"); } catch (e) {}
  if (saved === "ar" || saved === "en") {
    setLang(saved);
  } else {
    var sysLang = (navigator.language || "").toLowerCase();
    setLang(sysLang.indexOf("ar") === 0 ? "ar" : "en");
  }

  document.getElementById("langToggle").addEventListener("click", function () {
    setLang(html.lang === "ar" ? "en" : "ar");
  });

  // Mobile hamburger nav
  var header = document.querySelector(".site-header");
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  if (header && navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var open = header.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close after tapping a link
    mainNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        header.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
    // Close if resized up to desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 900) {
        header.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Quote form -> prefilled WhatsApp message
  var form = document.getElementById("quoteForm");
  if (form) {
    // Funnel step: visitor started filling the quote form
    var formStarted = false;
    form.addEventListener("focusin", function () {
      if (formStarted) return;
      formStarted = true;
      track("quote_form_start");
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var from = document.getElementById("qfFrom").value.trim();
      var to = document.getElementById("qfTo").value.trim();
      var goods = document.getElementById("qfGoods").value.trim();
      var truckSel = document.getElementById("qfTruck");
      var truck = truckSel.value ? truckSel.options[truckSel.selectedIndex].textContent : "";
      var err = document.getElementById("qfError");

      if (!from || !to || !goods) {
        err.hidden = false;
        return;
      }
      err.hidden = true;

      var msg;
      if (html.lang === "ar") {
        msg = "مرحباً تراكو، أحتاج شاحنة.\n"
            + "من: " + from + "\n"
            + "إلى: " + to + "\n"
            + "نوع البضاعة: " + goods;
        if (truck) msg += "\nنوع الشاحنة: " + truck;
      } else {
        msg = "Hi Truckkoo, I need a truck.\n"
            + "From: " + from + "\n"
            + "To: " + to + "\n"
            + "Goods: " + goods;
        if (truck) msg += "\nTruck type: " + truck;
      }
      track("quote_form_submit", { from_city: from, to_city: to, truck_type: truck || "unspecified" });
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    });
  }

  // Analytics: count WhatsApp link clicks by location on the page
  function track(eventName, params) {
    if (typeof window.gtag === "function") window.gtag("event", eventName, params || {});
  }
  document.addEventListener("click", function (e) {
    var link = e.target.closest && e.target.closest('a[href^="https://wa.me/"]');
    if (!link) return;
    var source = link.classList.contains("wa-float") ? "floating_button"
               : link.classList.contains("btn-header") ? "header"
               : link.closest("footer") ? "footer"
               : link.closest(".contact") ? "contact_section"
               : "page_button";
    track("whatsapp_click", { source: source, lang: html.lang });
  });

  // Analytics: scroll-depth milestones — how far down the page visitors get
  var depthMarks = [25, 50, 75, 100];
  var depthHit = {};
  function onDepthScroll() {
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    var pct = (window.pageYOffset / scrollable) * 100;
    for (var i = 0; i < depthMarks.length; i++) {
      var m = depthMarks[i];
      if (pct >= m && !depthHit[m]) {
        depthHit[m] = true;
        track("scroll_depth", { percent: m });
      }
    }
    if (depthHit[100]) window.removeEventListener("scroll", onDepthScroll);
  }
  window.addEventListener("scroll", onDepthScroll, { passive: true });

  // Open a service accordion when linked to directly (e.g. services.html#customs)
  function openHashAccordion() {
    if (!location.hash) return;
    var el = document.getElementById(location.hash.slice(1));
    if (el && el.tagName === "DETAILS") {
      el.open = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  openHashAccordion();
  window.addEventListener("hashchange", openHashAccordion);

  // Scroll reveal
  var revealed = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealed.forEach(function (el) { io.observe(el); });
  } else {
    revealed.forEach(function (el) { el.classList.add("in"); });
  }
})();

// Register service worker for PWA / offline support (Add to Home Screen).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  });
}

// Add-to-Home-Screen banner (homepage only; element absent elsewhere).
(function () {
  var banner = document.getElementById("installBanner");
  if (!banner) return;

  // Never show if the site is already running as an installed app.
  var standalone =
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
    window.navigator.standalone === true;
  if (standalone) return;

  var KEY = "truckkoo-a2hs";
  var COOLDOWN = 14 * 24 * 60 * 60 * 1000; // re-ask at most every 14 days
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === "installed") return;
    if (saved && Date.now() - parseInt(saved, 10) < COOLDOWN) return;
  } catch (e) {}

  var ua = window.navigator.userAgent || "";
  var isIOS = /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document);
  var deferredPrompt = null;
  var eligible = false;
  var shown = false;

  function remember(val) { try { localStorage.setItem(KEY, val); } catch (e) {} }
  function track(name) { if (typeof gtag === "function") { try { gtag("event", name); } catch (e) {} } }

  function reveal() {
    if (shown || !eligible) return;
    shown = true;
    banner.hidden = false;
    requestAnimationFrame(function () {
      document.body.classList.add("has-a2hs");
      banner.classList.add("show");
    });
    track("a2hs_shown");
  }

  function hide(rememberVal) {
    banner.classList.remove("show");
    document.body.classList.remove("has-a2hs");
    if (rememberVal) remember(rememberVal);
    setTimeout(function () { banner.hidden = true; }, 360);
  }

  // Respect the user journey: surface only after they've engaged with the page
  // (scrolled past the hero) or after a short dwell — never on first paint.
  function armReveal() {
    var onScroll = function () {
      if (window.pageYOffset > 500) {
        window.removeEventListener("scroll", onScroll);
        reveal();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    setTimeout(reveal, 6500);
  }

  // Don't stack two bottom banners: wait until the cookie-consent choice is
  // made before arming the install prompt (consentReady() is true when there's
  // nothing to wait for).
  var armed = false;
  function consentReady() {
    if (typeof gaEnabled === "function" && !gaEnabled()) return true;
    var c = storedConsent();
    return c === "granted" || c === "denied";
  }
  var consentOk = consentReady();
  if (!consentOk) {
    window.addEventListener("truckkoo:consent", function () {
      consentOk = true;
      maybeArm();
    }, { once: true });
  }
  function maybeArm() {
    if (armed || !consentOk || !eligible) return;
    armed = true;
    armReveal();
  }

  if (isIOS) {
    // iOS Safari has no install prompt API — guide the user instead.
    banner.classList.add("is-ios");
    eligible = true;
    maybeArm();
  } else {
    // Android / desktop Chrome: capture the native prompt and trigger it on tap.
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      deferredPrompt = e;
      eligible = true;
      maybeArm();
    });
  }

  var installBtn = document.getElementById("installBtn");
  if (installBtn) {
    installBtn.addEventListener("click", function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function (choice) {
        var accepted = choice && choice.outcome === "accepted";
        track(accepted ? "a2hs_installed" : "a2hs_declined");
        hide(accepted ? "installed" : String(Date.now()));
      });
      deferredPrompt = null;
    });
  }

  var closeBtn = document.getElementById("installClose");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      track("a2hs_dismissed");
      hide(String(Date.now()));
    });
  }

  window.addEventListener("appinstalled", function () {
    track("a2hs_installed");
    hide("installed");
  });
})();
