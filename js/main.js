// Truckkoo — language toggle, scroll reveal, WhatsApp quote form

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
