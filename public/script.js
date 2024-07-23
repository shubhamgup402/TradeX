document.addEventListener('DOMContentLoaded', () => {
  const cryptoList = document.getElementById('cryptoList');
  const cryptos = [
    { symbol: 'BTCUSDT', name: 'Bitcoin (BTC)' },
    { symbol: 'ETHUSDT', name: 'Ethereum (ETH)' },
    { symbol: 'WBTCUSDT', name: 'Wrapped Bitcoin (WBTC)' },
    { symbol: 'USDCUSDT', name: 'USD Coin (USDC)' },
    { symbol: 'BNBUSDT', name: 'Binance Coin (BNB)' },
    { symbol: 'LTCUSDT', name: 'Litecoin (LTC)' },
    { symbol: 'XRPUSDT', name: 'Ripple (XRP)' },
    { symbol: 'ATOMUSDT', name: 'Cosmos (ATOM)' },
    { symbol: 'BCHUSDT', name: 'Bitcoin Cash (BCH)' },
    { symbol: 'ADAUSDT', name: 'Cardano (ADA)' },
    { symbol: 'SOLUSDT', name: 'Solana (SOL)' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin (DOGE)' },
    { symbol: 'FILUSDT', name: 'Filecoin (FIL)' },
    { symbol: 'APTUSDT', name: 'Aptos (APT)' },
    { symbol: 'AVAXUSDT', name: 'Avalanche (AVAX)' },
    { symbol: 'SHIBUSDT', name: 'Shiba Inu (SHIB)' },
    { symbol: 'DOTUSDT', name: 'Polkadot (DOT)' },
    { symbol: 'TRXUSDT', name: 'TRON (TRX)' },
    { symbol: 'NEARUSDT', name: 'NEAR Protocol (NEAR)' },
    { symbol: 'MATICUSDT', name: 'Polygon (MATIC)' },
  ];

  function createCryptoListItem(crypto) {
    const li = document.createElement('li');
    li.textContent = crypto.name;
    li.onclick = () => {
      changeChart(crypto.symbol);
      fetchPrice(crypto.symbol);
      updateForms(crypto.symbol, crypto.name);
    };
    const priceSpan = document.createElement('span');
    priceSpan.className = 'price';
    priceSpan.id = `price-${crypto.symbol}`;
    li.appendChild(priceSpan);
    return li;
  }

  cryptos.forEach(crypto => {
    const li = createCryptoListItem(crypto);
    cryptoList.appendChild(li);
    fetchLivePrice(crypto.symbol);
    setInterval(() => {
      fetchLivePrice(crypto.symbol);
    }, 1000);
  });

  function updateForms(symbol, name) {
    document.getElementById('stock_symbol').value = symbol;
    document.getElementById('symbol-name-display').textContent = name;
  }

  function updateRequiredAmount() {
    const symbol = document.getElementById('stock_symbol').value;
    const quantity = document.getElementById('quantity').value;
    if (!symbol || !quantity) return;

    const apiUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const price = parseFloat(data.price).toFixed(2);
        const requiredAmount = (price * quantity).toFixed(2);
        document.getElementById('required-amount').textContent = `Required Amount: $${requiredAmount}`;
      })
      .catch(error => console.error('Error fetching price:', error));
  }

  document.getElementById('quantity').addEventListener('input', updateRequiredAmount);

  changeChart('BTCUSDT');
  fetchPrice('BTCUSDT');
  updateForms('BTCUSDT', 'Bitcoin (BTC)');
});

function fetchPrice(symbol) {
  const apiUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const price = parseFloat(data.price).toFixed(2);
      document.getElementById(`price-${symbol}`).textContent = `$${price}`;
    })
    .catch(error => console.error('Error fetching price:', error));
}

function fetchLivePrice(symbol) {
  const apiUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const price = parseFloat(data.price).toFixed(2);
      const priceElement = document.getElementById(`price-${symbol}`);
      if (priceElement) {
        const previousPrice = parseFloat(priceElement.textContent.replace('$', ''));
        priceElement.textContent = `$${price}`;

        if (previousPrice < price) {
          priceElement.className = 'price price-up';
        } else if (previousPrice > price) {
          priceElement.className = 'price price-down';
        }
      }
    })
    .catch(error => console.error('Error fetching live price:', error));
}

function changeChart(symbol) {
  const widgetContainer = document.querySelector('.tradingview-widget-container');
  widgetContainer.innerHTML = ''; // Clear previous widget

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
  script.innerHTML = JSON.stringify({
    "autosize": true,
    "symbol": `BINANCE:${symbol}`,
    "interval": "1D",
    "timezone": "exchange",
    "theme": "dark",
    "style": "1",
    "locale": "en",
    "withdateranges": true,
    "hide_side_toolbar": false,
    "allow_symbol_change": false,
    "calendar": false,
    "support_host": "https://www.tradingview.com"
  });

  widgetContainer.appendChild(script);
}

const orderTypeSelect = document.getElementById('order-type-select');
const limitPriceContainer = document.getElementById('limit-price-container');

orderTypeSelect.addEventListener('change', function () {
  if (this.value === 'limit') {
    limitPriceContainer.style.display = 'block';
  } else {
    limitPriceContainer.style.display = 'none';
  }
});
