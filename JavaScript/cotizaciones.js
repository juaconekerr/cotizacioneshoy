// cotizaciones.js

(function() {
    const apiKey = '55f56fac8fa6472cbbdd03b5'; // Tu clave de API de ExchangeRate-API
    const busquedaDivisa = document.getElementById('busqueda-divisa');
    const resultadosBusqueda = document.getElementById('resultados-busqueda');
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
            <table>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Precio (USD)</th>
                        <th>Detalles</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${codigoDivisa}</td>
                        <td>${precioUSD.toFixed(4)}</td>
                        <td><a href="https://es.wikipedia.org/wiki/${codigoDivisa}" target="_blank">Ver en Wikipedia</a></td>
                    </tr>
                </tbody>
            </table>
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

        const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
        const cacheKey = `divisa_${codigoDivisa}`;
        const cachedData = localStorage.getItem(cacheKey);

        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < 3600000) { // 1 hora de expiración
                indicadorCarga.style.display = 'none'; // Ocultar indicador de carga
                resultadosBusqueda.innerHTML = formatearResultado(codigoDivisa, data.conversion_rates[codigoDivisa]);
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
            const data = await response.json();

            indicadorCarga.style.display = 'none'; // Ocultar indicador de carga

            if (data.result === 'success' && data.conversion_rates && data.conversion_rates[codigoDivisa]) {
                const precioUSD = data.conversion_rates[codigoDivisa];
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