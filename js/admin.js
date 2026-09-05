/* =========================================================
   BLOOM · Panel de administración
   - Acceso protegido con una contraseña simple (solo para
     evitar que cualquier visitante cambie el catálogo desde
     el mismo navegador; no es seguridad de servidor real).
   - CRUD de productos guardado en localStorage.
   - Exporta / importa productos.json para publicar cambios.
   ========================================================= */

// 👉 Cambia esta contraseña por la que prefieras
const ADMIN_PASSWORD = "bloom2026";
const SESSION_KEY = "bloom_admin_sesion";

let productoEditandoId = null;
let imagenActualBase64 = null;

// "Qué incluye": lista temporal mientras se arma/edita un producto
let incluyeTemp = [];
let incluyeImagenTemp = null;

// ---------------- LOGIN ----------------
document.addEventListener("DOMContentLoaded", () => {
  const yaAutenticada = sessionStorage.getItem(SESSION_KEY) === "1";
  if (yaAutenticada) mostrarPanel();

  document.getElementById("login-btn").addEventListener("click", intentarLogin);
  document.getElementById("login-clave").addEventListener("keydown", (e) => {
    if (e.key === "Enter") intentarLogin();
  });

  document.getElementById("btn-cerrar-sesion").addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });

  document.getElementById("campo-imagen").addEventListener("change", manejarSeleccionImagen);
  document.getElementById("btn-guardar").addEventListener("click", guardarProducto);
  document.getElementById("btn-cancelar-edicion").addEventListener("click", cancelarEdicion);
  document.getElementById("btn-exportar").addEventListener("click", exportarJSON);
  document.getElementById("btn-restaurar").addEventListener("click", restaurarCatalogoEjemplo);
  document.getElementById("campo-importar").addEventListener("change", importarJSON);

  document.getElementById("campo-incluye-imagen").addEventListener("change", manejarSeleccionImagenIncluye);
  document.getElementById("btn-agregar-incluye").addEventListener("click", agregarIncluyeTemp);
  document.getElementById("campo-incluye-nombre").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarIncluyeTemp();
    }
  });
  renderizarIncluyeTemp();
});

function intentarLogin() {
  const clave = document.getElementById("login-clave").value;
  if (clave === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, "1");
    mostrarPanel();
  } else {
    document.getElementById("login-error").textContent = "Contraseña incorrecta, intenta de nuevo.";
  }
}

function mostrarPanel() {
  document.getElementById("login-caja").style.display = "none";
  document.getElementById("panel-admin").style.display = "block";
  renderizarListaAdmin();
}

// ---------------- MANEJO DE IMAGEN ----------------
function manejarSeleccionImagen(e) {
  const archivo = e.target.files[0];
  if (!archivo) return;
  const lector = new FileReader();
  lector.onload = (evento) => {
    imagenActualBase64 = evento.target.result;
    document.getElementById("preview-imagen").innerHTML = `<img src="${imagenActualBase64}" alt="Previsualización">`;
  };
  lector.readAsDataURL(archivo);
}

// ---------------- "QUÉ INCLUYE" (lista temporal del formulario) ----------------
function manejarSeleccionImagenIncluye(e) {
  const archivo = e.target.files[0];
  if (!archivo) return;
  const lector = new FileReader();
  lector.onload = (evento) => {
    incluyeImagenTemp = evento.target.result;
    const boton = document.getElementById("incluye-subir-foto-btn");
    boton.classList.add("con-foto");
    boton.innerHTML = `<img src="${incluyeImagenTemp}" alt="Foto"><input type="file" id="campo-incluye-imagen" accept="image/*" style="display:none;">`;
    document.getElementById("campo-incluye-imagen").addEventListener("change", manejarSeleccionImagenIncluye);
  };
  lector.readAsDataURL(archivo);
}

function agregarIncluyeTemp() {
  const campoNombre = document.getElementById("campo-incluye-nombre");
  const nombre = campoNombre.value.trim();
  if (!nombre) {
    bloomAdminToast("Escribe el nombre de lo que incluye (ej: Palito de naranjo).");
    return;
  }
  incluyeTemp.push({ nombre, imagen: incluyeImagenTemp || null });
  campoNombre.value = "";
  incluyeImagenTemp = null;
  const boton = document.getElementById("incluye-subir-foto-btn");
  boton.classList.remove("con-foto");
  boton.innerHTML = `📷<input type="file" id="campo-incluye-imagen" accept="image/*" style="display:none;">`;
  document.getElementById("campo-incluye-imagen").addEventListener("change", manejarSeleccionImagenIncluye);
  renderizarIncluyeTemp();
  campoNombre.focus();
}

function quitarIncluyeTemp(indice) {
  incluyeTemp.splice(indice, 1);
  renderizarIncluyeTemp();
}

function renderizarIncluyeTemp() {
  const contenedor = document.getElementById("lista-incluye-admin");
  if (!incluyeTemp.length) {
    contenedor.innerHTML = `<p style="color:var(--texto-suave); font-size:0.82rem; margin:0;">Aún no has agregado elementos.</p>`;
    return;
  }
  contenedor.innerHTML = incluyeTemp
    .map(
      (item, i) => `
    <span class="incluye-item-admin">
      ${item.imagen ? `<img src="${item.imagen}" alt="${item.nombre}">` : `<span class="incluye-item-admin-sinfoto">🌸</span>`}
      ${item.nombre}
      <button type="button" onclick="quitarIncluyeTemp(${i})" title="Quitar">✕</button>
    </span>
  `
    )
    .join("");
}

// ---------------- GUARDAR / EDITAR ----------------
function guardarProducto() {
  const nombre = document.getElementById("campo-nombre").value.trim();
  const precio = parseInt(document.getElementById("campo-precio").value, 10);
  const categoria = document.getElementById("campo-categoria").value;
  const descripcion = document.getElementById("campo-descripcion").value.trim();

  if (!nombre || !precio) {
    bloomAdminToast("Por favor completa al menos el nombre y el precio.");
    return;
  }

  const productos = obtenerProductosGuardados();

  if (productoEditandoId) {
    const idx = productos.findIndex((p) => p.id === productoEditandoId);
    if (idx > -1) {
      productos[idx] = {
        ...productos[idx],
        nombre,
        precio,
        categoria,
        descripcion,
        imagen: imagenActualBase64 || productos[idx].imagen,
        incluye: [...incluyeTemp],
      };
    }
  } else {
    if (!imagenActualBase64) {
      bloomAdminToast("Agrega una foto del producto.");
      return;
    }
    productos.push({
      id: "p-" + Date.now(),
      nombre,
      precio,
      categoria,
      descripcion,
      imagen: imagenActualBase64,
      incluye: [...incluyeTemp],
    });
  }

  guardarProductosLocalStorage(productos);
  limpiarFormulario();
  renderizarListaAdmin();
  bloomAdminToast(productoEditandoId ? "Producto actualizado ✓" : "Producto agregado ✓");
  productoEditandoId = null;
}

function limpiarFormulario() {
  document.getElementById("campo-nombre").value = "";
  document.getElementById("campo-precio").value = "";
  document.getElementById("campo-descripcion").value = "";
  document.getElementById("campo-categoria").selectedIndex = 0;
  document.getElementById("campo-imagen").value = "";
  document.getElementById("preview-imagen").innerHTML = `<span>Aún no has subido una foto<br>(clic abajo para elegir una)</span>`;
  document.getElementById("form-titulo").textContent = "Agregar producto";
  document.getElementById("btn-guardar").textContent = "Agregar producto";
  document.getElementById("btn-cancelar-edicion").style.display = "none";
  imagenActualBase64 = null;

  incluyeTemp = [];
  incluyeImagenTemp = null;
  document.getElementById("campo-incluye-nombre").value = "";
  const botonIncluye = document.getElementById("incluye-subir-foto-btn");
  botonIncluye.classList.remove("con-foto");
  botonIncluye.innerHTML = `📷<input type="file" id="campo-incluye-imagen" accept="image/*" style="display:none;">`;
  document.getElementById("campo-incluye-imagen").addEventListener("change", manejarSeleccionImagenIncluye);
  renderizarIncluyeTemp();
}

function cancelarEdicion() {
  productoEditandoId = null;
  limpiarFormulario();
}

// ---------------- EDITAR / BORRAR DESDE LA LISTA ----------------
function editarProducto(id) {
  const productos = obtenerProductosGuardados();
  const producto = productos.find((p) => p.id === id);
  if (!producto) return;

  productoEditandoId = id;
  imagenActualBase64 = producto.imagen;
  document.getElementById("campo-nombre").value = producto.nombre;
  document.getElementById("campo-precio").value = producto.precio;
  document.getElementById("campo-categoria").value = producto.categoria || "Otro";
  document.getElementById("campo-descripcion").value = producto.descripcion || "";
  document.getElementById("preview-imagen").innerHTML = `<img src="${producto.imagen}" alt="Previsualización">`;
  document.getElementById("form-titulo").textContent = "Editar producto";
  document.getElementById("btn-guardar").textContent = "Guardar cambios";
  document.getElementById("btn-cancelar-edicion").style.display = "inline-flex";

  incluyeTemp = Array.isArray(producto.incluye) ? [...producto.incluye] : [];
  incluyeImagenTemp = null;
  renderizarIncluyeTemp();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function borrarProducto(id) {
  if (!confirm("¿Eliminar este producto del catálogo?")) return;
  const productos = obtenerProductosGuardados().filter((p) => p.id !== id);
  guardarProductosLocalStorage(productos);
  renderizarListaAdmin();
  bloomAdminToast("Producto eliminado");
}

function restaurarCatalogoEjemplo() {
  if (!confirm("Esto reemplazará el catálogo guardado en este navegador por el catálogo de ejemplo. ¿Continuar?")) return;
  guardarProductosLocalStorage(BLOOM_DEFAULT_PRODUCTS);
  renderizarListaAdmin();
  bloomAdminToast("Catálogo de ejemplo restaurado");
}

// ---------------- LOCALSTORAGE ----------------
function obtenerProductosGuardados() {
  try {
    const data = localStorage.getItem(BLOOM_STORAGE_KEY);
    return data ? JSON.parse(data) : [...BLOOM_DEFAULT_PRODUCTS];
  } catch (e) {
    return [...BLOOM_DEFAULT_PRODUCTS];
  }
}

function guardarProductosLocalStorage(productos) {
  try {
    localStorage.setItem(BLOOM_STORAGE_KEY, JSON.stringify(productos));
  } catch (e) {
    bloomAdminToast("No se pudo guardar (¿demasiadas imágenes grandes?). Intenta con fotos más livianas.");
  }
}

// ---------------- RENDER LISTA ----------------
function renderizarListaAdmin() {
  const contenedor = document.getElementById("lista-productos-admin");
  const productos = obtenerProductosGuardados();

  if (!productos.length) {
    contenedor.innerHTML = `<p style="color:var(--texto-suave);">Todavía no hay productos. Agrega el primero en el formulario ⟵</p>`;
    return;
  }

  contenedor.innerHTML = productos
    .map(
      (p) => `
    <div class="producto-admin-fila">
      <img src="${p.imagen}" alt="${p.nombre}">
      <div class="producto-admin-info">
        <h4>${p.nombre}</h4>
        <span>${p.categoria || "Otro"}</span>
      </div>
      <div class="producto-admin-precio">${bloomFormatoPrecio(p.precio)}</div>
      <div class="producto-admin-acciones">
        <button class="icono-btn" onclick="editarProducto('${p.id}')" title="Editar">✏️</button>
        <button class="icono-btn borrar" onclick="borrarProducto('${p.id}')" title="Eliminar">🗑️</button>
      </div>
    </div>
  `
    )
    .join("");
}

// ---------------- EXPORTAR / IMPORTAR JSON ----------------
function exportarJSON() {
  const productos = obtenerProductosGuardados();
  const blob = new Blob([JSON.stringify(productos, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "productos.json";
  a.click();
  URL.revokeObjectURL(url);
  bloomAdminToast("productos.json descargado — súbelo a la carpeta del sitio para publicar los cambios");
}

function importarJSON(e) {
  const archivo = e.target.files[0];
  if (!archivo) return;
  const lector = new FileReader();
  lector.onload = (evento) => {
    try {
      const data = JSON.parse(evento.target.result);
      if (!Array.isArray(data)) throw new Error("Formato inválido");
      guardarProductosLocalStorage(data);
      renderizarListaAdmin();
      bloomAdminToast("Catálogo importado ✓");
    } catch (err) {
      bloomAdminToast("El archivo no tiene un formato válido.");
    }
  };
  lector.readAsText(archivo);
  e.target.value = "";
}

// ---------------- TOAST ----------------
function bloomAdminToast(mensaje) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.classList.add("mostrar");
  setTimeout(() => toast.classList.remove("mostrar"), 3200);
}
