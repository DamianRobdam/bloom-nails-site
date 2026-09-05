/* =========================================================
   BLOOM · Video de cada paso (guia.html)
   -----------------------------------------------------------
   Cada botón "🎥 Ver video" trae la ruta del video en su
   atributo data-video (ej: assets/video/paso-1.mp4). Como el
   sitio no tiene servidor, el video simplemente es un archivo
   .mp4 dentro de esa carpeta — si todavía no lo has grabado o
   subido, la ventana avisa "video próximamente" en vez de
   romperse o mostrar un reproductor vacío.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("modal-video-overlay");
  const cerrarBtn = document.getElementById("modal-video-cerrar");
  const tituloEl = document.getElementById("modal-video-titulo");
  const player = document.getElementById("modal-video-player");
  const aviso = document.getElementById("modal-video-aviso");

  if (!overlay || !player) return;

  document.querySelectorAll(".paso-video-btn").forEach((boton) => {
    boton.addEventListener("click", () => abrirVideoPaso(boton.dataset.video, boton.dataset.titulo));
  });

  cerrarBtn?.addEventListener("click", cerrarVideoPaso);
  overlay.addEventListener("click", (e) => {
    if (e.target.id === "modal-video-overlay") cerrarVideoPaso();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarVideoPaso();
  });

  async function abrirVideoPaso(rutaVideo, titulo) {
    tituloEl.textContent = titulo || "Video del paso";
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Estado de carga: oculta ambos mientras se confirma si el video existe
    player.style.display = "none";
    aviso.style.display = "none";
    player.pause();
    player.removeAttribute("src");
    player.load();

    const existe = await bloomVideoExiste(rutaVideo);
    if (existe) {
      player.src = rutaVideo;
      player.style.display = "block";
      player.load();
    } else {
      aviso.style.display = "block";
    }
  }

  function cerrarVideoPaso() {
    overlay.style.display = "none";
    document.body.style.overflow = "";
    player.pause();
    player.removeAttribute("src");
    player.load();
  }

  async function bloomVideoExiste(ruta) {
    if (!ruta) return false;
    try {
      const resp = await fetch(ruta, { method: "HEAD", cache: "no-store" });
      return resp.ok;
    } catch (e) {
      // en file:// (sin servidor) fetch puede fallar por completo
      return false;
    }
  }
});
