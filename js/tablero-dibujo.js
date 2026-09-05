/* =========================================================
   BLOOM · Tablero de dibujo del personalizador (opcional)
   -----------------------------------------------------------
   Dibuja 5 uñas (una por dedo, con su nombre) con la forma que
   la clienta haya elegido arriba, y deja pintar sobre ellas con
   pincel/borrador, color y grosor. Es una guía visual para
   explicarnos su idea, no un editor profesional — por eso todo
   es intencionalmente simple. Es completamente OPCIONAL: está
   oculto hasta que la clienta marca la casilla para activarlo.

   Trucos técnicos usados:
   - Cada uña tiene DOS canvas apilados: uno de "base" (la forma
     rellena en crema, fija) y otro de "dibujo" (transparente,
     encima). Al dibujar solo se pinta el de encima.
   - El canvas de dibujo se recorta (ctx.clip()) con la silueta
     de la uña UNA sola vez y para siempre (nunca se hace
     ctx.restore()) — así cualquier trazo, incluso el borrador,
     queda automáticamente dentro de la forma de la uña sin
     salirse ni un pixel.
   - El borrador usa globalCompositeOperation = "destination-out":
     "borra" el dibujo de encima y deja ver otra vez la base
     crema, en vez de pintar de blanco.
   ========================================================= */

const BLOOM_PALETA_COLORES = [
  "#ffffff", "#2b2b2b", "#f6b8c4", "#e8869e", "#d4a373",
  "#8b5e3c", "#c62839", "#7a1f3d", "#c9a227", "#9aa0a6",
  "#4a6fa5", "#3f7d4f",
];
const BLOOM_NOMBRES_DEDOS = ["Pulgar", "Índice", "Medio", "Anular", "Meñique"];

let bloomTableroForma = "almendra";
let bloomTableroHerramienta = "pincel";
let bloomTableroColor = "#e8869e";
let bloomTableroGrosor = 6;
let bloomTableroDibujoHecho = false;
let bloomTableroLienzos = []; // [{ base, dibujo, ctx }, ...]
let bloomTableroHistorial = []; // [{ indice, imageData }, ...]
let bloomTableroCreado = false;

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("tablero-unas-grid")) return; // solo existe en personalizar.html

  // Toma la forma ya elegida arriba (categoría "Forma de la uña"), si existe
  if (typeof seleccion !== "undefined" && seleccion.forma && seleccion.forma[0]) {
    bloomTableroForma = seleccion.forma[0];
  }

  renderizarPaletaColores();

  document.getElementById("checkbox-activar-tablero")?.addEventListener("change", (e) => {
    const layout = document.getElementById("tablero-layout");
    if (!layout) return;
    if (e.target.checked) {
      layout.style.display = "grid";
      if (!bloomTableroCreado) crearTodosLosLienzos();
    } else {
      layout.style.display = "none";
    }
  });

  document.querySelectorAll(".herramienta-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      bloomTableroHerramienta = btn.dataset.herramienta;
      document.querySelectorAll(".herramienta-btn").forEach((b) => b.classList.toggle("activa", b === btn));
    });
  });

  document.getElementById("grosor-pincel")?.addEventListener("input", (e) => {
    bloomTableroGrosor = Number(e.target.value);
  });

  document.getElementById("color-personalizado-input")?.addEventListener("input", (e) => {
    bloomTableroColor = e.target.value;
    document.querySelectorAll(".color-swatch").forEach((b) => b.classList.remove("activo"));
  });

  document.getElementById("btn-limpiar-tablero")?.addEventListener("click", limpiarTodoElTablero);
  document.getElementById("btn-deshacer-trazo")?.addEventListener("click", deshacerTrazo);

  document.getElementById("btn-tablero-descargar-png")?.addEventListener("click", () => descargarImagenTablero("png"));
  document.getElementById("btn-tablero-descargar-jpg")?.addEventListener("click", () => descargarImagenTablero("jpg"));
});

// Llamado desde js/personalizar.js cuando la clienta cambia la forma en la
// categoría de arriba, para que el tablero (si ya está abierto) se actualice.
window.bloomActualizarFormaTablero = function (formaId) {
  bloomTableroForma = formaId;
  if (bloomTableroCreado) crearTodosLosLienzos();
};

// ---------------- FORMA DE UÑA (silueta reutilizable) ----------------
function trazarFormaUna(ctx, forma, w, h) {
  const bx1 = w * 0.2, bx2 = w * 0.8, by = h * 0.92;
  ctx.beginPath();
  ctx.moveTo(bx1, by);
  ctx.quadraticCurveTo(w * 0.5, by + h * 0.04, bx2, by); // curva de la cutícula

  if (forma === "cuadrada") {
    ctx.lineTo(w * 0.86, h * 0.2);
    ctx.quadraticCurveTo(w * 0.86, h * 0.08, w * 0.72, h * 0.08);
    ctx.lineTo(w * 0.28, h * 0.08);
    ctx.quadraticCurveTo(w * 0.14, h * 0.08, w * 0.14, h * 0.2);
    ctx.lineTo(bx1, by);
  } else if (forma === "oval") {
    ctx.bezierCurveTo(w * 0.92, h * 0.55, w * 0.76, h * 0.06, w * 0.5, h * 0.03);
    ctx.bezierCurveTo(w * 0.24, h * 0.06, w * 0.08, h * 0.55, bx1, by);
  } else if (forma === "coffin") {
    ctx.lineTo(w * 0.68, h * 0.12);
    ctx.lineTo(w * 0.32, h * 0.12);
    ctx.lineTo(bx1, by);
  } else if (forma === "stiletto") {
    ctx.lineTo(w * 0.5, h * 0.03);
    ctx.lineTo(bx1, by);
  } else {
    // almendra (por defecto)
    ctx.bezierCurveTo(w * 0.88, h * 0.48, w * 0.66, h * 0.06, w * 0.5, h * 0.04);
    ctx.bezierCurveTo(w * 0.34, h * 0.06, w * 0.12, h * 0.48, bx1, by);
  }
  ctx.closePath();
}

// ---------------- CREAR LOS 5 LIENZOS ----------------
function crearTodosLosLienzos() {
  const contenedor = document.getElementById("tablero-unas-grid");
  if (!contenedor) return;

  contenedor.innerHTML = "";
  bloomTableroLienzos = [];
  bloomTableroHistorial = [];
  bloomTableroDibujoHecho = false;
  bloomTableroCreado = true;

  for (let i = 0; i < 5; i++) {
    const caja = document.createElement("div");
    caja.className = "una-lienzo-caja";

    const lienzoInterior = document.createElement("div");
    lienzoInterior.className = "una-lienzo-interior";

    const base = document.createElement("canvas");
    base.width = 130;
    base.height = 190;
    base.className = "una-lienzo-base";

    const dibujo = document.createElement("canvas");
    dibujo.width = 130;
    dibujo.height = 190;
    dibujo.className = "una-lienzo-dibujo";

    lienzoInterior.appendChild(base);
    lienzoInterior.appendChild(dibujo);

    const etiqueta = document.createElement("span");
    etiqueta.className = "una-lienzo-etiqueta";
    etiqueta.textContent = BLOOM_NOMBRES_DEDOS[i] || `Uña ${i + 1}`;

    caja.appendChild(lienzoInterior);
    caja.appendChild(etiqueta);
    contenedor.appendChild(caja);

    // Base: la forma rellena en crema con borde — sirve de "papel" fijo
    const ctxBase = base.getContext("2d");
    trazarFormaUna(ctxBase, bloomTableroForma, base.width, base.height);
    ctxBase.fillStyle = "#fffaf5";
    ctxBase.fill();
    ctxBase.lineWidth = 3;
    ctxBase.strokeStyle = "#f3d9c9";
    ctxBase.stroke();

    // Dibujo: mismo contorno usado como recorte (clip) permanente
    const ctxDibujo = dibujo.getContext("2d");
    ctxDibujo.save();
    trazarFormaUna(ctxDibujo, bloomTableroForma, dibujo.width, dibujo.height);
    ctxDibujo.clip();
    ctxDibujo.lineCap = "round";
    ctxDibujo.lineJoin = "round";

    const lienzo = { base, dibujo, ctx: ctxDibujo };
    bloomTableroLienzos.push(lienzo);
    activarDibujoEnLienzo(lienzo, bloomTableroLienzos.length - 1);
  }
}

// ---------------- DIBUJAR (mouse y táctil) ----------------
function activarDibujoEnLienzo(lienzo, indice) {
  const canvas = lienzo.dibujo;
  canvas.style.touchAction = "none";
  let dibujando = false;

  const posicion = (e) => {
    const rect = canvas.getBoundingClientRect();
    const escalaX = canvas.width / rect.width;
    const escalaY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * escalaX, y: (e.clientY - rect.top) * escalaY };
  };

  const aplicarEstilo = () => {
    if (bloomTableroHerramienta === "borrador") {
      lienzo.ctx.globalCompositeOperation = "destination-out";
    } else {
      lienzo.ctx.globalCompositeOperation = "source-over";
      lienzo.ctx.strokeStyle = bloomTableroColor;
    }
    lienzo.ctx.lineWidth = bloomTableroGrosor;
  };

  canvas.addEventListener("pointerdown", (e) => {
    guardarEnHistorial(indice);
    dibujando = true;
    aplicarEstilo();
    const p = posicion(e);
    lienzo.ctx.beginPath();
    lienzo.ctx.moveTo(p.x, p.y);
    lienzo.ctx.lineTo(p.x, p.y); // dibuja un punto si solo hace clic
    lienzo.ctx.stroke();
    bloomTableroDibujoHecho = true;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!dibujando) return;
    aplicarEstilo();
    const p = posicion(e);
    lienzo.ctx.lineTo(p.x, p.y);
    lienzo.ctx.stroke();
    bloomTableroDibujoHecho = true;
  });

  ["pointerup", "pointerleave", "pointercancel"].forEach((evento) => {
    canvas.addEventListener(evento, () => {
      dibujando = false;
      lienzo.ctx.beginPath();
    });
  });
}

// ---------------- DESHACER / LIMPIAR ----------------
function guardarEnHistorial(indice) {
  const lienzo = bloomTableroLienzos[indice];
  if (!lienzo) return;
  const imageData = lienzo.ctx.getImageData(0, 0, lienzo.dibujo.width, lienzo.dibujo.height);
  bloomTableroHistorial.push({ indice, imageData });
  if (bloomTableroHistorial.length > 25) bloomTableroHistorial.shift();
}

function deshacerTrazo() {
  const ultimo = bloomTableroHistorial.pop();
  if (!ultimo) return;
  const lienzo = bloomTableroLienzos[ultimo.indice];
  if (lienzo) lienzo.ctx.putImageData(ultimo.imageData, 0, 0);
}

function limpiarTodoElTablero() {
  bloomTableroLienzos.forEach((lienzo) => {
    lienzo.ctx.clearRect(0, 0, lienzo.dibujo.width, lienzo.dibujo.height);
  });
  bloomTableroHistorial = [];
  bloomTableroDibujoHecho = false;
}

// ---------------- PALETA DE COLORES ----------------
function renderizarPaletaColores() {
  const contenedor = document.getElementById("paleta-colores");
  if (!contenedor) return;

  contenedor.innerHTML = BLOOM_PALETA_COLORES.map(
    (color, i) => `<button type="button" class="color-swatch${color === bloomTableroColor ? " activo" : ""}" data-color="${color}" style="background:${color};" aria-label="Color ${i + 1}"></button>`
  ).join("");

  contenedor.querySelectorAll(".color-swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      bloomTableroColor = btn.dataset.color;
      contenedor.querySelectorAll(".color-swatch").forEach((b) => b.classList.toggle("activo", b === btn));
      const inputColor = document.getElementById("color-personalizado-input");
      if (inputColor) inputColor.value = bloomTableroColor;
    });
  });
}

// ---------------- IMAGEN COMPUESTA (para el carrito y para descargar) ----------------
function generarImagenComposite() {
  if (!bloomTableroLienzos.length) return null;

  const ancho = bloomTableroLienzos[0].base.width;
  const alto = bloomTableroLienzos[0].base.height;
  const espacio = 10;
  const lienzoFinal = document.createElement("canvas");
  lienzoFinal.width = ancho * bloomTableroLienzos.length + espacio * (bloomTableroLienzos.length - 1);
  lienzoFinal.height = alto;

  const ctxFinal = lienzoFinal.getContext("2d");
  ctxFinal.fillStyle = "#fffaf5";
  ctxFinal.fillRect(0, 0, lienzoFinal.width, lienzoFinal.height);

  bloomTableroLienzos.forEach((lienzo, i) => {
    const x = i * (ancho + espacio);
    ctxFinal.drawImage(lienzo.base, x, 0);
    ctxFinal.drawImage(lienzo.dibujo, x, 0);
  });

  return lienzoFinal;
}

// Usada por js/personalizar.js al agregar al carrito: solo adjunta la imagen
// si la clienta realmente dibujó algo (si no, se usa la foto de referencia).
function obtenerImagenTablero() {
  if (!bloomTableroDibujoHecho) return null;
  const lienzo = generarImagenComposite();
  return lienzo ? lienzo.toDataURL("image/png") : null;
}

function descargarImagenTablero(formato) {
  if (!bloomTableroDibujoHecho) {
    if (typeof bloomMostrarToast === "function") bloomMostrarToast("Primero dibuja algo en el tablero ✏️");
    return;
  }
  const lienzo = generarImagenComposite();
  if (!lienzo) return;

  const esJpg = formato === "jpg";
  const dataUrl = esJpg ? lienzo.toDataURL("image/jpeg", 0.92) : lienzo.toDataURL("image/png");

  const enlace = document.createElement("a");
  enlace.href = dataUrl;
  enlace.download = `mi-diseno-bloom.${esJpg ? "jpg" : "png"}`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
}
