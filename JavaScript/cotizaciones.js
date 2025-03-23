    /**
     * @fileoverview Script para la búsqueda y visualización de cotizaciones de divisas.
     * @version 1.3.0
     * @author [Tu Nombre]
     * @license MIT
     */

    (function() {
        'use strict';

        /**
         * Configuración de la API y elementos del DOM.
         */
        const config = {
            apiKey: 'cur_live_dX9LiPubwTM71N0nPT1W39KyNr31nou2u5pnci9Z',
            baseUrl: 'https://api.currencyapi.com/v3/latest',
            elements: {
                input: document.getElementById('busqueda-divisa'),
                results: document.getElementById('resultado-divisa'),
                loading: document.getElementById('indicador-carga'),
                error: document.getElementById('mensaje-error'),
            },
            cache: {
                expiry: 3600000, // 1 hora
            },
            validCurrencies: ['AED', 'AFN', 'ALL', 'AMD', 'ANG', 'AOA', 'ARS', 'AUD', 'AWG', 'AZN', 'BAM', 'BBD', 'BDT', 'BGN', 'BHD', 'BIF', 'BMD', 'BND', 'BOB', 'BRL', 'BSD', 'BTN', 'BWP', 'BYN', 'BZD', 'CAD', 'CDF', 'CHF', 'CLP', 'CNY', 'COP', 'CRC', 'CUP', 'CVE', 'CZK', 'DJF', 'DKK', 'DOP', 'DZD', 'EGP', 'ERN', 'ETB', 'EUR', 'FJD', 'FKP', 'FOK', 'GBP', 'GEL', 'GGP', 'GHS', 'GIP', 'GMD', 'GNF', 'GTQ', 'GYD', 'HKD', 'HNL', 'HRK', 'HTG', 'HUF', 'IDR', 'ILS', 'IMP', 'INR', 'IQD', 'IRR', 'ISK', 'JEP', 'JMD', 'JOD', 'JPY', 'KES', 'KGS', 'KHR', 'KID', 'KMF', 'KRW', 'KWD', 'KYD', 'KZT', 'LAK', 'LBP', 'LKR', 'LRD', 'LSL', 'LYD', 'MAD', 'MDL', 'MGA', 'MKD', 'MMK', 'MNT', 'MOP', 'MRU', 'MUR', 'MVR', 'MWK', 'MXN', 'MYR', 'MZN', 'NAD', 'NGN', 'NIO', 'NOK', 'NPR', 'NZD', 'OMR', 'PAB', 'PEN', 'PGK', 'PHP', 'PKR', 'PLN', 'PYG', 'QAR', 'RON', 'RSD', 'RUB', 'RWF', 'SAR', 'SBD', 'SCR', 'SDG', 'SEK', 'SGD', 'SHP', 'SLE', 'SLL', 'SOS', 'SRD', 'SSP', 'STN', 'SYP', 'SZL', 'THB', 'TJS', 'TMT', 'TND', 'TOP', 'TRY', 'TTD', 'TVD', 'TWD', 'TZS', 'UAH', 'UGX', 'USD', 'UYU', 'UZS', 'VES', 'VND', 'VUV', 'WST', 'XAF', 'XCD', 'XDR', 'XOF', 'XPF', 'YER', 'ZAR', 'ZMW', 'ZWL'
], // Lista completa de divisas
        };

        /**
         * Manejo de errores de la API.
         */
        class ApiError extends Error {
            constructor(message, status) {
                super(message);
                this.status = status;
                this.name = 'ApiError';
            }
        }

        /**
         * Funciones de utilidad.
         */
        const utils = {
            debounce: (func, delay) => {
                let timeoutId;
                return (...args) => {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => func.apply(this, args), delay);
                };
            },
            formatResults: (data) => {
                if (!data || Object.keys(data).length === 0) {
                    return '<p>No se encontraron resultados.</p>';
                }
                let resultadoHTML = '<ul>';
                for (const codigoDivisa in data) {
                    const divisaData = data[codigoDivisa];
                    resultadoHTML += `
                        <li>
                            <h2>${divisaData.name} (${codigoDivisa})</h2>
                            <p><strong>Precio:</strong> ${divisaData.value.toFixed(4)}</p>
                        </li>
                    `;
                }
                resultadoHTML += '</ul>';
                return resultadoHTML;
            },
            showError: (message) => {
                config.elements.error.textContent = message;
                config.elements.error.style.display = 'block';
                config.elements.results.innerHTML = '';
            },
            clearError: () => {
                config.elements.error.textContent = '';
                config.elements.error.style.display = 'none';
            },
            toggleLoading: (show) => {
                config.elements.loading.style.display = show ? 'block' : 'none';
            },
            validateCurrencyCode: (code) => /^[A-Z]{3}(?:%2C[A-Z]{3})*$/.test(code),
        };

        /**
         * Lógica principal de búsqueda y caché.
         */
        const currencyService = {
            abortController: null,
            fetchCurrencyData: async (code) => {
                if (currencyService.abortController) {
                    currencyService.abortController.abort();
                }
                currencyService.abortController = new AbortController();
                const url = `${config.baseUrl}?apikey=${config.apiKey}&currencies=${code}&base_currency=USD`;
                try {
                    const response = await fetch(url, { signal: currencyService.abortController.signal });
                    if (!response.ok) {
                        throw new ApiError(`Error HTTP: ${response.status}`, response.status);
                    }
                    const data = await response.json();
                    return data.data;
                } catch (error) {
                    console.error('Error en fetchCurrencyData:', error);
                    throw error;
                }
            },
            getCurrencyData: async (code) => {
                const cacheKey = `currency_${code}`;
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < config.cache.expiry) {
                        return data;
                    }
                }
                const data = await currencyService.fetchCurrencyData(code);
                localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
                return data;
            },
            searchCurrency: async (code) => {
                utils.toggleLoading(true);
                utils.clearError();
                try {
                    const data = await currencyService.getCurrencyData(code);
                    config.elements.results.innerHTML = utils.formatResults(data);
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error('Error en la búsqueda de divisas:', error);
                        utils.showError(error instanceof ApiError ? `Error de la API: ${error.message} (Código ${error.status})` : 'Error al obtener datos de la API.');
                    }
                } finally {
                    utils.toggleLoading(false);
                    currencyService.abortController = null;
                }
            },
        };

        /**
         * Manejadores de eventos.
         */
        config.elements.input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const code = config.elements.input.value.toUpperCase();
                if (utils.validateCurrencyCode(code)) {
                    currencyService.searchCurrency(code);
                } else {
                    utils.showError('Código de divisa inválido.');
                }
            }
        });

        config.elements.input.addEventListener('input', utils.debounce(() => {
            const code = config.elements.input.value.toUpperCase();
            if (utils.validateCurrencyCode(code)) {
                currencyService.searchCurrency(code);
            } else if (code.length === 0) {
                config.elements.results.innerHTML = '';
                utils.clearError();
            } else {
                utils.showError('Código de divisa inválido.');
            }
        }, 300));
    })();
