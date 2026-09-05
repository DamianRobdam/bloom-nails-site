/* =========================================================
   BLOOM · Interacciones generales del sitio
   ========================================================= */

// Número de WhatsApp del negocio (indicativo de país + número, sin +, sin espacios)
window.BLOOM_WHATSAPP_NUMERO = "573223291635";

document.addEventListener("DOMContentLoaded", () => {
  // ----- Header fijo al hacer scroll -----
  const header = document.getElementById("encabezado");
  const alScroll = () => {
    if (window.scrollY > 40) header?.classList.add("fijo");
    else header?.classList.remove("fijo");
  };
  window.addEventListener("scroll", alScroll);
  alScroll();

  // ----- Menú móvil -----
  const hamburguesa = document.getElementById("menu-hamburguesa");
  const navMenu = document.getElementById("nav-menu");
  hamburguesa?.addEventListener("click", () => {
    hamburguesa.classList.toggle("activo");
    navMenu?.classList.toggle("abierto");
  });
  navMenu?.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      hamburguesa?.classList.remove("activo");
      navMenu.classList.remove("abierto");
    })
  );

  // ----- Botón flotante de WhatsApp -----
  const waFlotante = document.getElementById("whatsapp-flotante");
  if (waFlotante) {
    const texto = "¡Hola Bloom! ✨ Quiero conocer más sobre las uñas press on.";
    waFlotante.href = `https://wa.me/${window.BLOOM_WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
  }

  // ----- Año dinámico en el pie de página -----
  const anio = document.getElementById("anio-actual");
  if (anio) anio.textContent = new Date().getFullYear();

  // ----- Formulario de contacto -> WhatsApp -----
  const formContacto = document.getElementById("form-contacto");
  formContacto?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("campo-nombre").value.trim();
    const mensaje = document.getElementById("campo-mensaje").value.trim();
    const asunto = document.getElementById("campo-asunto").value;
    const texto = `¡Hola Bloom! Soy ${nombre}.\nMotivo: ${asunto}\n${mensaje}`;
    window.open(
      `https://wa.me/${window.BLOOM_WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`,
      "_blank"
    );
    bloomMostrarToast("¡Gracias! Te llevamos a WhatsApp para continuar 💌");
    formContacto.reset();
  });

  bloomObservarReveal();
});

// ----- Animación de aparición al hacer scroll (reutilizable) -----
window.bloomObservarReveal = function bloomObservarReveal() {
  const elementos = document.querySelectorAll(".reveal:not(.visible)");
  const observer = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          observer.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  elementos.forEach((el) => observer.observe(el));
};

// ----- Pequeño aviso tipo "toast" -----
window.bloomMostrarToast = function bloomMostrarToast(mensaje) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = mensaje;
  toast.classList.add("mostrar");
  setTimeout(() => toast.classList.remove("mostrar"), 3200);
};
