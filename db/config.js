// config.j s
const { Pool } = require('pg');

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "blogger@123$#",
  database: "virtualdb",
});

module.exports = pool;
