// Exemple avec pg pour PostgreSQL
import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_password,
  database: process.env.db_name,
  port: Number(process.env.db_port),
});

(async () => {
  await client.connect();
  await client.query('CREATE TABLE IF NOT EXISTS ...');
  await client.end();
  console.log('DB initialized!');
})();