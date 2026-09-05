/* =========================================================
   BLOOM · Configuración del personalizador de diseño
   -----------------------------------------------------------
   ⚠️ Los precios de aquí abajo son de EJEMPLO. Edítalos cuando
   definan los costos reales — solo cambia los números de "costo"
   (en pesos COP, sin puntos ni comas) y "precioBase". No necesitas
   tocar ningún otro archivo.

   Cada categoría puede ser:
   - tipo: "unica"    → la clienta elige SOLO una opción (ej: forma)
   - tipo: "multiple" → la clienta puede elegir varias (ej: decoración)
   ========================================================= */

const PERSONALIZAR_CONFIG = {
  precioBase: 35000, // precio del set personalizado antes de los extras

  categorias: [
    {
      id: "forma",
      nombre: "1. Forma de la uña",
      tipo: "unica",
      ayuda: "Elige la forma que más te guste.",
      opciones: [
        { id: "almendra", nombre: "Almendra", costo: 0 },
        { id: "cuadrada", nombre: "Cuadrada", costo: 0 },
        { id: "oval", nombre: "Oval", costo: 0 },
        { id: "coffin", nombre: "Coffin / Ballerina", costo: 3000 },
        { id: "stiletto", nombre: "Stiletto", costo: 4000 },
      ],
    },
    {
      id: "largo",
      nombre: "2. Largo",
      tipo: "unica",
      ayuda: "A mayor largo, mayor costo de materiales.",
      opciones: [
        { id: "corto", nombre: "Corto", costo: 0 },
        { id: "medio", nombre: "Medio", costo: 2000 },
        { id: "largo", nombre: "Largo", costo: 4000 },
        { id: "xl", nombre: "Extra largo", costo: 6000 },
      ],
    },
    {
      id: "acabado",
      nombre: "3. Acabado",
      tipo: "unica",
      ayuda: "El terminado final de tu set.",
      opciones: [
        { id: "mate", nombre: "Mate", costo: 0 },
        { id: "brillante", nombre: "Brillante", costo: 0 },
        { id: "glitter", nombre: "Glitter", costo: 5000 },
        { id: "cromado", nombre: "Cromado / Espejo", costo: 7000 },
      ],
    },
    {
      id: "decoracion",
      nombre: "4. Decoración (elige una o varias)",
      tipo: "multiple",
      ayuda: "Puedes combinar varios detalles en tu set.",
      opciones: [
        { id: "francesa", nombre: "Francesa", costo: 3000 },
        { id: "ombre", nombre: "Ombré", costo: 4000 },
        { id: "strass", nombre: "Piedras / Strass", costo: 6000 },
        { id: "dijes", nombre: "Dijes 3D", costo: 7000 },
        { id: "rayas", nombre: "Líneas / Nail art fino", costo: 5000 },
      ],
    },
  ],
};
