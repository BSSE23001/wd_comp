import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If you are on a local machine in Lahore and hitting Supabase, 
  // you might need this for SSL:
  ssl: {
    rejectUnauthorized: false
  }
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
};

export async function testConnection() {
  try {
    console.log("⏳ Initializing Database Schema...");

    // 1. Enable UUID extension and create the User table
    const createTableQuery = `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('WORKER', 'VERIFIER', 'ADVOCATE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role user_role NOT NULL DEFAULT 'WORKER',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await pool.query(createTableQuery);
    
    console.log("✅ Database Schema Verified/Created!");
    
    // 2. Simple verification query
    const res = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`📊 Current User Count: ${res.rows[0].count}`);
    
    return true;
  } catch (err) {
    console.error("❌ Database initialization error:", err);
    throw err;
  }
}