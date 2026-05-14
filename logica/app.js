'use strict';

/* ════════════════════════════════════════════════
   1. MUSIC
   ════════════════════════════════════════════════ */
var audio        = document.getElementById('bg-audio');
var musicPlaying = false;
var musicLoaded  = false;
var panelOpen    = false;

var src = "musica/madre.mp3"; // ⬅️ CAMBIA ESTA LÍNEA con la ruta o URL de tu música
// ⬆️ Ejemplos:
//    var src = "musica/despacito.mp3";            → archivo local en carpeta musica/
//    var src = "https://tusitio.com/cancion.mp3"; → URL directa a un .mp3

function tryAutoPlay() {
  if (!src) return;
  audio.src    = src;
  audio.volume = 0.25;
  audio.load();
  audio.play()
    .then(function () {
      musicLoaded  = true;
      musicPlaying = true;
      updatePlayerUI('🎶 Música del Día de la Madre');
    })
    .catch(function () {
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

function toggleMusicPanel() {
  panelOpen = !panelOpen;
  var panel = document.getElementById('music-panel');
  var fab   = document.getElementById('music-fab');
  panel.classList.toggle('show', panelOpen);
  fab.classList.toggle('active', panelOpen);
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

function loadFromUrl() {
  var url = document.getElementById('music-url-inp').value.trim();
  if (!url) { setMusicStatus('⚠️ Escribe una URL válida.', true); return; }
  audio.src = url;
  audio.load();
  audio.play()
    .then(function () {
      musicLoaded = true; musicPlaying = true;
      updatePlayerUI(url.split('/').pop() || 'Audio desde URL');
      setMusicStatus('✅ Reproduciendo desde URL');
    })
    .catch(function () {
      setMusicStatus('❌ No se pudo cargar. Verifica que sea un .mp3 directo.', true);
    });
}

function loadFromFile(file) {
  if (!file) return;
  var objUrl = URL.createObjectURL(file);
  audio.src  = objUrl;
  audio.load();
  audio.play()
    .then(function () {
      musicLoaded = true; musicPlaying = true;
      updatePlayerUI(file.name);
      setMusicStatus('✅ Reproduciendo: ' + file.name);
    })
    .catch(function () { setMusicStatus('❌ Error al cargar el archivo.', true); });
}

function toggleMusicPlay() {
  if (!musicLoaded) { setMusicStatus('⚠️ Carga una canción primero.', true); return; }
  if (musicPlaying) { audio.pause(); musicPlaying = false; }
  else              { audio.play().catch(function () {}); musicPlaying = true; }
  updatePlayPauseBtn();
}

function autoPlayIfLoaded() {
  if (musicLoaded && !musicPlaying) {
    audio.play().catch(function () {});
    musicPlaying = true;
    updatePlayPauseBtn();
  }
}

function setVolume(val) {
  var pct = Math.min(100, Math.max(0, parseInt(val, 10)));
  audio.volume = pct / 100;
  document.getElementById('vol-slider').style.setProperty('--vol', pct + '%');
}

function updatePlayPauseBtn() {
  var btn = document.getElementById('mp-playpause');
  if (btn) btn.textContent = musicPlaying ? '⏸' : '▶';
}

function updatePlayerUI(name) {
  var el = document.getElementById('mp-now-playing');
  if (el) el.textContent = '♪ ' + name;
  updatePlayPauseBtn();
}

function setMusicStatus(msg, isError) {
  var el = document.getElementById('mp-status');
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? '#e74c3c' : '#27ae60';
  clearTimeout(el._t);
  el._t = setTimeout(function () { el.textContent = ''; }, 4000);
}

/* ════════════════════════════════════════════════
   2. COUNTDOWN — 27 de mayo (Día de la Madre)
   ════════════════════════════════════════════════ */
var countdownInterval = null;

function getMothersDayTarget() {
  var now  = new Date();
  var year = now.getFullYear();
  var md   = new Date(year, 4, 27, 0, 0, 0);
  if (now >= new Date(year, 4, 28, 0, 0, 0)) md = new Date(year + 1, 4, 27, 0, 0, 0);
  return md;
}

function isMothersDayToday() {
  var now = new Date();
  return now.getMonth() === 4 && now.getDate() >= 27;
}

function renderCountdown() {
  var wrap = document.getElementById('countdown-wrap');
  if (!wrap) return;

  if (isMothersDayToday()) {
    wrap.innerHTML =
      '<div class="countdown-today">' +
        '🌹 ¡Hoy es el Día de la Madre! 🌹' +
        '<span class="ct-sub">Un día para celebrar a quienes nos dieron todo 💕</span>' +
      '</div>';
    return;
  }

  wrap.innerHTML =
    '<div class="countdown-lbl">Faltan para el Día de la Madre (27 de mayo) 🌹</div>' +
    '<div class="countdown-grid">' +
      '<div class="cd-unit"><span class="cd-num" id="cd-d">--</span><span class="cd-lbl">Días</span></div>' +
      '<div class="cd-unit"><span class="cd-num" id="cd-h">--</span><span class="cd-lbl">Horas</span></div>' +
      '<div class="cd-unit"><span class="cd-num" id="cd-m">--</span><span class="cd-lbl">Min</span></div>' +
      '<div class="cd-unit"><span class="cd-num" id="cd-s">--</span><span class="cd-lbl">Seg</span></div>' +
    '</div>';

  function tick() {
    var diff = Math.max(0, getMothersDayTarget() - new Date());
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
    if (diff === 0) { clearInterval(countdownInterval); renderCountdown(); }
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
    var el            = document.createElement('div');
    el.className      = 'petal';
    el.textContent    = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left              = (Math.random() * 100) + 'vw';
    el.style.fontSize          = (.9 + Math.random() * 1.2) + 'rem';
    el.style.animationDuration   = (9 + Math.random() * 12) + 's';
    el.style.animationDelay      = (Math.random() * 12) + 's';
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
    var el            = document.createElement('div');
    el.className      = 'heart';
    el.textContent    = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left              = (Math.random() * 100) + 'vw';
    el.style.fontSize          = (1.2 + Math.random() * 2) + 'rem';
    el.style.animationDuration   = (4 + Math.random() * 5) + 's';
    container.appendChild(el);
    setTimeout(function () { el.remove(); }, 9000);
    count++;
  }, 170);
}

/* ════════════════════════════════════════════════
   5. SESSIONS
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

function exportJSON() {
  var payload = {
    _info: 'Sesiones — Día de la Madre',
    _version: '1.0',
    _exportado: new Date().toISOString(),
    sessions: getSessions()
  };
  var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  var url  = URL.createObjectURL(blob);
  var a    = document.createElement('a');
  a.href = url; a.download = 'sesiones-dia-madre.json';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

/* ════════════════════════════════════════════════
   6. NOMBRES REGISTRADOS
   ════════════════════════════════════════════════
   Mamá   → solo Lisbeth            (otros: bloqueado)
   Prima  → solo Vianka y Natalia   (otros: bloqueado)
   Abuela → solo Basilia            (otros: bloqueado)
   Tía    → cualquier nombre        (sin restricción)
   ════════════════════════════════════════════════ */
var REGISTERED = {
  mama:   ['lisbeth'],
  prima:  ['vianka', 'natalia'],
  abuela: ['basilia'],
  tia:    null   // null = sin restricción
};

/* ════════════════════════════════════════════════
   7. POEMS & FRASES
   ════════════════════════════════════════════════ */
var P = {

  /* ─── MAMÁ — Lisbeth ─── */
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
'Te mereces el mundo entero.\n\nTe amo con todo. Feliz día de la madre.',

  /* ─── PRIMA — Vianka ─── */
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
'y la certeza de que lo que haces importa.\n\nFeliz Día de la Madre, Vianka. Te lo mereces todo.',

  /* ─── PRIMA — Natalia ─── */
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
'y que este mundo es mejor contigo en él.\n\nFeliz Día de la Madre. Con mucho cariño.',

  /* ─── TÍA — Tatiana ─── */
  tia_tatiana:
'Tatiana,\n\n' +
'Hay tías que son solo tías, y hay tías que son mucho más. Tú eres de las segundas.\n\n' +
'Desde pequeño te vi dar amor de sobra, sin pedir nada a cambio. ' +
'Esa forma tuya de estar, de escuchar, de aparecer cuando más se necesita, ' +
'es un regalo que no todos tienen la suerte de recibir.\n\n' +
'Hoy que se celebra a las mamás, quiero que sepas ' +
'que el amor que das merece ser reconocido, honrado y celebrado.\n\n' +
'Feliz Día de la Madre, Tatiana. Que este día esté tan lleno de amor ' +
'como el que tú has regalado a quienes te rodean.',

  /* ─── TÍA — Jessenia ─── */
  tia_jessenia:
'Jessenia,\n\n' +
'Hay personas que con solo estar llenan un cuarto de luz, y tú eres una de ellas.\n\n' +
'Como tía has sido un ejemplo de fuerza, de amor, ' +
'de esa manera tan tuya de hacer que todo parezca posible cuando parece difícil. ' +
'No es poca cosa. Eso vale mucho.\n\n' +
'Hoy, en el Día de la Madre, quiero que este mensaje llegue a tu corazón ' +
'con todo el amor y la gratitud que mereces.\n\n' +
'Feliz Día de la Madre, Jessenia. Que tu día sea tan hermoso como el amor que regalas.',

  /* ─── TÍA — Sandra ─── */
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

  /* ─── ABUELA — Basilia ─── */
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
'No te rindes. Nunca te has rendido. Y eso me enseñó más que cualquier lección de vida.\n\n' +
'Que este Día de la Madre te encuentre rodeada de amor, ' +
'sintiendo en el aire todo lo que no siempre se dice ' +
'pero siempre se siente entre los que te queremos.\n\n' +
'Eres mi raíz, mi historia, mi mayor orgullo. ' +
'Sana pronto, abuelita. Te necesitamos de pie, como siempre has estado.\n\nTe amo infinitamente.'

}; // end P

/* ─── Frases aleatorias para tías no conocidas ─── */
var TIA_FRASES = [
  'Las tías especiales llenan la vida de amor sin que nadie se lo pida. Eso tiene un valor enorme.',
  'Hay personas que hacen la familia más grande y más bonita solo con estar. Tú eres una de ellas.',
  'El amor de tía es único: cercano, cálido y siempre presente cuando más se necesita.',
  'No hace falta verse todos los días para que alguien importe de verdad. Hoy te celebro a ti.',
  'En este día que honra a las mujeres que cuidan y aman, tú también eres parte de eso.',
  'Gracias por ser parte de esta familia y por todo el amor que traes consigo cada día.',
  'Hoy es un día para celebrar a mujeres especiales. Y tú, sin duda, lo eres.',
  'Que este día te llegue lleno de alegría, cariño y todo lo que mereces recibir.'
];

/* ════════════════════════════════════════════════
   8. CARD BUILDER
   ════════════════════════════════════════════════ */
function esc(t) {
  return String(t)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function br(t)   { return esc(t).replace(/\n/g, '<br>'); }
function norm(s) {
  return String(s).trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function isName(input, targets) {
  var n = norm(input);
  return targets.some(function (t) { return norm(t) === n; });
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }

/* ── Tarjeta de nombre NO registrado ── */
function buildBlockedCard(role, name) {
  var lbl = { mama:'Mamá', prima:'Prima', abuela:'Abuela', tia:'Tía' }[role];
  return (
    '<div class="blocked-card">' +
      '<div class="blocked-lock">🔒</div>' +
      '<h2 class="blocked-title">Mensaje privado</h2>' +
      '<p class="blocked-msg">' +
        'Hola <strong>' + esc(name) + '</strong>, este mensaje está reservado ' +
        'para personas especiales en la categoría <strong>' + lbl + '</strong>.<br><br>' +
        'Tu nombre no aparece en nuestra lista. Si crees que es un error, ' +
        'contacta a quien te compartió este enlace. 🌸' +
      '</p>' +
      '<button class="btn-back-blocked" onclick="goBack()">← Volver al inicio</button>' +
    '</div>'
  );
}

/**
 * Construye el HTML de la tarjeta.
 * Retorna { html, heartMode }
 */
function buildCard(role, rawName) {
  var name      = capitalize(rawName);
  var lbl       = { mama:'Mamá 💕', prima:'Prima 🌷', tia:'Tía 🌺', abuela:'Abuela 🌸' }[role];
  var deco      = { mama:'🌹', prima:'🌷', tia:'🌺', abuela:'🌸' }[role];
  var poem      = '';
  var special   = '';
  var heartMode = false;

  /* ── Verificar registro (mama / prima / abuela) ── */
  var allowedNames = REGISTERED[role]; // null = tía, sin restricción
  if (allowedNames !== null && !isName(rawName, allowedNames)) {
    return { html: buildBlockedCard(role, name), heartMode: false };
  }

  /* ── Seleccionar poema según nombre ── */
  if (role === 'mama') {
    poem    = P.mama_lisbeth;
    special = 'lisbeth';

  } else if (role === 'prima') {
    poem = isName(rawName, ['vianka']) ? P.prima_vianka : P.prima_natalia;

  } else if (role === 'tia') {
    if      (isName(rawName, ['tatiana']))  poem = P.tia_tatiana;
    else if (isName(rawName, ['jessenia'])) poem = P.tia_jessenia;
    else if (isName(rawName, ['sandra']))   poem = P.tia_sandra;
    else {
      /* Tía desconocida → saludo + frase aleatoria */
      var frase = TIA_FRASES[Math.floor(Math.random() * TIA_FRASES.length)];
      poem = '¡Feliz Día de la Madre, ' + name + '! 🌺\n\n' + frase +
             '\n\n¡Que tengas un día tan especial como tú lo eres!';
    }

  } else if (role === 'abuela') {
    poem      = P.abuela_basilia;
    heartMode = true;
  }

  /* ── Bloque de poema ── */
  var poemBlock = (special === 'lisbeth')
    ? '<div class="staff-box">' +
        '<div class="staff-lines">' + Array(20).fill('<div class="staff-line"></div>').join('') + '</div>' +
        '<div class="staff-clef">𝄞</div>' +
        '<div class="staff-notes">♩ ♪ ♫ ♬</div>' +
        '<div class="staff-poem">' + br(poem) + '</div>' +
      '</div>'
    : '<div class="poem-box"><div class="poem-txt">' + br(poem) + '</div></div>';

  /* ── HTML de la tarjeta ── */
  var html =
    '<div class="card-header">' +
      '<div class="card-deco">' + deco + '</div>' +
      '<div class="card-role-lbl">Para mi ' + lbl + '</div>' +
      '<h2 class="card-name-h">' + esc(name) + '</h2>' +
    '</div>' +
    poemBlock +
    buildImageBlock(role, rawName) +
    '<div class="card-sig"><span class="sig-txt">Con todo mi amor,<br>ATT: KEVIN RD 💕</span></div>';

  return { html: html, heartMode: heartMode };
}

/* ════════════════════════════════════════════════
   IMÁGENES POR PERSONA
   ════════════════════════════════════════════════
   ► Busca el nombre de la persona abajo y reemplaza
     el  ''  vacío con la URL directa de su foto.

   Ejemplo:
     imgUrl = 'https://i.imgur.com/tuFoto.jpg';

   Puedes subir fotos gratis en: https://imgur.com
   ════════════════════════════════════════════════ */
function buildImageBlock(role, rawName) {
  var imgUrl = '';

  if (role === 'mama') {
    imgUrl = 'https://i.ibb.co/q3djnWjM/Madre.jpg';                            // ⬅️ IMAGEN para LISBETH (Mamá)

  } else if (role === 'prima') {
    if (isName(rawName, ['vianka']))
      imgUrl = 'https://i.ibb.co/q3djnWjM/Madre.jpg';                          // ⬅️ IMAGEN para VIANKA
    else
      imgUrl = 'https://i.ibb.co/q3djnWjM/Madre.jpg ';                          // ⬅️ IMAGEN para NATALIA

  } else if (role === 'tia') {
    if      (isName(rawName, ['tatiana']))  imgUrl = 'https://i.ibb.co/q3djnWjM/Madre.jpg'; // ⬅️ IMAGEN para TATIANA
    else if (isName(rawName, ['jessenia'])) imgUrl = 'https://i.ibb.co/q3djnWjM/Madre.jpg'; // ⬅️ IMAGEN para JESSENIA
    else if (isName(rawName, ['sandra']))   imgUrl = 'https://i.ibb.co/q3djnWjM/Madre.jpg'; // ⬅️ IMAGEN para SANDRA
    else                                    imgUrl = 'https://i.ibb.co/q3djnWjM/Madre.jpg'; // ⬅️ IMAGEN genérica otras tías

  } else if (role === 'abuela') {
    imgUrl = 'https://i.ibb.co/q3djnWjM/Madre.jpg';                            // ⬅️ IMAGEN para BASILIA (Abuela)
  }

  if (!imgUrl) return ''; // sin URL → no mostrar sección de imagen

  return (
    '<div class="img-section">' +
      '<img src="' + imgUrl + '" class="img-preview show" alt="Imagen especial" ' +
        'onerror="this.parentElement.style.display=\'none\'">' +
    '</div>'
  );
}

/* ════════════════════════════════════════════════
   9. FORM
   ════════════════════════════════════════════════ */
function submitForm() {
  /* Bloqueo hasta el 27 de mayo */
  if (!isMothersDayToday()) {
    var wrap = document.getElementById('countdown-wrap');
    if (wrap) {
      wrap.style.transform  = 'scale(1.04)';
      wrap.style.transition = 'transform .2s';
      setTimeout(function () { wrap.style.transform = ''; }, 300);
    }
    alert('💐 ¡Aún no es el momento!\nEspera hasta el 27 de mayo para abrir tu tarjeta. ¡La sorpresa vale la pena! 🌹');
    return;
  }

  var roleEl = document.getElementById('sel-role');
  var nameEl = document.getElementById('inp-name');
  var ok     = true;

  if (!roleEl.value) {
    roleEl.classList.add('is-error');
    document.getElementById('err-role').classList.add('show');
    ok = false;
  } else {
    roleEl.classList.remove('is-error');
    document.getElementById('err-role').classList.remove('show');
  }

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

  saveSession(rawName, role);

  var result = buildCard(role, rawName);
  document.getElementById('card-content').innerHTML = result.html;

  showScreen('scr-card');
  window.scrollTo(0, 0);
  autoPlayIfLoaded();

  if (result.heartMode) setTimeout(startHearts, 400);
}

function goBack() { showScreen('scr-welcome'); }

/* ════════════════════════════════════════════════
   10. SCREENS
   ════════════════════════════════════════════════ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(function (s) {
    s.classList.remove('active');
  });
  var target = document.getElementById(id);
  if (target) target.classList.add('active');
}

/* ════════════════════════════════════════════════
   11. ADMIN
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
        '<thead><tr><th>#</th><th>Nombre</th><th>Relación</th><th>Fecha y Hora</th></tr></thead>' +
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
        '</tbody></table>';
  }
  document.getElementById('sessions-list').innerHTML = html;
}

/* ════════════════════════════════════════════════
   12. INIT
   ════════════════════════════════════════════════ */
(function init() {
  createPetals();
  renderCountdown();
  var slider = document.getElementById('vol-slider');
  if (slider) setVolume(slider.value);
  tryAutoPlay();
})();