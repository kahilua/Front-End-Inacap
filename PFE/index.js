/**
 * Fogón & Arte — Tienda de Cocina
 * Archivo: index.js
 * Patrón: módulos IIFE, funciones de responsabilidad única,
 *         manejo de errores centralizado, objetos/arrays para entidades.
 */

"use strict";

/* ============================================================
   1. DATOS / ENTIDADES DEL SISTEMA
   ============================================================ */

/** @typedef {{ id: number, nombre: string, precio: number, categoria: string, descripcion: string, imagen: string }} Producto */

const categorias = {
  cuchillos: [
    { id: 1,  nombre: "Cuchillo Santoku",       precio: 49990, categoria: "cuchillos", descripcion: "Hoja de acero japonés 18 cm, ideal para cortes precisos de verduras y proteínas.", imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/180mm_santoku_%28top-down_view%29.jpg/960px-180mm_santoku_%28top-down_view%29.jpg" },
    { id: 2,  nombre: "Cuchillo de Chef 20cm",  precio: 64990, categoria: "cuchillos", descripcion: "Acero inoxidable forjado, mango ergonómico de madera de pakka.", imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Chef%27s_knife.jpg/960px-Chef%27s_knife.jpg" },
    { id: 3,  nombre: "Cuchillo de Pan",        precio: 29990, categoria: "cuchillos", descripcion: "Hoja serrada de 22 cm, corte limpio sin aplastes.", imagen: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Broodmes.jpg" },
  ],
  ollas: [
    { id: 4,  nombre: "Olla Le Fonte 24 cm",    precio: 69990, categoria: "ollas", descripcion: "Hierro fundido esmaltado, distribución uniforme del calor. Apta para todos los fuegos.", imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Lamb-stew.jpg/960px-Lamb-stew.jpg" },
    { id: 5,  nombre: "Cacerola Antiadherente", precio: 44990,  categoria: "ollas", descripcion: "Revestimiento cerámico libre de PFOA, base de aluminio prensado.", imagen: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Pfanne_%28Edelstahl%29.jpg" },
    { id: 6,  nombre: "Wok de Acero Carbono",   precio: 39990,  categoria: "ollas", descripcion: "Seasoning natural, apto para cocina de alta temperatura y fuego abierto.", imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Wok_cooking.jpg/960px-Wok_cooking.jpg" },
  ],
  accesorios: [
    { id: 7,  nombre: "Tabla de Corte Bambú",   precio: 19990, categoria: "accesorios", descripcion: "Bambú orgánico extra grueso (3 cm), con ranura colectora de jugos.", imagen: "https://www.ikea.com/cl/es/images/products/laemplig-tabla-para-picar-bambu__0711757_pe728449_s5.jpg?f=m" },
    { id: 8,  nombre: "Set Espátulas Silicona",  precio: 3990, categoria: "accesorios", descripcion: "Pack de 3 piezas resistentes a 230°C, sin BPA.", imagen: "https://m.media-amazon.com/images/I/61n6rRPOIAL._AC_SL1500_.jpg" },
    { id: 9,  nombre: "Termómetro Digital",      precio: 9990,  categoria: "accesorios", descripcion: "Lectura en 2 segundos, rango -50°C a 300°C. Ideal para carnes y repostería.", imagen: "https://m.media-amazon.com/images/I/81VHvUqgC1L._AC_SL1500_.jpg" },
  ],
};

/** Todos los productos aplanados para búsqueda y renderizado */
let todosLosProductos = [
  ...categorias.cuchillos,
  ...categorias.ollas,
  ...categorias.accesorios,
];

/** Carrito como arreglo independiente */
let carrito = [];

/** Contador de IDs para nuevos productos */
let nextId = todosLosProductos.reduce((max, p) => Math.max(max, p.id), 0) + 1;

/* ============================================================
   2. UTILIDADES / HELPERS
   ============================================================ */

/**
 * Formatea un número como precio en CLP.
 * @param {number} valor
 * @returns {string}
 */
const formatearPrecio = (valor) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(valor);

/**
 * Escapa caracteres HTML para prevenir XSS.
 * @param {string} str
 * @returns {string}
 */
const escapeHTML = (str) =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/**
 * Limita la frecuencia de ejecución de una función.
 * @param {Function} fn
 * @param {number} ms
 * @returns {Function}
 */
const debounce = (fn, ms = 200) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

/* ============================================================
   3. MANEJO CENTRALIZADO DE ERRORES
   ============================================================ */

const ErrorManager = (() => {
  /**
   * Muestra un error en un campo de formulario.
   * @param {string} fieldId
   * @param {string} mensaje
   */
  const mostrarError = (fieldId, mensaje) => {
    const el = document.getElementById(`err-${fieldId}`);
    const input = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);
    if (el) { el.textContent = mensaje; el.classList.add("visible"); }
    if (input) { input.classList.add("input-error"); input.setAttribute("aria-invalid", "true"); }
  };

  /**
   * Limpia el error de un campo.
   * @param {string} fieldId
   */
  const limpiarError = (fieldId) => {
    const el = document.getElementById(`err-${fieldId}`);
    const input = document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);
    if (el) { el.textContent = ""; el.classList.remove("visible"); }
    if (input) { input.classList.remove("input-error"); input.removeAttribute("aria-invalid"); }
  };

  /** Limpia todos los errores de un formulario. */
  const limpiarTodos = (ids) => ids.forEach(limpiarError);

  return { mostrarError, limpiarError, limpiarTodos };
})();

/* ============================================================
   4. TOAST — NOTIFICACIONES
   ============================================================ */

const Toast = (() => {
  let timer;
  const el = () => document.getElementById("toast");

  /**
   * Muestra una notificación temporal.
   * @param {string} mensaje
   * @param {'success'|'error'|'info'} tipo
   */
  const mostrar = (mensaje, tipo = "success") => {
    const toast = el();
    if (!toast) return;
    clearTimeout(timer);
    toast.textContent = escapeHTML(mensaje);
    toast.className = `toast toast--${tipo} toast--visible`;
    timer = setTimeout(() => toast.classList.remove("toast--visible"), 3000);
  };

  return { mostrar };
})();

/* ============================================================
   5. MÓDULO: CATÁLOGO / PRODUCTOS
   ============================================================ */

const Catalogo = (() => {
  let filtroActivo = "todos";

  /** Obtiene productos según filtro activo. */
  const obtenerProductosFiltrados = () =>
    filtroActivo === "todos"
      ? todosLosProductos
      : todosLosProductos.filter((p) => p.categoria === filtroActivo);

  /**
   * Construye el HTML de una tarjeta de producto.
   * @param {Producto} producto
   * @returns {string}
   */
  const construirTarjeta = (producto) => `
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

  /** Renderiza la grilla de productos. */
  const renderizar = () => {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;
    const productos = obtenerProductosFiltrados();
    if (productos.length === 0) {
      grid.innerHTML = `<p class="empty-state">No hay productos en esta categoría.</p>`;
      return;
    }
    grid.innerHTML = productos.map(construirTarjeta).join("");
  };

  /** Aplica el filtro y re-renderiza. */
  const aplicarFiltro = (categoria) => {
    filtroActivo = categoria;
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === categoria);
    });
    renderizar();
  };

  /**
   * Agrega un nuevo producto al catálogo y re-renderiza.
   * @param {Producto} producto
   */
  const agregarProducto = (producto) => {
    if (!categorias[producto.categoria]) categorias[producto.categoria] = [];
    categorias[producto.categoria].push(producto);
    todosLosProductos = [...todosLosProductos, producto];
    renderizar();
  };

  /**
   * Busca producto por ID.
   * @param {number} id
   * @returns {Producto|undefined}
   */
  const buscarPorId = (id) => todosLosProductos.find((p) => p.id === id);

  return { renderizar, aplicarFiltro, agregarProducto, buscarPorId };
})();

/* ============================================================
   6. MÓDULO: CARRITO
   ============================================================ */

const Carrito = (() => {
  /** Calcula el total del carrito. */
  const calcularTotal = () =>
    carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  /** Actualiza el badge del carrito. */
  const actualizarBadge = () => {
    const badge = document.getElementById("cartBadge");
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    if (badge) badge.textContent = total;
  };

  /**
   * Construye el HTML de un ítem del carrito.
   * @param {{ id:number, nombre:string, precio:number, cantidad:number, imagen:string }} item
   * @returns {string}
   */
  const construirItem = (item) => `
    <li class="cart-item" data-id="${item.id}">
      <img src="${item.imagen}" alt="" class="cart-item__img" aria-hidden="true">
      <div class="cart-item__info">
        <span class="cart-item__name">${escapeHTML(item.nombre)}</span>
        <span class="cart-item__price">${formatearPrecio(item.precio)} × ${item.cantidad}</span>
      </div>
      <button class="btn-remove" data-id="${item.id}" aria-label="Eliminar ${escapeHTML(item.nombre)} del carrito">✕</button>
    </li>`;

  /** Renderiza la lista del carrito y el total. */
  const renderizar = () => {
    const list = document.getElementById("cartList");
    const totalEl = document.getElementById("cartTotal");
    if (!list || !totalEl) return;
    if (carrito.length === 0) {
      list.innerHTML = `<li class="cart-empty">Tu carrito está vacío.</li>`;
    } else {
      list.innerHTML = carrito.map(construirItem).join("");
    }
    totalEl.textContent = formatearPrecio(calcularTotal());
    actualizarBadge();
  };

  /**
   * Añade un producto al carrito. Si ya existe, incrementa cantidad.
   * @param {Producto} producto
   */
  const agregar = (producto) => {
    const existente = carrito.find((i) => i.id === producto.id);
    if (existente) {
      existente.cantidad += 1;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }
    renderizar();
    Toast.mostrar(`"${producto.nombre}" añadido al carrito`, "success");
  };

  /**
   * Elimina un ítem del carrito por ID.
   * @param {number} id
   */
  const eliminar = (id) => {
    const idx = carrito.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const nombre = carrito[idx].nombre;
    carrito.splice(idx, 1);
    renderizar();
    Toast.mostrar(`"${nombre}" eliminado del carrito.`, "info");
  };

  /** Vacía el carrito. */
  const vaciar = () => {
    carrito.length = 0;
    renderizar();
  };

  return { agregar, eliminar, vaciar, renderizar };
})();

/* ============================================================
   7. MÓDULO: TEMA (CLARO / OSCURO)
   ============================================================ */

const Tema = (() => {
  const KEY = "fogon_tema";

  /** Aplica el tema al documento. */
  const aplicar = (tema) => {
    document.body.setAttribute("data-theme", tema);
    const icon = document.getElementById("themeIcon");
    if (icon) {
      icon.innerHTML = tema === "dark" 
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    }
    try { localStorage.setItem(KEY, tema); } catch (_) { /* sin acceso a storage */ }
  };

  /** Alterna entre claro y oscuro. */
  const alternar = () => {
    const actual = document.body.getAttribute("data-theme") || "light";
    aplicar(actual === "light" ? "dark" : "light");
  };

  /** Inicializa el tema desde preferencias guardadas o del sistema. */
  const inicializar = () => {
    let guardado = null;
    try { guardado = localStorage.getItem(KEY); } catch (_) { /* sin acceso */ }
    const preferencia = guardado || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    aplicar(preferencia);
  };

  return { alternar, inicializar };
})();

/* ============================================================
   8. MÓDULO: VALIDACIÓN DE FORMULARIOS
   ============================================================ */

const Validador = (() => {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PASSWORD_MIN = 8;

  /** Valida que un campo no esté vacío. */
  const requerido = (valor) => valor.trim().length > 0;

  /** Valida formato de correo electrónico. */
  const esEmailValido = (valor) => EMAIL_REGEX.test(valor.trim());

  /**
   * Evalúa la fortaleza de una contraseña.
   * @param {string} password
   * @returns {{ nivel: 'debil'|'media'|'fuerte', mensaje: string }}
   */
  const evaluarPassword = (password) => {
    if (password.length < PASSWORD_MIN) return { nivel: "debil", mensaje: "Muy corta (mínimo 8 caracteres)" };
    const tieneUpper = /[A-Z]/.test(password);
    const tieneLower = /[a-z]/.test(password);
    const tieneNumero = /\d/.test(password);
    const tieneEspecial = /[^A-Za-z0-9]/.test(password);
    const puntos = [tieneUpper, tieneLower, tieneNumero, tieneEspecial].filter(Boolean).length;
    if (puntos <= 2) return { nivel: "media", mensaje: "Media — añade mayúsculas, números y símbolos" };
    return { nivel: "fuerte", mensaje: "¡Contraseña segura! ✓" };
  };

  /**
   * Valida el formulario de agregar producto.
   * @returns {boolean}
   */
  const validarAgregarProducto = () => {
    const ids = ["prodNombre", "prodPrecio", "prodCategoria", "prodDesc"];
    ErrorManager.limpiarTodos(ids);
    let valido = true;

    const nombre = document.getElementById("prodNombre")?.value || "";
    const precio = document.getElementById("prodPrecio")?.value || "";
    const categoria = document.getElementById("prodCategoria")?.value || "";
    const desc = document.getElementById("prodDesc")?.value || "";

    if (!requerido(nombre)) { ErrorManager.mostrarError("prodNombre", "El nombre es obligatorio."); valido = false; }
    if (!requerido(precio) || isNaN(Number(precio)) || Number(precio) <= 0) {
      ErrorManager.mostrarError("prodPrecio", "Ingresa un precio válido mayor a 0."); valido = false;
    }
    if (!requerido(categoria)) { ErrorManager.mostrarError("prodCategoria", "Selecciona una categoría."); valido = false; }
    if (!requerido(desc)) { ErrorManager.mostrarError("prodDesc", "La descripción es obligatoria."); valido = false; }

    return valido;
  };

  /**
   * Valida el formulario de registro.
   * @returns {boolean}
   */
  const validarRegistro = () => {
    const ids = ["regNombre", "regEmail", "regPassword", "regPasswordConfirm"];
    ErrorManager.limpiarTodos(ids);
    let valido = true;

    const nombre   = document.getElementById("regNombre")?.value || "";
    const email    = document.getElementById("regEmail")?.value || "";
    const password = document.getElementById("regPassword")?.value || "";
    const confirm  = document.getElementById("regPasswordConfirm")?.value || "";

    if (!requerido(nombre)) { ErrorManager.mostrarError("regNombre", "El nombre es obligatorio."); valido = false; }
    if (!esEmailValido(email)) { ErrorManager.mostrarError("regEmail", "Ingresa un correo electrónico válido."); valido = false; }

    const eval_ = evaluarPassword(password);
    if (eval_.nivel === "debil") { ErrorManager.mostrarError("regPassword", eval_.mensaje); valido = false; }
    if (password !== confirm) { ErrorManager.mostrarError("regPasswordConfirm", "Las contraseñas no coinciden."); valido = false; }

    return valido;
  };

  return { validarAgregarProducto, validarRegistro, evaluarPassword };
})();

/* ============================================================
   9. MÓDULO: MODAL
   ============================================================ */

const Modal = (() => {
  /** Abre el modal con el detalle de un producto. */
  const abrir = (producto) => {
    const overlay = document.getElementById("modalOverlay");
    const body = document.getElementById("modalBody");
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
    document.getElementById("productModal")?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  /** Cierra el modal. */
  const cerrar = () => {
    const overlay = document.getElementById("modalOverlay");
    if (!overlay) return;
    overlay.classList.remove("visible");
    overlay.setAttribute("aria-hidden", "true");
    document.getElementById("productModal")?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  return { abrir, cerrar };
})();

/* ============================================================
   10. MÓDULO: CARRITO DRAWER
   ============================================================ */

const CartDrawer = (() => {
  /** Abre el panel lateral del carrito. */
  const abrir = () => {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartOverlay");
    drawer?.classList.add("open");
    overlay?.classList.add("visible");
    drawer?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  /** Cierra el panel lateral del carrito. */
  const cerrar = () => {
    const drawer = document.getElementById("cartDrawer");
    const overlay = document.getElementById("cartOverlay");
    drawer?.classList.remove("open");
    overlay?.classList.remove("visible");
    drawer?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  return { abrir, cerrar };
})();

/* ============================================================
   11. MANEJADORES DE EVENTOS — CLICKS
   ============================================================ */

/** Manejador delegado para el documento completo. */
const manejarClick = (e) => {
  const target = e.target;

  // Filtros de categoría
  if (target.classList.contains("filter-btn")) {
    Catalogo.aplicarFiltro(target.dataset.filter);
    return;
  }

  // Botón añadir al carrito (tarjeta)
  if (target.classList.contains("btn-add")) {
    const id = parseInt(target.dataset.id, 10);
    const producto = Catalogo.buscarPorId(id);
    if (producto) Carrito.agregar(producto);
    return;
  }

  // Botón añadir al carrito (modal)
  if (target.classList.contains("modal__add")) {
    const id = parseInt(target.dataset.id, 10);
    const producto = Catalogo.buscarPorId(id);
    if (producto) { Carrito.agregar(producto); Modal.cerrar(); }
    return;
  }

  // Abrir detalle de producto (clic en tarjeta)
  const tarjeta = target.closest(".product-card");
  if (tarjeta && !target.classList.contains("btn-add")) {
    const id = parseInt(tarjeta.dataset.id, 10);
    const producto = Catalogo.buscarPorId(id);
    if (producto) Modal.abrir(producto);
    return;
  }

  // Abrir/cerrar carrito
  if (target.closest("#cartBtn")) { CartDrawer.abrir(); return; }
  if (target.closest("#closeCart")) { CartDrawer.cerrar(); return; }
  if (target.closest("#cartOverlay")) { CartDrawer.cerrar(); return; }

  // Eliminar ítem del carrito
  if (target.classList.contains("btn-remove")) {
    const id = parseInt(target.dataset.id, 10);
    Carrito.eliminar(id);
    return;
  }

  // Cerrar modal
  if (target.closest("#closeModal") || target.id === "modalOverlay") { Modal.cerrar(); return; }

  // Toggle tema
  if (target.closest("#themeToggle")) { Tema.alternar(); return; }

  // Agregar producto
  if (target.id === "addProductBtn") { manejarAgregarProducto(); return; }

  // Registro
  if (target.id === "registerBtn") { manejarRegistro(); return; }

  // Ver pago (demo)
  if (target.id === "checkoutBtn") {
    if (carrito.length === 0) { Toast.mostrar("Tu carrito está vacío.", "error"); return; }
    Toast.mostrar("Procesando pago (demo)... 🎉", "success");
    setTimeout(() => { Carrito.vaciar(); CartDrawer.cerrar(); }, 1500);
    return;
  }

  // Toggle ver contraseña
  if (target.id === "togglePassword") { manejarTogglePassword(); return; }
};

/* ============================================================
   12. MANEJADORES DE EVENTOS — TECLADO
   ============================================================ */

/** Maneja pulsaciones globales de teclado. */
const manejarTeclado = (e) => {
  // Escape cierra modales y carrito
  if (e.key === "Escape") {
    Modal.cerrar();
    CartDrawer.cerrar();
    return;
  }

  // Enter en tarjeta de producto abre el modal
  if (e.key === "Enter") {
    const tarjeta = e.target.closest(".product-card");
    if (tarjeta) {
      const id = parseInt(tarjeta.dataset.id, 10);
      const producto = Catalogo.buscarPorId(id);
      if (producto) Modal.abrir(producto);
    }
  }
};

/* ============================================================
   13. ACCIONES DE FORMULARIOS
   ============================================================ */

/** Procesa el formulario de agregar producto. */
const manejarAgregarProducto = () => {
  if (!Validador.validarAgregarProducto()) return;

  const nombre    = escapeHTML(document.getElementById("prodNombre").value.trim());
  const precio    = Number(document.getElementById("prodPrecio").value);
  const categoria = document.getElementById("prodCategoria").value;
  const desc      = escapeHTML(document.getElementById("prodDesc").value.trim());
  const imagen    = document.getElementById("prodImagen").value.trim() || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop";

  /** @type {Producto} */
  const nuevoProducto = { id: nextId++, nombre, precio, categoria, descripcion: desc, imagen };

  Catalogo.agregarProducto(nuevoProducto);
  Toast.mostrar(`Producto "${nombre}" agregado con éxito. ✓`, "success");

  // Limpiar formulario
  ["prodNombre", "prodPrecio", "prodCategoria", "prodDesc", "prodEmoji"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
};

/** Procesa el formulario de registro. */
const manejarRegistro = () => {
  if (!Validador.validarRegistro()) return;
  const nombre = document.getElementById("regNombre").value.trim();
  Toast.mostrar(`¡Bienvenido/a, ${escapeHTML(nombre)}! Cuenta creada. ✓`, "success");
  ["regNombre", "regEmail", "regPassword", "regPasswordConfirm"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("passwordStrength").textContent = "";
};

/** Alterna la visibilidad de la contraseña. */
const manejarTogglePassword = () => {
  const input = document.getElementById("regPassword");
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
};

/* ============================================================
   14. FEEDBACK EN TIEMPO REAL — CONTRASEÑA
   ============================================================ */

/** Actualiza el indicador de fortaleza al escribir la contraseña. */
const actualizarFortaleza = debounce(() => {
  const valor = document.getElementById("regPassword")?.value || "";
  const container = document.getElementById("passwordStrength");
  if (!container) return;
  if (!valor) { container.innerHTML = ""; return; }
  const { nivel, mensaje } = Validador.evaluarPassword(valor);
  container.innerHTML = `<span class="strength strength--${nivel}">${escapeHTML(mensaje)}</span>`;
}, 150);

/** Limpia en tiempo real el error de un campo al escribir. */
const limpiarErrorAlEscribir = (e) => {
  const id = e.target.id;
  if (id) ErrorManager.limpiarError(id);
};

/* ============================================================
   15. INICIALIZACIÓN
   ============================================================ */

const inicializar = () => {
  // Eventos globales
  document.addEventListener("click", manejarClick);
  document.addEventListener("keydown", manejarTeclado);

  // Feedback en formularios
  document.addEventListener("input", limpiarErrorAlEscribir);
  document.getElementById("regPassword")?.addEventListener("input", actualizarFortaleza);

  // Scroll suave al logo
  document.querySelector(".header__logo")?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );

  // Inicializar tema
  Tema.inicializar();

  // Renderizar catálogo inicial
  Catalogo.renderizar();

  // Renderizar carrito vacío
  Carrito.renderizar();

  console.info("🔥 Fogón & Arte iniciado correctamente.");
};

// Arrancar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializar);
} else {
  inicializar();
}
