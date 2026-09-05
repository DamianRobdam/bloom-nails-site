/* =========================================================
   BLOOM · Lógica de la página del carrito (carrito.html)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  renderizarCarrito();

  document.getElementById("btn-vaciar-carrito")?.addEventListener("click", () => {
    if (!confirm("¿Vaciar todo el carrito?")) return;
    bloomVaciarCarrito();
    renderizarCarrito();
  });

  document.querySelectorAll('input[name="envio"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      pintarSeleccionEnvio();
      actualizarTotales();
    });
  });

  document.getElementById("btn-copiar-nequi")?.addEventListener("click", copiarNumeroNequi);
  document.getElementById("btn-confirmar-pedido")?.addEventListener("click", confirmarPedido);

  pintarSeleccionEnvio();
});

function renderizarCarrito() {
  const carrito = bloomObtenerCarrito();
  const contenedor = document.getElementById("carrito-items-lista");
  const vacioBloque = document.getElementById("carrito-vacio");
  const resumenBloque = document.getElementById("carrito-resumen-panel");

  const btnVaciar = document.getElementById("btn-vaciar-carrito");

  if (!carrito.length) {
    contenedor.innerHTML = "";
    vacioBloque.style.display = "block";
    resumenBloque.style.display = "none";
    if (btnVaciar) btnVaciar.style.display = "none";
    return;
  }

  vacioBloque.style.display = "none";
  resumenBloque.style.display = "block";
  if (btnVaciar) btnVaciar.style.display = "inline-flex";

  contenedor.innerHTML = carrito
    .map((linea) => {
      const imagenSrc = linea.imagen || "assets/img/producto-1.svg";
      const detalleHtml = linea.detalle
        ? `<p class="carrito-item-detalle">${linea.detalle.join(" · ")}</p>`
        : "";
      return `
      <div class="carrito-item" data-line-id="${linea.lineId}">
        <div class="carrito-item-imagen"><img src="${imagenSrc}" alt="${linea.nombre}"></div>
        <div class="carrito-item-info">
          <span class="carrito-item-tipo">${linea.tipo === "personalizado" ? "Diseño personalizado" : "Catálogo"}</span>
          <h4>${linea.nombre}</h4>
          ${detalleHtml}
        </div>
        <div class="carrito-item-acciones">
          <span class="carrito-item-precio">${bloomFormatoPrecio(linea.precio * linea.cantidad)}</span>
          <div class="cantidad-stepper">
            <button type="button" class="btn-restar" data-line-id="${linea.lineId}">−</button>
            <span>${linea.cantidad}</span>
            <button type="button" class="btn-sumar" data-line-id="${linea.lineId}">+</button>
          </div>
          <button type="button" class="quitar-item-btn" data-line-id="${linea.lineId}">Quitar</button>
        </div>
      </div>
    `;
    })
    .join("");

  contenedor.querySelectorAll(".btn-restar").forEach((btn) =>
    btn.addEventListener("click", () => {
      bloomCambiarCantidad(btn.dataset.lineId, -1);
      renderizarCarrito();
      actualizarTotales();
    })
  );
  contenedor.querySelectorAll(".btn-sumar").forEach((btn) =>
    btn.addEventListener("click", () => {
      bloomCambiarCantidad(btn.dataset.lineId, 1);
      renderizarCarrito();
      actualizarTotales();
    })
  );
  contenedor.querySelectorAll(".quitar-item-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      bloomQuitarLinea(btn.dataset.lineId);
      renderizarCarrito();
      actualizarTotales();
    })
  );

  actualizarTotales();
}

function envioSeleccionado() {
  const radio = document.querySelector('input[name="envio"]:checked');
  return radio ? radio.value : "bogota";
}

function pintarSeleccionEnvio() {
  document.querySelectorAll(".envio-opcion").forEach((op) => {
    const radio = op.querySelector('input[name="envio"]');
    op.classList.toggle("seleccionada", radio.checked);
  });
  const campoCiudad = document.getElementById("campo-ciudad-envio");
  if (campoCiudad) {
    campoCiudad.style.display = envioSeleccionado() === "nacional" ? "block" : "none";
  }
}

function actualizarTotales() {
  const subtotal = bloomSubtotalCarrito();
  const envio = envioSeleccionado();
  const descuento = bloomValorDescuento(subtotal);
  const subtotalConDescuento = subtotal - descuento;

  document.getElementById("carrito-subtotal").textContent = bloomFormatoPrecio(subtotal);

  const filaDescuento = document.getElementById("fila-descuento");
  const descuentoValor = document.getElementById("carrito-descuento-valor");
  if (descuento > 0) {
    if (filaDescuento) filaDescuento.style.display = "flex";
    if (descuentoValor) descuentoValor.textContent = "-" + bloomFormatoPrecio(descuento);
  } else if (filaDescuento) {
    filaDescuento.style.display = "none";
  }

  const filaEnvio = document.getElementById("carrito-envio-texto");
  const totalValor = document.getElementById("carrito-total-valor");
  const notaEnvio = document.getElementById("nota-envio-nacional");

  if (envio === "bogota") {
    filaEnvio.textContent = "Gratis";
    totalValor.textContent = bloomFormatoPrecio(subtotalConDescuento);
    if (notaEnvio) notaEnvio.style.display = "none";
  } else {
    filaEnvio.textContent = "Se confirma por WhatsApp";
    totalValor.textContent = bloomFormatoPrecio(subtotalConDescuento) + " + envío";
    if (notaEnvio) notaEnvio.style.display = "block";
  }

  actualizarMensajeDescuento(subtotal, descuento);
}

function actualizarMensajeDescuento(subtotal, descuento) {
  const mensaje = document.getElementById("mensaje-descuento");
  if (!mensaje) return;
  const minimo = window.BLOOM_DESCUENTO_MONTO_MINIMO || 100000;
  const porcentaje = window.BLOOM_DESCUENTO_PORCENTAJE || 10;

  if (descuento > 0) {
    mensaje.className = "mensaje-descuento aplicado";
    mensaje.textContent = `🎁 ¡Descuento del ${porcentaje}% aplicado por tu compra! Ahorraste ${bloomFormatoPrecio(descuento)}.`;
    mensaje.style.display = "block";
  } else if (subtotal > 0) {
    const faltante = minimo - subtotal;
    mensaje.className = "mensaje-descuento falta";
    mensaje.textContent = `🛍️ Agrega ${bloomFormatoPrecio(faltante)} más y obtén ${porcentaje}% de descuento automático.`;
    mensaje.style.display = "block";
  } else {
    mensaje.style.display = "none";
  }
}

function copiarNumeroNequi() {
  const numero = window.BLOOM_NEQUI_NUMERO || "573223291635";
  const numeroLocal = numero.replace(/^57/, "");
  const boton = document.getElementById("btn-copiar-nequi");
  navigator.clipboard
    .writeText(numeroLocal)
    .then(() => {
      const textoOriginal = boton.textContent;
      boton.textContent = "¡Copiado! ✓";
      setTimeout(() => (boton.textContent = textoOriginal), 2000);
    })
    .catch(() => bloomMostrarToast("No se pudo copiar. El número es: " + numeroLocal));
}

function base64AArchivo(base64, nombreArchivo) {
  const partes = base64.split(",");
  const mime = partes[0].match(/:(.*?);/)[1];
  const binario = atob(partes[1]);
  const arreglo = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) arreglo[i] = binario.charCodeAt(i);
  return new File([arreglo], nombreArchivo, { type: mime });
}

async function confirmarPedido() {
  const carrito = bloomObtenerCarrito();
  if (!carrito.length) {
    bloomMostrarToast("Tu carrito está vacío.");
    return;
  }

  const envio = envioSeleccionado();
  const ciudadInput = document.getElementById("campo-ciudad-texto");
  const ciudad = ciudadInput ? ciudadInput.value.trim() : "";

  if (envio === "nacional" && !ciudad) {
    bloomMostrarToast("Cuéntanos a qué ciudad enviamos tu pedido.");
    ciudadInput?.focus();
    return;
  }

  const subtotal = bloomSubtotalCarrito();
  const descuento = bloomValorDescuento(subtotal);
  const subtotalConDescuento = subtotal - descuento;
  const numero = window.BLOOM_WHATSAPP_NUMERO || "573223291635";

  let texto = `¡Hola Bloom! ✨ Quiero confirmar mi pedido:\n\n`;
  carrito.forEach((linea, i) => {
    texto += `${i + 1}. ${linea.nombre} x${linea.cantidad} — ${bloomFormatoPrecio(linea.precio * linea.cantidad)}\n`;
    if (linea.detalle) texto += `   (${linea.detalle.join(", ")})\n`;
  });

  texto += `\n💰 Subtotal: ${bloomFormatoPrecio(subtotal)}`;
  if (descuento > 0) {
    texto += `\n🎁 Descuento ${window.BLOOM_DESCUENTO_PORCENTAJE || 10}%: -${bloomFormatoPrecio(descuento)}`;
  }

  if (envio === "bogota") {
    texto += `\n🚚 Envío: Gratis (Bogotá)`;
    texto += `\n*Total: ${bloomFormatoPrecio(subtotalConDescuento)}*`;
  } else {
    texto += `\n🚚 Envío nacional a *${ciudad}*: a confirmar según la transportadora`;
    texto += `\n*Total (sin envío): ${bloomFormatoPrecio(subtotalConDescuento)}* + costo de envío a confirmar`;
  }

  const numeroNequi = (window.BLOOM_NEQUI_NUMERO || "573223291635").replace(/^57/, "");
  texto += `\n\n💳 Pago por Nequi al ${numeroNequi}. Te confirmamos el total y te comparto el paso a paso para enviar el comprobante.`;

  // Solo cuentan las imágenes de referencia que la clienta subió en el
  // personalizador (son data URIs) — no las fotos de los productos del catálogo.
  const imagenesLineas = carrito.filter((l) => l.tipo === "personalizado" && l.imagen && l.imagen.startsWith("data:"));
  if (imagenesLineas.length) {
    texto += `\n\n📎 Adjunto imagen(es) de referencia de mi(s) diseño(s) personalizado(s).`;
  }

  const urlWhatsapp = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

  if (imagenesLineas.length) {
    try {
      const archivos = imagenesLineas.map((l, i) => base64AArchivo(l.imagen, `referencia-${i + 1}.jpg`));
      if (navigator.canShare && navigator.canShare({ files: archivos })) {
        await navigator.share({ text: texto, files: archivos, title: "Pedido Bloom" });
        bloomMostrarToast("¡Listo! Confirma el envío en WhatsApp 💌");
        return;
      }
    } catch (err) {
      /* si cancela o falla, seguimos con el enlace normal */
    }
  }

  window.open(urlWhatsapp, "_blank");
  if (imagenesLineas.length) {
    bloomMostrarToast("Se abrió WhatsApp — no olvides adjuntar también tu(s) imagen(es) de referencia 📎");
  } else {
    bloomMostrarToast("Te llevamos a WhatsApp para confirmar tu pedido 💌");
  }
}
