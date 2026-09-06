/* ============================================================
   Bloom · Animación de entrada
   Una flor gira, uno de sus pétalos cae y "pinta" en secuencia
   cada una de las uñas de una mano ilustrada, con una pequeña
   melodía generada en el navegador (sin archivos de audio).
   Se muestra en cada ingreso al sitio.
   ============================================================ */
(function () {
  "use strict";

  var overlay = document.getElementById("intro-bloom");
  if (!overlay) return;

  var florCaja   = document.getElementById("intro-flor-caja");
  var petaloOrig = document.getElementById("intro-petalo-origen");
  var manoCaja   = document.getElementById("intro-mano-caja");
  var petaloLibre= document.getElementById("intro-petalo-libre");
  var marca      = document.getElementById("intro-marca");
  var botonSaltar= document.getElementById("intro-saltar");
  var unas = ["intro-una-1", "intro-una-2", "intro-una-3", "intro-una-4", "intro-una-5"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if (!florCaja || !manoCaja || !petaloLibre || !marca) {
    overlay.parentNode && overlay.parentNode.removeChild(overlay);
    return;
  }

  document.body.classList.add("intro-bloqueo");

  var cerrado = false;
  var temporizadores = [];
  function despues(fn, ms) { temporizadores.push(setTimeout(fn, ms)); }

  function cerrarIntro() {
    if (cerrado) return;
    cerrado = true;
    temporizadores.forEach(clearTimeout);
    overlay.classList.add("intro-cerrando");
    document.body.classList.remove("intro-bloqueo");
    setTimeout(function () {
      overlay.parentNode && overlay.parentNode.removeChild(overlay);
    }, 750);
  }

  if (botonSaltar) botonSaltar.addEventListener("click", cerrarIntro);

  /* ---------------- sonido (sintetizado, sin archivos) ---------------- */
  var audioCtx = null;
  function obtenerAudioCtx() {
    if (audioCtx) return audioCtx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { audioCtx = new AC(); } catch (e) { audioCtx = null; }
    return audioCtx;
  }
  function reproducirTono(freq, inicioSeg, duracionSeg, ganancia) {
    var ctx = obtenerAudioCtx();
    if (!ctx) return;
    try {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      var t0 = ctx.currentTime + inicioSeg;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(ganancia, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + duracionSeg);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duracionSeg + 0.05);
    } catch (e) { /* si el navegador bloquea audio, seguimos sin sonido */ }
  }
  function reproducirNota(freq) {
    var ctx = obtenerAudioCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().then(function () { reproducirTono(freq, 0, 0.28, 0.07); }).catch(function () {});
    } else {
      reproducirTono(freq, 0, 0.28, 0.07);
    }
  }
  function reproducirAcordeFinal() {
    var ctx = obtenerAudioCtx();
    if (!ctx) return;
    var disparar = function () {
      reproducirTono(659.25, 0, 0.6, 0.06);
      reproducirTono(830.6, 0.04, 0.65, 0.05);
      reproducirTono(987.77, 0.08, 0.75, 0.045);
    };
    if (ctx.state === "suspended") { ctx.resume().then(disparar).catch(function () {}); }
    else { disparar(); }
  }
  // Si el navegador bloquea audio hasta que haya interacción del usuario,
  // desbloqueamos en cuanto ocurra el primer toque/clic/tecla.
  function desbloquearAudio() {
    var ctx = obtenerAudioCtx();
    if (ctx && ctx.state === "suspended") ctx.resume().catch(function () {});
  }
  ["pointerdown", "keydown", "touchstart"].forEach(function (ev) {
    document.addEventListener(ev, desbloquearAudio, { once: true, passive: true });
  });
  // Intento inicial (funcionará directamente en navegadores que lo permitan)
  obtenerAudioCtx();

  /* ---------------- animación: el pétalo salta de uña en uña ---------------- */
  var notasEscala = [880, 932.33, 1046.5, 1174.66, 1318.51]; // melodía ascendente suave

  function centro(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  var petaloEstado = { x: 0, y: 0, rot: 0, iniciado: false };

  function moverPetaloA(elDestino, alTerminar) {
    var destino = centro(elDestino);
    var mitadAncho = petaloLibre.offsetWidth / 2;
    var mitadAlto = petaloLibre.offsetHeight / 2;
    var nuevoX = destino.x - mitadAncho;
    var nuevoY = destino.y - mitadAlto;
    petaloEstado.x = nuevoX;
    petaloEstado.y = nuevoY;
    petaloEstado.rot += 130;
    petaloLibre.style.transform =
      "translate(" + nuevoX + "px," + nuevoY + "px) rotate(" + petaloEstado.rot + "deg)";
    despues(alTerminar, 400);
  }

  function iniciarSecuenciaUnas() {
    var origenFlor = centro(florCaja);
    var mitadAncho = petaloLibre.offsetWidth / 2;
    var mitadAlto = petaloLibre.offsetHeight / 2;
    petaloEstado.x = origenFlor.x - mitadAncho;
    petaloEstado.y = origenFlor.y - mitadAlto;
    petaloEstado.rot = 0;
    petaloLibre.style.transform = "translate(" + petaloEstado.x + "px," + petaloEstado.y + "px) rotate(0deg)";
    petaloLibre.classList.add("activo");

    var i = 0;
    function siguiente() {
      if (i >= unas.length) {
        petaloLibre.style.opacity = "0";
        despues(function () {
          marca.classList.add("marca-visible");
          reproducirAcordeFinal();
        }, 200);
        despues(cerrarIntro, 2700);
        return;
      }
      moverPetaloA(unas[i], function () {
        unas[i].classList.add("una-pintada");
        reproducirNota(notasEscala[i] || 1318.51);
        i++;
        despues(siguiente, 140);
      });
    }
    siguiente();
  }

  function iniciar() {
    // 1) La flor ya gira sola vía animación CSS (~1.5s).
    despues(function () {
      // 2) La flor se desvanece y la mano aparece.
      florCaja.classList.add("flor-oculta");
      manoCaja.classList.add("mano-visible");
    }, 1450);

    despues(function () {
      // 3) El pétalo se desprende y empieza a saltar de uña en uña.
      iniciarSecuenciaUnas();
    }, 2000);
  }

  // Si algo tarda demasiado (navegador lento, pestaña en segundo plano),
  // no dejar a la clienta atrapada: cierre de seguridad.
  despues(cerrarIntro, 9000);

  requestAnimationFrame(function () {
    requestAnimationFrame(iniciar);
  });
})();
