import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      `SELECT id, name, email, role, created_at, updated_at FROM users 
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
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    return rows.length > 0 ? this.formatUser(rows[0]) : null;
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    return rows.length > 0 ? rows[0] : null;
  }

  static async create(userData) {
    const { name, email, password, role = 'user' } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, password, role) 
       VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, role]
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
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      fields.push('password = ?');
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    await pool.execute(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
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
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static formatUser(row) {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export default User;