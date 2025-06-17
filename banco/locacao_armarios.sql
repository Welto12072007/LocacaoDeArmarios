-- Locker Management System Database Schema
-- MySQL/MariaDB

-- Create database
CREATE DATABASE IF NOT EXISTS locker_management;
USE locker_management;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Students table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    INDEX idx_course (course)
);

-- Lockers table
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
);

-- Rentals table
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
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_locker_id (locker_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_dates (start_date, end_date)
);

-- Payments table
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
);

-- Insert default admin user
INSERT INTO users (name, email, password, role) 
VALUES ('Admin User', 'admin@lockers.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE name = name;

-- Sample data for testing (optional)
INSERT INTO students (name, email, phone, student_id, course, semester, status) VALUES
('João Silva', 'joao.silva@university.edu', '(11) 99999-1111', 'STU2024001', 'Engenharia de Software', 6, 'active'),
('Maria Santos', 'maria.santos@university.edu', '(11) 99999-2222', 'STU2024002', 'Ciência da Computação', 4, 'active'),
('Pedro Oliveira', 'pedro.oliveira@university.edu', '(11) 99999-3333', 'STU2024003', 'Sistemas de Informação', 2, 'active')
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO lockers (number, location, size, status, monthly_price) VALUES
('A001', 'Bloco A - 1º Andar', 'medium', 'available', 300.00),
('A002', 'Bloco A - 1º Andar', 'large', 'available', 400.00),
('A003', 'Bloco A - 1º Andar', 'small', 'available', 200.00),
('B001', 'Bloco B - 2º Andar', 'medium', 'available', 300.00),
('B002', 'Bloco B - 2º Andar', 'large', 'available', 400.00)
ON DUPLICATE KEY UPDATE number = number;