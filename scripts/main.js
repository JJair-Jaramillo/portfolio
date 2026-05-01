/**
 * Portfolio template — vanilla JS (offline)
 * -----------------------------------------
 * • i18n: English / Spanish via scripts/translations.js + data-i18n attributes
 * • Theme: dark (default) / light, persisted in localStorage
 * • Nav: sticky header, smooth scroll, active section highlight, mobile drawer + backdrop
 * • IntersectionObserver: .reveal fade-in, skill bar widths
 */

(function () {
  "use strict";

  var STORAGE_THEME = "portfolio-theme";
  var STORAGE_LANG = "portfolio-lang";

  var header = document.querySelector(".site-header");
  var nav = document.getElementById("site-nav");
  var navToggle = document.querySelector("[data-nav-toggle]");
  var navBackdrop = document.querySelector("[data-nav-backdrop]");
  var yearEl = document.getElementById("year");

  var currentLang = "en";

  var sectionIds = [
    "hero",
    "about",
    "expertise",
    "skills",
    "projects",
    "experience",
    "education",
    "certifications",
    "media",
    "connect",
  ];

  function getBundle(lang) {
    if (typeof translations === "undefined") return {};
    var L = translations[lang] || translations.en || {};
    return L;
  }
  

  function applyTranslations(lang) {
    if (lang !== "es") lang = "en";
    currentLang = lang;
    var bundle = getBundle(lang);

    document.documentElement.lang = lang === "es" ? "es" : "en";
    var title = bundle.page_title;
    if (!title && typeof translations !== "undefined" && translations.en) {
      title = translations.en.page_title;
    }
    if (title) document.title = title;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (!key) return;
      var text = bundle[key];
      if (text === undefined && typeof translations !== "undefined" && translations.en) {
        text = translations.en[key];
      }
      if (text !== undefined) {
        el.textContent = text;
      }
    });

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-label", bundle.aria_theme || "Toggle theme");
    });

    updateNavToggleAria(navToggle, nav && nav.classList.contains("is-open"));

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      var isEs = btn.getAttribute("data-lang") === "es";
      var active = (lang === "es" && isEs) || (lang === "en" && !isEs);
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    try {
      localStorage.setItem(STORAGE_LANG, lang);
    } catch (e) {
      /* ignore */
    }
  }

  function updateNavToggleAria(toggle, menuOpen) {
    if (!toggle) return;
    var bundle = getBundle(currentLang);
    var key = menuOpen ? "aria_close_menu" : "aria_open_menu";
    toggle.setAttribute("aria-label", bundle[key] || (menuOpen ? "Close menu" : "Open menu"));
  }

  function setTheme(theme) {
    if (theme !== "light" && theme !== "dark") theme = "dark";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_THEME, theme);
    } catch (e) {
      /* ignore */
    }
  }

  function initTheme() {
    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_THEME);
    } catch (e) {
      /* ignore */
    }
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    } else {
      setTheme("dark");
    }
  }

  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(cur === "dark" ? "light" : "dark");
  }

  function initLang() {
    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_LANG);
    } catch (e) {
      /* ignore */
    }
    applyTranslations(saved === "es" ? "es" : "en");
  }

  function closeNav() {
    if (!nav) return;
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    if (header) header.classList.remove("is-menu-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      updateNavToggleAria(navToggle, false);
    }
    if (navBackdrop) {
      navBackdrop.classList.remove("is-visible");
      navBackdrop.setAttribute("aria-hidden", "true");
    }
  }

  function openNav() {
    if (!nav) return;
    nav.classList.add("is-open");
    document.body.classList.add("menu-open");
    if (header) header.classList.add("is-menu-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "true");
      updateNavToggleAria(navToggle, true);
    }
    if (navBackdrop) {
      navBackdrop.setAttribute("aria-hidden", "false");
      requestAnimationFrame(function () {
        navBackdrop.classList.add("is-visible");
      });
    }
  }

  function isMobileNav() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  /* Header shadow */
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }

  var scrollTicking = false;
  function onScroll() {
    onScrollHeader();
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        updateActiveNav();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }

  function updateActiveNav() {
    var offset = header ? header.getBoundingClientRect().height : 72;
    var pos = window.scrollY + offset + 24;
    var activeId = "hero";

    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var top = el.offsetTop;
      if (pos >= top) activeId = id;
    });

    document.querySelectorAll(".nav-link").forEach(function (a) {
      var href = a.getAttribute("href");
      a.classList.toggle("is-active", href === "#" + activeId);
    });
  }

  /* Smooth scroll for in-page links */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (isMobileNav()) closeNav();
    });
  });

  /* Mobile menu */
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) closeNav();
      else openNav();
    });
  }

  if (navBackdrop) {
    navBackdrop.addEventListener("click", closeNav);
  }

  window.addEventListener(
    "resize",
    function () {
      if (!isMobileNav()) closeNav();
    },
    { passive: true }
  );

  /* Theme toggles (desktop + mobile duplicate buttons) */
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", toggleTheme);
  });

  /* Language buttons */
  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.getAttribute("data-lang") === "es" ? "es" : "en";
      applyTranslations(lang);
    });
  });

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -28px 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Skill bars */
  var skillRows = document.querySelectorAll(".skill-row");
  if ("IntersectionObserver" in window && skillRows.length) {
    var skillObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var row = entry.target;
          var fill = row.querySelector(".skill-fill");
          var pctLabel = row.querySelector(".skill-pct");
          if (fill) {
            var level = parseInt(fill.getAttribute("data-level"), 10);
            if (isNaN(level)) level = 0;
            level = Math.max(0, Math.min(100, level));
            requestAnimationFrame(function () {
              fill.style.width = level + "%";
            });
            if (pctLabel) pctLabel.textContent = level + "%";
          }
          obs.unobserve(row);
        });
      },
      { threshold: 0.15, rootMargin: "0px" }
    );
    skillRows.forEach(function (row) {
      skillObserver.observe(row);
    });
  } else {
    skillRows.forEach(function (row) {
      var fill = row.querySelector(".skill-fill");
      var pctLabel = row.querySelector(".skill-pct");
      if (fill) {
        var level = parseInt(fill.getAttribute("data-level"), 10) || 0;
        fill.style.width = Math.max(0, Math.min(100, level)) + "%";
        if (pctLabel) pctLabel.textContent = level + "%";
      }
    });
  }

  /* Init */
  initTheme();
  initLang();

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  window.addEventListener("scroll", onScroll, { passive: true });
  onScrollHeader();
  updateActiveNav();

  if (navToggle) {
    navToggle.setAttribute("aria-expanded", "false");
    updateNavToggleAria(navToggle, false);
  }
})

();
