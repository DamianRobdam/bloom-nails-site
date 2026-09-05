/* =========================================================
   BLOOM · Carrito de compras
   -----------------------------------------------------------
   - Se guarda en el navegador (localStorage), como el resto del
     sitio (no hay servidor/base de datos).
   - Funciona para productos del catálogo Y para diseños del
     personalizador.
   - El sitio NO tiene pasarela de pagos: el pago se hace por
     Nequi (número más abajo) y el pedido se confirma por
     WhatsApp con el resumen completo (productos + envío).
   ========================================================= */

const CARRITO_KEY = "bloom_carrito";

// 👉 Número de Nequi donde recibes los pagos (con indicativo, sin espacios)
window.BLOOM_NEQUI_NUMERO = "573223291635";

// 👉 Promoción automática: % de descuento para compras desde este monto (COP)
window.BLOOM_DESCUENTO_MONTO_MINIMO = 100000;
window.BLOOM_DESCUENTO_PORCENTAJE = 10;

function bloomAplicaDescuento(subtotal) {
  return subtotal >= (window.BLOOM_DESCUENTO_MONTO_MINIMO || 0);
}

// Valor del descuento en pesos (0 si el subtotal no alcanza el mínimo)
function bloomValorDescuento(subtotal) {
  if (!bloomAplicaDescuento(subtotal)) return 0;
  return Math.round(subtotal * ((window.BLOOM_DESCUENTO_PORCENTAJE || 0) / 100));
}

function bloomObtenerCarrito() {
  try {
    const data = localStorage.getItem(CARRITO_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function bloomGuardarCarrito(items) {
  try {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(items));
  } catch (e) {
    /* si falla (ej. imágenes muy pesadas), seguimos sin bloquear la compra */
  }
  bloomActualizarBadgeCarrito();
}

// item: { lineId?, tipo: 'catalogo'|'personalizado', id?, nombre, precio, cantidad, imagen, detalle? }
function bloomAgregarAlCarrito(item) {
  const carrito = bloomObtenerCarrito();

  if (item.tipo === "catalogo") {
    const existente = carrito.find((l) => l.tipo === "catalogo" && l.id === item.id);
    if (existente) {
      existente.cantidad += item.cantidad || 1;
      bloomGuardarCarrito(carrito);
      return;
    }
  }

  carrito.push({
    lineId: "linea-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    cantidad: 1,
    ...item,
  });
  bloomGuardarCarrito(carrito);
}

function bloomCambiarCantidad(lineId, delta) {
  const carrito = bloomObtenerCarrito();
  const linea = carrito.find((l) => l.lineId === lineId);
  if (!linea) return;
  linea.cantidad += delta;
  const nuevo = linea.cantidad > 0 ? carrito : carrito.filter((l) => l.lineId !== lineId);
  if (linea.cantidad <= 0) {
    bloomGuardarCarrito(carrito.filter((l) => l.lineId !== lineId));
  } else {
    bloomGuardarCarrito(carrito);
  }
}

function bloomQuitarLinea(lineId) {
  const carrito = bloomObtenerCarrito().filter((l) => l.lineId !== lineId);
  bloomGuardarCarrito(carrito);
}

function bloomVaciarCarrito() {
  bloomGuardarCarrito([]);
}

function bloomSubtotalCarrito() {
  return bloomObtenerCarrito().reduce((suma, l) => suma + l.precio * l.cantidad, 0);
}

function bloomCantidadTotalCarrito() {
  return bloomObtenerCarrito().reduce((suma, l) => suma + l.cantidad, 0);
}

function bloomActualizarBadgeCarrito() {
  const total = bloomCantidadTotalCarrito();
  document.querySelectorAll(".carrito-badge").forEach((badge) => {
    badge.textContent = total;
    badge.style.display = total > 0 ? "flex" : "none";
  });
}

// Rellena el texto de la promo (monto mínimo y %) en cualquier página que
// tenga el banner, para que si cambias las constantes de arriba, el texto
// se actualice solo en todo el sitio.
function bloomPintarPromoBanner() {
  if (typeof bloomFormatoPrecio !== "function") return;
  const minimo = window.BLOOM_DESCUENTO_MONTO_MINIMO || 100000;
  const porcentaje = window.BLOOM_DESCUENTO_PORCENTAJE || 10;
  document.querySelectorAll("#promo-monto-minimo").forEach((el) => (el.textContent = bloomFormatoPrecio(minimo)));
  document.querySelectorAll("#promo-porcentaje, #fila-descuento-porcentaje").forEach((el) => (el.textContent = porcentaje + "%"));
}

document.addEventListener("DOMContentLoaded", () => {
  bloomActualizarBadgeCarrito();
  bloomPintarPromoBanner();
});
