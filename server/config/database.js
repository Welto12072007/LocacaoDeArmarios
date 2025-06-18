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
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    console.log(`📊 Connected to: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting steps:');
    console.error('1. Make sure MySQL/MariaDB server is running');
    console.error('2. Check your database credentials in .env file');
    console.error('3. Verify the database exists and is accessible');
    console.error('4. Check if port 3306 is available and not blocked');
    console.error('5. Try connecting with: mysql -u root -p');
    console.error('');
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Cannot initialize database - connection failed');
      console.error('Please start your MySQL/MariaDB server and try again');
      process.exit(1);
    }
    
    // Create database if it doesn't exist
    await createDatabase();
    
    // Create tables if they don't exist
    await createTables();
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

const createDatabase = async () => {
  try {
    // Connect without specifying database
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;
    const tempPool = mysql.createPool(tempConfig);
    
    const connection = await tempPool.getConnection();
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Database '${dbConfig.database}' ready`);
    
    connection.release();
    await tempPool.end();
  } catch (error) {
    console.error('❌ Error creating database:', error);
    throw error;
  }
};

const createTables = async () => {
  const connection = await pool.getConnection();
  
  try {
    // Users table (apenas admins)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin') DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      )
    `);

    // Clients table (substitui students)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        document VARCHAR(50) UNIQUE NOT NULL,
        address TEXT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_document (document),
        INDEX idx_status (status)
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_number (number),
        INDEX idx_status (status),
        INDEX idx_location (location),
        INDEX idx_size (size)
      )
    `);

    // Rentals table (agora com clients)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rentals (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        locker_id VARCHAR(36) NOT NULL,
        client_id VARCHAR(36) NOT NULL,
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
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        INDEX idx_locker_id (locker_id),
        INDEX idx_client_id (client_id),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status),
        INDEX idx_dates (start_date, end_date)
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
        FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE,
        INDEX idx_rental_id (rental_id),
        INDEX idx_status (status),
        INDEX idx_payment_date (payment_date),
        INDEX idx_method (method)
      )
    `);

    // Check if default admin user exists
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
      console.log('📧 Email: admin@lockers.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('✅ Default admin user already exists');
    }

    // Add some sample data if tables are empty
    await addSampleData(connection);

    console.log('✅ Database tables created successfully');
  } finally {
    connection.release();
  }
};

const addSampleData = async (connection) => {
  try {
    // Check if we have sample clients
    const [clients] = await connection.execute('SELECT COUNT(*) as count FROM clients');
    if (clients[0].count === 0) {
      await connection.execute(`
        INSERT INTO clients (name, email, phone, document, address, status) VALUES
        ('João Silva', 'joao.silva@email.com', '(11) 99999-1111', '123.456.789-01', 'Rua A, 123 - São Paulo/SP', 'active'),
        ('Maria Santos', 'maria.santos@email.com', '(11) 99999-2222', '987.654.321-02', 'Rua B, 456 - São Paulo/SP', 'active'),
        ('Pedro Oliveira', 'pedro.oliveira@email.com', '(11) 99999-3333', '456.789.123-03', 'Rua C, 789 - São Paulo/SP', 'active')
      `);
      console.log('✅ Sample clients added');
    }

    // Check if we have sample lockers
    const [lockers] = await connection.execute('SELECT COUNT(*) as count FROM lockers');
    if (lockers[0].count === 0) {
      await connection.execute(`
        INSERT INTO lockers (number, location, size, status, monthly_price) VALUES
        ('A001', 'Bloco A - 1º Andar', 'medium', 'available', 300.00),
        ('A002', 'Bloco A - 1º Andar', 'large', 'available', 400.00),
        ('A003', 'Bloco A - 1º Andar', 'small', 'available', 200.00),
        ('B001', 'Bloco B - 2º Andar', 'medium', 'available', 300.00),
        ('B002', 'Bloco B - 2º Andar', 'large', 'available', 400.00)
      `);
      console.log('✅ Sample lockers added');
    }
  } catch (error) {
    console.log('ℹ️ Sample data already exists or error adding:', error.message);
  }
};

export { pool, initializeDatabase };