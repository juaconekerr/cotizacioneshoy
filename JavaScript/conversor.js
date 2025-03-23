/**
 * conversor.js
 *
 * Este archivo contiene la lógica JavaScript para controlar el conversor de divisas.
 * Incluye la obtención de datos de una API y la realización de conversiones.
 */

// 1. Importar la función de la API
const { getExchangeRates } = require('./apidivisas');

// 2. Obtener referencias a los elementos HTML
const amountInput = document.getElementById('amount-input');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const convertButton = document.getElementById('convert-button');
const conversionResult = document.getElementById('conversion-result');

// 3. Datos de divisas (inicialmente vacíos)
const currencyData = {};

// 4. Función para cargar las opciones de divisas en los selectores
function loadCurrencyOptions() {
    fromCurrencySelect.innerHTML = '';
    toCurrencySelect.innerHTML = '';
    for (const currency in currencyData) {
        const option = document.createElement('option');
        option.value = currency;
        option.text = currency;
        fromCurrencySelect.appendChild(option.cloneNode(true));
        toCurrencySelect.appendChild(option);
    }
}

// 5. Función para realizar la conversión
async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const from = fromCurrencySelect.value;
    const to = toCurrencySelect.value;

    if (isNaN(amount)) {
        conversionResult.textContent = 'Ingrese una cantidad válida.';
        return;
    }

    try {
        const rate = currencyData[to] / currencyData[from];
        const result = amount * rate;
        conversionResult.textContent = `${amount} ${from} = ${result.toFixed(2)} ${to}`;
    } catch (error) {
        console.error('Error al realizar la conversión:', error);
        conversionResult.textContent = 'Error al realizar la conversión.';
    }
}

// 6. Función para actualizar los datos de divisas
async function updateCurrencyData() {
    try {
        const rates = await getExchangeRates();
        if (rates) {
            for (const currency in rates) {
                currencyData[currency] = rates[currency];
            }
            loadCurrencyOptions();
        }
    } catch (error) {
        console.error('Error al actualizar los datos de divisas:', error);
    }
}

// 7. Inicialización
async function init() {
    await updateCurrencyData(); // Obtener datos iniciales
    loadCurrencyOptions();
    convertButton.addEventListener('click', convertCurrency);
    setInterval(updateCurrencyData, 60 * 60 * 1000); // Actualizar cada hora
}

init();