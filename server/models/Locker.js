import { pool } from '../config/database.js';

class Locker {
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      `SELECT * FROM lockers 
       ORDER BY number ASC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM lockers'
    );

    return {
      data: rows.map(this.formatLocker),
      total: countResult[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].total / limit)
    };
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM lockers WHERE id = ?',
      [id]
    );

    return rows.length > 0 ? this.formatLocker(rows[0]) : null;
  }

  static async create(lockerData) {
    const {
      number,
      location,
      size,
      monthlyPrice,
      status = 'available'
    } = lockerData;

    const [result] = await pool.execute(
      `INSERT INTO lockers (number, location, size, monthly_price, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [number, location, size, monthlyPrice, status]
    );

    return this.findById(result.insertId);
  }

  static async update(id, lockerData) {
    const fields = [];
    const values = [];

    Object.keys(lockerData).forEach(key => {
      if (lockerData[key] !== undefined) {
        const dbField = key === 'monthlyPrice' ? 'monthly_price' : key;
        fields.push(`${dbField} = ?`);
        values.push(lockerData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);

    await pool.execute(
      `UPDATE lockers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM lockers WHERE id = ?',
      [id]
    );

    return result.affectedRows > 0;
  }

  static async findByNumber(number) {
    const [rows] = await pool.execute(
      'SELECT * FROM lockers WHERE number = ?',
      [number]
    );

    return rows.length > 0 ? this.formatLocker(rows[0]) : null;
  }

  static async getStats() {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'rented' THEN 1 ELSE 0 END) as rented,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
        SUM(CASE WHEN status = 'reserved' THEN 1 ELSE 0 END) as reserved
      FROM lockers
    `);

    return stats[0];
  }

  static formatLocker(row) {
    return {
      id: row.id,
      number: row.number,
      location: row.location,
      size: row.size,
      status: row.status,
      monthlyPrice: parseFloat(row.monthly_price),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export default Locker;