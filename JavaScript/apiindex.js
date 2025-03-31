async function obtenerCotizacion(simbolo) {
    const apiKey = '55f56fac8fa6472cbbdd03b5'; // Reemplaza con tu clave API
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const cotizacion = data.conversion_rates[simbolo];
        const cambio = (Math.random() - 0.5) * 2; // Simular cambio para la tendencia

        if (cotizacion) {
            return {
                cotizacion: cotizacion.toFixed(2), // Redondear a 2 decimales
                cambio: cambio.toFixed(2) // Redondear a 2 decimales
            };
        } else {
            throw new Error(`No se pudo obtener la cotización para ${simbolo}`);
        }
    } catch (error) {
        console.error('Error al obtener la cotización:', error);
        throw new Error('No se pudo obtener la cotización');
    }
}

async function cargarDivisas() {
    const divisas = [
        { nombre: 'Dólar Estadounidense', simbolo: 'USD' },
        { nombre: 'Euro', simbolo: 'EUR' },
        { nombre: 'Yen Japonés', simbolo: 'JPY' },
        { nombre: 'Libra Esterlina', simbolo: 'GBP' },
        { nombre: 'Dólar Canadiense', simbolo: 'CAD' },
        { nombre: 'Franco Suizo', simbolo: 'CHF' },
        { nombre: 'Yuan Chino', simbolo: 'CNY' },
        { nombre: 'Peso Mexicano', simbolo: 'MXN' },
        { nombre: 'Real Brasileño', simbolo: 'BRL' },
        { nombre: 'Rublo Ruso', simbolo: 'RUB' }
    ];

    const divisasContainer = document.getElementById('divisas-container');
    const mensajeErrorElement = document.getElementById('mensaje-error');

    function obtenerTendencia(cambio) {
        if (cambio > 0) {
            return {
                tendencia: 'Subiendo',
                icono: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill="currentColor" d="M10 4v12m4-7h-8"/><path fill="currentColor" d="M10 4l6 6-6 6"/></svg>`, // Flecha arriba
                color: 'text-green-500' // Verde para subida
            };
        } else if (cambio < 0) {
            return {
                tendencia: 'Bajando',
                icono: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill="currentColor" d="M10 16V4m-4 7h8"/><path fill="currentColor" d="M10 16l-6-6 6-6"/></svg>`, // Flecha abajo
                color: 'text-red-500' // Rojo para bajada
            };
        } else {
            return {
                tendencia: 'Estable',
                icono: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill="currentColor" d="M16 8H4v4h12V8z"/></svg>`, // Línea horizontal
                color: 'text-gray-500' // Gris para estable
            };
        }
    }

    function crearTarjetaDivisa(divisa) {
        const tarjetaDivisa = document.createElement('div');
        tarjetaDivisa.className = 'tarjeta-divisa';
        const nombreDivisa = document.createElement('h2');
        nombreDivisa.className = 'nombre-divisa';
        nombreDivisa.textContent = divisa.nombre;
        const simboloDivisa = document.createElement('span');
        simboloDivisa.className = 'simbolo-divisa';
        simboloDivisa.textContent = ` (${divisa.simbolo})`;
        nombreDivisa.appendChild(simboloDivisa);
        const cotizacionDivisa = document.createElement('p');
        cotizacionDivisa.className = 'cotizacion';
        cotizacionDivisa.textContent = 'Cargando...';
        const tendenciaDivisa = document.createElement('div');
        tendenciaDivisa.className = 'tendencia';
        const iconoTendencia = document.createElement('span');
        iconoTendencia.className = 'icono-tendencia';
        const textoTendencia = document.createElement('span');
        textoTendencia.className = 'texto-tendencia';
        const enlaceDetalle = document.createElement('a');
        enlaceDetalle.className = 'enlace-detalle';
        enlaceDetalle.href = `detalle.html?simbolo=${divisa.simbolo}`;
        enlaceDetalle.textContent = 'Ver Detalle';
        const iconoEnlace = document.createElement('span');
        iconoEnlace.className = 'icono-enlace';
        iconoEnlace.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill="currentColor" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"/></svg>`;
        enlaceDetalle.appendChild(iconoEnlace);
        tendenciaDivisa.appendChild(iconoTendencia);
        tendenciaDivisa.appendChild(textoTendencia);
        tarjetaDivisa.appendChild(nombreDivisa);
        tarjetaDivisa.appendChild(cotizacionDivisa);
        tarjetaDivisa.appendChild(tendenciaDivisa);
        tarjetaDivisa.appendChild(enlaceDetalle);
        return tarjetaDivisa;
    }

    try {
        divisas.forEach(divisa => {
            const tarjeta = crearTarjetaDivisa(divisa);
            divisasContainer.appendChild(tarjeta);
        });

        const cotizacionesPromises = divisas.map(divisa => obtenerCotizacion(divisa.simbolo));
        const resultados = await Promise.all(cotizacionesPromises);

        resultados.forEach((resultado, index) => {
            const tarjeta = divisasContainer.children[index];
            const cotizacionElement = tarjeta.querySelector('.cotizacion');
            const tendenciaElement = tarjeta.querySelector('.tendencia');
            const iconoTendenciaElement = tarjeta.querySelector('.icono-tendencia');
            const textoTendenciaElement = tarjeta.querySelector('.texto-tendencia');
            cotizacionElement.textContent = resultado.cotizacion;
            const { tendencia, icono, color } = obtenerTendencia(resultado.cambio);
            iconoTendenciaElement.innerHTML = icono;
            textoTendenciaElement.textContent = tendencia;
            tendenciaElement.className = `tendencia ${color}`;
        });
    } catch (error) {
        console.error('Error al cargar las divisas:', error);
        mensajeErrorElement.style.display = 'block';
    }
}

cargarDivisas();