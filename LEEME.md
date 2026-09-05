# 🌸 Bloom — Sitio web de uñas press on

Sitio web listo para usar: catálogo de productos, botón de pedido por WhatsApp,
formulario de contacto y un panel de administración para agregar tus propios
productos con foto, nombre y precio — todo en español.

## Estructura de archivos

```
proyectoLuchi/
├── index.html          → Página principal del sitio
├── admin.html          → Panel para agregar/editar/eliminar productos
├── productos.json      → Catálogo público del sitio (el que ven las visitantes)
├── css/style.css       → Todos los estilos (colores, animaciones, responsive)
├── js/main.js          → Menú, scroll, WhatsApp, formulario
├── js/catalogo.js      → Carga y muestra los productos
├── js/admin.js         → Lógica del panel de administración
└── assets/img/         → Imágenes de ejemplo (reemplázalas por tus fotos reales)
```

## Cómo abrirlo y ejecutarlo en Visual Studio Code

1. Abre Visual Studio Code y ve a **Archivo → Abrir carpeta...** y selecciona la
   carpeta `proyectoLuchi` (esta misma carpeta).
2. Instala la extensión gratuita **"Live Server"** (de Ritwick Dey) desde la
   pestaña de Extensiones (icono de cuadritos en la barra lateral, o
   `Ctrl+Shift+X`, y busca "Live Server").
3. En el explorador de archivos de VS Code, haz clic derecho sobre
   `index.html` y elige **"Open with Live Server"**.
4. Se abrirá tu navegador en una dirección como `http://127.0.0.1:5500` con
   el sitio funcionando — con animaciones, catálogo y botón de WhatsApp.

> ⚠️ **Importante:** no abras `index.html` haciendo doble clic directamente
> (`file://...`) porque el catálogo (`productos.json`) no cargará por
> restricciones del navegador. Usa siempre Live Server (o cualquier servidor
> local) mientras lo pruebas.

### Alternativa sin extensión (si prefieres la terminal)

Con Python instalado, desde la terminal de VS Code, dentro de la carpeta:

```
python -m http.server 5500
```

y abre `http://localhost:5500` en tu navegador.

## Cómo agregar tus productos (fotos reales, nombre, precio)

1. Con el sitio abierto en Live Server, entra a `admin.html`
   (o haz clic en "Panel de administración" al final de la página principal).
2. Ingresa la contraseña: **bloom2026**
   (puedes cambiarla editando la constante `ADMIN_PASSWORD` en `js/admin.js`).
3. Sube la foto, escribe el nombre, precio, categoría y descripción, y da clic
   en **"Agregar producto"**. Lo verás reflejado de inmediato en el sitio
   (en este mismo navegador).
4. Cuando termines de agregar/editar productos, da clic en
   **"⬇️ Descargar productos.json"** y reemplaza el archivo `productos.json`
   de esta carpeta por el que acabas de descargar.

   Esto es necesario porque el sitio no tiene una base de datos en un
   servidor: el panel guarda los cambios en tu navegador para que puedas
   verlos y editarlos, pero para que **todas las personas que visiten el
   sitio los vean**, ese archivo `productos.json` actualizado debe subirse
   junto con el resto de la carpeta a donde publiques tu página (por ejemplo
   Hostinger, GitHub Pages, Netlify, etc.).

## Personalizador de diseño (`personalizar.html`)

Hay una página donde la clienta arma su propio set: elige forma, largo,
acabado y decoración (puede combinar varias decoraciones), puede subir una
foto del diseño que le gusta como referencia, y ve el costo total actualizarse
en vivo. Al final, un botón envía el pedido con el desglose completo por
WhatsApp (si el celular lo permite, comparte también la imagen directamente).

Los precios de esta página (precio base y cada extra) son de **ejemplo** y
están todos juntos, muy fáciles de editar, en:

```
js/personalizar-data.js
```

Solo cambia los números de `costo` y `precioBase` — no necesitas tocar nada
más. Puedes agregar o quitar categorías/opciones copiando el mismo formato.

### Tablero de dibujo ("Dibuja tu propio diseño")

Justo arriba de esas opciones, la clienta ve un tablero blanco con 5 uñas
(una "mano" completa) en la forma que elija, y a la derecha un panel con:

- **Forma de la uña** (Almendra, Cuadrada, Oval, Coffin/Ballerina, Stiletto)
  — es la misma opción que ya existía, solo que ahora se elige desde aquí y
  cambia al instante la forma de las 5 uñas del tablero.
- **Herramienta**: Pincel o Borrador.
- **Grosor** del trazo.
- **Color**: una paleta de colores comunes en manicure, más un selector de
  color libre.

La clienta dibuja directamente sobre las uñas con el mouse (o el dedo en
celular) para mostrarnos la idea que tiene en mente — no necesita saber
dibujar bien, es solo una guía visual. También puede deshacer el último
trazo o limpiar todo el tablero.

Al hacer clic en "Agregar mi diseño al carrito", si dibujó algo en el
tablero, esa imagen (las 5 uñas con su dibujo) se adjunta automáticamente
al pedido — si no dibujó nada pero sí subió una foto de referencia, se usa
esa foto en su lugar. No necesitas configurar nada para que esto funcione.

## Ver qué incluye cada producto

En el catálogo, cada producto tiene un botón "🎁 Ver qué incluye" (si le
agregaste elementos) y toda la foto es clicable ("🔍 Ver detalle"). Al
hacer clic se abre una ventana con la foto más grande, la descripción
completa y una cuadrícula con cada elemento incluido (foto pequeña +
nombre) — por ejemplo el "Kit de aplicación Bloom" de ejemplo muestra
toallitas de alcohol, palito de naranjo, lima, buffer y adhesivo extra.
También puedes agregar el producto al carrito directamente desde esa
ventana.

Cómo se agrega desde el panel de administración: al crear o editar un
producto, en el bloque **"¿Qué incluye? (opcional)"** escribe el nombre
de cada elemento (ej: "Palito de naranjo"), opcionalmente sube una foto
para ese elemento con el botón 📷, y da clic en "+ Agregar". Puedes
agregar los que quieras y quitarlos con la ✕. Si no le agregas nada a un
producto, simplemente no se muestra esa sección para él.

### Kit de aplicación como opción adicional

En esa misma ventana de detalle, cualquier producto que no sea el propio
"Kit de aplicación" muestra una casilla para que la clienta decida si
quiere agregarlo también a su pedido por un costo extra (toallitas de
alcohol, palito de naranjo, lima, buffer y adhesivo). Al marcarla, el
precio mostrado se actualiza al instante sumando el costo del kit, y si
confirma "Agregar al carrito" se agregan las dos líneas por separado
(el diseño elegido + el kit).

El precio del kit como adicional está en `js/catalogo.js`:

```js
window.BLOOM_KIT_APLICACION_PRECIO = 5000;
```

Es independiente del precio del "Kit de aplicación Bloom" cuando se
vende como producto completo del catálogo (ese lo defines como
cualquier otro producto, desde el panel de administración).


## Carrito de compras (`carrito.html`)

El sitio tiene carrito: desde el catálogo (botón "Agregar") y desde el
personalizador (botón "Agregar mi diseño al carrito") las clientas van
sumando productos. El ícono del carrito 🛒 en el menú (todas las páginas)
muestra cuántos artículos hay.

En `carrito.html` la clienta puede:
- Ajustar cantidades o quitar productos.
- Elegir el envío: **Bogotá (gratis)** o **Resto de Colombia** (el costo
  depende de la transportadora y la ciudad, así que se confirma por
  WhatsApp — no se cobra un valor fijo en el sitio). Si elige envío
  nacional, debe escribir su ciudad.
- Ver el número de Nequi para pagar (con botón para copiarlo).
- Confirmar el pedido con un botón que abre WhatsApp con el resumen
  completo (productos, cantidades, subtotal, tipo de envío/ciudad y el
  aviso de pago por Nequi). **El sitio no tiene pasarela de pagos** — el
  pago se hace por fuera, transfiriendo por Nequi y enviando el
  comprobante por WhatsApp.

El número de Nequi está en `js/carrito.js`:

```js
window.BLOOM_NEQUI_NUMERO = "573223291635";
```

Cámbialo si quieres recibir los pagos en otro número (y actualiza también
el número que se muestra en `carrito.html`, en el bloque "Pago por Nequi").

### Promoción automática: 10% desde $100.000

El carrito aplica solo, sin que nadie tenga que hacer nada, un descuento
cuando el subtotal llega a cierto monto. Se avisa en tres lugares para que
la clienta lo sepa desde antes de llegar al carrito:

- Un banner rosa ("🎉 Compras desde $100.000 tienen 10% de descuento
  automático") en la página principal, en el personalizador y en el carrito.
- Dentro del carrito, mientras no llegue al monto, un aviso le dice
  cuánto le falta ("Agrega $X más y obtén 10% de descuento"); al llegar,
  aparece la fila de descuento restada del total y un mensaje de
  confirmación.
- El mensaje de WhatsApp del pedido incluye la línea del descuento cuando
  aplica, para que quede claro también ahí.

El monto mínimo y el porcentaje están centralizados en `js/carrito.js`:

```js
window.BLOOM_DESCUENTO_MONTO_MINIMO = 100000; // COP
window.BLOOM_DESCUENTO_PORCENTAJE = 10; // %
```

Cambia estos dos números para ajustar la promoción — se actualiza sola en
todo el sitio (banners, carrito y mensaje de WhatsApp).

## Clientes y fidelización (dentro de `admin.html`)

Al final del panel de administración hay una sección **"Registrar compra
confirmada"**. Es manual a propósito: como el sitio no cobra en línea, la
única forma confiable de saber si alguien realmente compró 3 veces es que
tú lo registres justo después de comprobar que el pago por Nequi llegó —
así nadie puede inflar su propio conteo desde el navegador.

Ahora este registro es un **historial de compras real**, no solo un
contador: por cada compra confirmada guardas la fecha (automática), el
**valor de esa compra** y, opcionalmente, **qué compró** la clienta. Así
tienes un control de verdad de cada pedido, no solo un número.

Cómo se usa: cuando confirmes un pago, escribe el número de WhatsApp de la
clienta (obligatorio — es su identificador único), su nombre (opcional),
el valor de la compra y qué compró (opcional), y da clic en
"+ Registrar compra". Si la clienta ya existe le agrega una compra más a
su historial; si no existe, la crea. Cuando llega a la 3ª compra, el
sistema la marca automáticamente con la etiqueta "🎁 10% desde ahora" y
te deja un botón para avisarle por WhatsApp.

En la lista de "Clientes registradas" cada clienta muestra un resumen
(total de compras, total gastado y fecha de la última compra) y un botón
**"Ver historial ▾"** que despliega el detalle de cada compra (fecha, qué
compró, valor) con la opción de borrar una compra puntual si la
registraste por error (por ejemplo, sin afectar las demás). También puedes
eliminar el registro completo de una clienta.

La regla (a partir de qué compra y qué porcentaje) está en
`js/clientes.js`:

```js
const FIDELIDAD_UMBRAL = 3; // desde qué compra aplica el descuento
const FIDELIDAD_DESCUENTO_PORCENTAJE = 10; // % de descuento, permanente
```

Este descuento es informativo/manual: el sitio no lo resta solo del total
en el carrito (no hay pasarela que lo aplique automáticamente); la idea es
que tú lo apliques al confirmar el pedido por WhatsApp una vez veas la
etiqueta de la clienta.

## Videos en la guía de aplicación (`guia.html`)

Cada uno de los 6 pasos para aplicar las uñas tiene un botón "🎥 Ver
video". Mientras no exista el archivo, ese botón simplemente muestra
"El video de este paso todavía no se ha agregado" — no rompe el sitio,
así que puedes publicarlo sin videos y agregarlos más adelante.

Para activarlos, agrega tus videos en la carpeta `assets/video/` con
exactamente estos nombres (están detallados también en
`assets/video/LEEME-videos.txt`):

```
assets/video/paso-1.mp4   → Prepara tus uñas
assets/video/paso-2.mp4   → Limpia y desengrasa
assets/video/paso-3.mp4   → Aplica el adhesivo
assets/video/paso-4.mp4   → Presiona y sostén
assets/video/paso-5.mp4   → Ajusta los bordes
assets/video/paso-6.mp4   → ¡Listo! Disfruta tu manicure
```

No necesitas tocar código: en cuanto el archivo con ese nombre exista
en esa carpeta, el botón de ese paso muestra el video automáticamente.
Recomendado: formato .mp4, grabado en vertical o cuadrado (como para
Instagram/TikTok), videos cortos (10-30 segundos) y livianos para que
carguen rápido — si pesan mucho, comprímelos antes con algo como
HandBrake (gratis).

## Cómo cambiar el número de WhatsApp

Está en `js/main.js`, en la primera línea con contenido:

```js
window.BLOOM_WHATSAPP_NUMERO = "573223291635";
```

Cámbialo por tu número con indicativo de país, sin `+` ni espacios.

## Cómo publicar el sitio en internet

Cuando quieras que cualquier persona pueda entrar desde un enlace (no solo tú
en VS Code), puedes subir toda esta carpeta a un servicio de hosting gratuito
como **Netlify**, **Vercel** o **GitHub Pages** (arrastrando la carpeta), o a
un hosting pago con dominio propio (ej. Hostinger, GoDaddy). Si quieres, en el
chat te puedo guiar paso a paso para publicarlo cuando estés lista.

## Personalizar colores

Los colores rosa y beige están centralizados como variables al inicio de
`css/style.css` (bajo `:root`), por ejemplo `--rosa-fuerte`, `--beige`,
`--crema`. Cambiándolos ahí se actualiza todo el sitio.
