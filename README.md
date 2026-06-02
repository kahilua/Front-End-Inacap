# Fogón & Arte — Tienda de Cocina (Proyecto Front-End)

Aplicación web interactiva desarrollada para la **Segunda Evaluación de Programación Front-End (Inacap)**. Es un catálogo digital dinámico que utiliza HTML5 semántico, CSS3 moderno y JavaScript Vanilla optimizado.

---

## 📂 Estructura del Proyecto

La versión definitiva y funcional reside en la carpeta `PFE/`. El archivo `index.html` en la raíz redirige automáticamente a ella:

```text
├── index.html               # Redirección automática de conveniencia a PFE/
├── README.md                # Bitácora de Prompts e IA Log (este archivo)
├── Evaluación 2-...docx     # Pauta y rúbrica de evaluación oficial
└── PFE/                     # Carpeta de producción
    ├── index.html           # Estructura HTML5 semántica
    ├── styles.css           # Estilos CSS y modo oscuro
    └── index.js             # Lógica y manipulación del DOM
```

---

## 📝 Bitácora de Prompts (IA Log)

En línea con las rúbricas de la evaluación, a continuación se detallan los prompts clave utilizados para el diseño, validación y optimización del código:

### 1. Estructura de Datos y Arreglos (Criterio 2.1.3)
- **Prompt**: *"¿Cómo modelar un catálogo de productos en JS Vanilla para filtrar por categoría, buscar por ID y calcular totales de forma eficiente?"*
- **Sugerencia de IA**: Utilizar un **arreglo plano de objetos** de producto, manipulándolo mediante métodos avanzados (`.filter()`, `.map()`, `.find()`, `.reduce()`).
- **Justificación**: Se eliminó la estructura redundante de categorías, optimizando las búsquedas y eliminando bucles `for` tradicionales.

### 2. Validación de Formularios y Seguridad (Criterio 2.1.2)
- **Prompt**: *"¿Cómo validar formularios de usuario y producto del lado del cliente, asegurando la integridad de datos y previniendo XSS?"*
- **Sugerencia de IA**: Crear un objeto `Validador` con expresiones de formato, usar `textContent` para notificaciones y una función `escapeHTML` para limpiar textos dinámicos antes de insertarlos al DOM.
- **Justificación**: Protege la aplicación contra inyección de scripts maliciosos (XSS) y mejora la accesibilidad con feedback en tiempo real (`aria-invalid`).

### 3. Manipulación del DOM y Eventos (Criterio 2.1.1)
- **Prompt**: *"¿Cómo escuchar eventos de clics (filtros, añadir al carrito, modales, tema oscuro) sin saturar el DOM con listeners?"*
- **Sugerencia de IA**: Implementar **Delegación de Eventos** registrando un solo listener en `document` y usando `e.target.closest()` para identificar la acción.
- **Justificación**: Reduce drásticamente el uso de memoria y evita re-vincular listeners al regenerar el HTML.

### 4. Modularidad y Buenas Prácticas (Criterio 2.1.4)
- **Prompt**: *"¿Cómo simplificar un archivo JS extenso manteniendo la modularidad por responsabilidades y aplicando DRY?"*
- **Sugerencia de IA**: Reemplazar IIFEs anidadas por **objetos literales planos** (namespaces) y crear helpers cortos para selección DOM (`$` y `$$`).
- **Justificación**: Simplificó la lectura eliminando anidaciones innecesarias, redujo más de 30 selectores redundantes y organizó el código bajo responsabilidad única.

---

## 💬 Prompts y Reflexión Inicial del Estudiante

- **Prompts de revisión**:
  - *"Revisa los archivos adjuntos en base a la seguridad de la manipulación y almacenamiento de los datos obtenidos de los usuarios."*
  - *"Comprueba la eficiencia de la estructura de los datos que se almacenan en la página y marca lo que podría ser mejorado."*
  - *"Chequea que las imágenes y la adición de productos funcione y que no existan bucles que causen error."*
- **Reflexión**: El uso de herramientas de IA permite validar que el desarrollo cumpla con estándares de optimización y seguridad actuales, garantizando un código limpio, seguro y eficiente.
