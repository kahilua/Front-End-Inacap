/**
 * Fogón & Arte — Tienda de Cocina
 * Archivo: index.js (Versión Simplificada y Refactorizada)
 * Estructura: Espacios de nombres planos (objetos), métodos nativos de arreglos,
 *             manejo de errores integrado, helpers DOM y validaciones seguras.
 */

"use strict";

/* ============================================================
   1. SELECTORES / HELPERS
   ============================================================ */

/** Selecciona un elemento por ID */
const $ = (id) => document.getElementById(id);
/** Selecciona todos los elementos que coincidan con el selector */
const $$ = (sel) => document.querySelectorAll(sel);

/** Formatea un número como precio en CLP */
const formatearPrecio = (valor) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(valor);

/** Escapa caracteres HTML para prevenir XSS */
const escapeHTML = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/** Limita la frecuencia de ejecución de una función */
const debounce = (fn, ms = 200) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

/* ============================================================
   2. DATOS DEL SISTEMA
   ============================================================ */

/** @typedef {{ id: number, nombre: string, precio: number, categoria: string, descripcion: string, imagen: string }} Producto */

/** Arreglo plano de productos del catálogo */
let todosLosProductos = [
  { id: 1, nombre: "Cuchillo Santoku", precio: 49990, categoria: "cuchillos", descripcion: "Hoja de acero japonés 18 cm, ideal para cortes precisos de verduras y proteínas.", imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/180mm_santoku_%28top-down_view%29.jpg/960px-180mm_santoku_%28top-down_view%29.jpg" },
  { id: 2, nombre: "Cuchillo de Chef 20cm", precio: 64990, categoria: "cuchillos", descripcion: "Acero inoxidable forjado, mango ergonómico de madera de pakka.", imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Chef%27s_knife.jpg/960px-Chef%27s_knife.jpg" },
  { id: 3, nombre: "Cuchillo de Pan", precio: 29990, categoria: "cuchillos", descripcion: "Hoja serrada de 22 cm, corte limpio sin aplastes.", imagen: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Broodmes.jpg" },
  { id: 4, nombre: "Olla Le Fonte 24 cm", precio: 69990, categoria: "ollas", descripcion: "Hierro fundido esmaltado, distribución uniforme del calor. Apta para todos los fuegos.", imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Lamb-stew.jpg/960px-Lamb-stew.jpg" },
  { id: 5, nombre: "Cacerola Antiadherente", precio: 44990, categoria: "ollas", descripcion: "Revestimiento cerámico libre de PFOA, base de aluminio prensado.", imagen: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Pfanne_%28Edelstahl%29.jpg" },
  { id: 6, nombre: "Wok de Acero Carbono", precio: 39990, categoria: "ollas", descripcion: "Seasoning natural, apto para cocina de alta temperatura y fuego abierto.", imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Wok_cooking.jpg/960px-Wok_cooking.jpg" },
  { id: 7, nombre: "Tabla de Corte Bambú", precio: 19990, categoria: "accesorios", descripcion: "Bambú orgánico extra grueso (3 cm), con ranura colectora de jugos.", imagen: "https://www.ikea.com/cl/es/images/products/laemplig-tabla-para-picar-bambu__0711757_pe728449_s5.jpg?f=m" },
  { id: 8, nombre: "Set Espátulas Silicona", precio: 3990, categoria: "accesorios", descripcion: "Pack de 3 piezas resistentes a 230°C, sin BPA.", imagen: "https://m.media-amazon.com/images/I/61n6rRPOIAL._AC_SL1500_.jpg" },
  { id: 9, nombre: "Termómetro Digital", precio: 9990, categoria: "accesorios", descripcion: "Lectura en 2 segundos, rango -50°C a 300°C. Ideal para carnes y repostería.", imagen: "https://m.media-amazon.com/images/I/81VHvUqgC1L._AC_SL1500_.jpg" }
];

/** Carrito de compras */
let carrito = [];

/** Generador de ID correlativo */
let nextId = todosLosProductos.reduce((max, p) => Math.max(max, p.id), 0) + 1;

/* ============================================================
   3. GESTORES DE INTERFAZ Y LÓGICA (MÓDULOS DE OBJETO)
   ============================================================ */

/** Manejo centralizado de visualización de errores */
const ErrorManager = {
  mostrarError(fieldId, mensaje) {
    const el = $(`err-${fieldId}`);
    const input = $(fieldId) || document.querySelector(`[name="${fieldId}"]`);
    if (el) { el.textContent = mensaje; el.classList.add("visible"); }
    if (input) { input.classList.add("input-error"); input.setAttribute("aria-invalid", "true"); }
  },

  limpiarError(fieldId) {
    const el = $(`err-${fieldId}`);
    const input = $(fieldId) || document.querySelector(`[name="${fieldId}"]`);
    if (el) { el.textContent = ""; el.classList.remove("visible"); }
    if (input) { input.classList.remove("input-error"); input.removeAttribute("aria-invalid"); }
  },

  limpiarTodos(ids) {
    ids.forEach(id => this.limpiarError(id));
  }
};

/** Toast de notificaciones */
const Toast = {
  timer: null,
  mostrar(mensaje, tipo = "success") {
    const toast = $("toast");
    if (!toast) return;
    clearTimeout(this.timer);
    
    // textContent de manera nativa escapa texto para prevenir inyecciones HTML (XSS)
    toast.textContent = mensaje;
    toast.className = `toast toast--${tipo} toast--visible`;
    
    this.timer = setTimeout(() => toast.classList.remove("toast--visible"), 3000);
  }
};

/** Catálogo de productos */
const Catalogo = {
  filtroActivo: "todos",

  obtenerProductosFiltrados() {
    // Uso del método .filter() para filtrar por categoría de manera eficiente (Criterio 2.1.3)
    return this.filtroActivo === "todos"
      ? todosLosProductos
      : todosLosProductos.filter(p => p.categoria === this.filtroActivo);
  },

  construirTarjeta(producto) {
    return `
      <article class="product-card" data-id="${producto.id}" tabindex="0"
        aria-label="${escapeHTML(producto.nombre)}, ${formatearPrecio(producto.precio)}">
        <div class="product-card__image-container">
          <img src="${producto.imagen}" alt="${escapeHTML(producto.nombre)}" class="product-card__img" loading="lazy">
        </div>
        <div class="product-card__body">
          <span class="product-card__cat">${escapeHTML(producto.categoria)}</span>
          <h3 class="product-card__name">${escapeHTML(producto.nombre)}</h3>
          <p class="product-card__desc">${escapeHTML(producto.descripcion)}</p>
          <div class="product-card__footer">
            <span class="product-card__price">${formatearPrecio(producto.precio)}</span>
            <button class="btn-add" data-id="${producto.id}" aria-label="Añadir ${escapeHTML(producto.nombre)} al carrito">
              + Añadir
            </button>
          </div>
        </div>
      </article>`;
  },

  renderizar() {
    const grid = $("productsGrid");
    if (!grid) return;
    const productos = this.obtenerProductosFiltrados();
    
    if (productos.length === 0) {
      grid.innerHTML = `<p class="empty-state">No hay productos en esta categoría.</p>`;
      return;
    }
    
    // Uso del método .map() para iterar y generar HTML (Criterio 2.1.3)
    grid.innerHTML = productos.map(p => this.construirTarjeta(p)).join("");
  },

  aplicarFiltro(categoria) {
    this.filtroActivo = categoria;
    $$(".filter-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.filter === categoria);
    });
    this.renderizar();
  },

  agregarProducto(producto) {
    todosLosProductos.push(producto);
    this.renderizar();
  },

  buscarPorId(id) {
    // Uso del método .find() para búsquedas rápidas (Criterio 2.1.3)
    return todosLosProductos.find(p => p.id === id);
  }
};

/** Carrito de compras */
const Carrito = {
  calcularTotal() {
    // Uso del método .reduce() para totalizar el acumulado monetario (Criterio 2.1.3)
    return carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  },

  actualizarBadge() {
    // Uso de .reduce() para contar la cantidad total de artículos agregados
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const badge = $("cartBadge");
    if (badge) badge.textContent = total;
  },

  construirItem(item) {
    return `
      <li class="cart-item" data-id="${item.id}">
        <img src="${item.imagen}" alt="" class="cart-item__img" aria-hidden="true">
        <div class="cart-item__info">
          <span class="cart-item__name">${escapeHTML(item.nombre)}</span>
          <span class="cart-item__price">${formatearPrecio(item.precio)} × ${item.cantidad}</span>
        </div>
        <button class="btn-remove" data-id="${item.id}" aria-label="Eliminar ${escapeHTML(item.nombre)} del carrito">✕</button>
      </li>`;
  },

  renderizar() {
    const list = $("cartList");
    const totalEl = $("cartTotal");
    if (!list || !totalEl) return;

    list.innerHTML = carrito.length === 0
      ? `<li class="cart-empty">Tu carrito está vacío.</li>`
      : carrito.map(item => this.construirItem(item)).join("");

    totalEl.textContent = formatearPrecio(this.calcularTotal());
    this.actualizarBadge();
  },

  agregar(producto) {
    const existente = carrito.find(i => i.id === producto.id);
    if (existente) {
      existente.cantidad += 1;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }
    this.renderizar();
    Toast.mostrar(`"${producto.nombre}" añadido al carrito`, "success");
  },

  eliminar(id) {
    // Uso de .findIndex() para localizar el índice a eliminar (Criterio 2.1.3)
    const idx = carrito.findIndex(i => i.id === id);
    if (idx === -1) return;
    const nombre = carrito[idx].nombre;
    carrito.splice(idx, 1);
    this.renderizar();
    Toast.mostrar(`"${nombre}" eliminado del carrito.`, "info");
  },

  vaciar() {
    carrito.length = 0;
    this.renderizar();
  }
};

/** Controlador de tema claro/oscuro */
const Tema = {
  KEY: "fogon_tema",

  aplicar(tema) {
    document.body.setAttribute("data-theme", tema);
    const icon = $("themeIcon");
    if (icon) {
      icon.innerHTML = tema === "dark" 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    }
    try { localStorage.setItem(this.KEY, tema); } catch (_) {}
  },

  alternar() {
    const actual = document.body.getAttribute("data-theme") || "light";
    this.aplicar(actual === "light" ? "dark" : "light");
  },

  inicializar() {
    let guardado = null;
    try { guardado = localStorage.getItem(this.KEY); } catch (_) {}
    const preferencia = guardado || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    this.aplicar(preferencia);
  }
};

/** Validador de formularios */
const Validador = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  PASSWORD_MIN: 8,

  requerido: (valor) => valor.trim().length > 0,
  esEmailValido(valor) { return this.EMAIL_REGEX.test(valor.trim()); },

  evaluarPassword(password) {
    if (password.length < this.PASSWORD_MIN) {
      return { nivel: "debil", mensaje: "Muy corta (mínimo 8 caracteres)" };
    }
    const tieneUpper = /[A-Z]/.test(password);
    const tieneLower = /[a-z]/.test(password);
    const tieneNumero = /\d/.test(password);
    const tieneEspecial = /[^A-Za-z0-9]/.test(password);
    const puntos = [tieneUpper, tieneLower, tieneNumero, tieneEspecial].filter(Boolean).length;
    
    if (puntos <= 2) return { nivel: "media", mensaje: "Media — añade mayúsculas, números y símbolos" };
    return { nivel: "fuerte", mensaje: "¡Contraseña segura! ✓" };
  },

  validarAgregarProducto() {
    const ids = ["prodNombre", "prodPrecio", "prodCategoria", "prodDesc"];
    ErrorManager.limpiarTodos(ids);
    let valido = true;

    const nombre = $("prodNombre")?.value || "";
    const precio = $("prodPrecio")?.value || "";
    const categoria = $("prodCategoria")?.value || "";
    const desc = $("prodDesc")?.value || "";

    if (!this.requerido(nombre)) { ErrorManager.mostrarError("prodNombre", "El nombre es obligatorio."); valido = false; }
    if (!this.requerido(precio) || isNaN(Number(precio)) || Number(precio) <= 0) {
      ErrorManager.mostrarError("prodPrecio", "Ingresa un precio válido mayor a 0."); valido = false;
    }
    if (!this.requerido(categoria)) { ErrorManager.mostrarError("prodCategoria", "Selecciona una categoría."); valido = false; }
    if (!this.requerido(desc)) { ErrorManager.mostrarError("prodDesc", "La descripción es obligatoria."); valido = false; }

    return valido;
  },

  validarRegistro() {
    const ids = ["regNombre", "regEmail", "regPassword", "regPasswordConfirm"];
    ErrorManager.limpiarTodos(ids);
    let valido = true;

    const nombre = $("regNombre")?.value || "";
    const email = $("regEmail")?.value || "";
    const password = $("regPassword")?.value || "";
    const confirm = $("regPasswordConfirm")?.value || "";

    if (!this.requerido(nombre)) { ErrorManager.mostrarError("regNombre", "El nombre es obligatorio."); valido = false; }
    if (!this.esEmailValido(email)) { ErrorManager.mostrarError("regEmail", "Ingresa un correo electrónico válido."); valido = false; }

    const eval_ = this.evaluarPassword(password);
    if (eval_.nivel === "debil") { ErrorManager.mostrarError("regPassword", eval_.mensaje); valido = false; }
    if (password !== confirm) { ErrorManager.mostrarError("regPasswordConfirm", "Las contraseñas no coinciden."); valido = false; }

    return valido;
  }
};

/** Vista detallada del producto (Modal) */
const Modal = {
  abrir(producto) {
    const overlay = $("modalOverlay");
    const body = $("modalBody");
    if (!overlay || !body) return;

    body.innerHTML = `
      <div class="modal__image-container">
        <img src="${producto.imagen}" alt="${escapeHTML(producto.nombre)}" class="modal__img">
      </div>
      <span class="product-card__cat">${escapeHTML(producto.categoria)}</span>
      <h2 class="modal__title" id="modalTitle">${escapeHTML(producto.nombre)}</h2>
      <p class="modal__desc">${escapeHTML(producto.descripcion)}</p>
      <p class="modal__price">${formatearPrecio(producto.precio)}</p>
      <button class="btn-primary btn-full modal__add" data-id="${producto.id}">Añadir al carrito</button>`;

    overlay.classList.add("visible");
    overlay.setAttribute("aria-hidden", "false");
    $("productModal")?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  },

  cerrar() {
    const overlay = $("modalOverlay");
    if (!overlay) return;
    overlay.classList.remove("visible");
    overlay.setAttribute("aria-hidden", "true");
    $("productModal")?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
};

/** Drawer lateral para el Carrito */
const CartDrawer = {
  abrir() {
    $("cartDrawer")?.classList.add("open");
    $("cartOverlay")?.classList.add("visible");
    $("cartDrawer")?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  },

  cerrar() {
    $("cartDrawer")?.classList.remove("open");
    $("cartOverlay")?.classList.remove("visible");
    $("cartDrawer")?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
};

/* ============================================================
   4. MANEJADORES DE EVENTOS
   ============================================================ */

/** Manejador global delegado de clics (Criterio 2.1.1) */
const manejarClick = (e) => {
  const target = e.target;

  // Botón del filtro
  if (target.classList.contains("filter-btn")) {
    Catalogo.aplicarFiltro(target.dataset.filter);
    return;
  }

  // Botón añadir desde tarjeta
  if (target.classList.contains("btn-add")) {
    const producto = Catalogo.buscarPorId(parseInt(target.dataset.id, 10));
    if (producto) Carrito.agregar(producto);
    return;
  }

  // Botón añadir desde modal
  if (target.classList.contains("modal__add")) {
    const producto = Catalogo.buscarPorId(parseInt(target.dataset.id, 10));
    if (producto) { Carrito.agregar(producto); Modal.cerrar(); }
    return;
  }

  // Detalle de producto (clic en tarjeta)
  const tarjeta = target.closest(".product-card");
  if (tarjeta && !target.classList.contains("btn-add")) {
    const producto = Catalogo.buscarPorId(parseInt(tarjeta.dataset.id, 10));
    if (producto) Modal.abrir(producto);
    return;
  }

  // Abrir y Cerrar Carrito
  if (target.closest("#cartBtn")) { CartDrawer.abrir(); return; }
  if (target.closest("#closeCart") || target.closest("#cartOverlay")) { CartDrawer.cerrar(); return; }

  // Eliminar ítem
  if (target.classList.contains("btn-remove")) {
    Carrito.eliminar(parseInt(target.dataset.id, 10));
    return;
  }

  // Cerrar Modal
  if (target.closest("#closeModal") || target.id === "modalOverlay") { Modal.cerrar(); return; }

  // Toggle Tema
  if (target.closest("#themeToggle")) { Tema.alternar(); return; }

  // Envío formularios
  if (target.id === "addProductBtn") { manejarAgregarProducto(); return; }
  if (target.id === "registerBtn") { manejarRegistro(); return; }

  // Toggle contraseña
  if (target.id === "togglePassword") {
    const input = $("regPassword");
    if (input) input.type = input.type === "password" ? "text" : "password";
    return;
  }

  // Checkout simulado
  if (target.id === "checkoutBtn") {
    if (carrito.length === 0) { Toast.mostrar("Tu carrito está vacío.", "error"); return; }
    Toast.mostrar("Procesando pago (demo)... 🎉", "success");
    setTimeout(() => { Carrito.vaciar(); CartDrawer.cerrar(); }, 1500);
    return;
  }
};

/** Manejador global de eventos de teclado (Escape y Enter en tarjetas) */
const manejarTeclado = (e) => {
  if (e.key === "Escape") {
    Modal.cerrar();
    CartDrawer.cerrar();
    return;
  }

  if (e.key === "Enter") {
    const tarjeta = e.target.closest(".product-card");
    if (tarjeta) {
      const producto = Catalogo.buscarPorId(parseInt(tarjeta.dataset.id, 10));
      if (producto) Modal.abrir(producto);
    }
  }
};

/** Maneja la creación e inserción de nuevos productos en el DOM */
const manejarAgregarProducto = () => {
  if (!Validador.validarAgregarProducto()) return;

  const nombre = escapeHTML($("prodNombre").value.trim());
  const precio = Number($("prodPrecio").value);
  const categoria = $("prodCategoria").value;
  const desc = escapeHTML($("prodDesc").value.trim());
  const imagen = $("prodImagen").value.trim() || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop";

  const nuevoProducto = { id: nextId++, nombre, precio, categoria, descripcion: desc, imagen };

  Catalogo.agregarProducto(nuevoProducto);
  Toast.mostrar(`Producto "${nombre}" agregado con éxito. ✓`, "success");

  // Limpiar campos
  ["prodNombre", "prodPrecio", "prodCategoria", "prodDesc", "prodImagen"].forEach(id => {
    const el = $(id);
    if (el) el.value = "";
  });
};

/** Maneja el formulario de registro de usuario */
const manejarRegistro = () => {
  if (!Validador.validarRegistro()) return;
  
  const nombre = $("regNombre").value.trim();
  Toast.mostrar(`¡Bienvenido/a, ${escapeHTML(nombre)}! Cuenta creada. ✓`, "success");
  
  ["regNombre", "regEmail", "regPassword", "regPasswordConfirm"].forEach(id => {
    const el = $(id);
    if (el) el.value = "";
  });
  
  const strContainer = $("passwordStrength");
  if (strContainer) strContainer.innerHTML = "";
};

/** Fuerza la comprobación de fortaleza de la contraseña */
const actualizarFortaleza = debounce(() => {
  const valor = $("regPassword")?.value || "";
  const container = $("passwordStrength");
  if (!container) return;
  if (!valor) { container.innerHTML = ""; return; }
  
  const { nivel, mensaje } = Validador.evaluarPassword(valor);
  container.innerHTML = `<span class="strength strength--${nivel}">${escapeHTML(mensaje)}</span>`;
}, 150);

/* ============================================================
   5. INICIALIZACIÓN
   ============================================================ */

const inicializar = () => {
  // Suscripción de eventos delegados en el documento
  document.addEventListener("click", manejarClick);
  document.addEventListener("keydown", manejarTeclado);
  
  // Limpieza en tiempo real de errores al ingresar datos
  document.addEventListener("input", e => {
    if (e.target.id) ErrorManager.limpiarError(e.target.id);
  });

  $("regPassword")?.addEventListener("input", actualizarFortaleza);

  // Scroll interactivo para el header logo
  document.querySelector(".header__logo")?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  // Inicializar estados
  Tema.inicializar();
  Catalogo.renderizar();
  Carrito.renderizar();

  console.info("🔥 Fogón & Arte iniciado correctamente (Simplificado y Optimizado).");
};

// Arrancar cuando el DOM esté completamente cargado
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializar);
} else {
  inicializar();
}
