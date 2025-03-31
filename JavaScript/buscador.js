document.addEventListener('DOMContentLoaded', () => {
    const busquedaInput = document.getElementById('busqueda');
    const resultadoDiv = document.getElementById('resultado');

    busquedaInput.addEventListener('change', async () => {
        const simbolo = busquedaInput.value.toUpperCase();
        if (simbolo) {
            try {
                const cotizacion = await obtenerCotizacion(simbolo);
                resultadoDiv.textContent = `1 USD = ${cotizacion} ${simbolo}`;
            } catch (error) {
                resultadoDiv.textContent = 'Error al obtener la cotización. Inténtelo de nuevo más tarde.';
            }
        }
    });

    async function obtenerCotizacion(simbolo) {
        const apiKey = '55f56fac8fa6472cbbdd03b5'; // Reemplaza con tu clave API
        const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const cotizacion = data.conversion_rates[simbolo];
        if (cotizacion) {
            return cotizacion.toFixed(2); // Redondear a 2 decimales
        } else {
            throw new Error(`No se pudo obtener la cotización para ${simbolo}`);
        }
    }
});