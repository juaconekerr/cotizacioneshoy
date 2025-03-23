/**
 * conversor.js
 *
 * Este archivo contiene la lógica JavaScript para controlar el conversor de divisas.
 * Incluye la obtención de datos de una API, la realización de conversiones,
 * la ordenación alfabética de las divisas y la funcionalidad de búsqueda.
 */

(function() {
    'use strict';

    /**
     * Configuración de la API y elementos del DOM.
     * @namespace config
     */
    const config = {
        // apiKey: 'YOUR_API_KEY', // Reemplaza con tu API key
        baseUrl: 'https://api.currencyapi.com/v3',
        elements: {
            amountInput: document.getElementById('amount-input'),
            fromCurrencySelect: document.getElementById('from-currency'),
            toCurrencySelect: document.getElementById('to-currency'),
            convertButton: document.getElementById('convert-button'),
            conversionResult: document.getElementById('conversion-result'),
            error: document.getElementById('error-message'),
            loading: document.getElementById('loading-indicator'),
            searchCurrencies: document.getElementById('search-currencies'),
        },
        cache: {
            rates: null,
            timestamp: null,
            expiry: 3600000, // 1 hora
        },
        // currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD', 'ARS', 'BRL', 'MXN', 'COP'], // Eliminamos la lista fija de divisas
    };

    /**
     * Manejo de errores de la API.
     * @class ApiError
     * @extends Error
     */
    class ApiError extends Error {
        /**
         * Crea una instancia de ApiError.
         * @constructor
         * @param {string} message - El mensaje de error.
         * @param {number} status - El código de estado de la respuesta de la API.
         */
        constructor(message, status) {
            super(message);
            this.name = 'ApiError';
            this.status = status;
        }
    }

    /**
     * Funciones de utilidad.
     * @namespace utils
     */
    const utils = {
        /**
         * Formatea un número para mostrarlo como moneda.
         * @param {number} number - El número a formatear.
         * @param {string} currencyCode - El código de la divisa (opcional).
         * @returns {string} El número formateado.
         */
        formatNumber: (number, currencyCode) => {
            const options = {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
            };
            if (currencyCode) {
                options.currency = currencyCode;
                options.style = 'currency';
            }
            return new Intl.NumberFormat('es-AR', options).format(number);
        },

        /**
         * Muestra un mensaje en la interfaz de usuario.
         * @param {string} message - El mensaje a mostrar.
         * @param {string} type - El tipo de mensaje ('success' o 'error').
         */
        showMessage: (message, type = 'success') => {
            const element = config.elements.conversionResult;
            element.textContent = message;
            element.className = type === 'success' ? 'text-green-600 text-md' : 'text-red-600 text-md';
        },

        /**
         * Muestra un mensaje de error en la interfaz de usuario.
         * @param {string} message - El mensaje de error a mostrar.
         */
        showError: (message) => {
            const element = config.elements.error;
            element.textContent = message;
            element.style.display = 'block';
            config.elements.conversionResult.textContent = '';
        },

        /**
         * Limpia el mensaje de error en la interfaz de usuario.
         */
        clearError: () => {
            config.elements.error.textContent = '';
            config.elements.error.style.display = 'none';
        },

        /**
         * Muestra u oculta el indicador de carga.
         * @param {boolean} show - Indica si se debe mostrar u ocultar el indicador.
         */
        toggleLoading: (show) => {
            config.elements.loading.style.display = show ? 'block' : 'none';
        },
    };

    /**
     * Servicio para obtener datos de la API.
     * @namespace currencyService
     */
    const currencyService = {
        /**
         * Obtiene los tipos de cambio desde la API de Currencyapi.
         * @async
         * @function getExchangeRates
         * @param {string} baseCurrency - La divisa base para la conversión.
         * @param {string[]} currencies - Un array de divisas para obtener el tipo de cambio.
         * @returns {Promise<Object>} Un objeto con los tipos de cambio.
         * @throws {ApiError} Si hay un error en la llamada a la API.
         */
        getExchangeRates: async (baseCurrency = 'USD', currencies) => {
            const apiKey = 'cur_live_dX9LiPubwTM71N0nPT1W39KyNr31nou2u5pnci9Z'; // Reemplaza con tu API key
            let url = `${config.baseUrl}/latest?apikey=${apiKey}&base_currency=${baseCurrency}`;
            if (currencies && currencies.length > 0) {
                url += `&currencies=${currencies.join(',')}`;
            }

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new ApiError(`Error al obtener tipos de cambio: ${response.status}`, response.status);
                }
                const data = await response.json();
                return data.data;
            } catch (error) {
                console.error('Error en getExchangeRates:', error);
                throw error;
            }
        },

        /**
         * Realiza la conversión de divisas.
         * @function convertCurrency
         * @param {number} amount - La cantidad a convertir.
         * @param {string} fromCurrency - La divisa de origen.
         * @param {string} toCurrency - La divisa de destino.
         * @returns {number} El resultado de la conversión, o 0 en caso de error.
         */
        convertCurrency: (amount, fromCurrency, toCurrency) => {
            const rates = config.cache.rates;
            if (!rates || !rates[fromCurrency] || !rates[toCurrency]) {
                return 0;
            }
            return amount * (rates[toCurrency].value / rates[fromCurrency].value);
        },

        /**
         * Carga las opciones de divisas en los selectores del formulario, ordenadas alfabéticamente y filtradas por búsqueda.
         * @function loadCurrencyOptions
         * @param {Object} currencies - Un objeto que contiene los códigos y nombres de las divisas.
         * @param {string} searchTerm - El término de búsqueda (opcional).
         */
        loadCurrencyOptions: (currencies, searchTerm = '') => {
            const { fromCurrencySelect, toCurrencySelect } = config.elements;
            fromCurrencySelect.innerHTML = '';
            toCurrencySelect.innerHTML = '';

            const searchValue = searchTerm.toLowerCase();
            const filteredCurrencies = Object.entries(currencies)
                .filter(([code, currency]) =>
                    // config.currencies.includes(code) &&  // Eliminamos el filtro de divisas predefinido
                    (currency.name.toLowerCase().includes(searchValue) || code.toLowerCase().includes(searchValue))
                )
                .sort(([, a], [, b]) => a.name.localeCompare(b.name));

            filteredCurrencies.forEach(([code, currency]) => {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = `${currency.name} (${code})`;
                fromCurrencySelect.appendChild(option.cloneNode(true)); // Agregamos la opción a ambos selectores
                toCurrencySelect.appendChild(option);
            });

            // Establecer valores por defecto si hay opciones disponibles
            if (fromCurrencySelect.options.length > 0) {
                fromCurrencySelect.value = fromCurrencySelect.options[0].value;
            }
            if (toCurrencySelect.options.length > 0) {
                toCurrencySelect.value = toCurrencySelect.options[0].value;
            }
        },

        /**
         * Obtiene los datos de las divisas y actualiza la UI.
         * Utiliza un sistema de caché para evitar llamadas excesivas a la API.
         * @async
         * @function updateCurrencyData
         */
        updateCurrencyData: async () => {
            if (config.cache.rates && Date.now() - config.cache.timestamp < config.cache.expiry) {
                return;
            }
            utils.toggleLoading(true);
            utils.clearError();
            try {
                const currencyData = await currencyService.getCurrencies();
                const rates = await currencyService.getExchangeRates('USD'); // No pasamos la lista de divisas para obtener todas
                if (rates) {
                    config.cache.rates = rates;
                    config.cache.timestamp = Date.now();
                    const searchTerm = config.elements.searchCurrencies.value;
                    currencyService.loadCurrencyOptions(currencyData, searchTerm);
                }
            } catch (error) {
                utils.showError(error instanceof ApiError ? error.message : 'Error al obtener datos de divisas.');
            } finally {
                utils.toggleLoading(false);
            }
        },

        /**
         * Obtiene la lista de divisas desde la API de Currencyapi.
         * @async
         * @function getCurrencies
         * @returns {Promise<Object>} Un objeto que contiene los códigos y nombres de las divisas.
         * @throws {ApiError} Si hay un error en la llamada a la API.
         */
        getCurrencies: async () => {
            const cacheKey = 'currencies';
            const cachedData = localStorage.getItem(cacheKey);
            if (cachedData) {
                const { data, timestamp } = JSON.parse(cachedData);
                if (Date.now() - timestamp < config.cache.expiry) {
                    return data;
                }
            }
            const url = `${config.baseUrl}/currencies?apikey=cur_live_dX9LiPubwTM71N0nPT1W39KyNr31nou2u5pnci9Z`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new ApiError(`Error al obtener la lista de divisas: ${response.status}`, response.status);
                }
                const result = await response.json();
                const data = result.data;
                localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
                return data;
            } catch (error) {
                console.error('Error al obtener la lista de divisas:', error);
                throw error;
            }
        },
    };

    /**
     * Inicialización de la aplicación.
     * @async
     * @function init
     */
    async function init() {
        if (!config.elements.amountInput || !config.elements.fromCurrencySelect ||
            !config.elements.toCurrencySelect || !config.elements.convertButton ||
            !config.elements.conversionResult || !config.elements.error || !config.elements.searchCurrencies) {
            console.error('Error: No se pudieron encontrar todos los elementos del DOM.');
            return;
        }

        await currencyService.updateCurrencyData();
        config.elements.convertButton.addEventListener('click', handleConvertir);
        setInterval(currencyService.updateCurrencyData, config.cache.expiry);

        config.elements.searchCurrencies.addEventListener('input', () => {
            currencyService.updateCurrencyData();
        });
    }

    /**
     * Manejador del evento de clic del botón "Convertir".
     * @function handleConvertir
     */
    function handleConvertir() {
        utils.clearError();
        const amount = parseFloat(config.elements.amountInput.value);
        const fromCurrency = config.elements.fromCurrencySelect.value;
        const toCurrency = config.elements.toCurrencySelect.value;

        if (isNaN(amount) || amount <= 0) {
            utils.showError('Por favor, ingrese una cantidad válida.');
            return;
        }

        if (!fromCurrency || !toCurrency) {
            utils.showError('Por favor, seleccione las divisas a convertir.');
            return;
        }

        if (fromCurrency === toCurrency) {
            utils.showMessage(`${utils.formatNumber(amount, fromCurrency)}  es igual a ${utils.formatNumber(amount, toCurrency)}`, 'success');
            return;
        }

        const result = currencyService.convertCurrency(amount, fromCurrency, toCurrency);
        if (result === 0) {
            utils.showError('No se pudo realizar la conversión. Intente nuevamente.');
            return;
        }
        utils.showMessage(`${utils.formatNumber(amount, fromCurrency)}  es igual a ${utils.formatNumber(result, toCurrency)}`, 'success');
    }

    // Inicializar la aplicación al cargar la página.
    init();
})();
