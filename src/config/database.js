import 'dotenv/config';
import mysql from 'mysql2/promise';

class Database {
  constructor() {
    this.pool = null;
  }

  createPool() {
    // Validate non-secret connection settings before opening or caching a pool.
    const requiredVariables = ['DB_HOST', 'DB_USER', 'DB_NAME'];
    const missingVariables = requiredVariables.filter((name) => !process.env[name]?.trim());

    if (missingVariables.length > 0) {
      throw new Error(`Faltan variables de entorno requeridas: ${missingVariables.join(', ')}.`);
    }

    return mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  getPool() {
    // Reuse one pool for the whole CLI process instead of opening a connection per query.
    if (!this.pool) {
      this.pool = this.createPool();
    }

    return this.pool;
  }

  async connect() {
    const connection = await this.getPool().getConnection();
    connection.release();
  }

  async execute(query, parameters = []) {
    const [rows] = await this.getPool().execute(query, parameters);
    return rows;
  }

  async close() {
    if (this.pool) {
      const pool = this.pool;
      this.pool = null;
      await pool.end();
    }
  }
}

export default new Database();
