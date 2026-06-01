document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modalCliente");
    const nombreCliente = document.getElementById("nombreCliente");
    const mensajeBienvenida = document.getElementById("mensajeBienvenida");
    const btnGuardar = document.getElementById("btnGuardarCliente");

    let nombre = localStorage.getItem("nombre");
    let apellido = localStorage.getItem("apellido");

    // Si ya hay datos guardados, mostrarlos y ocultar modal
    if (nombre && apellido) {
        nombreCliente.textContent = `${nombre} ${apellido}`;
        mensajeBienvenida.textContent = `¡Bienvenido/a ${nombre} ${apellido}!`;
        modal.classList.add("oculto");
    }

    // Guardar datos cuando el usuario haga clic
    btnGuardar.addEventListener("click", () => {
        const nombreInput = document.getElementById("inputNombre").value.trim();
        const apellidoInput = document.getElementById("inputApellido").value.trim();

        if (nombreInput && apellidoInput) {
            localStorage.setItem("nombre", nombreInput);
            localStorage.setItem("apellido", apellidoInput);

            nombreCliente.textContent = `Cliente: ${nombreInput} ${apellidoInput}`;
            mensajeBienvenida.textContent = `¡Bienvenido/a ${nombreInput} ${apellidoInput}!`;

            modal.classList.add("oculto");
        } else {
            alert("Por favor complete ambos campos");
        }
    });
});

