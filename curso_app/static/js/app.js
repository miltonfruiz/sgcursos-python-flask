//--------------------------------- Importación de Funciones ------------------------------//

//-------------------------------------- Captura de ID's ----------------------------------//

const formCurso = document.getElementById("form-curso");
const formEstudiante = document.getElementById("form-estudiante");
const edadEstudiante = document.getElementById("edad-estudiante");
const notaEstudiante = document.getElementById("nota-estudiante");
const cursoEstudianteSelect = document.getElementById("curso-estudiante");
const listaCursos = document.getElementById("lista-cursos");
const nombreCurso = document.getElementById("nombre-curso");
const formularioEdicion = document.getElementById("formulario-edicion");
const nuevoNombreCurso = document.getElementById("nuevo-nombre-curso");
const nuevoNombreProfesor = document.getElementById("nuevo-nombre-profesor");
const profesorCurso = document.getElementById("profesor-curso");
const guardarEdicion = document.getElementById("guardar-edicion");
const cancelarEdicion = document.getElementById("cancelar-edicion");
const nombreEstudiante = document.getElementById("nombre-estudiante");
const busquedaIngresada = document.getElementById("busqueda-ingresada");
const filtroEstudiantes = document.getElementById("filtro-estudiantes");
const mensajeConfirmacion = document.getElementById("mensaje-confirmacion");
const modalConfirmacion = document.getElementById("modal-confirmacion");
const botonConfirmar = document.getElementById("btn-confirmar");
const botonCancelar = document.getElementById("btn-cancelar");
const listaEstudiantesEdicion = document.getElementById(
  "lista-estudiantes-edicion"
);
const cancelarEdicionEstudiante = document.getElementById(
  "cancelar-edicion-estudiante"
);
const formEdicionEstudiante = document.getElementById(
  "formulario-edicion-estudiante"
);
const nombreEstudianteEditar = document.getElementById(
  "nombre-estudiante-editar"
);
const edadEstudianteEditar = document.getElementById("edad-estudiante-editar");
const notaEstudianteEditar = document.getElementById("nota-estudiante-editar");
const guardarEdicionEstudiante = document.getElementById(
  "guardar-edicion-estudiante"
);
const graficaCanvas = document.getElementById("graficaEstudiantes");
const totalEstudiantesElem = document.getElementById("total-estudiantes");
const promedioGeneralElem = document.getElementById("promedio-general");
const totalCursosElem = document.getElementById("total-cursos");
const mejorCursoElem = document.getElementById("mejor-curso");
const botonEmpezar = document.getElementById("boton-empezar");
const botonArriba = document.getElementById("boton-arriba");
const valoracionForm = document.getElementById("valoracion-form");

//------------------------------------ Clase Estudiante -----------------------------------//

class Estudiante {
  constructor(nombre, edad, nota) {
    this.nombre = nombre;
    this.edad = edad;
    this.nota = nota;
  }

  presentarse() {
    return `${this.nombre} (${this.edad} años) - Nota: ${this.nota}`;
  }
}
//-------------------------------------- Clase Curso --------------------------------------//

class Curso {
  constructor(nombre, profesor) {
    this.nombre = nombre;
    this.profesor = profesor;
    this.estudiantes = [];
  }

  agregarEstudiante(estudiante) {
    this.estudiantes.push(estudiante);
  }

  listarEstudiantes() {
    return this.estudiantes.map((est) => est.presentarse()).join("<br>");
  }

  obtenerPromedio() {
    const totalNotas = this.estudiantes.reduce(
      (total, est) => total + est.nota,
      0
    );
    return this.estudiantes.length > 0
      ? (totalNotas / this.estudiantes.length).toFixed(2)
      : "N/A";
  }
}
//------------------------------------ Arreglo y Variables  -------------------------------//

let cursos = [];
let cursoActual = null;
let estudiantesEliminadosTemporalmente = [];
let estudiantesOriginales = [];

//-------------------------------- * Funciones especiales * --------------------------------//

//--- Convertir primera letra Mayuscula ---//
function primeraMayuscula(nombreCompleto) {
  return nombreCompleto
    .split(" ")
    .map(
      (palabra) =>
        palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()
    )
    .join(" ");
}
//--- Mostrar mensaje de creado ---//
function mostrarMensaje(mensaje, tipo) {
  const mensajeDiv = document.createElement("div");
  mensajeDiv.textContent = mensaje;
  mensajeDiv.className = `mensaje ${tipo}`;
  document.body.appendChild(mensajeDiv);
  setTimeout(() => {
    mensajeDiv.classList.add("mostrar");
  }, 10);
  setTimeout(() => {
    mensajeDiv.classList.add("oculto");
    setTimeout(() => {
      mensajeDiv.remove();
    }, 2000);
  }, 3000);
}
//--- Validar Cadena ---//
function cadenaValida(cadena) {
  return (
    typeof cadena === "string" && cadena.trim() !== "" && !/\d/.test(cadena)
  );
}
// --- Exportar datos en archivo JSON ---//
function exportarDatosAJson() {
  const data = JSON.stringify(cursos, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cursos.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("exportar-json")
    .addEventListener("click", exportarDatosAJson);
});
//--- Actualizar select en Cursos ---//
function actualizarCursosSelect() {
  cursoEstudianteSelect.innerHTML = "";
  cursos.forEach((curso, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = curso.nombre;
    cursoEstudianteSelect.appendChild(option);
  });
}
// --- Mostrar tabla de Cursos y Estudiantes ---//
let tablaModificada = false;
function mostrarCursos(busqueda = "") {
  listaCursos.innerHTML = "";
  const tabla = document.createElement("table");
  tabla.classList.add("tabla-cursos");
  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Curso</th>
        <th>Profesor</th>
        <th>Promedio</th>
        <th>Estudiante</th>
        <th>Edad</th>
        <th>Nota</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
  `;
  let resultadosEncontrados = false;
  cursos.forEach((curso) => {
    const coincideBusquedaCurso = curso.nombre
      ?.toLowerCase()
      .includes(busqueda.toLowerCase());
    const coincideBusquedaProfesor = curso.profesor
      ?.toLowerCase()
      .includes(busqueda.toLowerCase());
    const estudiantesFiltrados = Array.isArray(curso.estudiantes)
      ? curso.estudiantes.filter((est) =>
          est.nombre.toLowerCase().includes(busqueda.toLowerCase())
        )
      : [];
    if (
      coincideBusquedaCurso ||
      coincideBusquedaProfesor ||
      estudiantesFiltrados.length > 0
    ) {
      resultadosEncontrados = true;
      const estudiantesAMostrar =
        estudiantesFiltrados.length > 0
          ? estudiantesFiltrados
          : Array.isArray(curso.estudiantes)
          ? curso.estudiantes
          : [];
      if (ordenarPorEdad) {
        estudiantesAMostrar.sort((a, b) => a.edad - b.edad);
      } else if (ordenarPorNota) {
        estudiantesAMostrar.sort((a, b) => a.nota - b.nota);
      } else if (ordenarPorNombre) {
        estudiantesAMostrar.sort((a, b) => a.nombre.localeCompare(b.nombre));
      }
      const cantidadEstudiantes = estudiantesAMostrar.length;
      const filaCurso = document.createElement("tr");
      filaCurso.classList.add("fade-in");
      filaCurso.innerHTML = `
        <td class="celda-verde" rowspan="${cantidadEstudiantes || 1}">${
        curso.nombre || "N/A"
      }</td>
        <td class="celda-verde" rowspan="${cantidadEstudiantes || 1}">${
        curso.profesor || "N/A"
      }</td>
        <td class="celda-verde ${
          cantidadEstudiantes > 0 ? "" : "celda-roja"
        }" rowspan="${cantidadEstudiantes || 1}">${
        curso.obtenerPromedio ? curso.obtenerPromedio() : "N/A"
      }</td>
        <td class="celda-verde ${
          cantidadEstudiantes > 0 ? "" : "celda-roja"
        }">${
        cantidadEstudiantes > 0
          ? estudiantesAMostrar[0]?.nombre || "N/A"
          : "No hay estudiantes"
      }</td>
        <td class="celda-verde ${
          cantidadEstudiantes > 0 ? "" : "celda-roja"
        }">${
        cantidadEstudiantes > 0 ? estudiantesAMostrar[0]?.edad || "N/A" : "N/A"
      }</td>
        <td class="celda-verde ${
          cantidadEstudiantes > 0 ? "" : "celda-roja"
        }">${
        cantidadEstudiantes > 0 ? estudiantesAMostrar[0]?.nota || "N/A" : "N/A"
      }</td>
        <td class="td-contenedor-botones" rowspan="${
          cantidadEstudiantes || 1
        }"> 
          <div class="botones-acciones">
            <button title="Boton Editar" id="boton-editar-curso" class="editar-curso btn btn-warning boton-editar-curso" 
              data-bs-toggle="modal" data-bs-target="#formulario-edicion" nombre="${
                curso.nombre
              }">
              <i class="fa-regular fa-pen-to-square"></i><span class="texto-editar-curso">Editar</span>
            </button>
            <button title="Boton Eliminar" class="btn btn-danger boton-eliminar-curso" 
              data-bs-toggle="modal" data-bs-target="#modal-confirmacion" id="boton-eliminar-curso">
              <i class="fa-solid fa-trash"></i> <span class="texto-eliminar-curso">Eliminar</span>
            </button>
          </div>
        </td>
      `;
      tabla.querySelector("tbody").appendChild(filaCurso);
      filaCurso.querySelector(".boton-editar-curso").classList.add("visible");
      filaCurso.querySelector(".boton-eliminar-curso").classList.add("visible");
      estudiantesAMostrar.forEach((est, index) => {
        if (index > 0) {
          const filaEstudiante = document.createElement("tr");
          filaEstudiante.classList.add("fade-in");
          filaEstudiante.innerHTML = `
            <td class="celda-verde">${est.nombre || "N/A"}</td>
            <td class="celda-verde">${est.edad || "N/A"}</td>
            <td class="celda-verde">${est.nota || "N/A"}</td>
          `;
          tabla.querySelector("tbody").appendChild(filaEstudiante);
        }
      });
    }
  });
  if (!resultadosEncontrados) {
    const filaVacía = document.createElement("tr");
    filaVacía.classList.add("fade-in");
    filaVacía.innerHTML = `
      <td colspan="7">No se encontraron resultados</td>
    `;
    tabla.querySelector("tbody").appendChild(filaVacía);
  }
  listaCursos.appendChild(tabla);
}
//--- Editar Curso ---//
function editarCurso(
  nombreCursoAntiguo,
  nuevoNombreCurso,
  nuevoNombreProfesor
) {
  const indice = cursos.findIndex(
    (curso) => curso.nombre.toLowerCase() === nombreCursoAntiguo.toLowerCase()
  );
  if (indice !== -1) {
    cursos[indice].nombre = nuevoNombreCurso;
    cursos[indice].profesor = nuevoNombreProfesor;
    actualizarCursosSelect();
  }
}
//--- Listar de Estudiantes a Editar / Eliminar ---//
let estudianteTemporal = null;
function mostrarEstudiantes() {
  const listaEstudiantesEdicion = document.getElementById(
    "lista-estudiantes-edicion"
  );
  listaEstudiantesEdicion.innerHTML = "";
  if (!cursoActual || !Array.isArray(cursoActual.estudiantes)) {
    listaEstudiantesEdicion.innerHTML =
      "<p>Error: No se puede mostrar la lista de estudiantes.</p>";
    return;
  }
  if (cursoActual.estudiantes.length === 0) {
    listaEstudiantesEdicion.innerHTML =
      "<p>No hay estudiantes en este curso.</p>";
    return;
  }
  const tablaEstudiantes = document.createElement("table");
  tablaEstudiantes.classList.add("table", "tabla-estudiante");
  tablaEstudiantes.innerHTML = `
    <thead>
      <tr>
        <th class="bg-body-tertiary">Nombre</th>
        <th class="bg-body-tertiary">Edad</th>
        <th class="bg-body-tertiary">Nota</th>
        <th class="bg-body-tertiary">Acciones</th>
      </tr>
    </thead>
    <tbody>
  `;
  cursoActual.estudiantes.forEach((estudiante, index) => {
    if (!estudiante.id) {
      estudiante.id = index + 1;
    }
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${estudiante.nombre}</td>
      <td>${estudiante.edad}</td>
      <td>${estudiante.nota}</td>
      <td>
        <button title="Boton Editar" class="btn btn-warning boton-editar-estudiante" id="boton-editar-estudiante" data-id="${estudiante.id}">
          <i class="fa-regular fa-pen-to-square"></i> <span class="texto-editar-estudiante">Editar</span>
        </button>
        <button title="Boton Eliminar" class="btn btn-danger boton-eliminar-estudiante" id="boton-eliminar-estudiante" data-id="${estudiante.id}">
          <i class="fa-solid fa-trash"></i> <span class="texto-eliminar-estudiante">Eliminar</span>
        </button>
      </td>
    `;
    tablaEstudiantes.querySelector("tbody").appendChild(fila);
  });
  listaEstudiantesEdicion.appendChild(tablaEstudiantes);
  const botonesEditar = document.querySelectorAll(".boton-editar-estudiante");
  botonesEditar.forEach((boton) => {
    boton.addEventListener("click", function () {
      const index = boton.getAttribute("data-id");
      const estudiante = cursoActual.estudiantes.find((est) => est.id == index);
      if (!estudiante) {
        mostrarMensaje(
          "No se pudo encontrar al estudiante seleccionado.",
          "error"
        );
        return;
      }

      estudianteTemporal = { ...estudiante };
      document.getElementById("nombre-estudiante-editar").value =
        estudiante.nombre;
      document.getElementById("edad-estudiante-editar").value = estudiante.edad;
      document.getElementById("nota-estudiante-editar").value = estudiante.nota;
    });
  });
}
//--- Cargar datos desde localStorage al cargar la página ---//
document.addEventListener("DOMContentLoaded", () => {
  const cursosGuardados = JSON.parse(localStorage.getItem("cursos")) || [];
  if (Array.isArray(cursosGuardados)) {
    cursos = cursosGuardados
      .map((curso) => {
        if (!curso.nombre || !curso.profesor) return null;
        const estudiantes = Array.isArray(curso.estudiantes)
          ? curso.estudiantes
          : [];
        const nuevoCurso = new Curso(curso.nombre, curso.profesor);
        estudiantes.forEach((est) => {
          if (
            est.nombre &&
            typeof est.edad === "number" &&
            typeof est.nota === "number"
          ) {
            nuevoCurso.agregarEstudiante(
              new Estudiante(est.nombre, est.edad, est.nota)
            );
          }
        });
        return nuevoCurso;
      })
      .filter(Boolean);
  }
  mostrarCursos();
  actualizarCursosSelect();
  document.getElementById("formulario-edicion-estudiante").style.display =
    "none";
});
//--- Guardar en localStorage ---//
function guardarDatos() {
  localStorage.setItem("cursos", JSON.stringify(cursos));
}
//--- Función para calcular estadísticas ---//
function calcularEstadisticas() {
  let totalEstudiantes = 0;
  let sumaNotas = 0;
  let totalCursos = cursos.length;
  let mejorCurso = null;
  let mejorPromedio = 0;
  cursos.forEach((curso) => {
    const estudiantes = Array.isArray(curso.estudiantes)
      ? curso.estudiantes
      : [];
    totalEstudiantes += estudiantes.length;
    const promedioCurso = curso.obtenerPromedio?.();
    if (promedioCurso && promedioCurso !== "N/A") {
      const promedioNum = parseFloat(promedioCurso);
      sumaNotas += estudiantes.reduce((total, estudiante) => {
        return total + (estudiante.nota || 0);
      }, 0);
      if (promedioNum > mejorPromedio) {
        mejorPromedio = promedioNum;
        mejorCurso = curso.nombre || "Sin nombre";
      }
    }
  });
  const promedioGeneral =
    totalEstudiantes > 0 ? (sumaNotas / totalEstudiantes).toFixed(2) : "N/A";
  return { totalEstudiantes, promedioGeneral, totalCursos, mejorCurso };
}
//--- Función para actualizar estadísticas en el DOM ---//
function actualizarEstadisticas() {
  const { totalEstudiantes, promedioGeneral, totalCursos, mejorCurso } =
    calcularEstadisticas();
  const totalEstudiantesElem = document.getElementById("totalEstudiantes");
  const promedioGeneralElem = document.getElementById("promedioGeneral");
  const totalCursosElem = document.getElementById("totalCursos");
  const mejorCursoElem = document.getElementById("mejorCurso");
  if (totalEstudiantesElem) totalEstudiantesElem.textContent = totalEstudiantes;
  if (promedioGeneralElem) promedioGeneralElem.textContent = promedioGeneral;
  if (totalCursosElem) totalCursosElem.textContent = totalCursos;
  if (mejorCursoElem) mejorCursoElem.textContent = mejorCurso || "N/A";
}
//--- Cargar y actualizar gráfica ---//
let graficaEstudiantesInstance = null;
function cargarGrafica() {
  const graficaCanvas = document.getElementById("graficaEstudiantes");
  const { totalEstudiantes, promedioGeneral, totalCursos, mejorCurso } =
    calcularEstadisticas();
  totalEstudiantesElem.textContent = totalEstudiantes;
  promedioGeneralElem.textContent = promedioGeneral;
  totalCursosElem.textContent = totalCursos;
  mejorCursoElem.textContent = mejorCurso || "N/A";
  const ctx = graficaCanvas.getContext("2d");
  if (graficaEstudiantesInstance) {
    graficaEstudiantesInstance.destroy();
  }
  graficaEstudiantesInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Total de Estudiantes", "Promedio General", "Total de Cursos"],
      datasets: [
        {
          label: "Estadísticas",
          data: [totalEstudiantes, promedioGeneral, totalCursos],
          backgroundColor: ["#36a2eb", "#ff6384", "#ffce56"],
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Estadísticas de Estudiantes",
        },
      },
      animation: {
        duration: 2000,
        easing: "easeOutQuart",
      },
    },
  });
  graficaCanvas.style.display = "block";
}
//--- Mostrar estadísticas y gestionar IntersectionObserver ---//
document.addEventListener("DOMContentLoaded", () => {
  const contenedorGrafica = document.getElementById("contenedor-grafica");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          contenedorGrafica.classList.add("visible");
          cargarGrafica();
        }
      });
    },
    { threshold: 0.5 }
  );
  observer.observe(contenedorGrafica);
});
//----------------------------------- * Eventos para Curso * -------------------------------//

//--- Agregar curso ---//
formCurso.addEventListener("submit", async (e) => {
  e.preventDefault();
  const cursoCorregido = primeraMayuscula(nombreCurso.value);
  const profesorCorregido = primeraMayuscula(profesorCurso.value);
  try {
    const response = await fetch("https://sgcursos.vercel.app/api/cursos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: cursoCorregido,
        profesor: profesorCorregido,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      mostrarMensaje(data.mensaje, data.tipo);
      return;
    }
    cursos.push(new Curso(cursoCorregido, profesorCorregido));
    mostrarMensaje(`¡Curso "${data.curso.nombre}" agregado!`, data.tipo);
    formCurso.reset();
    actualizarCursosSelect();
    mostrarCursos();
    guardarDatos();
  } catch (error) {
    mostrarMensaje("Error al conectar con el servidor.", "error");
    console.error("Error:", error);
  }
});
//--- Guardar curso ---//
guardarEdicion.addEventListener("click", async () => {
  if (nuevoNombreCurso.value && nuevoNombreProfesor.value) {
    try {
      const nuevoNombre = primeraMayuscula(nuevoNombreCurso.value.trim());
      const nuevoProfesor = primeraMayuscula(nuevoNombreProfesor.value.trim());
      camposModificados =
        nuevoNombre !== cursoActual.nombre ||
        nuevoProfesor !== cursoActual.profesor;
      const response = await fetch(
        `https://sgcursos.vercel.app/api/cursos/${encodeURIComponent(
          cursoActual.nombre
        )}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: nuevoNombre,
            profesor: nuevoProfesor,
          }),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        mostrarMensaje(data.mensaje, data.tipo || "error");
        return;
      }
      const data = await response.json();
      if (estudianteAEliminar) {
        try {
          const deleteResponse = await fetch(
            `https://sgcursos.vercel.app/api/estudiantes/${estudianteAEliminar}`,
            { method: "DELETE" }
          );
          const deleteData = await deleteResponse.json();
          if (deleteResponse.ok) {
            cursoActual.estudiantes = cursoActual.estudiantes.filter(
              (est) => est.id !== estudianteAEliminar
            );
            mostrarEstudiantes();
            mostrarMensaje(
              deleteData.mensaje || "Estudiante eliminado.",
              "success"
            );
            estudiantesModificados = true;
          } else {
            mostrarMensaje(
              deleteData.mensaje || "Error al eliminar estudiante.",
              "error"
            );
          }
        } catch (error) {
          console.error(
            "Error al eliminar estudiante de la base de datos:",
            error
          );
          mostrarMensaje(
            "Error al eliminar estudiante de la base de datos.",
            "error"
          );
        } finally {
          estudianteAEliminar = null;
        }
      }
      if (tablaModificada) {
        const ahora = new Date();
        const fecha = ahora.toLocaleDateString("es-ES", { dateStyle: "short" });
        const horas = ahora.getHours().toString().padStart(2, "0");
        const minutos = ahora.getMinutes().toString().padStart(2, "0");
        const horaFormateada = `${horas}:${minutos}`;
        const fechaFormateada = `${fecha} ${horaFormateada}`;
        localStorage.setItem("ultimaActualizacion", fechaFormateada);
        const ultimaActualizacion = document.getElementById(
          "ultima-actualizacion"
        );
        if (ultimaActualizacion) {
          ultimaActualizacion.innerHTML = `<i class="fa-solid fa-calendar-days"></i> * Última actualización de datos: ${fechaFormateada}`;
        }
        tablaModificada = false;
      }
      editarCurso(cursoActual.nombre, nuevoNombre, nuevoProfesor);
      guardarDatos();
      if (camposModificados || estudiantesModificados) {
        mostrarMensaje(`¡Curso "${nuevoNombre}" editado!`, "success");
      }
      tablaModificada = false;
      camposModificados = false;
      estudiantesModificados = false;
      mostrarCursos();
      actualizarCursosSelect();
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("formulario-edicion")
      );
      modal.hide();
    } catch (error) {
      mostrarMensaje("Error al conectar con el servidor.", "error");
      console.error("Error:", error);
    }
  } else {
    alert("Por favor, completa todos los campos antes de guardar.");
  }
});
//--- Eliminar curso ---//
listaCursos.addEventListener("click", async (e) => {
  if (e.target.id === "boton-eliminar-curso") {
    const cursoNombre = e.target
      .closest("tr")
      .querySelector("td")
      .textContent.trim()
      .toLowerCase();
    mensajeConfirmacion.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> 
    ¿Estás seguro de que deseas eliminar el curso "<strong>${cursoNombre}</strong>"? 
    <i class="fa-solid fa-triangle-exclamation"></i>`;
    modalConfirmacion.style.display = "block";
    botonConfirmar.onclick = async () => {
      try {
        const response = await fetch(
          `https://sgcursos.vercel.app/api/cursos/${encodeURIComponent(
            cursoNombre
          )}`,
          {
            method: "DELETE",
          }
        );
        let data;
        if (
          response.headers.get("Content-Type")?.includes("application/json")
        ) {
          data = await response.json();
        } else {
          throw new Error("Respuesta no válida del servidor");
        }
        if (!response.ok) {
          mostrarMensaje(
            data.mensaje || "Error desconocido",
            data.tipo || "error"
          );
          return;
        }
        cursos = cursos.filter(
          (curso) => curso.nombre.toLowerCase() !== cursoNombre
        );
        guardarDatos();
        mostrarCursos();
        actualizarCursosSelect();
        mostrarMensaje(`¡Curso "${cursoNombre}" eliminado!`, "success");
      } catch (error) {
        mostrarMensaje("Error al conectar con el servidor.", "error");
        console.error("Error:", error);
      }
      const cerrar = bootstrap.Modal.getInstance(
        document.getElementById("modal-confirmacion")
      );
      cerrar.hide();
    };
    botonCancelar.onclick = () => {
      const cerrar = bootstrap.Modal.getInstance(
        document.getElementById("modal-confirmacion")
      );
      cerrar.hide();
    };
  }
});
//--- Editar curso ---//
let camposModificados = false;
let estudiantesModificados = false;
let mensajeMostrado = false;
listaCursos.addEventListener("click", (e) => {
  if (e.target.classList.contains("editar-curso")) {
    cursoActual = cursos.find(
      (curso) => curso.nombre === e.target.getAttribute("nombre")
    );
    estudiantesOriginales = JSON.parse(JSON.stringify(cursoActual.estudiantes));
    nuevoNombreCurso.value = cursoActual.nombre;
    nuevoNombreProfesor.value = cursoActual.profesor;
    mostrarEstudiantes();
    tablaModificada = false;
    camposModificados = false;
    estudiantesModificados = false;
    mensajeMostrado = false;
  }
});
//--- Control de cambios ---//
let cambiosEstudiantes = false;
function marcarCambioEstudiantes() {
  cambiosEstudiantes = true;
}
//--- Descartar cambios al cerrar el modal ---//
formularioEdicion.addEventListener("hide.bs.modal", () => {
  if ((camposModificados || estudiantesModificados) && !tablaModificada) {
    cursoActual.estudiantes = JSON.parse(JSON.stringify(estudiantesOriginales));
    mostrarEstudiantes();
    camposModificados = false;
    estudiantesModificados = false;
    tablaModificada = false;
    estudianteAEliminar = null;
    if (!mensajeMostrado) {
      mostrarMensaje("Los cambios fueron descartados.", "error");
      mensajeMostrado = true;
    }
  }
});
formEdicionEstudiante.addEventListener("hide.bs.modal", () => {
  if (cambiosDetectados && !mensajeMostrado) {
    mostrarMensaje("Los cambios se han descartado.", "error");
    cambiosDetectados = false;
    if (estudianteTemporal) {
      nombreEstudianteEditar.value = estudianteTemporal.nombre;
      edadEstudianteEditar.value = estudianteTemporal.edad;
      notaEstudianteEditar.value = estudianteTemporal.nota;
    }
    estudianteTemporal = null;
  }
  mensajeMostrado = false;
});
//--- Detectar cambios en los campos del curso ---//
[nuevoNombreCurso, nuevoNombreProfesor].forEach((campo) => {
  campo.addEventListener("input", () => {
    camposModificados =
      nuevoNombreCurso.value.trim() !== cursoActual.nombre.trim() ||
      nuevoNombreProfesor.value.trim() !== cursoActual.profesor.trim();
  });
});
//--- Detectar eliminación o edición de estudiantes ---//
guardarEdicionEstudiante.addEventListener("click", () => {
  estudiantesModificados = true;
  mensajeMostrado = false;
});
cancelarEdicionEstudiante.addEventListener("click", () => {
  estudiantesModificados = true;
  mensajeMostrado = false;
});
// --- Detectar cambios en los campos del formulario ---
nombreEstudianteEditar.addEventListener("input", () => {
  cambiosDetectados = true;
});
edadEstudianteEditar.addEventListener("input", () => {
  cambiosDetectados = true;
});
notaEstudianteEditar.addEventListener("input", () => {
  cambiosDetectados = true;
});
//-------------------------------- * Eventos para Estudiante * -----------------------------//

//--- Agregar estudiante ---//
formEstudiante.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombreEstudianteValor = primeraMayuscula(nombreEstudiante.value.trim());
  const edadEstudianteValor = parseInt(edadEstudiante.value);
  const notaEstudianteValor = parseFloat(notaEstudiante.value);
  const cursoIndex = parseInt(cursoEstudianteSelect.value);
  if (isNaN(cursoIndex) || cursoIndex < 0 || cursoIndex >= cursos.length) {
    mostrarMensaje("Por favor selecciona un curso válido.", "error");
    return;
  }
  const cursoActual = cursos[cursoIndex];
  if (!cursoActual || !Array.isArray(cursoActual.estudiantes)) {
    mostrarMensaje(
      "El curso seleccionado no es válido o no tiene estudiantes.",
      "error"
    );
    return;
  }
  const nombreValido = cadenaValida(nombreEstudianteValor);
  const estudianteExistente = cursoActual.estudiantes.find(
    (est) => est.nombre.toLowerCase() === nombreEstudianteValor.toLowerCase()
  );
  if (estudianteExistente) {
    mostrarMensaje("¡Ese alumno ya existe!", "error");
    return;
  } else if (
    (!nombreValido && edadEstudianteValor <= 0 && notaEstudianteValor < 0) ||
    notaEstudianteValor > 10
  ) {
    mostrarMensaje("¡Valores ingresados incorrectos!", "error");
    return;
  } else if (!nombreValido && edadEstudianteValor <= 0) {
    mostrarMensaje("¡Nombre y Edad ingresados Incorrectos!", "error");
    return;
  } else if (
    (!nombreValido && notaEstudianteValor < 0) ||
    notaEstudianteValor > 10
  ) {
    mostrarMensaje("¡Nombre y Nota ingresados Incorrectos!", "error");
    return;
  } else if (
    (edadEstudianteValor <= 0 && notaEstudianteValor < 0) ||
    notaEstudianteValor > 10
  ) {
    mostrarMensaje("¡Edad y Nota ingresadas Incorrectas!", "error");
    return;
  } else if (!nombreValido) {
    mostrarMensaje("¡Nombre ingresado Incorrecto!", "error");
    return;
  } else if (edadEstudianteValor <= 0) {
    mostrarMensaje("¡Edad ingresada Incorrecta!", "error");
    return;
  } else if (notaEstudianteValor < 0 || notaEstudianteValor > 10) {
    mostrarMensaje("¡Nota ingresada Incorrecta!", "error");
    return;
  }
  const data = {
    nombre: nombreEstudianteValor,
    edad: edadEstudianteValor,
    nota: notaEstudianteValor,
    curso_id: cursoIndex,
  };
  try {
    const response = await fetch(
      "https://sgcursos.vercel.app/api/estudiantes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    if (response.ok && result.tipo === "success") {
      mostrarMensaje(result.mensaje, "success");
      const nuevoEstudiante = result.estudiante;
      cursoActual.estudiantes.push(nuevoEstudiante);
      formEstudiante.reset();
      mostrarCursos();
      guardarDatos();
      actualizarEstadisticas();
    } else {
      mostrarMensaje(result.mensaje || "Error al agregar estudiante.", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    mostrarMensaje("Error al conectar con el servidor.", "error");
  }
});
//--- Eliminar estudiante ---//
let estudianteAEliminar = null;
listaEstudiantesEdicion.addEventListener("click", (e) => {
  const botonEliminar = e.target.closest(".boton-eliminar-estudiante");
  if (botonEliminar) {
    const estudianteId = parseInt(botonEliminar.dataset.id, 10);
    if (isNaN(estudianteId)) {
      console.error("ID del estudiante no válido:", estudianteId);
      return;
    }
    const estudiante = cursoActual.estudiantes.find(
      (est) => est.id === estudianteId
    );
    if (!estudiante) {
      console.error("Estudiante no encontrado.");
      return;
    }
    const mensajeConfirmacion = document.getElementById("mensaje-confirmacion");
    const modalConfirmacion = new bootstrap.Modal(
      document.getElementById("modal-confirmacion")
    );
    mensajeConfirmacion.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> 
    ¿Estás seguro de que deseas eliminar al estudiante "<strong>${estudiante.nombre}</strong>"? 
    <i class="fa-solid fa-triangle-exclamation"></i>`;
    modalConfirmacion.show();
    const botonConfirmar = document.getElementById("btn-confirmar");
    const botonCancelar = document.getElementById("btn-cancelar");
    botonConfirmar.onclick = () => {
      estudianteAEliminar = estudianteId;
      cursoActual.estudiantes = cursoActual.estudiantes.filter(
        (est) => est.id !== estudianteId
      );
      estudiantesModificados = true;
      mostrarEstudiantes();
      marcarCambioEstudiantes();
      mostrarMensaje(
        `¡Estudiante "${estudiante.nombre}" eliminado!`,
        "success"
      );
      modalConfirmacion.hide();
    };
    botonCancelar.onclick = () => {
      estudianteAEliminar = null;
      modalConfirmacion.hide();
    };
  }
});
//--- Filtrar estudiantes ---//
let ordenarPorEdad = false;
let ordenarPorNota = false;
let ordenarPorNombre = false;
filtroEstudiantes.addEventListener("change", () => {
  const valorFiltro = filtroEstudiantes.value;
  if (valorFiltro === "edad") {
    ordenarPorEdad = true;
    ordenarPorNota = false;
    ordenarPorNombre = false;
  } else if (valorFiltro === "nota") {
    ordenarPorEdad = false;
    ordenarPorNota = true;
    ordenarPorNombre = false;
  } else if (valorFiltro === "nombre") {
    ordenarPorEdad = false;
    ordenarPorNota = false;
    ordenarPorNombre = true;
  } else {
    ordenarPorEdad = false;
    ordenarPorNota = false;
    ordenarPorNombre = false;
  }
  mostrarCursos(busquedaIngresada.value.toLowerCase());
});
//--- Editar estudiante ---//
let cambiosDetectados = false;
listaEstudiantesEdicion.addEventListener("click", (e) => {
  if (e.target.closest("#boton-editar-estudiante")) {
    const boton = e.target.closest("#boton-editar-estudiante");
    const estudianteId = boton.getAttribute("data-id");
    if (!cursoActual || !Array.isArray(cursoActual.estudiantes)) {
      console.error("cursoActual o sus estudiantes no están definidos");
      mostrarMensaje("Error: El curso actual no tiene estudiantes.", "error");
      return;
    }
    const estudiante = cursoActual.estudiantes.find(
      (est) => est.id == estudianteId
    );
    if (!estudiante) {
      console.error("Estudiante no encontrado con el ID:", estudianteId);
      mostrarMensaje("Error: Estudiante no encontrado.", "error");
      return;
    }
    estudianteTemporal = { ...estudiante };
    cambiosDetectados = false;
    mensajeMostrado = false;
    nombreEstudianteEditar.value = estudiante.nombre;
    edadEstudianteEditar.value = estudiante.edad;
    notaEstudianteEditar.value = estudiante.nota;
    const modal = new bootstrap.Modal(formEdicionEstudiante);
    modal.show();
  }
});
//--- Guardar estudiante ---//
guardarEdicionEstudiante.addEventListener("click", () => {
  if (estudianteTemporal) {
    const estudianteId = estudianteTemporal.id;
    const nombreNuevo = nombreEstudianteEditar.value.trim();
    const edadNueva = parseInt(edadEstudianteEditar.value);
    const notaNueva = parseFloat(notaEstudianteEditar.value);
    if (
      !nombreNuevo ||
      isNaN(edadNueva) ||
      isNaN(notaNueva) ||
      notaNueva < 0 ||
      notaNueva > 10
    ) {
      mostrarMensaje("Por favor ingresa valores válidos.", "error");
      return;
    }
    const data = {
      nombre: nombreNuevo,
      edad: edadNueva,
      nota: notaNueva,
    };
    fetch(`https://sgcursos.vercel.app/api/estudiantes/${estudianteId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.tipo === "success") {
          const estudianteIndex = cursoActual.estudiantes.findIndex(
            (est) => est.id === estudianteId
          );
          if (estudianteIndex !== -1) {
            cursoActual.estudiantes[estudianteIndex] = {
              ...cursoActual.estudiantes[estudianteIndex],
              ...data.estudiante,
            };
          }
          mostrarEstudiantes();
          mostrarMensaje(data.mensaje, "success");
          tablaModificada = true;
          estudianteTemporal = null;
          cambiosDetectados = false;
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("formulario-edicion-estudiante")
          );
          if (modal) modal.hide();
          mensajeMostrado = true;
        } else {
          mostrarMensaje(data.mensaje, "error");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        mostrarMensaje("Error al actualizar estudiante", "error");
      });
  }
});
//---------------------------------- * Eventos Especiales * --------------------------------//

//--- Buscar curso, estudiante, profesor ---//
busquedaIngresada.addEventListener("input", () => {
  mostrarCursos(busquedaIngresada.value.toLowerCase());
});
//--- Cancelar edición curso ---//
cancelarEdicion.addEventListener("click", () => {
  if (camposModificados || estudiantesModificados) {
    const mensajeConfirmacion = document.getElementById("mensaje-confirmacion");
    const modalConfirmacion = new bootstrap.Modal(
      document.getElementById("modal-confirmacion")
    );
    if (mensajeConfirmacion && modalConfirmacion) {
      mensajeConfirmacion.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i> 
        ¿Estás seguro de que deseas cancelar los cambios?  
        <i class="fa-solid fa-triangle-exclamation"></i>
      `;
      modalConfirmacion.show();
      const botonConfirmar = document.getElementById("btn-confirmar");
      const botonCancelar = document.getElementById("btn-cancelar");
      if (botonConfirmar && botonCancelar) {
        botonConfirmar.onclick = () => {
          if (cursoActual && estudiantesOriginales) {
            cursoActual.estudiantes = JSON.parse(
              JSON.stringify(estudiantesOriginales)
            );
            mostrarEstudiantes();
            camposModificados = false;
            estudiantesModificados = false;
            tablaModificada = false;
            estudianteAEliminar = null;
            const modalEdicion = bootstrap.Modal.getInstance(
              document.getElementById("formulario-edicion")
            );
            if (modalEdicion) {
              modalEdicion.hide();
            }
          } else {
            console.error(
              "Faltan datos esenciales (cursoActual o estudiantesOriginales)."
            );
          }
          modalConfirmacion.hide();
        };
        botonCancelar.onclick = () => {
          modalConfirmacion.hide();
        };
      } else {
        console.error(
          "Los botones de confirmación y/o cancelación no fueron encontrados."
        );
      }
    } else {
      console.error(
        "El modal o el mensaje de confirmación no fueron encontrados."
      );
    }
  } else {
    const modalEdicion = bootstrap.Modal.getInstance(
      document.getElementById("formulario-edicion")
    );
    if (modalEdicion) {
      modalEdicion.hide();
    }
  }
});
//--- Cancelar edición estudiante---//
cancelarEdicionEstudiante.addEventListener("click", () => {
  estudianteTemporal = null;
  formEdicionEstudiante.style.display = "none";
  nombreEstudianteEditar.value = "";
  edadEstudianteEditar.value = "";
  notaEstudianteEditar.value = "";
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("formulario-edicion-estudiante")
  );
  modal.hide();
});
//--- Desplazar a elemento ---//
botonEmpezar.addEventListener("click", function (event) {
  event.preventDefault();
  const target = document.getElementById("nombre-curso");
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  target.focus();
});
//--- Desplazar en scroll ---//
document.addEventListener("DOMContentLoaded", () => {
  const elementos = [
    ...document.querySelectorAll(".oculto"),
    document.getElementById("boton-agregar-curso"),
    document.getElementById("boton-agregar-estudiante"),
    document.getElementById("exportar-json"),
    document.getElementById("filtro-estudiantes"),
    document.getElementById("tabla-estadisticas"),
    document.getElementById("contenedor-grafica"),
    document.getElementById("graficaEstudiantes"),
    document.querySelector(".texto-arriba1"),
    document.querySelector(".texto-arriba2"),
    document.querySelector(".texto-arriba3"),
    document.querySelector(".texto-h2-estadisticas"),
    document.querySelector(".texto-h2-informacion"),
    document.querySelector("#link-empezar"),
    document.querySelector("#ultima-actualizacion"),
    document.querySelector("#abrir-modal"),
    document.querySelector("#mostrar-comentarios"),
    ...document.querySelectorAll(".boton-editar-curso"),
    ...document.querySelectorAll(".boton-eliminar-curso"),
    ...document.querySelectorAll(".h3-mis-redes"),
    ...document.querySelectorAll(".texto-contacto"),
    ...document.querySelectorAll(".footer-subredes"),
    ...document.querySelectorAll(".info-redes"),
    ...document.querySelectorAll(".info-redes-cel"),
    ...document.querySelectorAll(
      ".texto-educativa, .texto-gestion, .texto-plataforma, .texto-solucion, .fa-bars-progress"
    ),
  ].filter((el) => el !== null);
  const ventanaAltura = window.innerHeight;
  function manejarScroll() {
    elementos.forEach((elemento) => {
      const rect = elemento.getBoundingClientRect();
      if (rect.top < ventanaAltura - 100) {
        elemento.classList.add("visible");
      }
      if (rect.bottom < 0 || rect.top > ventanaAltura) {
        elemento.classList.remove("visible");
      }
    });
  }
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        manejarScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
  manejarScroll();
});
//--- Actualizar fecha de datos ---//
window.addEventListener("load", () => {
  const ultimaActualizacion = document.getElementById("ultima-actualizacion");
  const fechaGuardada = localStorage.getItem("ultimaActualizacion");

  if (ultimaActualizacion && fechaGuardada) {
    ultimaActualizacion.innerHTML = `<i class="fa-solid fa-calendar-days"></i> * Última actualización de datos: ${fechaGuardada}`;
  }
});
//--- Desplazar en Vertical ---//
window.addEventListener("scroll", () => {
  if (window.scrollY > 1500) {
    botonArriba.style.display = "block";
  } else {
    botonArriba.style.display = "none";
  }
});
botonArriba.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
window.addEventListener("load", () => {
  if (window.scrollY > 1500) {
    botonArriba.style.display = "block";
  } else {
    botonArriba.style.display = "none";
  }
});
//--- Valorar página ---//
document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("valoracion-form");
  formulario.addEventListener("submit", async (event) => {
    event.preventDefault();
    const correo = document.getElementById("correo").value;
    const comentario = document.getElementById("comentario").value;
    const valoracion = document.getElementById("valoracion").value;
    if (!correo || !comentario || !valoracion) {
      alert("Por favor, completa todos los campos.");
      return;
    }
    try {
      const response = await fetch(
        "https://sgcursos.vercel.app/api/valoraciones",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, comentario, valoracion }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        mostrarMensaje("¡Gracias por tu valoración!", "success");
        const modalEl = document.getElementById("modalValoracion");
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();
        formulario.reset();
      } else {
        mostrarMensaje(
          data.mensaje || "El correo ya está registrado.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error al enviar la valoración:", error);
      mostrarMensaje(
        "Hubo un error al enviar tu valoración. Por favor, inténtalo de nuevo.",
        "error"
      );
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const comentariosContainer = document.getElementById("comentarios-container");
  const promedioContainer = document.getElementById("promedio-container");
  const generarEstrellasPromedio = (promedio) => {
    let estrellasHTML = "";
    for (let i = 1; i <= 5; i++) {
      if (i <= promedio) {
        estrellasHTML += `<i class="fa-solid fa-star text-warning"></i>`;
      } else if (i - promedio < 1) {
        estrellasHTML += `<i class="fa-solid fa-star-half-stroke text-warning"></i>`;
      } else {
        estrellasHTML += `<i class="fa-regular fa-star text-muted"></i>`;
      }
    }
    return estrellasHTML;
  };
  const cargarComentarios = async () => {
    try {
      const response = await fetch(
        "https://sgcursos.vercel.app/api/valoraciones"
      );
      if (response.ok) {
        const data = await response.json();
        const { promedio, valoraciones } = data;
        promedioContainer.innerHTML = `
          <div id="container-h6-comentarios" class="col">
            <h6 id="h6-comentarios"><i class="fa-solid fa-thumbs-up"></i> Promedio de Valoraciones: ${promedio.toFixed(
              1
            )}
            </h6>
          </div>
          <div id="estrellas-promedio" class="col">${generarEstrellasPromedio(
            promedio
          )}
          </div>
        `;
        comentariosContainer.innerHTML = "";
        if (valoraciones.length > 0) {
          valoraciones.forEach((valoracion) => {
            const comentarioHTML = `
              <div id="sub-comentarios-container">
                <div id="container-correo-estrellas">
                  <div id="container-h6-correo" class="col">
                    <h6 id="h6-correo">
                      ${valoracion.correo}
                    </h6>
                  </div>
                  <div class="col">
                    ${generarEstrellasPromedio(valoracion.puntaje)}
                  </div>
                  <div class="col">
                    <p id="fecha-comentario">
                    ${new Date(valoracion.fecha).toLocaleString("es-AR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    </p>
                  </div>
                </div>
                <p id="p-comentario">${valoracion.comentario}</p>
              </div>
            `;
            comentariosContainer.innerHTML += comentarioHTML;
          });
        } else {
          comentariosContainer.innerHTML = `<p id="por-el-momento" class="text-muted text-center">No se han ingresado comentarios...</p>`;
        }
      } else {
        promedioContainer.innerHTML = `<p class="text-danger text-center">Error al cargar promedio.</p>`;
        comentariosContainer.innerHTML = `<p class="text-danger text-center">Error al cargar comentarios.</p>`;
        console.error("Error al obtener datos:", response.statusText);
      }
    } catch (error) {
      promedioContainer.innerHTML = `<p class="text-danger text-center">Error al cargar promedio.</p>`;
      comentariosContainer.innerHTML = `<p class="text-danger text-center">Error al cargar comentarios.</p>`;
      console.error("Error al obtener datos:", error);
    }
  };
  const modalComentarios = document.getElementById("modalComentarios");
  modalComentarios.addEventListener("show.bs.modal", cargarComentarios);
});
