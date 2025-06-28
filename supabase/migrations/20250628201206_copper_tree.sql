/*
  # Create LockerSys Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password` (text)
      - `role` (enum: admin, user)
      - `reset_password_token` (text, nullable)
      - `reset_token_expiry` (timestamp, nullable)
      - `failed_login_attempts` (integer, default 0)
      - `locked_until` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `students`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text, nullable)
      - `student_id` (text, unique)
      - `course` (text)
      - `semester` (integer)
      - `status` (enum: active, inactive)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `lockers`
      - `id` (uuid, primary key)
      - `number` (text, unique)
      - `location` (text)
      - `size` (enum: small, medium, large)
      - `status` (enum: available, rented, maintenance, reserved)
      - `monthly_price` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `rentals`
      - `id` (uuid, primary key)
      - `locker_id` (uuid, foreign key)
      - `student_id` (uuid, foreign key)
      - `start_date` (date)
      - `end_date` (date)
      - `monthly_price` (decimal)
      - `total_amount` (decimal)
      - `status` (enum: active, overdue, completed, cancelled)
      - `payment_status` (enum: pending, paid, overdue)
      - `notes` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
    - Add admin policies for full access
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE student_status AS ENUM ('active', 'inactive');
CREATE TYPE locker_size AS ENUM ('small', 'medium', 'large');
CREATE TYPE locker_status AS ENUM ('available', 'rented', 'maintenance', 'reserved');
CREATE TYPE rental_status AS ENUM ('active', 'overdue', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role user_role DEFAULT 'user',
  reset_password_token text,
  reset_token_expiry timestamptz,
  failed_login_attempts integer DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  student_id text UNIQUE NOT NULL,
  course text NOT NULL,
  semester integer NOT NULL,
  status student_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lockers table
CREATE TABLE IF NOT EXISTS lockers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  location text NOT NULL,
  size locker_size NOT NULL,
  status locker_status DEFAULT 'available',
  monthly_price decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rentals table
CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locker_id uuid NOT NULL REFERENCES lockers(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  monthly_price decimal(10, 2) NOT NULL,
  total_amount decimal(10, 2) NOT NULL,
  status rental_status DEFAULT 'active',
  payment_status payment_status DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_password_token);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);

CREATE INDEX IF NOT EXISTS idx_lockers_number ON lockers(number);
CREATE INDEX IF NOT EXISTS idx_lockers_status ON lockers(status);
CREATE INDEX IF NOT EXISTS idx_lockers_size ON lockers(size);

CREATE INDEX IF NOT EXISTS idx_rentals_locker_id ON rentals(locker_id);
CREATE INDEX IF NOT EXISTS idx_rentals_student_id ON rentals(student_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_payment_status ON rentals(payment_status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE lockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for students table
CREATE POLICY "Authenticated users can read students"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage students"
  ON students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for lockers table
CREATE POLICY "Authenticated users can read lockers"
  ON lockers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage lockers"
  ON lockers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for rentals table
CREATE POLICY "Authenticated users can read rentals"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage rentals"
  ON rentals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lockers_updated_at
  BEFORE UPDATE ON lockers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at
  BEFORE UPDATE ON rentals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();