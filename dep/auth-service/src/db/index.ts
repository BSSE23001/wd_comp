import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Initialize pg.Pool with connection string from environment
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Test the database connection
 */
export const testConnection = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful. Current time:', result.rows[0].now);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Initialize database schema by running init.sql
 */
export const initializeDatabase = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    const initSqlPath = path.join(__dirname, 'init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf-8');
    await client.query(initSql);
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Execute a query using the pool
 * @param text - SQL query string
 * @param params - Query parameters for parameterized queries
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`✓ Executed query [${duration}ms]`);
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 */
export const getClient = async (): Promise<PoolClient> => {
  return await pool.connect();
};

export default pool;
