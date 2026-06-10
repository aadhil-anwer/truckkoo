// Truckkoo — language toggle + scroll reveal

(function () {
  var html = document.documentElement;

  function setLang(lang) {
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
    try { localStorage.setItem("truckkoo-lang", lang); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem("truckkoo-lang"); } catch (e) {}
  if (saved === "ar" || saved === "en") setLang(saved);

  document.getElementById("langToggle").addEventListener("click", function () {
    setLang(html.lang === "ar" ? "en" : "ar");
  });

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
