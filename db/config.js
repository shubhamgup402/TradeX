// config.js
const { Pool } = require('pg');

const pool = new Pool({
  host: "aws-0-ap-south-1.pooler.supabase.com",
  port: 6543,
  user: "postgres.ucshelblvordxyrvpxdt",
  password: "blogger@123$#",
  database: "postgres",
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;


// // config.j s
// const { Pool } = require('pg');

// const pool = new Pool({
//   host: "localhost",
//   port: 5432,
//   user: "postgres",
//   password: "blogger@123$#",
//   database: "virtualdb",
// });

// module.exports = pool;