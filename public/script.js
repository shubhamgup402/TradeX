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
    { symbol: 'LINKUSDT', name: 'Chainlink (LINK)' },
    { symbol: 'UNIUSDT', name: 'Uniswap (UNI)' },
    { symbol: 'ALGOUSDT', name: 'Algorand (ALGO)' },
    { symbol: 'VETUSDT', name: 'VeChain (VET)' },
    { symbol: 'XMRUSDT', name: 'Monero (XMR)' },
    { symbol: 'AAVEUSDT', name: 'Aave (AAVE)' },
    { symbol: 'EGLDUSDT', name: 'Elrond (EGLD)' },
    { symbol: 'EOSUSDT', name: 'EOS (EOS)' },
    { symbol: 'XTZUSDT', name: 'Tezos (XTZ)' },
    { symbol: 'THETAUSDT', name: 'Theta (THETA)' }
  ];

  let priceFetchInterval;
  let isOffline = false;

  function createCryptoListItem(crypto) {
    const li = document.createElement('li');
    li.textContent = crypto.name;
    li.onclick = () => {
      changeChart(crypto.symbol);
      updateForms(crypto.symbol, crypto.name);
      document.getElementById('myportfolio').style.display = 'block'; // Show myportfolio on crypto click
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
  });

  function fetchPrices() {
    if (isOffline) return; // Don't fetch prices if offline

    fetch('/crypto-prices')
      .then(response => response.json())
      .then(prices => {
        prices.forEach(crypto => {
          const priceSpan = document.getElementById(`price-${crypto.symbol}`);
          if (priceSpan) {
            const price = parseFloat(crypto.price).toFixed(2);
            const previousPrice = parseFloat(priceSpan.textContent.replace('$', ''));
            priceSpan.textContent = `$${price}`;
            if (previousPrice < price) {
              priceSpan.className = 'price price-up';
            } else if (previousPrice > price) {
              priceSpan.className = 'price price-down';
            }
          }
        });
      })
      .catch(error => console.error('Error fetching prices:', error));
  }

  // Start fetching prices initially
  priceFetchInterval = setInterval(fetchPrices, 1300); // Fetch prices every 2 seconds

  function stopFetchingPrices() {
    clearInterval(priceFetchInterval);
  }

  function resumeFetchingPrices() {
    if (!isOffline) {
      priceFetchInterval = setInterval(fetchPrices, 1300);
    }
  }

  function alertUserConnectionLost() {
    alert('You have lost connection. Some functionality will be unavailable until the connection is restored.');
  }

  function alertUserConnectionRestored() {
    alert('Connection restored. Resuming functionality.');
  }

  // Handle online/offline events
  window.addEventListener('offline', () => {
    isOffline = true;
    stopFetchingPrices();
    alertUserConnectionLost();
    document.getElementById('connection-status').textContent = 'Offline';
  });

  window.addEventListener('online', () => {
    isOffline = false;
    resumeFetchingPrices();
    alertUserConnectionRestored();
    document.getElementById('connection-status').textContent = 'Online';
  });

  function changeChart(symbol) {
    const widgetContainer = document.querySelector('.tradingview-widget-container');
    widgetContainer.innerHTML = ''; // Clear previous widget content

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

    script.onerror = () => {
      console.error('Error loading TradingView widget script.');
    };

    widgetContainer.appendChild(script);
  }

  function updateForms(symbol, name) {
    document.getElementById('stock_symbol').value = symbol;
    document.getElementById('stock_name').value = name;
    document.getElementById('symbol-name-display').textContent = name;
    updateRequiredAmount();
  }

  function updateRequiredAmount() {
    const symbol = document.getElementById('stock_symbol').value;
    const quantity = document.getElementById('quantity').value;
    if (!symbol || !quantity) return;

    fetchPrice(symbol).then(price => {
      const requiredAmount = (price * quantity).toFixed(2);
      document.getElementById('required-amount').textContent = `Required Amount: $${requiredAmount}`;
    }).catch(error => console.error('Error fetching price:', error));
  }

  function fetchPrice(symbol) {
    return fetch('/crypto-prices')
      .then(response => response.json())
      .then(prices => {
        const crypto = prices.find(c => c.symbol === symbol);
        return parseFloat(crypto.price);
      });
  }

  document.getElementById('order-type-select').addEventListener('change', (event) => {
    const limitPriceContainer = document.getElementById('limit-price-container');
    if (event.target.value === 'limit') {
      limitPriceContainer.style.display = 'block';
    } else {
      limitPriceContainer.style.display = 'none';
    }
  });

  // Default chart and values
  changeChart('BTCUSDT');
  updateForms('BTCUSDT', 'Bitcoin (BTC)');
  fetchPrice('BTCUSDT').then(price => {
    document.getElementById(`price-BTCUSDT`).textContent = `$${price.toFixed(2)}`;
  });

  document.getElementById('quantity').addEventListener('input', updateRequiredAmount);

  const holdingsLink = document.getElementById('holdingsLink');
  holdingsLink.addEventListener('click', () => {
    window.open('/holdings', '_blank');
  });

  const TransactionLink = document.getElementById('TransactionLink');
  TransactionLink.addEventListener('click', () => {
    window.open('/transaction', '_blank');
  });

  const ReportsLink = document.getElementById('ReportsLink');
  ReportsLink.addEventListener('click', () => {
    window.open('/reports', '_blank');
  });

  function updatePortfolio() {
    if (isOffline) return; // Don't update portfolio if offline

    fetch('/holdings/data')
      .then(response => response.json())
      .then(data => {
        document.getElementById('totalInvested').innerText = `$${parseFloat(data.totalInvested).toFixed(2)}`;
        document.getElementById('totalCurrent').innerText = `$${parseFloat(data.totalCurrent).toFixed(2)}`;
        const totalReturnElement = document.getElementById('totalReturn');
        totalReturnElement.innerText = `${data.totalReturn >= 0 ? '+' : ''}${parseFloat(data.totalReturn).toFixed(2)} (${parseFloat(data.totalReturnPercentage).toFixed(2)}%)`;
        totalReturnElement.className = data.totalReturn >= 0 ? 'positive' : 'negative';

        const holdings = data.holdings;
        holdings.forEach((holding, index) => {
          const holdingElements = document.querySelectorAll('.holding')[index];
          if (holdingElements) {
            holdingElements.querySelector('.current').innerText = `Current Value: $${(holding.quantity * holding.current_price).toFixed(2)}`;
            holdingElements.querySelector('.total-return').innerText = `Total Return: ${holding.current_return >= 0 ? '+' : ''}${holding.current_return.toFixed(2)} (${holding.current_return_percentage.toFixed(2)}%)`;
            holdingElements.querySelector('.total-return').className = holding.current_return >= 0 ? 'positive' : 'negative';
          }
        });
      })
      .catch(error => console.error('Error fetching portfolio data:', error));
  }

  setInterval(updatePortfolio, 1000); // Fetch and update portfolio data every second
});
