import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
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
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    await testConnection();
    
    // Create tables if they don't exist
    await createTables();
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

const createTables = async () => {
  const connection = await pool.getConnection();
  
  try {
    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Students table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        student_id VARCHAR(50) UNIQUE NOT NULL,
        course VARCHAR(255) NOT NULL,
        semester INT NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Lockers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS lockers (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        number VARCHAR(50) UNIQUE NOT NULL,
        location VARCHAR(255) NOT NULL,
        size ENUM('small', 'medium', 'large') NOT NULL,
        status ENUM('available', 'rented', 'maintenance', 'reserved') DEFAULT 'available',
        monthly_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Rentals table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rentals (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        locker_id VARCHAR(36) NOT NULL,
        student_id VARCHAR(36) NOT NULL,
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
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    // Payments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        rental_id VARCHAR(36) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_date DATE NOT NULL,
        method ENUM('cash', 'card', 'pix', 'transfer') NOT NULL,
        status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE
      )
    `);

    // Create default admin user if not exists
    const [adminExists] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@lockers.com']
    );

    if (adminExists.length === 0) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.execute(`
        INSERT INTO users (name, email, password, role) 
        VALUES (?, ?, ?, ?)
      `, ['Admin User', 'admin@lockers.com', hashedPassword, 'admin']);
      
      console.log('✅ Default admin user created');
    }

    console.log('✅ Database tables created successfully');
  } finally {
    connection.release();
  }
};

export { pool, initializeDatabase };