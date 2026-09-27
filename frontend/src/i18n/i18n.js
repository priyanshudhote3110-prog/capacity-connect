/**
 * i18n.js - Client-Side Bilingual Internationalization Engine
 * Capacity Connect LMS (MoES)
 */

class I18nEngine {
  constructor() {
    this.currentLang = localStorage.getItem("moes_lang") || "en";
    this.translations = {
      en: null,
      hi: null
    };
    this.listeners = [];
  }

  async init(enData, hiData) {
    if (enData && hiData) {
      this.translations.en = enData;
      this.translations.hi = hiData;
    } else {
      try {
        const [enRes, hiRes] = await Promise.all([
          fetch("./src/i18n/en.json").then(r => r.json()),
          fetch("./src/i18n/hi.json").then(r => r.json())
        ]);
        this.translations.en = enRes;
        this.translations.hi = hiRes;
      } catch (err) {
        console.warn("Could not load external i18n JSON files, using offline built-in fallback.");
        this.translations.en = this.translations.en || {
          nav: { home: "Home", courses: "Courses", liveClasses: "Live", examinations: "Tests", certificates: "Certs", heatmap: "Heatmap", forum: "Forum", leaderboard: "Ranks", login: "Sign In", logout: "Sign Out", leadership: "Leadership", notifications: "Notify Hub", settings: "Settings" },
          roles: { admin: "Admin", trainer: "Trainer / Faculty", employee: "Official / Learner" },
          hero: { title: "National Earth Science Capacity Building Portal", subtitle: "Ministry of Earth Sciences (MoES), Govt. of India" }
        };
      }
    }
    this.applyToDom();
  }

  setLanguage(lang) {
    if (lang !== "en" && lang !== "hi") return;
    this.currentLang = lang;
    localStorage.setItem("moes_lang", lang);
    this.applyToDom();
    this.listeners.forEach(fn => fn(this.currentLang));
  }

  toggleLanguage() {
    this.setLanguage(this.currentLang === "en" ? "hi" : "en");
    return this.currentLang;
  }

  t(keyPath, fallback = "") {
    if (!keyPath) return fallback;
    const dict = this.translations[this.currentLang] || this.translations.en;
    if (!dict) return fallback;

    const parts = keyPath.split(".");
    let current = dict;
    for (const p of parts) {
      if (current && current[p] !== undefined) {
        current = current[p];
      } else {
        return fallback || keyPath;
      }
    }
    return current || fallback || keyPath;
  }

  applyToDom() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const translation = this.t(key);
      if (el.tagName === "INPUT" && el.getAttribute("placeholder")) {
        el.setAttribute("placeholder", translation);
      } else {
        el.textContent = translation;
      }
    });

    const toggleBtn = document.getElementById("lang-toggle-btn");
    if (toggleBtn) {
      toggleBtn.textContent = this.currentLang === "en" ? "हिन्दी (HI)" : "English (EN)";
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

// Global instance
window.i18n = new I18nEngine();
if (typeof module !== "undefined" && module.exports) {
  module.exports = window.i18n;
}
