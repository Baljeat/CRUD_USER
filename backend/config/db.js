const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', (client) => {
  client.query("SET timezone = 'Asia/Ho_Chi_Minh'");
});

module.exports = pool;