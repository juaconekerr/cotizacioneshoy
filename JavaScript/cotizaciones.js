// cotizaciones.js

(function() {
    const apiKey = 'cur_live_dX9LiPubwTM71N0nPT1W39KyNr31nou2u5pnci9Z'; // Tu clave de API de Currencyapi
    const busquedaDivisa = document.getElementById('busqueda-divisa');
    const resultadosBusqueda = document.getElementById('tabla-resultados-body'); // Modificado para la tabla de resultados
    const indicadorCarga = document.getElementById('indicador-carga');
    const mensajeError = document.getElementById('mensaje-error');
    const codigoDivisasValidos = ['AED', 'AFN', 'ALL', /* ... Lista completa de códigos ISO 4217 ... */ 'ZMW', 'ZWL']; // Lista de códigos ISO 4217
    let abortController = null;

    // Clases de error personalizadas
    class ApiError extends Error {
        constructor(message, status) {
            super(message);
            this.status = status;
            this.name = 'ApiError';
        }
    }

    // Función para formatear los resultados de la búsqueda
    function formatearResultado(codigoDivisa, precioUSD) {
        return `
            <tr>
                <td>${codigoDivisa}</td>
                <td>${precioUSD.toFixed(4)}</td>
                <td><a href="https://es.wikipedia.org/wiki/${codigoDivisa}" target="_blank">Ver en Wikipedia</a></td>
            </tr>
        `;
    }

    // Función para mostrar un mensaje de error al usuario
    function mostrarError(mensaje) {
        mensajeError.textContent = mensaje;
        mensajeError.style.display = 'block';
        resultadosBusqueda.innerHTML = ''; // Limpiar resultados anteriores
    }

    // Función para limpiar el mensaje de error
    function limpiarError() {
        mensajeError.textContent = '';
        mensajeError.style.display = 'none';
    }

    // Función para realizar la búsqueda de divisas con almacenamiento en caché
    async function buscarDivisa(codigoDivisa) {
        limpiarError();
        indicadorCarga.style.display = 'block'; // Mostrar indicador de carga

        const url = `https://api.currencyapi.com/v3/latest?apikey=${apiKey}&currencies=${codigoDivisa}&base_currency=USD`;
        const cacheKey = `divisa_${codigoDivisa}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < 3600000) { // 1 hora de expiración
                indicadorCarga.style.display = 'none'; // Ocultar indicador de carga
                resultadosBusqueda.innerHTML = formatearResultado(codigoDivisa, data[codigoDivisa].value);
                return;
            }
        }

        if (abortController) {
            abortController.abort(); // Cancelar solicitud pendiente
        }
        abortController = new AbortController();

        try {
            const response = await fetch(url, { signal: abortController.signal });
            if (!response.ok) {
                throw new ApiError(`Error HTTP: ${response.status}`, response.status);
            }
            const dataJson = await response.json();
            const data = dataJson.data;

            indicadorCarga.style.display = 'none'; // Ocultar indicador de carga

            if (data && data[codigoDivisa]) {
                const precioUSD = data[codigoDivisa].value;
                resultadosBusqueda.innerHTML = formatearResultado(codigoDivisa, precioUSD);
                localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() })); // Almacenar en caché
            } else {
                mostrarError('Divisa no encontrada.');
            }
        } catch (error) {
            indicadorCarga.style.display = 'none'; // Ocultar indicador de carga
            if (error.name === 'AbortError') {
                return; // Ignorar errores de cancelación
            }
            console.error('Error al buscar divisa:', error);
            if (error instanceof ApiError) {
                mostrarError(`Error de la API: ${error.message} (Código ${error.status})`);
            } else {
                mostrarError('Error al obtener datos de la API.');
            }
        } finally {
            abortController = null; // Reiniciar abortController
        }
    }

    // Función para detectar cambios en la entrada con debounce
    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // Evento input para el campo de búsqueda con debounce
    busquedaDivisa.addEventListener('input', debounce(() => {
        const codigoDivisa = busquedaDivisa.value.toUpperCase();
        const regexDivisa = /^[A-Z]{3}$/; // Expresión regular para códigos de divisa de 3 letras

        if (regexDivisa.test(codigoDivisa) && codigoDivisasValidos.includes(codigoDivisa)) {
            buscarDivisa(codigoDivisa);
        } else if (codigoDivisa.length === 0) {
            resultadosBusqueda.innerHTML = '';
            limpiarError();
        } else {
            mostrarError('Código de divisa inválido.');
            resultadosBusqueda.innerHTML = '';
        }
    }, 300)); // 300 ms de retraso
})();