/* =========================================================
   BLOOM · Lógica del personalizador de diseño
   - Pinta las categorías/opciones desde PERSONALIZAR_CONFIG
   - Calcula el total en vivo (base + extras elegidos)
   - Permite subir una imagen de referencia del diseño deseado
   - Al pedir por WhatsApp: si el celular lo permite, comparte el
     mensaje Y la imagen juntos (Web Share API); si no, abre
     WhatsApp con el mensaje y le recuerda adjuntar la imagen.
   ========================================================= */

const seleccion = {}; // { categoriaId: [opcionId, opcionId, ...] }
let imagenReferenciaArchivo = null; // File original (para compartir/adjuntar)
let imagenReferenciaBase64 = null; // para previsualizar

document.addEventListener("DOMContentLoaded", () => {
  PERSONALIZAR_CONFIG.categorias.forEach((cat) => {
    seleccion[cat.id] = [];
  });
  // La forma parte con una opción elegida por defecto, así el tablero de dibujo
  // (si la clienta decide abrirlo) ya tiene una silueta lista para mostrar.
  const formaCategoria = PERSONALIZAR_CONFIG.categorias.find((c) => c.id === "forma");
  if (formaCategoria && formaCategoria.opciones[0]) {
    seleccion.forma = [formaCategoria.opciones[0].id];
  }

  renderizarCategorias();
  actualizarResumen();

  document.getElementById("campo-imagen-referencia")?.addEventListener("change", manejarImagenReferencia);
  document.getElementById("quitar-imagen-btn")?.addEventListener("click", quitarImagenReferencia);
  document.getElementById("btn-pedir-personalizado")?.addEventListener("click", agregarPersonalizadoAlCarrito);

  if (window.bloomObservarReveal) window.bloomObservarReveal();
});

function renderizarCategorias() {
  const contenedor = document.getElementById("categorias-personalizador");
  if (!contenedor) return;

  contenedor.innerHTML = PERSONALIZAR_CONFIG.categorias
    .map(
      (cat) => `
    <div class="categoria-bloque reveal">
      <div class="categoria-encabezado">
        <h3 class="categoria-titulo">${cat.nombre}</h3>
        <span class="categoria-tipo-tag">${cat.tipo === "multiple" ? "Varias opciones" : "Elige una"}</span>
      </div>
      <p class="categoria-ayuda">${cat.ayuda || ""}</p>
      <div class="opciones-grid" data-categoria="${cat.id}">
        ${cat.opciones
          .map(
            (op) => `
          <button type="button" class="opcion-card" data-categoria="${cat.id}" data-opcion="${op.id}">
            <span class="opcion-marca">✓</span>
            <div class="opcion-nombre">${op.nombre}</div>
            <div class="opcion-costo ${op.costo === 0 ? "gratis" : ""}">
              ${op.costo === 0 ? "Sin costo extra" : "+ " + bloomFormatoPrecio(op.costo)}
            </div>
          </button>
        `
          )
          .join("")}
      </div>
    </div>
  `
    )
    .join("");

  contenedor.querySelectorAll(".opcion-card").forEach((card) => {
    card.addEventListener("click", () => {
      const catId = card.dataset.categoria;
      const opId = card.dataset.opcion;
      const categoria = PERSONALIZAR_CONFIG.categorias.find((c) => c.id === catId);

      if (categoria.tipo === "unica") {
        seleccion[catId] = [opId];
      } else {
        const idx = seleccion[catId].indexOf(opId);
        if (idx > -1) seleccion[catId].splice(idx, 1);
        else seleccion[catId].push(opId);
      }
      pintarSeleccionVisual();
      actualizarResumen();

      // Si cambió la forma y el tablero de dibujo ya está abierto, actualízalo también
      if (catId === "forma" && typeof window.bloomActualizarFormaTablero === "function") {
        window.bloomActualizarFormaTablero(opId);
      }
    });
  });

  pintarSeleccionVisual();
}

function pintarSeleccionVisual() {
  document.querySelectorAll(".opcion-card").forEach((card) => {
    const catId = card.dataset.categoria;
    const opId = card.dataset.opcion;
    card.classList.toggle("seleccionada", seleccion[catId]?.includes(opId));
  });
}

function obtenerOpcionesElegidas() {
  const elegidas = [];
  PERSONALIZAR_CONFIG.categorias.forEach((cat) => {
    seleccion[cat.id].forEach((opId) => {
      const op = cat.opciones.find((o) => o.id === opId);
      if (op) elegidas.push({ categoria: cat.nombre, ...op });
    });
  });
  return elegidas;
}

function calcularTotal() {
  const extras = obtenerOpcionesElegidas().reduce((suma, op) => suma + op.costo, 0);
  return PERSONALIZAR_CONFIG.precioBase + extras;
}

function actualizarResumen() {
  const lista = document.getElementById("resumen-lista");
  const totalEl = document.getElementById("resumen-total-valor");
  if (!lista || !totalEl) return;

  const elegidas = obtenerOpcionesElegidas();

  let filas = `
    <div class="resumen-item">
      <strong>Set base personalizado</strong>
      <span class="valor">${bloomFormatoPrecio(PERSONALIZAR_CONFIG.precioBase)}</span>
    </div>
  `;

  if (elegidas.length) {
    filas += elegidas
      .map(
        (op) => `
      <div class="resumen-item">
        <strong>${op.nombre}</strong>
        <span class="valor">${op.costo === 0 ? "Incluido" : "+ " + bloomFormatoPrecio(op.costo)}</span>
      </div>
    `
      )
      .join("");
  } else {
    filas += `<p class="resumen-vacio">Aún no eliges extras — solo el precio base.</p>`;
  }

  lista.innerHTML = filas;
  totalEl.textContent = bloomFormatoPrecio(calcularTotal());
}

// ---------------- IMAGEN DE REFERENCIA ----------------
function manejarImagenReferencia(e) {
  const archivo = e.target.files[0];
  if (!archivo) return;
  imagenReferenciaArchivo = archivo;

  const lector = new FileReader();
  lector.onload = (evento) => {
    imagenReferenciaBase64 = evento.target.result;
    const caja = document.getElementById("caja-imagen-referencia");
    caja.classList.add("tiene-imagen");
    document.getElementById("preview-imagen-referencia").innerHTML = `
      <div class="imagen-referencia-preview"><img src="${imagenReferenciaBase64}" alt="Imagen de referencia"></div>
      <button type="button" class="quitar-imagen-btn" id="quitar-imagen-btn">Quitar imagen</button>
    `;
    document.getElementById("quitar-imagen-btn").addEventListener("click", quitarImagenReferencia);
    document.getElementById("resumen-imagen-chip").style.display = "flex";
  };
  lector.readAsDataURL(archivo);
}

function quitarImagenReferencia() {
  imagenReferenciaArchivo = null;
  imagenReferenciaBase64 = null;
  document.getElementById("campo-imagen-referencia").value = "";
  document.getElementById("caja-imagen-referencia").classList.remove("tiene-imagen");
  document.getElementById("preview-imagen-referencia").innerHTML = "";
  const chip = document.getElementById("resumen-imagen-chip");
  if (chip) chip.style.display = "none";
}

// ---------------- AGREGAR AL CARRITO ----------------
function agregarPersonalizadoAlCarrito() {
  const elegidas = obtenerOpcionesElegidas();
  const total = calcularTotal();

  const detalle = [`Set base: ${bloomFormatoPrecio(PERSONALIZAR_CONFIG.precioBase)}`];
  elegidas.forEach((op) => {
    detalle.push(
      `${op.categoria.replace(/^\d+\.\s*/, "")}: ${op.nombre}${op.costo ? " (+ " + bloomFormatoPrecio(op.costo) + ")" : ""}`
    );
  });

  if (typeof bloomAgregarAlCarrito !== "function") return;

  // Si dibujó en el tablero, esa imagen es el diseño; si no, usa la foto de referencia
  const imagenTablero = typeof obtenerImagenTablero === "function" ? obtenerImagenTablero() : null;
  const imagenFinal = imagenTablero || imagenReferenciaBase64 || null;
  if (imagenTablero) detalle.push("Incluye dibujo hecho en el tablero de diseño");

  bloomAgregarAlCarrito({
    tipo: "personalizado",
    nombre: "Diseño personalizado",
    precio: total,
    cantidad: 1,
    imagen: imagenFinal,
    detalle,
  });

  bloomMostrarToast("¡Tu diseño se agregó al carrito! 🛍️ Ve al carrito para confirmarlo.");

  // limpiar selección para poder armar otro diseño distinto
  PERSONALIZAR_CONFIG.categorias.forEach((cat) => (seleccion[cat.id] = []));
  const formaCategoria = PERSONALIZAR_CONFIG.categorias.find((c) => c.id === "forma");
  if (formaCategoria && formaCategoria.opciones[0]) seleccion.forma = [formaCategoria.opciones[0].id];
  pintarSeleccionVisual();
  actualizarResumen();
  quitarImagenReferencia();
  if (typeof limpiarTodoElTablero === "function") limpiarTodoElTablero();
}
