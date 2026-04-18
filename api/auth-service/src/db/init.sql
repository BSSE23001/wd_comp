-- FairGig Users Table
-- Stores all users: Workers, Verifiers, and the single Advocate

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('WORKER', 'VERIFIER', 'ADVOCATE')),
  is_approved_by_advocate BOOLEAN DEFAULT FALSE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone_number VARCHAR(20),
  profile_photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups during login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on role for querying users by role
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists to ensure idempotency
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;

-- Create the trigger
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
