// divisas.js

const tablaDivisas = document.getElementById('tabla-divisas').getElementsByTagName('tbody')[0];
const busquedaDivisa = document.getElementById('busqueda-divisa');
const indicadorCarga = document.getElementById('indicador-carga');
const mensajeError = document.getElementById('mensaje-error');
const paginaAnterior = document.getElementById('pagina-anterior');
const paginaActual = document.getElementById('pagina-actual');
const paginaSiguiente = document.getElementById('pagina-siguiente');

let datosDivisas = [];
let pagina = 1;
const registrosPorPagina = 10;
let ordenColumna = { nombre: 'asc', precio: 'asc' };

// Función para obtener los datos de las divisas
async function obtenerDatosDivisas() {
    indicadorCarga.style.display = 'block';
    mensajeError.textContent = '';
    try {
        const respuesta = await fetch('URL_DE_TU_API_DE_DIVISAS');
        if (!respuesta.ok) {
            throw new Error('Error al obtener los datos de las divisas');
        }
        datosDivisas = await respuesta.json();
        mostrarDivisas();
    } catch (error) {
        mensajeError.textContent = error.message;
    } finally {
        indicadorCarga.style.display = 'none';
    }
}

// Función para mostrar las divisas en la tabla
function mostrarDivisas() {
    const inicio = (pagina - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const divisasPagina = datosDivisas.slice(inicio, fin);

    tablaDivisas.innerHTML = '';
    divisasPagina.forEach(divisa => {
        const fila = tablaDivisas.insertRow();
        const celdaCodigo = fila.insertCell();
        const celdaNombre = fila.insertCell();
        const celdaSimbolo = fila.insertCell();
        const celdaPrecio = fila.insertCell();
        celdaCodigo.textContent = divisa.codigo;
        celdaNombre.textContent = divisa.nombre;
        celdaSimbolo.textContent = divisa.simbolo;
        celdaPrecio.textContent = divisa.precio;
    });

    paginaActual.textContent = pagina;
    paginaAnterior.disabled = pagina === 1;
    paginaSiguiente.disabled = fin >= datosDivisas.length;
}

// Función para buscar divisas
function buscarDivisas() {
    const textoBusqueda = busquedaDivisa.value.toLowerCase();
    const divisasFiltradas = datosDivisas.filter(divisa =>
        divisa.codigo.toLowerCase().includes(textoBusqueda) ||
        divisa.nombre.toLowerCase().includes(textoBusqueda) ||
        divisa.simbolo.toLowerCase().includes(textoBusqueda)
    );
    pagina = 1;
    datosDivisas = divisasFiltradas;
    mostrarDivisas();

    if (divisasFiltradas.length === 0) {
        mensajeError.textContent = 'No se encontraron divisas que coincidan con la búsqueda.';
    } else {
        mensajeError.textContent = '';
    }
}

// Función para ordenar las divisas
function ordenarDivisas(columna) {
    ordenColumna[columna] = ordenColumna[columna] === 'asc' ? 'desc' : 'asc';
    datosDivisas.sort((a, b) => {
        const valorA = a[columna];
        const valorB = b[columna];
        if (valorA < valorB) {
            return ordenColumna[columna] === 'asc' ? -1 : 1;
        }
        if (valorA > valorB) {
            return ordenColumna[columna] === 'asc' ? 1 : -1;
        }
        return 0;
    });
    mostrarDivisas();
}

// Event listeners
busquedaDivisa.addEventListener('input', buscarDivisas);
paginaAnterior.addEventListener('click', () => {
    if (pagina > 1) {
        pagina--;
        mostrarDivisas();
    }
});
paginaSiguiente.addEventListener('click', () => {
    const fin = pagina * registrosPorPagina;
    if (fin < datosDivisas.length) {
        pagina++;
        mostrarDivisas();
    }
});

document.querySelectorAll('.ordenable').forEach(th => {
    th.addEventListener('click', () => ordenarDivisas(th.classList[0].replace('-columna', '')));
});

// Cargar datos iniciales
obtenerDatosDivisas();