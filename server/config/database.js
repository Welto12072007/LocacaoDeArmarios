import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'locker_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
});

// Initialize database with tables
export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Create users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        reset_password_token VARCHAR(255) NULL,
        reset_token_expiry TIMESTAMP NULL,
        failed_login_attempts INT DEFAULT 0,
        locked_until TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_reset_token (reset_password_token),
        INDEX idx_role (role)
      )
    `);

    // Create students table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        student_id VARCHAR(50) UNIQUE NOT NULL,
        course VARCHAR(255) NOT NULL,
        semester INT NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_student_id (student_id),
        INDEX idx_status (status)
      )
    `);

    // Create lockers table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS lockers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        number VARCHAR(50) UNIQUE NOT NULL,
        location VARCHAR(255) NOT NULL,
        size ENUM('small', 'medium', 'large') NOT NULL,
        status ENUM('available', 'rented', 'maintenance', 'reserved') DEFAULT 'available',
        monthly_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_number (number),
        INDEX idx_status (status),
        INDEX idx_size (size)
      )
    `);

    // Create rentals table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS rentals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        locker_id INT NOT NULL,
        student_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        monthly_price DECIMAL(10, 2) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status ENUM('active', 'overdue', 'completed', 'cancelled') DEFAULT 'active',
        payment_status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (locker_id) REFERENCES lockers(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        INDEX idx_locker_id (locker_id),
        INDEX idx_student_id (student_id),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status)
      )
    `);

    // Insert default admin user if not exists
    const [existingAdmin] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@lockers.com']
    );

    if (existingAdmin.length === 0) {
      // Password: admin123 (hashed with bcrypt cost 12)
      const hashedPassword = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G';
      
      await pool.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        ['admin@lockers.com', hashedPassword, 'admin']
      );
      
      console.log('✅ Default admin user created');
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};