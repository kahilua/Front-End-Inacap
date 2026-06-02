# Fogón & Arte — Tienda de Cocina (Proyecto Front-End)

Este proyecto es una aplicación web interactiva desarrollada para la **Segunda Evaluación del curso Programación Front-End (Inacap)**. Representa un catálogo digital dinámico para una tienda de artículos culinarios premium ("Fogón & Arte"), construido utilizando HTML5 semántico, CSS3 moderno y JavaScript Vanilla optimizado.

## Prompts utilizados para revisión del proyecto
- Revisa los archivos adjuntos en base a la seguridad de la manipulación y almacenamiento de los datos obtenidos de los usuarios.
- Comprueba la eficiencia de la estructura de los datos que se almacenan en la página y marca lo que podría ser mejorado y como se pueda mejorar.
- Checkea que las imagenes y la adición de productos funcione y que no existan posibles loops los cuales puedan causar un error en la página.

## Reflexión de los prompts
- Al tener un recurso tan potente como es la IA nos sirve para validar que lo que hemos trabajado cumpla con los estandares de optimización y seguridad
  actuales, logrando así obtener un producto final limpio y eficiente para presentar a posibles clientes.
---

## 📂 Estructura Limpia del Proyecto

El repositorio ha sido depurado de archivos obsoletos. La versión definitiva y funcional reside en la carpeta `PFE/`, y el archivo `index.html` en la raíz redirige automáticamente a ella:

```text
├── index.html               # Redirección automática de conveniencia en la raíz
├── README.md                # Esta documentación y Bitácora de Prompts (IA Log)
├── Evaluación 2-...docx     # Pauta y rúbrica de evaluación oficial
└── PFE/                     # Directorio contenedor del código de producción
    ├── index.html           # Estructura HTML5 semántica y accesible
    ├── styles.css           # Estilos premium, variables CSS, transiciones y modo oscuro
    └── index.js             # Lógica de la aplicación, manipulación del DOM y validaciones
```

---

## 🚀 Características Principales y Rúbricas Logradas

1. **Manipulación Dinámica del DOM (Criterio 2.1.1)**: Creación de tarjetas de producto en base al estado, filtrado instantáneo por categorías sin recarga, adición/remoción interactiva de ítems del carrito de compras y sincronización del total.
2. **Validación de Formularios e Integridad (Criterio 2.1.2)**: Validaciones en tiempo real y al enviar, soporte visual accesible de errores (atributos `aria-invalid`) y medidas contra inyección de scripts maliciosos (XSS) mediante escape de caracteres de entrada.
3. **Estructuras de Datos Eficientes (Criterio 2.1.3)**: Representación de entidades mediante objetos descriptivos y arreglos planos manipulados a través de métodos modernos de alto orden (`.map()`, `.filter()`, `.reduce()`, `.find()`, `.findIndex()`).
4. **Modularidad y DRY (Criterio 2.1.4)**: Organización limpia mediante namespaces u objetos planos con responsabilidades específicas (`ErrorManager`, `Toast`, `Catalogo`, `Carrito`, `Tema`, `Validador`, `Modal`, `CartDrawer`), evitando código duplicado y estructurando funciones reutilizables.

---

## 📝 Bitácora de Prompt Engineering (IA Log)

Para la construcción de este proyecto se utilizó un flujo interactivo de co-creación con Inteligencia Artificial. A continuación se presentan los prompts clave utilizados, qué devolvió la IA y la justificación de su adopción técnica con respecto a las rúbricas evaluadas.

---

### 1. Gestión de Datos con Arreglos y Objetos (Criterio 2.1.3)

* **Prompt Utilizado**:
  > *"Tengo un listado de productos de cocina con atributos como nombre, precio, categoría, descripción e imagen. ¿Cómo me sugieres modelar estos datos en JavaScript Vanilla y qué métodos de arreglos modernos son los más adecuados y eficientes para un catálogo web donde el usuario puede filtrar por categorías, buscar productos por ID y calcular un carrito de compras acumulando precios?"*

* **Lo que devolvió la IA**:
  La IA recomendó representar cada producto como un **objeto plano** y agruparlos en un único **arreglo plano** (`todosLosProductos`). Sugirió descartar ciclos `for` tradicionales y estructurar la lógica con los siguientes métodos avanzados:
  - `.filter()`: para filtrar productos por la categoría seleccionada por el usuario.
  - `.map()`: para transformar los objetos de producto en cadenas de marcado HTML dinámicas.
  - `.find()`: para localizar rápidamente un producto específico mediante su ID al agregarlo al carrito.
  - `.reduce()`: para totalizar la suma monetaria acumulada y contar el número total de unidades en el carrito de compras.

* **Justificación y Adopción**:
  Adoptamos un arreglo plano inicial. Esto simplificó enormemente el código al no requerir la sincronización manual de un objeto agrupado (como `categorias.ollas` o `categorias.cuchillos`) cuando el usuario agrega un nuevo producto. El uso de `.map()` y `.filter()` eliminó los bucles tradicionales anidados, lo que redujo la propensión a errores de índices y mejoró la legibilidad y rendimiento general del código.

---

### 2. Validación de Formularios y Seguridad XSS (Criterio 2.1.2)

* **Prompt Utilizado**:
  > *"Necesito validar dos formularios en el lado del cliente usando JavaScript: uno para registrar usuarios (validar nombre obligatorio, email con formato correcto, y fuerza de contraseña con mínimo 8 caracteres) y otro para agregar nuevos productos. Además, quiero prevenir ataques XSS si el usuario intenta inyectar código html en el nombre o descripción del producto al renderizarlo en el catálogo dinámico. ¿Cómo estructuro esto de forma limpia y accesible?"*

* **Lo que devolvió la IA**:
  La IA sugirió construir un objeto `Validador` especializado que encapsule expresiones regulares para correos electrónicos (`/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`) y una función para comprobar la complejidad de la clave (retornando niveles: debil, media, fuerte). Con respecto a la seguridad y accesibilidad sugirió:
  - La creación de una función helper `escapeHTML` que reemplace caracteres especiales (`&`, `<`, `>`, `"`, `'`) con sus entidades seguras de HTML antes de concatenar plantillas.
  - El uso de atributos `aria-invalid="true"` para indicar a lectores de pantalla qué campos del formulario fallaron en la validación.
  - El uso de `textContent` en lugar de `innerHTML` al mostrar mensajes de error sencillos (como notificaciones Toast), garantizando que el navegador los interprete como texto plano y no ejecute scripts maliciosos.

* **Justificación y Adopción**:
  Se implementó la función `escapeHTML` en la renderización dinámica del catálogo y modales. Esto asegura que si un usuario ingresa `<script>alert('xss')</script>` en el formulario de creación de producto, el navegador lo renderice de forma segura e inocua como texto legible, evitando cualquier inyección de código. Adicionalmente, los mensajes de error se sincronizan visualmente mediante clases CSS y semánticamente mediante los atributos `aria-invalid`.

---

### 3. Modificación Dinámica del DOM y Eventos (Criterio 2.1.1)

* **Prompt Utilizado**:
  > *"¿Cuál es la mejor práctica en JavaScript Vanilla para manejar múltiples clics en la interfaz (como añadir al carrito, eliminar del carrito, abrir modales de detalle de productos y alternar el tema oscuro) sin saturar el DOM con decenas de event listeners individuales?"*

* **Lo que devolvió la IA**:
  La IA aconsejó implementar **Delegación de Eventos** registrando un único manejador de clics en el objeto raíz `document` (`document.addEventListener("click", manejarClick)`). Dentro de este manejador, se lee la propiedad `e.target` y se usan métodos de coincidencia como `classList.contains()` o `closest()` para detectar en qué botón u elemento interactivo se hizo clic, delegando la acción correspondiente al módulo adecuado.

* **Justificación y Adopción**:
  La delegación de eventos reduce drásticamente el consumo de memoria del navegador y elimina la necesidad de volver a enlazar escuchas de eventos (listeners) cada vez que se regenera o altera el HTML del catálogo de productos. El código quedó centralizado en `manejarClick`, facilitando la depuración de flujos de usuario (como abrir o cerrar el modal/drawer del carrito y actualizar datos en caliente).

---

### 4. Organización del Código y Modularidad (Criterio 2.1.4)

* **Prompt Utilizado**:
  > *"Tengo un archivo javascript de casi 700 líneas organizado en módulos cerrados IIFE. Hace que el código esté muy anidado y a veces redundante. ¿Cómo puedo simplificarlo y aplanarlo en JavaScript moderno manteniendo la modularidad por responsabilidades (como Catalogo, Carrito, Tema, Validador) y aplicando el principio DRY?"*

* **Lo que devolvió la IA**:
  Sugerencias de optimización:
  - Declarar espacios de nombres estructurados como **objetos literales planos** (`const Carrito = { ... }`) en lugar de IIFEs anidados. Esto mantiene la encapsulación y organización temática sin añadir la complejidad sintáctica de closures anónimos.
  - Definir funciones auxiliares de selección corta (helpers alias `$` y `$$`) para encapsular las llamadas repetitivas a `document.getElementById` y `document.querySelectorAll`.
  - Aplicar el principio de responsabilidad única: que cada función realice exactamente una tarea (por ejemplo, `actualizarBadge()` solo cuenta y dibuja la burbuja del carrito; `renderizar()` solo dibuja la lista).

* **Justificación y Adopción**:
  Adoptamos la transformación a objetos directos. Al implementar los helpers `$` y `$$`, logramos reducir la extensión visual del código JavaScript y eliminamos más de 30 llamadas redundantes de selección de elementos. Cada módulo quedó plano y legible, facilitando la comprensión técnica del código durante la defensa oral de la evaluación.
