/* =========================================================
   BLOOM · Catálogo de productos
   - Intenta cargar productos.json (para que se vea igual para
     todas las visitantes una vez publicado el sitio).
   - Si no existe o falla (por ejemplo abriendo el archivo sin
     servidor), usa lo guardado en este navegador (localStorage,
     lo que agregues desde el panel de administración).
   - Si tampoco hay nada, usa un catálogo de ejemplo (DEFAULT).
   ========================================================= */

const BLOOM_STORAGE_KEY = "bloom_productos";

// Elementos de "qué incluye" reutilizables para el catálogo de ejemplo
const BLOOM_INCLUYE_SET_BASICO = [
  { nombre: "24 uñas press on", imagen: "assets/img/incluye-lima.svg" },
];

// 👉 Kit de aplicación como opción adicional (add-on) al comprar un set de uñas
window.BLOOM_KIT_APLICACION_PRECIO = 5000;
const BLOOM_KIT_APLICACION_ADDON = {
  id: "addon-kit-aplicacion",
  nombre: "Kit de aplicación",
  imagen: "assets/img/incluye-toallitas-alcohol.svg",
};

const BLOOM_DEFAULT_PRODUCTS = [
  {
    id: "demo-1",
    nombre: "Ombré Rosa Dream",
    categoria: "Ombré",
    precio: 45000,
    descripcion: "Degradado rosa suave, acabado brillante, forma almendra.",
    imagen: "assets/img/producto-1.svg",
    incluye: BLOOM_INCLUYE_SET_BASICO,
  },
  {
    id: "demo-2",
    nombre: "Beige Nude Chic",
    categoria: "Nude",
    precio: 42000,
    descripcion: "Beige elegante con borde dorado, ideal para toda ocasión.",
    imagen: "assets/img/producto-2.svg",
    incluye: BLOOM_INCLUYE_SET_BASICO,
  },
  {
    id: "demo-3",
    nombre: "Glitter Rosa Fiesta",
    categoria: "Glitter",
    precio: 48000,
    descripcion: "Full glitter rosa, brillo intenso para looks de fiesta.",
    imagen: "assets/img/producto-3.svg",
    incluye: BLOOM_INCLUYE_SET_BASICO,
  },
  {
    id: "demo-4",
    nombre: "Francesa Moderna",
    categoria: "Francesa",
    precio: 40000,
    descripcion: "Francesa reinventada con línea rose gold.",
    imagen: "assets/img/producto-4.svg",
    incluye: BLOOM_INCLUYE_SET_BASICO,
  },
  {
    id: "demo-5",
    nombre: "Rosa Pastel Mate",
    categoria: "Mate",
    precio: 43000,
    descripcion: "Acabado mate aterciopelado en rosa pastel.",
    imagen: "assets/img/producto-5.svg",
    incluye: BLOOM_INCLUYE_SET_BASICO,
  },
  {
    id: "demo-6",
    nombre: "Beige Marmoleado",
    categoria: "Nude",
    precio: 46000,
    descripcion: "Efecto mármol en tonos beige y arena.",
    imagen: "assets/img/producto-6.svg",
    incluye: BLOOM_INCLUYE_SET_BASICO,
  },
  {
    id: "demo-7",
    nombre: "Kit de aplicación Bloom",
    categoria: "Kit",
    precio: 18000,
    descripcion: "Todo lo necesario para preparar tu uña natural y lograr una aplicación perfecta en casa.",
    imagen: "assets/img/incluye-toallitas-alcohol.svg",
    incluye: [
      { nombre: "Toallitas de alcohol", imagen: "assets/img/incluye-toallitas-alcohol.svg" },
      { nombre: "Palito de naranjo", imagen: "assets/img/incluye-palito-naranjo.svg" },
      { nombre: "Lima de uñas", imagen: "assets/img/incluye-lima.svg" },
      { nombre: "Buffer pulidor", imagen: "assets/img/incluye-buffer.svg" },
      { nombre: "Adhesivo doble contacto extra", imagen: "assets/img/incluye-adhesivo.svg" },
    ],
  },
];

function bloomLeerLocalStorage() {
  try {
    const data = localStorage.getItem(BLOOM_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

async function bloomCargarProductos() {
  // 1) intenta productos.json (ideal una vez publicado el sitio)
  try {
    const resp = await fetch("productos.json", { cache: "no-store" });
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data) && data.length) return data;
    }
  } catch (e) {
    /* sigue con el siguiente intento */
  }

  // 2) intenta lo guardado en este navegador (panel de admin)
  const local = bloomLeerLocalStorage();
  if (Array.isArray(local) && local.length) return local;

  // 3) catálogo de ejemplo
  return BLOOM_DEFAULT_PRODUCTS;
}

function bloomFormatoPrecio(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

function bloomMensajeWhatsapp(producto) {
  const numero = window.BLOOM_WHATSAPP_NUMERO || "573223291635";
  const texto = `¡Hola Bloom! ✨ Me interesa el diseño *${producto.nombre}* (${bloomFormatoPrecio(producto.precio)}). ¿Me cuentas cómo hacer el pedido?`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

function bloomCrearTarjetaProducto(producto) {
  const card = document.createElement("article");
  card.className = "producto-card reveal";
  card.dataset.categoria = producto.categoria || "Otros";

  const tieneIncluye = Array.isArray(producto.incluye) && producto.incluye.length > 0;

  card.innerHTML = `
    <div class="producto-imagen producto-imagen-clic" tabindex="0" role="button" aria-label="Ver detalle de ${producto.nombre}">
      <span class="producto-categoria-tag">${producto.categoria || "Bloom"}</span>
      <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
      <span class="producto-lupa">🔍 Ver detalle</span>
    </div>
    <div class="producto-info">
      <h3>${producto.nombre}</h3>
      <p class="producto-descripcion">${producto.descripcion || ""}</p>
      ${tieneIncluye ? `<button type="button" class="producto-ver-incluye-btn">🎁 Ver qué incluye</button>` : ""}
      <div class="producto-precio-fila">
        <span class="producto-precio">${bloomFormatoPrecio(producto.precio)}</span>
        <button type="button" class="producto-pedido-btn agregar-carrito-btn" data-id="${producto.id}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M1 1h4l2.6 13.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L23 6H6"/></svg>
          Agregar
        </button>
      </div>
      <p class="producto-en-carrito" id="en-carrito-${producto.id}">
        🛒 Ya llevas <strong>0</strong> en tu carrito
      </p>
    </div>
  `;

  card.querySelector(".agregar-carrito-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    if (typeof bloomAgregarAlCarrito !== "function") return;
    bloomAgregarAlCarrito({
      tipo: "catalogo",
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: 1,
    });
    if (window.bloomMostrarToast) bloomMostrarToast(`"${producto.nombre}" se agregó al carrito 🛍️`);
    bloomSincronizarCantidadesCatalogo();
  });

  const abrirDetalle = () => bloomAbrirDetalleProducto(producto);
  const zonaImagen = card.querySelector(".producto-imagen-clic");
  zonaImagen.addEventListener("click", abrirDetalle);
  zonaImagen.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrirDetalle();
    }
  });
  card.querySelector(".producto-ver-incluye-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    abrirDetalle();
  });

  return card;
}

/* ===================== MODAL DE DETALLE DEL PRODUCTO ===================== */

function bloomAbrirDetalleProducto(producto) {
  const overlay = document.getElementById("modal-producto-overlay");
  const contenido = document.getElementById("modal-producto-cuerpo");
  if (!overlay || !contenido) return;

  const tieneIncluye = Array.isArray(producto.incluye) && producto.incluye.length > 0;

  const incluyeHtml = tieneIncluye
    ? `
      <div class="modal-incluye-bloque">
        <h4>🎁 Qué incluye</h4>
        <div class="incluye-grid">
          ${producto.incluye
            .map(
              (item) => `
            <div class="incluye-item">
              <div class="incluye-item-imagen">
                ${item.imagen ? `<img src="${item.imagen}" alt="${item.nombre}">` : `<span class="incluye-item-sinfoto">🌸</span>`}
              </div>
              <span class="incluye-item-nombre">${item.nombre}</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `
    : "";

  // El kit de aplicación se ofrece como opción adicional para cualquier
  // producto que NO sea el kit mismo (no tendría sentido agregarle el kit al kit).
  const ofreceKitAddon = producto.categoria !== "Kit";
  const kitPrecio = window.BLOOM_KIT_APLICACION_PRECIO || 5000;
  const kitAddonHtml = ofreceKitAddon
    ? `
      <label class="kit-addon-caja">
        <input type="checkbox" id="checkbox-kit-addon">
        <span class="kit-addon-imagen"><img src="${BLOOM_KIT_APLICACION_ADDON.imagen}" alt="Kit de aplicación"></span>
        <span class="kit-addon-texto">
          <strong>¿Agregar el kit de aplicación?</strong>
          <span>Toallitas de alcohol, palito de naranjo, lima, buffer y adhesivo extra — ${bloomFormatoPrecio(kitPrecio)} adicional.</span>
        </span>
      </label>
    `
    : "";

  contenido.innerHTML = `
    <div class="modal-producto-imagen">
      <img src="${producto.imagen}" alt="${producto.nombre}">
    </div>
    <div class="modal-producto-info">
      <span class="producto-categoria-tag">${producto.categoria || "Bloom"}</span>
      <h3>${producto.nombre}</h3>
      <p class="modal-producto-descripcion">${producto.descripcion || ""}</p>
      ${incluyeHtml}
      ${kitAddonHtml}
      <div class="modal-producto-precio-fila">
        <span class="producto-precio" id="modal-precio-total">${bloomFormatoPrecio(producto.precio)}</span>
        <button type="button" class="btn btn-primario agregar-carrito-btn" data-id="${producto.id}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M1 1h4l2.6 13.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L23 6H6"/></svg>
          Agregar al carrito
        </button>
      </div>
      <p class="producto-en-carrito modal-en-carrito" id="en-carrito-modal-${producto.id}">
        🛒 Ya llevas <strong>0</strong> en tu carrito
      </p>
    </div>
  `;

  const checkboxKit = document.getElementById("checkbox-kit-addon");
  const precioTotalEl = document.getElementById("modal-precio-total");
  checkboxKit?.addEventListener("change", () => {
    const total = producto.precio + (checkboxKit.checked ? kitPrecio : 0);
    precioTotalEl.textContent = bloomFormatoPrecio(total);
  });

  contenido.querySelector(".agregar-carrito-btn").addEventListener("click", () => {
    if (typeof bloomAgregarAlCarrito !== "function") return;
    bloomAgregarAlCarrito({
      tipo: "catalogo",
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: 1,
    });
    if (checkboxKit?.checked) {
      bloomAgregarAlCarrito({
        tipo: "catalogo",
        id: BLOOM_KIT_APLICACION_ADDON.id,
        nombre: BLOOM_KIT_APLICACION_ADDON.nombre,
        precio: kitPrecio,
        imagen: BLOOM_KIT_APLICACION_ADDON.imagen,
        cantidad: 1,
      });
    }
    if (window.bloomMostrarToast) {
      bloomMostrarToast(
        checkboxKit?.checked
          ? `"${producto.nombre}" + kit de aplicación se agregaron al carrito 🛍️`
          : `"${producto.nombre}" se agregó al carrito 🛍️`
      );
    }
    bloomSincronizarCantidadesCatalogo();
    bloomSincronizarCantidadModal(producto.id);
  });

  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";
  bloomSincronizarCantidadModal(producto.id);
}

function bloomSincronizarCantidadModal(id) {
  if (typeof bloomObtenerCarrito !== "function") return;
  const carrito = bloomObtenerCarrito();
  const linea = carrito.find((l) => l.tipo === "catalogo" && l.id === id);
  const cantidad = linea ? linea.cantidad : 0;
  const badge = document.getElementById(`en-carrito-modal-${id}`);
  if (!badge) return;
  badge.querySelector("strong").textContent = cantidad;
  badge.classList.toggle("visible", cantidad > 0);
}

function bloomCerrarDetalleProducto() {
  const overlay = document.getElementById("modal-producto-overlay");
  if (!overlay) return;
  overlay.style.display = "none";
  document.body.style.overflow = "";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("modal-producto-cerrar")?.addEventListener("click", bloomCerrarDetalleProducto);
  document.getElementById("modal-producto-overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "modal-producto-overlay") bloomCerrarDetalleProducto();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") bloomCerrarDetalleProducto();
  });
});

// Refleja en cada tarjeta cuántas unidades de ESE producto hay ya en el carrito
function bloomSincronizarCantidadesCatalogo() {
  if (typeof bloomObtenerCarrito !== "function") return;
  const carrito = bloomObtenerCarrito();

  document.querySelectorAll(".agregar-carrito-btn").forEach((btn) => {
    const id = btn.dataset.id;
    const linea = carrito.find((l) => l.tipo === "catalogo" && l.id === id);
    const cantidad = linea ? linea.cantidad : 0;
    const badge = document.getElementById(`en-carrito-${id}`);
    if (!badge) return;
    badge.querySelector("strong").textContent = cantidad;
    badge.classList.toggle("visible", cantidad > 0);
  });
}

async function bloomRenderizarCatalogo() {
  const contenedor = document.getElementById("catalogo-grid");
  if (!contenedor) return;

  const productos = await bloomCargarProductos();
  window.BLOOM_PRODUCTOS_ACTUALES = productos;

  contenedor.innerHTML = "";
  if (!productos.length) {
    contenedor.innerHTML = `<p class="catalogo-vacio">Pronto verás aquí nuestros diseños ✨</p>`;
    return;
  }

  productos.forEach((p) => contenedor.appendChild(bloomCrearTarjetaProducto(p)));

  // construir filtros dinámicos según categorías presentes
  const filtrosContenedor = document.getElementById("filtros-catalogo");
  if (filtrosContenedor) {
    const categorias = ["Todos", ...new Set(productos.map((p) => p.categoria || "Otros"))];
    filtrosContenedor.innerHTML = categorias
      .map(
        (cat, i) =>
          `<button class="filtro-btn ${i === 0 ? "activo" : ""}" data-filtro="${cat}">${cat}</button>`
      )
      .join("");

    filtrosContenedor.querySelectorAll(".filtro-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        filtrosContenedor.querySelectorAll(".filtro-btn").forEach((b) => b.classList.remove("activo"));
        btn.classList.add("activo");
        const filtro = btn.dataset.filtro;
        contenedor.querySelectorAll(".producto-card").forEach((card) => {
          const mostrar = filtro === "Todos" || card.dataset.categoria === filtro;
          card.style.display = mostrar ? "" : "none";
        });
      });
    });
  }

  // activar animación de aparición para las tarjetas recién creadas
  if (window.bloomObservarReveal) window.bloomObservarReveal();
  bloomSincronizarCantidadesCatalogo();
}

document.addEventListener("DOMContentLoaded", bloomRenderizarCatalogo);
