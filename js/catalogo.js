const catalogo = [
  {
    title: "Gabinete Crystal Black RGB E-ATX Vidrio Templado USB 3.0",
    brand: "Crystal Black",
    code: "001",
    description: "Diseño elegante con panel lateral de vidrio templado, excelente flujo de aire y espacio optimizado para configuraciones de alto rendimiento.",
    image: "img/001.png",
    price: 49990
  }, {
    title: "Audífonos Dual Blade 7.1 USB RGB",
    brand: "Dual Blade",
    code: "002",
    description: "Sonido envolvente, micrófono con cancelación de ruido y diseño ergonómico para largas sesiones de juego con máxima inmersión.",
    image: "img/002.png",
    price: 29990
  }, {
    title: "Teclado Gamer Kronos",
    brand: "Kronos Gaming",
    code: "003",
    description: "Formato compacto sin pad numérico, retroiluminación RGB y switches mecánicos para precisión y velocidad en cada partida.",
    image: "img/003.png",
    price: 19990
  }, {
    title: "Silla Gamer Argo 180°",
    brand: "Argo",
    code: "004",
    description: "Elección perfecta para gamers, streamers y profesionales que buscan ergonomía y estilo. Con materiales premium y ajustes avanzados, esta silla te brindará soporte durante largas horas de uso.",
    image: "img/004.webp",
    price: 129990
  }, {
    title: "Escritorio Mesa Gamer Griffin",
    brand: "Griffin",
    code: "005",
    description: "Está diseñado para gamers y profesionales que exigen resistencia, espacio inteligente y un estilo agresivo. Con un tablero de 120cm x 60cm y 75cm de altura, ofrece el equilibrio perfecto entre amplitud y ergonomía.",
    image: "img/005.webp",
    price: 69990
  }, {
    title: "Micrófono Profesional Mistral",
    brand: "Mistral",
    code: "006",
    description: "Captura de voz nítida con condensador de alta sensibilidad, iluminación RGB personalizable y diseño ideal para streaming, podcasting o gaming.",
    image: "img/006.jpg",
    price: 39990
  }];

// ==================== Variables globales ====================
const cart = [];
const productList = document.getElementById('product-list');
const cartItems = document.getElementById('cart-items');
const cartSummary = document.getElementById('cart-summary'); // nombre corregido

// ==================== Renderizar productos ====================
function renderProducts(catalogo) {
  catalogo.forEach((product, index) => {
    const productCard = document.createElement('div');
    productCard.className = 'col';
    productCard.innerHTML = `
      <div class="card h-100">
        <img src="${product.image}" class="card-img-top" alt="${product.title}">
        <div class="card-body">
          <h5 class="card-title">${product.title}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${product.brand}</h6>
          <h6 class="card-subtitle mb-2 text-muted">Código: #${product.code}</h6>
          <p class="card-text">${product.description}</p>
        </div>
        <div class="card-footer bg-transparent border-0">
          <h4 class="card-subtitle mb-2">Precio: $${product.price}</h4>
          <input type="number" id="qty-${index}" class="form-control mb-2" placeholder="Cantidad" min="1">
          <input type="checkbox" class="btn-check" id="chk-${index}" autocomplete="off">
          <label class="btn btn-outline-primary mb-4" for="chk-${index}">Agregar al carrito</label>
          <button class="btn btn-primary w-100 bg-1" onclick="addToCart(${index})">Agregar</button>
        </div>
      </div>`;
    productList.appendChild(productCard);
  })
};

//Renderiza y filtra
renderProducts(catalogo);
filtroProductos();

//Filtra productos
function filtroProductos() {
  const input = document.getElementById('filtroProductos');
  if (!input) return;

  const aplicarFiltro = () => {
    const termino = input.value.trim().toLowerCase();

    // Si está vacío, mostrar todo el catálogo
    if (termino === '') {
      productList.innerHTML = '';
      renderProducts(catalogo);
      return;
    }

    const productosFiltrados = catalogo.filter(producto => {
      return (
        producto.title.toLowerCase().includes(termino) ||
        producto.brand.toLowerCase().includes(termino) ||
        producto.code.toLowerCase().includes(termino) ||
        producto.description.toLowerCase().includes(termino)
      );
    });

    // Limpiar contenedor y renderizar resultados
    productList.innerHTML = '';
    if (productosFiltrados.length > 0) {
      renderProducts(productosFiltrados);
    } else {
      productList.innerHTML = '<div class="col text-center text-muted py-4">No se encontraron productos.</div>';
    }
  };
  // Filtrado en vivo
  input.addEventListener('input', aplicarFiltro);
}

// ==================== Función: Agregar al carrito ====================
function addToCart(index) {
  const checkbox = document.getElementById(`chk-${index}`);
  const qtyInput = document.getElementById(`qty-${index}`);
  const quantity = parseInt(qtyInput.value);

  if (!checkbox.checked || quantity <= 0 || isNaN(quantity)) {
    alert('Selecciona una cantidad válida y marca el producto antes de agregar.');
    return;
  }

  const product = catalogo[index];
  const existingProduct = cart.find(item => item.code === product.code);

  if (existingProduct) {
    existingProduct.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }

  qtyInput.value = '';
  checkbox.checked = false;
  renderCart();
}

// ==================== Función: Eliminar del carrito ====================
function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

// ==================== Función: Renderizar carrito ====================
function renderCart() {
  if (cart.length === 0) {
    cartItems.innerHTML = '<p>El carrito está vacío.</p>';
    cartSummary.innerHTML = '';
    return;
  }

  let tableHtml = `
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Nombre</th><th>Cantidad</th><th>Valor</th><th>Total</th><th>Acción</th>
        </tr>
      </thead>
      <tbody>`;

  cart.forEach((product, index) => {
    tableHtml += `
      <tr>
        <td>${product.title}</td>
        <td>${product.quantity}</td>
        <td>${product.price}</td>
        <td>${(product.price * product.quantity).toLocaleString()}</td>
        <td><button class="btn btn-danger" onclick="removeFromCart(${index})">Eliminar</button></td>
      </tr>`;
  });

  tableHtml += '</tbody></table>';

  // Botón vaciar carrito
  tableHtml += `
    <div class="text-end mt-3">
      <button class="btn btn-danger" onclick="clearCart()">Vaciar carrito</button>
    </div>
  `;

  cartItems.innerHTML = tableHtml;
  calculateTotals();
}

// ==================== Función: Vaciar carrito ====================
function clearCart() {
  if (cart.length === 0) {
    alert("El carrito ya está vacío.");
    return;
  }

  if (confirm("¿Seguro que quieres vaciar el carrito?")) {
    cart.length = 0; // vacía el array
    renderCart();    // actualiza tabla y resumen
  }
}

// ==================== Función: Calcular Totales ====================
function calculateTotals() {
  const neto = cart.reduce((total, product) => total + (product.price * product.quantity), 0);
  const iva = neto * 0.19;
  let total = neto + iva;
  const despacho = total > 100000 ? total * 0.05 : 0;
  total += despacho;

  cartSummary.innerHTML = `
    <p><strong>Valor neto:</strong> ${neto.toLocaleString()}.-</p>
    <p><strong>IVA 19%:</strong> ${iva.toLocaleString()}.-</p>
    ${despacho > 0 ? `<p><strong>Despacho:</strong> ${despacho.toLocaleString()}.-</p>` : ''}
    <p><strong>Valor Total:</strong> ${total.toLocaleString()}.-</p>`;
}

// ==================== Formulario: Generar boleta ====================
document.getElementById('formCompra').addEventListener('submit', function (e) {
  e.preventDefault();
  if (cart.length === 0) {
    alert('Tu carrito está vacío. Agrega productos antes de confirmar.');
    return;
  }

  let htmlDetalle = '<h4>Detalle de Productos</h4><ul class="list-group">';
  let totalNeto = 0;

  cart.forEach(item => {
    const totalItem = item.price * item.quantity;
    totalNeto += totalItem;
    htmlDetalle += `<li class="list-group-item">${item.code} - ${item.title}: $${item.price} x ${item.quantity} = $${totalItem}</li>`;
  });

  htmlDetalle += '</ul>';
  document.getElementById('detalleProductos').innerHTML = htmlDetalle;

  const impuesto = totalNeto * 0.19;
  const totalBruto = totalNeto + impuesto;

  document.getElementById('resumenCompra').innerHTML = `
    <h4>Resumen</h4>
    <p><strong>Monto Neto:</strong> $${totalNeto.toLocaleString()}</p>
    <p><strong>IVA (19%):</strong> $${impuesto.toLocaleString()}</p>
    <p><strong>Total Bruto:</strong> $${totalBruto.toLocaleString()}</p>
  `;

  const nombre = document.getElementById('nombre').value;
  const direccion = document.getElementById('direccion').value;
  const comuna = document.getElementById('comuna').value;
  const region = document.getElementById('region').value;
  const correo = document.getElementById('correo').value;

  document.getElementById('infoDespacho').innerHTML = `
    <h4>Datos del Despacho</h4>
    <p><strong>Nombre:</strong> ${nombre}</p>
    <p><strong>Dirección:</strong> ${direccion}, ${comuna}, ${region}</p>
    <p><strong>Email:</strong> ${correo}</p>
  `;

  document.getElementById('boleta').style.display = 'block';

  alert('Compra confirmada. Se enviará una copia de la boleta al correo.');
});