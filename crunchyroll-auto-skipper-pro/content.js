/**
 * content.js — Crunchyroll Auto-Skipper Pro v7 (Definitiva - Cirujano)
 *
 * Enfoque: 
 * - Cero Spam: Escanea 1 vez por segundo, como un humano.
 * - Clic Exacto: Busca exclusivamente botones (<button> o role="button"), 
 *   para no hacer clic en los <svg> o <span> internos, lo cual rompía el video.
 * - Enfriamiento: Tras un clic exitoso, la extensión duerme 8 segundos.
 */

var skipRecap = true, skipIntro = true, skipCredits = true;

// 1. Cargar Configuración de chrome.storage
try {
  chrome.storage.local.get(
    { skipRecap: true, skipIntro: true, skipCredits: true },
    function(d) {
      if (chrome.runtime.lastError) return;
      skipRecap = d.skipRecap;
      skipIntro = d.skipIntro;
      skipCredits = d.skipCredits;
    }
  );
  chrome.storage.onChanged.addListener(function(c, a) {
    if (a !== 'local') return;
    if (c.skipRecap) skipRecap = c.skipRecap.newValue;
    if (c.skipIntro) skipIntro = c.skipIntro.newValue;
    if (c.skipCredits) skipCredits = c.skipCredits.newValue;
  });
} catch (e) {}

// 2. Selectores EXACTOS de botones (evitar clics en SVGs)
var BUTTON_SELECTORS = [
  'button[data-testid*="skip" i]',
  '[role="button"][data-testid*="skip" i]',
  'button[aria-label*="skip" i]',
  'button[aria-label*="saltar" i]',
  'button[aria-label*="omitir" i]',
  'button[aria-label*="passer" i]',
  'button[aria-label*="überspringen" i]',
  'button[aria-label*="salta" i]',
  'button[aria-label*="pular" i]',
  '.vilos-player_skip-button' // Clase interna oficial de Crunchyroll
].join(', ');

// Expresiones regulares para identificar qué botón es
// IMPORTANTE: Se eliminó "next episode" y similares. Solo saltos nativos.
var R_RECAP   = /skip.?recap|saltar.?res[uú]m|omitir.?res[uú]m|passer.?le.?r[eé]sum[eé]|r[uü]ckblick|salta.?riassunto|pular.?resumo/i;
var R_INTRO   = /skip.?intro|saltar.?intro|omitir.?intro|skip.?opening|saltar.?apertura|passer.?l.?intro|intro.?überspringen|salta.?intro|pular.?abertura/i;
var R_CREDITS = /skip.?credits|saltar.?cr[eé]ditos|omitir.?cr[eé]ditos|skip.?preview|saltar.?avance|passer.?les.?cr[eé]dits|abspann|salta.?titoli|pular.?cr[eé]ditos/i;

// 3. Sistema de Enfriamiento (Anti-Ban / Anti-Glitch)
var isCoolingDown = false;

function getText(el) {
  try {
    var a = el.getAttribute ? el.getAttribute.bind(el) : function(){return '';};
    return [
      a('aria-label') || '', 
      a('data-testid') || '', 
      (el.innerText || el.textContent || '').trim()
    ].join(' ').toLowerCase();
  } catch(e) { return ''; }
}

function classify(text) {
  if (R_RECAP.test(text)) return 'recap';
  if (R_INTRO.test(text)) return 'intro';
  if (R_CREDITS.test(text)) return 'credits';
  return null;
}

function wantSkip(type) {
  return (type === 'recap' && skipRecap) || 
         (type === 'intro' && skipIntro) || 
         (type === 'credits' && skipCredits);
}

function isTrulyVisible(el) {
  try {
    // Si el elemento no tiene dimensiones, está oculto
    var r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    
    // Si el navegador lo renderiza oculto (Crunchyroll hace esto a veces)
    var style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0' || style.pointerEvents === 'none') {
      return false;
    }
    return true;
  } catch(e) { return false; }
}

function getDocsToScan() {
  var docs = [document];
  try {
    var iframes = document.querySelectorAll('iframe');
    for (var i = 0; i < iframes.length; i++) {
      try {
        var d = iframes[i].contentDocument || (iframes[i].contentWindow && iframes[i].contentWindow.document);
        if (d) docs.push(d);
      } catch(e) { /* Cross-origin iframe (ignorar) */ }
    }
  } catch(e) {}
  return docs;
}

// 4. Lógica Principal de Escaneo
function scanForButtons() {
  if (isCoolingDown) return; // Si estamos en enfriamiento, no hacer NADA.
  if (!skipRecap && !skipIntro && !skipCredits) return; // Todo desactivado.

  try {
    var docs = getDocsToScan();
    
    for (var d = 0; d < docs.length; d++) {
      var doc = docs[d];
      if (!doc || !doc.querySelectorAll) continue;

      var buttons = doc.querySelectorAll(BUTTON_SELECTORS);
      
      for (var i = 0; i < buttons.length; i++) {
        var btn = buttons[i];
        
        if (!btn.isConnected) continue;
        if (!isTrulyVisible(btn)) continue;

        var text = getText(btn);
        if (!text) continue;

        var type = classify(text);
        if (!type || !wantSkip(type)) continue;

        // EJECUCIÓN DEL CLIC NATIVO
        console.log('[AutoSkipperPro v7] 🎯 Botón encontrado y visible: ' + type + ' -> ' + text.substring(0, 30));
        
        // Clic directo
        try { btn.click(); } catch(e) {}

        // Iniciar enfriamiento de 8 SEGUNDOS
        isCoolingDown = true;
        console.log('[AutoSkipperPro v7] 🛑 Clic realizado. Enfriamiento de 8 segundos iniciado.');
        setTimeout(function() {
          isCoolingDown = false;
          console.log('[AutoSkipperPro v7] 🟢 Enfriamiento terminado. Buscando de nuevo...');
        }, 8000);

        return; // Salir de todo el escaneo tras hacer 1 clic
      }
    }
  } catch(e) {}
}

// 5. Motor Suave: Solo un chequeo cada 1000 milisegundos (1 segundo)
setInterval(scanForButtons, 1000);

console.log('[AutoSkipperPro v7] 🚀 Iniciado con motor suave de 1Hz.');
