/**
 * popup.js — Maneja el estado de la UI y el sistema de Traducción
 */

// ─── DICCIONARIO DE IDIOMAS ──────────────────────────────────────────
const i18n = {
  es: {
    appDesc: "Crunchyroll · Salto automático",
    statusActive: "Activo · Monitoreando",
    statusInactive: "Inactivo",
    recapTitle: "Saltar Resumen",
    recapDesc: "Salta el recap del episodio anterior",
    introTitle: "Saltar Intro",
    introDesc: "Salta la secuencia de apertura",
    creditsTitle: "Saltar Créditos",
    creditsDesc: "Salta créditos finales automáticamente",
    versionText: "Crunchyroll Auto-Skipper Pro · v1.0.0"
  },
  ca: {
    appDesc: "Crunchyroll · Salt automàtic",
    statusActive: "Actiu · Monitorant",
    statusInactive: "Inactiu",
    recapTitle: "Saltar Resum",
    recapDesc: "Salta el resum de l'episodi anterior",
    introTitle: "Saltar Intro",
    introDesc: "Salta la seqüència d'obertura",
    creditsTitle: "Saltar Crèdits",
    creditsDesc: "Salta els crèdits finals automàticament",
    versionText: "Crunchyroll Auto-Skipper Pro · v1.0.0"
  },
  en: {
    appDesc: "Crunchyroll · Auto-Skip",
    statusActive: "Active · Monitoring",
    statusInactive: "Inactive",
    recapTitle: "Skip Recap",
    recapDesc: "Skips previous episode recap",
    introTitle: "Skip Intro",
    introDesc: "Skips the opening sequence",
    creditsTitle: "Skip Credits",
    creditsDesc: "Skips ending credits automatically",
    versionText: "Crunchyroll Auto-Skipper Pro · v1.0.0"
  },
  fr: {
    appDesc: "Crunchyroll · Saut automatique",
    statusActive: "Actif · Surveillance",
    statusInactive: "Inactif",
    recapTitle: "Passer le Résumé",
    recapDesc: "Passe le résumé de l'épisode précédent",
    introTitle: "Passer l'Intro",
    introDesc: "Passe la séquence d'ouverture",
    creditsTitle: "Passer les Crédits",
    creditsDesc: "Passe les crédits de fin automatiquement",
    versionText: "Crunchyroll Auto-Skipper Pro · v1.0.0"
  },
  de: {
    appDesc: "Crunchyroll · Auto-Skip",
    statusActive: "Aktiv · Überwachung",
    statusInactive: "Inaktiv",
    recapTitle: "Rückblick Überspringen",
    recapDesc: "Überspringt den Rückblick",
    introTitle: "Intro Überspringen",
    introDesc: "Überspringt das Opening",
    creditsTitle: "Credits Überspringen",
    creditsDesc: "Überspringt den Abspann automatisch",
    versionText: "Crunchyroll Auto-Skipper Pro · v1.0.0"
  },
  it: {
    appDesc: "Crunchyroll · Salto automatico",
    statusActive: "Attivo · Monitoraggio",
    statusInactive: "Inattivo",
    recapTitle: "Salta Riassunto",
    recapDesc: "Salta il riassunto dell'episodio precedente",
    introTitle: "Salta Intro",
    introDesc: "Salta la sigla di apertura",
    creditsTitle: "Salta Titoli di Coda",
    creditsDesc: "Salta i titoli di coda automaticamente",
    versionText: "Crunchyroll Auto-Skipper Pro · v1.0.0"
  }
};

let currentLang = 'en';

// ─── ELEMENTOS DEL DOM ────────────────────────────────────────────────
const toggleRecap = document.getElementById('toggleRecap');
const toggleIntro = document.getElementById('toggleIntro');
const toggleCredits = document.getElementById('toggleCredits');

const statusBar = document.getElementById('statusBar');
const statusText = document.getElementById('statusText');

const langBtn = document.getElementById('langBtn');
const langMenu = document.getElementById('langMenu');
const langOptions = document.querySelectorAll('.lang-option');

// ─── FUNCIONES DE IDIOMA ──────────────────────────────────────────────
function detectLanguage() {
  const browserLang = navigator.language.slice(0, 2).toLowerCase();
  const supported = ['es', 'ca', 'en', 'fr', 'de', 'it'];
  return supported.includes(browserLang) ? browserLang : 'en';
}

function applyLanguage(langCode) {
  if (!i18n[langCode]) return;
  currentLang = langCode;
  
  // Fade out animation
  const elementsToTranslate = document.querySelectorAll('[data-i18n]');
  elementsToTranslate.forEach(el => el.style.opacity = '0');

  setTimeout(() => {
    // Translate
    elementsToTranslate.forEach(el => {
      const key = el.getAttribute('data-i18n');
      // Casos especiales como statusBar cambian según el estado
      if (key === 'statusActive' && statusBar.classList.contains('inactive')) {
        el.textContent = i18n[langCode].statusInactive;
      } else {
        el.textContent = i18n[langCode][key];
      }
      el.style.opacity = '1';
    });
  }, 150); // Mismo tiempo que transition CSS

  // Update menu active state
  langOptions.forEach(opt => {
    if (opt.getAttribute('data-lang') === langCode) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });
}

// ─── FUNCIONES DE TOGGLES Y STATUS ────────────────────────────────────
function updateStatusUI() {
  const isAnyActive = toggleRecap.checked || toggleIntro.checked || toggleCredits.checked;
  
  statusText.style.opacity = '0';
  setTimeout(() => {
    if (isAnyActive) {
      statusBar.classList.remove('inactive');
      statusText.textContent = i18n[currentLang].statusActive;
    } else {
      statusBar.classList.add('inactive');
      statusText.textContent = i18n[currentLang].statusInactive;
    }
    statusText.style.opacity = '1';
  }, 150);
}

function saveState() {
  chrome.storage.local.set({
    skipRecap: toggleRecap.checked,
    skipIntro: toggleIntro.checked,
    skipCredits: toggleCredits.checked,
    appLang: currentLang
  });
  updateStatusUI();
}

// ─── EVENT LISTENERS ──────────────────────────────────────────────────
// Toggles
[toggleRecap, toggleIntro, toggleCredits].forEach(toggle => {
  toggle.addEventListener('change', saveState);
});

// Selector de Idioma Toggle
langBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  langMenu.classList.toggle('show');
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', (e) => {
  if (!langWrapper.contains(e.target)) {
    langMenu.classList.remove('show');
  }
});
const langWrapper = document.querySelector('.lang-wrapper');

// Seleccionar un idioma
langOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    const selectedLang = btn.getAttribute('data-lang');
    applyLanguage(selectedLang);
    saveState();
    langMenu.classList.remove('show');
  });
});

// ─── INIT ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Cargar estado inicial
  chrome.storage.local.get(['skipRecap', 'skipIntro', 'skipCredits', 'appLang'], (data) => {
    toggleRecap.checked   = data.skipRecap !== undefined ? data.skipRecap : true;
    toggleIntro.checked   = data.skipIntro !== undefined ? data.skipIntro : true;
    toggleCredits.checked = data.skipCredits !== undefined ? data.skipCredits : true;
    
    // Configurar idioma
    let initLang = data.appLang;
    if (!initLang) {
      initLang = detectLanguage();
      // Guardarlo por primera vez
      chrome.storage.local.set({ appLang: initLang });
    }
    
    applyLanguage(initLang);
    updateStatusUI();
  });
});
