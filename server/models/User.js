import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

class User {
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      `SELECT id, email, role, failed_login_attempts, locked_until, created_at, updated_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM users'
    );

    return {
      data: rows.map(this.formatUser),
      total: countResult[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].total / limit)
    };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, role, failed_login_attempts, locked_until, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    return rows.length > 0 ? this.formatUser(rows[0]) : null;
  }

  static async findByEmail(email) {
    console.log('🔍 Searching for user with email:', email);
    
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    console.log('📊 Query result:', rows.length > 0 ? 'User found' : 'User not found');
    
    return rows.length > 0 ? rows[0] : null;
  }

  static async findByResetToken(token) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE reset_password_token = ? AND reset_token_expiry > NOW()',
      [token]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  static async create(userData) {
    const {
      email,
      password,
      role = 'user'
    } = userData;

    // Check if this is the first user (make them admin)
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const finalRole = userCount[0].count === 0 ? 'admin' : role;

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      `INSERT INTO users (email, password, role) 
       VALUES (?, ?, ?)`,
      [email, hashedPassword, finalRole]
    );

    return this.findById(result.insertId);
  }

  static async update(id, userData) {
    const fields = [];
    const values = [];

    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined && key !== 'password') {
        fields.push(`${key} = ?`);
        values.push(userData[key]);
      }
    });

    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    console.log('🔐 Validating password...');
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('🔐 Password validation result:', isValid ? 'Valid' : 'Invalid');
    return isValid;
  }

  static async incrementFailedAttempts(email) {
    await pool.execute(
      `UPDATE users 
       SET failed_login_attempts = failed_login_attempts + 1,
           locked_until = CASE 
             WHEN failed_login_attempts >= 4 THEN DATE_ADD(NOW(), INTERVAL 15 MINUTE)
             ELSE locked_until
           END
       WHERE email = ?`,
      [email]
    );
  }

  static async resetFailedAttempts(email) {
    await pool.execute(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = ?',
      [email]
    );
  }

  static async isAccountLocked(email) {
    const [rows] = await pool.execute(
      'SELECT locked_until FROM users WHERE email = ? AND locked_until > NOW()',
      [email]
    );

    return rows.length > 0;
  }

  static async generateResetToken(email) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await pool.execute(
      'UPDATE users SET reset_password_token = ?, reset_token_expiry = ? WHERE email = ?',
      [token, expiry, email]
    );

    return token;
  }

  static async resetPassword(token, newPassword) {
    const user = await this.findByResetToken(token);
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await pool.execute(
      `UPDATE users 
       SET password = ?, 
           reset_password_token = NULL, 
           reset_token_expiry = NULL,
           failed_login_attempts = 0,
           locked_until = NULL
       WHERE id = ?`,
      [hashedPassword, user.id]
    );

    return this.findById(user.id);
  }

  static formatUser(row) {
    return {
      id: row.id,
      email: row.email,
      role: row.role,
      failedLoginAttempts: row.failed_login_attempts,
      lockedUntil: row.locked_until,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export default User;