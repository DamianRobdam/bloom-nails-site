/* ============================================================
   Bloom · Animación de entrada
   Una mano real: las uñas naturales cambian a tres diseños del
   catálogo cuando pasa un barrido de luz. Sonido sintetizado en
   el navegador (sin archivos de audio). Se muestra en cada ingreso.
   ============================================================ */
(function () {
  "use strict";

  var overlay = document.getElementById("intro-bloom");
  if (!overlay) return;

  var capas = [1, 2, 3].map(function (n) { return document.getElementById("intro-capa-" + n); });
  var brillo = document.getElementById("intro-brillo");
  var leyenda = document.getElementById("intro-leyenda");
  var botonSaltar = document.getElementById("intro-saltar");

  if (!capas[0] || !capas[1] || !capas[2] || !brillo || !leyenda) {
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

  /* ---------------- animación: barrido de luz ---------------- */
  var reducirMovimiento = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function mostrarTexto(clave) {
    var items = leyenda.querySelectorAll(".intro-diseno");
    for (var k = 0; k < items.length; k++) {
      items[k].classList.toggle("visible", items[k].getAttribute("data-diseno") === String(clave));
    }
  }

  function barrido(n) {
    var capa = capas[n - 1];
    // reinicia el brillo para que la franja vuelva a pasar
    brillo.classList.remove("en-barrido");
    void brillo.offsetWidth;
    brillo.classList.add("en-barrido");
    capa.classList.add("en-barrido");
    mostrarTexto("");                       // el nombre anterior se va...
    despues(function () { mostrarTexto(n); }, 520); // ...y entra el del nuevo diseño
    // pequeño "cling" ascendente mientras pasa la luz
    var base = [880, 1046.5, 1174.66][n - 1];
    reproducirNota(base);
    despues(function () { reproducirNota(base * 1.5); }, 150);
  }

  function iniciar() {
    if (reducirMovimiento) {
      // sin movimiento: se muestra el último diseño y el lema, y se cierra pronto
      capas[2].classList.add("en-barrido");
      mostrarTexto("final");
      despues(cerrarIntro, 2200);
      return;
    }
    despues(function () { barrido(1); }, 900);
    despues(function () { barrido(2); }, 2300);
    despues(function () { barrido(3); }, 3700);
    despues(function () {
      mostrarTexto("final");
      reproducirAcordeFinal();
    }, 5000);
    despues(cerrarIntro, 6700);
  }

  // Si algo tarda demasiado (navegador lento, pestaña en segundo plano),
  // no dejar a la clienta atrapada: cierre de seguridad.
  despues(cerrarIntro, 9000);

  requestAnimationFrame(function () {
    requestAnimationFrame(iniciar);
  });
})();
