/* =========================================================
   BLOOM · Clientes y fidelización (solo panel de administración)
   -----------------------------------------------------------
   Por qué es manual: el sitio no tiene pasarela de pagos ni login
   de clientas, así que no hay forma automática y confiable de saber
   si un "pedido" realmente se pagó. Por eso este registro lo llena
   quien administra el negocio, y SOLO después de confirmar que el
   pago por Nequi llegó de verdad. Así el control de compras es real
   y nadie puede inflarlo desde su navegador.

   Cada clienta guarda un HISTORIAL de compras (fecha, monto, nota),
   no solo un número — así queda un registro completo, no solo un
   contador. El número de WhatsApp es el identificador único.
   ========================================================= */

// 👉 Ajusta aquí la regla de fidelidad
const FIDELIDAD_UMBRAL = 3; // a partir de qué compra aplica el descuento
const FIDELIDAD_DESCUENTO_PORCENTAJE = 10; // % de descuento, permanente desde el umbral

const CLIENTES_STORAGE_KEY = "bloom_clientes";

document.addEventListener("DOMContentLoaded", () => {
  const elUmbral = document.getElementById("texto-umbral");
  const elDescuento = document.getElementById("texto-descuento");
  if (elUmbral) elUmbral.textContent = FIDELIDAD_UMBRAL + "ª";
  if (elDescuento) elDescuento.textContent = FIDELIDAD_DESCUENTO_PORCENTAJE + "%";

  document.getElementById("btn-registrar-compra")?.addEventListener("click", registrarCompra);
  document.getElementById("campo-buscar-cliente")?.addEventListener("input", renderizarListaClientes);

  renderizarListaClientes();
});

function normalizarTelefono(valor) {
  const soloDigitos = (valor || "").replace(/\D/g, "");
  if (soloDigitos.length === 10) return "57" + soloDigitos; // celular colombiano sin indicativo
  return soloDigitos;
}

function obtenerClientes() {
  try {
    const data = localStorage.getItem(CLIENTES_STORAGE_KEY);
    const clientes = data ? JSON.parse(data) : [];
    // compatibilidad con registros antiguos que solo tenían "compras" (número)
    clientes.forEach((c) => {
      if (!Array.isArray(c.historial)) {
        c.historial = [];
        for (let i = 0; i < (c.compras || 0); i++) {
          c.historial.push({ fecha: c.ultimaCompra || "", monto: 0, nota: "" });
        }
      }
    });
    return clientes;
  } catch (e) {
    return [];
  }
}

function guardarClientes(clientes) {
  try {
    localStorage.setItem(CLIENTES_STORAGE_KEY, JSON.stringify(clientes));
  } catch (e) {
    bloomAdminToast("No se pudo guardar el registro de clientes.");
  }
}

function registrarCompra() {
  const telefonoInput = document.getElementById("campo-cliente-telefono");
  const nombreInput = document.getElementById("campo-cliente-nombre");
  const montoInput = document.getElementById("campo-cliente-monto");
  const notaInput = document.getElementById("campo-cliente-nota");

  const telefono = normalizarTelefono(telefonoInput.value);
  const nombre = nombreInput.value.trim();
  const monto = parseInt(montoInput.value, 10) || 0;
  const nota = notaInput.value.trim();

  if (telefono.length < 11) {
    bloomAdminToast("Escribe un número de WhatsApp válido (ej: 3001234567).");
    return;
  }

  const clientes = obtenerClientes();
  let cliente = clientes.find((c) => c.telefono === telefono);

  if (!cliente) {
    cliente = { telefono, nombre: "", historial: [] };
    clientes.push(cliente);
  }
  if (nombre) cliente.nombre = nombre;

  cliente.historial.push({
    fecha: new Date().toISOString().slice(0, 10),
    monto,
    nota,
  });

  guardarClientes(clientes);
  telefonoInput.value = "";
  nombreInput.value = "";
  montoInput.value = "";
  notaInput.value = "";
  renderizarListaClientes();

  const totalCompras = cliente.historial.length;
  if (totalCompras === FIDELIDAD_UMBRAL) {
    bloomAdminToast(`🎉 ¡${cliente.nombre || "Esta clienta"} llegó a ${FIDELIDAD_UMBRAL} compras! Ya tiene ${FIDELIDAD_DESCUENTO_PORCENTAJE}% de descuento permanente.`);
  } else {
    bloomAdminToast(`Compra registrada (van ${totalCompras}).`);
  }
}

function eliminarCompraDeHistorial(telefono, indice) {
  if (!confirm("¿Eliminar esta compra del historial? (por ejemplo, si la registraste por error)")) return;
  const clientes = obtenerClientes();
  const cliente = clientes.find((c) => c.telefono === telefono);
  if (!cliente) return;
  cliente.historial.splice(indice, 1);
  guardarClientes(clientes);
  renderizarListaClientes();
}

function eliminarCliente(telefono) {
  if (!confirm("¿Eliminar por completo el registro de esta clienta (todo su historial)?")) return;
  const clientes = obtenerClientes().filter((c) => c.telefono !== telefono);
  guardarClientes(clientes);
  renderizarListaClientes();
}

function alternarHistorial(telefono) {
  const bloque = document.getElementById(`historial-${telefono}`);
  if (!bloque) return;
  const abierto = bloque.style.display !== "none";
  bloque.style.display = abierto ? "none" : "block";
  const boton = document.getElementById(`btn-historial-${telefono}`);
  if (boton) boton.textContent = abierto ? "Ver historial ▾" : "Ocultar historial ▴";
}

function mensajeDescuentoWhatsapp(cliente) {
  const texto = `¡Hola${cliente.nombre ? " " + cliente.nombre : ""}! 🌸 Gracias por ser clienta frecuente de Bloom. Por tus ${cliente.historial.length} compras ya tienes *${FIDELIDAD_DESCUENTO_PORCENTAJE}% de descuento permanente* en tus próximos pedidos ✨`;
  return `https://wa.me/${cliente.telefono}?text=${encodeURIComponent(texto)}`;
}

function renderizarListaClientes() {
  const contenedor = document.getElementById("lista-clientes-admin");
  if (!contenedor) return;

  const busqueda = (document.getElementById("campo-buscar-cliente")?.value || "").toLowerCase().trim();
  let clientes = obtenerClientes().sort((a, b) => b.historial.length - a.historial.length);

  if (busqueda) {
    clientes = clientes.filter(
      (c) => c.telefono.includes(busqueda) || (c.nombre || "").toLowerCase().includes(busqueda)
    );
  }

  if (!clientes.length) {
    contenedor.innerHTML = `<p style="color:var(--texto-suave);">Todavía no hay clientas registradas.</p>`;
    return;
  }

  contenedor.innerHTML = clientes
    .map((c) => {
      const totalCompras = c.historial.length;
      const totalGastado = c.historial.reduce((suma, h) => suma + (h.monto || 0), 0);
      const tieneDescuento = totalCompras >= FIDELIDAD_UMBRAL;
      const ultima = totalCompras ? c.historial[totalCompras - 1].fecha : "—";

      const filasHistorial = c.historial
        .map(
          (h, i) => `
          <div class="historial-fila">
            <span class="historial-fecha">${h.fecha || "—"}</span>
            <span class="historial-nota">${h.nota || "—"}</span>
            <span class="historial-monto">${h.monto ? bloomFormatoPrecio(h.monto) : "—"}</span>
            <button type="button" class="icono-btn borrar historial-borrar" onclick="eliminarCompraDeHistorial('${c.telefono}', ${i})" title="Eliminar esta compra">🗑️</button>
          </div>
        `
        )
        .reverse()
        .join("");

      return `
      <div class="producto-admin-fila" style="flex-wrap:wrap;">
        <div class="producto-admin-info">
          <h4>${c.nombre || "Sin nombre"} ${tieneDescuento ? '<span class="cliente-descuento-tag">🎁 ' + FIDELIDAD_DESCUENTO_PORCENTAJE + '% desde ahora</span>' : ""}</h4>
          <span>${c.telefono} · ${totalCompras} compra${totalCompras === 1 ? "" : "s"} · total gastado: ${bloomFormatoPrecio(totalGastado)} · última: ${ultima}</span>
        </div>
        <div class="producto-admin-acciones">
          <button type="button" class="btn btn-secundario btn-pequeno" id="btn-historial-${c.telefono}" onclick="alternarHistorial('${c.telefono}')">Ver historial ▾</button>
          ${tieneDescuento ? `<a class="icono-btn" href="${mensajeDescuentoWhatsapp(c)}" target="_blank" rel="noopener" title="Avisarle por WhatsApp">💬</a>` : ""}
          <button class="icono-btn borrar" onclick="eliminarCliente('${c.telefono}')" title="Eliminar clienta">🗑️</button>
        </div>
        <div class="historial-bloque" id="historial-${c.telefono}" style="display:none;">
          ${filasHistorial || '<p style="color:var(--texto-suave); font-size:0.85rem;">Sin compras registradas.</p>'}
        </div>
      </div>
    `;
    })
    .join("");
}
