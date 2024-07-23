// config.j s
const { Pool } = require('pg');

const pool = new Pool({
  host: "TradeX-db",
  port: 5432,
  user: "virtualdb_f18n_user",
  password: "h9DVLzD5H1mcObMekkpYWdAtH9V8Ecqo",
  database: "virtualdb_f18n",
});

module.exports = pool;
