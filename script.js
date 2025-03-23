// Simulación de datos de divisas
const currencyData = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.75,
    JPY: 110,
    // ... más divisas
};

// Función para crear tarjetas de divisas
function createCurrencyCard(currency, rate) {
    const card = document.createElement('div');
    card.className = 'currency-card';
    card.innerHTML = `<h3>${currency}</h3><p>1 ${currency} = ${rate} USD</p>`;
    return card;
}

// Cargar cotizaciones iniciales
function loadInitialCurrencies() {
    const currencyList = document.getElementById('currency-list');
    for (const currency in currencyData) {
        currencyList.appendChild(createCurrencyCard(currency, currencyData[currency]));
    }
}

// Cargar selectores del conversor
function loadCurrencySelectors() {
    const fromCurrency = document.getElementById('from-currency');
    const toCurrency = document.getElementById('to-currency');
    for (const currency in currencyData) {
        const option = document.createElement('option');
        option.value = currency;
        option.text = currency;
        fromCurrency.appendChild(option.cloneNode(true));
        toCurrency.appendChild(option);
    }
}

// Función para realizar la conversión
function convertCurrency() {
    const amount = document.getElementById('