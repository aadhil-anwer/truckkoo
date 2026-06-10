// Truckkoo — language toggle, scroll reveal, WhatsApp quote form

(function () {
  var html = document.documentElement;
  var WA_NUMBER = "96875172824";

  function localizeForm(lang) {
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
  setLang(saved === "ar" ? "ar" : "en");

  document.getElementById("langToggle").addEventListener("click", function () {
    setLang(html.lang === "ar" ? "en" : "ar");
  });

  // Quote form -> prefilled WhatsApp message
  var form = document.getElementById("quoteForm");
  if (form) {
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
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    });
  }

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
