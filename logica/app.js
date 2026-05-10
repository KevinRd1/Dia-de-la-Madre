
'use strict';

/* ════════════════════════════════════════════════
   1. MUSIC
   ════════════════════════════════════════════════ */
var audio        = document.getElementById('bg-audio');
var musicPlaying = false;
var musicLoaded  = false;
var panelOpen    = false;

var src="musica/madre.mp3"; // ⬅️ CAMBIA ESTA URL por tu música
// ⬆️ CAMBIA SOLO ESA LÍNEA con tu música favorita

/** Intenta reproducir la música automáticamente al cargar la página */
function tryAutoPlay() {
  if (!src) return;
  audio.src = src;
  audio.volume = 0.25;
  audio.load();
  audio.play()
    .then(function () {
      musicLoaded  = true;
      musicPlaying = true;
      updatePlayerUI('🎶 Música del Día de la Madre');
    })
    .catch(function () {
      // El navegador bloqueó el autoplay — se activa al primer clic del usuario
      musicLoaded = true;
      document.addEventListener('click', function startOnClick() {
        if (!musicPlaying) {
          audio.play().then(function () {
            musicPlaying = true;
            updatePlayPauseBtn();
          }).catch(function () {});
        }
        document.removeEventListener('click', startOnClick);
      }, { once: true });
    });
}

/** Abre o cierra el panel de música */
function toggleMusicPanel() {
  panelOpen = !panelOpen;
  var panel = document.getElementById('music-panel');
  var fab   = document.getElementById('music-fab');
  panel.classList.toggle('show', panelOpen);
  fab.classList.toggle('active', panelOpen);

  // Cerrar al hacer click fuera
  if (panelOpen) {
    setTimeout(function () {
      document.addEventListener('click', closePanelOutside, { once: true });
    }, 10);
  }
}

function closePanelOutside(e) {
  var wrap = document.getElementById('music-wrap');
  if (!wrap.contains(e.target)) {
    panelOpen = false;
    document.getElementById('music-panel').classList.remove('show');
    document.getElementById('music-fab').classList.remove('active');
  }
}

/** Carga audio desde una URL directa */
function loadFromUrl() {
  var url = document.getElementById('music-url-inp').value.trim();
  if (!url) {
    setMusicStatus('⚠️ Escribe una URL válida.', true);
    return;
  }
  audio.src = url;
  audio.load();
  audio.play()
    .then(function () {
      musicLoaded  = true;
      musicPlaying = true;
      updatePlayerUI(url.split('/').pop() || 'Audio desde URL');
      setMusicStatus('✅ Reproduciendo desde URL');
    })
    .catch(function () {
      setMusicStatus('❌ No se pudo cargar la URL. Verifica que sea un archivo de audio directo.', true);
    });
}

/** Carga audio desde un archivo local */
function loadFromFile(file) {
  if (!file) return;
  var objUrl = URL.createObjectURL(file);
  audio.src  = objUrl;
  audio.load();
  audio.play()
    .then(function () {
      musicLoaded  = true;
      musicPlaying = true;
      updatePlayerUI(file.name);
      setMusicStatus('✅ Reproduciendo: ' + file.name);
    })
    .catch(function () {
      setMusicStatus('❌ Error al cargar el archivo.', true);
    });
}

/** Alterna reproducción / pausa */
function toggleMusicPlay() {
  if (!musicLoaded) {
    setMusicStatus('⚠️ Carga una canción primero (URL o archivo).', true);
    return;
  }
  if (musicPlaying) {
    audio.pause();
    musicPlaying = false;
  } else {
    audio.play().catch(function () {});
    musicPlaying = true;
  }
  updatePlayPauseBtn();
}

/** Inicia música automáticamente al abrir la tarjeta (si ya está cargada) */
function autoPlayIfLoaded() {
  if (musicLoaded && !musicPlaying) {
    audio.play().catch(function () {});
    musicPlaying = true;
    updatePlayPauseBtn();
  }
}

/** Ajusta el volumen (0–100) */
function setVolume(val) {
  var pct = Math.min(100, Math.max(0, parseInt(val, 10)));
  audio.volume = pct / 100;
  // Actualiza color del slider via CSS custom property
  document.getElementById('vol-slider').style.setProperty('--vol', pct + '%');
}

/** Actualiza el botón ▶/⏸ */
function updatePlayPauseBtn() {
  var btn = document.getElementById('mp-playpause');
  if (btn) btn.textContent = musicPlaying ? '⏸' : '▶';
}

/** Actualiza el nombre del archivo en "ahora reproduciendo" */
function updatePlayerUI(name) {
  var el = document.getElementById('mp-now-playing');
  if (el) el.textContent = '♪ ' + name;
  updatePlayPauseBtn();
}

/** Muestra mensaje de estado en el panel */
function setMusicStatus(msg, isError) {
  var el = document.getElementById('mp-status');
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? '#e74c3c' : '#27ae60';
  clearTimeout(el._t);
  el._t = setTimeout(function () { el.textContent = ''; }, 4000);
}

/* ════════════════════════════════════════════════
   2. COUNTDOWN — 10 de mayo (Día de la Madre)
   ════════════════════════════════════════════════ */
var countdownInterval = null;

/** Devuelve la próxima fecha del Día de la Madre (27 de mayo) */
function getMothersDayTarget() {
  var now  = new Date();
  var year = now.getFullYear();
  var md   = new Date(year, 4, 13, 0, 0, 0); // 27 de mayo (mes 4 = mayo, 0-indexed)

  // Si ya pasó el 27 de mayo de este año → contar al siguiente
  var dayAfter = new Date(year, 4, 28, 0, 0, 0);
  if (now >= dayAfter) {
    md = new Date(year + 1, 4, 27, 0, 0, 0);
  }
  return md;
}

/** Devuelve true si HOY es el Día de la Madre (27 de mayo o después) */
function isMothersDayToday() {
  var now = new Date();
  return now.getMonth() === 4 && now.getDate() >= 13;
}

/** Renderiza el bloque de countdown en #countdown-wrap */
function renderCountdown() {
  var wrap = document.getElementById('countdown-wrap');
  if (!wrap) return;

  if (isMothersDayToday()) {
    // ¡Es el día!
    wrap.innerHTML =
      '<div class="countdown-today">' +
        '🌹 ¡Hoy es el Día de la Madre! 🌹' +
        '<span class="ct-sub">Un día para celebrar a quienes nos dieron todo 💕</span>' +
      '</div>';
    return;
  }

  // Primero pintamos la estructura
  wrap.innerHTML =
    '<div class="countdown-lbl">Faltan para el Día de la Madre (27 de mayo) 🌹</div>' +
    '<div class="countdown-grid">' +
      '<div class="cd-unit"><span class="cd-num" id="cd-d">--</span><span class="cd-lbl">Días</span></div>' +
      '<div class="cd-unit"><span class="cd-num" id="cd-h">--</span><span class="cd-lbl">Horas</span></div>' +
      '<div class="cd-unit"><span class="cd-num" id="cd-m">--</span><span class="cd-lbl">Min</span></div>' +
      '<div class="cd-unit"><span class="cd-num" id="cd-s">--</span><span class="cd-lbl">Seg</span></div>' +
    '</div>';

  // Actualizamos cada segundo
  function tick() {
    var now    = new Date();
    var target = getMothersDayTarget();
    var diff   = Math.max(0, target - now);

    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000)  / 60000);
    var s = Math.floor((diff % 60000)    / 1000);

    var elD = document.getElementById('cd-d');
    var elH = document.getElementById('cd-h');
    var elM = document.getElementById('cd-m');
    var elS = document.getElementById('cd-s');

    if (elD) elD.textContent = pad(d);
    if (elH) elH.textContent = pad(h);
    if (elM) elM.textContent = pad(m);
    if (elS) elS.textContent = pad(s);

    // Si llega el día mientras la página está abierta
    if (diff === 0) {
      clearInterval(countdownInterval);
      renderCountdown();
    }
  }

  tick();
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(tick, 1000);
}

function pad(n) { return n < 10 ? '0' + n : String(n); }

/* ════════════════════════════════════════════════
   3. PETALS
   ════════════════════════════════════════════════ */
function createPetals() {
  var container = document.getElementById('particles-container');
  var emojis    = ['🌸', '🌹', '🌺', '🌷', '💐', '🌼'];
  for (var i = 0; i < 14; i++) {
    var el = document.createElement('div');
    el.className    = 'petal';
    el.textContent  = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left             = (Math.random() * 100) + 'vw';
    el.style.fontSize         = (.9 + Math.random() * 1.2) + 'rem';
    el.style.animationDuration  = (9 + Math.random() * 12) + 's';
    el.style.animationDelay     = (Math.random() * 12) + 's';
    container.appendChild(el);
  }
}

/* ════════════════════════════════════════════════
   4. HEARTS (Basilia)
   ════════════════════════════════════════════════ */
function startHearts() {
  var container = document.getElementById('hearts-container');
  var emojis    = ['❤️', '💕', '💖', '💗', '💓', '💝', '💞', '🌹'];
  var count = 0, max = 65;

  var iv = setInterval(function () {
    if (count >= max) { clearInterval(iv); return; }
    var el = document.createElement('div');
    el.className    = 'heart';
    el.textContent  = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left             = (Math.random() * 100) + 'vw';
    el.style.fontSize         = (1.2 + Math.random() * 2) + 'rem';
    el.style.animationDuration  = (4 + Math.random() * 5) + 's';
    container.appendChild(el);
    setTimeout(function () { el.remove(); }, 9000);
    count++;
  }, 170);
}

/* ════════════════════════════════════════════════
   5. SESSIONS (localStorage / JSON export)
   ════════════════════════════════════════════════
   Estructura guardada en localStorage['md_sessions']:
   [
     { "name":"Lisbeth", "role":"mama", "ts":"2026-05-10T10:30:00.000Z" },
     ...
   ]
   ════════════════════════════════════════════════ */
var STORAGE_KEY = 'md_sessions';

function getSessions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch (e) { return []; }
}

function saveSession(name, role) {
  var sessions = getSessions();
  sessions.push({ name: name, role: role, ts: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

/**
 * Exporta las sesiones como archivo data.json descargable.
 * El formato es compatible con data.json (estructura definida en ese archivo).
 */
function exportJSON() {
  var sessions = getSessions();
  var payload  = {
    _info:      'Sesiones — Día de la Madre',
    _version:   '1.0',
    _exportado: new Date().toISOString(),
    _estructura: {
      name: 'Nombre del visitante (string)',
      role: 'mama | prima | tia | abuela (string)',
      ts:   'Timestamp ISO 8601 (string)'
    },
    sessions: sessions
  };
  var json = JSON.stringify(payload, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href     = url;
  a.download = 'sesiones-dia-madre.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

/* ════════════════════════════════════════════════
   6. POEMS
   ════════════════════════════════════════════════ */
var P = {

  /* ─── MAMÁ ─── */
  mama_lisbeth:
'Viejita,\n\n' +
'Hoy quiero que sepas que cada cosa que hago bien tiene un pedacito de ti. ' +
'Me acuerdo de cuando era chico y pensaba que tú podías arreglar cualquier cosa: ' +
'un juguete roto, una rodilla raspada, un mal día en el cole. ' +
'Ahora de grande me doy cuenta que sigues haciendo lo mismo, solo que con problemas más grandes.\n\n' +
'Si yo soy fuerte es porque te vi a ti levantarte todos los días aunque estuvieras cansada. ' +
'Si soy responsable es porque tú me enseñaste con el ejemplo. ' +
'Gracias por tus desvelos, por tus consejos aunque no los quería escuchar, ' +
'por ese café que me dejabas en la mesa, y por amarme hasta en mis peores días.\n\n' +
'No necesito un día especial para decirte esto, pero hoy te lo grito: ' +
'gracias por ser mi mamá, mi refugio, mi mayor fan y mi casa. ' +
'Ojalá algún día yo pueda devolverte aunque sea la mitad de lo que me diste. ' +
'Te mereces el mundo entero.\n\n' +
'Te amo con todo. Feliz día de la madre.',

  mama_gen: function (n) {
    return n + ',\n\n' +
'En este día tan especial, quiero que sepas que hay un corazón que piensa en ti ' +
'con todo el amor del mundo.\n\n' +
'Ser mamá es el trabajo más difícil y más hermoso del mundo, ' +
'y tú lo haces con una gracia que no pasa desapercibida. ' +
'Cada día, con cada gesto, con cada palabra, vas dejando huella ' +
'en quienes más te quieren.\n\n' +
'Que hoy y siempre te sientas amada, valorada y celebrada. ' +
'Porque te lo mereces.\n\nFeliz Día de la Madre.';
  },

  /* ─── PRIMA ─── */
  prima_vianka:
'Vianka,\n\n' +
'Hoy que el mundo celebra a las madres, quiero celebrarte también a ti, ' +
'porque aunque el mundo te llame prima, en mi corazón llevas otro título.\n\n' +
'Eres la que siempre ha estado, la que entiende sin explicaciones, ' +
'la que ríe conmigo y también llora cuando algo duele de verdad.\n\n' +
'Ser mamá es un acto de amor diario, y tú lo sabes bien. ' +
'Lo que das cada día, lo que sacrificas, lo que construyes con amor, ' +
'merece ser celebrado hoy con todo el corazón.\n\n' +
'Que este día te traiga todo lo que mereces: descanso, alegría, ' +
'y la certeza de que lo que haces importa.\n\n' +
'Feliz Día de la Madre, Vianka. Te lo mereces todo.',

  prima_natalia:
'Natalia,\n\n' +
'No hay palabras exactas para describir lo que significa tenerte como prima, ' +
'pero hoy, en este día tan especial, lo intento.\n\n' +
'Eres mujer de carácter, de corazón grande, de esas que dejan huella. ' +
'Y si eres mamá, ya sé que lo eres con la misma fuerza con la que vives. ' +
'Si todavía no lo eres, igual mereces ser celebrada, ' +
'porque la ternura y el amor que llevas dentro merecen un día así.\n\n' +
'Que hoy sea tuyo, Natalia. Que alguien te cuide, que alguien te mime, ' +
'que alguien te diga lo que ya sabes: que eres especial, ' +
'y que este mundo es mejor contigo en él.\n\n' +
'Feliz Día de la Madre. Con mucho cariño.',

  prima_gen: [
    function (n) {
      return n + ',\n\n' +
'No siempre tenemos las palabras exactas para decir lo que sentimos, ' +
'pero hoy es uno de esos días en que hay que intentarlo.\n\n' +
'Eres parte de mi historia, de mis recuerdos, de esa red invisible ' +
'que llamamos familia y que sostiene cuando todo lo demás falla.\n\n' +
'En este Día de la Madre, quiero celebrarte a ti también. ' +
'Por tu amor, por tu fuerza, por ser quien eres.\n\n' +
'Feliz Día. Con todo el cariño.';
    },
    function (n) {
      return n + ',\n\n' +
'Hay lazos que el tiempo no rompe, y el nuestro es uno de esos. ' +
'Crecer juntos es un regalo, y llegar hasta acá, otro más.\n\n' +
'Hoy que se celebra el amor más puro, quiero que sientas ' +
'que tu amor también se celebra, que lo que das importa, ' +
'que quién eres importa.\n\n' +
'Feliz Día de la Madre. Que este día sea tan especial como tú.';
    },
    function (n) {
      return n + ',\n\n' +
'Las primas especiales no solo se llevan en la sangre, se llevan en el alma. ' +
'Y tú eres de esas.\n\n' +
'Hoy, en este día tan bonito, te deseo todo lo que mereces: ' +
'paz, alegría, mucho amor y todo lo que has soñado.\n\n' +
'Feliz Día de la Madre. Siempre aquí, contigo.';
    }
  ],

  /* ─── TÍA ─── */
  tia_tatiana:
'Tatiana,\n\n' +
'Hay tías que son solo tías, y hay tías que son mucho más. ' +
'Tú eres de las segundas.\n\n' +
'Desde pequeño te vi dar amor de sobra, sin pedir nada a cambio. ' +
'Esa forma tuya de estar, de escuchar, de aparecer cuando más se necesita, ' +
'es un regalo que no todos tienen la suerte de recibir.\n\n' +
'Hoy que se celebra a las mamás, quiero que sepas ' +
'que el amor que das merece ser reconocido, honrado y celebrado.\n\n' +
'Feliz Día de la Madre, Tatiana. Que este día esté tan lleno de amor ' +
'como el que tú has regalado a quienes te rodean.',

  tia_jessenia:
'Jessenia,\n\n' +
'Hay personas que con solo estar llenan un cuarto de luz, ' +
'y tú eres una de ellas.\n\n' +
'Como tía has sido un ejemplo de fuerza, de amor, ' +
'de esa manera tan tuya de hacer que todo parezca posible cuando parece difícil. ' +
'No es poca cosa. Eso vale mucho.\n\n' +
'Hoy, en el Día de la Madre, quiero que este mensaje llegue a tu corazón ' +
'con todo el amor y la gratitud que mereces.\n\n' +
'Feliz Día de la Madre, Jessenia. Que tu día sea tan hermoso como el amor que regalas.',

  tia_sandra:
'Sandra,\n\n' +
'La familia es un árbol que crece con el amor que cada quien aporta, ' +
'y tú, Sandra, eres una de las ramas más firmes y generosas.\n\n' +
'Has dado tanto, has estado en tantos momentos, ' +
'que hoy no podría dejar pasar este día sin decírtelo: ' +
'gracias por ser quien eres, gracias por tu amor, ' +
'gracias por tu presencia que siempre hace la diferencia.\n\n' +
'Que este Día de la Madre te devuelva en alegría todo lo que tú has entregado en amor.\n\n' +
'Feliz Día, Sandra. Con todo el cariño del mundo.',

  tia_gen: [
    function (n) {
      return n + ',\n\n' +
'Hay amores que vienen en forma de tía: los que aparecen cuando menos los esperas, ' +
'los que cuidan sin que se lo pidas, los que están aunque nadie los llame.\n\n' +
'Hoy, en el Día de la Madre, ese amor también se celebra. El tuyo.\n\n' +
'Feliz Día. Con todo el corazón.';
    },
    function (n) {
      return n + ',\n\n' +
'Quisiera que supieras lo importante que eres. ' +
'No solo hoy, no solo en las fiestas, sino en los días sencillos, ' +
'en los momentos que nadie fotografía pero que nadie olvida.\n\n' +
'Gracias por ser parte de esta familia. Gracias por lo que das.\n\n' +
'Feliz Día de la Madre. Que este día te llene de lo mismo que tú has dado: amor puro.';
    },
    function (n) {
      return n + ',\n\n' +
'Ser tía con el corazón que tú tienes es una forma de maternidad ' +
'que no siempre se nombra, pero que siempre se siente.\n\n' +
'Hoy que se celebra a las mujeres que cuidan, ' +
'tú eres una de las que merece estar en ese festejo.\n\n' +
'Feliz Día de la Madre. Te lo mereces, y mucho más.';
    }
  ],

  /* ─── ABUELA ─── */
  abuela_basilia:
'Mamita Bella,\n\n' +
'Si hay una palabra para describir lo que eres, esa palabra es fuerza. ' +
'No la fuerza que se ve, sino la que se siente, ' +
'la que está en cada abrazo tuyo, en cada mirada, en cada palabra dicha a tiempo.\n\n' +
'Fuiste mi abuela, sí, pero también fuiste mi madre cuando necesité una, ' +
'mi amiga cuando necesité compañía, ' +
'y mi compañera en los días en que el mundo parecía demasiado grande para cargarlo solo.\n\n' +
'Hoy, que luchas para volver a caminar, ' +
'quiero que sepas que cada paso que das, aunque sea pequeño, ' +
'es para mí el más grande de los actos de valentía. ' +
'No te rindes. Nunca te has rendido. ' +
'Y eso me enseñó más que cualquier lección de vida.\n\n' +
'Que este Día de la Madre te encuentre rodeada de amor, ' +
'sintiendo en el aire todo lo que no siempre se dice ' +
'pero siempre se siente entre los que te queremos.\n\n' +
'Eres mi raíz, mi historia, mi mayor orgullo. ' +
'Sana pronto, abuelita. Te necesitamos de pie, como siempre has estado.\n\n' +
'Te amo infinitamente.',

  abuela_gen: function (n) {
    return n + ',\n\n' +
'Las abuelas guardan en sus manos la calidez de todos los abrazos que alguna vez dieron, ' +
'y en su mirada, la historia de todo el amor que han sembrado.\n\n' +
'Tú eres de esas abuelas que no solo cuidan, sino que enseñan, que forman, ' +
'que dejan algo hermoso en el alma de quienes te rodean.\n\n' +
'En este Día de la Madre, quiero celebrarte a ti también. ' +
'Porque tu amor fue y sigue siendo un regalo que atesoro cada día.\n\n' +
'Feliz Día, abuelita. Te mereces todo lo bueno del mundo.';
  }

}; // end P

/* ════════════════════════════════════════════════
   7. CARD BUILDER
   ════════════════════════════════════════════════ */

/** Escapa caracteres HTML peligrosos */
function esc(t) {
  return String(t)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Convierte saltos de línea en <br> (después de escapar) */
function br(t) { return esc(t).replace(/\n/g, '<br>'); }

/** Normaliza texto: sin acentos, minúsculas, sin espacios extremos */
function norm(s) {
  return String(s).trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** Compara nombre del visitante contra lista de nombres esperados */
function isName(input, targets) {
  var n = norm(input);
  return targets.some(function (t) { return norm(t) === n; });
}

/** Primera letra mayúscula, resto minúsculas */
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/**
 * Construye el HTML de la tarjeta y devuelve { html, heartMode }
 * @param {string} role   – mama | prima | tia | abuela
 * @param {string} rawName – nombre tal como lo escribió el usuario
 */
function buildCard(role, rawName) {
  var name      = capitalize(rawName);
  var lbl       = { mama:'Mamá 💕', prima:'Prima 🌷', tia:'Tía 🌺', abuela:'Abuela 🌸' }[role];
  var deco      = { mama:'🌹',       prima:'🌷',        tia:'🌺',      abuela:'🌸' }[role];
  var poem      = '';
  var special   = '';
  var heartMode = false;

  /* ── Selección de poema ── */
  if (role === 'mama') {
    if (isName(rawName, ['lisbeth'])) { poem = P.mama_lisbeth; special = 'lisbeth'; }
    else                               { poem = P.mama_gen(name); }

  } else if (role === 'prima') {
    if      (isName(rawName, ['vianka']))  { poem = P.prima_vianka; }
    else if (isName(rawName, ['natalia'])) { poem = P.prima_natalia; }
    else {
      var idx = norm(rawName).length % 3;
      poem = P.prima_gen[idx](name);
    }

  } else if (role === 'tia') {
    if      (isName(rawName, ['tatiana']))  { poem = P.tia_tatiana; }
    else if (isName(rawName, ['jessenia'])) { poem = P.tia_jessenia; }
    else if (isName(rawName, ['sandra']))   { poem = P.tia_sandra; }
    else {
      var idx = norm(rawName).length % 3;
      poem = P.tia_gen[idx](name);
    }

  } else if (role === 'abuela') {
    if (isName(rawName, ['basilia'])) { poem = P.abuela_basilia; heartMode = true; }
    else                               { poem = P.abuela_gen(name); }
  }

  /* ── Bloque de poema (pentagram para Lisbeth, normal para el resto) ── */
  var poemBlock = '';
  if (special === 'lisbeth') {
    poemBlock =
      '<div class="staff-box">' +
        '<div class="staff-lines">' + Array(20).fill('<div class="staff-line"></div>').join('') + '</div>' +
        '<div class="staff-clef">𝄞</div>' +
        '<div class="staff-notes">♩ ♪ ♫ ♬</div>' +
        '<div class="staff-poem">' + br(poem) + '</div>' +
      '</div>';
  } else {
    poemBlock =
      '<div class="poem-box">' +
        '<div class="poem-txt">' + br(poem) + '</div>' +
      '</div>';
  }

  /* ── HTML completo ── */
  var html =
    /* Header */
    '<div class="card-header">' +
      '<div class="card-deco">' + deco + '</div>' +
      '<div class="card-role-lbl">Para mi ' + lbl + '</div>' +
      '<h2 class="card-name-h">' + esc(name) + '</h2>' +
    '</div>' +

    /* Poem */
    poemBlock +

    /* ──────────────────────────────────────────────
       🖼️ CAMBIA AQUÍ LA IMAGEN 🖼️
       Reemplaza el src="" de abajo con el enlace
       directo de tu foto/imagen especial.
       Ejemplo: src="https://i.imgur.com/tuFoto.jpg"
       Puedes subir tu imagen a: https://imgur.com
       ────────────────────────────────────────────── */
    '<div class="img-section">' +
      '<img ' +
        'src="https://i.ibb.co/Fkw8R2bM/Madre.jpg" ' + // ⬅️ CAMBIA ESTA URL por tu imagen
        'id="img-preview" class="img-preview show" ' +
        'alt="Imagen especial para el Día de la Madre" ' +
        'onerror="this.style.display=\'none\'"' +
      '>' +
    '</div>' +

    /* Signature */
    '<div class="card-sig">' +
      '<span class="sig-txt">Con todo mi amor,<br>ATT: KEVIN RD 💕</span>' +
    '</div>';

  return { html: html, heartMode: heartMode };
}

/** Previsualiza la imagen pegada en la tarjeta */
function previewImg(url) {
  var img = document.getElementById('img-preview');
  if (!img) return;
  if (!url) { img.classList.remove('show'); return; }
  img.src     = url;
  img.onload  = function () { img.classList.add('show'); };
  img.onerror = function () { img.classList.remove('show'); };
}

/* ════════════════════════════════════════════════
   8. FORM
   ════════════════════════════════════════════════ */
function submitForm() {
  /* ── Bloqueo hasta el 27 de mayo ── */
  if (!isMothersDayToday()) {
    var wrap = document.getElementById('countdown-wrap');
    if (wrap) {
      wrap.style.animation = 'none';
      wrap.style.transform = 'scale(1.05)';
      wrap.style.transition = 'transform 0.2s';
      setTimeout(function () { wrap.style.transform = ''; }, 300);
    }
    alert('💐 ¡Aún no es el momento!\nEspera hasta el 27 de mayo para abrir tu tarjeta. ¡La sorpresa vale la pena! 🌹');
    return;
  }
  var roleEl = document.getElementById('sel-role');
  var nameEl = document.getElementById('inp-name');
  var ok     = true;

  /* Validar relación */
  if (!roleEl.value) {
    roleEl.classList.add('is-error');
    document.getElementById('err-role').classList.add('show');
    ok = false;
  } else {
    roleEl.classList.remove('is-error');
    document.getElementById('err-role').classList.remove('show');
  }

  /* Validar nombre */
  if (!nameEl.value.trim()) {
    nameEl.classList.add('is-error');
    document.getElementById('err-name').classList.add('show');
    ok = false;
  } else {
    nameEl.classList.remove('is-error');
    document.getElementById('err-name').classList.remove('show');
  }

  if (!ok) return;

  var role    = roleEl.value;
  var rawName = nameEl.value.trim();

  /* Guardar sesión */
  saveSession(rawName, role);

  /* Construir tarjeta */
  var result = buildCard(role, rawName);
  document.getElementById('card-content').innerHTML = result.html;

  /* Mostrar pantalla de tarjeta */
  showScreen('scr-card');
  window.scrollTo(0, 0);

  /* Reproducir música si ya está cargada */
  autoPlayIfLoaded();

  /* Efecto corazones para Basilia */
  if (result.heartMode) setTimeout(startHearts, 400);
}

function goBack() { showScreen('scr-welcome'); }

/* ════════════════════════════════════════════════
   9. SCREENS
   ════════════════════════════════════════════════ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function (s) {
    s.classList.remove('active');
  });
  var target = document.getElementById(id);
  if (target) target.classList.add('active');
}

/* ════════════════════════════════════════════════
   10. ADMIN
   ════════════════════════════════════════════════ */
function openAdminModal() {
  document.getElementById('modal-admin').classList.add('show');
  setTimeout(function () { document.getElementById('m-user').focus(); }, 120);
}

function closeAdminModal() {
  document.getElementById('modal-admin').classList.remove('show');
  document.getElementById('m-user').value = '';
  document.getElementById('m-pass').value = '';
  document.getElementById('login-err').classList.remove('show');
}

function doLogin() {
  var u = document.getElementById('m-user').value;
  var p = document.getElementById('m-pass').value;

  /* Credenciales de administrador */
  if (u === 'kev1nrd' && p === '34113RD') {
    closeAdminModal();
    renderAdmin();
    showScreen('scr-admin');
  } else {
    document.getElementById('login-err').classList.add('show');
    document.getElementById('m-pass').value = '';
    document.getElementById('m-pass').focus();
  }
}

function adminLogout() { showScreen('scr-welcome'); }

function clearSessions() {
  if (confirm('¿Eliminar todos los registros de sesiones?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderAdmin();
  }
}

/** Renderiza la tabla de sesiones en el dashboard admin */
function renderAdmin() {
  var sessions = getSessions();
  var count    = sessions.length;
  var labels   = { mama:'Mamá', prima:'Prima', tia:'Tía', abuela:'Abuela' };

  document.getElementById('sessions-count').textContent =
    count + (count === 1 ? ' sesión' : ' sesiones');

  var html = '';
  if (!sessions.length) {
    html = '<div class="empty-state">No hay sesiones registradas aún. 🌸</div>';
  } else {
    html =
      '<table class="sessions-tbl">' +
        '<thead><tr>' +
          '<th>#</th><th>Nombre</th><th>Relación</th><th>Fecha y Hora</th>' +
        '</tr></thead>' +
        '<tbody>' +
        sessions.map(function (s, i) {
          var d  = new Date(s.ts);
          var dt = d.toLocaleDateString('es', { day:'2-digit', month:'short', year:'numeric' }) +
                   ' ' + d.toLocaleTimeString('es', { hour:'2-digit', minute:'2-digit' });
          return (
            '<tr>' +
              '<td>' + (i + 1) + '</td>' +
              '<td>' + esc(s.name) + '</td>' +
              '<td><span class="badge badge-' + s.role + '">' + (labels[s.role] || s.role) + '</span></td>' +
              '<td>' + dt + '</td>' +
            '</tr>'
          );
        }).join('') +
        '</tbody>' +
      '</table>';
  }

  document.getElementById('sessions-list').innerHTML = html;
}

/* ════════════════════════════════════════════════
   11. INIT
   ════════════════════════════════════════════════ */
(function init() {
  createPetals();
  renderCountdown();

  /* Inicializar volumen del slider */
  var slider = document.getElementById('vol-slider');
  if (slider) setVolume(slider.value);

  /* 🎵 Intentar reproducir música automáticamente */
  tryAutoPlay();
})();
